import React, { useEffect, useRef, useState } from 'react';
import { dissolveLanding } from './landingPetals';
import NexusBackground from './NexusBackground';
import './landing-transition.css';

export default function Landing({ onEnter, isLoading = false }) {
  const root = useRef(null);
  const transition = useRef(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => () => transition.current?.cancel(), []);

  const enterNexus = () => {
    if (isLoading || transition.current) return;
    setEntering(true);
    const effect = dissolveLanding(root.current);
    transition.current = effect;
    effect.finished.then(({ cancelled }) => {
      if (cancelled) return;
      onEnter();
    });
  };

  return (
    <main ref={root} className={`hero landing-entry${entering ? ' landing-entry--leaving' : ''}`} id="main-content" aria-busy={entering || undefined}>
      <NexusBackground />
      <div className="hero-inner">
        <div className="eyebrow"><span data-petal-text>Quantitative Reasoning Simulation World</span></div>
        <h1><span className="petal-title-source" data-petal-text>SCALARIS</span></h1>
        <div className="nexus-word"><span className="petal-title-source" data-petal-text>THE NEXUS</span></div>
        <p className="tagline"><span data-petal-text>Enter a world where data shapes decisions. Build an identity, explore professional sectors, investigate messy data, apply quantitative reasoning, and make the call.</span></p>
        <div className="cta-row">
          <button className="btn" type="button" onClick={enterNexus} disabled={isLoading || entering} data-petal-surface>
            <span data-petal-text>{isLoading ? 'Checking session…' : 'Enter the Nexus →'}</span>
          </button>
        </div>
      </div>
      <span className="landing-entry-status" role="status">{entering ? 'Opening sign in…' : ''}</span>
    </main>
  );
}
