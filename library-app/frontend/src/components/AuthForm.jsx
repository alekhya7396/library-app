import { useState } from 'react';
import * as api from '../api';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data =
        mode === 'login'
          ? await api.login({ email: form.email, password: form.password })
          : await api.signup(form);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Library Desk</h1>
        <p className="muted">
          {mode === 'login' ? 'Log in to manage your books.' : 'Create an account to start cataloguing.'}
        </p>

        {mode === 'signup' && (
          <label>
            Name
            <input value={form.name} onChange={set('name')} required autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            minLength={6}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <p className="alert" role="alert">{error}</p>}

        <button className="btn primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <p className="switch">
          {mode === 'login' ? 'No account yet?' : 'Already registered?'}{' '}
          <button
            type="button"
            className="link"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}
