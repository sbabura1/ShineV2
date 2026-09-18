import { ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Profile({ identity, onNexus, onReplay }) {
  return (
    <main className="page profile-page">
      <div className="profile-complete">
        <div className="avatar-large">{identity.avatar}</div>
        <span className="eyebrow">Identity updated</span>
        <h1>{identity.name}</h1>
        <p>{identity.role} &middot; {identity.faculty}</p>
        <div className="rank-card"><div><small>NEW RANK</small><b>Senior Analyst</b></div><strong>+180 REP</strong></div>
        <div className="button-row"><Button onClick={onNexus}>Return to the Nexus <ArrowRight size={17} /></Button><Button variant="ghost" onClick={onReplay}>Replay mission</Button></div>
      </div>
    </main>
  );
}
