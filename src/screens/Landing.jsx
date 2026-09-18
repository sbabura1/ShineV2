import { ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Landing({ onEnter, onWorldview }) {
  return (
    <main className="landing">
      <div className="landing-grid" />
      <div className="landing-copy">
        <span className="eyebrow">Quantitative reasoning simulation world</span>
        <h1>SCALARIS</h1>
        <div className="landing-subtitle"><span /> The Nexus</div>
        <p>Data shapes every decision. Build your professional identity, investigate messy evidence, and make the call.</p>
        <div className="button-row">
          <Button onClick={onEnter}>Enter the Nexus <ArrowRight size={17} /></Button>
          <Button variant="ghost" onClick={onWorldview}>View world model</Button>
        </div>
        <div className="landing-note"><span className="pulse-dot" /> 14 sectors &middot; 01 active mission &middot; beacon online</div>
      </div>
      <div className="landing-orbit orbit-a" /><div className="landing-orbit orbit-b" /><div className="landing-core">SX<span>&infin;</span></div>
    </main>
  );
}
