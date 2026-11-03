import { useCallback, useEffect, useRef, useState } from 'react';
import { api, requestKey, segment } from '../api/client';
import LearningRun from '../components/learning/LearningRun';
import Topbar from './components/Topbar';
import Identity from './components/Identity';
import Nexus from './components/Nexus';
import SectorHub from './components/SectorHub';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { useTheme } from './utils/theme';

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

export default function ScalarisApp({ onLogout }) {
  const [route, setRoute] = useState(readRoute);
  const routeRef = useRef(route);
  const guard = useRef(null);
  const [launch, setLaunch] = useState({ nonce: requestKey() });
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const setGuard = useCallback(callback => { guard.current = callback; }, []);
  const refreshProgress = useCallback(async () => {
    const progress = await api('/v1/me/progress');
    setModel(current => current ? { ...current, progress } : current);
  }, []);
  useEffect(() => {
    let active = true;
    setError(null);
    async function load() {
      try {
        const me = await api('/v1/me');
        const [catalogue, progress] = await Promise.all([api('/v1/sectors'), api('/v1/me/progress')]);
        if (active) setModel({ profile: me.profile, sectors: catalogue.sectors, progress });
      } catch (failure) { if (active) setError(failure); }
    }
    load();
    return () => { active = false; };
  }, [retry]);
  const navigate = useCallback(async (next, options = {}) => {
    try {
      await guard.current?.();
      if (routeRef.current.screen === 'mission' || routeRef.current.screen === 'baseline') await refreshProgress();
      routeRef.current = next;
      setLaunch({ ...options, nonce: requestKey() });
      setRoute(next); setError(null);
      if (window.location.hash !== `#${next.path}`) window.history.pushState({}, '', `#${next.path}`);
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (failure) { setError(failure); window.history.replaceState({}, '', `#${routeRef.current.path}`); }
  }, [refreshProgress]);
  useEffect(() => {
    const changed = () => { const next = readRoute(); if (next.path !== routeRef.current.path) navigate(next); };
    window.addEventListener('hashchange', changed);
    window.addEventListener('popstate', changed);
    return () => { window.removeEventListener('hashchange', changed); window.removeEventListener('popstate', changed); };
  }, [navigate]);
  const home = () => navigate({ screen: 'nexus', path: '/nexus' });
  const openSector = sectorId => navigate({ screen: 'sector', sectorId, path: `/sectors/${segment(sectorId)}` });
  const openMission = (missionId, difficulty, options = {}) => navigate({ screen: 'mission', sectorId: 'vitalis', missionId, difficulty, path: `/sectors/vitalis/missions/${segment(missionId)}/${difficulty}` }, options);
  const logout = async () => { try { await guard.current?.(); await onLogout(); } catch (failure) { setError(failure); } };
  if (!model) return <div className="app"><main className="page"><section className="card remote-loading" role={error ? 'alert' : 'status'}><h1>{error ? 'Unable to load your account' : 'Loading your account…'}</h1>{error && <><p>{error.message}</p><button type="button" className="btn" onClick={() => setRetry(value => value + 1)}>Retry</button><button type="button" className="btn secondary" onClick={onLogout}>Sign out</button></>}</section></main></div>;
  const sector = model.sectors.find(item => item.id === route.sectorId && item.enabled);
  const validMission = sector?.missions?.find(item => item.id === route.missionId);
  const saveProfile = async (profile, expectedVersion) => {
    const result = await api('/v1/me', { method: 'PATCH', body: { profile, expectedVersion } });
    setModel(current => ({ ...current, profile: result.profile }));
  };
  let screen;
  if (route.screen === 'identity') screen = <Identity profile={model.profile} sectors={model.sectors} onSave={saveProfile} onContinue={home} baseline={model.progress.baseline} />;
  else if (route.screen === 'baseline') screen = <LearningRun key={`baseline:${launch.nonce}`} kind="ASSESSMENT" startPath="/v1/assessments/baseline/runs"
    existingRunId={model.progress.baseline.submittedAt ? model.progress.baseline.activeRunId : undefined} onBack={home} onProgress={refreshProgress} onGuard={setGuard} />;
  else if (route.screen === 'sector' && sector) screen = <SectorHub key={sector.id} sector={sector} progress={model.progress} onBack={home} onMission={openMission} />;
  else if (route.screen === 'mission' && validMission) {
    const next = sector.missions.find(mission => !model.progress.missions.find(item => item.missionId === mission.id && item.sectorId === sector.id)?.completed && mission.id !== route.missionId);
    screen = <LearningRun key={`${route.path}:${launch.nonce}`} kind="MISSION" displayTitle={validMission.title}
      startPath={`/v1/sectors/${segment(sector.id)}/missions/${segment(route.missionId)}/${route.difficulty}/runs`} {...launch}
      onBack={() => openSector(sector.id)} onProgress={refreshProgress} onGuard={setGuard} nextMission={next}
      onNextMission={missionId => openMission(missionId, route.difficulty)} onRestart={runId => openMission(route.missionId, route.difficulty, { restart: true, previousRunId: runId })}
      sectorCompleted={model.progress.sectors.find(item => item.sectorId === sector.id)?.completed} onNexus={home} />;
  } else screen = <Nexus profile={model.profile} sectors={model.sectors} progress={model.progress} onSector={openSector} onPreAssessment={() => navigate({ screen: 'baseline', path: '/assessments/pre' })} />;
  return <div className="app"><Topbar identity={model.profile} onHome={home} onIdentity={() => navigate({ screen: 'identity', path: '/identity' })} onLogout={logout} theme={theme} toggleTheme={toggleTheme} />
    {error && <div className="callout remote-error" role="alert">{error.message}</div>}
    <RouteErrorBoundary key={route.path} onRecover={home}><div id="main-content" className="route-content" tabIndex="-1">{screen}</div></RouteErrorBoundary>
  </div>;
}
