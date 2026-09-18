import { ArrowRight, Sparkles } from 'lucide-react';

export default function NexusSidebar({ identity, currentSector, onMission }) {
  return (
    <aside className="nexus-sidebar">
      <section className="beacon-card">
        <div className="beacon-icon"><Sparkles size={20} /></div>
        <div>
          <span className="eyebrow">Beacon online</span>
          <p>&ldquo;Welcome back, {identity.name.split(' ')[0]}. The network is waiting.&rdquo;</p>
          <button onClick={onMission}>Ask for a hint <ArrowRight size={14} /></button>
        </div>
      </section>
      <section className="stats-card">
        <span className="eyebrow">Identity snapshot</span>
        <h2>{identity.role}</h2>
        <div className="stats">
          <div><b>07</b><small>NEXUS LEVEL</small></div>
          <div><b>620</b><small>REPUTATION</small></div>
          <div><b>04</b><small>SECTORS OPEN</small></div>
        </div>
        <div className="progress-label"><span>Next rank: Senior Analyst</span><b>68%</b></div>
        <div className="progress"><span /></div>
        <div className="current-sector">Current sector <b style={{ color: currentSector.color }}>{currentSector.name}</b></div>
      </section>
    </aside>
  );
}
