import { useState } from 'react';

const EMPTY = { title: '', author: '', category: '', status: 'Available' };

export default function BookForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(
    editing
      ? { title: editing.title, author: editing.author, category: editing.category, status: editing.status }
      : EMPTY
  );
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const ok = await onSave(form);
    setBusy(false);
    if (ok && !editing) setForm(EMPTY);
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{editing ? 'Edit book' : 'Add a book'}</h2>
      <label>
        Title
        <input value={form.title} onChange={set('title')} required />
      </label>
      <label>
        Author
        <input value={form.author} onChange={set('author')} required />
      </label>
      <label>
        Category
        <input value={form.category} onChange={set('category')} placeholder="Fiction, Science, History…" required />
      </label>
      <label>
        Availability
        <select value={form.status} onChange={set('status')}>
          <option>Available</option>
          <option>Issued</option>
        </select>
      </label>
      <div className="row">
        <button className="btn primary" disabled={busy}>
          {editing ? 'Save changes' : 'Add book'}
        </button>
        {editing && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
