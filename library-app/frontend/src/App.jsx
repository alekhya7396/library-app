import { useEffect, useState, useCallback } from 'react';
import * as api from './api';
import AuthForm from './components/AuthForm.jsx';
import BookForm from './components/BookForm.jsx';
import BookList from './components/BookList.jsx';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setBooks([]);
  }, []);

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) return logout();
      setError(err.message);
    },
    [logout]
  );

  // Load books (debounced while typing in the search box)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setBooks(await api.fetchBooks(search.trim()));
        setError('');
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [user, search, handleError]);

  const onAuth = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const saveBook = async (data) => {
    try {
      if (editing) {
        const updated = await api.updateBook(editing._id, data);
        setBooks((bs) => bs.map((b) => (b._id === updated._id ? updated : b)));
        setEditing(null);
      } else {
        const created = await api.addBook(data);
        setBooks((bs) => [created, ...bs]);
      }
      setError('');
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  };

  const toggleStatus = async (book) => {
    try {
      const updated = await api.updateBook(book._id, {
        status: book.status === 'Available' ? 'Issued' : 'Available',
      });
      setBooks((bs) => bs.map((b) => (b._id === updated._id ? updated : b)));
    } catch (err) {
      handleError(err);
    }
  };

  const removeBook = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await api.deleteBook(book._id);
      setBooks((bs) => bs.filter((b) => b._id !== book._id));
      if (editing?._id === book._id) setEditing(null);
    } catch (err) {
      handleError(err);
    }
  };

  if (!user) return <AuthForm onAuth={onAuth} />;

  const issued = books.filter((b) => b.status === 'Issued').length;

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Library Desk</h1>
        <div className="who">
          <span>{user.name}</span>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      {error && <p className="alert" role="alert">{error}</p>}

      <main className="layout">
        <aside>
          <BookForm
            key={editing?._id || 'new'}
            editing={editing}
            onSave={saveBook}
            onCancel={() => setEditing(null)}
          />
        </aside>

        <section>
          <div className="searchbar">
            <input
              type="search"
              placeholder="Search by title or author"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search books"
            />
            <span className="count">
              {books.length} {books.length === 1 ? 'book' : 'books'}, {issued} issued
            </span>
          </div>
          <BookList
            books={books}
            loading={loading}
            searching={!!search.trim()}
            onEdit={setEditing}
            onToggle={toggleStatus}
            onDelete={removeBook}
          />
        </section>
      </main>
    </div>
  );
}
