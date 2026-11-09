# Faculty account setup

Faculty accounts use the existing Cognito user pool and sign-in form. Public self-registration remains for students. A faculty account can only be granted through administrator-controlled Cognito group membership and a DynamoDB access record; there is no public faculty signup or role-change API.

The blank frontend page is `#/faculty`. A faculty account always renders that page, including after refreshing or entering a student URL. Student accounts cannot open the faculty dashboard. The backend independently rejects faculty requests to student content, profiles, progress, runs, and submission endpoints with HTTP 403. Faculty is not the existing administrator role and does not confer permission to read or review student submissions.

## Existing resources

No new user pool or DynamoDB table is needed for this first faculty page. The existing table `scalaris-student-state-dev` holds two separate records under the faculty Cognito subject:

| PK | SK | Purpose |
| --- | --- | --- |
| `USER#<cognito-sub>` | `ACCESS` | Protected `accountRole: faculty`, `status: ACTIVE`, and provisioning metadata |
| `USER#<cognito-sub>` | `FACULTY_PROFILE` | Faculty name and email |

The account must also belong to the Cognito group `scalaris-faculty`. Both the group and active access record are required. An incomplete setup or an old token without the faculty group fails closed; it does not become a student session. Legacy students without an access record continue to use their existing student permissions.

The editable student profile fields `role` and `faculty` remain display text. They cannot set or change `accountRole`, protected access records, or group membership. The public signup form has no faculty selection.

## Deploy the backend first

Deploy the updated backend before deploying the updated frontend. The new frontend requires `/v1/me` to return `accountRole` and refuses unknown roles. All four existing Lambda code packages need the updated role guards; creating a group alone does not enforce the API restrictions.

Upload `scalaris-faculty-setup.zip` to AWS CloudShell in `us-west-1` and extract it into a new working directory:

```bash
unzip -o scalaris-faculty-setup.zip -d scalaris-faculty-setup
cd scalaris-faculty-setup

export COGNITO_USER_POOL_ID='YOUR_EXISTING_USER_POOL_ID'
export COGNITO_CLIENT_ID='YOUR_EXISTING_APP_CLIENT_ID'
export FRONTEND_ORIGIN='https://YOUR_EXISTING_FRONTEND_DOMAIN'

bash deployment/deploy.sh
```

Use the same user pool, public app client, and frontend origin as the student application. This deploys the existing DEV functions and JWT-protected API, adding `GET /v1/faculty/me` to the state function. It leaves student self-registration enabled and does not create or modify accounts.

## Create the faculty account in AWS

In that same CloudShell directory, run:

```bash
python3 tools/create_faculty.py
```

Enter the faculty email, display name, any additional attributes required by your existing pool, and a temporary password at the prompts. Password input is hidden and is not passed as a command-line argument. The script checks the AWS account, uses Cognito `AdminCreateUser`, and suppresses invitation emails. It does not mark an unverified email as verified.

A newly created user is disabled while group membership and the two DynamoDB records are provisioned, then enabled once both records have been saved. If setup is interrupted, the user is not silently given student privileges. To resume a disabled partial setup with no student profile:

```bash
python3 tools/create_faculty.py --resume
```

The script refuses to turn an existing student profile into a faculty account and does not reactivate a disabled access record. Use a dedicated faculty account. It never grants the `scalaris-administrators` group.

Share the temporary password privately. Sign in using the application's email/password form, set a permanent password when prompted, and the frontend will open `#/faculty`. Google account linking is not provisioned by this workflow; use the administrator-created email/password account.

Creating the account requires an AWS administrator identity with Cognito describe/get/create/disable/enable/group permissions and DynamoDB get/transactional-write permissions for the named resources. These permissions belong to the provisioning operator, not the public frontend or student Lambda execution roles.

Then deploy the frontend through the existing frontend deployment workflow. There are no class lists, student records, grading views, or fabricated dashboard metrics on the initial faculty page.
