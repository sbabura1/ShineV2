"""Role separation checks; run explicitly when verification is requested."""
import os
import unittest
from unittest.mock import Mock, patch

from scalaris.access import account_role, require_student
from scalaris.core import APIError
from scalaris import handlers

USER = "11111111-1111-1111-1111-111111111111"


class AccessStore:
    def __init__(self, access=None, profile=None):
        self.access = access
        self.profile = profile

    def get(self, user, key):
        if key == "ACCESS":
            return self.access
        if key == "FACULTY_PROFILE":
            return self.profile
        return None


class FacultyAccessTests(unittest.TestCase):
    def setUp(self):
        self.settings = patch.dict(os.environ, {"FACULTY_GROUP": "scalaris-faculty"})
        self.settings.start()
        self.addCleanup(self.settings.stop)
        self.claims = {"cognito:groups": ["scalaris-faculty"]}
        self.access = {"accountRole": "faculty", "status": "ACTIVE"}
        self.store = AccessStore(self.access, {"name": "Faculty member", "email": "faculty@example.test", "rev": 1})

    def denied(self, callback, code):
        with self.assertRaises(APIError) as caught:
            callback()
        self.assertEqual(caught.exception.status, 403)
        self.assertEqual(caught.exception.code, code)

    def test_legacy_student_needs_no_migration(self):
        self.assertEqual(account_role(USER, {}, AccessStore()), "student")

    def test_client_supplied_role_attributes_do_not_grant_faculty_access(self):
        self.assertEqual(account_role(USER, {"role": "faculty", "accountRole": "faculty", "custom:role": "faculty"}, AccessStore()), "student")

    def test_faculty_requires_both_group_and_access_record(self):
        self.assertEqual(account_role(USER, self.claims, self.store), "faculty")
        self.denied(lambda: account_role(USER, self.claims, AccessStore()), "FACULTY_NOT_PROVISIONED")
        self.denied(lambda: account_role(USER, {}, self.store), "FACULTY_GROUP_REQUIRED")

    def test_disabled_or_unknown_roles_never_fall_back_to_student(self):
        self.denied(lambda: account_role(USER, self.claims, AccessStore({**self.access, "status": "DISABLED"})), "ACCOUNT_DISABLED")
        self.denied(lambda: account_role(USER, {}, AccessStore({"accountRole": "unrecognized", "status": "ACTIVE"})), "ROLE_NOT_CONFIGURED")

    def test_gateway_string_group_claim_is_supported(self):
        self.assertEqual(account_role(USER, {"cognito:groups": '["scalaris-faculty"]'}, self.store), "faculty")

    def test_faculty_cannot_use_student_access(self):
        self.denied(lambda: require_student(USER, self.claims, self.store), "STUDENT_ACCESS_REQUIRED")

    def test_shared_me_returns_faculty_profile_without_student_initialization(self):
        state = Mock(store=self.store)
        with patch.object(handlers, "State", return_value=state):
            result = handlers.state_handler.__wrapped__({"routeKey": "GET /v1/me"}, USER, self.claims)
        self.assertEqual(result["accountRole"], "faculty")
        self.assertEqual(result["profile"]["email"], "faculty@example.test")
        state.account_profile.assert_not_called()

    def test_faculty_student_state_routes_fail_before_operations(self):
        for route in ["PATCH /v1/me", "GET /v1/me/progress", "GET /v1/runs/{runId}",
                      "PATCH /v1/runs/{runId}", "POST /v1/assessments/{assessmentId}/runs",
                      "POST /v1/sectors/{sectorId}/missions/{missionId}/{difficulty}/runs"]:
            with self.subTest(route=route), patch.object(handlers, "State", return_value=Mock(store=self.store)):
                self.denied(lambda: handlers.state_handler.__wrapped__({"routeKey": route}, USER, self.claims), "STUDENT_ACCESS_REQUIRED")

    def test_student_cannot_use_faculty_endpoint(self):
        with patch.object(handlers, "State", return_value=Mock(store=AccessStore())):
            self.denied(lambda: handlers.state_handler.__wrapped__({"routeKey": "GET /v1/faculty/me"}, USER, {}), "FACULTY_ACCESS_REQUIRED")

    def test_faculty_content_and_assessment_handlers_are_guarded(self):
        with patch("scalaris.access.Store", return_value=self.store):
            self.denied(lambda: handlers.content_handler.__wrapped__({"routeKey": "GET /v1/sectors"}, USER, self.claims), "STUDENT_ACCESS_REQUIRED")
            self.denied(lambda: handlers.assessments_handler.__wrapped__({"routeKey": "POST /v1/assessment-runs/{runId}/submit"}, USER, self.claims), "STUDENT_ACCESS_REQUIRED")

    def test_faculty_cannot_submit_student_mission_or_review_as_admin(self):
        service = Mock(store=self.store)
        with patch.object(handlers, "Submissions", return_value=service):
            self.denied(lambda: handlers.missions_handler.__wrapped__({"routeKey": "POST /v1/mission-runs/{runId}/submit", "pathParameters": {"runId": "example"}}, USER, self.claims), "STUDENT_ACCESS_REQUIRED")
            self.denied(lambda: handlers.missions_handler.__wrapped__({"routeKey": "GET /v1/admin/users/{userId}/runs/{runId}"}, USER, self.claims), "FORBIDDEN")
        service.submit.assert_not_called()
        service.get_run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
