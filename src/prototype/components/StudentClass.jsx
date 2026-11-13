import { useCallback, useEffect, useRef, useState } from 'react';
import { api, segment } from '../../api/client';
import { classroomWrite } from '../../api/classrooms';
import { availableDiscussionSectors, isSectorAccessError } from '../../api/sectorAccess';
import { discussionTime } from '../../components/faculty/facultyData';
import './student-class.css';

function ClassConversations({ classroom, onRefreshClass }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState('');
  const discussionSectors = availableDiscussionSectors(classroom);
  const boardKey = discussionSectors.join(',');
  const visiblePosts = posts.filter(thread => !classroom.allowedSectors || classroom.allowedSectors.includes(thread.sector));
  const path = '/v1/classes/' + segment(classroom.id) + '/discussions';
  const refresh = useCallback(async () => {
    try { const result = await api(path); setPosts(result.discussions); setError(''); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }, [path]);
  useEffect(() => { refresh(); }, [refresh, boardKey]);
  const post = async event => {
    event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form);
    const body = { title: fields.get('title').trim(), body: fields.get('body').trim(), sector: fields.get('sector') };
    if (!body.title || !body.body) return;
    setBusy(true); setError('');
    try { await classroomWrite(path, 'POST', body); form.reset(); await refresh(); }
    catch (failure) { setError(failure.message); if (failure.code === 'BOARD_DISABLED' || isSectorAccessError(failure)) onRefreshClass(); }
    finally { setBusy(false); }
  };
  return <details className="student-class-conversations" onToggle={event => { if (event.currentTarget.open) refresh(); }}><summary>Class conversations <span>{visiblePosts.length}</span></summary>
    <p>{discussionSectors.length ? 'Share a question or a perspective with your class.' : 'Posting and replies are unavailable. Existing conversations in your available sectors are read-only.'}</p>
    {error && <p className="student-class-error" role="alert">{error} <button type="button" className="btn secondary" onClick={refresh}>Retry</button></p>}
    {discussionSectors.length > 0 && <form onSubmit={post} className="student-class-post-form"><label>Sector<select name="sector">{discussionSectors.map(id => <option key={id} value={id}>{id[0].toUpperCase() + id.slice(1)}</option>)}</select></label><label>Question or title<input name="title" maxLength={150} required pattern=".*\S.*" /></label><label>Your perspective<textarea name="body" maxLength={4000} rows={3} required /></label><button className="btn" disabled={busy} type="submit">{busy ? 'Posting…' : 'Post to class'}</button></form>}
    {loading ? <p role="status">Loading conversations…</p> : visiblePosts.length === 0 ? <p>{discussionSectors.length ? 'No conversations yet. Start with a question.' : 'No conversations to show. Your teacher controls which discussion boards are available.'}</p> : visiblePosts.map(thread => <article className="student-class-thread" key={thread.id}><small>{thread.author || 'Class member'} · {discussionTime(thread.createdAt)} · {thread.sector}</small><h3>{thread.title}</h3>{!discussionSectors.includes(thread.sector) && <p className="student-class-label">Read-only · Discussion board Off</p>}<p>{thread.body}</p>{thread.replies.map(item => <blockquote key={item.id}><strong>{item.author || 'Class member'}{item.authorRole === 'faculty' ? ' · Faculty' : ''}</strong><p>{item.body}</p></blockquote>)}
      <button type="button" className="btn secondary" disabled={busy || !discussionSectors.includes(thread.sector)} onClick={() => { setReplyTo(replyTo === thread.id ? null : thread.id); setReply(''); }}>{replyTo === thread.id ? 'Cancel reply' : 'Reply'}</button>
      {replyTo === thread.id && discussionSectors.includes(thread.sector) && <form className="student-class-post-form" onSubmit={async event => { event.preventDefault(); if (!reply.trim()) return; setBusy(true); setError(''); try { await classroomWrite(path + '/' + segment(thread.id) + '/replies', 'POST', { body: reply.trim() }); setReplyTo(null); setReply(''); await refresh(); } catch (failure) { setError(failure.message); if (failure.code === 'BOARD_DISABLED' || isSectorAccessError(failure)) onRefreshClass(); } finally { setBusy(false); } }}><label>Your reply<textarea value={reply} onChange={event => setReply(event.target.value)} rows={3} maxLength={2000} required autoFocus /></label><button className="btn" disabled={busy || !reply.trim()} type="submit">{busy ? 'Posting…' : 'Post reply'}</button></form>}
    </article>)}
  </details>;
}

