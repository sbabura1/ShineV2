import { useEffect, useState } from 'react';
import { sectors } from './data';
import { useSavedState } from './utils/useSavedState';
import { createScalarisRoute, pushScalarisRoute, readScalarisRoute } from './utils/routes';
import Landing from './components/Landing';
import Identity from './components/Identity';
import Nexus from './components/Nexus';
import PostAssessment from './components/PostAssessment';
import PreAssessment from './components/PreAssessment';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import SectorHub from './components/SectorHub';
import ShineSprint from './components/ShineSprint';
import Topbar from './components/Topbar';
import Worldview from './components/Worldview';
import ThemeShowcase from './components/ThemeShowcase';
import { BeaconSectorMission, BeaconSectorProfile } from './components/BeaconMission';
import { selectedBeacon } from './beacons';
import { AVATAR_DEFAULT, BEACON_DEFAULT } from './components/CharacterBuilderGenerated';
import { useTheme } from './utils/theme';

const defaultIdentity = {
  name: 'Jordan Vega', avatar: '🧑🏽‍🚀', faculty: 'Dr. Maya Chen',
  sector: 'vitalis', role: 'Healthcare Operations Specialist', beacon: 'Beacon-Original.jpg',
  avatarDesign: AVATAR_DEFAULT, beaconDesign: BEACON_DEFAULT,
};

export default function ScalarisApp({ userId = 'guest', onLogout } = {}) {
  const storagePrefix = `user:${userId}`;
  const [route, setRoute] = useState(readScalarisRoute);
  const { theme, toggleTheme } = useTheme();
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
      window.requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }));
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
    return <div className="app"><Landing onEnter={() => go('identity')} /></div>;
  }

  return (
    <div className="app">
      <button type="button" className="skip-link" onClick={() => document.getElementById('main-content')?.focus()}>Skip to main content</button>
      <Topbar identity={identity} onHome={() => go('nexus')} onLogout={onLogout} onIdentity={() => go('identity')} theme={theme} toggleTheme={toggleTheme} viewerRole={viewerRole} setViewerRole={setViewerRole} />
      <RouteErrorBoundary key={route.path} onRecover={() => go('nexus')}>
      <div id="main-content" className="route-content" tabIndex="-1">
      {screen === 'worldview' && <Worldview onEnter={() => go('identity')} />}
      {screen === 'identity' && <Identity viewerRole={viewerRole} identity={identity} setIdentity={setIdentity} onContinue={() => go('nexus')} preAssessmentComplete={preAssessmentComplete} preAssessmentSkipped={preAssessmentSkipped} postAssessmentComplete={postAssessmentComplete} projectAssessmentComplete={projectAssessmentComplete} allSectorsComplete={completedSectors.length === sectors.length} completedCount={completedSectors.length} onPostAssessment={() => go('postassessment')} />}
      {screen === 'preassessment' && <PreAssessment identity={identity} onExit={() => go('nexus')} onComplete={(result) => { setPreAssessmentResult(result); go('nexus'); notify('Pre-assessment complete. Your baseline is saved in this browser.'); }} />}
      {screen === 'postassessment' && <PostAssessment identity={identity} completedSectors={completedSectors} onBack={() => go('nexus')} onComplete={() => { setPostAssessmentComplete(true); go('nexus'); notify('Post-assessment marked complete.'); }} />}
      {screen === 'nexus' && <Nexus identity={identity} preAssessmentComplete={preAssessmentComplete} preAssessmentSkipped={preAssessmentSkipped} preAssessmentResult={preAssessmentSkipped ? null : preAssessmentResult} completedSectors={completedSectors} postAssessmentComplete={postAssessmentComplete} projectAssessmentComplete={projectAssessmentComplete} onPostAssessment={() => go('postassessment')} onPreAssessment={() => go('preassessment')} onSkipPreAssessment={skipPreAssessment} onSector={(id) => { const selectedSector = sectors.find((item) => item.id === id); setIdentity({ ...identity, sector: id, role: selectedSector.roles.split(' • ')[0] }); go('sector', { sectorId: id }); }} onMission={startActiveMission} />}
      {screen === 'sector' && <SectorHub sector={sector} identity={identity} viewerRole={viewerRole} missionLevel={missionLevel} setMissionLevel={setMissionLevel} onBack={() => go('nexus')} onMission={() => go('mission', { sectorId: sector.id, step: 0 })} onSprint={() => go('sprint', { sectorId: sector.id })} />}
      {screen === 'sprint' && <ShineSprint sector={sector} onBack={() => go('sector', { sectorId: sector.id })} />}
      {screen === 'mission' && <BeaconSectorMission key={`${sector.id}:${missionLevel}`} sector={sector} identity={identity} missionLevel={missionLevel} step={step} setStep={(nextStep) => go('mission', { sectorId: sector.id, step: nextStep })} onBack={() => go('sector', { sectorId: sector.id })} onFinish={() => { setCompletedSectors((current) => current.includes(sector.id) ? current : [...current, sector.id]); go('profile', { sectorId: sector.id }); }} />}
      {screen === 'profile' && <BeaconSectorProfile identity={identity} onNexus={() => go('nexus')} onReplay={() => go('mission', { sectorId: sector.id, step: 0 })} />}
      {screen === 'themes' && <ThemeShowcase onBack={() => go('nexus')} onMission={startActiveMission} />}
      </div>
      </RouteErrorBoundary>
      {beaconOpen && <div className="beacon-panel"><h3>Beacon AI</h3><p>Ask for a hint, challenge your reasoning, clarify a quantitative concept, or check the evidence you are using. Beacon will coach without making the decision for you.</p><button className="btn secondary" style={{ marginTop: 12 }} onClick={() => setBeaconOpen(false)}>Close</button></div>}
      <button className="beacon-fab" title="Open Beacon AI" aria-label="Open Beacon AI" aria-expanded={beaconOpen} onClick={() => setBeaconOpen((open) => !open)}><img src={selectedBeacon(identity).src} alt="" aria-hidden="true" width="80" height="80" /></button>
      {toast && <div className="toast" role="status" aria-live="polite" style={{ bottom: 105 }}>{toast}</div>}
    </div>
  );
}
