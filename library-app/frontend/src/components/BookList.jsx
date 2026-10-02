export default function BookList({ books, loading, searching, onEdit, onToggle, onDelete }) {
  if (loading && books.length === 0) return <p className="muted pad">Loading books…</p>;

  if (books.length === 0)
    return (
      <p className="muted pad">
        {searching ? 'No books match your search. Try a different title or author.' : 'No books yet. Add your first book using the form.'}
      </p>
    );

  return (
    <ul className="books">
      {books.map((b) => (
        <li key={b._id} className={`book ${b.status === 'Issued' ? 'is-issued' : 'is-available'}`}>
          <div className="info">
            <h3>{b.title}</h3>
            <p>
              {b.author} <span className="cat">{b.category}</span>
            </p>
          </div>
          <span className="badge">{b.status}</span>
          <div className="actions">
            <button className="btn small" onClick={() => onToggle(b)}>
              {b.status === 'Available' ? 'Mark issued' : 'Mark available'}
            </button>
            <button className="btn small ghost" onClick={() => onEdit(b)}>Edit</button>
            <button className="btn small danger" onClick={() => onDelete(b)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
