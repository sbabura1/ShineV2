import { useCallback, useEffect, useRef, useState } from 'react';
import { api, requestKey, segment } from '../api/client';
import LearningRun from '../components/learning/LearningRun';
import Topbar from './components/Topbar';
import Identity from './components/Identity';
import Nexus from './components/Nexus';
import SectorHub from './components/SectorHub';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { useTheme } from './utils/theme';
import DelayedBeaconLoading, { BeaconLoading } from '../components/loading/BeaconLoading';
import useDelayedLoading from '../components/loading/useDelayedLoading';
import { latestSavedPath, readLastVisited, saveLastVisited } from './utils/lastVisited';

function readRoute() {
  const path = window.location.hash.replace(/^#/, '').split('?')[0] || '/identity';
  if (path === '/identity') return { screen: 'identity', path };
  if (path === '/assessments/pre') return { screen: 'baseline', path };
  const mission = path.match(/^\/sectors\/([^/]+)\/missions\/([^/]+)\/(beginning|intermediate|advanced)$/);
  if (mission) return { screen: 'mission', sectorId: decodeURIComponent(mission[1]), missionId: decodeURIComponent(mission[2]), difficulty: mission[3], path };
  const sector = path.match(/^\/sectors\/([^/]+)$/);
  if (sector) return { screen: 'sector', sectorId: decodeURIComponent(sector[1]), path };
  return { screen: 'nexus', path: '/nexus' };
}

export default function ScalarisApp({ onLogout, loadingAlreadyVisible = false, initialProfile, initialUserId }) {
  const [route, setRoute] = useState(readRoute);
  const routeRef = useRef(route);
  const guard = useRef(null);
  const [launch, setLaunch] = useState({ nonce: requestKey() });
  const [model, setModel] = useState(null);
  const [lastVisited, setLastVisited] = useState(null);
  const [error, setError] = useState(null);
  const [accessError, setAccessError] = useState(null);
  const [accessVersion, setAccessVersion] = useState(0);
  const catalogRequest = useRef(0);
  const knownSectors = useRef(new Map());
  const [retry, setRetry] = useState(0);
  const [pendingRoute, setPendingRoute] = useState(null);
  const navigationRequest = useRef(0);
  const navigationVisible = useDelayedLoading(Boolean(pendingRoute));
  const { theme, toggleTheme } = useTheme();
  const setGuard = useCallback(callback => { guard.current = callback; }, []);
  const refreshAccess = useCallback(async () => {
    const request = ++catalogRequest.current;
    try {
      const catalogue = await api('/v1/sectors');
      if (request !== catalogRequest.current) return;
      catalogue.sectors.forEach(sector => knownSectors.current.set(sector.id, sector));
      setModel(current => current ? { ...current, sectors: catalogue.sectors, access: catalogue.access } : current);
      setAccessError(null);
      setAccessVersion(value => value + 1);
      return catalogue;
    } catch (failure) {
      if (request === catalogRequest.current) setAccessError(failure);
      throw failure;
    }
  }, []);
  const refreshProgress = useCallback(async () => {
    const progress = await api('/v1/me/progress');
    setModel(current => current ? { ...current, progress } : current);
  }, []);
  useEffect(() => {
    let active = true;
    setError(null);
    async function load() {
      try {
        const me = initialProfile ? { profile: initialProfile, userId: initialUserId } : await api('/v1/me');
        const [catalogue, progress] = await Promise.all([api('/v1/sectors'), api('/v1/me/progress')]);
        if (active) {
          catalogue.sectors.forEach(sector => knownSectors.current.set(sector.id, sector));
          setModel({ profile: me.profile, userId: me.userId, sectors: catalogue.sectors, access: catalogue.access, progress });
        }
      } catch (failure) { if (active) setError(failure); }
    }
    load();
    return () => { active = false; };
  }, [retry, initialProfile, initialUserId]);
  useEffect(() => { if (model?.userId) setLastVisited(readLastVisited(model.userId)); }, [model?.userId]);
  useEffect(() => {
    if (!model) return;
    const sector = model.sectors.find(item => item.id === route.sectorId && item.enabled);
    if (!sector || !['sector', 'mission'].includes(route.screen)) return;
    if (route.screen === 'mission' && !sector.missions?.some(item => item.id === route.missionId)) return;
    const visited = { screen: route.screen, sectorId: route.sectorId,
      ...(route.screen === 'mission' ? { missionId: route.missionId, difficulty: route.difficulty } : {}) };
    setLastVisited(visited);
    saveLastVisited(model.userId, visited);
  }, [route.path, model?.sectors, model?.userId]);
  const loaded = Boolean(model);
  useEffect(() => {
    if (!loaded) return;
    const refresh = () => { if (!document.hidden) refreshAccess().catch(() => {}); };
    const interval = window.setInterval(refresh, 20000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      ++catalogRequest.current;
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loaded, refreshAccess]);
  const navigate = useCallback(async (next, options = {}) => {
    const request = ++navigationRequest.current;
    setPendingRoute(next);
    try {
      await guard.current?.();
      if (routeRef.current.screen === 'mission' || routeRef.current.screen === 'baseline') await refreshProgress();
      if (request !== navigationRequest.current) return;
      routeRef.current = next;
      setLaunch({ ...options, nonce: requestKey() });
      setRoute(next); setError(null);
      if (window.location.hash !== `#${next.path}`) window.history.pushState({}, '', `#${next.path}`);
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (failure) {
      if (request === navigationRequest.current) { if (failure.code !== 'NAVIGATION_CANCELLED') setError(failure); window.history.replaceState({}, '', `#${routeRef.current.path}`); }
    } finally { if (request === navigationRequest.current) setPendingRoute(null); }
  }, [refreshProgress]);
  useEffect(() => {
    const changed = () => { const next = readRoute(); if (next.path !== routeRef.current.path) navigate(next); };
    window.addEventListener('hashchange', changed);
    window.addEventListener('popstate', changed);
    return () => { window.removeEventListener('hashchange', changed); window.removeEventListener('popstate', changed); };
  }, [navigate]);
  const home = () => navigate({ screen: 'nexus', path: '/nexus' });
  const openSector = sectorId => navigate({ screen: 'sector', sectorId, path: `/sectors/${segment(sectorId)}` });
  const openMission = (missionId, difficulty, options = {}) => navigate({ screen: 'mission', sectorId: route.sectorId, missionId, difficulty, path: `/sectors/${segment(route.sectorId)}/missions/${segment(missionId)}/${difficulty}` }, options);
  const logout = async () => { try { await guard.current?.(); await onLogout(); } catch (failure) { setError(failure); } };
  if (!model && !error) return <div className="app"><DelayedBeaconLoading variant={route.screen === 'baseline' ? 'assessment' : 'account'} fullPage initiallyVisible={loadingAlreadyVisible} /></div>;
  if (!model) return <div className="app"><main className="page"><section className="card remote-loading" role="alert"><h1>Unable to load your account</h1><p>{error.message}</p><button type="button" className="btn" onClick={() => setRetry(value => value + 1)}>Retry</button><button type="button" className="btn secondary" onClick={onLogout}>Sign out</button></section></main></div>;
  const sector = model.sectors.find(item => item.id === route.sectorId && item.enabled);
  // Keep an open mission mounted when access changes so unsaved edits stay on screen.
  const missionSector = sector || knownSectors.current.get(route.sectorId);
  const validMission = missionSector?.missions?.find(item => item.id === route.missionId);
  const saveProfile = async (profile, expectedVersion) => {
    const result = await api('/v1/me', { method: 'PATCH', body: { profile, expectedVersion } });
    setModel(current => ({ ...current, profile: result.profile }));
  };
  let screen;
  if (route.screen === 'identity') screen = <Identity profile={model.profile} onSave={saveProfile} onContinue={home} baseline={model.progress.baseline} onClassChange={refreshAccess} />;
  else if (route.screen === 'baseline') screen = <LearningRun key={`baseline:${launch.nonce}`} kind="ASSESSMENT" startPath="/v1/assessments/baseline/runs"
    existingRunId={model.progress.baseline.submittedAt ? model.progress.baseline.activeRunId : undefined} onBack={home} onProgress={refreshProgress} onGuard={setGuard} />;
  else if (route.screen === 'sector' && sector) screen = <SectorHub key={sector.id} sector={sector} progress={model.progress} onBack={home} onMission={openMission} />;
  else if (route.screen === 'mission' && validMission) {
    const next = missionSector.missions.find(mission => !model.progress.missions.find(item => item.missionId === mission.id && item.sectorId === missionSector.id)?.completed && mission.id !== route.missionId);
    screen = <LearningRun key={`${route.path}:${launch.nonce}`} kind="MISSION" displayTitle={validMission.title} identity={model.profile}
      startPath={`/v1/sectors/${segment(missionSector.id)}/missions/${segment(route.missionId)}/${route.difficulty}/runs`} {...launch}
      accessBlocked={!sector} accessVersion={accessVersion} onRefreshAccess={refreshAccess}
      onBack={() => sector ? openSector(sector.id) : home()} onProgress={refreshProgress} onGuard={setGuard} nextMission={next}
      onNextMission={missionId => openMission(missionId, route.difficulty)} onRestart={runId => openMission(route.missionId, route.difficulty, { restart: true, previousRunId: runId })}
      sectorCompleted={model.progress.sectors.find(item => item.sectorId === missionSector.id)?.completed} onNexus={home} />;
  } else if (['sector', 'mission'].includes(route.screen)) screen = <main className="page"><section className="card remote-loading" role="status"><h1>Sector unavailable</h1><p>{model.access?.classId ? 'This sector is not currently available in your class. Ask your teacher about access.' : 'This sector or mission is not currently available.'}</p><p>Your previously saved progress is kept.</p><div className="cta-row"><button type="button" className="btn" onClick={home}>Back to the Nexus</button><button type="button" className="btn secondary" onClick={() => refreshAccess().catch(() => {})}>Check access again</button></div></section></main>;
  else screen = <Nexus profile={model.profile} sectors={model.sectors} access={model.access} progress={model.progress} lastVisited={lastVisited || latestSavedPath(model.progress)} onResume={visited => {
    const path = `/sectors/${segment(visited.sectorId)}` + (visited.screen === 'mission' ? `/missions/${segment(visited.missionId)}/${visited.difficulty}` : '');
    const track = model.progress.difficultyStates.find(item => item.sectorId === visited.sectorId && item.missionId === visited.missionId && item.difficulty === visited.difficulty);
    navigate({ ...visited, path }, track?.activeRunId ? { existingRunId: track.activeRunId } : {});
  }} onSector={openSector} onPreAssessment={() => navigate({ screen: 'baseline', path: '/assessments/pre' })} />;
  const pendingSector = model.sectors.find(item => item.id === pendingRoute?.sectorId);
  const pendingVariant = pendingRoute?.screen === 'baseline' || route.screen === 'baseline' ? 'assessment'
    : pendingRoute?.screen === 'sector' ? 'sector' : pendingRoute?.screen === 'mission' ? 'mission' : pendingRoute?.screen === 'nexus' ? 'nexus' : 'account';
  const pendingName = pendingVariant === 'sector' ? pendingSector?.name
    : pendingVariant === 'mission' ? pendingSector?.missions?.find(item => item.id === pendingRoute?.missionId)?.title : undefined;
  return <div className="app"><div inert={navigationVisible ? true : undefined}><Topbar identity={model.profile} onHome={home} onIdentity={() => navigate({ screen: 'identity', path: '/identity' })} onLogout={logout} theme={theme} toggleTheme={toggleTheme} />
    {error && <div className="callout remote-error" role="alert">{error.message}</div>}
    {accessError && <div className="callout remote-error" role="alert">Unable to refresh your class access. {accessError.message} <button type="button" className="btn secondary" onClick={() => refreshAccess().catch(() => {})}>Retry access check</button></div>}
    <RouteErrorBoundary key={route.path} onRecover={home}><div id="main-content" className="route-content" tabIndex="-1">{screen}</div></RouteErrorBoundary>
    </div>{navigationVisible && <BeaconLoading variant={pendingVariant} name={pendingName} fullPage overlay />}
  </div>;
}
