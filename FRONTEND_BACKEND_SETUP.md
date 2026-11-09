# Frontend and backend connection

## Public repository and private assessment material

This GitHub repository is public. Assessment scoring keys, internal source references, and source images under the content `private/` directories are intentionally excluded from Git. The assessment builder (`scripts/build-shine-assessments.mjs`) and Vitalis validator (`scripts/validate-vitalis-content.mjs`) also remain local because they contain explicit answer mappings. Keep these files in the administrator's private working copy or approved private storage; never add them to frontend assets.

Content-generation commands and backend/content checks that read private scoring fixtures require those files to be restored from private storage first. Public question JSONs and learner-facing hints are versioned separately. Generated deployment ZIPs, preview screenshots, and local design-tool state are excluded from Git as well.

The authenticated frontend now loads identity, sector availability, assessment questions, mission questions, drafts, scores, and completion state through API Gateway. It does not import local assessment JSON, answer keys, mock question banks, mock names, reputation numbers, or browser-only progress. API failures are never replaced with mock content.

API URL: `https://p35o8uoofd.execute-api.us-west-1.amazonaws.com`. Requests use the Cognito **access token**, obtained and refreshed by Amplify. The frontend does not need AWS access keys, S3 credentials, a DynamoDB endpoint, or scoring-bucket access.

## Required update order

1. Upload the **updated** `backend/dist/scalaris-backend-deployment.zip` to CloudShell. Extract it over the existing deployment directory and run the same deployment script with your existing Cognito/client/frontend-origin variables.

```bash
unzip -o scalaris-backend-deployment.zip -d scalaris-backend-dev
cd scalaris-backend-dev
bash deployment/deploy.sh
```

If CloudShell has started a new session, set these first:

```bash
export COGNITO_USER_POOL_ID='YOUR_EXISTING_POOL_ID'
export COGNITO_CLIENT_ID='YOUR_EXISTING_APP_CLIENT_ID'
export FRONTEND_ORIGIN='https://leapconsultants.org'
```

The updated script reuses the four Lambda functions and existing `scalaris-api-dev`; it does not create a second table or API. It adds the pool ID to Lambda configuration and grants only student-state the pool-scoped `cognito-idp:AdminGetUser` permission. On a new account's first `/v1/me` request, student-state initializes the profile name from verified Cognito attributes. A saved user-edited profile name is retained. A missing Cognito name leaves a blank editable name, never a fabricated person.

The ZIP includes `uploads/catalog.json`. The script uploads this additional file to:

```text
s3://scalaris-content-dev-680836845993/releases/v1-draft/sectors/catalog.json
```

Its authoritative local source is `content/sectors/v1/catalog.json`. It lists all 14 sector names from the supplied spreadsheet; the backend enables only the configured Vitalis sector. Full Vitalis definitions come from the existing S3 objects. Other sectors render as disabled placeholders. The content bucket now has **19 application JSON files**, including this catalogue, rather than the previous 18.

2. In GitHub, open **Repository → Settings → Secrets and variables → Actions → Variables**. Add:

```text
Name:  VITE_API_BASE_URL
Value: https://p35o8uoofd.execute-api.us-west-1.amazonaws.com
```

Keep the existing `VITE_COGNITO_*` variables. Cognito configuration alone is not enough to locate the API. The workflow injects this variable during the Vite build and stops deployment if it is missing. Vite variables are public build configuration; private secrets do not belong in them.

3. Deploy the frontend through the existing `dev` branch workflow. This updates the frontend-hosting bucket and invalidates CloudFront; the content/scoring/resources buckets remain separate.

For local development `.env` contains the API URL alongside the existing Cognito settings. Vite loads this file automatically, and the API client reads `import.meta.env.VITE_API_BASE_URL`. There is no separate `.env.local` file. `.env.example` documents the public configuration. Changing build-time variables requires restarting the dev server or rebuilding the frontend.

