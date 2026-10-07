import { useState } from 'react';
import { sectors } from './data';
import { useSavedState } from './utils/useSavedState';
import Identity from './components/Identity';
import Nexus from './components/Nexus';
import PostAssessment from './components/PostAssessment';
import PreAssessment from './components/PreAssessment';
import SectorHub from './components/SectorHub';
import ShineSprint from './components/ShineSprint';
import Topbar from './components/Topbar';
import Worldview from './components/Worldview';
import { BeaconSectorMission, BeaconSectorProfile } from './components/BeaconMission';

const defaultIdentity = {
  name: 'Jordan Vega', avatar: '🧑🏽‍🚀', faculty: 'Dr. Maya Chen',
  sector: 'vitalis', role: 'Healthcare Operations Specialist',
};

export default function ScalarisApp({ userId = 'guest', onLogout } = {}) {
  const storagePrefix = `user:${userId}`;
  const [screen, setScreen] = useState('landing');
  const [identity, setIdentity] = useSavedState(`${storagePrefix}:identity`, defaultIdentity);
  const [missionLevel, setMissionLevel] = useSavedState(`${storagePrefix}:mission-level`, 'Beginning');
  const [preAssessmentResult, setPreAssessmentResult] = useSavedState(`${storagePrefix}:pre-assessment`, null);
  const [completedSectors, setCompletedSectors] = useSavedState(`${storagePrefix}:completed-sectors`, []);
  const [postAssessmentComplete, setPostAssessmentComplete] = useSavedState(`${storagePrefix}:post-assessment`, false);
  const [projectAssessmentComplete] = useSavedState(`${storagePrefix}:project-assessment`, false);
  const [beaconOpen, setBeaconOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState('');

  const preAssessmentComplete = preAssessmentResult !== null;
  const preAssessmentSkipped = preAssessmentResult?.skipped === true;
  const sector = sectors.find((item) => item.id === identity.sector) || sectors[0];

  const go = (nextScreen) => {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };
  const skipPreAssessment = () => {
    setPreAssessmentResult({ skipped: true });
    notify('Pre-assessment skipped. You can take it later from the Nexus.');
  };

  if (screen === 'landing') {
    return (
      <div className="app">
        <div className="hero"><div className="hero-inner">
          <div className="eyebrow">Quantitative Reasoning Simulation World</div>
          <h1>SCALARIS</h1><div className="nexus-word">THE NEXUS</div>
          <p className="tagline">Enter a world where data shapes decisions. Build an identity, explore professional sectors, investigate messy data, apply quantitative reasoning, and make the call.</p>
          <div className="cta-row">
            <button className="btn" onClick={() => go('identity')}>ENTER THE NEXUS →</button>
            <button className="btn secondary" onClick={() => go('worldview')}>VIEW WORLD MODEL</button>
          </div>
        </div></div>
      </div>
    );
  }

  return (
    <div className="app">
      <Topbar identity={identity} onHome={() => go('nexus')} onLogout={onLogout} />
      {screen === 'worldview' && <Worldview onEnter={() => go('identity')} />}
      {screen === 'identity' && <Identity identity={identity} setIdentity={setIdentity} onContinue={() => go('nexus')} preAssessmentComplete={preAssessmentComplete} preAssessmentSkipped={preAssessmentSkipped} postAssessmentComplete={postAssessmentComplete} projectAssessmentComplete={projectAssessmentComplete} allSectorsComplete={completedSectors.length === sectors.length} completedCount={completedSectors.length} onPostAssessment={() => go('postassessment')} />}
      {screen === 'preassessment' && <PreAssessment identity={identity} onExit={() => go('nexus')} onComplete={(result) => { setPreAssessmentResult(result); go('nexus'); notify('Pre-assessment complete. Your baseline is saved in this browser.'); }} />}
      {screen === 'postassessment' && <PostAssessment identity={identity} completedSectors={completedSectors} onBack={() => go('nexus')} onComplete={() => { setPostAssessmentComplete(true); go('nexus'); notify('Post-assessment marked complete.'); }} />}
      {screen === 'nexus' && <Nexus identity={identity} preAssessmentComplete={preAssessmentComplete} preAssessmentSkipped={preAssessmentSkipped} preAssessmentResult={preAssessmentSkipped ? null : preAssessmentResult} completedSectors={completedSectors} postAssessmentComplete={postAssessmentComplete} projectAssessmentComplete={projectAssessmentComplete} onPostAssessment={() => go('postassessment')} onPreAssessment={() => go('preassessment')} onSkipPreAssessment={skipPreAssessment} onSector={(id) => { const selectedSector = sectors.find((item) => item.id === id); setIdentity({ ...identity, sector: id, role: selectedSector.roles.split(' • ')[0] }); go('sector'); }} onMission={() => { setStep(0); go('mission'); }} />}
      {screen === 'sector' && <SectorHub sector={sector} identity={identity} missionLevel={missionLevel} setMissionLevel={setMissionLevel} onBack={() => go('nexus')} onMission={() => { setStep(0); go('mission'); }} onSprint={() => go('sprint')} />}
      {screen === 'sprint' && <ShineSprint sector={sector} onBack={() => go('sector')} />}
      {screen === 'mission' && <BeaconSectorMission key={`${sector.id}:${missionLevel}`} sector={sector} identity={identity} missionLevel={missionLevel} step={step} setStep={setStep} onFinish={() => { setCompletedSectors((current) => current.includes(identity.sector) ? current : [...current, identity.sector]); go('profile'); }} />}
      {screen === 'profile' && <BeaconSectorProfile identity={identity} onNexus={() => go('nexus')} onReplay={() => { setStep(0); go('mission'); }} />}
      {beaconOpen && <div className="beacon-panel"><h3>Beacon AI</h3><p>Ask for a hint, challenge your reasoning, clarify a quantitative concept, or check the evidence you are using. Beacon will coach without making the decision for you.</p><button className="btn secondary" style={{ marginTop: 12 }} onClick={() => setBeaconOpen(false)}>CLOSE</button></div>}
      <button className="beacon-fab" title="Open Beacon AI" aria-label="Open Beacon AI" onClick={() => setBeaconOpen((open) => !open)}><span className="beacon-glyph" aria-hidden="true">B</span></button>
      {toast && <div className="toast" style={{ bottom: 105 }}>{toast}</div>}
    </div>
  );
}
