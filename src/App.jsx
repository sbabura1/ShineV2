import { LockKeyhole } from 'lucide-react';
import useAuth from './auth/useAuth';
import Login from './auth/Login';
import ScalarisPrototype from './prototype/ScalarisPrototype';

export default function App() {
  const auth = useAuth();
  const isPrototypePreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('prototype');

  if (isPrototypePreview) {
    return <ScalarisPrototype />;
  }

  if (auth.status !== 'authenticated') {
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

  return (
    <>
      <ScalarisPrototype />
      {import.meta.env.DEV && (
        <button className="temp-logout-button" onClick={auth.logout} aria-label="Temporary logout">
          <LockKeyhole size={16} /> Temp logout
        </button>
      )}
    </>
  );
}
