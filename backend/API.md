# Scalaris DEV API

All routes use API Gateway HTTP API payload version 2.0, a Cognito JWT authorizer, and an **access token** in `Authorization: Bearer <token>`. Lambda additionally checks `token_use`, issuer, and client ID from the authorizer's validated claims. ID tokens are rejected. Do not expose Lambda function URLs or add public invocation permissions.

Each modifying run request needs a fresh `Idempotency-Key` header (a UUID works). **Retry the exact same request with the same key after a timeout.** Reusing that key with a different route/path/body returns 409. Keys are recorded durably in the same DynamoDB transaction as the changes.

Every saved record has `rev`. Send the latest run `rev` as `expectedVersion` when saving, submitting, or reviewing. On 409 `VERSION_CONFLICT`, load the latest saved state and reconcile changes; do not blindly replace a newer answer with stale browser data.

## Content Lambda

| Method | Path | Result |
| --- | --- | --- |
| GET | `/v1/config` | Active content release, enabled sectors, completion policy |
| GET | `/v1/sectors` | Configured sector definitions |
| GET | `/v1/sectors/{sectorId}` | One sector |
| GET | `/v1/sectors/{sectorId}/missions/{missionId}` | Mission metadata |
| GET | `/v1/sectors/{sectorId}/missions/{missionId}/{difficulty}` | Current-release questions |
| GET | `/v1/assessments/{assessmentId}` | Enabled assessment, subject to unlock rules |
| GET | `/v1/assessments/{assessmentId}/assets/{assetId}` | Five-minute signed resource URL |
| GET | `/v1/runs/{runId}/content` | Questions pinned to that user's run release |
| GET | `/v1/runs/{runId}/assets/{assetId}` | Signed asset URL using the run's pinned release |

Difficulty IDs: `beginning`, `intermediate`, `advanced`. Only `vitalis` and `baseline` are enabled initially. Post-gamification also checks all configured required sector completions. Post-research requires a server-recorded `PROJECT` completion; no student route can set that field. Their draft keys are not enabled for scoring.

Use `/runs/{runId}/content` and `/runs/{runId}/assets/...` during an existing run. Direct content routes use the current release and are intended for browsing/new runs. No private answer keys or rubric criteria are returned by these routes.

## Student-state Lambda

| Method | Path | Result |
| --- | --- | --- |
| GET | `/v1/me` | Current user's server-resolved `accountRole`, corresponding profile, and Cognito sub |
| GET | `/v1/faculty/me` | Faculty profile; faculty accounts only |
| PATCH | `/v1/me` | Save allowed profile fields with expectedVersion |
| GET | `/v1/me/progress` | Profile, baseline state, sector/mission summaries, all current difficulty drafts |
| POST | `/v1/assessments/{assessmentId}/runs` | Resume a draft or start an assessment run |
| POST | `/v1/sectors/{sectorId}/missions/{missionId}/{difficulty}/runs` | Resume or start the selected mission/difficulty |
| GET | `/v1/runs/{runId}` | Run metadata, saved answers, investigation evidence, review feedback |
| PATCH | `/v1/runs/{runId}` | Autosave answer/evidence changes and resume position |

User ownership always comes from Cognito, never a student-supplied user ID. The profile `role` field means the learner's displayed workforce role; it cannot grant faculty or administrator privileges. `faculty` is display text, not verified class membership.

### Faculty and student separation

`GET /v1/me` is shared; all other student-state routes above, all Content routes, and the student assessment/mission submission routes require a student account. Faculty accounts receive `403 STUDENT_ACCESS_REQUIRED` on those routes. Student accounts receive `403 FACULTY_ACCESS_REQUIRED` at `/v1/faculty/me`.

Faculty access requires both the configured `FACULTY_GROUP` (default `scalaris-faculty`) in the validated Cognito access token and an active administrator-managed `ACCESS` record with `accountRole: faculty`. Faculty profile data is stored at `FACULTY_PROFILE`, separate from the student `PROFILE`. A faculty record without the matching group claim, or a faculty group without its access record, receives HTTP 403 rather than falling back to student access. See `FACULTY_SETUP.md` for provisioning. No public endpoint creates faculty accounts or grants account roles.

### Start or continue

Body `{}` resumes an existing editable draft for that exact mission/difficulty. If none exists, it creates a new run. Completed runs remain in history. The baseline always resumes its single draft and rejects a new start after final submission.

To explicitly start again for a mission/difficulty:

```json
{
  "restart": true,
  "previousRunId": "the-current-run-id"
}
```

This archives an editable prior draft as `SUPERSEDED`, retains its answers, and updates only the selected track's active pointer. The baseline cannot restart. A mission's earlier completion credit is preserved.

### Save progress

