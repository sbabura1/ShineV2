"""Profiles, independent mission/difficulty drafts, runs and answer autosave."""
import os
from uuid import uuid4

from .content import Content, configured_list, fields, questions, validate_answer
from .core import APIError, Store, canonical, commit, now, operation, public, require, safe_id, version

EDITABLE = ("IN_PROGRESS", "CHANGES_REQUESTED")
EVIDENCE_TEXT = {"initialWork", "freshDataTest", "testResult", "revisionOrRetainedChoice", "limit"}


def pointer_key(run):
    if run["kind"] == "ASSESSMENT":
        return "BASELINE" if run["assessmentId"] == "baseline" else f"ASSESSMENT#{run['assessmentId']}"
    return f"LEVEL#{run['sectorId']}#{run['missionId']}#{run['difficulty']}"


class State:
    def __init__(self, store=None, content=None):
        self.store = store or Store()
        self.content = content or Content()

    def run(self, user, run_id):
        safe_id(run_id, "run ID")
        item = self.store.get(user, f"RUN#{run_id}")
        require(item is not None, "Run was not found.", 404, "NOT_FOUND")
        return item

    def answers(self, user, run_id):
        return {item["questionId"]: item["value"] for item in self.store.query(user, f"ANSWER#{run_id}#")}

    def investigations(self, user, run_id):
        return {item["questionId"]: item["value"] for item in self.store.query(user, f"EVIDENCE#{run_id}#")}

    def assessment_access(self, user, name):
        if name == "post-gamification":
            required = configured_list("REQUIRED_SECTORS", "vitalis")
            require(all((self.store.get(user, f"SECTOR#{sector}") or {}).get("completed") for sector in required),
                    "Complete every required sector before the post-gamification assessment.", 403, "ASSESSMENT_LOCKED")
        if name == "post-research":
            require((self.store.get(user, "PROJECT") or {}).get("completed") is True,
                    "Independent research completion has not been recorded.", 403, "ASSESSMENT_LOCKED")

    def profile(self, user):
        item = self.store.get(user, "PROFILE")
        return public(item) if item else {"rev": 0, "name": "", "sector": "vitalis"}

    def account_profile(self, user, claims, cognito=None):
        old = self.store.get(user, "PROFILE")
        if old:
            return public(old)
        pool_id = os.environ.get("COGNITO_USER_POOL_ID")
        require(pool_id, "Account profile configuration is missing.", 503, "CONFIGURATION_ERROR")
        if cognito is None:
            import boto3
            cognito = boto3.client("cognito-idp", region_name=pool_id.split('_', 1)[0])
        account = cognito.admin_get_user(UserPoolId=pool_id, Username=claims.get("username") or user)
        attributes = {attribute["Name"]: attribute["Value"] for attribute in account.get("UserAttributes", [])}
        require(attributes.get("sub") == user, "Account identity did not match.", 403)
        name = attributes.get("name") or ' '.join(part for part in (attributes.get("given_name"), attributes.get("family_name")) if part)
        write, item = self.store.write(user, "PROFILE", {"name": name, "sector": "vitalis", "createdAt": now(), "updatedAt": now()})
        try:
            self.store.transact([write])
        except APIError as failure:
            if failure.status != 409:
                raise
            item = self.store.get(user, "PROFILE")
        return public(item)

    def update_profile(self, user, body):
        allowed = {"name", "avatar", "avatarDesign", "beacon", "beaconDesign", "sector", "role", "faculty", "theme"}
        require(set(body) <= {"expectedVersion", "profile"}, "Unknown profile request fields.")
        data = body.get("profile")
        require(isinstance(data, dict) and set(data) <= allowed, "Unknown profile fields.")
        require(len(canonical(data).encode()) <= 16000, "Profile is too large.")
        for key, value in data.items():
            if key in ("avatarDesign", "beaconDesign"):
                require(isinstance(value, dict), "Avatar and beacon designs must be objects.")
            else:
                require(isinstance(value, str) and len(value) <= 200, "Profile text is too long.")
        if "sector" in data:
            self.content.sector(data["sector"])
        old = self.store.get(user, "PROFILE")
        require(version(body) == (old or {}).get("rev", 0), "Profile changed; reload it.", 409, "VERSION_CONFLICT")
        write, item = self.store.write(user, "PROFILE", {**data, "updatedAt": now()}, old)
        self.store.transact([write])
        return public(item)

    def progress(self, user):
        return {"profile": self.profile(user),
                "baseline": public(self.store.get(user, "BASELINE") or {}),
                "sectors": [public(item) for item in self.store.query(user, "SECTOR#")],
                "missions": [public(item) for item in self.store.query(user, "MISSION#")],
                "difficultyStates": [public(item) for item in self.store.query(user, "LEVEL#")],
                "assessments": [public(item) for item in self.store.query(user, "ASSESSMENT#")],
                "completionPolicy": "any_difficulty"}

    def get_run(self, user, run_id):
        item = self.run(user, run_id)
        return {"run": public(item), "answers": self.answers(user, run_id),
                "investigations": self.investigations(user, run_id),
                "reviews": [public(review) for review in self.store.query(user, f"REVIEW#{run_id}#")]}

    def start(self, event, user, body, kind, **selection):
        op = operation(self.store, user, event, body)
        if op["existing"]:
            return op["existing"]["response"]
        require(set(body) <= {"restart", "previousRunId"}, "Unknown start request fields.")
        require(type(body.get("restart", False)) is bool, "restart must be a boolean.")
        run = {"runId": str(uuid4()), "kind": kind, **selection,
               "contentVersion": self.content.current(), "status": "IN_PROGRESS",
               "startedAt": now(), "updatedAt": now(), "answeredCount": 0, "currentQuestionId": None, "currentStep": None}
        if kind == "ASSESSMENT":
            self.content.assessment(run["assessmentId"])
            self.assessment_access(user, run["assessmentId"])
        else:
            self.content.mission_questions(run["sectorId"], run["missionId"], run["difficulty"])
        sk = pointer_key(run)
        pointer = self.store.get(user, sk)
        baseline = kind == "ASSESSMENT" and run["assessmentId"] == "baseline"
        if baseline:
            require(not (pointer or {}).get("submittedAt"), "The full baseline has already been submitted.", 409, "BASELINE_ALREADY_SUBMITTED")
            require(not body.get("restart"), "The baseline uses one resumable draft and cannot be restarted.", 409)
        previous = self.run(user, pointer["activeRunId"]) if pointer and pointer.get("activeRunId") else None
        if previous and previous["status"] in EDITABLE and not body.get("restart"):
            # Still enforce idempotency key reuse even when the action simply resumes a draft.
            return commit(self.store, user, op, [], {"run": public(previous), "resumed": True})
        if body.get("restart"):
            require(previous and body.get("previousRunId") == previous["runId"], "Provide previousRunId for the draft being replaced.", 409)
        operations = []
        if previous and previous["status"] in EDITABLE:
            write, _ = self.store.write(user, previous["SK"], {"status": "SUPERSEDED", "updatedAt": now()}, previous)
            operations.append(write)
        write, run = self.store.write(user, f"RUN#{run['runId']}", run)
        operations.append(write)
        values = {"activeRunId": run["runId"], "status": "IN_PROGRESS", "contentVersion": run["contentVersion"], "updatedAt": now(), **selection}
        write, _ = self.store.write(user, sk, values, pointer)
        operations.append(write)
        if kind == "MISSION":
            mission_sk = f"MISSION#{run['sectorId']}#{run['missionId']}"
            summary = self.store.get(user, mission_sk)
            write, _ = self.store.write(user, mission_sk,
                {"sectorId": run["sectorId"], "missionId": run["missionId"], "lastActiveDifficulty": run["difficulty"],
                 "lastActiveRunId": run["runId"], "updatedAt": now(), "completed": (summary or {}).get("completed", False)}, summary)
            operations.append(write)
        return commit(self.store, user, op, operations, {"run": public(run), "resumed": False})

    def save(self, event, user, run_id, body):
        op = operation(self.store, user, event, body)
        if op["existing"]:
            return op["existing"]["response"]
        require(set(body) <= {"expectedVersion", "answers", "investigations", "currentQuestionId", "currentStep"}, "Unknown save fields.")
        run = self.run(user, run_id)
        require(run["status"] in EDITABLE, "This run is no longer editable.", 409)
        require(version(body) == run["rev"], "Run changed; reload its saved progress.", 409, "VERSION_CONFLICT")
        definition = self.content.definition(run)
        answer_fields = fields(definition)
        patches = body.get("answers", {})
        investigations = body.get("investigations", {})
        require(isinstance(patches, dict) and isinstance(investigations, dict), "answers and investigations must be objects.")
        require(len(patches) + len(investigations) <= 50, "Save at most 50 answer/evidence records per request.")
        operations = []
        for question_id, value in patches.items():
            require(question_id in answer_fields, "Unknown question in this run.")
            validate_answer(answer_fields[question_id], value)
            sk = f"ANSWER#{run_id}#{question_id}"
            write, _ = self.store.write(user, sk, {"runId": run_id, "questionId": question_id, "value": value, "updatedAt": now()}, self.store.get(user, sk))
            operations.append(write)
        advanced_ids = {question["id"] for question in questions(definition) if question["type"] == "investigation"}
        for question_id, value in investigations.items():
            require(question_id in advanced_ids, "Unknown investigation in this run.")
            validate_evidence(value)
            sk = f"EVIDENCE#{run_id}#{question_id}"
            write, _ = self.store.write(user, sk, {"runId": run_id, "questionId": question_id, "value": value, "updatedAt": now()}, self.store.get(user, sk))
            operations.append(write)
        updates = {"updatedAt": now()}
        if "currentQuestionId" in body:
            cursor = body["currentQuestionId"]
            require(cursor is None or cursor in answer_fields or cursor in advanced_ids, "Unknown resume question.")
            updates["currentQuestionId"] = cursor
        if "currentStep" in body:
            require(body["currentStep"] is None or isinstance(body["currentStep"], str) and len(body["currentStep"]) <= 80, "Invalid resume step.")
            updates["currentStep"] = body["currentStep"]
        answers = {**self.answers(user, run_id), **patches}
        updates["answeredCount"] = sum(value not in (None, "", []) for value in answers.values())
        write, updated = self.store.write(user, run["SK"], updates, run)
        operations.append(write)
        pointer = self.store.get(user, pointer_key(run))
        # The pointer is fenced with the run, preventing a late autosave from reviving a replaced draft.
        require(pointer and pointer.get("activeRunId") == run_id, "This draft has been replaced. Reload progress.", 409)
        write, _ = self.store.write(user, pointer["SK"], {"updatedAt": updates["updatedAt"], "answeredCount": updates["answeredCount"],
                                    "currentQuestionId": updates.get("currentQuestionId", run.get("currentQuestionId"))}, pointer)
        operations.append(write)
        return commit(self.store, user, op, operations, {"run": public(updated), "saved": True})


