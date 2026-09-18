import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import { getPrimaryRole } from '../utils/sector';
import Button from '../components/ui/Button';

const skills = ['Rates & ratios', 'Percent change', 'Data visualization', 'Comparative reasoning', 'Risk & probability'];

export default function SectorHub({ sector, onBack, onMission, onSprint }) {
  return (
    <main className="page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to Nexus</button>
      <section className="sector-hero" style={{ '--sector-color': sector.color }}>
        <span className="sector-hero-icon">{sector.icon}</span>
        <span className="eyebrow">{sector.name} sector</span>
        <h1>{sector.label}</h1>
        <p>{sector.description} Step into the role of <b>{getPrimaryRole(sector.roles)}</b> and make sense of the signal.</p>
        <div className="button-row">
          <Button onClick={onMission}>Start mission <ArrowRight size={17} /></Button>
          <Button variant="gold" onClick={onSprint}><BarChart3 size={17} /> Shine Sprint checkup</Button>
        </div>
      </section>
      <div className="skill-strip"><span className="eyebrow">Skills in this sector</span>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
    </main>
  );
}
