import { useEffect, useState } from 'react';
import { sectors } from './data';
import { useSavedState } from './utils/useSavedState';
import { createScalarisRoute, pushScalarisRoute, readScalarisRoute } from './utils/routes';
import Identity from './components/Identity';
import Nexus from './components/Nexus';
import PostAssessment from './components/PostAssessment';
import PreAssessment from './components/PreAssessment';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import SectorHub from './components/SectorHub';
import ShineSprint from './components/ShineSprint';
import Topbar from './components/Topbar';
import Worldview from './components/Worldview';
import { BeaconSectorMission, BeaconSectorProfile } from './components/BeaconMission';
import { selectedBeacon } from './beacons';

const defaultIdentity = {
  name: 'Jordan Vega', avatar: '🧑🏽‍🚀', faculty: 'Dr. Maya Chen',
  sector: 'vitalis', role: 'Healthcare Operations Specialist', beacon: 'Beacon-Original.jpg',
};

export default function ScalarisApp({ userId = 'guest', onLogout } = {}) {
  const storagePrefix = `user:${userId}`;
  const [route, setRoute] = useState(readScalarisRoute);
  const [mode, setMode] = useSavedState(`${storagePrefix}:screen-mode`, 'dark');
  const [viewerRole, setViewerRole] = useSavedState(`${storagePrefix}:discussion-demo-role`, 'student');
  const [identity, setIdentity] = useSavedState(`${storagePrefix}:identity`, defaultIdentity);
  const [missionLevel, setMissionLevel] = useSavedState(`${storagePrefix}:mission-level`, 'Beginning');
  const [preAssessmentResult, setPreAssessmentResult] = useSavedState(`${storagePrefix}:pre-assessment`, null);
  const [completedSectors, setCompletedSectors] = useSavedState(`${storagePrefix}:completed-sectors`, []);
  const [postAssessmentComplete, setPostAssessmentComplete] = useSavedState(`${storagePrefix}:post-assessment`, false);
  const [projectAssessmentComplete] = useSavedState(`${storagePrefix}:project-assessment`, false);
  const [beaconOpen, setBeaconOpen] = useState(false);
  const [toast, setToast] = useState('');

  const screen = route.screen;
  const step = route.step ?? 0;
  const preAssessmentComplete = preAssessmentResult !== null;
  const preAssessmentSkipped = preAssessmentResult?.skipped === true;
  const activeSectorId = route.sectorId || identity.sector;
  const sector = sectors.find((item) => item.id === activeSectorId) || sectors[0];

  useEffect(() => {
    document.documentElement.dataset.mode = mode === 'light' ? 'light' : 'dark';
  }, [mode]);

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = readScalarisRoute();
      setRoute(nextRoute);
      if (nextRoute.sectorId) {
        const selectedSector = sectors.find((item) => item.id === nextRoute.sectorId);
        if (selectedSector) {
          setIdentity((current) => current.sector === selectedSector.id
            ? current
            : { ...current, sector: selectedSector.id, role: selectedSector.roles.split(' • ')[0] });
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', syncRoute);
    syncRoute();
    return () => {
      window.removeEventListener('hashchange', syncRoute);
    };
  }, [setIdentity]);

  const go = (nextScreen, options = {}) => {
    const nextRoute = createScalarisRoute(nextScreen, {
      sectorId: options.sectorId || activeSectorId,
      step: options.step ?? step,
    });
    pushScalarisRoute(nextRoute);
    setRoute(nextRoute);
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
  const startActiveMission = () => {
    const activeSector = sectors.find((item) => item.id === identity.sector) || sectors.find((item) => item.id === 'vitalis');
    setIdentity({ ...identity, sector: activeSector.id, role: identity.sector === activeSector.id ? identity.role : activeSector.roles.split(' • ')[0] });
    go('mission', { sectorId: activeSector.id, step: 0 });
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
      <Topbar identity={identity} onHome={() => go('nexus')} onLogout={onLogout} onIdentity={() => go('identity')} mode={mode} setMode={setMode} viewerRole={viewerRole} setViewerRole={setViewerRole} />
      <RouteErrorBoundary key={route.path} onRecover={() => go('nexus')}>
      {screen === 'worldview' && <Worldview onEnter={() => go('identity')} />}
      {screen === 'identity' && <Identity viewerRole={viewerRole} identity={identity} setIdentity={setIdentity} onContinue={() => go('nexus')} preAssessmentComplete={preAssessmentComplete} preAssessmentSkipped={preAssessmentSkipped} postAssessmentComplete={postAssessmentComplete} projectAssessmentComplete={projectAssessmentComplete} allSectorsComplete={completedSectors.length === sectors.length} completedCount={completedSectors.length} onPostAssessment={() => go('postassessment')} />}
      {screen === 'preassessment' && <PreAssessment identity={identity} onExit={() => go('nexus')} onComplete={(result) => { setPreAssessmentResult(result); go('nexus'); notify('Pre-assessment complete. Your baseline is saved in this browser.'); }} />}
      {screen === 'postassessment' && <PostAssessment identity={identity} completedSectors={completedSectors} onBack={() => go('nexus')} onComplete={() => { setPostAssessmentComplete(true); go('nexus'); notify('Post-assessment marked complete.'); }} />}
      {screen === 'nexus' && <Nexus identity={identity} preAssessmentComplete={preAssessmentComplete} preAssessmentSkipped={preAssessmentSkipped} preAssessmentResult={preAssessmentSkipped ? null : preAssessmentResult} completedSectors={completedSectors} postAssessmentComplete={postAssessmentComplete} projectAssessmentComplete={projectAssessmentComplete} onPostAssessment={() => go('postassessment')} onPreAssessment={() => go('preassessment')} onSkipPreAssessment={skipPreAssessment} onSector={(id) => { const selectedSector = sectors.find((item) => item.id === id); setIdentity({ ...identity, sector: id, role: selectedSector.roles.split(' • ')[0] }); go('sector', { sectorId: id }); }} onMission={startActiveMission} />}
      {screen === 'sector' && <SectorHub sector={sector} identity={identity} viewerRole={viewerRole} missionLevel={missionLevel} setMissionLevel={setMissionLevel} onBack={() => go('nexus')} onMission={() => go('mission', { sectorId: sector.id, step: 0 })} onSprint={() => go('sprint', { sectorId: sector.id })} />}
      {screen === 'sprint' && <ShineSprint sector={sector} onBack={() => go('sector', { sectorId: sector.id })} />}
      {screen === 'mission' && <BeaconSectorMission key={`${sector.id}:${missionLevel}`} sector={sector} identity={identity} missionLevel={missionLevel} step={step} setStep={(nextStep) => go('mission', { sectorId: sector.id, step: nextStep })} onFinish={() => { setCompletedSectors((current) => current.includes(sector.id) ? current : [...current, sector.id]); go('profile', { sectorId: sector.id }); }} />}
      {screen === 'profile' && <BeaconSectorProfile identity={identity} onNexus={() => go('nexus')} onReplay={() => go('mission', { sectorId: sector.id, step: 0 })} />}
      </RouteErrorBoundary>
      {beaconOpen && <div className="beacon-panel"><h3>Beacon AI</h3><p>Ask for a hint, challenge your reasoning, clarify a quantitative concept, or check the evidence you are using. Beacon will coach without making the decision for you.</p><button className="btn secondary" style={{ marginTop: 12 }} onClick={() => setBeaconOpen(false)}>CLOSE</button></div>}
      <button className="beacon-fab" title="Open Beacon AI" aria-label="Open Beacon AI" onClick={() => setBeaconOpen((open) => !open)}><img src={selectedBeacon(identity).src} alt="" aria-hidden="true" /></button>
      {toast && <div className="toast" style={{ bottom: 105 }}>{toast}</div>}
    </div>
  );
}
