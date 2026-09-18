export default function ChoiceStep({ title, copy, options, selected, setSelected }) {
  return (
    <div className="choice-step">
      <span className="eyebrow">Decision point</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <div className="answer-list">
        {options.map((option) => (
          <button className={selected === option ? 'selected' : ''} onClick={() => setSelected(option)} key={option}>
            {option}<span>{selected === option ? 'Selected' : 'Choose'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
