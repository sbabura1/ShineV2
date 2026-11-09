# Scalaris DEV Lambda backend

This package provides four Python Lambda functions for the existing DEV S3 uploads and DynamoDB table. It preserves independent progress per sector, mission, and difficulty; permits unlimited mission runs; allows one final full-baseline submission; and uses any completed difficulty to award mission credit. Three completed missions award sector credit. There is no sector restart action.

The implementation is prepared locally. No AWS resources have been changed by Codex. Run the deployment script yourself when ready. It creates or updates four execution roles, four functions, Lambda log groups, and a separate Cognito-protected HTTP API. It also uploads the supplied sector catalogue to the existing DEV content bucket. It does not deploy the frontend, create a new Cognito pool, or change the existing CloudFront distribution. See the repository's FRONTEND_BACKEND_SETUP.md for the frontend migration and required deployment order.

## Functions

| AWS function name | Python handler | Responsibility |
| --- | --- | --- |
| `scalaris-content-dev` | `scalaris.handlers.content_handler` | Allowlisted content reads and signed assessment image URLs |
| `scalaris-student-state-dev` | `scalaris.handlers.state_handler` | Profiles, progress snapshot, start/resume/restart, autosave |
| `scalaris-assessments-dev` | `scalaris.handlers.assessments_handler` | Backend scoring and full-baseline submission lock |
| `scalaris-missions-dev` | `scalaris.handlers.missions_handler` | Mission scoring, pending advanced submissions, administrator review |

Runtime: **Python 3.14**, 256 MB, 30-second timeout, default Lambda networking (no VPC required). The package uses Python standard-library modules and Lambda's bundled Boto3 SDK. All ZIPs include the same shared Python package; their handlers and IAM permissions differ. No router Lambda, SAM, Lambda layer, or external API secret is required.

See [API.md](API.md) for request bodies, routes, data limits, idempotency/version rules, advanced review, and frontend integration behavior.

## Existing resources

| Resource | Name |
| --- | --- |
| Account | `680836845993` |
| Region | `us-west-1` |
| DynamoDB table | `scalaris-student-state-dev` |
| Content bucket | `scalaris-content-dev-680836845993` |
| Private scoring bucket | `scalaris-scoring-dev-680836845993` |
| Resources bucket | `scalaris-resources-dev-680836845993` |

S3 keys exactly follow the manual uploads:

```text
Content:   releases/v1-draft/assessments/questions/{assessment}.json
Content:   releases/v1-draft/sectors/vitalis/sector.json
Content:   releases/v1-draft/sectors/vitalis/missions/{mission}/{difficulty}.json
Scoring:   releases/v1-draft/assessments/{assessment}.scoring.json
Scoring:   releases/v1-draft/sectors/vitalis/{difficulty}.scoring.json
Scoring:   releases/v1-draft/sectors/vitalis/advanced.rubrics.json
Resources: releases/v1-draft/assessments/assets/{image}.gif
```

No uploaded manifest, local `private/` S3 prefix, or review-issues JSON is required. Content caches refresh within approximately 60 seconds in a warm Lambda. Treat published content release prefixes as immutable; when publishing a new release, retain older values in `ALLOWED_CONTENT_RELEASES` so old drafts can resume and be scored against their original questions.

## Build and test locally

From this `backend` directory, using an available Python interpreter:

```text
python -m unittest discover -s tests -v
python tools/package.py
```

On this workspace the bundled interpreter is:

```powershell
& 'C:\Users\shrey\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m unittest discover -s tests -v
& 'C:\Users\shrey\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' tools/package.py
```

Tests use real question/key fixtures and a network-free transactional DynamoDB fake. They check user isolation, independent drafts, conflicts and atomic rollback, retry deduplication, baseline locking, corrected 28-question scoring, sector completion, preserved replay credit, advanced evidence/review, and rejection of client-controlled scores/permissions. Local validation uses Python 3.12 because that is the available bundled interpreter; Python 3.14 and real AWS IAM/API/SDK behavior still require the deployment smoke tests below.

Generated output:

```text
dist/scalaris-content-dev.zip
dist/scalaris-student-state-dev.zip
dist/scalaris-assessments-dev.zip
dist/scalaris-missions-dev.zip
dist/scalaris-backend-deployment.zip
deployment/generated/*.policy.json
```

Inspect each policy before deployment. Content has only DynamoDB reads and content/resource S3 reads. Student-state cannot read the scoring bucket. Assessment/mission functions can read only their scoring category. Writes use `dynamodb:PutItem` constrained to `TransactWriteItems`; transaction permissions are governed by the underlying item actions. No role has `Scan`, table deletion, S3 writes, or public invocation permissions.

## Deploy in AWS CloudShell

For the faculty dashboard and administrator-only account creation, follow [Faculty account setup](FACULTY_SETUP.md). It reuses the existing pool/table, adds protected faculty access records, and requires the updated backend before the role-aware frontend is deployed.

1. In the AWS Console, select **us-west-1** and open **CloudShell**.
2. Use **Actions → Upload file** to upload `dist/scalaris-backend-deployment.zip` from this workspace.
3. Unzip it into a new working directory:

```bash
mkdir -p scalaris-backend-dev
unzip -o scalaris-backend-deployment.zip -d scalaris-backend-dev
cd scalaris-backend-dev
```

4. Set these **non-secret** values from the existing Cognito app configuration and frontend URL:

