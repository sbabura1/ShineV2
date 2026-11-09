# SHINE assessment content

This directory contains a draft conversion of **SHINE ASSESSMENTS.docx** supplied on November 2, 2026. It contains all three instruments, their original tables and graph images, and separate backend-only scoring references. The React application and AWS resources have not been changed.

## Assessment sequence and counts

| Assessment | Administration point | Attitudes | Experience | Reflection | Cognitive | Demographics | Total questions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Baseline | Before SHINE activities | 32 | — | — | 28 | 20 | 80 |
| Post-gamification | After all required sectors and before independent study | 30 | 13 | 5 | 20 | — | 68 |
| Post-research | After completing the independent research project | 26 | 20 | 6 | 20 | — | 72 |

The 220-question total excludes participant details: name, student ID, mentor, assessment date, and the post-gamification completion date. Each assessment has its own sections; the three assessments should not be confused with the parts inside an assessment.

Post-gamification timing combines the document introduction with the previously discussed sector-completion rule. The draft records timing as needing review. Post-research must not unlock merely because sectors are complete: the document places it after independent research.

## Files and intended access

```text
v1/
  manifest.json
  questions/
    baseline.json
    post-gamification.json
    post-research.json
  assets/
    image1.gif ... image19.gif
  private/
    baseline.scoring.json
    post-gamification.scoring.json
    post-research.scoring.json
    source-reference.json
```

`questions/` contains prompts, options, participant fields, scales, stimuli, and source locators. `assets/` contains the 19 original images extracted without modification. The future content API should return only the appropriate question file and its permitted assets, with the backend enforcing assessment access.

**Everything in `private/` is backend/content-review material.** It includes supplied answers, proposed answers, explanations, editorial comments, and review issues. Keep it out of frontend imports, Vite public assets, and student API responses. Do not upload this entire directory to a public website. The root manifest is a deployment inventory, not a student API response.

Use separate S3 destinations for question content, original resources, and private scoring when deploying. No bucket names or AWS identifiers are hardcoded here. Asset paths are relative to `v1/`; a future loader must resolve asset IDs to authorized delivery URLs.

## Question representation

- `assessmentId`, question IDs, and option IDs are stable identifiers. Store answers by IDs, not array positions or display text. Preserve IDs if wording is edited; version substantive revisions.
- `contentVersion` is currently `v1-draft`. Pin an attempt to the version it starts with. Do not score an older attempt against a different release.
- Sections preserve printed order. Every question includes `sourceNumber`; IDs are distinct between assessments and sections.
- `type` supports `likert`, `single_choice`, `multiple_choice`, `text`, `long_text`, `integer`, `email`, and `phone`.
- `required: null` means **undecided**, not optional and not required. Publishing must resolve it before a production renderer enforces submission rules.
- Likert items reference the shared `agreement-7` scale included in each file. Preserve raw responses. No approved attitude aggregation or reverse coding is enabled.
- Cognitive questions refer to shared `stimulusIds`, so a dataset or graph can support several questions. Options may contain tables, images, or paragraphs rather than text alone. Baseline item 9 option A contains **two** images.
- Tables retain the source row arrays, including merged title rows, blank cells and one blank row. A renderer must support unequal row lengths without inventing or flattening data. Header inference should be reviewed when implementing the renderer.
- Majors are multiple selection with an Other text follow-up. Race/ethnicity is single selection in the source. Sex/gender is free text. No extra response categories were invented.
- Birth year retains the source request for a dropdown, but its year range is null because none was specified.
- `source.blockIndex` refers to the zero-based document body block in the extracted source; `source.tableRow` is one-based and includes table headers. The source SHA-256 identifies the exact reviewed document.

## Scoring review required

The source explicitly says assessments 2 and 3 need revision after additions to assessment 1. Its cognitive scoring table has 20 rows per assessment, while the current baseline contains 28 cognitive questions.

The baseline private scoring file contains:

- The original 20-row T1 key, preserved exactly under `sourceKey`.
- Source key rows alongside each current question, marked as legacy row mappings rather than validated answers.
- An active corrected answer and explanation for each of the 28 current questions, adopted under the user's November 2 instruction to use correct answers instead of the outdated key.
- **13 conflicts** between source row answers and derived suggestions among the first 20 items.
- **Eight questions (21–28)** without source key rows.

Baseline cognitive scoring is configured: `approvedAnswerOptionId` is populated for all 28 questions, with one point per correct answer, zero per incorrect answer, and a maximum of 28. The percentage is `correctCount / 28 * 100`. Its `scoringEnabled` is true. The legacy key is audit material only and has `usedForScoring: false`. No pass/fail bands were added.

The supplied T2 and T3 keys remain preserved but await approval in view of the source's revision warning. Their scoring stays disabled. The overall manifest remains `publishable: false` because administration, attitude scoring, and the two later instruments have outstanding decisions.

The source's proposed factor table and reverse-coding note refer to a 26-item attitude instrument. They must not be applied by question number to the 32-item baseline or 30-item post-gamification attitude sections. No pass/fail threshold, performance band, retry limit, or automated reflection rubric has been invented.

The baseline key is corrected. Remaining decisions concern assessment timing and requiredness, research consent and demographic response policy, attitude-factor mappings and reverse coding, graph accessibility, and revisions to the two later assessments. Blocking categories are listed in `v1/manifest.json`. See `source-reference.json` for the 20 editorial comments and original cognitive skills map. Editorial suggestions were retained for review, not applied to question wording. Tracked insertions were included and deletions excluded during extraction; the source Word file was not modified.

## Rebuild and validate locally

From the repository root in PowerShell:

```powershell
$assessmentExtract = Join-Path $env:TEMP 'shine-assessments-extracted.json'
./scripts/extract-shine-assessments.ps1 `
  -SourcePath 'C:\Users\shrey\Desktop\SHINE ASSESSMENTS.docx' `
  -OutputPath $assessmentExtract `
  -AssetsPath './content/assessments/v1/assets'

node ./scripts/build-shine-assessments.mjs $assessmentExtract
node ./scripts/validate-shine-assessments.mjs $assessmentExtract
```

The conversion script is specific to this document's reviewed structure and SHA-256. It deliberately rejects a revised document until its mapping has been reviewed. Rebuilding overwrites the generated draft JSON files; put later approved content changes into a reviewed release rather than casually rerunning the draft converter.

Validation without the source document is also available:

```powershell
node ./scripts/validate-shine-assessments.mjs
```

Checks cover counts, unique IDs, valid options and scoring references, scales, stimuli, asset existence and GIF signatures, and separation of scoring information from question files. With the temporary extraction argument, it also reconciles question wording, table cells, option text, and original key rows against the source. Mutation checks verify that leaked answers, duplicate IDs, broken references, and invalid keys are rejected.

```powershell
node ./scripts/validate-shine-assessments.mjs --publish
```

This deliberately exits with an error while the current overall draft has unresolved decisions. It does not upload anything. Baseline key checks exercise 28/28, 0/28, 14/28, and empty responses. Content integrity passing does not settle the remaining administration or attitude-scoring policies.

## Next implementation step

Settle the remaining administration and attitude-scoring decisions, then establish a reviewed content release and use it to implement the pre-assessment API and DynamoDB attempt records. The corrected baseline cognitive key is already configured. AWS changes should be carried out by the project owner using instructions prepared for that release.
