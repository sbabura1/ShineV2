import { useCallback, useEffect, useState } from 'react';
import { api, segment } from '../../api/client';
import { classroomWrite } from '../../api/classrooms';
import { discussionTime } from '../../components/faculty/facultyData';
import './student-class.css';

function ClassConversations({ classroom }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState('');
  const path = '/v1/classes/' + segment(classroom.id) + '/discussions';
  const refresh = useCallback(async () => {
    try { const result = await api(path); setPosts(result.discussions); setError(''); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }, [path]);
  useEffect(() => { refresh(); }, [refresh]);
  const post = async event => {
    event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form);
    const body = { title: fields.get('title').trim(), body: fields.get('body').trim(), sector: fields.get('sector') };
    if (!body.title || !body.body) return;
    setBusy(true); setError('');
    try { await classroomWrite(path, 'POST', body); form.reset(); await refresh(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  return <details className="student-class-conversations" onToggle={event => { if (event.currentTarget.open) refresh(); }}><summary>Class conversations <span>{posts.length}</span></summary>
    <p>Share a question or a perspective with your class.</p>
    {error && <p className="student-class-error" role="alert">{error} <button type="button" className="btn secondary" onClick={refresh}>Retry</button></p>}
    {classroom.status === 'ACTIVE' && classroom.boards.length > 0 && <form onSubmit={post} className="student-class-post-form"><label>Sector<select name="sector">{classroom.boards.map(id => <option key={id} value={id}>{id[0].toUpperCase() + id.slice(1)}</option>)}</select></label><label>Question or title<input name="title" maxLength={150} required pattern=".*\S.*" /></label><label>Your perspective<textarea name="body" maxLength={4000} rows={3} required /></label><button className="btn" disabled={busy} type="submit">{busy ? 'Posting…' : 'Post to class'}</button></form>}
    {loading ? <p role="status">Loading conversations…</p> : posts.length === 0 ? <p>No conversations yet. Start with a question.</p> : posts.map(thread => <article className="student-class-thread" key={thread.id}><small>{thread.author || 'Class member'} · {discussionTime(thread.createdAt)} · {thread.sector}</small><h3>{thread.title}</h3><p>{thread.body}</p>{thread.replies.map(item => <blockquote key={item.id}><strong>{item.author || 'Class member'}{item.authorRole === 'faculty' ? ' · Faculty' : ''}</strong><p>{item.body}</p></blockquote>)}
      <button type="button" className="btn secondary" disabled={busy || classroom.status !== 'ACTIVE' || !classroom.boards.includes(thread.sector)} onClick={() => { setReplyTo(replyTo === thread.id ? null : thread.id); setReply(''); }}>{replyTo === thread.id ? 'Cancel reply' : 'Reply'}</button>
      {replyTo === thread.id && <form className="student-class-post-form" onSubmit={async event => { event.preventDefault(); if (!reply.trim()) return; setBusy(true); setError(''); try { await classroomWrite(path + '/' + segment(thread.id) + '/replies', 'POST', { body: reply.trim() }); setReplyTo(null); setReply(''); await refresh(); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }}><label>Your reply<textarea value={reply} onChange={event => setReply(event.target.value)} rows={3} maxLength={2000} required autoFocus /></label><button className="btn" disabled={busy || !reply.trim()} type="submit">{busy ? 'Posting…' : 'Post reply'}</button></form>}
    </article>)}
  </details>;
}

export default function StudentClass({ nameField, identityActions }) {
  const [connection, setConnection] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const refresh = useCallback(async () => {
    try { const result = await api('/v1/me/class'); setConnection(result); setError(''); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const visible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => document.removeEventListener('visibilitychange', visible);
  }, [refresh]);
  const join = async event => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await classroomWrite('/v1/me/class', 'PUT', { classCode: code.trim().toUpperCase() }); setConnection(result); setCode(''); setNotice('You are connected. Your faculty can now see your saved learning progress.'); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const leave = async () => {
    setBusy(true); setError(''); setNotice('');
    try { await classroomWrite('/v1/me/class', 'DELETE'); setConnection({ classroom: null }); setConfirmLeave(false); setNotice('You left the class. Your learning progress is preserved.'); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
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
      <ClassConversations key={connection.classroom.id} classroom={connection.classroom} />
    </>}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="student-class-error" role="alert">{error} <button type="button" className="btn secondary" onClick={refresh}>Retry</button></p>}
  </section>;
}
