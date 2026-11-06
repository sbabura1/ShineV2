import { BookOpen, Lightbulb, LifeBuoy, MicOff, Pause, Play, Settings2, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { IdentityBeacon } from '../../prototype/components/CharacterBuilderGenerated';

export default function MissionBeacon({ identity, question }) {
  const id = useId();
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width: 761px)').matches);
  const [targetId, setTargetId] = useState(question.id);
  const [guidance, setGuidance] = useState(null);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 761px)');
    const change = event => setExpanded(event.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const targets = [{ ...question, label: question.type === 'investigation' ? 'Whole investigation' : 'Current question' },
    ...(question.responses || []).map((response, index) => ({ ...response, label: `Written response ${response.sourceNumber || index + 1}` }))];
  const target = targets.find(item => item.id === targetId) || targets[0];
  const support = target.support;
  const hint = typeof support?.hint === 'string' ? support.hint.trim() : '';
  const introduction = typeof support?.stuck?.introduction === 'string' ? support.stuck.introduction.trim() : '';
  const steps = Array.isArray(support?.stuck?.steps) ? support.stuck.steps.filter(step => typeof step === 'string' && step.trim()) : [];
  const hasStuckHelp = Boolean(introduction || steps.length);
  const guidanceId = `${id}-guidance`;
  const toggleGuidance = type => setGuidance(current => current === type ? null : type);

  return <aside className="mission-beacon" aria-labelledby={`${id}-title`}>
    <header><h2 id={`${id}-title`}>Beacon</h2><span>Mission guide</span></header>
    <IdentityBeacon className="mission-beacon-image" identity={identity} />
    <p className="mission-beacon-message">Take your time. Read the question, explore the data, and make your choice.</p>
    {targets.length > 1 && <label className="mission-beacon-target" htmlFor={`${id}-target`}>Guidance for
      <select id={`${id}-target`} value={target.id} onChange={event => { setTargetId(event.target.value); setGuidance(null); }}>
        {targets.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </label>}
    <p className="mission-beacon-unavailable" id={`${id}-availability`}>{hint || hasStuckHelp
      ? 'Choose a hint or step-by-step help for this question. Other Beacon tools are not available yet.'
      : 'Guidance is not available for this question yet.'}</p>
    <div className="mission-beacon-guidance-slot" aria-live="polite" aria-atomic="true">
      {guidance && <section className="mission-beacon-guidance" id={guidanceId} aria-labelledby={`${id}-guidance-title`}>
        <div className="mission-beacon-guidance-heading"><h3 id={`${id}-guidance-title`}>{guidance === 'hint' ? 'A hint to get started' : "Let's work through it"}</h3>
          <button type="button" onClick={() => setGuidance(null)} aria-label="Close guidance"><X size={16} aria-hidden="true" /></button>
        </div>
        {targets.length > 1 && <p className="mission-beacon-guidance-target">{target.label}</p>}
        {guidance === 'hint' ? <p>{hint}</p> : <>{introduction && <p>{introduction}</p>}
          {steps.length > 0 && <ol>{steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}</>}
      </section>}
    </div>
    <details className="mission-beacon-tools" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
    <summary>Assistance controls</summary>
    <div className="mission-beacon-controls" aria-describedby={`${id}-availability`}>
      <div className="mission-beacon-pair">
        <button type="button" disabled><Play size={16} aria-hidden="true" /> Video</button>
        <button type="button" disabled><BookOpen size={16} aria-hidden="true" /> Resources</button>
      </div>
      <button type="button" disabled={!hint} onClick={() => toggleGuidance('hint')} aria-expanded={guidance === 'hint'} aria-controls={guidance ? guidanceId : undefined}><Lightbulb size={16} aria-hidden="true" /> Give me a hint</button>
      <button type="button" disabled={!hasStuckHelp} onClick={() => toggleGuidance('stuck')} aria-expanded={guidance === 'stuck'} aria-controls={guidance ? guidanceId : undefined}><LifeBuoy size={16} aria-hidden="true" /> Help me, I'm stuck</button>
      <button type="button" disabled><MicOff size={16} aria-hidden="true" /> Voice off</button>
      <button type="button" disabled><Settings2 size={16} aria-hidden="true" /> Voice settings</button>
      <button type="button" disabled><Pause size={16} aria-hidden="true" /> Animation off</button>
      <button type="button" disabled><BookOpen size={16} aria-hidden="true" /> Quick concept guide</button>
    </div>
    </details>
  </aside>;
}
