import React from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { IdentityAvatar } from './CharacterBuilderGenerated';

export default function Topbar({ identity, onHome, onLogout, onIdentity, theme, toggleTheme, viewerRole, setViewerRole }) {
  const lightMode = theme === 'light';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="brand" onClick={onHome} aria-label="Return to the Nexus">
          <span className="planet-mark" aria-hidden="true" />
          <span>
            <span className="brand-title">SCALARIS</span>
            <span className="brand-sub">The Nexus</span>
          </span>
        </button>
        <button type="button" className="btn secondary topbar-button" onClick={onIdentity}>My Identity</button>
      </div>

      <div className="topbar-actions">
        <label className="discussion-role">Demo view
          <select value={viewerRole} onChange={(event) => setViewerRole(event.target.value)} aria-label="Demo view">
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </label>
        <button
          type="button"
          className="theme-toggle-icon"
          onClick={toggleTheme}
          title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-pressed={!lightMode}
        >
          {lightMode ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
        </button>
        <div className="profile-pill">
          <div className="avatar-mini"><IdentityAvatar identity={identity} className="avatar-mini-image" /></div>
          <div className="nameblock">
            <div style={{ fontWeight: 700, fontSize: 13 }}>{identity.name}</div>
            <div className="level">Nexus Level 7 · 620 Reputation</div>
          </div>
          {onLogout && <button type="button" className="profile-logout-button" onClick={onLogout} title="Log out" aria-label="Log out"><LogOut size={18} aria-hidden="true" /></button>}
        </div>
      </div>
    </header>
  );
}
