"""HTTP boundary and durable DynamoDB operations; no frontend-trusted identities."""
import base64
import hashlib
import json
import logging
import os
import re
from datetime import datetime, timezone
from decimal import Decimal
from functools import wraps

LOG = logging.getLogger(__name__)
LOG.setLevel(logging.INFO)


class APIError(Exception):
    def __init__(self, status, code, message):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message


def require(condition, message, status=400, code="INVALID_REQUEST"):
    if not condition:
        raise APIError(status, code, message)


def now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)


def safe_id(value, name="identifier"):
    require(isinstance(value, str) and re.fullmatch(r"[a-zA-Z0-9_-]{1,100}", value), f"Invalid {name}.")
    return value


def version(body):
    value = body.get("expectedVersion")
    require(type(value) is int and value >= 0, "expectedVersion must be a nonnegative integer.")
    return value


def payload(event):
    raw = event.get("body") or "{}"
    try:
        if event.get("isBase64Encoded"):
            raw = base64.b64decode(raw, validate=True).decode("utf-8")
        require(isinstance(raw, str) and len(raw.encode("utf-8")) <= 196608, "Request body exceeds 192 KiB.", 413)
        value = json.loads(raw, parse_constant=lambda _: (_ for _ in ()).throw(ValueError()))
        canonical(value)  # Reject overflow-to-infinity numbers as well as NaN literals.
    except (ValueError, UnicodeError):
        raise APIError(400, "INVALID_JSON", "Provide a valid JSON object.") from None
    require(isinstance(value, dict), "Provide a JSON object.")
    return value


def identity(event):
    claims = event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {})
    require(claims.get("token_use") == "access" and claims.get("sub"), "A Cognito access token is required.", 401, "UNAUTHENTICATED")
    expected_issuer, client_id = os.environ.get("COGNITO_ISSUER"), os.environ.get("COGNITO_CLIENT_ID")
    require(expected_issuer and client_id, "Authentication configuration is missing.", 503, "CONFIGURATION_ERROR")
    require(claims.get("iss") == expected_issuer and claims.get("client_id") == client_id,
            "Token issuer or client does not match this API.", 401, "UNAUTHENTICATED")
    safe_id(claims["sub"], "user identity")
    return claims["sub"], claims


def claim_groups(claims):
    groups = claims.get("cognito:groups", [])
    if isinstance(groups, str):
        try:
            groups = json.loads(groups)
        except ValueError:
            groups = groups.strip("[]").split(",")
    if not isinstance(groups, list):
        return set()
    return {str(group).strip().strip("\"'") for group in groups}


def is_admin(claims):
    return os.environ.get("ADMIN_GROUP", "scalaris-administrators") in claim_groups(claims)


def endpoint(function):
    @wraps(function)
    def handler(event, context):
        request_id = getattr(context, "aws_request_id", "local")
        try:
            user, claims = identity(event)
            body = function(event, user, claims)
            status = 200
        except APIError as error:
            status, body = error.status, {"error": {"code": error.code, "message": error.message}, "requestId": request_id}
        except Exception as error:
            # Never log events, tokens, answers, demographic data or SDK response bodies.
            error_code = getattr(error, "response", {}).get("Error", {}).get("Code", "UNKNOWN")
            LOG.error("request_failed request_id=%s error_type=%s aws_error_code=%s", request_id, type(error).__name__, error_code)
            status, body = 500, {"error": {"code": "INTERNAL_ERROR", "message": "The request could not be completed."}, "requestId": request_id}
        return {"statusCode": status, "headers": {"Content-Type": "application/json", "Cache-Control": "no-store"},
                "body": json.dumps(body, ensure_ascii=False, allow_nan=False)}
    return handler


def av(value):
    if value is None:
        return {"NULL": True}
    if isinstance(value, bool):
        return {"BOOL": value}
    if isinstance(value, str):
        return {"S": value}
    if isinstance(value, (int, float, Decimal)):
        return {"N": str(value)}
    if isinstance(value, list):
        return {"L": [av(item) for item in value]}
    if isinstance(value, dict):
        return {"M": {key: av(item) for key, item in value.items()}}
    raise TypeError("Unsupported DynamoDB value")