```bash
export COGNITO_USER_POOL_ID='REPLACE_WITH_EXISTING_POOL_ID'
export COGNITO_CLIENT_ID='REPLACE_WITH_EXISTING_APP_CLIENT_ID'
export FRONTEND_ORIGIN='https://REPLACE_WITH_YOUR_FRONTEND_DOMAIN'
```

Use only the origin, for example `https://d123example.cloudfront.net`, with no trailing slash, route, or hash. The frontend origin must match the real browser origin exactly. Never supply a user-pool client secret or AWS access keys. This browser app should use a public Cognito app client.

5. Deploy:

```bash
bash deployment/deploy.sh
```

The script validates the account, existing Cognito client, table, and buckets, then creates or updates specifically named DEV resources. It verifies IAM roles and waits for Lambda updates; initial IAM propagation can require a short retry. It reuses an API named `scalaris-api-dev` and refuses ambiguous duplicate API names. Every route requires the Cognito JWT authorizer. Access tokens are checked in Lambda as well, so both password-login and Google-login access tokens can be used without inventing incompatible OAuth scope requirements.

The script ends with the API URL, such as `https://API_ID.execute-api.us-west-1.amazonaws.com`. Set the future frontend `VITE_API_BASE_URL` to that URL after smoke testing and implementing the API client.

Running the script requires your deploying AWS identity to have the relevant IAM role/policy creation and `iam:PassRole`, Lambda, CloudWatch Logs, API Gateway, and read access to the existing Cognito/table/buckets. Function execution roles do not grant your deployment identity these administrative permissions.

## Verify in AWS

First inspect Lambda state:

```bash
for name in content student-state assessments missions; do
  aws lambda get-function-configuration \
    --function-name "scalaris-${name}-dev" \
    --region us-west-1 \
    --query '{Name:FunctionName,State:State,Update:LastUpdateStatus,Runtime:Runtime,Handler:Handler}'
done
```

Expected: `State=Active`, `Update=Successful`, `Runtime=python3.14`.

An API call without a token must fail:

```bash
curl -i 'https://YOUR_API_ID.execute-api.us-west-1.amazonaws.com/v1/me'
```

Expected: HTTP 401. Do not weaken the authorizer to test the API.

For authenticated smoke tests, get a Cognito **access token** from a real sign-in session and keep it private. Set it temporarily in CloudShell without pasting it into chat:

```bash
read -s -p 'Cognito access token: ' SCALARIS_ACCESS_TOKEN
printf '\n'
export SCALARIS_API_URL='https://YOUR_API_ID.execute-api.us-west-1.amazonaws.com'
curl --fail-with-body "$SCALARIS_API_URL/v1/me" -H "Authorization: Bearer $SCALARIS_ACCESS_TOKEN"
curl --fail-with-body "$SCALARIS_API_URL/v1/sectors" -H "Authorization: Bearer $SCALARIS_ACCESS_TOKEN"
curl --fail-with-body "$SCALARIS_API_URL/v1/assessments/baseline" -H "Authorization: Bearer $SCALARIS_ACCESS_TOKEN"
```

Then test starting two different tracks, saving a partial answer, fetching it back, and reading the progress snapshot:

```bash
curl --fail-with-body -X POST \
  "$SCALARIS_API_URL/v1/sectors/vitalis/missions/vitalis-mission-01/beginning/runs" \
  -H "Authorization: Bearer $SCALARIS_ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -H "Idempotency-Key: $(cat /proc/sys/kernel/random/uuid)" \
  -d '{}'

curl --fail-with-body -X POST \
  "$SCALARIS_API_URL/v1/sectors/vitalis/missions/vitalis-mission-02/advanced/runs" \
  -H "Authorization: Bearer $SCALARIS_ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -H "Idempotency-Key: $(cat /proc/sys/kernel/random/uuid)" \
  -d '{}'
```

Copy the first returned `runId` and `rev` into a file as described in API.md, then PATCH its answers. Each acknowledged save must survive a new authenticated session. With a different user's token, GET for the first user's run ID must return 404. Submitted baseline completion must prevent another baseline run. Test an ID token and expect rejection. After testing, `unset SCALARIS_ACCESS_TOKEN`.

CloudWatch log groups are `/aws/lambda/scalaris-<component>-dev`, retained for 14 days. The code logs request IDs and unexpected error types, never tokens, answer bodies, demographics, or scoring keys. API access logs and CloudWatch alarms can be added after the first verified deployment.

## Current scope and remaining product configuration

- Only baseline and Vitalis are enabled. The post-assessment drafts have disabled/unapproved keys; the backend fails closed rather than issuing invented scores. Add all 14 sectors through configuration/content, not new tables or one Lambda per sector.
- All mission difficulties have independent active pointers and all prior runs/answers are retained. A progress snapshot returns current state, not every historical answer. No TTL or cleanup job has been introduced.
- Advanced needs both written responses and complete retained evidence. It remains pending until an authorized administrator reviews it. Actual teacher/public datasets still need to be supplied, and a review UI is not included.
- Administrator review requires Cognito group `scalaris-administrators`. Faculty cohort-specific access is not implemented. No student can grant this through their profile.
- No passing threshold was supplied. Fully answering a beginning/intermediate run completes the mission even with a low score; mastery thresholds can be configured in a later content/API update. Any approved advanced run also completes the mission.
- Null demographic requiredness and missing consent workflow have not been silently resolved. Confirm those settings before a real student/research rollout.
- The frontend in `src/` now uses these endpoints for profiles, content, progress and submissions. Deploy the updated backend kit first, configure `VITE_API_BASE_URL`, then deploy the frontend. See `../FRONTEND_BACKEND_SETUP.md`. Local verification does not replace a live authenticated smoke test.
