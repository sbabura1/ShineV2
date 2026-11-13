import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Copy, GraduationCap, LayoutGrid, MessageSquare, Plus, Search, Settings2, Users } from 'lucide-react';
import { classMetrics, getStudentStatus, sectors, activityLabel, discussionTime } from './facultyData';

export const tabs = [{ id: 'overview', label: 'Overview', icon: LayoutGrid }, { id: 'roster', label: 'Roster', icon: Users }, { id: 'discussions', label: 'Discussions', icon: MessageSquare }, { id: 'settings', label: 'Settings', icon: Settings2 }];
export const navigate = (id, tab = 'overview') => { window.location.hash = id ? `/faculty/${id}/${tab}` : '/faculty'; };
const sectorName = id => sectors.find(item => item.id === id)?.name || (id ? id[0].toUpperCase() + id.slice(1) : 'Not started');
export function Avatar({ name }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('');
  const tint = [...name].reduce((sum, char) => sum + char.codePointAt(0), 0) % 3;
  return <span className={`fd-avatar fd-avatar-${tint}`} aria-hidden="true">{initials}</span>;
}
export function Status({ student }) { const status = getStudentStatus(student); return <span className={`fd-status ${status === 'Check in' ? 'fd-status-warning' : ''}`}>{status}</span>; }
export function Empty({ title, children }) { return <div className="fd-empty"><h3>{title}</h3><p>{children}</p></div>; }

function ClassCard({ classroom }) {
  const metrics = classMetrics(classroom);
  return <button type="button" className="fd-class-card" onClick={() => navigate(classroom.id)} aria-label={`Open ${classroom.name}`}>
    <div className="fd-class-card-top"><span>{classroom.course}<span className="fd-dot">·</span>{classroom.section}</span><ArrowUpRight size={18} /></div>
    <h2>{classroom.name}</h2><p>{classroom.term}</p>
    <div className="fd-card-students"><span className="fd-avatar-stack">{classroom.students.slice(0, 3).map(student => <Avatar key={student.id} name={student.name} />)}</span><span>{metrics.students} students</span></div>
    <div className="fd-card-progress"><div><span>Class code</span><strong>{classroom.code}</strong></div></div>
    <div className="fd-class-card-footer"><span className={metrics.needsReview ? 'fd-review-count' : ''}><MessageSquare size={15} />{metrics.needsReview ? `${metrics.needsReview} to review` : 'Discussions up to date'}</span><span>Open class <ArrowRight size={15} /></span></div>
  </button>;
}

export function ClassesHome({ classes, onCreate }) {
  const totalStudents = classes.map(classMetrics).reduce((sum, item) => sum + item.students, 0);
  const pendingClasses = classes.filter(classroom => classMetrics(classroom).needsReview > 0);
  const pendingCount = classes.reduce((sum, classroom) => sum + classMetrics(classroom).needsReview, 0);
  return <>
    <div className="fd-page-heading"><div><h1>Your classes</h1><p>A little guidance. A world of growth.</p></div><button className="fd-button" onClick={onCreate}><Plus size={18} />Create class</button></div>
    <div className="fd-home-summary"><span><strong>{classes.length}</strong> current {classes.length === 1 ? 'class' : 'classes'}</span><span><strong>{totalStudents}</strong> connected students</span><span><strong>{pendingCount}</strong> discussions to review</span></div>
    <section className="fd-classes-section" aria-label="Current classes"><div className="fd-section-heading"><h2>Current classes</h2><span>Your workspace</span></div><div className="fd-class-grid">{classes.map(classroom => <ClassCard key={classroom.id} classroom={classroom} />)}</div></section>
    <div className="fd-home-bottom"><section className="fd-panel"><div className="fd-section-heading"><h2>Ready for your perspective</h2><span>{pendingCount} to review</span></div><p className="fd-section-description">Keep the conversation moving with a little feedback.</p>
      {pendingCount ? <div className="fd-review-list">{pendingClasses.map(classroom => <button key={classroom.id} onClick={() => navigate(classroom.id, 'discussions')} className="fd-review-row"><MessageSquare size={18} /><div><strong>{classroom.name}</strong><span>{classMetrics(classroom).needsReview} discussions awaiting review</span></div><ChevronRight size={17} /></button>)}</div> : <Empty title={classes.length ? "You're all caught up" : 'Create your first class'}>{classes.length ? 'New student discussions will appear here.' : 'Create a class above, then share its code with your students.'}</Empty>}
    </section><aside className="fd-panel fd-teaching-note"><GraduationCap size={26} strokeWidth={1.5} /><h2>Every class starts<br /> with a connection.</h2><p>Share your class code to bring students into your learning community. Their progress and conversations will follow.</p>{classes.length > 0 && <button className="fd-text-button" onClick={() => navigate(classes[0].id, 'roster')}>View a class roster <ArrowRight size={16} /></button>}<span className="fd-note-footer">Explore. Reason. Connect.</span></aside></div>
  </>;
}

