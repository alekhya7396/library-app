// API base URL comes from an environment variable (see .env.example)
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const getToken = () => localStorage.getItem('token');

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const signup = (b) => request('/api/auth/signup', { method: 'POST', body: b });
export const login = (b) => request('/api/auth/login', { method: 'POST', body: b });
export const fetchBooks = (search = '') =>
  request(`/api/books${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const addBook = (b) => request('/api/books', { method: 'POST', body: b });
export const updateBook = (id, b) => request(`/api/books/${id}`, { method: 'PUT', body: b });
export const deleteBook = (id) => request(`/api/books/${id}`, { method: 'DELETE' });
