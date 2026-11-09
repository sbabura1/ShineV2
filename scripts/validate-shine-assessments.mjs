import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'content/assessments/v1');
const read = file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
const manifest = read('manifest.json');
const allQuestionIds = new Set();
const allAssets = new Set();
const sourceFile = process.argv.find(x => x.endsWith('shine-assessments-extracted.json'));
const source = sourceFile ? JSON.parse(fs.readFileSync(sourceFile, 'utf8').replace(/^\uFEFF/, '')) : null;
const unnumber = value => value.trim().replace(/^\d+\.\s*/, '');
const forbidden = new Set(['correctOptionId', 'correctOptionIds', 'correctAnswer', 'answerKey', 'approvedAnswerOptionId', 'suggestedAnswerOptionId', 'sourceAnswerOptionId', 'suggestionBasis', 'answerBasis']);
const types = new Set(['likert', 'single_choice', 'multiple_choice', 'text', 'long_text', 'integer', 'email', 'phone']);

function visit(value, callback) {
  if (!value || typeof value !== 'object') return;
  callback(value);
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach(x => visit(x, callback));
    else visit(child, callback);
  }
}

function validateAssessment(assessment, scoring, entry, questionIds = new Set()) {
  assert.equal(assessment.assessmentId, entry.assessmentId);
  assert.equal(assessment.contentVersion, manifest.releaseId);
  assert.equal(assessment.status, 'draft');
  assert.equal(scoring.assessmentId, assessment.assessmentId);
  assert.equal(scoring.contentVersion, assessment.contentVersion);
  assert.equal(scoring.visibility, 'backend_only');
  assert.equal(scoring.scoringEnabled, assessment.assessmentId === 'baseline');
  assert.equal(scoring.sourceKey.usedForScoring, false);
  const assetIds = new Set(assessment.assets.map(asset => asset.id));
  assert.equal(assetIds.size, assessment.assets.length, 'Duplicate asset ID');
  const stimulusIds = new Set(assessment.stimuli.map(stimulus => stimulus.id));
  assert.equal(stimulusIds.size, assessment.stimuli.length, 'Duplicate stimulus ID');
  const scaleIds = new Set(assessment.scales.map(scale => scale.id));
  const questions = assessment.sections.flatMap(section => section.questions);
  assert.equal(questions.length, entry.totalQuestions);
  assert.equal(assessment.participantFields.length, entry.participantFieldCount);
  assert.deepEqual(Object.fromEntries(assessment.sections.map(section => [section.id, section.questions.length])), entry.sectionCounts);
  assert.equal(assessment.assets.length, entry.assetCount);
  assert.equal(new Set(assessment.sections.map(section => section.id)).size, assessment.sections.length);
  const referencedAssets = new Set();
  visit(assessment, value => {
    for (const key of Object.keys(value)) assert.ok(!forbidden.has(key), `Scoring information leaked into questions: ${key}`);
    if (value.type === 'image') {
      assert.ok(assetIds.has(value.assetId), `Missing asset ${value.assetId}`);
      assert.ok(value.alt?.trim(), 'Missing image description');
      referencedAssets.add(value.assetId);
    }
    if (value.type === 'table') {
      assert.ok(value.rows.length > 0);
      for (const row of value.rows) {
        assert.ok(Array.isArray(row) && row.every(cell => typeof cell === 'string'));
      }
      if (source) assert.deepEqual(value.rows, source.blocks[value.source.blockIndex].rows.map(row => row.map(x => x.trim())));
    }
  });
  assert.deepEqual([...referencedAssets].sort(), [...assetIds].sort());
  for (const section of assessment.sections) {
    section.questions.forEach((question, index) => {
      assert.equal(question.sourceNumber, index + 1);
      assert.ok(!questionIds.has(question.id), `Duplicate question ${question.id}`);
      questionIds.add(question.id);
      assert.ok(types.has(question.type), `Unknown question type ${question.type}`);
      assert.ok(question.prompt.trim());
      assert.equal(question.required, null, 'Requiredness must remain undecided in this source draft');
      if (source) {
        const block = source.blocks[question.source.blockIndex];
        const original = question.source.tableRow ? block.rows[question.source.tableRow - 1][0] : block.text;
        assert.equal(question.prompt, unnumber(original), `Source wording mismatch: ${question.id}`);
      }
      if (question.type === 'likert') assert.ok(scaleIds.has(question.scaleId));
      if (['single_choice', 'multiple_choice'].includes(question.type)) {
        assert.ok(question.options.length >= 2, `Missing options: ${question.id}`);
        assert.equal(new Set(question.options.map(option => option.id)).size, question.options.length);
        for (const option of question.options) {
          assert.ok(option.text?.trim() || option.content?.length, `Empty option: ${question.id}/${option.id}`);
          if (source && option.source) {
            const block = source.blocks[option.source.blockIndex];
            assert.equal(option.text, block.text.trim().replace(/^[A-E]\.\s*/, ''));
          }
        }
      }
      for (const id of question.stimulusIds ?? []) assert.ok(stimulusIds.has(id), `Missing stimulus ${id}`);
    });
  }
  for (const asset of assessment.assets) {
    assert.ok(asset.path.startsWith('assets/') && !asset.path.includes('..'));
    const file = path.join(directory, asset.path);
    assert.ok(fs.existsSync(file), `Missing file ${asset.path}`);
    assert.ok(fs.statSync(file).size > 0);
    assert.match(fs.readFileSync(file).subarray(0, 6).toString('ascii'), /^GIF8[79]a$/);
    allAssets.add(asset.id);
  }
  const cognitive = assessment.sections.find(section => section.id === 'cognitive').questions;
  assert.equal(scoring.cognitive.questionCount, cognitive.length);
  assert.equal(scoring.cognitive.items.length, cognitive.length);
  scoring.cognitive.items.forEach((item, index) => {
    assert.equal(item.questionId, cognitive[index].id);
    assert.equal(item.sourceNumber, index + 1);
    if (assessment.assessmentId === 'baseline') {
      assert.ok(item.approvedAnswerOptionId, 'Missing baseline answer');
      assert.equal(item.answerAuthority, 'user_directed_corrected_key');
    } else assert.equal(item.approvedAnswerOptionId, null);
    for (const answer of [item.sourceAnswerOptionId, item.suggestedAnswerOptionId, item.approvedAnswerOptionId].filter(Boolean)) {
      assert.ok(cognitive[index].options.some(option => option.id === answer), `Unknown scoring option ${item.questionId}/${answer}`);
    }
    if (source) assert.equal(item.sourceAnswerOptionId, source.blocks[861].rows[index + 1]?.[assessment.source.assessmentNumber] ?? null);
  });
  assert.deepEqual(scoring.cognitive.performanceBands, []);
  assert.equal(scoring.attitudes.aggregateScoringEnabled, false);
  assert.deepEqual(scoring.attitudes.approvedReverseCodedQuestionIds, []);
  // Each graph question has explicit shared context or image-based option content.
  for (const question of cognitive.filter(q => ['bar_graph_reading', 'line_graph_reading', 'line_graph_interpretation'].includes(q.skillId))) {
    assert.ok(question.stimulusIds.length > 0);
  }
  if (assessment.assessmentId === 'baseline') {
    assert.equal(scoring.cognitive.approvedMaximumPoints, 28);
    assert.equal(scoring.cognitive.pointsPerCorrectAnswer, 1);
    assert.equal(scoring.cognitive.pointsPerIncorrectAnswer, 0);
    // Exercise the configured key: complete, incorrect, half-correct and empty attempts.
    const grade = responses => {
      const correct = scoring.cognitive.items.filter(item => responses[item.questionId] === item.approvedAnswerOptionId).length;
      return { score: correct * scoring.cognitive.pointsPerCorrectAnswer, percentage: correct / 28 * 100 };
    };
    const perfect = Object.fromEntries(scoring.cognitive.items.map(item => [item.questionId, item.approvedAnswerOptionId]));
    const wrong = Object.fromEntries(scoring.cognitive.items.map((item, index) => [item.questionId,
      cognitive[index].options.find(option => option.id !== item.approvedAnswerOptionId).id]));
    const half = Object.fromEntries(scoring.cognitive.items.map((item, index) => [item.questionId,
      index < 14 ? item.approvedAnswerOptionId : wrong[item.questionId]]));
    assert.deepEqual(grade(perfect), { score: 28, percentage: 100 });
    assert.deepEqual(grade(wrong), { score: 0, percentage: 0 });
    assert.deepEqual(grade(half), { score: 14, percentage: 50 });
    assert.deepEqual(grade({}), { score: 0, percentage: 0 });
    assert.equal(cognitive[6].options.length, 5);
    assert.equal(cognitive[7].options.length, 5);
    assert.equal(cognitive[8].options[0].content.filter(x => x.type === 'image').length, 2);
    assert.equal(cognitive[23].content[0].rows.length, 7);
    assert.equal(cognitive[25].stimulusIds.length, 1);
    const demographics = assessment.sections.find(section => section.id === 'demographics').questions;
    assert.equal(demographics[12].options.length, 77);
    for (const question of [demographics[13], demographics[14]]) {
      assert.equal(question.options.length, 12);
      assert.ok(question.options.some(option => option.text === 'C+'));
      assert.ok(question.options.some(option => option.text === 'C'));
    }
  }
  return questions.length;
}