def validate_evidence(value, complete=False):
    allowed = EVIDENCE_TEXT | {"sessions", "optionsCompared", "sources"}
    require(isinstance(value, dict) and set(value) <= allowed, "Unknown investigation evidence fields.")
    require(len(canonical(value).encode()) <= 22000, "Investigation evidence is too large.")
    for key in EVIDENCE_TEXT & value.keys():
        require(isinstance(value[key], str) and len(value[key]) <= 2000, "Evidence text must be at most 2000 characters per field.")
    for key, count in (("sessions", 3), ("optionsCompared", 2)):
        if key in value:
            require(isinstance(value[key], list) and len(value[key]) <= count and all(isinstance(item, str) and len(item) <= 1000 for item in value[key]), "Invalid session or comparison evidence.")
    if "sources" in value:
        require(isinstance(value["sources"], list) and len(value["sources"]) <= 2, "Provide at most two sources.")
        for source in value["sources"]:
            require(isinstance(source, dict) and set(source) == {"resourceId", "reference"}, "Sources require resourceId and reference.")
            require(source["resourceId"] in ("vitalis-clinic-logs", "vitalis-neighborhood-reports"), "Unknown evidence source.")
            require(isinstance(source["reference"], str) and len(source["reference"]) <= 1000, "Invalid source reference.")
    if complete:
        require(all(isinstance(value.get(key), str) and value[key].strip() for key in EVIDENCE_TEXT), "Complete all investigation evidence fields.")
        require(len(value.get("sessions", [])) == 3 and all(text.strip() for text in value["sessions"]), "Provide work from all three sessions.")
        require(len(value.get("optionsCompared", [])) == 2 and all(text.strip() for text in value["optionsCompared"]), "Document both options compared.")
        require({source["resourceId"] for source in value.get("sources", []) if source["reference"].strip()} == {"vitalis-clinic-logs", "vitalis-neighborhood-reports"}, "Cite both investigation sources.")
