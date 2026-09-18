import { useState } from 'react';
import { LockKeyhole, Menu, Network, Sparkles, X } from 'lucide-react';

function Brand({ onClick }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Return to Nexus">
      <span className="brand-mark"><span /></span>
      <span><strong>SCALARIS</strong><small>THE NEXUS</small></span>
    </button>
  );
}

export default function AppHeader({ identity, onHome, onOpenBeacon, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <Brand onClick={onHome} />
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>
        <button onClick={onHome}><Network size={15} /> Nexus</button>
        <button onClick={onOpenBeacon}><Sparkles size={15} /> Beacon</button>
        <button onClick={onLogout}><LockKeyhole size={15} /> Sign out</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="profile-chip">
          <span>{identity.avatar}</span>
          <div><b>{identity.name}</b><small>Level 07 &middot; 620 REP</small></div>
        </div>
      </div>
    </header>
  );
}