def unav(value):
    if "S" in value:
        return value["S"]
    if "N" in value:
        number = Decimal(value["N"])
        return int(number) if number == number.to_integral_value() else float(number)
    if "BOOL" in value:
        return value["BOOL"]
    if "NULL" in value:
        return None
    if "L" in value:
        return [unav(item) for item in value["L"]]
    return {key: unav(item) for key, item in value["M"].items()}


def public(item):
    return {key: value for key, value in item.items() if key not in ("PK", "SK")}


class Store:
    def __init__(self, client=None):
        if client is None:
            import boto3
            client = boto3.client("dynamodb")
        self.client = client
        self.table = os.environ["TABLE_NAME"]

    def get(self, user, sk):
        result = self.client.get_item(TableName=self.table, Key={"PK": av(f"USER#{user}"), "SK": av(sk)}, ConsistentRead=True)
        return {key: unav(value) for key, value in result["Item"].items()} if "Item" in result else None

    def query(self, user, prefix):
        request = {"TableName": self.table, "KeyConditionExpression": "PK = :pk AND begins_with(SK, :prefix)",
                   "ExpressionAttributeValues": {":pk": av(f"USER#{user}"), ":prefix": av(prefix)}, "ConsistentRead": True}
        result = []
        while True:
            page = self.client.query(**request)
            result.extend({key: unav(value) for key, value in item.items()} for item in page.get("Items", []))
            if not page.get("LastEvaluatedKey"):
                return result
            request["ExclusiveStartKey"] = page["LastEvaluatedKey"]

    def write(self, user, sk, values, old=None):
        item = {**(old or {}), **values, "PK": f"USER#{user}", "SK": sk, "rev": (old or {}).get("rev", 0) + 1}
        require(len(canonical(item).encode("utf-8")) < 280000, "Saved record is too large.", 413)
        operation = {"TableName": self.table, "Item": {key: av(value) for key, value in item.items()}}
        if old is None:
            operation["ConditionExpression"] = "attribute_not_exists(PK)"
        else:
            operation.update(ConditionExpression="#rev = :rev", ExpressionAttributeNames={"#rev": "rev"}, ExpressionAttributeValues={":rev": av(old["rev"])})
        return {"Put": operation}, item

    def transact(self, operations):
        require(0 < len(operations) <= 100, "Too many updates in one request.")
        try:
            self.client.transact_write_items(TransactItems=operations)
        except Exception as error:
            code = getattr(error, "response", {}).get("Error", {}).get("Code")
            reasons = getattr(error, "response", {}).get("CancellationReasons", [])
            if code == "ConditionalCheckFailedException" or (code == "TransactionCanceledException" and any(r.get("Code") == "ConditionalCheckFailed" for r in reasons)):
                raise APIError(409, "VERSION_CONFLICT", "Progress changed. Reload the saved run before retrying.") from None
            if code in ("ProvisionedThroughputExceededException", "ThrottlingException", "TransactionConflictException") or (code == "TransactionCanceledException" and any(r.get("Code") == "TransactionConflict" for r in reasons)):
                raise APIError(503, "RETRY_REQUEST", "Please retry the same request and idempotency key.") from None
            raise


def operation(store, user, event, body):
    headers = {key.lower(): value for key, value in (event.get("headers") or {}).items()}
    key = headers.get("idempotency-key")
    require(isinstance(key, str) and re.fullmatch(r"[A-Za-z0-9_-]{8,100}", key), "Provide an Idempotency-Key header (8–100 letters, digits, underscores or hyphens).")
    digest = hashlib.sha256(canonical({"route": event["routeKey"], "path": event.get("pathParameters", {}), "body": body}).encode()).hexdigest()
    sk = "REQUEST#" + hashlib.sha256(key.encode()).hexdigest()
    existing = store.get(user, sk)
    if existing:
        require(existing["requestHash"] == digest, "This idempotency key was used for a different request.", 409, "IDEMPOTENCY_CONFLICT")
    return {"sk": sk, "hash": digest, "existing": existing}


def commit(store, user, op, writes, response):
    marker, _ = store.write(user, op["sk"], {"requestHash": op["hash"], "response": response, "createdAt": now()})
    try:
        store.transact([*writes, marker])
    except APIError as error:
        if error.status == 409:
            existing = store.get(user, op["sk"])
            if existing and existing["requestHash"] == op["hash"]:
                return existing["response"]
        raise
    return response
