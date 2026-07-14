# GVC Academy Backend — Phase 1: Auth + Database Foundation

This is a real, runnable Node.js/Express + PostgreSQL backend. It's Phase 1 of
turning your frontend into a full academy management system — everything
after this (attendance, exams, fees, payments, etc.) will plug into the same
`users`, `courses` etc. tables and the same JWT auth pattern.

## What's included

- **PostgreSQL schema** (`src/db/schema.sql`) — `users`, `courses`, `students`,
  `faculty`, `admissions`, `notices`, `activity_log`.
- **Auth**: register (students self-serve), login, `/me`, bcrypt password
  hashing (12 rounds), JWT tokens.
- **Role-based access control**: `admin`, `faculty`, `student`. Admin accounts
  can only be created by an existing admin — never from public input.
- **Security defaults**: Helmet headers, CORS allow-list, rate limiting
  (stricter on login/register), parameterized SQL everywhere (prevents SQL
  injection), centralized error handling that never leaks stack traces.
- **Example CRUD module**: `courses` — public read, admin-only write. Use this
  as the template for the next modules (attendance, fees, exams...).

## 1. Set up a database

You have three realistic options:

| Option | Good for | Notes |
|---|---|---|
| **Railway** or **Render** (managed Postgres) | Fastest way to get a real database with zero server admin | Free/cheap tier, gives you a `DATABASE_URL` directly, auto-backups on paid tiers |
| **Supabase** | Same as above, plus a nice admin UI to browse tables | Also gives a `DATABASE_URL` |
| **Your own VPS** (DigitalOcean, Hetzner) running Postgres | Full control, cheapest at scale | You manage backups, security patches, updates yourself |

For a first deployment, I'd suggest **Render** or **Railway** for both the
database *and* this API — they can host a Node app and a Postgres database
together, you get HTTPS automatically, and you avoid Nginx/Docker setup until
you actually need it.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — from your provider's dashboard (Render/Railway/Supabase all show this directly).
- `JWT_SECRET` — generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — your first admin login. Change the password immediately after first login in a later phase (password-change endpoint isn't built yet).
- `CORS_ORIGINS` — the URL(s) your frontend will be served from (e.g. your Render static site URL, or `http://localhost:5500` while developing locally).

## 3. Install and migrate

```bash
npm install
npm run migrate    # creates all tables and seeds your first admin account
npm run dev         # starts the API on http://localhost:4000
```

## 4. Try it

```bash
# Register a student
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"student@test.com","password":"testpass123"}'

# Log in as admin (use the SEED_ADMIN_EMAIL/PASSWORD from your .env)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gvcacademy.in","password":"your_seed_password"}'
# -> copy the returned "token"

# Use the token to view/create courses as admin
curl -X POST http://localhost:4000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"SSB Interview Batch","duration":"3 months","fee":25000}'

curl http://localhost:4000/api/courses   # public, no token needed
```

## 5. Connecting your existing frontend

Your `2__index.html` currently reads/writes through a mock `storage`
key-value layer. The next step is swapping those calls for real `fetch()`
calls to this API, e.g.:

```js
async function login(email, password) {
  const res = await fetch('https://your-api-url/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  localStorage.setItem('token', data.token); // or an in-memory store
  return data.user;
}
```

Every protected request then sends `Authorization: Bearer <token>`.

## Roadmap — how the rest of your feature list attaches here

Each of these becomes a new controller + routes file, following the exact
pattern of `courseController.js` / `courseRoutes.js` (public GET, protected
writes with `requireRole`):

1. **Admissions module** — `POST /api/admissions` (public form submission), `GET /api/admissions` (admin, with search/filter), approve/reject endpoints that create a `student` user on approval.
2. **Attendance** — daily attendance table keyed by student + date + course, faculty can mark, students/admin can view reports.
3. **Exams & results** — exams table, marks table, report-card generation (PDF, using the `pdf` toolkit you already have available).
4. **Fee management** — payments table, Razorpay order-creation endpoint + webhook to verify payment signature server-side, receipt generation.
5. **Study material** — file upload to S3-compatible storage (Render/Railway don't persist local disk uploads), metadata in a `materials` table.
6. **Notifications** — email via a provider like Resend/SendGrid, SMS/WhatsApp via Twilio or an Indian provider like MSG91 — all triggered server-side after DB writes (e.g. "admission approved").
7. **Gallery & blog** — same public-read/admin-write CRUD pattern as courses.
8. **Reports & analytics** — aggregate SQL queries (counts/trends) exposed as admin-only endpoints, charted on the frontend.
9. **SEO** — this lives in the frontend (meta tags, `sitemap.xml`, `robots.txt`, Open Graph tags) — no backend change needed, happy to do this on the HTML file directly.
10. **Deployment hardening** — once you're ready to go beyond Render/Railway, I can add a `Dockerfile` + `docker-compose.yml` + Nginx reverse-proxy config for VPS deployment.

Tell me which of these to build next and I'll add it the same way — a
working module you can test immediately, on top of this foundation.
