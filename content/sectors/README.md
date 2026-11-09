# Vitalis sector content

The Vitalis assessment content is converted from the two supplied local attachments:

- `Scalaris - Assessment Question (based on Pre-Assessment).docx`
- `Scalaris - Assessment Question Spreadsheet.xlsx`

The supplied Google Docs and Sheets links could not be read through the web tool. This conversion uses the local attachments; it does not claim to include subsequent online edits. Neither source file was modified. Other sectors were inspected for context but were not generated.

## What is included

The source spreadsheet maps 14 pre-assessment skills to three proposed Vitalis missions. Each mapped skill has a beginner item, its original pre-assessment item at intermediate, and an advanced investigation with two short responses.

| Proposed mission | Mission ID | Beginner items | Intermediate items | Advanced investigations | Advanced written responses |
| --- | --- | ---: | ---: | ---: | ---: |
| The Clinic Data Review | `vitalis-mission-01` | 2 | 2 | 2 | 4 |
| The Care Comparison | `vitalis-mission-02` | 10 | 10 | 10 | 20 |
| Testing Health Support | `vitalis-mission-03` | 2 | 2 | 2 | 4 |
| Total | | 14 | 14 | 14 | 28 |

This is **42 activities and 56 response items**: 28 multiple-choice answers plus 28 advanced written responses. The 2/10/2 allocation follows the supplied mission mapping. No questions have been added to rebalance it.

The mapped pre-assessment numbers are **1, 2, 3, 4, 8, 13, 14, 15, 17, 20, 21, 23, 24, 27**. Source question numbers are identifiers, not a requirement that a student see every baseline question in a mission.

## Files

```text
v1/vitalis/
  manifest.json
  sector.json
  skills.json
  resources.json
  missions/
    vitalis-mission-01/
      mission.json
      beginning.json
      intermediate.json
      advanced.json
    vitalis-mission-02/
      mission.json
      beginning.json
      intermediate.json
      advanced.json
    vitalis-mission-03/
      mission.json
      beginning.json
      intermediate.json
      advanced.json
  private/
    beginning.scoring.json
    intermediate.scoring.json
    advanced.rubrics.json
    source-mapping.json
    source-images/
      vitalis-q001.png ...
```

There is no `review-issues.json` file. Remaining deployment settings are described here and enumerated in the manifest.

## Content and scoring

**Student content:** `sector.json`, `skills.json`, `resources.json`, and mission JSON files. The manifest labels these `student_content`. These are the files for a future authorized content API. It must enforce mission/attempt access rather than exposing the full bucket.

**Private scoring:** The two multiple-choice key files and advanced rubric file belong in the private scoring destination, accessible to backend scoring functions. They must not be included in frontend imports or student question responses.

**Source references:** `source-mapping.json` records workbook cells, document blocks, listed source pages, and source hashes. The 14 original PNGs are preserved unchanged for developer comparison. Each original composite includes all three levels. They are source-reference assets, not the learner graphics and not necessary runtime uploads. Do not show a full composite to a student answering a single-level item.

`manifest.json` is a deployment inventory with file hashes, difficulty counts, and visibility categories. It is not a student-facing endpoint response. All paths in the manifest and mission configuration are relative to `v1/vitalis/`.

### Beginner

The source calls this level **Beginner** and classifies it as DOK 2. The internal ID is `beginning` to match the application's existing level terminology. The original questions, four option choices, and option order are preserved.

Graphic data are represented as structured tables, or dot-plot specifications for questions 23 and 24. They can be rendered by the frontend without embedding a whole source screenshot. All beginner data are source-provided practice examples. No real patient data are included.

The source's correct options and explanations are stored privately and checked against the actual values. Multiple-choice scoring uses one point per correct answer, zero otherwise; each level's total question bank is worth 14 points across the sector. The per-mission maximum is its question count. Passing thresholds are unspecified.

### Intermediate

The spreadsheet explicitly uses the **original pre-assessment questions**, so these retain their existing education, tutoring, library, public-safety, or health contexts. They were not rewritten into health-specific questions.

The complete baseline conversion supplies the option tables and shared stimuli missing from plain spreadsheet cells. In particular, item 8 retains all three candidate tables and five options; item 24 retains the recovered clinic-age table. Intermediate files are self-contained: the frontend does not need to fetch baseline JSON to render them.

The corrected 28-item baseline key supplies intermediate answers, including its corrected questions 13, 17, 20, 21, 23, 24, and 27. The outdated document key is not used. Difficulty labels do not imply a numeric DOK level for intermediate: the source did not specify one.