The DEV API's CORS configuration must allow the live frontend origin plus `http://localhost:5173` and `http://127.0.0.1:5173`. The updated deployment kit includes both local origins automatically. Earlier deployments allowed only the live domain, causing local browsers to show a connection error. JWT authorization remains required for every application route. If Vite uses another port, explicitly configure that origin too.

## Connected behavior

- Profiles load from `/v1/me` and save to the backend. The mock name, fake faculty dropdown, reputation/level numbers, and demo role selector were removed. Avatar/Beacon design options remain presentation controls; selected designs save in the backend profile. Generated preview images are not stored in DynamoDB.
- The baseline uses its S3 definition, including 32 attitude, 28 cognitive and 20 demographic questions, participant fields, tables and signed graph images. Its sections are data-driven. One final full-baseline submission is enforced by Lambda. Submitted baselines open read-only.
- All three Vitalis missions and all three difficulties load through the API. Each track can resume, start again, display its submitted result, or await review. The browser never receives answer keys and performs no scoring.
- Advanced written responses and investigation evidence save to the backend. Submission becomes pending review; the frontend does not assign a fabricated grade or completion before review.
- Completing one difficulty earns mission credit; all three missions earn sector credit. Replays retain completion. Other sectors, post-assessments and sprints are unavailable, including old hash routes. There is no restart-sector control.
- Learning answers, drafts, results and identity do not use localStorage. Theme preference and Amplify's authentication-token storage remain. Legacy mock records are ignored and never imported as authoritative progress.
- Saves are debounced, versioned and serialized. Failed saves retain their exact idempotency key/body for retry. Navigation flushes learning saves and blocks on failure. Browser close/reload warns about unsaved work. A 409 asks the student to reload the latest state rather than overwriting newer work.

## Validation and limits

`npm run build` verifies production bundling. `scripts/verify-backend-ui.mjs` exercises the UI against intercepted API contracts using the actual source JSON as fixtures. Test fixtures and tokens are isolated to that script, outside `src/`; there is no production mock mode. Coverage includes backend identity, ignored legacy mock identity, disabled sectors, baseline saving, independent mission tracks, retries, resume, server results, replay completion, mobile overflow, and failure without fallback.

Backend tests cover Cognito profile initialization and the S3 catalogue. Local checks do not establish that live Cognito tokens, IAM, CORS, or uploads are correct. Verify those after deploying the updated backend and frontend.

Lambda configuration includes `TABLE_NAME=scalaris-student-state-dev`, `CONTENT_BUCKET`, `SCORING_BUCKET`, `RESOURCES_BUCKET`, `CONTENT_RELEASE`, Cognito settings and enabled-content settings. These are resource names, not database passwords. The functions use the same table according to their IAM roles; content has read-only access.

Actual advanced datasets and the source's unresolved demographic/consent requirements still need product configuration before a real student/research rollout. They were not invented during this migration.

## Missing Vitalis mission objects

A mission start reads `releases/v1-draft/sectors/vitalis/missions/vitalis-mission-01/mission.json` and the selected difficulty JSON. Missing objects can appear as S3 AccessDenied in Lambda because its role intentionally has no bucket-list permission. Use CloudShell `head-object` to check existence before changing IAM.

Build the public content archive locally with `python backend/tools/package_vitalis_content.py`. It includes exactly 15 public JSON files, preserving all mission subdirectories. Upload `backend/dist/scalaris-vitalis-content-v1-draft.zip` to CloudShell, then run:

```bash
cd "$HOME"
unzip -o scalaris-vitalis-content-v1-draft.zip -d scalaris-vitalis-content
aws s3 cp scalaris-vitalis-content/vitalis/ \
  s3://scalaris-content-dev-680836845993/releases/v1-draft/sectors/vitalis/ \
  --recursive --exclude "*" --include "*.json" \
  --content-type application/json --region us-west-1
```

This repairs the published Vitalis content paths without uploading manifests, reference files or private scoring keys. It does not delete S3 objects or modify DynamoDB. Reload and retry the mission afterward.