export default function StudentClass({ nameField, identityActions, onClassChange }) {
  const [connection, setConnection] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const connectionKey = useRef();
  const request = useRef(0);
  const mutating = useRef(false);
  const applyConnection = useCallback(async (result, forceRefresh = false) => {
    const key = JSON.stringify(result.classroom);
    const changed = connectionKey.current !== undefined && connectionKey.current !== key;
    connectionKey.current = key;
    setConnection(result);
    if (forceRefresh || changed) {
      try { await onClassChange?.(); }
      catch { setError('Your class connection is saved, but sector access could not be refreshed. Use Retry access check above.'); }
    }
  }, [onClassChange]);
  const refresh = useCallback(async () => {
    if (mutating.current) return;
    const id = ++request.current;
    try { const result = await api('/v1/me/class'); if (id === request.current) { setError(''); await applyConnection(result); } }
    catch (failure) { if (id === request.current) setError(failure.message); }
    finally { if (id === request.current) setLoading(false); }
  }, [applyConnection]);
  useEffect(() => {
    refresh();
    const visible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('focus', visible);
    const interval = window.setInterval(visible, 20000);
    return () => { ++request.current; window.clearInterval(interval); document.removeEventListener('visibilitychange', visible); window.removeEventListener('focus', visible); };
  }, [refresh]);
  const join = async event => {
    event.preventDefault(); mutating.current = true; ++request.current; setBusy(true); setError(''); setNotice('');
    try { const result = await classroomWrite('/v1/me/class', 'PUT', { classCode: code.trim().toUpperCase() }); await applyConnection(result, true); setCode(''); setNotice('You are connected. Your teacher controls your available sectors and can see your saved learning progress.'); }
    catch (failure) { setError(failure.message); }
    finally { mutating.current = false; setBusy(false); }
  };
  const leave = async () => {
    mutating.current = true; ++request.current; setBusy(true); setError(''); setNotice('');
    try { await classroomWrite('/v1/me/class', 'DELETE'); await applyConnection({ classroom: null }, true); setConfirmLeave(false); setNotice('You left the class. All independently available sectors are restored. Your learning progress is preserved.'); }
    catch (failure) { setError(failure.message); }
    finally { mutating.current = false; setBusy(false); }
  };
  return <section className="student-class-connection" aria-label="Your class">
    <div className="identity-profile-row">
      {nameField}
      <form onSubmit={join} className="student-class-join">
        <label htmlFor="identity-class-code">Class code<input id="identity-class-code" value={connection?.classroom?.code || code} onChange={event => setCode(event.target.value)} readOnly={Boolean(connection?.classroom)} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={40} placeholder="Enter your class code" aria-describedby="identity-class-code-help" required /></label>
        <button type="submit" className="btn" disabled={busy || loading || Boolean(connection?.classroom) || !code.trim()}>{connection?.classroom ? 'Joined' : busy ? 'Joining…' : 'Join class'}</button>
        <p id="identity-class-code-help">{connection?.classroom ? 'Your saved progress is shared with this class.' : 'Enter the code from your faculty, then select Join class.'}</p>
      </form>
    </div>
    {identityActions}
    {loading && <p role="status">Checking your class connection…</p>}
    {connection?.classroom && <>
      <div className="student-class-connected"><div><span className="student-class-label">Connected class</span><h2>{connection.classroom.name}</h2><p>{connection.classroom.course} · {connection.classroom.section} · {connection.classroom.term}</p><small>{connection.facultyName}{connection.classroom.status === 'ARCHIVED' && ' · Archived'}</small></div><button className="btn secondary" disabled={busy} onClick={() => setConfirmLeave(true)} type="button">Leave class</button></div>
      {confirmLeave && <div className="student-class-leave" role="group" aria-label="Confirm leaving class"><p>Leave {connection.classroom.name}? Your faculty will lose access to your progress. Your saved work stays in your account.</p><button className="btn secondary" type="button" disabled={busy} onClick={() => setConfirmLeave(false)}>Stay in class</button><button className="btn" type="button" disabled={busy} onClick={leave}>{busy ? 'Leaving…' : 'Confirm leave'}</button></div>}
      <ClassConversations key={connection.classroom.id} classroom={connection.classroom} onRefreshClass={refresh} />
    </>}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="student-class-error" role="alert">{error} <button type="button" className="btn secondary" onClick={refresh}>Retry</button></p>}
  </section>;
}
