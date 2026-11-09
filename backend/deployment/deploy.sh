#!/usr/bin/env bash
# Run explicitly in AWS CloudShell. No SAM and no frontend deployment changes.
set -euo pipefail
export AWS_PAGER=""
cd "$(dirname "$0")/.."
: "${COGNITO_USER_POOL_ID:?Set COGNITO_USER_POOL_ID to your existing pool ID}"
: "${COGNITO_CLIENT_ID:?Set COGNITO_CLIENT_ID to your existing app client ID}"
: "${FRONTEND_ORIGIN:?Set FRONTEND_ORIGIN to your exact frontend origin, without a path or trailing slash}"
SCALARIS_REGION=us-west-1
SCALARIS_ACCOUNT=680836845993
export COGNITO_ISSUER="https://cognito-idp.${COGNITO_USER_POOL_ID%%_*}.amazonaws.com/${COGNITO_USER_POOL_ID}"
export COGNITO_USER_POOL_ARN="arn:aws:cognito-idp:${COGNITO_USER_POOL_ID%%_*}:$SCALARIS_ACCOUNT:userpool/$COGNITO_USER_POOL_ID"
test "$(aws sts get-caller-identity --query Account --output text)" = "$SCALARIS_ACCOUNT" || { echo 'Wrong AWS account'; exit 1; }
python3 -c 'import os, urllib.parse; u=urllib.parse.urlparse(os.environ["FRONTEND_ORIGIN"]); assert u.scheme in ("http","https") and u.netloc and not u.path and not u.query and not u.fragment, "Use only scheme://host[:port] for FRONTEND_ORIGIN"'
aws cognito-idp describe-user-pool-client --user-pool-id "$COGNITO_USER_POOL_ID" --client-id "$COGNITO_CLIENT_ID" --region "${COGNITO_USER_POOL_ID%%_*}" --query 'UserPoolClient.ClientId' --output text
aws dynamodb describe-table --table-name scalaris-student-state-dev --region "$SCALARIS_REGION" --query 'Table.TableStatus' --output text
for bucket in scalaris-content-dev-$SCALARIS_ACCOUNT scalaris-scoring-dev-$SCALARIS_ACCOUNT scalaris-resources-dev-$SCALARIS_ACCOUNT; do
  aws s3api head-bucket --bucket "$bucket" --region "$SCALARIS_REGION"
done
if [ -f uploads/catalog.json ]; then
  aws s3 cp uploads/catalog.json "s3://scalaris-content-dev-$SCALARIS_ACCOUNT/releases/v1-draft/sectors/catalog.json" --content-type application/json --region "$SCALARIS_REGION"
fi
python3 tools/package.py
python3 - <<'PY'
import json,os
variables = {
    "TABLE_NAME":"scalaris-student-state-dev", "CONTENT_BUCKET":"scalaris-content-dev-680836845993",
    "SCORING_BUCKET":"scalaris-scoring-dev-680836845993", "RESOURCES_BUCKET":"scalaris-resources-dev-680836845993",
    "CONTENT_RELEASE":"v1-draft", "ALLOWED_CONTENT_RELEASES":"v1-draft", "ENABLED_SECTORS":"vitalis",
    "REQUIRED_SECTORS":"vitalis", "ENABLED_ASSESSMENTS":"baseline", "ADMIN_GROUP":"scalaris-administrators", "FACULTY_GROUP":"scalaris-faculty",
    "COGNITO_ISSUER":os.environ["COGNITO_ISSUER"], "COGNITO_CLIENT_ID":os.environ["COGNITO_CLIENT_ID"],
    "COGNITO_USER_POOL_ID":os.environ["COGNITO_USER_POOL_ID"],
}
with open('deployment/generated/environment.json','w') as f: json.dump({"Variables":variables},f)
PY

