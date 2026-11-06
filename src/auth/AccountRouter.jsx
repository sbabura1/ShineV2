import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import ScalarisApp from '../prototype/ScalarisApp';
import FacultyDashboard from '../components/faculty/FacultyDashboard';
import { BeaconLoading } from '../components/loading/BeaconLoading';
import useDelayedLoading from '../components/loading/useDelayedLoading';
import { useTheme } from '../prototype/utils/theme';

export default function AccountRouter({ onLogout, loadingAlreadyVisible = false }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [routeReady, setRouteReady] = useState(false);
  const loading = useDelayedLoading(!account && !error, 400, loadingAlreadyVisible);
  const loadingShown = useRef(loadingAlreadyVisible);
  useTheme();
  useEffect(() => { if (loading) loadingShown.current = true; }, [loading]);

  useEffect(() => {
    let active = true;
    setError(null);
    api('/v1/me').then(result => {
      if (!['student', 'faculty'].includes(result.accountRole) || !result.profile || typeof result.profile !== 'object') {
        throw new Error('Your account access is not configured. Contact your administrator.');
      }
      if (active) setAccount(result);
    }).catch(failure => { if (active) setError(failure); });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    if (!account) return undefined;
    const guard = () => {
      const current = window.location.hash.replace(/^#/, '').split('?')[0] || '/';
      const destination = account.accountRole === 'faculty' ? '/faculty'
        : ['/', '/welcome', '/login'].includes(current) ? '/identity'
          : current === '/faculty' || current.startsWith('/faculty/') ? '/nexus' : null;
      if (destination && current !== destination) window.history.replaceState({ scalaris: true }, '', `#${destination}`);
    };
    guard();
    setRouteReady(true);
    window.addEventListener('hashchange', guard);
    window.addEventListener('popstate', guard);
    return () => { window.removeEventListener('hashchange', guard); window.removeEventListener('popstate', guard); };
  }, [account]);

  if (error) return <div className="app"><main className="page"><section className="card remote-loading" role="alert">
    <h1>Unable to load your account</h1><p>{error.message}</p>
    <button type="button" className="btn" onClick={() => setRetry(value => value + 1)}>Retry</button>
    <button type="button" className="btn secondary" onClick={onLogout}>Sign out</button>
  </section></main></div>;
  if (!account || !routeReady) return loading ? <BeaconLoading variant={window.location.hash.startsWith('#/assessments/pre') ? 'assessment' : 'account'} fullPage /> : <div className="app beacon-loading-placeholder beacon-loading-placeholder--full" aria-busy="true" />;
  if (account.accountRole === 'faculty') return <FacultyDashboard profile={account.profile} onLogout={onLogout} />;
  return <ScalarisApp initialProfile={account.profile} onLogout={onLogout} loadingAlreadyVisible={loadingShown.current} />;
}