function ProgressTable({ classroom, onSelectStudent }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All students');
  const students = classroom.students.filter(item => item.connected && `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase()) && (status === 'All students' || getStudentStatus(item) === status));
  return <section className="fd-panel fd-progress-panel"><div className="fd-section-heading"><h2>Student progress</h2><span>{students.length} {students.length === 1 ? 'student' : 'students'}</span></div>
    <div className="fd-toolbar"><label className="fd-search"><Search size={17} /><span className="fd-sr-only">Search student progress</span><input placeholder="Search students…" value={search} onChange={event => setSearch(event.target.value)} /></label><label><span className="fd-sr-only">Progress status</span><select aria-label="Progress status" value={status} onChange={event => setStatus(event.target.value)}><option>All students</option><option>In progress</option><option>Check in</option><option>Not started</option></select></label></div>
    {students.length ? <div className="fd-table-wrap"><table className="fd-table fd-progress-table"><thead><tr><th>Student</th><th>Status</th><th className="fd-numeric">Missions</th><th className="fd-numeric">Accuracy</th><th>Last active</th><th><span className="fd-sr-only">Action</span></th></tr></thead><tbody>{students.map(student => <tr key={student.id}><td><div className="fd-person"><Avatar name={student.name} /><span><strong>{student.name}</strong><small>{sectorName(student.sector)}</small></span></div></td><td><Status student={student} /></td><td className="fd-numeric">{student.missions}</td><td className="fd-numeric">{student.accuracy === null ? '—' : `${student.accuracy}%`}</td><td>{activityLabel(student.lastActive)}</td><td><button className="fd-icon-button" aria-label={`View ${student.name}`} onClick={() => onSelectStudent(student)}><ChevronRight size={18} /></button></td></tr>)}</tbody></table></div> : <Empty title={search || status !== 'All students' ? 'No matching students' : 'Your class is ready'}>{search || status !== 'All students' ? 'Try a different name or status.' : 'Share your class code to welcome your first students.'}</Empty>}
    <p className="fd-panel-footnote">Check-ins are coaching prompts, not grades. A dash means no assessment recorded.</p>
  </section>;
}

export function Overview({ classroom, onSelectStudent }) {
  const sectorOptions = classroom.sectors || sectors;
  const metrics = classMetrics(classroom);
  const connected = classroom.students.filter(item => item.connected);
  return <>
    <dl className="fd-metrics"><div><dt>Students</dt><dd>{metrics.students}</dd><small>{metrics.invited} invitations pending</small></div><div><dt>Missions completed</dt><dd>{metrics.missions}</dd><small>Across this class</small></div><div><dt>Baseline accuracy</dt><dd>{metrics.accuracy === null ? '—' : `${metrics.accuracy}%`}</dd><small>{metrics.assessed} students assessed</small></div><div><dt>Discussion posts</dt><dd>{classroom.discussions.length}</dd><small>{metrics.needsReview} awaiting your review</small></div></dl>
    <div className="fd-overview-grid"><ProgressTable classroom={classroom} onSelectStudent={onSelectStudent} /><aside className="fd-panel fd-sector-panel"><div className="fd-section-heading"><h2>Sector activity</h2><BookOpen size={18} /></div><p className="fd-section-description">Where your students are exploring.</p><div className="fd-sector-list">{classroom.monitored.map(id => {
      const count = connected.filter(student => student.sectorsStarted?.includes(id)).length;
      return <div key={id} className="fd-sector"><div><strong>{sectorName(id)}</strong><span>{count}/{metrics.students}</span></div><p>{sectorOptions.find(item => item.id === id)?.description}</p><progress max={metrics.students || 1} value={count} aria-label={`${sectorName(id)} students started`} /></div>;
    })}</div>{!classroom.monitored.length && <p>Select sectors in class settings.</p>}<div className="fd-check-in"><span className={`fd-status ${metrics.checkIns ? 'fd-status-warning' : ''}`}>{metrics.checkIns} check-ins suggested</span><p>{metrics.checkIns ? 'A quick conversation can help students find their next step.' : 'Keep the conversation going as students find their rhythm.'}</p></div></aside></div>
  </>;
}

export function Roster({ classroom, onInvite, onEdit, onRemove, onCopy }) {
  const [search, setSearch] = useState('');
  const students = classroom.students.filter(student => `${student.name} ${student.email}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="fd-panel"><div className="fd-section-heading"><div><h2>Your students <span className="fd-inline-count">{classroom.students.length}</span></h2><p className="fd-section-description">A shared space starts with an invitation.</p></div><button className="fd-button" onClick={onInvite}><Plus size={17} />Invite student</button></div>
    <div className="fd-toolbar"><label className="fd-search"><Search size={17} /><span className="fd-sr-only">Search roster</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name or email…" /></label><span className="fd-muted">{classroom.students.filter(student => student.connected).length} connected · {classroom.students.filter(student => !student.connected).length} invited</span></div>
    {students.length ? <div className="fd-table-wrap"><table className="fd-table fd-roster-table"><thead><tr><th>Student</th><th>Email address</th><th>Connection</th><th>Actions</th></tr></thead><tbody>{students.map(student => <tr key={student.id}><td><div className="fd-person"><Avatar name={student.name} /><strong>{student.name}</strong></div></td><td>{student.email}</td><td><span className={`fd-status ${student.connected ? 'fd-status-connected' : ''}`}>{student.connected ? 'Connected' : 'Invited'}</span></td><td><div className="fd-row-actions"><button className="fd-icon-button" onClick={() => onCopy(student)} aria-label={`Copy invitation for ${student.name}`} title="Copy invitation"><Copy size={16} /></button>{!student.connected && <button className="fd-text-button" onClick={() => onEdit(student)}>Edit<span className="fd-sr-only"> {student.name}</span></button>}<button className="fd-text-button fd-remove" onClick={() => onRemove(student)}>Remove<span className="fd-sr-only"> {student.name}</span></button></div></td></tr>)}</tbody></table></div> : <Empty title={search ? 'No matching students' : 'Room for your first student'}>{search ? 'Try a different name or email address.' : 'Invite a student or share your class code to get started.'}</Empty>}
    <p className="fd-panel-footnote">Invited students appear as connected after joining with your class code. Email invitations are copied for you to share.</p>
  </section>;
}

export function Discussions({ classroom, onReply, onReview, busy }) {
  const sectorOptions = classroom.sectors || sectors;
  const [sector, setSector] = useState('all');
  const [review, setReview] = useState('all');
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const posts = classroom.discussions.filter(post => (sector === 'all' || post.sector === sector) && (review === 'all' || (review === 'reviewed' ? post.reviewed : !post.reviewed)));
  return <section className="fd-panel"><div className="fd-section-heading"><div><h2>Class conversations</h2><p className="fd-section-description">Good questions deserve a thoughtful conversation.</p></div><span>{classMetrics(classroom).needsReview} to review</span></div>
    <div className="fd-toolbar fd-discussion-filters"><label><span className="fd-sr-only">Filter by sector</span><select aria-label="Filter by sector" value={sector} onChange={event => setSector(event.target.value)}><option value="all">All sectors</option>{sectorOptions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span className="fd-sr-only">Filter by review status</span><select aria-label="Filter by review status" value={review} onChange={event => setReview(event.target.value)}><option value="all">All review statuses</option><option value="pending">Needs review</option><option value="reviewed">Reviewed</option></select></label><span className="fd-muted">{posts.length} conversations</span></div>
    {error && <p role="alert" className="faculty-error">{error}</p>}
    <div className="fd-threads">{posts.map(post => {
      const author = classroom.students.find(student => student.id === post.studentId)?.name || post.author || 'Former student';
      const boardOff = !classroom.boards.includes(post.sector);
      return <article className="fd-thread" key={post.id}><div className="fd-thread-meta"><Avatar name={author} /><div><strong>{author}</strong><span>{sectorName(post.sector)} · {discussionTime(post.createdAt)}{boardOff && ' · Board off'}</span></div><span className={'fd-status ' + (post.reviewed ? 'fd-status-connected' : 'fd-status-warning')}>{post.reviewed ? <><Check size={13} />Reviewed</> : 'Needs review'}</span></div><h3>{post.title}</h3><p className="fd-thread-body">{post.body}</p>
        {post.replies.map(item => <div className="fd-faculty-reply" key={item.id}><strong>{item.author}<span> · {item.authorRole === 'faculty' ? 'Faculty' : 'Student'}</span></strong><p>{item.body}</p></div>)}
        <div className="fd-thread-actions"><button disabled={busy || boardOff || classroom.status === 'ARCHIVED'} className="fd-text-button" onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); setReply(''); }}><MessageSquare size={16} />{replyTo === post.id ? 'Cancel reply' : 'Reply'}</button><button disabled={busy} className="fd-text-button" onClick={() => onReview(post).catch(failure => setError(failure.message))}><Check size={16} />{post.reviewed ? 'Mark as unread' : 'Mark reviewed'}</button><span>{post.replies.length} replies</span></div>
        {replyTo === post.id && <form className="fd-reply-form" onSubmit={async event => { event.preventDefault(); if (!reply.trim()) return; setError(''); try { await onReply(post, reply.trim()); setReply(''); setReplyTo(null); } catch (failure) { setError(failure.message); } }}><label htmlFor={'reply-' + post.id}>Your reply</label><textarea id={'reply-' + post.id} autoFocus rows={3} maxLength={2000} required value={reply} onChange={event => setReply(event.target.value)} placeholder="Add your perspective…" /><button type="submit" className="fd-button" disabled={busy || !reply.trim()}>{busy ? 'Posting…' : 'Post reply'}</button></form>}
      </article>;
    })}</div>
    {!posts.length && <Empty title="No conversations here yet">{classroom.discussions.length ? 'Try a different sector or review status.' : 'Student questions and ideas will appear here as the class starts exploring.'}</Empty>}
  </section>;
}

