import { LogOut, Moon, Sun } from 'lucide-react';
import { IdentityAvatar } from './CharacterBuilderGenerated';
export default function Topbar({ identity, onHome, onLogout, onIdentity, theme, toggleTheme }) {
  return <header className="topbar"><div className="topbar-left"><button type="button" className="brand" onClick={onHome} aria-label="Return to the Nexus"><span className="planet-mark" aria-hidden="true" /><span><span className="brand-title">SCALARIS</span><span className="brand-sub">The Nexus</span></span></button><button type="button" className="btn secondary topbar-button" onClick={onIdentity}>My Identity</button></div>
    <div className="topbar-actions"><button type="button" className="theme-toggle-icon" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
      <div className="profile-pill"><div className="avatar-mini"><IdentityAvatar identity={identity} className="avatar-mini-image" /></div><div className="nameblock"><div style={{ fontWeight: 700 }}>{identity.name || 'My account'}</div>{identity.role && <div className="level">{identity.role}</div>}</div><button type="button" className="profile-logout-button" onClick={onLogout} title="Log out" aria-label="Log out"><LogOut size={18} /></button></div>
    </div></header>;
}
