"""Account roles are administrator-managed, never editable student profile fields."""
import os

from .core import Store, claim_groups, public, require


def account_role(user, claims, store=None):
    store = store or Store()
    access = store.get(user, "ACCESS")
    faculty_group = os.environ.get("FACULTY_GROUP", "scalaris-faculty")
    is_faculty = faculty_group in claim_groups(claims)
    if access:
        require(access.get("status") == "ACTIVE", "This account's access is not active.", 403, "ACCOUNT_DISABLED")
        require(access.get("accountRole") in ("student", "faculty"), "This account's role is not configured.", 403, "ROLE_NOT_CONFIGURED")
    if is_faculty:
        require(access and access.get("accountRole") == "faculty", "Faculty access has not been provisioned. Contact your administrator.", 403, "FACULTY_NOT_PROVISIONED")
        return "faculty"
    # A faculty account with a stale or missing group claim must never fall back
    # to student access. A fresh sign-in is required after a group change.
    require(not access or access.get("accountRole") != "faculty", "Sign out and sign in again to refresh your faculty access.", 403, "FACULTY_GROUP_REQUIRED")
    return "student"


def require_student(user, claims, store=None):
    require(account_role(user, claims, store) == "student", "Student access is not available to faculty accounts.", 403, "STUDENT_ACCESS_REQUIRED")


def faculty_profile(user, store):
    profile = store.get(user, "FACULTY_PROFILE")
    require(profile is not None, "Your faculty profile has not been provisioned. Contact your administrator.", 403, "FACULTY_NOT_PROVISIONED")
    return public(profile)
