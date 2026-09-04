import { useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, ChevronRight, CircleHelp, LockKeyhole, Menu, Network, Sparkles, X } from 'lucide-react';
import { avatars, caseRows, missionSteps, sectors } from './data';

const initialIdentity = { name: 'Jordan Vega', avatar: avatars[0], faculty: 'Dr. Maya Chen', sector: 'sentinel', role: 'Crime Analyst' };

function Button({ children, variant = 'primary', ...props }) {
  return <button className={`button button-${variant}`} {...props}>{children}</button>;
}

function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="Return to Nexus">
    <span className="brand-mark"><span /></span>
    <span><strong>SCALARIS</strong><small>THE NEXUS</small></span>
  </button>;
}

function Header({ identity, onHome, onOpenBeacon }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="topbar">
    <Brand onClick={onHome} />
    <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>
      <button onClick={onHome}><Network size={15} /> Nexus</button>
      <button onClick={onOpenBeacon}><Sparkles size={15} /> Beacon</button>
    </nav>
    <div className="header-actions">
      <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <div className="profile-chip"><span>{identity.avatar}</span><div><b>{identity.name}</b><small>Level 07 · 620 REP</small></div></div>
    </div>
  </header>;
}

function PageIntro({ eyebrow, title, copy, action }) {
  return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function Landing({ onEnter, onWorldview }) {
  return <main className="landing">
    <div className="landing-grid" />
    <div className="landing-copy">
      <span className="eyebrow">Quantitative reasoning simulation world</span>
      <h1>SCALARIS</h1>
      <div className="landing-subtitle"><span /> The Nexus</div>
      <p>Data shapes every decision. Build your professional identity, investigate messy evidence, and make the call.</p>
      <div className="button-row"><Button onClick={onEnter}>Enter the Nexus <ArrowRight size={17} /></Button><Button variant="ghost" onClick={onWorldview}>View world model</Button></div>
      <div className="landing-note"><span className="pulse-dot" /> 14 sectors · 01 active mission · beacon online</div>
    </div>
    <div className="landing-orbit orbit-a" /><div className="landing-orbit orbit-b" /><div className="landing-core">SX<span>∞</span></div>
  </main>;
}

function Worldview({ onEnter }) {
  const concepts = [['01', 'Identity', 'A professional avatar that grows through demonstrated reasoning.'], ['02', 'Data Lab', 'Every mission starts with anomalies, uncertainty, and pattern detection.'], ['03', 'Missions', 'Connected problems requiring evidence and a consequential decision.']];
  return <main className="page"><PageIntro eyebrow="System overview" title="A world built around better decisions" copy="Scalaris turns quantitative reasoning into a context-rich professional practice." />
    <div className="concept-grid">{concepts.map(([number, title, copy]) => <article className="concept-card" key={title}><span>{number}</span><h2>{title}</h2><p>{copy}</p><ChevronRight size={18} /></article>)}</div>
    <section className="worldview-banner"><div><span className="eyebrow">The Scalaris loop</span><h2>Inspect <i>→</i> question <i>→</i> analyze <i>→</i> explain</h2><p>Students move from calculation to sector problems to integrated Nexus missions.</p></div><Button onClick={onEnter}>Build my identity <ArrowRight size={17} /></Button></section>
  </main>;
}

function Identity({ identity, setIdentity, onContinue }) {
  const updateSector = (id) => { const sector = sectors.find((item) => item.id === id); setIdentity({ ...identity, sector: id, role: sector.roles.split(' · ')[0] }); };
  return <main className="page"><PageIntro eyebrow="First step" title="Build your Nexus identity" copy="Who will you become in Scalaris?" />
    <div className="identity-layout"><section className="identity-preview"><span className="eyebrow">Your avatar</span><div className="avatar-large">{identity.avatar}</div><div className="avatar-choice">{avatars.map((avatar) => <button className={identity.avatar === avatar ? 'selected' : ''} key={avatar} onClick={() => setIdentity({ ...identity, avatar })}>{avatar}</button>)}</div></section>
      <section className="form-panel"><div className="form-grid"><label>Identity name<input value={identity.name} onChange={(event) => setIdentity({ ...identity, name: event.target.value })} /></label><label>Faculty guide<select value={identity.faculty} onChange={(event) => setIdentity({ ...identity, faculty: event.target.value })}><option>Dr. Maya Chen</option><option>Prof. Elena Ruiz</option><option>Dr. Marcus Reed</option></select></label><label>Starting sector<select value={identity.sector} onChange={(event) => updateSector(event.target.value)}>{sectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name} — {sector.label}</option>)}</select></label><label>Starting role<input value={identity.role} onChange={(event) => setIdentity({ ...identity, role: event.target.value })} /></label></div><div className="notice"><Sparkles size={17} /><p><b>Identity is more than appearance.</b> Your rank, sector clearance, and mission authority grow as you demonstrate quantitative reasoning.</p></div><Button onClick={onContinue}>Continue to the Nexus <ArrowRight size={17} /></Button></section></div>
  </main>;
}

