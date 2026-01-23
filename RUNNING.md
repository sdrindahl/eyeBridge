# Running the app (frontend + backend)

Quick steps to start the frontend (Vite) and backend (Express + SQLite).

1) Install dependencies

```bash
npm install
cd server
npm install
cd ..
```

2) Run frontend (dev)

```bash
npm run dev
```

Open: http://localhost:5173

3) Run backend (dev) in a second terminal

```bash
cd server
npm run dev
```

Server listens on `PORT` (default 3001). API base: http://localhost:3001/api

4) Production: build frontend and serve via backend

```bash
# from repo root
npm run build
npm start
```

5) Initialize database (optional)

```bash
cd server
npm run init-db
```

6) Environment variables

Create `server/.env` from `server/.env.example` and set a secure `JWT_SECRET`.

Example `server/.env`:

```
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_secure_value
DB_PATH=./eyebridge.db
NODE_ENV=production
```

Files added: `server/.env.example`, `RUNNING.md`.
