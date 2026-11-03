import { useEffect, useRef, useState } from 'react';
import useRun from '../../api/useRun';
import Question from './Question';
import ContentBlocks from './ContentBlocks';

function Evidence({ question, value = {}, onChange, disabled }) {
  const set = (key, next) => onChange({ ...value, [key]: next });
  const textFields = [['initialWork', 'Initial analysis'], ['freshDataTest', 'Fresh-data test'], ['testResult', 'Test result'],
    ['revisionOrRetainedChoice', 'Revision or reason for keeping your choice'], ['limit', 'Limitation']];
  return <fieldset className="remote-evidence" disabled={disabled}><legend>Investigation work</legend>
    <p>Keep your work from all sessions and both sources. Your written responses and evidence will be reviewed together.</p>
    {Array.from({ length: question.investigation.sessionCount }, (_, index) => <label key={`session-${index}`}>Session {index + 1}
      <textarea rows={3} maxLength={1000} value={value.sessions?.[index] || ''} onChange={event => {
        const sessions = Array.from({ length: question.investigation.sessionCount }, (_, i) => value.sessions?.[i] || '');
        sessions[index] = event.target.value; set('sessions', sessions);
      }} /></label>)}
    {Array.from({ length: question.investigation.comparisonOptionCount }, (_, index) => <label key={`option-${index}`}>Option {index + 1} compared
      <textarea rows={2} maxLength={1000} value={value.optionsCompared?.[index] || ''} onChange={event => {
        const options = Array.from({ length: question.investigation.comparisonOptionCount }, (_, i) => value.optionsCompared?.[i] || '');
        options[index] = event.target.value; set('optionsCompared', options);
      }} /></label>)}
    {question.investigation.sourceIds.map((resourceId, index) => {
      const sourceLine = question.instructions?.find(line => line.startsWith('Use:'))?.replace(/^Use:\s*/, '').replace(/\.$/, '');
      const label = sourceLine?.split(';')[index]?.trim() || `Source ${index + 1}`;
      return <label key={resourceId}>Source reference: {label}<textarea rows={2} maxLength={1000}
        value={value.sources?.find(source => source.resourceId === resourceId)?.reference || ''} onChange={event => {
          const sources = question.investigation.sourceIds.map(id => ({ resourceId: id, reference: value.sources?.find(source => source.resourceId === id)?.reference || '' }));
          sources[index].reference = event.target.value; set('sources', sources);
        }} /></label>;
    })}
    {textFields.map(([key, label]) => <label key={key}>{label}<textarea rows={3} maxLength={2000} value={value[key] || ''} onChange={event => set(key, event.target.value)} /></label>)}
  </fieldset>;
}