assert.equal(manifest.publishable, false);
assert.equal(manifest.status, 'draft');
assert.ok(!manifest.publicationBlockers.includes('baseline-key-outdated'));
if (source) assert.equal(source.sourceSha256, manifest.sourceSha256);
let total = 0;
for (const entry of manifest.assessments) {
  const assessment = read(entry.questionFile);
  const scoring = read(entry.privateScoringFile);
  total += validateAssessment(assessment, scoring, entry, allQuestionIds);
  // Prove that validation rejects common content release failures.
  const withLeak = structuredClone(assessment);
  withLeak.sections[0].questions[0].correctAnswer = 'should-not-be-public';
  assert.throws(() => validateAssessment(withLeak, scoring, entry), /Scoring information leaked/);
  const duplicate = structuredClone(assessment);
  duplicate.sections[0].questions[1].id = duplicate.sections[0].questions[0].id;
  assert.throws(() => validateAssessment(duplicate, scoring, entry), /Duplicate question/);
  const brokenReference = structuredClone(assessment);
  brokenReference.sections.find(section => section.id === 'cognitive').questions[0].stimulusIds = ['missing'];
  assert.throws(() => validateAssessment(brokenReference, scoring, entry), /Missing stimulus/);
  const badKey = structuredClone(scoring);
  badKey.cognitive.items[0].sourceAnswerOptionId = 'Z';
  assert.throws(() => validateAssessment(assessment, badKey, entry), /Unknown scoring option/);
  console.log(`PASS ${entry.assessmentId}: ${entry.totalQuestions} questions, ${entry.assetCount} images; invalid-release checks passed.`);
}
assert.equal(total, 220);
assert.equal(total, manifest.totalQuestions);
assert.equal(allAssets.size, 19);
assert.equal(allAssets.size, manifest.assetCount);
console.log(`PASS total: ${total} questions, ${allAssets.size} original images${source ? ', source text/tables/options/key reconciled' : ''}.`);
if (process.argv.includes('--publish')) {
  console.error('PUBLICATION BLOCKED: unresolved administration/attitude decisions and post-assessment revisions. Baseline cognitive scoring is configured.');
  process.exitCode = 1;
} else {
  console.log('Content integrity passed. Remaining publication decisions are listed in manifest.json and README.md.');
}
