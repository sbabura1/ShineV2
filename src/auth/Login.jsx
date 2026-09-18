import { useState } from 'react';
import { ArrowLeft, LockKeyhole, Sparkles } from 'lucide-react';
import shineLogo from '../assets/shine-logo.png';
import Button from '../components/ui/Button';

export default function Login({ onLogin, onGoogleLogin, onSignUp, onConfirmSignIn, onConfirmSignUp, error, message, isLoading }) {
  const [view, setView] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formError, setFormError] = useState('');

  const showSignIn = () => {
    setView('signIn');
    setFormError('');
  };

  const showSignUp = () => {
    setView('signUp');
    setFormError('');
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setFormError('Enter your email and password to continue.');
      return;
    }

    setFormError('');
    const nextStep = await onLogin(email.trim(), password);
    if (nextStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') setView('newPassword');
    if (nextStep === 'CONFIRM_SIGN_UP') setView('confirm');
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError('Complete every field to create your SHINE account.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords must match.');
      return;
    }

    setFormError('');
    const needsConfirmation = await onSignUp({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password });
    if (needsConfirmation) setView('confirm');
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    if (!email.trim() || !confirmationCode.trim()) {
      setFormError('Enter your email and confirmation code.');
      return;
    }

    setFormError('');
    const confirmed = await onConfirmSignUp(email.trim(), confirmationCode.trim());
    if (confirmed) showSignIn();
  };

  const handleNewPassword = async (event) => {
    event.preventDefault();
    if (!newPassword || !confirmPassword) {
      setFormError('Enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords must match.');
      return;
    }

    setFormError('');
    await onConfirmSignIn(newPassword);
  };

  const isSignIn = view === 'signIn';
  const isSignUp = view === 'signUp';
  const isNewPassword = view === 'newPassword';
  const title = isSignIn ? 'Welcome back' : isSignUp ? 'Create account' : isNewPassword ? 'Set new password' : 'Check your email';
  const copy = isSignIn ? 'Sign in with your SHINE account.' : isSignUp ? 'Create your SHINE account with AWS Cognito.' : isNewPassword ? 'Cognito requires a permanent password before your first sign-in finishes.' : 'Enter the confirmation code Cognito sent to your email.';

  return (
    <main className="login-page">
      <aside className="shine-brand-panel">
        <div className="shine-logo-lockup">
          <img className="shine-logo-image" src={shineLogo} alt="SHINE" />
          <p className="shine-logo-fullname">STEM Hub for Innovation in Numeracy Education</p>
        </div>
        <div className="shine-hero">
          <h1>Quantitative reasoning starts here.</h1>
          <p>Sign in to access the SHINE learning and research experience.</p>
          <div className="shine-accent-row" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        </div>
        <div className="shine-support">
          The SHINE project is supported by the National Science Foundation (NSF) Division of Equity for Excellence in STEM Award #2450045.
        </div>
      </aside>

      <section className="shine-login-main">
        <div className="shine-login-card" aria-live="polite">
          <div className="shine-card-head"><h2>{title}</h2><p>{copy}</p></div>

          {isSignIn && <form className="shine-card-content" onSubmit={handleSignIn}>
            {(formError || error) && <div className="shine-login-error" role="alert">{formError || error}</div>}
            {message && <div className="shine-login-message" role="status">{message}</div>}
            <div className="shine-field"><label htmlFor="loginEmail">Email address</label><input id="loginEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.edu" disabled={isLoading} /></div>
            <div className="shine-field"><label htmlFor="loginPassword">Password</label><input id="loginPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" disabled={isLoading} /></div>
            <Button type="submit" disabled={isLoading}><LockKeyhole size={17} /> {isLoading ? 'Signing in...' : 'Sign In'}</Button>
            <div className="shine-divider">or</div>
            <button className="shine-google-button" type="button" onClick={onGoogleLogin} disabled={isLoading}><span className="google-mark" aria-hidden="true" /> Continue with Google</button>
            <div className="shine-auth-switch">New to SHINE? <button type="button" onClick={showSignUp} disabled={isLoading}>Create Account</button></div>
          </form>}

          {isSignUp && <form className="shine-card-content" onSubmit={handleSignUp}>
            {(formError || error) && <div className="shine-login-error" role="alert">{formError || error}</div>}
            <div className="shine-grid-two">
              <div className="shine-field"><label htmlFor="signupFirstName">First name</label><input id="signupFirstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" placeholder="First name" disabled={isLoading} /></div>
              <div className="shine-field"><label htmlFor="signupLastName">Last name</label><input id="signupLastName" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" placeholder="Last name" disabled={isLoading} /></div>
            </div>
            <div className="shine-field"><label htmlFor="signupEmail">Email address</label><input id="signupEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.edu" disabled={isLoading} /></div>
            <div className="shine-field"><label htmlFor="signupPassword">Password</label><input id="signupPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Create a password" disabled={isLoading} /></div>
            <div className="shine-field"><label htmlFor="signupConfirmPassword">Confirm password</label><input id="signupConfirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Re-enter password" disabled={isLoading} /></div>
            <div className="shine-auth-actions">
              <Button type="submit" disabled={isLoading}><Sparkles size={17} /> {isLoading ? 'Creating account...' : 'Create Account'}</Button>
              <Button type="button" variant="ghost" onClick={showSignIn} disabled={isLoading}><ArrowLeft size={16} /> Back to Sign In</Button>
            </div>
          </form>}

          {view === 'confirm' && <form className="shine-card-content" onSubmit={handleConfirm}>
            {(formError || error) && <div className="shine-login-error" role="alert">{formError || error}</div>}
            {message && <div className="shine-login-message" role="status">{message}</div>}
            <div className="shine-field"><label htmlFor="confirmEmail">Email address</label><input id="confirmEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.edu" disabled={isLoading} /></div>
            <div className="shine-field"><label htmlFor="confirmationCode">Confirmation code</label><input id="confirmationCode" value={confirmationCode} onChange={(event) => setConfirmationCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" placeholder="Enter code" disabled={isLoading} /></div>
            <div className="shine-auth-actions">
              <Button type="submit" disabled={isLoading}><LockKeyhole size={17} /> {isLoading ? 'Confirming...' : 'Confirm Account'}</Button>
              <Button type="button" variant="ghost" onClick={showSignIn} disabled={isLoading}><ArrowLeft size={16} /> Back to Sign In</Button>
            </div>
          </form>}

          {isNewPassword && <form className="shine-card-content" onSubmit={handleNewPassword}>
            {(formError || error) && <div className="shine-login-error" role="alert">{formError || error}</div>}
            {message && <div className="shine-login-message" role="status">{message}</div>}
            <div className="shine-field"><label htmlFor="newPassword">New password</label><input id="newPassword" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="Create a permanent password" disabled={isLoading} /></div>
            <div className="shine-field"><label htmlFor="confirmNewPassword">Confirm new password</label><input id="confirmNewPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Re-enter new password" disabled={isLoading} /></div>
            <div className="shine-auth-actions">
              <Button type="submit" disabled={isLoading}><LockKeyhole size={17} /> {isLoading ? 'Saving password...' : 'Continue'}</Button>
              <Button type="button" variant="ghost" onClick={showSignIn} disabled={isLoading}><ArrowLeft size={16} /> Back to Sign In</Button>
            </div>
          </form>}
        </div>
      </section>
    </main>
  );
}
