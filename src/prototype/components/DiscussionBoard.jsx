import React, { useEffect, useState } from 'react';
import { sectors } from '../data';
import { useSavedState } from '../utils/useSavedState';

const keyFor = (sectorId) => `discussion:${sectorId}`;
const emptyBoard = { enabled: true, threads: [] };
const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
const stamp = (date) => new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export function FacultyDiscussionSettings() {
  return (
    <section className="discussion-faculty" aria-label="Faculty discussion board settings">
      <div className="eyebrow">Faculty settings</div>
      <h3>Sector Discussion Boards</h3>
      <p>Turn discussion boards on or off by sector. Existing conversations are retained while a board is off.</p>
      <div className="faculty-board-list">
        {sectors.map((sector) => <FacultyDiscussionToggle key={sector.id} sector={sector} />)}
      </div>
    </section>
  );
}

function FacultyDiscussionToggle({ sector }) {
  const [board, setBoard] = useSavedState(keyFor(sector.id), emptyBoard);
  return (
    <div className="faculty-board-row">
      <span>{sector.icon} {sector.name}</span>
      <button type="button" className="btn secondary" role="switch" aria-checked={board.enabled} onClick={() => setBoard((current) => ({ ...current, enabled: !current.enabled }))}>
        {board.enabled ? 'On — turn off' : 'Off — turn on'}
      </button>
    </div>
  );
}

export default function SectorDiscussion({ sector, identity, viewerRole }) {
  const [board, setBoard] = useSavedState(keyFor(sector.id), emptyBoard);
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Question');
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const faculty = viewerRole === 'faculty';

  useEffect(() => {
    const receive = (event) => {
      if (event.key?.endsWith(keyFor(sector.id)) && event.newValue) {
        try { setBoard(JSON.parse(event.newValue)); } catch { /* Ignore malformed external storage. */ }
      }
    };
    window.addEventListener('storage', receive);
    return () => window.removeEventListener('storage', receive);
  }, [sector.id, setBoard]);

  if (!board.enabled && !faculty) return null;
  const author = () => ({ name: faculty ? identity.faculty : identity.name, role: faculty ? 'Faculty' : 'Student', avatar: faculty ? '🎓' : identity.avatar });
  const post = (event) => {
    event.preventDefault();
    if (!board.enabled || !title.trim() || !body.trim()) return;
    const thread = { id: makeId(), title: title.trim(), body: body.trim(), category, author: author(), created: new Date().toISOString(), replies: [] };
    setBoard((current) => ({ ...current, threads: [thread, ...current.threads] }));
    setTitle(''); setBody(''); setStatus('Your discussion has been posted.');
  };
  const sendReply = (event, id) => {
    event.preventDefault();
    if (!board.enabled || !reply.trim()) return;
    const entry = { id: makeId(), body: reply.trim(), author: author(), created: new Date().toISOString() };
    setBoard((current) => ({ ...current, threads: current.threads.map((thread) => thread.id === id ? { ...thread, replies: [...thread.replies, entry] } : thread) }));
    setReply(''); setReplyTo(null); setStatus('Your reply has been posted.');
  };

  return (
    <section className="card discussion-board" aria-label={`${sector.name} discussion board`}>
      <div className="discussion-heading">
        <div><div className="eyebrow">{sector.name} Community</div><h2>Discussion Board</h2><p>Share results, ask questions, and compare your reasoning with classmates.</p></div>
        <span className="tag">{board.enabled ? '● On' : '○ Off'}</span>
      </div>
      <div aria-live="polite" className="discussion-status">{status}</div>
      {!board.enabled ? <div className="callout">The discussion board is turned off. Faculty can restore it from My Identity.</div> : <>
        <button type="button" className="btn secondary" aria-expanded={expanded} onClick={() => setExpanded((open) => !open)}>{expanded ? 'Hide discussions' : `Open discussions (${board.threads.length})`}</button>
        {expanded && <div className="discussion-content">
          <div className="callout">Support your ideas with evidence, be respectful, and avoid posting personal information.</div>
          <form onSubmit={post} className="discussion-form">
            <h3>Start a discussion</h3>
            <label>Topic type<select value={category} onChange={(event) => setCategory(event.target.value)}>{['Question', 'Results', 'Compare reasoning', 'Resource'].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} required placeholder="What would you like to discuss?" /></label>
            <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} required rows={4} placeholder="Explain your question or result and the evidence behind it." /></label>
            <button type="submit" className="btn" disabled={!title.trim() || !body.trim()}>Post discussion</button>
          </form>
          {!board.threads.length && <p>No discussions yet. Start the first conversation for {sector.name}.</p>}
          {board.threads.map((thread) => <article key={thread.id} className="discussion-thread">
            <div className="discussion-meta"><span className="tag">{thread.category}</span><span>{thread.author.avatar} {thread.author.name} · {thread.author.role} · {stamp(thread.created)}</span></div>
            <h3>{thread.title}</h3><p className="discussion-message">{thread.body}</p>
            {faculty && <button type="button" className="btn secondary" onClick={() => setBoard((current) => ({ ...current, threads: current.threads.filter((item) => item.id !== thread.id) }))}>Remove discussion</button>}
            {thread.replies.map((item) => <div key={item.id} className="discussion-reply"><div className="discussion-meta">{item.author.avatar} {item.author.name} · {item.author.role} · {stamp(item.created)}</div><p className="discussion-message">{item.body}</p></div>)}
            <button type="button" className="btn secondary" onClick={() => { setReplyTo(thread.id); setReply(''); }}>Reply ({thread.replies.length})</button>
            {replyTo === thread.id && <form onSubmit={(event) => sendReply(event, thread.id)} className="discussion-form"><label>Your reply<textarea value={reply} onChange={(event) => setReply(event.target.value)} maxLength={4000} rows={3} required /></label><button type="submit" className="btn" disabled={!reply.trim()}>Post reply</button><button type="button" className="btn secondary" onClick={() => setReplyTo(null)}>Cancel</button></form>}
          </article>)}
        </div>}
      </>}
    </section>
  );
}
