"""Four API Gateway HTTP API Lambda entry points; payload format 2.0."""
import os

from .content import Content
from .access import account_role, faculty_profile, require_student
from .core import APIError, endpoint, is_admin, payload, require
from .state import State
from .submissions import Submissions


def params(event):
    return event.get("pathParameters") or {}


@endpoint
def content_handler(event, user, claims):
    require_student(user, claims)
    repository = Content()
    route, p = event["routeKey"], params(event)
    if route == "GET /v1/config":
        return {"contentRelease": repository.current(), "enabledSectors": repository.sectors(), "missionCompletionPolicy": "any_difficulty"}
    if route == "GET /v1/sectors":
        return {"sectors": repository.catalog()}
    if route == "GET /v1/sectors/{sectorId}":
        return repository.sector(p["sectorId"])
    if route == "GET /v1/sectors/{sectorId}/missions/{missionId}":
        return repository.mission(p["sectorId"], p["missionId"])
    if route == "GET /v1/sectors/{sectorId}/missions/{missionId}/{difficulty}":
        return repository.mission_questions(p["sectorId"], p["missionId"], p["difficulty"])
    if route == "GET /v1/assessments/{assessmentId}":
        state = State(content=repository)
        state.assessment_access(user, p["assessmentId"])
        return repository.assessment(p["assessmentId"])
    if route == "GET /v1/runs/{runId}/content":
        state = State(content=repository)
        return repository.definition(state.run(user, p["runId"]))
    if route in ("GET /v1/assessments/{assessmentId}/assets/{assetId}", "GET /v1/runs/{runId}/assets/{assetId}"):
        state = State(content=repository)
        release = repository.current()
        if "runId" in p:
            run = state.run(user, p["runId"])
            release = run["contentVersion"]
            definition = repository.definition(run)
        else:
            state.assessment_access(user, p["assessmentId"])
            definition = repository.assessment(p["assessmentId"])
        asset = next((asset for asset in definition.get("assets", []) if asset["id"] == p["assetId"]), None)
        require(asset is not None, "Asset not found.", 404)
        require(asset["path"].startswith("assets/") and ".." not in asset["path"], "Invalid resource configuration.", 503)
        import boto3
        url = boto3.client("s3").generate_presigned_url("get_object", Params={"Bucket": os.environ["RESOURCES_BUCKET"],
            "Key": f"releases/{release}/assessments/{asset['path']}"}, ExpiresIn=300)
        return {"url": url, "expiresInSeconds": 300}
    raise APIError(404, "NOT_FOUND", "Unknown content route.")


@endpoint
def state_handler(event, user, claims):
    state = State()
    route, p = event["routeKey"], params(event)
    role = account_role(user, claims, state.store)
    if route == "GET /v1/me":
        profile = faculty_profile(user, state.store) if role == "faculty" else state.account_profile(user, claims)
        return {"profile": profile, "userId": user, "accountRole": role}
    if route == "GET /v1/faculty/me":
        require(role == "faculty", "Faculty access is required.", 403, "FACULTY_ACCESS_REQUIRED")
        return {"profile": faculty_profile(user, state.store), "userId": user, "accountRole": role}
    require(role == "student", "Student access is not available to faculty accounts.", 403, "STUDENT_ACCESS_REQUIRED")
    if route == "PATCH /v1/me":
        return {"profile": state.update_profile(user, payload(event))}
    if route == "GET /v1/me/progress":
        return state.progress(user)
    if route == "GET /v1/runs/{runId}":
        return state.get_run(user, p["runId"])
    if route == "POST /v1/assessments/{assessmentId}/runs":
        return state.start(event, user, payload(event), "ASSESSMENT", assessmentId=p["assessmentId"])
    if route == "POST /v1/sectors/{sectorId}/missions/{missionId}/{difficulty}/runs":
        return state.start(event, user, payload(event), "MISSION", sectorId=p["sectorId"], missionId=p["missionId"], difficulty=p["difficulty"])
    if route == "PATCH /v1/runs/{runId}":
        return state.save(event, user, p["runId"], payload(event))
    raise APIError(404, "NOT_FOUND", "Unknown student-state route.")


@endpoint
def assessments_handler(event, user, claims):
    require_student(user, claims)
    require(event["routeKey"] == "POST /v1/assessment-runs/{runId}/submit", "Unknown assessment route.", 404)
    return Submissions().submit(event, user, params(event)["runId"], payload(event), "ASSESSMENT")


@endpoint
def missions_handler(event, user, claims):
    route, p = event["routeKey"], params(event)
    service = Submissions()
    if route == "POST /v1/mission-runs/{runId}/submit":
        require_student(user, claims, service.store)
        return service.submit(event, user, p["runId"], payload(event), "MISSION")
    require(is_admin(claims), "Administrator access is required.", 403, "FORBIDDEN")
    if route == "GET /v1/admin/users/{userId}/runs/{runId}":
        from .core import safe_id
        safe_id(p["userId"], "student identity")
        return service.get_run(p["userId"], p["runId"])
    if route == "POST /v1/admin/users/{userId}/runs/{runId}/review":
        return service.review(event, user, p["userId"], p["runId"], payload(event))
    raise APIError(404, "NOT_FOUND", "Unknown mission route.")