function Nexus({ identity, onSector, onMission }) {
  const positions = [['gateway', 15, 18], ['mosaic', 34, 11], ['civitas', 63, 12], ['horizon', 84, 20], ['sentinel', 10, 39], ['lumina', 27, 35], ['vitalis', 79, 36], ['terra', 90, 50], ['forge', 9, 65], ['transit', 27, 72], ['harvest', 76, 73], ['arena', 91, 71], ['venture', 38, 87], ['mercator', 63, 88]];
  const currentSector = sectors.find((sector) => sector.id === identity.sector);
  return <main className="page"><PageIntro eyebrow="Central hub" title="Welcome to the Nexus" copy="A connected network of professional contexts." action={<Button variant="accent" onClick={onMission}>Continue mission <ArrowRight size={17} /></Button>} />
    <div className="nexus-layout"><section className="map-panel"><div className="map-lines" /> <div className="nexus-center"><span>∞</span><b>THE NEXUS</b><small>central hub</small></div>{positions.map(([id, left, top], index) => { const sector = sectors.find((item) => item.id === id); return <button className={`node ${index > 3 ? 'locked' : ''}`} style={{ left: `${left}%`, top: `${top}%`, '--node-color': sector.color }} key={id} onClick={() => onSector(id)} title={sector.label}><span>{sector.icon}</span><b>{sector.name}</b><small>{index > 3 ? 'Clearance' : 'Open'}</small></button>; })}<div className="map-key"><span><i /> Nexus connection</span><span><i className="dash" /> Cross-sector link</span></div></section>
      <aside className="nexus-sidebar"><section className="beacon-card"><div className="beacon-icon"><Sparkles size={20} /></div><div><span className="eyebrow">Beacon online</span><p>“Welcome back, {identity.name.split(' ')[0]}. The network is waiting.”</p><button onClick={onMission}>Ask for a hint <ArrowRight size={14} /></button></div></section><section className="stats-card"><span className="eyebrow">Identity snapshot</span><h2>{identity.role}</h2><div className="stats"><div><b>07</b><small>NEXUS LEVEL</small></div><div><b>620</b><small>REPUTATION</small></div><div><b>04</b><small>SECTORS OPEN</small></div></div><div className="progress-label"><span>Next rank: Senior Analyst</span><b>68%</b></div><div className="progress"><span /></div><div className="current-sector">Current sector <b style={{ color: currentSector.color }}>{currentSector.name}</b></div></section></aside></div>
    <div className="section-heading"><div><span className="eyebrow">Explore the network</span><h2>14 sectors of Scalaris</h2></div><p>Every context changes the problem, not the expectation to reason from evidence.</p></div><div className="sector-grid">{sectors.map((sector, index) => <button className={`sector-card ${index > 3 ? 'locked' : ''}`} key={sector.id} onClick={() => onSector(sector.id)}><span className="sector-icon" style={{ color: sector.color }}>{sector.icon}</span><span className="sector-index">0{index + 1}</span><h3>{sector.name}</h3><b>{sector.label}</b><p>{sector.description}</p><footer><span>{index > 3 ? <><LockKeyhole size={12} /> Clearance required</> : 'Open sector'}</span><ArrowRight size={16} /></footer></button>)}</div>
  </main>;
}

