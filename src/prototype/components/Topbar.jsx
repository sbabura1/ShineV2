import { LogOut, Moon, Sun } from 'lucide-react';
import { IdentityAvatar } from './CharacterBuilderGenerated';
import './student-navbar.css';
export default function Topbar({ identity, onHome, onLogout, onIdentity, theme, toggleTheme }) {
  return <header className="topbar student-topbar"><button type="button" className="brand" onClick={onHome} aria-label="Return to the Nexus"><span className="planet-mark" aria-hidden="true" /><span><span className="brand-title">SCALARIS</span><span className="brand-sub">The Nexus</span></span></button>
    <div className="student-navbar-actions"><button type="button" className="student-navbar-icon" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
      <button type="button" className="student-identity-button" onClick={onIdentity} aria-label={`Open My Identity for ${identity.name || 'my account'}`} title="Open My Identity"><span className="student-navbar-avatar"><IdentityAvatar identity={identity} className="avatar-mini-image" /></span><span className="student-navbar-name">{identity.name || 'My account'}</span></button>
      <button type="button" className="student-navbar-icon" onClick={onLogout} title="Log out" aria-label="Log out"><LogOut size={18} /></button>
    </div></header>;
}
