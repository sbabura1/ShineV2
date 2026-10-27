import { useEffect, useState } from 'react';
import useAuth from './auth/useAuth';
import Login from './auth/Login';
import ScalarisApp from './prototype/ScalarisApp';
import Landing from './prototype/components/Landing';

const readPublicPath = () => {
  const path = window.location.hash.replace(/^#/, '').split('?')[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const isPublicPath = (path) => path === '/' || path === '/welcome' || path === '/login';

export default function App() {
  const auth = useAuth();
  const [publicScreen, setPublicScreen] = useState(() => readPublicPath() === '/login' ? 'login' : 'welcome');
  const [authenticatedRouteReady, setAuthenticatedRouteReady] = useState(false);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      const path = readPublicPath();
      if (isPublicPath(path)) window.history.replaceState({ scalaris: true }, '', '#/identity');
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
    return <ScalarisApp key={auth.userId} userId={auth.userId} onLogout={auth.logout} />;
  }

  if (publicScreen === 'login') {
    return (
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
    );
  }

  return <div className="app"><Landing onEnter={openLogin} isLoading={auth.status === 'loading'} /></div>;
}
