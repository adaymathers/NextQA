# QA Panel - Backend (Prisma)

This folder contains a production-ready backend scaffold using Express + Prisma + PostgreSQL.

Quick start (requires Docker):

1. Start Postgres locally with Docker:

```powershell
docker run --name qa-pg -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=qa -e POSTGRES_DB=qa -p 5432:5432 -d postgres:15
```

2. Copy `.env.example` to `.env` and edit if needed.

3. Install deps and generate Prisma client:

```powershell
cd backend-prisma
npm install
npx prisma generate
npx prisma migrate dev --name init
```

4. Run dev server:

```powershell
npm run dev
```

Notes:
- Auth uses simple JWT tokens. Use `POST /auth/register` and `POST /auth/login` to obtain a token and then include `Authorization: Bearer <token>` in subsequent requests.
- Uploads are stored under `uploads/` and served at `/uploads/<key>`.
- This is scaffold code for development; consider production hardening (CORS origin, HTTPS, token rotation, rate limiting, input validation, tests) before deploying.
