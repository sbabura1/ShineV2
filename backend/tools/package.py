"""Build Lambda ZIPs and deployment policies without credentials or network access."""
import json
import os
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
GENERATED = ROOT / "deployment/generated"
ACCOUNT = "680836845993"
REGION = "us-west-1"
FUNCTIONS = {
    "content": "content_handler",
    "student-state": "state_handler",
    "assessments": "assessments_handler",
    "missions": "missions_handler",
}
ROUTES = {
    "content": ["GET /v1/config", "GET /v1/sectors", "GET /v1/sectors/{sectorId}",
        "GET /v1/sectors/{sectorId}/missions/{missionId}", "GET /v1/sectors/{sectorId}/missions/{missionId}/{difficulty}",
        "GET /v1/assessments/{assessmentId}", "GET /v1/assessments/{assessmentId}/assets/{assetId}",
        "GET /v1/runs/{runId}/content", "GET /v1/runs/{runId}/assets/{assetId}"],
    "student-state": ["GET /v1/me", "GET /v1/faculty/me", "PATCH /v1/me", "GET /v1/me/progress", "GET /v1/runs/{runId}",
        "POST /v1/assessments/{assessmentId}/runs", "POST /v1/sectors/{sectorId}/missions/{missionId}/{difficulty}/runs", "PATCH /v1/runs/{runId}"],
    "assessments": ["POST /v1/assessment-runs/{runId}/submit"],
    "missions": ["POST /v1/mission-runs/{runId}/submit", "GET /v1/admin/users/{userId}/runs/{runId}",
        "POST /v1/admin/users/{userId}/runs/{runId}/review"],
}


def write(file, value):
    file.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def build():
    DIST.mkdir(exist_ok=True)
    GENERATED.mkdir(parents=True, exist_ok=True)
    source_files = sorted((ROOT / "scalaris").glob("*.py"))
    for component in FUNCTIONS:
        with ZipFile(DIST / f"scalaris-{component}-dev.zip", "w", ZIP_DEFLATED) as archive:
            for file in source_files:
                archive.write(file, file.relative_to(ROOT).as_posix())
        statements = [{"Effect": "Allow", "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
            "Resource": f"arn:aws:logs:{REGION}:{ACCOUNT}:log-group:/aws/lambda/scalaris-{component}-dev:*"},
            {"Effect": "Allow", "Action": ["dynamodb:GetItem", "dynamodb:Query"],
             "Resource": f"arn:aws:dynamodb:{REGION}:{ACCOUNT}:table/scalaris-student-state-dev"}]
        if component != "content":
            statements.append({"Effect": "Allow", "Action": "dynamodb:PutItem",
                "Resource": f"arn:aws:dynamodb:{REGION}:{ACCOUNT}:table/scalaris-student-state-dev",
                "Condition": {"ForAnyValue:StringEquals": {"dynamodb:EnclosingOperation": ["TransactWriteItems"]}}})
        if component == "student-state":
            pool_arn = os.environ.get("COGNITO_USER_POOL_ARN", "REPLACE_WITH_EXISTING_COGNITO_USER_POOL_ARN")
            statements.append({"Effect": "Allow", "Action": "cognito-idp:AdminGetUser", "Resource": pool_arn})
        prefix = f"arn:aws:s3:::scalaris-content-dev-{ACCOUNT}/releases/*/"
        content_paths = [prefix + "assessments/*", prefix + "sectors/*"]
        if component == "assessments":
            content_paths = [prefix + "assessments/*"]
        if component == "missions":
            content_paths = [prefix + "sectors/*"]
        statements.append({"Effect": "Allow", "Action": "s3:GetObject", "Resource": content_paths})
        if component == "content":
            statements.append({"Effect": "Allow", "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::scalaris-resources-dev-{ACCOUNT}/releases/*/assessments/assets/*"})
        if component in ("assessments", "missions"):
            category = "assessments" if component == "assessments" else "sectors"
            statements.append({"Effect": "Allow", "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::scalaris-scoring-dev-{ACCOUNT}/releases/*/{category}/*"})
        write(GENERATED / f"{component}.policy.json", {"Version": "2012-10-17", "Statement": statements})
    write(GENERATED / "trust.json", {"Version": "2012-10-17", "Statement": [
        {"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]})
    write(GENERATED / "routes.json", ROUTES)
    write(GENERATED / "functions.json", FUNCTIONS)
    origin = os.environ.get("FRONTEND_ORIGIN", "https://replace-with-your-frontend-domain.example")
    # This kit deploys DEV only. Keep local frontend access across redeployments.
    origins = list(dict.fromkeys([origin, "http://localhost:5173", "http://127.0.0.1:5173"]))
    write(GENERATED / "cors.json", {"AllowOrigins": origins, "AllowMethods": ["GET", "POST", "PATCH", "OPTIONS"],
        "AllowHeaders": ["authorization", "content-type", "idempotency-key"], "MaxAge": 300})
    # Upload one deployment kit to CloudShell, then unzip it into a task directory.
    with ZipFile(DIST / "scalaris-backend-deployment.zip", "w", ZIP_DEFLATED) as archive:
        files = [*source_files, ROOT / "tools/package.py", ROOT / "tools/create_faculty.py", ROOT / "deployment/deploy.sh", ROOT / "README.md", ROOT / "FACULTY_SETUP.md",
                 ROOT / "API.md", *GENERATED.glob("*.json")]
        for file in sorted(files):
            if file.exists():
                archive.write(file, file.relative_to(ROOT).as_posix())
        catalog = ROOT.parent / "content/sectors/v1/catalog.json"
        if not catalog.exists():
            catalog = ROOT / "uploads/catalog.json"
        if catalog.exists():
            archive.writestr("uploads/catalog.json", catalog.read_bytes())
    print(f"Created four Lambda ZIPs, IAM policies and deployment kit in {DIST}")


if __name__ == "__main__":
    build()
