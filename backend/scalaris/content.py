"""Allowlisted S3 paths matching the user's existing DEV uploads."""
import json
import os
import time
from functools import lru_cache

from .core import APIError, require, safe_id


def configured_list(name, default):
    return [part.strip() for part in os.environ.get(name, default).split(",") if part.strip()]


def release_allowed(release):
    safe_id(release, "content release")
    require(release in configured_list("ALLOWED_CONTENT_RELEASES", os.environ.get("CONTENT_RELEASE", "v1-draft")), "Content release is not available.", 404)
    return release


@lru_cache(maxsize=100)
def _load(bucket, key, cache_slot):
    import boto3
    try:
        result = boto3.client("s3").get_object(Bucket=bucket, Key=key)
        return json.loads(result["Body"].read())
    except Exception as error:
        code = getattr(error, "response", {}).get("Error", {}).get("Code")
        if code in ("NoSuchKey", "404", "NoSuchBucket"):
            raise APIError(503, "CONTENT_MISSING", "Required content has not been uploaded.") from None
        raise


class Content:
    def current(self):
        return release_allowed(os.environ.get("CONTENT_RELEASE", "v1-draft"))

    def load(self, path, release=None, scoring=False):
        release = release_allowed(release or self.current())
        bucket = os.environ["SCORING_BUCKET" if scoring else "CONTENT_BUCKET"]
        result = _load(bucket, f"releases/{release}/{path}", int(time.monotonic() // 60))
        require(result.get("contentVersion", result.get("schemaVersion")) is not None, "Content has no version.", 503)
        if "contentVersion" in result:
            require(result["contentVersion"] == release, "Content version does not match its release path.", 503)
        return result

    def sectors(self):
        return configured_list("ENABLED_SECTORS", "vitalis")

    def catalog(self):
        catalog = self.load("sectors/catalog.json")
        enabled = set(self.sectors())
        return [{**entry, "enabled": entry["id"] in enabled,
                 **(self.sector(entry["id"]) if entry["id"] in enabled else {})}
                for entry in catalog["sectors"]]

    def sector(self, sector, release=None):
        safe_id(sector, "sector")
        require(sector in self.sectors(), "Sector is not available.", 404)
        return self.load(f"sectors/{sector}/sector.json", release)

    def mission(self, sector, mission, release=None):
        safe_id(mission, "mission")
        configuration = self.sector(sector, release)
        require(any(item["id"] == mission for item in configuration["missions"]), "Mission is not available.", 404)
        return self.load(f"sectors/{sector}/missions/{mission}/mission.json", release)

    def mission_questions(self, sector, mission, difficulty, release=None):
        self.mission(sector, mission, release)
        require(difficulty in ("beginning", "intermediate", "advanced"), "Unknown difficulty.")
        return self.load(f"sectors/{sector}/missions/{mission}/{difficulty}.json", release)

    def assessment(self, name, release=None):
        require(name in configured_list("ENABLED_ASSESSMENTS", "baseline"), "Assessment is not enabled.", 409, "ASSESSMENT_DISABLED")
        require(name in ("baseline", "post-gamification", "post-research"), "Unknown assessment.")
        return self.load(f"assessments/questions/{name}.json", release)

    def definition(self, run):
        if run["kind"] == "ASSESSMENT":
            return self.assessment(run["assessmentId"], run["contentVersion"])
        return self.mission_questions(run["sectorId"], run["missionId"], run["difficulty"], run["contentVersion"])

    def score_key(self, run):
        if run["kind"] == "ASSESSMENT":
            return self.load(f"assessments/{run['assessmentId']}.scoring.json", run["contentVersion"], scoring=True)
        filename = "advanced.rubrics.json" if run["difficulty"] == "advanced" else f"{run['difficulty']}.scoring.json"
        return self.load(f"sectors/{run['sectorId']}/{filename}", run["contentVersion"], scoring=True)


def questions(definition):
    if "sections" in definition:
        return [question for section in definition["sections"] for question in section["questions"]]
    return definition["questions"]


def fields(definition):
    result = {}
    for question in questions(definition):
        if question["type"] == "investigation":
            result.update({response["id"]: response for response in question["responses"]})
        else:
            result[question["id"]] = question
            if question.get("followUp"):
                follow = question["followUp"]["field"]
                result[f"{question['id']}:{follow['id']}"] = follow
    for field in definition.get("participantFields", []):
        result[f"participant:{field['id']}"] = field
    return result


def validate_answer(field, value):
    if value is None:
        return
    kind = field["type"]
    if kind == "single_choice":
        require(value in [option["id"] for option in field["options"]] and isinstance(value, str), "Unknown answer option.")
    elif kind == "multiple_choice":
        require(isinstance(value, list) and all(isinstance(item, str) for item in value), "Provide an option ID list.")
        require(len(set(value)) == len(value) and set(value) <= {option["id"] for option in field["options"]}, "Unknown or repeated answer option.")
    elif kind == "likert":
        require(type(value) is int and 1 <= value <= 7, "Agreement values must be integers from 1 to 7.")
    elif kind == "integer":
        require(type(value) is int and 0 <= value <= 9999, "Provide a valid integer.")
    else:
        require(isinstance(value, str) and len(value) <= 6000, "Text answers must be at most 6000 characters.")


def check_submission(definition, answers):
    required_section_ids = {question["id"] for section in definition.get("sections", [])
                            if section["id"] in ("cognitive", "attitudes", "experience") for question in section["questions"]}
    for question in questions(definition):
        if question["type"] == "investigation":
            for response in question["responses"]:
                require(isinstance(answers.get(response["id"]), str) and answers[response["id"]].strip(), "Complete both advanced responses before submitting.")
        elif question["type"] in ("single_choice", "likert") and ("sections" not in definition or question["id"] in required_section_ids):
            require(answers.get(question["id"]) is not None, "Complete all cognitive and agreement questions before submitting.")
        elif question.get("required") is True:
            require(answers.get(question["id"]) not in (None, "", []), "A required answer is missing.")
        follow = question.get("followUp")
        if follow and follow["whenOptionId"] in (answers.get(question["id"]) or []):
            require(bool(str(answers.get(f"{question['id']}:{follow['field']['id']}", "")).strip()), "Specify the Other response.")
