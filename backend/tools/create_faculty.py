"""Run privately in AWS CloudShell to provision an administrator-created faculty account."""
import argparse
import getpass
import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scalaris.core import Store, now

ACCOUNT = "680836845993"
REGION = "us-west-1"
TABLE = "scalaris-student-state-dev"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", help="Faculty sign-in email; prompted if omitted")
    parser.add_argument("--name", help="Faculty display name; prompted if omitted")
    parser.add_argument("--pool-id", default=os.environ.get("COGNITO_USER_POOL_ID"))
    parser.add_argument("--resume", action="store_true", help="Resume an interrupted faculty setup; never convert an existing student profile")
    args = parser.parse_args()
    email = (args.email or input("Faculty email: ")).strip()
    name = (args.name or input("Faculty display name: ")).strip()
    if not email or "@" not in email or len(email) > 200 or not name or len(name) > 200:
        raise ValueError("Provide a valid email and a display name of at most 200 characters.")
    if not args.pool_id or "_" not in args.pool_id:
        raise ValueError("Set COGNITO_USER_POOL_ID or provide --pool-id for the existing user pool.")

    import boto3
    from botocore.exceptions import ClientError
    actor = boto3.client("sts", region_name=REGION).get_caller_identity()
    if actor["Account"] != ACCOUNT:
        raise ValueError("Use the project's AWS account before creating faculty access.")
    cognito = boto3.client("cognito-idp", region_name=args.pool_id.split("_", 1)[0])
    pool = cognito.describe_user_pool(UserPoolId=args.pool_id)["UserPool"]
    if pool["Arn"].split(":")[4] != ACCOUNT:
        raise ValueError("The selected Cognito user pool belongs to a different account.")
    os.environ["TABLE_NAME"] = TABLE
    store = Store(boto3.client("dynamodb", region_name=REGION))
    group = "scalaris-faculty"

    created = False
    try:
        account = cognito.admin_get_user(UserPoolId=args.pool_id, Username=email)
    except ClientError as error:
        if error.response["Error"]["Code"] != "UserNotFoundException":
            raise
        attributes = {"email": email, "name": name}
        for field in pool.get("SchemaAttributes", []):
            field_name = field["Name"]
            if field.get("Required") and field_name != "sub" and field_name not in attributes:
                attributes[field_name] = input(f"Required Cognito attribute {field_name}: ").strip()
                if not attributes[field_name]:
                    raise ValueError(f"The {field_name} attribute is required.")
        password = getpass.getpass("Temporary password (hidden; follow your Cognito password policy): ")
        if not password or password != getpass.getpass("Confirm temporary password: "):
            raise ValueError("Temporary passwords must be nonempty and match.")
        result = cognito.admin_create_user(UserPoolId=args.pool_id, Username=email,
            UserAttributes=[{"Name": key, "Value": value} for key, value in attributes.items()],
            TemporaryPassword=password, MessageAction="SUPPRESS")
        del password
        created = True
        # An interrupted setup must leave a newly created account unable to sign in.
        cognito.admin_disable_user(UserPoolId=args.pool_id, Username=result["User"]["Username"])
        account = cognito.admin_get_user(UserPoolId=args.pool_id, Username=result["User"]["Username"])

    username = account["Username"]
    attributes = {field["Name"]: field["Value"] for field in account["UserAttributes"]}
    user = attributes["sub"]
    access = store.get(user, "ACCESS")
    student_profile = store.get(user, "PROFILE")
    if student_profile or (access and access.get("accountRole") != "faculty"):
        raise ValueError("This is an existing student account. No role conversion was performed; use a dedicated faculty account.")
    if access and access.get("status") != "ACTIVE":
        raise ValueError("This faculty access record is disabled. It must be reactivated explicitly by an administrator.")
    if not created and not access:
        if not args.resume or account.get("Enabled", True):
            raise ValueError("An account with this username already exists. Use --resume only for a disabled, interrupted faculty setup with no student profile.")
    if not created and not account.get("Enabled", True) and not args.resume:
        raise ValueError("This account is disabled. Use --resume only when recovering an interrupted faculty setup.")

    try:
        cognito.create_group(UserPoolId=args.pool_id, GroupName=group,
            Description="Administrator-provisioned Scalaris faculty accounts; no student or administrator access")
    except ClientError as error:
        if error.response["Error"]["Code"] != "GroupExistsException":
            raise
    cognito.admin_add_user_to_group(UserPoolId=args.pool_id, Username=username, GroupName=group)
    timestamp = now()
    old_profile = store.get(user, "FACULTY_PROFILE")
    access_write, _ = store.write(user, "ACCESS", {"accountRole": "faculty", "status": "ACTIVE",
        "createdAt": (access or {}).get("createdAt", timestamp), "updatedAt": timestamp, "provisionedBy": actor["Arn"]}, access)
    profile_write, _ = store.write(user, "FACULTY_PROFILE", {"name": name, "email": attributes.get("email", email),
        "createdAt": (old_profile or {}).get("createdAt", timestamp), "updatedAt": timestamp}, old_profile)
    store.transact([access_write, profile_write])
    if created or args.resume:
        cognito.admin_enable_user(UserPoolId=args.pool_id, Username=username)
    print(f"Faculty account provisioned: {email}")
    print(f"Cognito sub: {user}")
    print("Sign in with the normal email/password form. A new account must set a permanent password on its first sign-in.")
    print("No invitation email was sent. Share the temporary password privately; do not paste it into chat.")
    print("The faculty dashboard is #/faculty. No student profile or student work was created.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Never print input passwords, tokens, AWS credentials or full SDK responses.
        code = getattr(error, "response", {}).get("Error", {}).get("Code")
        message = code or str(error)
        print(f"Faculty setup did not finish: {message}", file=sys.stderr)
        print("If a new account was created, do not use it until provisioning completes. Recover a disabled partial setup with --resume.", file=sys.stderr)
        sys.exit(1)
