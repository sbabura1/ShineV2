import { ArrowRight, LockKeyhole } from 'lucide-react';

export default function SectorGrid({ sectors, onSector }) {
  return (
    <>
      <div className="section-heading">
        <div><span className="eyebrow">Explore the network</span><h2>14 sectors of Scalaris</h2></div>
        <p>Every context changes the problem, not the expectation to reason from evidence.</p>
      </div>
      <div className="sector-grid">
        {sectors.map((sector, index) => (
          <button className={`sector-card ${index > 3 ? 'locked' : ''}`} key={sector.id} onClick={() => onSector(sector.id)}>
            <span className="sector-icon" style={{ color: sector.color }}>{sector.icon}</span>
            <span className="sector-index">{String(index + 1).padStart(2, '0')}</span>
            <h3>{sector.name}</h3><b>{sector.label}</b><p>{sector.description}</p>
            <footer><span>{index > 3 ? <><LockKeyhole size={12} /> Clearance required</> : 'Open sector'}</span><ArrowRight size={16} /></footer>
          </button>
        ))}
      </div>
    </>
  );
}
