"""Server-owned scoring, baseline submission lock and mission completion."""
from .content import check_submission, fields, questions, validate_answer
from .core import commit, now, operation, public, require, safe_id, version
from .state import EDITABLE, State, pointer_key, validate_evidence


class Submissions(State):
    def submit(self, event, user, run_id, body, expected_kind):
        op = operation(self.store, user, event, body)
        if op["existing"]:
            return op["existing"]["response"]
        require(set(body) == {"expectedVersion"}, "Submission takes only expectedVersion; save answers first.")
        run = self.run(user, run_id)
        require(run["kind"] == expected_kind, "Incorrect submission endpoint for this run.")
        if run["status"] in ("COMPLETED", "PENDING_REVIEW"):
            return commit(self.store, user, op, [], {"run": public(run), "alreadySubmitted": True})
        require(run["status"] in EDITABLE, "This run cannot be submitted.", 409)
        require(version(body) == run["rev"], "Run changed; reload before submitting.", 409, "VERSION_CONFLICT")
        definition = self.content.definition(run)
        if run["kind"] == "ASSESSMENT":
            self.assessment_access(user, run["assessmentId"])
        answers = self.answers(user, run_id)
        field_map = fields(definition)
        for question_id, value in answers.items():
            require(question_id in field_map, "Saved answers do not match this content release.", 409)
            validate_answer(field_map[question_id], value)
        check_submission(definition, answers)
        if run.get("difficulty") == "advanced":
            evidence = self.investigations(user, run_id)
            for question in questions(definition):
                validate_evidence(evidence.get(question["id"], {}), complete=True)
            updated = {"status": "PENDING_REVIEW", "submittedAt": now(), "updatedAt": now(),
                       "submissionCount": run.get("submissionCount", 0) + 1,
                       "result": {"gradingMode": "human_rubric_review", "status": "PENDING_REVIEW"}}
            operations, saved = self._save_submission(user, run, updated, completed=False)
        else:
            result = self._score(run, definition, answers)
            updated = {"status": "COMPLETED", "submittedAt": now(), "completedAt": now(), "updatedAt": now(), "result": result}
            operations, saved = self._save_submission(user, run, updated, completed=True)
        return commit(self.store, user, op, operations, {"run": public(saved)})

    def _score(self, run, definition, answers):
        key = self.content.score_key(run)
        if run["kind"] == "ASSESSMENT":
            require(key.get("scoringEnabled") is True, "The scoring key for this assessment is not enabled.", 409, "SCORING_DISABLED")
            items = key["cognitive"]["items"]
            answer_property = "approvedAnswerOptionId"
            point_value = key["cognitive"]["pointsPerCorrectAnswer"]
            maximum = key["cognitive"]["approvedMaximumPoints"]
            expected = {question["id"] for section in definition["sections"] if section["id"] == "cognitive" for question in section["questions"]}
        else:
            items = [item for item in key["items"] if item["missionId"] == run["missionId"]]
            answer_property = "correctOptionId"
            point_value = key["pointsPerCorrectAnswer"]
            expected = {question["id"] for question in definition["questions"]}
            maximum = len(expected) * point_value
        require(point_value == 1 and maximum == len(expected) and maximum > 0, "Invalid scoring scale.", 503, "INVALID_SCORING_KEY")
        require(len(items) == len(expected) and {item["questionId"] for item in items} == expected, "Incomplete scoring key.", 503, "INVALID_SCORING_KEY")
        field_map = fields(definition)
        for item in items:
            require(item.get(answer_property) in {option["id"] for option in field_map[item["questionId"]]["options"]}, "Invalid scoring answer.", 503, "INVALID_SCORING_KEY")
        correct = sum(answers.get(item["questionId"]) == item[answer_property] for item in items)
        # No answer keys, correct option IDs or private explanations leave this Lambda.
        return {"gradingMode": "exact_option_match", "score": correct, "maximumScore": maximum,
                "percentage": round(correct / maximum * 100, 2)}

    def _save_submission(self, user, run, updates, completed):
        operations = []
        write, saved = self.store.write(user, run["SK"], updates, run)
        operations.append(write)
        pointer = self.store.get(user, pointer_key(run))
        require(pointer is not None, "Run progress pointer is missing.", 409)
        pointer_values = {"updatedAt": now()}
        if pointer.get("activeRunId") == run["runId"]:
            pointer_values["status"] = updates["status"]
        if completed:
            pointer_values["latestCompletedRunId"] = run["runId"]
        if run["kind"] == "ASSESSMENT" and run["assessmentId"] == "baseline":
            require(not pointer.get("submittedAt"), "The baseline was already submitted.", 409, "BASELINE_ALREADY_SUBMITTED")
            pointer_values["submittedAt"] = updates["submittedAt"]
        write, _ = self.store.write(user, pointer["SK"], pointer_values, pointer)
        operations.append(write)
        if completed and run["kind"] == "MISSION":
            operations.extend(self._complete_mission(user, run))
        return operations, saved

    def _complete_mission(self, user, run):
        mission_sk = f"MISSION#{run['sectorId']}#{run['missionId']}"
        mission = self.store.get(user, mission_sk)
        completed_levels = set((mission or {}).get("completedDifficulties", [])) | {run["difficulty"]}
        write, _ = self.store.write(user, mission_sk,
            {"sectorId": run["sectorId"], "missionId": run["missionId"], "completed": True,
             "completedDifficulties": sorted(completed_levels), "firstCompletedAt": (mission or {}).get("firstCompletedAt", now()),
             "latestCompletedAt": now(), "latestCompletedRunId": run["runId"]}, mission)
        operations = [write]
        configuration = self.content.sector(run["sectorId"], run["contentVersion"])
        required_ids = configuration["completion"]["requiredMissionIds"]
        completed_ids = [mission_id for mission_id in required_ids if mission_id == run["missionId"] or
                         (self.store.get(user, f"MISSION#{run['sectorId']}#{mission_id}") or {}).get("completed")]
        sector_sk = f"SECTOR#{run['sectorId']}"
        sector = self.store.get(user, sector_sk)
        complete = len(completed_ids) == len(required_ids)
        # Completion is monotonic: replaying an activity or publishing content never revokes earned credit.
        values = {"sectorId": run["sectorId"], "completedMissionIds": sorted(set(completed_ids) | set((sector or {}).get("completedMissionIds", []))),
                  "requiredMissionIds": required_ids, "completed": complete or (sector or {}).get("completed", False), "updatedAt": now()}
        if complete:
            values["firstCompletedAt"] = (sector or {}).get("firstCompletedAt", now())
        write, _ = self.store.write(user, sector_sk, values, sector)
        operations.append(write)
        return operations

    def review(self, event, admin, user, run_id, body):
        safe_id(user, "student identity")
        op = operation(self.store, admin, event, body)
        if op["existing"]:
            return op["existing"]["response"]
        require(set(body) <= {"expectedVersion", "decision", "feedback"}, "Unknown review fields.")
        require(body.get("decision") in ("approve", "request_changes"), "decision must be approve or request_changes.")
        feedback = body.get("feedback", "")
        require(isinstance(feedback, str) and len(feedback) <= 4000, "Review feedback is too long.")
        run = self.run(user, run_id)
        require(run["kind"] == "MISSION" and run.get("difficulty") == "advanced" and run["status"] == "PENDING_REVIEW", "This run is not awaiting an advanced review.", 409)
        require(version(body) == run["rev"], "The submission changed; reload it.", 409, "VERSION_CONFLICT")
        approved = body["decision"] == "approve"
        updates = {"status": "COMPLETED" if approved else "CHANGES_REQUESTED", "updatedAt": now(),
                   "result": {"gradingMode": "human_rubric_review", "decision": body["decision"], "feedback": feedback, "reviewedAt": now()}}
        if approved:
            updates["completedAt"] = now()
        operations, saved = self._save_submission(user, run, updates, completed=approved)
        write, _ = self.store.write(user, f"REVIEW#{run_id}#{op['sk'].split('#')[1]}",
            {"runId": run_id, "reviewerSub": admin, "decision": body["decision"], "feedback": feedback,
             "submissionCount": run.get("submissionCount", 1), "reviewedAt": now()})
        operations.append(write)
        return commit(self.store, admin, op, operations, {"run": public(saved)})
