import { useCallback, useEffect, useState } from 'react';
import { confirmSignIn, confirmSignUp, getCurrentUser, signIn, signInWithRedirect, signOut, signUp } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export default function useAuth() {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const checkAuth = useCallback(async () => {
    try {
      await getCurrentUser();
      setStatus('authenticated');
      setError('');
    } catch {
      setStatus('unauthenticated');
    }
  }, []);

  const login = async (email, password) => {
    setError(''); setMessage(''); setStatus('loading');
    try {
      const result = await signIn({ username: email, password });
      const nextStep = result.nextStep?.signInStep;
      if (nextStep === 'DONE') { await checkAuth(); return 'DONE'; }
      setStatus('unauthenticated');
      if (nextStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') { setMessage('AWS Cognito needs you to replace the temporary password.'); return nextStep; }
      if (nextStep === 'CONFIRM_SIGN_UP') { setMessage('This account needs email confirmation before sign-in.'); return nextStep; }
      setError(`Cognito requires an additional sign-in step: ${nextStep || 'unknown step'}.`);
      return nextStep;
    } catch (authError) {
      setStatus('unauthenticated'); setError(authError.message || 'Unable to sign in.'); return null;
    }
  };

  const loginWithGoogle = async () => {
    setError(''); setMessage('Redirecting to Google...'); setStatus('loading');
    try {
      await signInWithRedirect({ provider: 'Google', options: { prompt: 'SELECT_ACCOUNT' } });
    } catch (authError) {
      setStatus('unauthenticated'); setError(authError.message || 'Unable to start Google sign-in.'); setMessage('');
    }
  };

  const finishNewPasswordSignIn = async (newPassword) => {
    setError(''); setMessage(''); setStatus('loading');
    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.nextStep?.signInStep === 'DONE') { await checkAuth(); return true; }
      setStatus('unauthenticated');
      setError(`Cognito requires an additional sign-in step: ${result.nextStep?.signInStep || 'unknown step'}.`);
      return false;
    } catch (authError) {
      setStatus('unauthenticated'); setError(authError.message || 'Unable to finish sign-in.'); return false;
    }
  };

  const createAccount = async ({ firstName, lastName, email, password }) => {
    setError(''); setMessage(''); setStatus('loading');
    try {
      const result = await signUp({ username: email, password, options: { userAttributes: { email, given_name: firstName, family_name: lastName } } });
      setStatus('unauthenticated');
      if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') { setMessage('Check your email for the Cognito confirmation code.'); return true; }
      setMessage('Account created. Sign in to continue.');
      return false;
    } catch (authError) {
      setStatus('unauthenticated'); setError(authError.message || 'Unable to create account.'); return false;
    }
  };

  const confirmAccount = async (email, confirmationCode) => {
    setError(''); setMessage(''); setStatus('loading');
    try {
      await confirmSignUp({ username: email, confirmationCode });
      setStatus('unauthenticated'); setMessage('Account confirmed. Sign in to continue.'); return true;
    } catch (authError) {
      setStatus('unauthenticated'); setError(authError.message || 'Unable to confirm account.'); return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const query = new URLSearchParams(window.location.search);
      const isOAuthCallback = query.has('code') && query.has('state');
      if (query.has('error') || query.has('error_description')) {
        setError(query.get('error_description')?.replace(/\+/g, ' ') || query.get('error') || 'Google sign-in did not complete.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (import.meta.env.DEV && import.meta.env.VITE_KEEP_DEV_AUTH !== 'true' && !isOAuthCallback) {
        try { await signOut(); } catch { /* No saved Cognito session to clear. */ }
      }
      checkAuth();
    };

    initializeAuth();
    return Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') checkAuth();
      if (payload.event === 'signedOut') setStatus('unauthenticated');
    });
  }, [checkAuth]);

  return {
    status, error, message, login, loginWithGoogle, finishNewPasswordSignIn,
    createAccount, confirmAccount, logout: signOut,
  };
}
