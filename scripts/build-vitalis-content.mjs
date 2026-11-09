import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { addVitalisSupport } from './vitalis-support.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [documentFile, workbookFile, sourceImagesDirectory] = process.argv.slice(2);
if (!sourceImagesDirectory) throw new Error('Usage: node scripts/build-vitalis-content.mjs <document-extract.json> <workbook-extract.json> <extracted-images-directory>');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const doc = read(documentFile);
const workbook = read(workbookFile);
assert.equal(doc.sourceSha256, '3880bdddd31a8a1101c8a01f48ef93e127fbc60a2ba8c8e261f5c0dc0b4c26a4', 'Document revision requires remapping');
assert.equal(workbook.sourceSha256, '47353534f8935b39be9f233e6ea4f10100ac9ac5327e9fdce1606e232d266098', 'Workbook revision requires remapping');
const baselinePath = path.join(root, 'content/assessments/v1/questions/baseline.json');
const baselineScoringPath = path.join(root, 'content/assessments/v1/private/baseline.scoring.json');
const baseline = read(baselinePath);
const baselineScoring = read(baselineScoringPath);
const supportBank = read(path.join(root, 'content/sectors/authoring/vitalis-support.json'));
const cognitive = baseline.sections.find(section => section.id === 'cognitive').questions;
assert.equal(baselineScoring.scoringEnabled, true);
const output = path.join(root, 'content/sectors/v1/vitalis');
const inventory = [];
const write = (filename, content, visibility) => {
  const target = path.join(output, filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const bytes = `${JSON.stringify(content, null, 2)}\n`;
  fs.writeFileSync(target, bytes);
  inventory.push({ path: filename, visibility, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
};
const pad = n => String(n).padStart(3, '0');
const lines = text => text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const normalize = text => text.replace(/\s+/g, ' ').trim();
const cell = (row, column) => row.cells[`${column}${row.number}`]?.value ?? '';
const location = (row, column, sheet = 'Assessment Map') => ({ sheet, cell: `${column}${row.number}` });
const assessmentMap = workbook.sheets.find(sheet => sheet.name === 'Assessment Map');
const vitalisRows = assessmentMap.rows.filter(row => cell(row, 'C') === 'Vitalis');
const expectedNumbers = [1, 2, 3, 4, 8, 13, 14, 15, 17, 20, 21, 23, 24, 27];
assert.deepEqual(vitalisRows.map(row => Number(cell(row, 'A'))), expectedNumbers);
const reference = workbook.sheets.find(sheet => sheet.name === 'Sector Reference').rows.find(row => cell(row, 'A') === 'Vitalis');
assert.ok(reference);
const missionDefinitions = [
  { id: 'vitalis-mission-01', title: cell(reference, 'F'), role: 'data_review', column: 'F', numbers: [1, 8] },
  { id: 'vitalis-mission-02', title: cell(reference, 'G'), role: 'comparison', column: 'G', numbers: [2, 3, 13, 14, 15, 17, 20, 21, 23, 24] },
  { id: 'vitalis-mission-03', title: cell(reference, 'H'), role: 'research', column: 'H', numbers: [4, 27] },
];
const levels = ['beginning', 'intermediate', 'advanced'];
const levelNames = { beginning: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const common = { schemaVersion: '1.0.0', contentVersion: 'v1-draft', sectorId: 'vitalis' };
const evidenceSourceNames = ['clinic visit and waiting-time logs', 'neighborhood care-needs and opening-hour reports'];
const sources = [
  { id: 'sector-document', file: doc.sourceFile, sha256: doc.sourceSha256,
    suppliedLink: 'https://docs.google.com/document/d/1zbwaaDt7QC5CzFF8lg3R8duKiioeyA5KHMYEXjZNpg4/edit',
    linkAccess: 'unavailable_used_local_attachment' },
  { id: 'sector-workbook', file: workbook.sourceFile, sha256: workbook.sourceSha256,
    suppliedLink: 'https://docs.google.com/spreadsheets/d/1lDka_KvfSp8-K7A5AWY39lDTp6s4Nf7VIsfTF_24y9g/edit',
    linkAccess: 'unavailable_used_local_attachment' },
  { id: 'baseline-questions', file: 'content/assessments/v1/questions/baseline.json',
    sha256: crypto.createHash('sha256').update(fs.readFileSync(baselinePath)).digest('hex'), originalSourceSha256: baseline.source.sha256 },
  { id: 'baseline-corrected-key', file: 'content/assessments/v1/private/baseline.scoring.json',
    sha256: crypto.createHash('sha256').update(fs.readFileSync(baselineScoringPath)).digest('hex'), visibility: 'backend_only' },
];

function parseBeginning(row, id) {
  const text = cell(row, 'E');
  const valueLines = lines(text);
  const dataIndex = valueLines.findIndex(line => line.startsWith('Graphic data:'));
  const chooseIndex = valueLines.indexOf('Choose one answer.');
  assert.ok(dataIndex > 0 && chooseIndex > dataIndex);
  const prompt = valueLines.slice(0, dataIndex).join('\n');
  const title = valueLines[dataIndex].replace(/^Graphic data:\s*/, '');
  const dataLines = valueLines.slice(dataIndex + 1, chooseIndex);
  const mapping = dataLines.filter(line => /^A = /.test(line));
  const raw = dataLines.filter(line => !/^A = /.test(line));
  let graphic;
  if (raw[0].includes('|')) {
    graphic = { type: 'table', title, headerRowCount: 1, rows: raw.map(line => line.split('|').map(value => value.trim())),
      dataOrigin: 'source_practice_example' };
  } else if (raw[0].startsWith('Values:')) {
    const values = raw[0].replace(/^Values:\s*/, '').split(',').map(Number);
    graphic = { type: 'chart', chartType: 'dot_plot', title,
      xAxis: { label: 'Recorded value', minimum: 0, maximum: 50 },
      series: [{ id: 'waiting-times', label: 'Recorded values', values }], stackRepeatedValues: true,
      dataOrigin: 'source_practice_example' };
  } else {
    assert.equal(raw.length, 2);
    graphic = { type: 'chart', chartType: 'grouped_dot_plot', title,
      xAxis: { label: 'Recorded value', minimum: 0, maximum: 20 },
      series: raw.map(line => { const [label, values] = line.split(':'); return { id: label.trim(), label: label.trim(), values: values.split(',').map(Number) }; }),
      dataOrigin: 'source_practice_example' };
  }
  const options = valueLines.slice(chooseIndex + 1).map((line, index) => {
    const match = line.match(/^([A-D])\.\s*(.+)$/);
    assert.ok(match, `Malformed option in ${id}`);
    assert.equal(match[1], String.fromCharCode(65 + index));
    return { id: match[1], label: match[1], text: match[2] };
  });
  assert.equal(options.length, 4);
  return { id, type: 'single_choice', prompt, instructions: ['Choose one answer.'],
    required: null, depthOfKnowledge: { level: 2, scope: 'item' },
    content: [graphic, ...mapping.map(text => ({ type: 'paragraph', text }))], options,
    source: { id: 'sector-workbook', ...location(row, 'E') } };
}

function parseAdvanced(row, id) {
  const valueLines = lines(cell(row, 'G'));
  const first = valueLines.findIndex(line => line.startsWith('1. '));
  assert.equal(valueLines.length - first, 2);
  const responses = valueLines.slice(first).map((line, index) => ({
    id: `${id}-response-${index + 1}`, sourceNumber: index + 1,
    type: 'long_text', prompt: line.replace(/^\d+\.\s*/, ''), required: true,
    expectedLength: { minimumSentences: 2, maximumSentences: 3, enforcement: 'guidance' },
  }));
  return { id, type: 'investigation', prompt: valueLines[0], required: null,
    depthOfKnowledge: { level: 4, scope: 'completed_investigation', shortResponsesAloneSufficient: false },
    instructions: valueLines.slice(1, first), responses,
    investigation: { sessionCount: 3, comparisonOptionCount: 2,
      sourceIds: ['vitalis-clinic-logs', 'vitalis-neighborhood-reports'],
      requiresBothSources: true, requiresFreshDataTest: true, requiresRevisionOrRetainedChoiceExplanation: true,
      requiresSavedWork: true, dataPolicy: 'public_or_teacher_provided_group_data',
      evidenceRequirements: ['two_options_compared', 'initial_work', 'fresh_data_test', 'test_result', 'revision_or_reasoned_retained_choice', 'relevant_limit'] },
    source: { id: 'sector-workbook', ...location(row, 'G') } };
}

const mapping = [];
const sourceAssets = [];
const beginningKeys = [];
const intermediateKeys = [];
const advancedRubrics = [];
const missionCounts = [];
for (const mission of missionDefinitions) {
  const rows = vitalisRows.filter(row => cell(row, 'D') === mission.title);
  assert.deepEqual(rows.map(row => Number(cell(row, 'A'))), mission.numbers);
  const questionSets = Object.fromEntries(levels.map(level => [level, []]));
  for (const row of rows) {
    const number = Number(cell(row, 'A'));
    const base = cognitive.find(question => question.sourceNumber === number);
    const key = baselineScoring.cognitive.items.find(item => item.sourceNumber === number);
    assert.ok(base && key?.approvedAnswerOptionId);
    const skill = cell(row, 'B');
    const skillId = base.skillId;
    const stemBlock = doc.blocks.find(block => new RegExp(`^Vitalis\\s+Question ${number}\\s+`).test(block.text));
    assert.ok(stemBlock);
    assert.equal(doc.blocks[stemBlock.index + 1].text.replace(/^Proposed mission\s+/, ''), mission.title);
    assert.equal(doc.blocks[stemBlock.index + 2].images.length, 1);
    const sourceImage = doc.blocks[stemBlock.index + 2].images[0];
    const sourceImagePath = `private/source-images/vitalis-q${pad(number)}.png`;
    fs.mkdirSync(path.join(output, 'private/source-images'), { recursive: true });
    const imageBytes = fs.readFileSync(path.join(sourceImagesDirectory, sourceImage));
    fs.writeFileSync(path.join(output, sourceImagePath), imageBytes);
    sourceAssets.push({ path: sourceImagePath, visibility: 'source_reference_only', sourceFilename: sourceImage,
      sourceQuestionNumber: number, sha256: crypto.createHash('sha256').update(imageBytes).digest('hex') });
    const commonQuestion = { sectorId: 'vitalis', missionId: mission.id, sourcePreAssessmentQuestionNumber: number, skillId, skillLabel: skill };
    const beginning = { ...commonQuestion, ...parseBeginning(row, `vitalis-q${pad(number)}-beginning`) };
    const intermediate = { ...structuredClone(base), ...commonQuestion,
      id: `vitalis-q${pad(number)}-intermediate`, sourceNumber: number,
      depthOfKnowledge: { level: null, scope: 'not_specified_in_source' },
      source: { id: 'baseline-questions', questionId: base.id,
        workbook: location(row, 'F'), reuse: 'original_preassessment_question_with_all_shared_stimuli_and_options' } };
    // Workbook field F may omit shared tables and figures: preserve the complete prior baseline conversion.
    assert.ok(normalize(cell(row, 'F')).includes(normalize(base.prompt)), `Intermediate source stem differs for Q${number}`);
    const advanced = { ...commonQuestion, ...parseAdvanced(row, `vitalis-q${pad(number)}-advanced`) };
    questionSets.beginning.push(beginning);
    questionSets.intermediate.push(intermediate);
    questionSets.advanced.push(advanced);
    const suppliedKey = cell(row, 'H');
    const correct = suppliedKey.match(/^Correct answer: ([A-D])\.\s*(.+)\nWhy:\s*([\s\S]+)$/);
    assert.ok(correct);
    assert.equal(beginning.options.find(option => option.id === correct[1])?.text, correct[2]);
    beginningKeys.push({ questionId: beginning.id, missionId: mission.id, correctOptionId: correct[1],
      reason: correct[3], source: { id: 'sector-workbook', ...location(row, 'H') } });
    intermediateKeys.push({ questionId: intermediate.id, missionId: mission.id, correctOptionId: key.approvedAnswerOptionId,
      reason: key.answerBasis, source: { id: 'baseline-corrected-key', questionId: key.questionId },
      legacyDocumentKeyUsed: false });
    const rubricText = cell(row, 'I');
    const rubricLines = lines(rubricText);
    assert.equal(rubricLines.length, 4);
    advancedRubrics.push({ questionId: advanced.id, missionId: mission.id,
      gradingMode: 'human_rubric_review', autoScoringEnabled: false,
      sourceCriteriaText: rubricText,
      responseCriteria: advanced.responses.map((response, index) => ({ responseId: response.id, criterion: rubricLines[index + 1].replace(/^Response \d+:\s*/, '') })),
      investigationEvidenceCriteria: rubricLines[3].replace(/^DOK 4 evidence:\s*/, ''),
      numericScale: null, maximumPoints: null, fixedRecommendationRequired: false,
      source: { id: 'sector-workbook', ...location(row, 'I') } });
    mapping.push({ sourcePreAssessmentQuestionNumber: number, missionId: mission.id,
      skillId, skillLabel: skill, workbookRow: row.number,
      questionIds: Object.fromEntries(levels.map(level => [level, `vitalis-q${pad(number)}-${level}`])),
      document: { blockIndex: stemBlock.index, imageBlockIndex: stemBlock.index + 2,
        pageAsListedInWorkbook: Number(cell(row, 'K')), referenceImage: sourceImagePath },
    });
  }
  const questionFiles = {};
  for (const level of levels) {
    const questionFile = `missions/${mission.id}/${level}.json`;
    questionFiles[level] = questionFile;
    const questions = questionSets[level];
    const stimulusIds = new Set(questions.flatMap(question => question.stimulusIds ?? []));
    const stimuli = level === 'intermediate' ? baseline.stimuli.filter(stimulus => stimulusIds.has(stimulus.id)).map(stimulus => {
      const result = structuredClone(stimulus);
      // The baseline introductions name the original item ranges; preserve them as source wording.
      return result;
    }) : [];
    const learnerContent = { ...common, missionId: mission.id, difficulty: level, difficultyLabel: levelNames[level],
      status: 'draft', questions, stimuli };
    assert.ok(!JSON.stringify(learnerContent).includes('"assetId"'), 'Unexpected intermediate image dependency: copy and remap the asset explicitly.');
    write(questionFile, addVitalisSupport(learnerContent, supportBank), 'student_content');
  }
  const missionFile = `missions/${mission.id}/mission.json`;
  write(missionFile, { ...common, id: mission.id, title: mission.title, titleStatus: 'proposed_in_source',
    missionType: mission.role, order: missionDefinitions.indexOf(mission) + 1, status: 'draft',
    questionFiles, skillIds: [...new Set(questionSets.beginning.map(question => question.skillId))],
    sourcePreAssessmentQuestionNumbers: mission.numbers,
    preMissionSprintId: null, sprintSourceStatus: 'not_defined_in_supplied_files',
    completion: { requiredDifficultyLevels: null, passingPercentage: null, attemptLimit: null,
      advancedRequiresInvestigationEvidence: true },
    source: { id: 'sector-workbook', ...location(reference, mission.column, 'Sector Reference') },
  }, 'student_content');
  missionCounts.push({ missionId: mission.id, title: mission.title, missionFile,
    activityCountPerDifficulty: rows.length, responseItemCount: rows.length * 4,
    sourcePreAssessmentQuestionNumbers: mission.numbers });
}

write('sector.json', {
  ...common, id: 'vitalis', name: 'Vitalis', label: 'Health and Wellness', status: 'draft',
  workforceConnection: cell(reference, 'B'),
  sourceSkillGroups: [
    { id: 'arithmetic-data-interpretation', title: 'Arithmetic & data interpretation', items: cell(reference, 'C').split(';').map(x => x.trim()), source: location(reference, 'C', 'Sector Reference') },
    { id: 'scientific-reasoning', title: 'Scientific reasoning', items: cell(reference, 'D').split(';').map(x => x.trim()), source: location(reference, 'D', 'Sector Reference') },
    { id: 'contextual-analytics', title: 'Business / contextual analytics', items: cell(reference, 'E').split(';').map(x => x.trim()), source: location(reference, 'E', 'Sector Reference') },
  ],
  difficultyLevels: levels.map((id, index) => ({ id, label: levelNames[id], order: index + 1 })),
  missions: missionCounts.map(mission => ({ id: mission.missionId, title: mission.title, file: mission.missionFile })),
  skillsFile: 'skills.json', resourcesFile: 'resources.json',
  completion: { requiredMissionIds: missionDefinitions.map(mission => mission.id), requiredDifficultyLevels: null },
}, 'student_content');
write('skills.json', { ...common, skills: mapping.sort((a, b) => a.sourcePreAssessmentQuestionNumber - b.sourcePreAssessmentQuestionNumber).map(item => ({
  id: item.skillId, name: item.skillLabel, sourcePreAssessmentQuestionNumber: item.sourcePreAssessmentQuestionNumber,
  missionId: item.missionId, questionIds: item.questionIds,
})) }, 'student_content');
write('resources.json', { ...common, resources: evidenceSourceNames.map((name, index) => ({
  id: ['vitalis-clinic-logs', 'vitalis-neighborhood-reports'][index], type: 'dataset', title: name,
  availability: 'teacher_provided_or_public_resource_to_be_selected', storage: null, url: null,
  requiredFor: 'advanced_investigations',
})), practiceDataNotice: 'Beginner data are practice examples supplied in the source workbook. They are not real patient records.' }, 'student_content');
write('private/beginning.scoring.json', { ...common, visibility: 'backend_only', difficulty: 'beginning',
  gradingMode: 'exact_option_match', answerKeyStatus: 'source_keys_verified_against_questions',
  pointsPerCorrectAnswer: 1, pointsPerIncorrectAnswer: 0, maximumPointsAcrossSector: 14,
  passThreshold: null, items: beginningKeys.sort((a, b) => a.questionId.localeCompare(b.questionId)),
}, 'backend_only');
write('private/intermediate.scoring.json', { ...common, visibility: 'backend_only', difficulty: 'intermediate',
  gradingMode: 'exact_option_match', answerKeyStatus: 'corrected_baseline_key',
  pointsPerCorrectAnswer: 1, pointsPerIncorrectAnswer: 0, maximumPointsAcrossSector: 14,
  passThreshold: null, items: intermediateKeys.sort((a, b) => a.questionId.localeCompare(b.questionId)),
}, 'backend_only');
write('private/advanced.rubrics.json', { ...common, visibility: 'backend_only', difficulty: 'advanced',
  gradingMode: 'human_rubric_review', autoScoringEnabled: false, maximumPointsAcrossSector: null,
  passThreshold: null, items: advancedRubrics.sort((a, b) => a.questionId.localeCompare(b.questionId)),
}, 'backend_only');
write('private/source-mapping.json', { ...common, visibility: 'source_reference_only',
  sources, documentDesignNote: doc.blocks[2].text,
  workbookDesignNotes: [cell(assessmentMap.rows.find(row => row.number === 3), 'A'), cell(assessmentMap.rows.find(row => row.number === 4), 'A')],
  mappings: mapping, referenceImages: sourceAssets,
}, 'source_reference_only');
write('manifest.json', { ...common, releaseId: 'v1-draft', status: 'draft', publishable: false,
  sourceScope: 'Vitalis rows only; other sectors intentionally not generated.',
  missionCount: 3, mappedSkillCount: 14, activityCount: 42, responseItemCount: 56,
  difficultyCounts: { beginning: { activities: 14, responses: 14 }, intermediate: { activities: 14, responses: 14 }, advanced: { activities: 14, responses: 28 } },
  sourcePreAssessmentQuestionNumbers: expectedNumbers, missions: missionCounts,
  pendingConfiguration: ['mission_completion_and_difficulty_policy', 'passing_thresholds_and_retries', 'advanced_data_sources', 'advanced_numeric_rubric_if_needed', 'sprint_content_if_required'],
  files: inventory, sourceReferenceAssets: sourceAssets,
}, 'deployment_inventory');
console.log(JSON.stringify({ output, missions: missionCounts, activities: 42, responseItems: 56, originalReferenceImages: sourceAssets.length }, null, 2));
