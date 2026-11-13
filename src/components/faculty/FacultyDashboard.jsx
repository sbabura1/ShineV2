import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Copy, LogOut, Moon, Sun, Users, X } from 'lucide-react';
import { useTheme } from '../../prototype/utils/theme';
import { classMetrics, activityLabel } from './facultyData';
import { api, segment } from '../../api/client';
import { classroomWrite } from '../../api/classrooms';
import { ClassesHome, Overview, Roster, Discussions, ClassSettings, tabs, navigate, Avatar, Status, Empty } from './FacultyViews';
import { Modal, ClassForm, StudentForm } from './FacultyDialogs';
import './faculty.css';

const readRoute = () => {
  const [, , classId, tab] = window.location.hash.replace(/^#/, '').split('/');
  return { classId, tab: tabs.some(item => item.id === tab) ? tab : 'overview' };
};

export default function FacultyDashboard({ profile = {}, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [route, setRoute] = useState(readRoute);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const noticeTimer = useRef(null);
  const classroom = classes.find(item => item.id === route.classId);
  const loadClass = useCallback(async (id) => {
    const result = await api('/v1/faculty/classes/' + segment(id));
    setClasses(current => current.some(item => item.id === id) ? current.map(item => item.id === id ? result.classroom : item) : [...current, result.classroom]);
    setRefreshedAt(new Date());
    return result.classroom;
  }, []);
  const refresh = useCallback(async () => {
    if (route.classId) return loadClass(route.classId);
    const result = await api('/v1/faculty/classes');
    if (readRoute().classId) return;
    setClasses(result.classes.map(item => ({ ...item, students: [], discussions: [], loaded: false })));
    setRefreshedAt(new Date());
  }, [route.classId, loadClass]);
  useEffect(() => {
    let active = true;
    const fetchCurrent = async () => {
      try { await refresh(); if (active) setError(''); }
      catch (failure) { if (active) setError(failure.message); }
      finally { if (active) setLoading(false); }
    };
    setLoading(true); fetchCurrent();
    const timer = setInterval(() => { if (!document.hidden && !busy) fetchCurrent(); }, 20000);
    const visible = () => { if (!document.hidden && !busy) fetchCurrent(); };
    document.addEventListener('visibilitychange', visible);
    return () => { active = false; clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [refresh, busy]);
  useEffect(() => {
    const update = () => { setRoute(readRoute()); setModal(null); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const notify = message => { clearTimeout(noticeTimer.current); setNotice(message); noticeTimer.current = setTimeout(() => setNotice(''), 4500); };
  const perform = async action => {
    setBusy(true); setError('');
    try { return await action(); }
    catch (failure) { setError(failure.message); throw failure; }
    finally { setBusy(false); }
  };
  const classPath = classroom ? '/v1/faculty/classes/' + segment(classroom.id) : '';
  const updateClass = changes => perform(async () => {
    const result = await classroomWrite(classPath, 'PATCH', { expectedVersion: classroom.rev, ...changes });
    await loadClass(classroom.id); return result.classroom;
  });
  const copy = async (text, success) => { try { await navigator.clipboard.writeText(text); notify(success); } catch { setModal({ type: 'copy', text }); } };
  const invitation = student => 'Hi ' + student.name + ', join ' + classroom.name + ' (' + classroom.course + ', ' + classroom.section + ') in Scalaris. Enter the class code ' + classroom.code + ' in My Identity to connect to our class.';
  const logout = async () => {
    setSigningOut(true); setError('');
    try { await onLogout(); }
    catch (failure) { setError(failure.message || 'Unable to sign out. Please try again.'); setSigningOut(false); }
  };
  const createClass = values => perform(async () => {
    const result = await classroomWrite('/v1/faculty/classes', 'POST', values);
    setModal(null); navigate(result.classroom.id); notify('Class created. Your class code is ready to share.');
  });
  const saveStudent = values => perform(async () => {
    if (classroom.students.some(student => student.id !== modal.student?.id && student.email.toLowerCase() === values.email.toLowerCase())) throw new Error('A student with this email is already in this class.');
    const editing = modal.type === 'edit';
    await classroomWrite(classPath + '/invitations' + (editing ? '/' + segment(modal.student.id) : ''), editing ? 'PATCH' : 'POST', { ...values, ...(editing ? { expectedVersion: modal.student.rev } : {}) });
    setModal(null); await loadClass(classroom.id); notify(editing ? 'Invitation updated.' : 'Invitation added. Copy it from the roster to share.');
  });
  const removeStudent = () => perform(async () => {
    const student = modal.student;
    await classroomWrite(classPath + (student.connected ? '/students/' : '/invitations/') + segment(student.id), 'DELETE');
    setModal(null); await loadClass(classroom.id); notify(student.connected ? 'Student disconnected. Their saved work is preserved.' : 'Invitation removed.');
  });
  const reply = (post, body) => perform(async () => {
    await classroomWrite('/v1/classes/' + segment(classroom.id) + '/discussions/' + segment(post.id) + '/replies', 'POST', { body });
    await loadClass(classroom.id);
  });
  const review = post => perform(async () => {
    await classroomWrite(classPath + '/discussions/' + segment(post.id), 'PATCH', { reviewed: !post.reviewed, expectedVersion: post.rev });
    await loadClass(classroom.id);
  });
  return <div className="app faculty-app">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content').focus(); }}>Skip to content</a>
    <header className="faculty-topbar">
      <div className="fd-brand-area"><a className="brand" href="#/faculty" aria-label="Scalaris faculty home"><span className="planet-mark" aria-hidden="true" /><span><span className="brand-title">SCALARIS</span><span className="brand-sub">THE NEXUS</span></span></a><span className="fd-workspace-label">Faculty workspace</span></div>
      <div className="faculty-account-actions">
        <button type="button" className="fd-icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
        <div className="fd-account"><Avatar name={profile.name || 'Faculty'} /><span><strong>{profile.name || 'Faculty account'}</strong><small>Faculty</small></span></div>
        <button type="button" className="fd-icon-button" disabled={signingOut} onClick={logout} aria-label={signingOut ? 'Signing out' : 'Sign out'} title="Sign out"><LogOut size={18} /></button>
      </div>
    </header>
    <main className="faculty-dashboard" id="main-content" tabIndex={-1}>
      <nav className="fd-breadcrumb" aria-label="Breadcrumb"><a href="#/faculty">Faculty</a><ChevronRight size={14} />{classroom ? <><a href="#/faculty">Classes</a><ChevronRight size={14} /><span aria-current="page">{classroom.course}</span></> : <span aria-current="page">Classes</span>}</nav>
      {error && <div className="faculty-error" role="alert">{error} <button className="fd-text-button" onClick={() => refresh().then(() => setError('')).catch(failure => setError(failure.message))}>Retry</button></div>}
      {loading && (!classroom || !classroom.loaded) ? <><h1>{route.classId ? 'Your class' : 'Your classes'}</h1><p role="status">Loading your workspace…</p></> : route.classId && !classroom ? <><h1>Class unavailable</h1><Empty title="Unable to open this class">Return to your classes or retry the request.</Empty><button className="fd-button" onClick={() => navigate()}>Back to classes</button></> : classroom ? <>
        <button className="fd-text-button fd-back" onClick={() => navigate()}><ArrowLeft size={16} />All classes</button>
        <div className="fd-page-heading fd-class-heading"><div><div className="fd-course-meta">{classroom.course}<span>·</span>{classroom.term}<span>·</span>{classroom.section}</div><h1>{classroom.name}</h1><p>A shared journey. Individual growth.</p></div></div>
        <section className="fd-invite-banner" aria-label="Invite students"><div><Users size={20} /><span><strong>Bring your class together</strong><small>Students can join using your class code in My Identity.</small></span></div><button className="fd-code-button" onClick={() => copy(classroom.code, 'Class code copied.')} aria-label={'Copy class code ' + classroom.code}><span>{classroom.code}</span><Copy size={16} /><span className="fd-code-copy">Copy code</span></button></section>
        <nav className="fd-tabs" aria-label="Class navigation">{tabs.map(({ id, label, icon: Icon }) => <a key={id} href={'#/faculty/' + classroom.id + '/' + id} aria-current={route.tab === id ? 'page' : undefined}><Icon size={17} />{label}{id === 'discussions' && classMetrics(classroom).needsReview > 0 && <span>{classMetrics(classroom).needsReview}</span>}</a>)}</nav>
        <div key={classroom.id + '/' + route.tab} className="fd-class-content">
          {route.tab === 'overview' && <Overview classroom={classroom} onSelectStudent={student => setModal({ type: 'student', student })} />}
          {route.tab === 'roster' && <Roster classroom={classroom} onInvite={() => setModal({ type: 'invite' })} onEdit={student => setModal({ type: 'edit', student })} onRemove={student => setModal({ type: 'remove', student })} onCopy={student => copy(invitation(student), 'Invitation copied. Ready to share.')} />}
          {route.tab === 'discussions' && <Discussions classroom={classroom} onReply={reply} onReview={review} busy={busy} />}
          {route.tab === 'settings' && <ClassSettings classroom={classroom} onUpdate={updateClass} notify={notify} />}
        </div>
      </> : <ClassesHome classes={classes} onCreate={() => setModal({ type: 'create' })} />}
      <footer className="fd-footer"><span><span className="fd-demo-dot" />Connected workspace</span><span>{busy ? 'Saving…' : refreshedAt ? 'Updated ' + refreshedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ' · Refreshes every 20 seconds' : 'Progress loads from saved student work.'}</span><span>Learning with perspective.</span></footer>
    </main>
    {notice && <div className="fd-toast" role="status"><Check size={18} /><span>{notice}</span><button className="fd-icon-button" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button></div>}
    {modal?.type === 'create' && <ClassForm onClose={() => setModal(null)} onCreate={createClass} />}
    {classroom && ['invite', 'edit'].includes(modal?.type) && <StudentForm student={modal.student} onClose={() => setModal(null)} onSave={saveStudent} />}
    {classroom && modal?.type === 'remove' && <Modal title={'Remove ' + modal.student.name + '?'} description={'Disconnect this student from ' + classroom.name + '. Their learning records will be preserved.'} onClose={() => setModal(null)}><div className="fd-dialog-actions"><button className="fd-button fd-secondary" disabled={busy} onClick={() => setModal(null)}>Keep student</button><button className="fd-button fd-danger-button" disabled={busy} onClick={() => removeStudent().catch(() => {})}>{busy ? 'Removing…' : 'Remove student'}</button></div></Modal>}
    {modal?.type === 'copy' && <Modal title="Copy and share" description="Select the text below to copy it manually." onClose={() => setModal(null)}><textarea className="fd-copy-fallback" aria-label="Text to copy" rows={5} readOnly value={modal.text} onFocus={event => event.target.select()} autoFocus /></Modal>}
    {classroom && modal?.type === 'student' && <Modal title={modal.student.name} description={modal.student.email} onClose={() => setModal(null)}><Status student={modal.student} /><dl className="fd-student-details"><div><dt>Missions completed</dt><dd>{modal.student.missions}</dd></div><div><dt>Baseline accuracy</dt><dd>{modal.student.accuracy === null ? '—' : modal.student.accuracy + '%'}</dd></div><div><dt>Discussion posts</dt><dd>{modal.student.posts}</dd></div><div><dt>Last active</dt><dd>{activityLabel(modal.student.lastActive)}</dd></div></dl><p className="fd-form-note">Accuracy uses the scored baseline questions. A dash means no scored result is available.</p></Modal>}
  </div>;
}