function SectorHub({ sector, onBack, onMission, onSprint }) {
  return <main className="page"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to Nexus</button><section className="sector-hero" style={{ '--sector-color': sector.color }}><span className="sector-hero-icon">{sector.icon}</span><span className="eyebrow">{sector.name} sector</span><h1>{sector.label}</h1><p>{sector.description} Step into the role of <b>{sector.roles.split(' · ')[0]}</b> and make sense of the signal.</p><div className="button-row"><Button onClick={onMission}>Start mission <ArrowRight size={17} /></Button><Button variant="gold" onClick={onSprint}><BarChart3 size={17} /> Shine Sprint checkup</Button></div></section><div className="skill-strip"><span className="eyebrow">Skills in this sector</span>{['Rates & ratios', 'Percent change', 'Data visualization', 'Comparative reasoning', 'Risk & probability'].map((skill) => <span key={skill}>{skill}</span>)}</div></main>;
}

function Mission({ sector, step, setStep, selected, setSelected, onFinish }) {
  const isDataLab = step === 1; const isDecision = step === 4;
  return <main className="page mission-page"><button className="back-link" onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={15} /> Back</button><div className="mission-header"><div><span className="eyebrow">{sector.name} · Case file 01</span><h1>Signal in the noise</h1><p>District vehicle theft has shifted. Your team needs a defensible read before resources move.</p></div><span className="mission-badge">Mission 01 / 07</span></div><div className="stepper">{missionSteps.map((label, index) => <button className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => setStep(index)} key={label}><span>0{index + 1}</span>{label}</button>)}</div><section className="mission-card">{step === 0 && <div className="briefing"><span className="brief-number">01</span><div><span className="eyebrow">Briefing</span><h2>Find the story the average is hiding.</h2><p>You are reviewing six weeks of incident data across four districts. The chief wants to know where a targeted response could make the biggest difference. Start by checking whether the data deserves your trust.</p><div className="callout"><CircleHelp size={18} /><span>Strong analysts do not rush to the answer. They first ask what could make the answer misleading.</span></div></div></div>}{isDataLab && <DataTable />}{step === 2 && <ChoiceStep title="Find the signal" copy="Which observation should you investigate first?" options={['West district has a much higher rate than the others.', 'East district has the fewest calls.', 'North district has more arrests than South.']} selected={selected} setSelected={setSelected} />}{step === 3 && <ChoiceStep title="Build the evidence" copy="What is the strongest next move?" options={['Use the West rate immediately; the difference is obvious.', 'Check the outlier, duplicate, and category mismatch before comparing.', 'Remove the West row because it is probably wrong.']} selected={selected} setSelected={setSelected} />}{isDecision && <ChoiceStep title="Make the call" copy="Choose the recommendation you can defend." options={['Deploy targeted resources to West while validating the 510-call outlier.', 'Treat all districts equally until every row is perfect.', 'Focus only on East because its arrest field is missing.']} selected={selected} setSelected={setSelected} />}{step === 5 && <div className="assessment-step"><span className="eyebrow">Assessment</span><h2>One last confidence check</h2><p>How confident are you in the recommendation you would present?</p><div className="confidence-row">{['Low', 'Developing', 'Ready', 'Strong', 'Expert'].map((label) => <button className={selected === label ? 'selected' : ''} onClick={() => setSelected(label)} key={label}>{label}</button>)}</div></div>}{step === 6 && <div className="complete-step"><span className="complete-mark">✓</span><span className="eyebrow">Debrief complete</span><h2>Evidence before certainty.</h2><p>You identified the signal, challenged data quality, and made a measured recommendation. That is the work.</p><Button onClick={onFinish}>View updated identity <ArrowRight size={17} /></Button></div>}<div className="mission-actions">{step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Previous</Button>}{step < 6 && <Button onClick={() => setStep(step + 1)}>{step === 5 ? 'Complete mission' : 'Next step'} <ArrowRight size={16} /></Button>}</div></section></main>;
}

