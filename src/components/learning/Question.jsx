import ContentBlocks from './ContentBlocks';

export default function Question({ question, value, onChange, scale, runId, disabled = false, answers, onAnswer }) {
  const id = `question-${question.id}`;
  const followUp = question.followUp;
  return <fieldset className="remote-question" disabled={disabled}>
    <legend>{question.sourceNumber ? `${question.sourceNumber}. ` : ''}{question.prompt || question.label}</legend>
    <ContentBlocks blocks={question.content} runId={runId} />
    {['single_choice', 'multiple_choice'].includes(question.type) && <div className={question.options.length > 12 ? 'remote-option-list' : 'mc-grid'}>
      {question.options.map(option => {
        const checked = question.type === 'multiple_choice' ? (value || []).includes(option.id) : value === option.id;
        return <label key={option.id} className={`mc-btn remote-choice ${checked ? 'selected' : ''}`}>
          <input type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'} name={id} value={option.id} checked={checked}
            onChange={() => onChange(question.type === 'multiple_choice' ? (checked ? value.filter(item => item !== option.id) : [...(value || []), option.id]) : option.id)} />
          <span>{option.label && <strong>{option.label}. </strong>}{option.text}<ContentBlocks blocks={option.content} runId={runId} /></span>
        </label>;
      })}
    </div>}
    {question.type === 'likert' && <div className="remote-likert">{scale.options.map(option => <label key={option.value} className={`remote-scale-option ${value === option.value ? 'selected' : ''}`}>
      <input type="radio" name={id} checked={value === option.value} onChange={() => onChange(option.value)} />
      <strong>{option.value}</strong><span>{option.label}</span>
    </label>)}</div>}
    {question.type === 'long_text' && <textarea id={id} aria-label={question.prompt} rows={5} maxLength={6000} value={value ?? ''} onChange={event => onChange(event.target.value)} />}
    {['text', 'email', 'phone', 'integer', 'date'].includes(question.type) && <input id={id} aria-label={question.prompt || question.label}
      type={question.type === 'integer' ? 'number' : question.type === 'phone' ? 'tel' : question.type} value={value ?? ''}
      onChange={event => onChange(question.type === 'integer' ? (event.target.value === '' ? null : Number(event.target.value)) : event.target.value)} />}
    {followUp && (value || []).includes(followUp.whenOptionId) && <label className="remote-follow-up">{followUp.field.prompt}
      <input value={answers?.[`${question.id}:${followUp.field.id}`] ?? ''} onChange={event => onAnswer(`${question.id}:${followUp.field.id}`, event.target.value)} disabled={disabled} />
    </label>}
  </fieldset>;
}
