import { useEffect, useRef, useState } from 'react';
import useAuth from './auth/useAuth';
import Login from './auth/Login';
import AccountRouter from './auth/AccountRouter';
import Landing from './prototype/components/Landing';
import { BeaconLoading } from './components/loading/BeaconLoading';
import useDelayedLoading from './components/loading/useDelayedLoading';

const readPublicPath = () => {
  const path = window.location.hash.replace(/^#/, '').split('?')[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
};

export default function App() {
  const auth = useAuth();
  const [publicScreen, setPublicScreen] = useState(() => readPublicPath() === '/login' ? 'login' : 'welcome');
  const [authenticatedRouteReady, setAuthenticatedRouteReady] = useState(false);
  const authLoading = useDelayedLoading(auth.status === 'loading' || (auth.status === 'authenticated' && !authenticatedRouteReady));
  const loadingAlreadyVisible = useRef(false);
  useEffect(() => {
    if (authLoading) loadingAlreadyVisible.current = true;
    else if (auth.status === 'unauthenticated') loadingAlreadyVisible.current = false;
  }, [authLoading, auth.status]);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      setAuthenticatedRouteReady(true);
      return undefined;
    }

    setAuthenticatedRouteReady(false);
    if (auth.status !== 'unauthenticated') return undefined;

    const guardPublicRoutes = () => {
      const path = readPublicPath();
      if (path === '/login') {
        setPublicScreen('login');
        return;
      }
      if (path === '/' || path === '/welcome') {
        setPublicScreen('welcome');
        return;
      }
      window.history.replaceState({ scalaris: true }, '', '#/welcome');
      setPublicScreen('welcome');
    };

    window.addEventListener('hashchange', guardPublicRoutes);
    guardPublicRoutes();
    return () => window.removeEventListener('hashchange', guardPublicRoutes);
  }, [auth.status]);

  const openLogin = () => {
    window.location.hash = '/login';
    setPublicScreen('login');
  };

  if (auth.status === 'authenticated' && authenticatedRouteReady) {
    return <AccountRouter key={auth.userId} onLogout={auth.logout} loadingAlreadyVisible={loadingAlreadyVisible.current} />;
  }

  if (publicScreen === 'login') {
    return (
      <><div inert={authLoading ? true : undefined}>
      <Login
        onLogin={auth.login}
        onGoogleLogin={auth.loginWithGoogle}
        onSignUp={auth.createAccount}
        onConfirmSignIn={auth.finishNewPasswordSignIn}
        onConfirmSignUp={auth.confirmAccount}
        error={auth.error}
        message={auth.message}
        isLoading={auth.status === 'loading'}
      />
      </div>{authLoading && <BeaconLoading variant="account" fullPage overlay />}</>
    );
  }

  return <><div className="app" inert={authLoading ? true : undefined}><Landing onEnter={openLogin} isLoading={auth.status === 'loading'} /></div>
    {authLoading && <BeaconLoading variant={readPublicPath() === '/assessments/pre' ? 'assessment' : 'account'} fullPage overlay />}</>;
}