export default function LearningRun({ kind, displayTitle, startPath, existingRunId, restart, previousRunId, onBack, onProgress, onGuard, nextMission, onNextMission, onRestart, sectorCompleted, onNexus }) {
  const state = useRun({ kind, startPath, existingRunId, restart, previousRunId, onProgress });
  const { data, error, saveState, submitting, queue, flush, leave, submit, reload } = state;
  const [page, setPage] = useState(0);
  const initialized = useRef(null);
  useEffect(() => { onGuard?.(flush); return () => onGuard?.(null); }, [flush, onGuard]);
  useEffect(() => {
    if (!data || initialized.current === data.run.runId) return;
    initialized.current = data.run.runId;
    const sections = data.definition.sections;
    const index = sections ? sections.findIndex(section => section.id === data.run.currentStep)
      : data.definition.questions.findIndex(question => question.id === data.run.currentQuestionId || question.responses?.some(response => response.id === data.run.currentQuestionId));
    setPage(Math.max(0, index));
  }, [data]);
  if (!data) return <main className="page"><section className="card remote-loading" role={error ? 'alert' : 'status'}>
    <h1>{error ? 'Unable to open your saved work' : 'Opening your saved work…'}</h1>
    {error && <><p>{error.message}</p><button type="button" className="btn" onClick={reload}>Retry</button></>}
    <button type="button" className="btn secondary" onClick={onBack}>Back</button>
  </section></main>;
  const { run, definition, answers } = data;
  const completed = run.status === 'COMPLETED';
  const pendingReview = run.status === 'PENDING_REVIEW';
  const editable = ['IN_PROGRESS', 'CHANGES_REQUESTED'].includes(run.status) && saveState !== 'conflict';
  const sections = definition.sections;
  const totalPages = sections ? sections.length : definition.questions.length;
  const current = sections ? sections[page] : definition.questions[page];
  const pageQuestions = sections ? current.questions : [current];
  const statusLabels = { saved: 'All changes saved', unsaved: 'Unsaved changes', saving: 'Saving…', error: 'Changes not saved', conflict: 'Saved work changed in another session' };
  const answer = (id, value) => queue({ answers: { [id]: value } });
  const changePage = next => {
    setPage(next);
    if (editable) queue(sections ? { currentStep: sections[next].id } : { currentQuestionId: definition.questions[next].id });
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  return <main className="page remote-run">
    <div className="remote-run-toolbar"><button type="button" className="btn secondary" onClick={() => leave(onBack)}>← Save and return</button>
      {editable && <span role="status" aria-live="polite" className={`save-indicator save-${saveState}`}>{statusLabels[saveState]}</span>}</div>
    <header className="section-title"><div><div className="eyebrow">{kind === 'ASSESSMENT' ? 'Pre-assessment' : `${definition.sectorId} · ${definition.difficultyLabel}`}</div>
      <h1>{definition.title || displayTitle || 'Mission'}</h1><p>{sections ? `Part ${page + 1} of ${totalPages}` : `Activity ${page + 1} of ${totalPages}`}</p></div></header>
    {error && <section className="callout remote-error" role="alert"><p>{error.message}</p>
      {saveState === 'error' && <button type="button" className="btn" onClick={() => flush().catch(() => {})}>Retry save</button>}
      {saveState === 'conflict' && <button type="button" className="btn" onClick={reload}>Reload latest saved work</button>}
    </section>}
    {(completed || pendingReview) && <section className="card remote-result" aria-label="Submission result">
      <h2>{completed ? 'Completed' : 'Submitted for review'}</h2>
      {run.result?.maximumScore != null && <p className="remote-score">{run.result.score} / {run.result.maximumScore} <span>{run.result.percentage}%</span></p>}
      {pendingReview && <p>Your responses and investigation work are saved. Completion will be updated after review.</p>}
      {run.result?.feedback && <p>{run.result.feedback}</p>}
      <div className="cta-row">
        {kind === 'MISSION' && onRestart && <button type="button" className="btn secondary" onClick={() => leave(() => onRestart(run.runId))}>Start again</button>}
        {completed && kind === 'MISSION' && nextMission && !sectorCompleted && <button type="button" className="btn" onClick={() => leave(() => onNextMission(nextMission.id))}>Go to next mission</button>}
        {sectorCompleted && <><span className="tag">Sector completed</span><button type="button" className="btn" onClick={() => leave(onNexus)}>Back to the Nexus</button><p>More sectors are coming soon.</p></>}
      </div>
    </section>}
    {run.status === 'CHANGES_REQUESTED' && <section className="callout"><h2>Changes requested</h2><p>{run.result?.feedback || 'Review your investigation and submit the updated work.'}</p></section>}
    {sections && <nav className="remote-section-nav" aria-label="Assessment parts">{sections.map((section, index) => <button type="button" key={section.id} className={`btn ${page === index ? '' : 'secondary'}`} aria-current={page === index ? 'step' : undefined} onClick={() => changePage(index)}>{section.title}</button>)}</nav>}
    {sections && page === 0 && <section className="card remote-introduction">
      {definition.instructions.map((instruction, index) => <p key={index}>{instruction}</p>)}
      <p>You can save and return before submitting. Your full baseline can be submitted once.</p>
      <div className="form-row">{definition.participantFields.map(field => <Question key={field.id} question={{ ...field, id: `participant:${field.id}`, prompt: field.label }} value={answers[`participant:${field.id}`]} disabled={!editable} onChange={value => answer(`participant:${field.id}`, value)} />)}</div>
    </section>}
    {sections && <section className="remote-section-intro"><h2>{current.title}</h2>{current.instructions.map((instruction, index) => <p key={index}>{instruction}</p>)}</section>}
    {pageQuestions.map(question => <section className="card remote-question-card" key={question.id}>
      {(question.stimulusIds || []).map(id => <ContentBlocks key={id} runId={run.runId} blocks={definition.stimuli.find(stimulus => stimulus.id === id)?.content} />)}
      {question.type === 'investigation' ? <>
        <h2>{question.prompt}</h2>{question.instructions.map((instruction, index) => <p key={index}>{instruction}</p>)}
        {question.responses.map(response => <Question key={response.id} question={response} value={answers[response.id]} disabled={!editable} onChange={value => answer(response.id, value)} runId={run.runId} />)}
        <Evidence question={question} value={data.investigations[question.id]} disabled={!editable} onChange={value => queue({ investigations: { [question.id]: value } })} />
      </> : <Question question={question} value={answers[question.id]} disabled={!editable} onChange={value => answer(question.id, value)}
        scale={definition.scales?.find(scale => scale.id === question.scaleId)} answers={answers} onAnswer={answer} runId={run.runId} />}
    </section>)}
    <footer className="remote-run-toolbar"><button type="button" className="btn secondary" disabled={page === 0} onClick={() => changePage(page - 1)}>Previous</button>
      {page < totalPages - 1 ? <button type="button" className="btn" onClick={() => changePage(page + 1)}>Continue</button> : editable && <button type="button" className="btn" disabled={submitting} onClick={submit}>{submitting ? 'Submitting…' : kind === 'ASSESSMENT' ? 'Submit full baseline' : 'Submit mission'}</button>}
    </footer>
  </main>;
}