### Advanced

Each activity is a DOK 4 investigation with **two written responses of two to three sentences each**, supported by retained work. DOK 4 applies to the full investigation, not to the short answers alone.

The JSON preserves the source requirements: three sessions, both named sources, comparison of two options, a fresh-data test, actual results, revision or a reasoned retained choice, and a relevant limit. Data must be public or teacher-provided group data, as stated in the source.

The private rubric preserves the supplied response and investigation-evidence criteria. Grading is `human_rubric_review`; numeric points are null and automatic scoring is disabled. The source allows findings to vary with the data, so no single fixed recommendation or invented correct text answer is supplied.

### Mission hints and help

All 42 Vitalis mission activities include a `support` object with a short `hint` and a `stuck` object containing an `introduction` and ordered `steps`. Each of the 28 advanced written responses also has its own `support` object. Guidance explains an approach without supplying an answer option or a completed investigation response.

The editable source is `content/sectors/authoring/vitalis-support.json`, keyed by mission question ID. Advanced response guidance is keyed by its `sourceNumber` within that question. This guidance is newly authored supplemental content, not quoted source-assessment wording or a private grading rubric. Edit this bank when changing the learning guidance; the Vitalis builder attaches it to the generated mission files through `scripts/vitalis-support.mjs`.

The guidance applies only to mission content. Intermediate mission copies receive support even when their questions originate in the baseline. Pre-assessment JSON, shared baseline source files, and private scoring files do not receive support. The existing run-content API returns the mission fields; adding this data does not enable Beacon controls or upload a release.

## Settings and resources still to supply

- Actual clinic visit/waiting-time data and neighborhood care-needs/opening-hour reports. Their names are supplied, but their files or URLs are not. `resources.json` contains explicit unfilled resource records; it does not pretend the datasets exist.
- Passing thresholds, retry limits, required difficulty levels, and mission completion policy. A student may not necessarily be required to finish all three levels; the source does not settle that rule.
- A numeric advanced grading scale if the product needs one. Written responses alone must not mark the investigation complete.
- Sprint questions and their relationship to missions if sprints are required. These two files do not define a sprint bank. `preMissionSprintId` is null; the existing prototype sprint content was not silently substituted.
- Broader mission screens, task sequencing, and narrative content beyond these assessment definitions. This package is an assessment bank organized by the proposed missions, not a fabricated replacement for the full mission experience.

Question-level `required: null` means the requiredness policy has not been set. The two responses within a submitted advanced investigation are marked required because the source explicitly requests both. The overall release stays `v1-draft` and `publishable: false` while the remaining settings/resources are absent. AWS resources and frontend behavior have not been changed.

## Local regeneration

From the repository root in PowerShell:

```powershell
$sectorDocumentExtract = Join-Path $env:TEMP 'scalaris-sector-doc-extracted.json'
$sectorWorkbookExtract = Join-Path $env:TEMP 'scalaris-sector-workbook-extracted.json'
$sectorSourceImages = Join-Path $env:TEMP 'scalaris-sector-source-assets'

./scripts/extract-shine-assessments.ps1 `
  -SourcePath 'C:\Users\shrey\Desktop\Scalaris - Assessment Question (based on Pre-Assessment).docx' `
  -OutputPath $sectorDocumentExtract `
  -AssetsPath $sectorSourceImages

./scripts/extract-scalaris-sector-map.ps1 `
  -SourcePath 'C:\Users\shrey\Desktop\Scalaris - Assessment Question Spreadsheet.xlsx' `
  -OutputPath $sectorWorkbookExtract

node ./scripts/build-vitalis-content.mjs $sectorDocumentExtract $sectorWorkbookExtract $sectorSourceImages
node ./scripts/validate-vitalis-content.mjs $sectorWorkbookExtract
```

The builder rejects changed source-document/workbook hashes until the source mappings are revisited. It regenerates the draft JSON and copies only the 14 Vitalis source images. Edits intended for an approved release should not be made by casually rebuilding over that release.

Validation without the temporary source extraction:

```powershell
node ./scripts/validate-vitalis-content.mjs
```

Checks cover all mission/difficulty mappings, unique question and response IDs, stimulus/resource references, file hashes, source-image signatures, option validity, key separation, arithmetic in the source data, corrected intermediate answers, advanced criteria, and preservation of source question/rubric wording. Mutation checks reject leaked answers, duplicate IDs, and missing shared stimuli. Validation does not deploy anything.
