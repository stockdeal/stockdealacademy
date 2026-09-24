# SDA Backend

Express + Prisma + PostgreSQL API for auth (login/register) and the admin dashboard.

## Setup

1. Copy the env file and fill in secrets:
   ```bash
   cp .env.example .env
   ```
2. Get a Postgres instance running and point `DATABASE_URL` at it. Easiest local option (needs Docker Desktop running):
   ```bash
   docker compose up -d
   ```
3. Install dependencies (already done if you ran this from the assistant session):
   ```bash
   npm install
   ```
4. Create the `users` table:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Create your first admin account (reads `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`):
   ```bash
   npm run seed:admin
   ```
6. Start the API:
   ```bash
   npm run dev
   ```
   Listens on `http://localhost:4000` by default. Health check: `GET /api/health`.

## Endpoints

- `POST /api/auth/register` — `{ name, email, phone?, password }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me` — current session user
- `GET /api/admin/users` — admin-only, lists all users

Auth uses an httpOnly session cookie (`token`), not a bearer token — the frontend fetch calls already send `credentials: "include"`.

## Frontend wiring

The static site's `assets/js/auth.js` talks to this API. It assumes the API runs on
`http://localhost:4000` when the frontend is served from port 5173 (our local dev setup),
and falls back to a same-origin `/api` otherwise. Adjust `API_BASE` in that file if you
deploy the backend somewhere else.