for component in content student-state assessments missions; do
  function_name="scalaris-${component}-dev"
  role_name="${function_name}-role"
  if ! aws iam get-role --role-name "$role_name" > deployment/generated/role-result.json 2> deployment/generated/role-error.txt; then
    grep -q NoSuchEntity deployment/generated/role-error.txt || { cat deployment/generated/role-error.txt; exit 1; }
    aws iam create-role --role-name "$role_name" --assume-role-policy-document file://deployment/generated/trust.json > /dev/null
  fi
  aws iam put-role-policy --role-name "$role_name" --policy-name ScalarisExecution --policy-document "file://deployment/generated/${component}.policy.json"
  aws iam wait role-exists --role-name "$role_name"
  if ! aws logs create-log-group --log-group-name "/aws/lambda/$function_name" --region "$SCALARIS_REGION" 2> deployment/generated/log-error.txt; then
    grep -q ResourceAlreadyExistsException deployment/generated/log-error.txt || { cat deployment/generated/log-error.txt; exit 1; }
  fi
  aws logs put-retention-policy --log-group-name "/aws/lambda/$function_name" --retention-in-days 14 --region "$SCALARIS_REGION"
  handler=$(python3 -c 'import json,sys; print("scalaris.handlers."+json.load(open("deployment/generated/functions.json"))[sys.argv[1]])' "$component")
  if aws lambda get-function --function-name "$function_name" --region "$SCALARIS_REGION" > /dev/null 2> deployment/generated/function-error.txt; then
    aws lambda wait function-active-v2 --function-name "$function_name" --region "$SCALARIS_REGION"
    aws lambda wait function-updated-v2 --function-name "$function_name" --region "$SCALARIS_REGION"
    aws lambda update-function-code --function-name "$function_name" --zip-file "fileb://dist/${function_name}.zip" --region "$SCALARIS_REGION" > /dev/null
    aws lambda wait function-updated-v2 --function-name "$function_name" --region "$SCALARIS_REGION"
    aws lambda update-function-configuration --function-name "$function_name" --runtime python3.14 --handler "$handler" --role "arn:aws:iam::$SCALARIS_ACCOUNT:role/$role_name" --timeout 30 --memory-size 256 --environment file://deployment/generated/environment.json --region "$SCALARIS_REGION" > /dev/null
  else
    grep -q ResourceNotFoundException deployment/generated/function-error.txt || { cat deployment/generated/function-error.txt; exit 1; }
    for attempt in 1 2 3 4 5 6; do
      if aws lambda create-function --function-name "$function_name" --runtime python3.14 --handler "$handler" --role "arn:aws:iam::$SCALARIS_ACCOUNT:role/$role_name" --zip-file "fileb://dist/${function_name}.zip" --timeout 30 --memory-size 256 --environment file://deployment/generated/environment.json --region "$SCALARIS_REGION" > /dev/null 2> deployment/generated/create-error.txt; then
        break
      fi
      grep -q 'cannot be assumed' deployment/generated/create-error.txt && test "$attempt" -lt 6 || { cat deployment/generated/create-error.txt; exit 1; }
      sleep 5
    done
  fi
  aws lambda wait function-active-v2 --function-name "$function_name" --region "$SCALARIS_REGION"
  aws lambda wait function-updated-v2 --function-name "$function_name" --region "$SCALARIS_REGION"
  echo "Ready: $function_name"
done

