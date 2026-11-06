import { useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../prototype/utils/theme';
import './faculty.css';

export default function FacultyDashboard({ profile, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const logout = async () => {
    setSigningOut(true); setError('');
    try { await onLogout(); }
    catch (failure) { setError(failure.message || 'Unable to sign out. Please try again.'); setSigningOut(false); }
  };
  return <div className="app faculty-app">
    <header className="faculty-topbar">
      <a className="brand" href="#/faculty" aria-label="Faculty dashboard"><span className="planet-mark" aria-hidden="true" /><span><span className="brand-title">SCALARIS</span><span className="brand-sub">Faculty</span></span></a>
      <div className="faculty-account-actions"><span className="faculty-account-name">{profile.name || 'Faculty account'}</span>
        <button type="button" className="theme-toggle-icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
        <button type="button" className="btn secondary" disabled={signingOut} onClick={logout}><LogOut size={17} aria-hidden="true" />{signingOut ? 'Signing out…' : 'Sign out'}</button>
      </div>
    </header>
    <main className="page faculty-dashboard" id="main-content"><h1>Faculty dashboard</h1>
      {error && <p className="faculty-error" role="alert">{error}</p>}
    </main>
  </div>;
}
