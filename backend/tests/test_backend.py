"""Network-free tests against real JSON fixtures and a transactional DynamoDB fake."""
import copy
import json
import os
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from scalaris.content import Content, fields
from scalaris.core import APIError, Store, av, endpoint, identity, is_admin, payload, unav
from scalaris.state import State
from scalaris.submissions import Submissions

ROOT = Path(__file__).resolve().parents[2]
USER = "11111111-1111-1111-1111-111111111111"
OTHER = "22222222-2222-2222-2222-222222222222"


class ConditionalFailure(Exception):
    response = {"Error": {"Code": "TransactionCanceledException"}, "CancellationReasons": [{"Code": "ConditionalCheckFailed"}]}


class DynamoFake:
    def __init__(self):
        self.rows = {}
        self.lock = threading.Lock()

    @staticmethod
    def key(item):
        return item["PK"]["S"], item["SK"]["S"]

    def get_item(self, **request):
        with self.lock:
            item = self.rows.get(self.key(request["Key"]))
            return {"Item": copy.deepcopy(item)} if item else {}

    def query(self, **request):
        values = request["ExpressionAttributeValues"]
        prefix, pk = values[":prefix"]["S"], values[":pk"]["S"]
        with self.lock:
            rows = [row for (key_pk, sk), row in sorted(self.rows.items()) if key_pk == pk and sk.startswith(prefix)]
            # Small fake pages exercise production pagination code.
            if request.get("ExclusiveStartKey"):
                start = self.key(request["ExclusiveStartKey"])
                rows = [row for row in rows if self.key(row) > start]
            page = rows[:7]
            response = {"Items": copy.deepcopy(page)}
            if len(rows) > len(page):
                response["LastEvaluatedKey"] = {key: page[-1][key] for key in ("PK", "SK")}
            return response

    def transact_write_items(self, **request):
        with self.lock:
            writes = [operation["Put"] for operation in request["TransactItems"]]
            keys = [self.key(write["Item"]) for write in writes]
            assert len(set(keys)) == len(keys), "Duplicate item in transaction"
            for write in writes:
                old = self.rows.get(self.key(write["Item"]))
                if write["ConditionExpression"] == "attribute_not_exists(PK)":
                    if old is not None:
                        raise ConditionalFailure()
                elif old is None or old["rev"] != write["ExpressionAttributeValues"][":rev"]:
                    raise ConditionalFailure()
            for write in writes:
                self.rows[self.key(write["Item"])] = copy.deepcopy(write["Item"])


class FixtureContent(Content):
    def __init__(self):
        self.loaded = []

    def load(self, path, release=None, scoring=False):
        self.loaded.append((path, release, scoring))
        parts = path.split("/")
        if parts[0] == "assessments":
            if scoring:
                filename = ROOT / "content/assessments/v1/private" / parts[-1]
            else:
                filename = ROOT / "content/assessments/v1/questions" / parts[-1]
        else:
            filename = ROOT / "content/sectors/v1" / parts[1]
            filename = filename / "private" / parts[-1] if scoring else filename.joinpath(*parts[2:])
        return json.loads(filename.read_text(encoding="utf-8"))


class BackendTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(os.environ, {"TABLE_NAME": "test", "CONTENT_RELEASE": "v1-draft", "ENABLED_SECTORS": "vitalis",
            "ENABLED_ASSESSMENTS": "baseline", "COGNITO_ISSUER": "https://example.test/pool", "COGNITO_CLIENT_ID": "test-client"})
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.fake = DynamoFake()
        self.store = Store(self.fake)
        self.content = FixtureContent()
        self.state = State(self.store, self.content)
        self.submissions = Submissions(self.store, self.content)
        self.counter = 0

    def event(self, route="test", key=None, path=None):
        self.counter += 1
        return {"routeKey": route, "headers": {"Idempotency-Key": key or f"request-{self.counter:06d}"}, "pathParameters": path or {}}

    def start_mission(self, mission=1, difficulty="beginning", user=USER, body=None):
        return self.state.start(self.event("mission-start"), user, body or {}, "MISSION", sectorId="vitalis",
            missionId=f"vitalis-mission-{mission:02d}", difficulty=difficulty)["run"]

    def fill(self, run, user=USER):
        definition = self.content.definition(run)
        key = self.content.score_key(run)
        answers = {}
        if run["kind"] == "ASSESSMENT":
            answers.update({item["questionId"]: item["approvedAnswerOptionId"] for item in key["cognitive"]["items"]})
        elif run["difficulty"] != "advanced":
            answers.update({item["questionId"]: item["correctOptionId"] for item in key["items"] if item["missionId"] == run["missionId"]})
        for field_id, field in fields(definition).items():
            if field["type"] == "likert":
                answers[field_id] = 4
            if field["type"] == "long_text" and run.get("difficulty") == "advanced":
                answers[field_id] = "The evidence supports this comparison. Fresh data supported the revision."
        items = list(answers.items())
        for offset in range(0, len(items), 40):
            run = self.state.save(self.event("save"), user, run["runId"], {"expectedVersion": run["rev"], "answers": dict(items[offset:offset + 40])})["run"]
        if run.get("difficulty") == "advanced":
            evidence = {question["id"]: {"sessions": ["Plan", "Compare", "Retest"], "optionsCompared": ["Earlier opening", "Later closing"],
                "sources": [{"resourceId": resource, "reference": "Teacher group dataset, edition 1"} for resource in question["investigation"]["sourceIds"]],
                "initialWork": "Initial table", "freshDataTest": "Retested another week", "testResult": "Pattern held",
                "revisionOrRetainedChoice": "Retained the later closing option", "limit": "One neighborhood only"} for question in definition["questions"]}
            run = self.state.save(self.event("save"), user, run["runId"], {"expectedVersion": run["rev"], "investigations": evidence})["run"]
        return run

    def submit(self, run):
        return self.submissions.submit(self.event("submit"), USER, run["runId"], {"expectedVersion": run["rev"]}, run["kind"])["run"]

    def test_independent_drafts_and_resume(self):
        a = self.start_mission()
        b = self.start_mission(2, "advanced")
        c = self.start_mission(1, "intermediate")
        a = self.state.save(self.event(), USER, a["runId"], {"expectedVersion": a["rev"], "answers": {"vitalis-q001-beginning": "B"}, "currentQuestionId": "vitalis-q008-beginning"})["run"]
        self.assertEqual(self.start_mission()["runId"], a["runId"])
        progress = self.state.progress(USER)
        self.assertEqual(len(progress["difficultyStates"]), 3)
        self.assertEqual(self.state.get_run(USER, a["runId"])["answers"]["vitalis-q001-beginning"], "B")
        self.assertEqual(self.state.run(USER, b["runId"])["status"], "IN_PROGRESS")
        self.assertNotEqual(c["runId"], a["runId"])

    def test_other_user_cannot_read_or_save_run(self):
        run = self.start_mission()
        with self.assertRaises(APIError) as error:
            self.state.get_run(OTHER, run["runId"])
        self.assertEqual(error.exception.status, 404)
        with self.assertRaises(APIError):
            self.state.save(self.event(), OTHER, run["runId"], {"expectedVersion": 1})

    def test_save_retries_and_reused_key_rejected(self):
        run = self.start_mission()
        event = self.event(key="save-idempotent")
        body = {"expectedVersion": run["rev"], "answers": {"vitalis-q001-beginning": "B"}}
        saved = self.state.save(event, USER, run["runId"], body)
        self.assertEqual(saved, self.state.save(event, USER, run["runId"], body))
        self.assertEqual(self.state.run(USER, run["runId"])["rev"], 2)
        with self.assertRaises(APIError) as error:
            self.state.save(event, USER, run["runId"], {**body, "answers": {"vitalis-q001-beginning": "A"}})
        self.assertEqual(error.exception.code, "IDEMPOTENCY_CONFLICT")

    def test_stale_save_rejected_without_overwriting_answers(self):
        run = self.start_mission()
        self.state.save(self.event(), USER, run["runId"], {"expectedVersion": 1, "answers": {"vitalis-q001-beginning": "B"}})
        with self.assertRaises(APIError):
            self.state.save(self.event(), USER, run["runId"], {"expectedVersion": 1, "answers": {"vitalis-q001-beginning": "D"}})
        self.assertEqual(self.state.answers(USER, run["runId"])["vitalis-q001-beginning"], "B")

    def test_restart_retains_old_draft_and_other_difficulty(self):
        original = self.start_mission()
        another = self.start_mission(1, "advanced")
        replacement = self.start_mission(body={"restart": True, "previousRunId": original["runId"]})
        self.assertNotEqual(original["runId"], replacement["runId"])
        self.assertEqual(self.state.run(USER, original["runId"])["status"], "SUPERSEDED")
        self.assertEqual(self.state.run(USER, another["runId"])["status"], "IN_PROGRESS")
        with self.assertRaises(APIError):
            self.state.save(self.event(), USER, original["runId"], {"expectedVersion": 1})

    def test_full_baseline_once_with_corrected_28_key(self):
        run = self.state.start(self.event(), USER, {}, "ASSESSMENT", assessmentId="baseline")["run"]
        self.assertEqual(run["runId"], self.state.start(self.event(), USER, {}, "ASSESSMENT", assessmentId="baseline")["run"]["runId"])
        with self.assertRaises(APIError):
            self.state.start(self.event(), USER, {"restart": True, "previousRunId": run["runId"]}, "ASSESSMENT", assessmentId="baseline")
        completed = self.submit(self.fill(run))
        self.assertEqual(completed["result"], {"gradingMode": "exact_option_match", "score": 28, "maximumScore": 28, "percentage": 100.0})
        with self.assertRaises(APIError) as error:
            self.state.start(self.event(), USER, {}, "ASSESSMENT", assessmentId="baseline")
        self.assertEqual(error.exception.code, "BASELINE_ALREADY_SUBMITTED")
        self.assertIsNotNone(self.store.get(USER, "BASELINE")["submittedAt"])

    def test_incomplete_baseline_cannot_submit(self):
        run = self.state.start(self.event(), USER, {}, "ASSESSMENT", assessmentId="baseline")["run"]
        with self.assertRaises(APIError):
            self.submit(run)
        self.assertEqual(self.state.run(USER, run["runId"])["status"], "IN_PROGRESS")

    def test_two_concurrent_baseline_submissions_record_only_one_result(self):
        run = self.fill(self.state.start(self.event(), USER, {}, "ASSESSMENT", assessmentId="baseline")["run"])
        barrier = threading.Barrier(2)
        original_score = self.submissions._score

        def score_together(*args):
            result = original_score(*args)
            barrier.wait(timeout=5)
            return result

        self.submissions._score = score_together
        def submit_one(key):
            try:
                return self.submissions.submit(self.event("submit", key=key), USER, run["runId"], {"expectedVersion": run["rev"]}, "ASSESSMENT")["run"]["status"]
            except APIError as error:
                return error.code
        with ThreadPoolExecutor(max_workers=2) as executor:
            outcomes = list(executor.map(submit_one, ["concurrent-submit-a", "concurrent-submit-b"]))
        self.assertEqual(outcomes.count("COMPLETED"), 1)
        self.assertEqual(len([outcome for outcome in outcomes if outcome in ("VERSION_CONFLICT", "BASELINE_ALREADY_SUBMITTED")]), 1)
        self.assertEqual(self.state.run(USER, run["runId"])["rev"], run["rev"] + 1)
        self.assertIsNotNone(self.store.get(USER, "BASELINE")["submittedAt"])

    def test_any_difficulty_completes_mission_and_three_complete_sector(self):
        for mission, difficulty in [(1, "beginning"), (2, "intermediate"), (3, "beginning")]:
            run = self.submit(self.fill(self.start_mission(mission, difficulty)))
            self.assertEqual(run["status"], "COMPLETED")
        sector = self.store.get(USER, "SECTOR#vitalis")
        self.assertTrue(sector["completed"])
        self.assertEqual(len(sector["completedMissionIds"]), 3)
        self.start_mission(2, "beginning")
        self.assertTrue(self.store.get(USER, "SECTOR#vitalis")["completed"])
        self.assertTrue(self.store.get(USER, "MISSION#vitalis#vitalis-mission-02")["completed"])

    def test_advanced_requires_evidence_then_review_then_changes_and_approval(self):
        run = self.start_mission(3, "advanced")
        with self.assertRaises(APIError):
            self.submit(run)
        run = self.submit(self.fill(run))
        self.assertEqual(run["status"], "PENDING_REVIEW")
        self.assertFalse(self.store.get(USER, "MISSION#vitalis#vitalis-mission-03")["completed"])
        run = self.submissions.review(self.event("review"), OTHER, USER, run["runId"], {"expectedVersion": run["rev"], "decision": "request_changes", "feedback": "Clarify the new-data comparison."})["run"]
        self.assertEqual(run["status"], "CHANGES_REQUESTED")
        run = self.submit(self.fill(run))
        run = self.submissions.review(self.event("review"), OTHER, USER, run["runId"], {"expectedVersion": run["rev"], "decision": "approve"})["run"]
        self.assertEqual(run["status"], "COMPLETED")
        self.assertTrue(self.store.get(USER, "MISSION#vitalis#vitalis-mission-03")["completed"])
        self.assertEqual(len(self.state.get_run(USER, run["runId"])["reviews"]), 2)

    def test_validation_rejects_foreign_question_options_and_client_scores(self):
        run = self.start_mission()
        for body in [
            {"expectedVersion": 1, "score": 100},
            {"expectedVersion": 1, "answers": {"vitalis-q002-beginning": "A"}},
            {"expectedVersion": 1, "answers": {"vitalis-q001-beginning": "Z"}},
        ]:
            with self.assertRaises(APIError):
                self.state.save(self.event(), USER, run["runId"], body)

    def test_transaction_rolls_back_all_items_on_conflict(self):
        op1, _ = self.store.write(USER, "first", {"value": "original"})
        self.store.transact([op1])
        conflict, _ = self.store.write(USER, "first", {"value": "overwrite"})
        other, _ = self.store.write(USER, "second", {"value": "should-not-save"})
        with self.assertRaises(APIError):
            self.store.transact([other, conflict])
        self.assertIsNone(self.store.get(USER, "second"))

    def test_profile_isolation_and_optimistic_update(self):
        self.state.update_profile(USER, {"expectedVersion": 0, "profile": {"name": "Test Student"}})
        self.assertEqual(self.state.profile(USER)["name"], "Test Student")
        self.assertEqual(self.state.profile(OTHER)["name"], "")
        with self.assertRaises(APIError):
            self.state.update_profile(USER, {"expectedVersion": 0, "profile": {"name": "Stale"}})
        with self.assertRaises(APIError):
            self.state.update_profile(USER, {"expectedVersion": 1, "profile": {"cognito:groups": ["scalaris-administrators"]}})

    def test_profile_name_is_initialized_from_cognito_not_a_mock(self):
        class Cognito:
            def admin_get_user(self, **request):
                return {"UserAttributes": [{"Name": "sub", "Value": USER}, {"Name": "given_name", "Value": "Account"}, {"Name": "family_name", "Value": "Owner"}]}
        with patch.dict(os.environ, {"COGNITO_USER_POOL_ID": "us-west-1_test"}):
            profile = self.state.account_profile(USER, {"username": "verified-username"}, Cognito())
        self.assertEqual(profile["name"], "Account Owner")
        self.assertEqual(self.state.profile(USER)["name"], "Account Owner")
        self.state.update_profile(USER, {"expectedVersion": profile["rev"], "profile": {"name": "Chosen Name"}})
        self.assertEqual(self.state.account_profile(USER, {}, Cognito())["name"], "Chosen Name")

    def test_catalogue_has_fourteen_sectors_only_vitalis_enabled(self):
        sectors = self.content.catalog()
        self.assertEqual(len(sectors), 14)
        self.assertEqual([sector["id"] for sector in sectors if sector["enabled"]], ["vitalis"])
        self.assertEqual(len(next(sector for sector in sectors if sector["enabled"])["missions"]), 3)

    def test_disabled_and_locked_post_assessments(self):
        with self.assertRaises(APIError):
            self.state.start(self.event(), USER, {}, "ASSESSMENT", assessmentId="post-gamification")
        with patch.dict(os.environ, {"ENABLED_ASSESSMENTS": "baseline,post-gamification"}):
            with self.assertRaises(APIError) as error:
                self.state.start(self.event(), USER, {}, "ASSESSMENT", assessmentId="post-gamification")
            self.assertEqual(error.exception.code, "ASSESSMENT_LOCKED")

    def test_identity_and_admin_groups(self):
        claims = {"sub": USER, "token_use": "access", "iss": os.environ["COGNITO_ISSUER"], "client_id": "test-client"}
        event = {"requestContext": {"authorizer": {"jwt": {"claims": claims}}}}
        self.assertEqual(identity(event)[0], USER)
        claims["token_use"] = "id"
        with self.assertRaises(APIError):
            identity(event)
        self.assertTrue(is_admin({"cognito:groups": "[scalaris-administrators]"}))
        self.assertFalse(is_admin({"cognito:groups": ["faculty"]}))

    def test_student_cannot_invoke_administrator_review_handler(self):
        from scalaris.handlers import missions_handler
        event = self.event("POST /v1/admin/users/{userId}/runs/{runId}/review", path={"userId": OTHER, "runId": "some-run"})
        event["body"] = '{"expectedVersion":1,"decision":"approve"}'
        event["requestContext"] = {"authorizer": {"jwt": {"claims": {"sub": USER, "token_use": "access",
            "iss": os.environ["COGNITO_ISSUER"], "client_id": "test-client", "cognito:groups": "[student]"}}}}
        with patch("scalaris.handlers.Submissions", return_value=self.submissions):
            response = missions_handler(event, None)
        self.assertEqual(response["statusCode"], 403)

    def test_content_allowlist_rejects_arbitrary_paths(self):
        for value in ["../private", "other-sector", "vitalis/../../"]:
            with self.assertRaises(APIError):
                self.content.sector(value)
        with self.assertRaises(APIError):
            self.content.mission_questions("vitalis", "vitalis-mission-01", "../private")

    def test_idempotency_does_not_cross_users(self):
        event = self.event("start", key="shared-request-key")
        one = self.state.start(event, USER, {}, "MISSION", sectorId="vitalis", missionId="vitalis-mission-01", difficulty="beginning")
        two = self.state.start(event, OTHER, {}, "MISSION", sectorId="vitalis", missionId="vitalis-mission-01", difficulty="beginning")
        self.assertNotEqual(one["run"]["runId"], two["run"]["runId"])

    def test_http_boundary_does_not_echo_unexpected_errors(self):
        @endpoint
        def broken(event, user, claims):
            raise ValueError("sensitive-detail")
        event = {"requestContext": {"authorizer": {"jwt": {"claims": {"sub": USER, "token_use": "access",
            "iss": os.environ["COGNITO_ISSUER"], "client_id": "test-client"}}}}}
        response = broken(event, None)
        self.assertEqual(response["statusCode"], 500)
        self.assertNotIn("sensitive-detail", response["body"])
        with self.assertRaises(APIError):
            payload({"body": '{"n": 1e999}'})


if __name__ == "__main__":
    unittest.main()
