# 05 — Technical Requirements Document (TRD)
### GVC Sainik SSB Academy

**Status:** Draft v1.0
**Last updated:** 2026-07-14

---

## 1. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Front end | Static HTML/CSS/vanilla JS | No build step, no framework — matches current implementation; sections loaded via `fetch()` at runtime |
| Backend API | Node.js + Express (or Fastify) | REST, JSON over HTTPS |
| Database | PostgreSQL | Relational data (see 07-BACKEND.md for schema) |
| Object storage | S3-compatible bucket | Gallery/media images only |
| Auth | JWT (access token) + bcrypt password hashing | See 03-RULES.md for policy |
| Email | Transactional email API (e.g. SES/Postmark) | OTP, password reset, optional inquiry notifications |
| Hosting (front end) | Static host + CDN | e.g. Netlify/Vercel/CloudFront |
| Hosting (API + DB) | Managed small VM/container + managed Postgres | e.g. Render/Fly.io + Neon/Supabase/RDS |

## 2. Browser Support

- Latest 2 versions of Chrome, Safari, Edge, Firefox (desktop and mobile).
- iOS Safari and Chrome on Android as primary mobile targets (majority of inquiry traffic is expected on mobile).
- No support requirement for Internet Explorer.
- Graceful degradation: if JavaScript fails to load a section partial, the placeholder should not leave a broken/blank gap that looks like an error — log to console and consider a minimal inline fallback for critical sections (nav, contact) in a future iteration.

## 3. Performance Budgets

| Metric | Target |
|---|---|
| Largest Contentful Paint (mobile, 4G) | < 2.5s |
| Total page weight (public homepage, first load) | < 1.5 MB |
| Gallery/media images | Max 1600px long edge, compressed (WebP preferred, JPEG fallback) |
| Time to Interactive | < 3.5s on mid-range mobile |
| API p95 response time (read endpoints) | < 300ms |
| API p95 response time (write endpoints) | < 600ms |

## 4. Availability & Reliability

- Target uptime: 99.5% (single small-institute site; does not warrant multi-region redundancy at this stage).
- Database: automated daily backups, retained 30 days minimum, with point-in-time recovery if the managed provider supports it.
- API should fail gracefully: if the database is briefly unreachable, return a clear 5xx JSON error (`{ "error": "..." }`) rather than hanging — the front end's `apiFetch` already expects this shape and surfaces `err.message` to the user.

## 5. Security Requirements

- All traffic over HTTPS only (front end, API, and any admin/student endpoints) — no plain HTTP in production.
- Passwords hashed with bcrypt (cost factor ≥ 10) or equivalent; never logged or returned by any API response.
- JWT signing secret stored only in the API's environment configuration, rotated if ever suspected compromised.
- Rate limiting on all auth endpoints (login, register, forgot-password, OTP verify) — see 03-RULES.md §12.
- Input validation on every API endpoint (both type and business-rule validation per 03-RULES.md), never relying on front-end validation alone.
- CORS restricted to the known production/staging front-end origins.
- Dependency vulnerability scanning (e.g. `npm audit` / Dependabot) as part of CI.

## 6. Data Requirements

- All entities described in 07-BACKEND.md's schema must support standard CRUD via the API, with server-side validation matching 03-RULES.md.
- Soft-delete semantics required for: students, payments (per 03-RULES.md). Hard delete acceptable for: messages, media (once confirmed unreferenced).
- Activity log retention: minimum 12 months, independent of the admin-facing "clear log" UI action (see 03-RULES.md §9).

## 7. Testing Requirements

- **Unit tests** for all business-rule validation described in 03-RULES.md (e.g. `oldPrice > price`, password length, OTP expiry).
- **Integration tests** for every API endpoint in 07-BACKEND.md, covering both success and authorization-failure paths (e.g. a student token must never be able to fetch another student's record).
- **Manual QA checklist** before each release covering: responsive layout at 375px/768px/1280px widths, dark mode, keyboard navigation through nav/forms/modals, and the full flows in 06-APP-FLOW.md.
- **Accessibility check**: automated (e.g. axe) plus manual keyboard-only pass on forms and modals before launch.

## 8. Observability

- Centralized API logging (request method/path/status/latency), excluding any sensitive fields (passwords, tokens, OTPs).
- Error tracking (e.g. Sentry) for the API to catch unhandled exceptions in production.
- Basic uptime monitoring/alerting (e.g. a scheduled health-check hitting `GET /api/health`).

## 9. Environments & Configuration

- Environment variables required by the API (see 07-BACKEND.md for the full list): database connection string, JWT secret, email provider API key, object storage credentials, allowed CORS origin(s).
- The front end's `API_BASE` must be configurable per environment (local/staging/production) without editing `script.js` directly — e.g. a small generated `config.js` loaded before `script.js`, or a build-time environment substitution if a lightweight build step is introduced later.

## 10. Migration Path from Prototype

1. Stand up the Postgres schema (07-BACKEND.md) and the Express API.
2. Replace `window.storage`-based reads/writes in `script.js` with `apiFetch` calls to the corresponding endpoints (the `apiFetch` helper and `Session` object already exist in the prototype and are designed for this swap).
3. Seed the database from the current `DEFAULTS` object in `script.js` as initial content (courses, faculty, testimonials, FAQs, settings) so the live site isn't empty on cutover.
4. Replace the placeholder client-side login checks with real calls to `/api/auth/login` (admin) and `/api/auth/student-login` (student), storing the returned JWT via the existing `Session` object.
5. Point the Media Library at the object-storage upload flow instead of storing base64 in the client-side store.
6. Turn off/remove the `window.storage` fallback once the migration is verified in staging.