```json
{
  "expectedVersion": 1,
  "answers": {
    "vitalis-q001-beginning": "B"
  },
  "currentQuestionId": "vitalis-q008-beginning",
  "currentStep": "assessment"
}
```

Save only changed answers. This is a patch: omitted answers are retained. A null answer clears that answer. Up to 50 answer/evidence records and 192 KiB per request; split a bulk import into requests using each returned `rev`. Maximum 6000 characters per textual answer. State becomes durable when the API acknowledges the save; the frontend must show Saving/Saved/Retry and flush pending work before navigation. This package does not yet change the frontend.

For baseline participant fields, answer IDs are `participant:name`, `participant:student-id`, `participant:instructor-mentor`, and `participant:assessment-date`. For a major's Other follow-up use `baseline-demographics-013:other-major`.

The current submission validation requires all cognitive and attitude/experience scale responses. Demographic and participant fields follow their source requiredness flags, which are currently null and therefore not forced. No new demographic requirements or consent workflow are invented by this backend.

### Advanced investigation autosave

Written responses use their response IDs in `answers`. Save partial evidence separately using the parent activity ID:

```json
{
  "expectedVersion": 2,
  "answers": {
    "vitalis-q004-advanced-response-1": "First response draft."
  },
  "investigations": {
    "vitalis-q004-advanced": {
      "sessions": ["Initial session notes"],
      "optionsCompared": ["Extend morning hours", "Extend evening hours"],
      "sources": [
        {"resourceId": "vitalis-clinic-logs", "reference": "Teacher-provided group dataset, edition 1"}
      ],
      "initialWork": "Initial analysis notes"
    }
  }
}
```

Each supplied investigation object replaces that activity's saved evidence object; send its complete current evidence, not just one changed nested field. Omitted activities are retained. Sources can reference public or teacher-provided group data. File-upload endpoints are not included; this version stores text and source citations.

For final submission, each activity needs both responses, three session entries, two compared options, both source references, and nonempty `initialWork`, `freshDataTest`, `testResult`, `revisionOrRetainedChoice`, and `limit`. Presence validation is not an academic assessment of evidence; an administrator reviews the actual quality.

## Assessment Lambda

`POST /v1/assessment-runs/{runId}/submit`

```json
{"expectedVersion": 3}
```

Answers must already be saved. The Lambda calculates the score from the private key; clients cannot supply a score or completion flag. Baseline cognitive scoring uses the corrected 28-answer key. Attitude/demographic responses are stored without invented factor scores. Finalizing the full baseline and setting its one-submission lock is atomic.

## Mission Lambda

`POST /v1/mission-runs/{runId}/submit` takes the same version-only body.

Beginning and intermediate: all questions must be answered. The result contains score, maximum score and percentage, without correct options. The current mission content does not define a pass threshold: completing a fully answered run counts as mission completion regardless of score. Finishing **any one difficulty** completes the mission. Finishing all three missions completes the sector. Replays never revoke these flags. No restart-sector API exists.

Advanced: submission freezes the run as `PENDING_REVIEW`. It does not yet count as mission completion. Missing investigation evidence blocks submission. No fake objective key or numeric advanced grade is generated.

### Administrator review

Only trusted membership of Cognito group `scalaris-administrators` grants these routes. A faculty/demo role stored in profile/localStorage does not. Assign the group through an AWS administrator and sign in again to refresh tokens.

- `GET /v1/admin/users/{userId}/runs/{runId}` retrieves a student's submission.
- `POST /v1/admin/users/{userId}/runs/{runId}/review` records a review:

```json
{
  "expectedVersion": 4,
  "decision": "approve",
  "feedback": "The investigation supports the conclusion and documents the fresh-data test."
}
```

`approve` completes the run and updates mission/sector credit. `request_changes` reopens it as `CHANGES_REQUESTED`; the student can revise the current draft and resubmit. Review feedback is retained. Faculty-specific class access, reviewer inbox/listing, and reviewer UI are future work; this is an administrator endpoint, not authorization for every faculty user.

## Connected frontend behavior

The frontend loads `/v1/me/progress` after login and refreshes it when leaving learning activities. It displays all nine mission/difficulty states independently. Continue starts a selected track with `{}` to resume, then retrieves its saved run and pinned content. Students can keep several mission tracks in progress.

A completed mission can also have a new unfinished run: use the mission summary for earned completion and difficulty states for Continue. Show Go to next sector when the sector summary is completed. Sector ordering/next-sector navigation will follow the published frontend/content configuration; only Vitalis exists in the current DEV release.

All retained runs remain addressable by ID. The initial snapshot returns current draft pointers and latest completed references, not an unbounded full history. A paginated historical run-list endpoint can be added when a history screen is needed.
