# Book Library Management System

React (Vite) + Node/Express + MongoDB (Mongoose).

## Run locally

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env     # fill in MONGODB_URI and JWT_SECRET
npm run dev              # http://localhost:5000
```

**2. Frontend**
```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm run dev              # http://localhost:5173
```

## API

| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Log in, returns token |
| GET | /api/books?search= | List / search by title or author |
| POST | /api/books | Add a book |
| PUT | /api/books/:id | Edit book or change status |
| DELETE | /api/books/:id | Delete a book |

Book routes need the header `Authorization: Bearer <token>`.

## Deploy

1. Push the whole project to GitHub.
2. **Render (backend):** New > Web Service > pick the repo.
   Root Directory `backend`, Build Command `npm install`, Start Command `npm start`.
   Environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (set after step 4).
   In MongoDB Atlas > Network Access, allow `0.0.0.0/0` so Render can connect.
3. Copy the Render URL (e.g. `https://library-api.onrender.com`).
4. **Netlify (frontend):** New site from Git. Base directory `frontend`,
   Build command `npm run build`, Publish directory `dist`.
   Environment variable: `VITE_API_URL` = your Render URL.
5. Back on Render, set `CLIENT_URL` to your Netlify URL (no trailing slash) and redeploy.
6. Test signup, login, add, edit, search, status change and delete on the live site.