function ChoiceStep({ title, copy, options, selected, setSelected }) { return <div className="choice-step"><span className="eyebrow">Decision point</span><h2>{title}</h2><p>{copy}</p><div className="answer-list">{options.map((option) => <button className={selected === option ? 'selected' : ''} onClick={() => setSelected(option)} key={option}>{option}<span>{selected === option ? 'Selected' : 'Choose'}</span></button>)}</div></div>; }
function DataTable() { return <div className="data-lab"><span className="eyebrow">Data lab</span><h2>Audit the incident log</h2><p>Before you interpret the rate, inspect the quality of the rows.</p><div className="table-wrap"><table><thead><tr>{['Incident', 'District', 'Type', 'Calls', 'Arrests', 'Rate / 1k'].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{caseRows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td className={index === 2 ? 'warning-cell' : index === 4 || (index === 5 && cellIndex === 2) ? 'issue-cell' : ''} key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div><div className="table-notes"><span><i className="issue-dot" /> Outlier detected</span><span><i className="warn-dot" /> Duplicate / missing value</span></div></div>; }

function Profile({ identity, onNexus, onReplay }) { return <main className="page profile-page"><div className="profile-complete"><div className="avatar-large">{identity.avatar}</div><span className="eyebrow">Identity updated</span><h1>{identity.name}</h1><p>{identity.role} · {identity.faculty}</p><div className="rank-card"><div><small>NEW RANK</small><b>Senior Analyst</b></div><strong>+180 REP</strong></div><div className="button-row"><Button onClick={onNexus}>Return to the Nexus <ArrowRight size={17} /></Button><Button variant="ghost" onClick={onReplay}>Replay mission</Button></div></div></main>; }

export default function App() {
  const [screen, setScreen] = useState('landing'); const [identity, setIdentity] = useState(initialIdentity); const [sectorId, setSectorId] = useState('sentinel'); const [step, setStep] = useState(0); const [selected, setSelected] = useState(''); const [beaconOpen, setBeaconOpen] = useState(false);
  const sector = sectors.find((item) => item.id === sectorId) || sectors[0];
  const go = (next) => { setScreen(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const selectSector = (id) => { setSectorId(id); const chosen = sectors.find((item) => item.id === id); setIdentity({ ...identity, sector: id, role: chosen.roles.split(' · ')[0] }); go('sector'); };
  const startMission = () => { setStep(0); setSelected(''); go('mission'); };
  return <div className="app">{screen === 'landing' ? <Landing onEnter={() => go('identity')} onWorldview={() => go('worldview')} /> : <><Header identity={identity} onHome={() => go('nexus')} onOpenBeacon={() => setBeaconOpen(!beaconOpen)} />{screen === 'worldview' && <Worldview onEnter={() => go('identity')} />}{screen === 'identity' && <Identity identity={identity} setIdentity={setIdentity} onContinue={() => go('nexus')} />}{screen === 'nexus' && <Nexus identity={identity} onSector={selectSector} onMission={startMission} />}{screen === 'sector' && <SectorHub sector={sector} onBack={() => go('nexus')} onMission={startMission} onSprint={() => go('mission')} />}{screen === 'mission' && <Mission sector={sector} step={step} setStep={setStep} selected={selected} setSelected={setSelected} onFinish={() => go('profile')} />}{screen === 'profile' && <Profile identity={identity} onNexus={() => go('nexus')} onReplay={startMission} />}</>}{beaconOpen && <aside className="beacon-popover"><button className="popover-close" onClick={() => setBeaconOpen(false)}><X size={17} /></button><div className="beacon-icon"><Sparkles size={20} /></div><span className="eyebrow">Beacon AI</span><h3>A thinking partner, not an answer machine.</h3><p>Ask for a hint, challenge your reasoning, or clarify a quantitative concept without giving away the decision.</p><Button variant="ghost" onClick={() => setBeaconOpen(false)}>Close</Button></aside>}</div>;
}
