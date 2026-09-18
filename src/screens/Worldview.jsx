import { ArrowRight, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import PageIntro from '../components/ui/PageIntro';

const concepts = [
  ['01', 'Identity', 'A professional avatar that grows through demonstrated reasoning.'],
  ['02', 'Data Lab', 'Every mission starts with anomalies, uncertainty, and pattern detection.'],
  ['03', 'Missions', 'Connected problems requiring evidence and a consequential decision.'],
];

export default function Worldview({ onEnter }) {
  return (
    <main className="page">
      <PageIntro eyebrow="System overview" title="A world built around better decisions" copy="Scalaris turns quantitative reasoning into a context-rich professional practice." />
      <div className="concept-grid">
        {concepts.map(([number, title, copy]) => (
          <article className="concept-card" key={title}><span>{number}</span><h2>{title}</h2><p>{copy}</p><ChevronRight size={18} /></article>
        ))}
      </div>
      <section className="worldview-banner">
        <div><span className="eyebrow">The Scalaris loop</span><h2>Inspect <i>&rarr;</i> question <i>&rarr;</i> analyze <i>&rarr;</i> explain</h2><p>Students move from calculation to sector problems to integrated Nexus missions.</p></div>
        <Button onClick={onEnter}>Build my identity <ArrowRight size={17} /></Button>
      </section>
    </main>
  );
}
