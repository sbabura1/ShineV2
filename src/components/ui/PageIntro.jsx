export default function PageIntro({ eyebrow, title, copy, action }) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  );
}
