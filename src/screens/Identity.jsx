import { ArrowRight, Sparkles } from 'lucide-react';
import { avatars, sectors } from '../data';
import { getPrimaryRole } from '../utils/sector';
import Button from '../components/ui/Button';
import PageIntro from '../components/ui/PageIntro';

export default function Identity({ identity, setIdentity, onContinue }) {
  const updateSector = (id) => {
    const sector = sectors.find((item) => item.id === id);
    setIdentity({ ...identity, sector: id, role: getPrimaryRole(sector.roles) });
  };

  return (
    <main className="page">
      <PageIntro eyebrow="First step" title="Build your Nexus identity" copy="Who will you become in Scalaris?" />
      <div className="identity-layout">
        <section className="identity-preview">
          <span className="eyebrow">Your avatar</span>
          <div className="avatar-large">{identity.avatar}</div>
          <div className="avatar-choice">
            {avatars.map((avatar) => <button className={identity.avatar === avatar ? 'selected' : ''} key={avatar} onClick={() => setIdentity({ ...identity, avatar })}>{avatar}</button>)}
          </div>
        </section>
        <section className="form-panel">
          <div className="form-grid">
            <label>Identity name<input value={identity.name} onChange={(event) => setIdentity({ ...identity, name: event.target.value })} /></label>
            <label>Faculty guide<select value={identity.faculty} onChange={(event) => setIdentity({ ...identity, faculty: event.target.value })}><option>Dr. Maya Chen</option><option>Prof. Elena Ruiz</option><option>Dr. Marcus Reed</option></select></label>
            <label>Starting sector<select value={identity.sector} onChange={(event) => updateSector(event.target.value)}>{sectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name} - {sector.label}</option>)}</select></label>
            <label>Starting role<input value={identity.role} onChange={(event) => setIdentity({ ...identity, role: event.target.value })} /></label>
          </div>
          <div className="notice"><Sparkles size={17} /><p><b>Identity is more than appearance.</b> Your rank, sector clearance, and mission authority grow as you demonstrate quantitative reasoning.</p></div>
          <Button onClick={onContinue}>Continue to the Nexus <ArrowRight size={17} /></Button>
        </section>
      </div>
    </main>
  );
}
