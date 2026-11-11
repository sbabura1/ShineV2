import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

export function Modal({ title, description, children, onClose }) {
  const ref = useRef(null);
  const returnFocus = useRef(document.activeElement);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    dialog.querySelector('input, textarea, select')?.focus();
    return () => { dialog.close(); returnFocus.current?.focus(); };
  }, []);
  return <dialog className="fd-dialog" ref={ref} aria-labelledby="fd-dialog-title" aria-describedby={description ? 'fd-dialog-description' : undefined} onCancel={onClose} onClick={event => {
    if (event.target !== ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <div className="fd-dialog-heading"><h2 id="fd-dialog-title">{title}</h2><button className="fd-icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
    {description && <p id="fd-dialog-description">{description}</p>}{children}
  </dialog>;
}

export function ClassForm({ onClose, onCreate }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name').trim();
    const course = data.get('course').trim();
    const section = data.get('section').trim();
    if (name && course && section) {
      setSaving(true); setError('');
      try { await onCreate({ name, course, section, term: data.get('term') }); }
      catch (failure) { setError(failure.message); setSaving(false); }
    }
  };
  return <Modal title="Create a new class" description="Make a space for your students to explore, discuss, and grow." onClose={onClose}>
    <form onSubmit={submit} className="fd-form">
      <label>Class name<input name="name" placeholder="e.g. Quantitative Reasoning" required maxLength={100} autoFocus pattern=".*\S.*" /></label>
      <div className="fd-form-pair"><label>Course code<input name="course" placeholder="e.g. QR 101" required maxLength={24} pattern=".*\S.*" /></label><label>Section<input name="section" placeholder="e.g. Section 01" required maxLength={40} pattern=".*\S.*" /></label></div>
      <label>Term<select name="term" defaultValue="Fall 2026"><option>Fall 2026</option><option>Spring 2027</option><option>Summer 2027</option></select></label>
      <p className="fd-form-note">A class code will be ready to share as soon as you create your class.</p>
      {error && <p className="faculty-error" role="alert">{error}</p>}
      <div className="fd-dialog-actions"><button type="button" disabled={saving} className="fd-button fd-secondary" onClick={onClose}>Cancel</button><button className="fd-button" disabled={saving} type="submit"><Plus size={17} />{saving ? 'Creating…' : 'Create class'}</button></div>
    </form>
  </Modal>;
}

export function StudentForm({ student, onClose, onSave }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  return <Modal title={student ? 'Edit student' : 'Invite a student'} description="Prepare an invitation, then copy and share it with your student." onClose={onClose}>
    <form className="fd-form" onSubmit={async event => {
      event.preventDefault(); const data = new FormData(event.currentTarget); const name = data.get('name').trim();
      if (name) {
        setSaving(true); setError('');
        try { await onSave({ name, email: data.get('email').trim() }); }
        catch (failure) { setError(failure.message); setSaving(false); }
      }
    }}>
      <label>Student name<input name="name" defaultValue={student?.name} placeholder="Full name" required autoFocus maxLength={80} pattern=".*\S.*" /></label>
      <label>Student email<input type="email" name="email" defaultValue={student?.email} placeholder="student@example.edu" required maxLength={150} /></label>
      {error && <p className="faculty-error" role="alert">{error}</p>}
      <p className="fd-form-note">Students connect using your class code. Copy invitations to share through your email system.</p>
      <div className="fd-dialog-actions"><button type="button" disabled={saving} className="fd-button fd-secondary" onClick={onClose}>Cancel</button><button className="fd-button" disabled={saving} type="submit">{saving ? 'Saving…' : student ? 'Save changes' : 'Add invitation'}</button></div>
    </form>
  </Modal>;
}