export function ClassSettings({ classroom, onUpdate, notify }) {
  const sectorOptions = classroom.sectors || sectors;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(classroom.rev);
  const [draft, setDraft] = useState(() => ({ name: classroom.name, course: classroom.course, term: classroom.term, section: classroom.section, allowedSectors: [...(classroom.allowedSectors ?? classroom.monitored)], boards: [...classroom.boards] }));
  const toggle = (field, id) => setDraft(current => ({ ...current, [field]: current[field].includes(id) ? current[field].filter(item => item !== id) : [...current[field], id] }));
  return <section className="fd-panel fd-settings-panel"><h2>Class settings</h2><p className="fd-section-description">Make this learning space your own.</p><form className="fd-form" onSubmit={async event => {
    event.preventDefault(); if (!draft.name.trim() || !draft.course.trim() || !draft.section.trim() || !draft.term.trim()) return;
    setSaving(true); setError('');
    try { const result = await onUpdate({ ...draft, monitored: draft.allowedSectors, expectedVersion: revision, name: draft.name.trim(), course: draft.course.trim(), section: draft.section.trim(), term: draft.term.trim() }); setRevision(result.rev); notify('Class settings saved.'); }
    catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  }}>
    <div className="fd-settings-fields"><label>Class name<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} required maxLength={100} pattern=".*\S.*" /></label><label>Course code<input value={draft.course} onChange={event => setDraft({ ...draft, course: event.target.value })} required maxLength={24} pattern=".*\S.*" /></label><label>Term<input value={draft.term} onChange={event => setDraft({ ...draft, term: event.target.value })} required maxLength={40} pattern=".*\S.*" /></label><label>Section<input value={draft.section} onChange={event => setDraft({ ...draft, section: event.target.value })} required maxLength={40} pattern=".*\S.*" /></label></div>
    <fieldset className="fd-sector-settings"><legend>Sectors available to students</legend><p>All sectors stay visible in the Nexus. Unchecked sectors are disabled for enrolled students after you save. Their saved progress is kept. These selections also control your class overview.</p><div>{sectorOptions.map(sector => <label key={sector.id}><input type="checkbox" checked={draft.allowedSectors.includes(sector.id)} onChange={() => toggle('allowedSectors', sector.id)} /><span><strong>{sector.name}</strong><small>{sector.description}</small></span></label>)}</div>{draft.allowedSectors.length === 0 && <p role="status">No sectors selected. Students can still access their identity and pre-assessment.</p>}</fieldset>
    <fieldset className="fd-board-settings"><legend>Discussion boards</legend><p>Students can post and reply only when a sector is available and its board is On. Turning a board Off keeps existing conversations read-only. Allowing a sector does not turn its board On.</p>{sectorOptions.map(sector => <label key={sector.id}><span>{sector.name}{!draft.allowedSectors.includes(sector.id) && <small className="fd-muted"> · Sector unavailable to students</small>}</span><span className="fd-switch-label">{draft.boards.includes(sector.id) ? 'On' : 'Off'}<input type="checkbox" role="switch" aria-label={`${sector.name} discussion board`} checked={draft.boards.includes(sector.id)} onChange={() => toggle('boards', sector.id)} /></span></label>)}</fieldset>
    {error && <p className="faculty-error" role="alert">{error}</p>}<div className="fd-settings-save"><button type="submit" disabled={saving} className="fd-button">{saving ? 'Saving…' : 'Save class settings'}</button></div>
  </form></section>;
}
