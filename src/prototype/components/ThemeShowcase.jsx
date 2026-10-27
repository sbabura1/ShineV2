import { Check, Crown, ShieldCheck, Sparkles } from 'lucide-react';

export default function ThemeShowcase({ onBack, onMission }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  });
  return <main className="theme-showcase" data-ui>
    <nav className="showcase-nav" aria-label="Theme demonstration navigation">
      <div className="showcase-wordmark"><span aria-hidden="true">S</span> Scalaris</div>
      <div className="showcase-nav-links"><button type="button" onClick={() => scrollTo('showcase-features')}>Capabilities</button><button type="button" onClick={() => scrollTo('showcase-tier')}>Program Tier</button><button type="button" onClick={() => scrollTo('showcase-controls')}>Controls</button></div>
      <button type="button" className="btn secondary" onClick={onBack}>Back to Nexus</button>
    </nav>

    <header className="showcase-hero">
      <div>
        <p className="showcase-kicker">Scalaris Interface System</p>
        <h1>Evidence deserves a considered interface.</h1>
        <p>Deep navy surfaces establish hierarchy without competing with mission data. Cyan carries navigation and evidence, while purple, gold, and green retain their original supporting roles.</p>
        <div className="theme-demo-actions"><button type="button" className="btn accent" onClick={onMission}>Open Priority Mission</button><button type="button" className="btn secondary" onClick={onBack}>Review the Nexus</button></div>
      </div>
      <aside className="showcase-brief" aria-label="Active evidence brief">
        <span className="theme-badge premium"><Crown size={14} aria-hidden="true" /> Featured Brief</span>
        <h2>Vitalis Capacity Review</h2>
        <dl><div><dt>Evidence confidence</dt><dd>87%</dd></div><div><dt>Sources reviewed</dt><dd>24</dd></div><div><dt>Decision window</dt><dd>48 hr</dd></div></dl>
        <div className="showcase-progress" aria-label="Mission is 68% complete"><span /></div>
      </aside>
    </header>

    <section id="showcase-features" className="showcase-section">
      <div className="showcase-section-heading"><div><p className="showcase-kicker">Capability Model</p><h2>One system, three levels of evidence.</h2></div><p>The layout uses scale and placement before decoration. The lead capability receives space; supporting capabilities stay compact.</p></div>
      <div className="showcase-feature-layout">
        <article className="showcase-feature lead"><ShieldCheck size={30} aria-hidden="true" /><h3>Evidence before action</h3><p>Mission decisions connect source quality, quantitative reasoning, uncertainty, and a documented recommendation.</p><ul><li><Check size={15} aria-hidden="true" /> Structured mission brief</li><li><Check size={15} aria-hidden="true" /> Verifiable data trail</li></ul></article>
        <div className="showcase-feature-stack"><article className="showcase-feature"><Sparkles size={24} aria-hidden="true" /><h3>Beacon coaching</h3><p>Contextual support appears without taking over the decision.</p></article><article className="showcase-feature"><Crown size={24} aria-hidden="true" /><h3>Measured progression</h3><p>Assessment states and credentials remain readable in both themes.</p></article></div>
      </div>
    </section>

    <section id="showcase-tier" className="showcase-section showcase-tier-layout">
      <div className="showcase-tier-copy"><p className="showcase-kicker">Featured Program Tier</p><h2>Institutional Mission Studio</h2><p>This illustrative pricing surface demonstrates a restrained primary hairline: a premium signal applied to one edge, never as a large decorative fill.</p></div>
      <article className="showcase-pricing-card"><span className="theme-badge premium">Featured</span><h3>Mission Studio</h3><p className="showcase-price"><strong>$48</strong><span> / learner</span></p><ul><li><Check size={15} aria-hidden="true" /> 14 sector contexts</li><li><Check size={15} aria-hidden="true" /> Faculty discussion controls</li><li><Check size={15} aria-hidden="true" /> Assessment evidence exports</li></ul><button type="button" className="btn" onClick={onMission}>Preview Mission Studio</button></article>
    </section>

    <section id="showcase-controls" className="showcase-section showcase-controls">
      <div><p className="showcase-kicker">Controls &amp; States</p><h2>Clear by default.</h2><div className="theme-badge-row"><span className="theme-badge">Draft</span><span className="theme-badge premium">Featured</span><span className="theme-badge success">Complete</span></div></div>
      <form className="theme-demo-form" onSubmit={(event) => event.preventDefault()}><label htmlFor="showcase-sector">Starting Sector<select id="showcase-sector" name="showcaseSector" defaultValue="vitalis" autoComplete="off"><option value="vitalis">Vitalis</option><option value="transit">Transit</option></select></label><label htmlFor="showcase-query">Evidence Query<input id="showcase-query" name="showcaseQuery" type="search" autoComplete="off" placeholder="e.g. capacity variance…" /></label><div className="showcase-control-actions"><button type="submit" className="btn">Apply Filters</button><button type="reset" className="btn secondary">Reset</button></div></form>
    </section>
  </main>;
}
