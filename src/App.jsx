import useAuth from './auth/useAuth';
import Login from './auth/Login';
import ScalarisApp from './prototype/ScalarisApp';

export default function App() {
  const auth = useAuth();
  const isPrototypePreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('prototype');

  if (isPrototypePreview) {
    return <ScalarisApp userId="prototype-preview" />;
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
    <ScalarisApp key={auth.userId} userId={auth.userId} onLogout={auth.logout} />
  );
}