# Reuse this specifically named DEV API; never attach to the frontend's CloudFront distribution.
aws apigatewayv2 get-apis --region "$SCALARIS_REGION" --output json > deployment/generated/apis.json
api_id=$(python3 - <<'PY'
import json
matches=[a['ApiId'] for a in json.load(open('deployment/generated/apis.json'))['Items'] if a['Name']=='scalaris-api-dev']
assert len(matches)<=1, 'Multiple scalaris-api-dev APIs exist; resolve the duplicate before deploying.'
print(matches[0] if matches else '')
PY
)
if [ -z "$api_id" ]; then
  api_id=$(aws apigatewayv2 create-api --name scalaris-api-dev --protocol-type HTTP --cors-configuration file://deployment/generated/cors.json --region "$SCALARIS_REGION" --query ApiId --output text)
else
  aws apigatewayv2 update-api --api-id "$api_id" --cors-configuration file://deployment/generated/cors.json --region "$SCALARIS_REGION" > /dev/null
fi
python3 - <<'PY'
import json,os
with open('deployment/generated/jwt.json','w') as f: json.dump({"Audience":[os.environ['COGNITO_CLIENT_ID']],"Issuer":os.environ['COGNITO_ISSUER']},f)
PY
authorizer_id=$(aws apigatewayv2 get-authorizers --api-id "$api_id" --region "$SCALARIS_REGION" --query "Items[?Name=='scalaris-cognito-dev'].AuthorizerId | [0]" --output text)
if [ "$authorizer_id" = None ] || [ -z "$authorizer_id" ]; then
  authorizer_id=$(aws apigatewayv2 create-authorizer --api-id "$api_id" --name scalaris-cognito-dev --authorizer-type JWT --identity-source '$request.header.Authorization' --jwt-configuration file://deployment/generated/jwt.json --region "$SCALARIS_REGION" --query AuthorizerId --output text)
else
  aws apigatewayv2 update-authorizer --api-id "$api_id" --authorizer-id "$authorizer_id" --jwt-configuration file://deployment/generated/jwt.json --region "$SCALARIS_REGION" > /dev/null
fi

for component in content student-state assessments missions; do
  function_name="scalaris-${component}-dev"
  function_arn="arn:aws:lambda:$SCALARIS_REGION:$SCALARIS_ACCOUNT:function:$function_name"
  integration_id=$(aws apigatewayv2 get-integrations --api-id "$api_id" --region "$SCALARIS_REGION" --query "Items[?IntegrationUri=='$function_arn'].IntegrationId | [0]" --output text)
  if [ "$integration_id" = None ] || [ -z "$integration_id" ]; then
    integration_id=$(aws apigatewayv2 create-integration --api-id "$api_id" --integration-type AWS_PROXY --integration-uri "$function_arn" --payload-format-version 2.0 --region "$SCALARIS_REGION" --query IntegrationId --output text)
  fi
  if ! aws lambda add-permission --function-name "$function_name" --statement-id "api-$api_id" --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$SCALARIS_REGION:$SCALARIS_ACCOUNT:$api_id/*/*/*" --region "$SCALARIS_REGION" > /dev/null 2> deployment/generated/permission-error.txt; then
    grep -q ResourceConflictException deployment/generated/permission-error.txt || { cat deployment/generated/permission-error.txt; exit 1; }
  fi
  while IFS= read -r route; do
    # Get routes once per route to make a partially completed deployment resumable.
    aws apigatewayv2 get-routes --api-id "$api_id" --region "$SCALARIS_REGION" --output json > deployment/generated/routes-existing.json
    route_id=$(python3 -c 'import json,sys; print(next((r["RouteId"] for r in json.load(open("deployment/generated/routes-existing.json"))["Items"] if r["RouteKey"]==sys.argv[1]),""))' "$route")
    if [ -z "$route_id" ]; then
      aws apigatewayv2 create-route --api-id "$api_id" --route-key "$route" --target "integrations/$integration_id" --authorization-type JWT --authorizer-id "$authorizer_id" --region "$SCALARIS_REGION" > /dev/null
    else
      aws apigatewayv2 update-route --api-id "$api_id" --route-id "$route_id" --target "integrations/$integration_id" --authorization-type JWT --authorizer-id "$authorizer_id" --region "$SCALARIS_REGION" > /dev/null
    fi
  done < <(python3 -c 'import json,sys; print("\n".join(json.load(open("deployment/generated/routes.json"))[sys.argv[1]]))' "$component")
done
stage=$(aws apigatewayv2 get-stages --api-id "$api_id" --region "$SCALARIS_REGION" --query 'Items[?StageName==`$default`].StageName | [0]' --output text)
if [ "$stage" = None ] || [ -z "$stage" ]; then
  aws apigatewayv2 create-stage --api-id "$api_id" --stage-name '$default' --auto-deploy --region "$SCALARIS_REGION" > /dev/null
else
  aws apigatewayv2 update-stage --api-id "$api_id" --stage-name '$default' --auto-deploy --region "$SCALARIS_REGION" > /dev/null
fi
printf '\nAPI URL: https://%s.execute-api.%s.amazonaws.com\n' "$api_id" "$SCALARIS_REGION"
echo 'Deployment finished. Test with a Cognito ACCESS token before connecting the frontend.'
