import { useEffect, useState } from 'react';
import CharacterBuilder from './CharacterBuilderGenerated';

const savedFields = ['name', 'faculty', 'sector', 'role', 'avatarDesign', 'beaconDesign', 'beacon', 'theme'];
export default function Identity({ profile, sectors, onSave, onContinue, baseline }) {
  const [draft, setDraft] = useState(profile);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { setDraft(profile); }, [profile]);
  const save = async () => {
    setSaving(true); setStatus('');
    try { await onSave(Object.fromEntries(savedFields.filter(key => draft[key] !== undefined).map(key => [key, draft[key]])), profile.rev); setStatus('Identity saved.'); return true; }
    catch (error) { setStatus(error.message); return false; } finally { setSaving(false); }
  };
  return <main className="page"><header className="section-title"><div><h1>Build Your Nexus Identity</h1><p>Your profile and appearance are saved to your account.</p></div></header>
    <div className="grid cols-3 identity-layout"><div className="card identity-avatar-card"><CharacterBuilder kind="avatar" identity={draft} setIdentity={setDraft} /><CharacterBuilder kind="beacon" identity={draft} setIdentity={setDraft} /></div>
      <section className="card identity-details-card" style={{ gridColumn: 'span 2' }}><div className="form-row">
        <label htmlFor="identity-name">Name<input id="identity-name" autoComplete="name" value={draft.name || ''} maxLength={200} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} /></label>
        <label htmlFor="faculty-name">Instructor / mentor<input id="faculty-name" value={draft.faculty || ''} maxLength={200} onChange={event => setDraft(current => ({ ...current, faculty: event.target.value }))} /></label>
        <label htmlFor="starting-sector">Sector<select id="starting-sector" value={draft.sector || sectors.find(sector => sector.enabled)?.id || ''} onChange={event => setDraft(current => ({ ...current, sector: event.target.value }))}>{sectors.filter(sector => sector.enabled).map(sector => <option key={sector.id} value={sector.id}>{sector.name}</option>)}</select></label>
        <label htmlFor="starting-role">Professional role<input id="starting-role" value={draft.role || ''} maxLength={200} onChange={event => setDraft(current => ({ ...current, role: event.target.value }))} /></label>
      </div><div className="cta-row"><button type="button" className="btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save identity'}</button><button type="button" className="btn secondary" disabled={saving} onClick={async () => { if (await save()) onContinue(); }}>Save and go to the Nexus</button></div>
      {status && <p role="status">{status}</p>}<div className="callout"><strong>Pre-assessment</strong><p>{baseline?.submittedAt ? 'Your full baseline has been submitted.' : baseline?.activeRunId ? 'Your baseline draft is saved and ready to continue.' : 'Your baseline is ready to begin.'}</p></div>
    </section></div></main>;
}
