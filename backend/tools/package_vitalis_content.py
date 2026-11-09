"""Package only public Vitalis content, preserving the S3 directory structure."""
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "content/sectors/v1/vitalis"
DESTINATION = ROOT / "backend/dist/scalaris-vitalis-content-v1-draft.zip"


def build():
    paths = [Path(name) for name in ("sector.json", "skills.json", "resources.json")]
    for number in range(1, 4):
        for name in ("mission", "beginning", "intermediate", "advanced"):
            paths.append(Path(f"missions/vitalis-mission-{number:02d}/{name}.json"))
    files = []
    for path in paths:
        data = (SOURCE / path).read_bytes()
        definition = json.loads(data)
        assert definition["contentVersion"] == "v1-draft", path
        assert definition["sectorId"] == "vitalis", path
        files.append((f"vitalis/{path.as_posix()}", data))
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(DESTINATION, "w", ZIP_DEFLATED) as archive:
        for name, data in files:
            archive.writestr(name, data)
    with ZipFile(DESTINATION) as archive:
        assert len(archive.namelist()) == 15
        assert archive.testzip() is None
    print(f"Packaged {len(files)} public JSON files: {DESTINATION}")


if __name__ == "__main__":
    build()
