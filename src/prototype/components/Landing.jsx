import React from 'react';

export default function Landing({ onEnter, isLoading = false }) {
  return (
    <main className="hero" id="main-content">
      <div className="hero-inner">
        <div className="eyebrow">Quantitative Reasoning Simulation World</div>
        <h1>SCALARIS</h1>
        <div className="nexus-word">THE NEXUS</div>
        <p className="tagline">Enter a world where data shapes decisions. Build an identity, explore professional sectors, investigate messy data, apply quantitative reasoning, and make the call.</p>
        <div className="cta-row">
          <button className="btn" type="button" onClick={onEnter} disabled={isLoading}>
            {isLoading ? 'Checking session…' : 'Enter the Nexus →'}
          </button>
        </div>
      </div>
    </main>
  );
}
