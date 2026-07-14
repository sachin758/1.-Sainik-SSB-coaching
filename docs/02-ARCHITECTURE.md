# 02 — Architecture Document
### GVC Sainik SSB Academy

**Status:** Draft v1.0
**Last updated:** 2026-07-14

---

## 1. Current State (Prototype)

The existing build is a static front end only:

```
gvc-site/
├── index.html          (shell + <section> placeholders, loader script)
├── styles.css
├── script.js            (all client logic: rendering, forms, admin/student UI)
└── sections/            (one HTML partial per page section)
```

- All "content" (courses, faculty, testimonials, students, settings, payments, activity log, media) lives in a **shared client-side key-value store** (`window.storage`), read/written directly from `script.js`.
- `script.js` also contains a stubbed API client (`apiFetch`) pointed at `http://localhost:4000/api`, showing the intended shape of the real backend, but nothing in the prototype actually calls a server for auth — login is simulated client-side.
- There is no real authentication, no database, and no server. This is fine for prototyping the UI/UX but is **not production-safe**: any visitor's browser can read/write the "admin" content store, and there is no password hashing or session security.

The rest of this document specifies the **target production architecture** that replaces the prototype's storage/auth layer while keeping the same front-end structure and visual design.

## 2. Target Architecture Overview

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│   Browser (SPA-ish  │  ───────────────────────▶ │   API Server (Node/  │
│   static front end)  │ ◀───────────────────────  │   Express)           │
│  index.html + JS      │                          │  /api/*              │
└─────────┬────────────┘                          └──────────┬───────────┘
          │                                                   │
          │ static assets                                    │ SQL
          ▼                                                   ▼
┌─────────────────────┐                          ┌──────────────────────┐
│  CDN / Static Host    │                          │   PostgreSQL          │
│  (Netlify/Vercel/S3)  │                          │   (primary database)  │
└─────────────────────┘                          └──────────────────────┘
                                                            │
                                                            ▼
                                                  ┌──────────────────────┐
                                                  │  Object Storage        │
                                                  │  (S3-compatible) for   │
                                                  │  gallery/media uploads │
                                                  └──────────────────────┘
                                                            │
                                                            ▼
                                                  ┌──────────────────────┐
                                                  │  Email provider (OTP,  │
                                                  │  password reset,       │
                                                  │  inquiry notifications)│
                                                  └──────────────────────┘
```

### Components

1. **Front end** — unchanged in structure: static HTML/CSS/JS, no build step required. Deployed to a static host/CDN. `API_BASE` is set via a small config value at deploy time (e.g. injected env var or a `config.js` the host writes) instead of `localhost:4000`.
2. **API server** — Node.js + Express (or equivalent) REST API. Stateless; horizontally scalable behind a load balancer if ever needed, but a single small instance is sufficient at launch (see 05-TRD.md for sizing).
3. **Database** — PostgreSQL. Chosen over a document store because the data is fundamentally relational (students ↔ courses ↔ payments ↔ activity log) and the academy will want basic reporting/joins (e.g. "payments by course").
4. **Object storage** — S3-compatible bucket for gallery/media images uploaded via the admin Media Library, replacing the prototype's base64-in-storage approach. The API issues signed upload URLs; the browser uploads directly to the bucket.
5. **Email provider** — transactional email (e.g. Postmark/SES) for: student password-reset OTPs, 2FA codes (if email-based), and optionally a copy of inquiry-form submissions to staff.
6. **Auth** — JWT access tokens (short-lived) issued by the API on login, stored client-side in the same `Session` object pattern already in `script.js` (swap `localStorage` for an httpOnly cookie in production — see 03-RULES.md, security).

## 3. Why this stack

- **No build step on the front end** — keeps the deliverable simple to hand to non-developer staff or a cheap static host; matches how the prototype already works (plain `<script src>` files, no bundler).
- **Boring, well-understood backend (Node/Express/Postgres)** — the team maintaining this is likely small; operational simplicity outranks cutting-edge tooling.
- **Single database** — all entities (courses, faculty, selections, testimonials, messages, students, payments, activity log, media metadata, settings) map cleanly to Postgres tables; see 07-BACKEND.md for the schema.
- **Object storage separate from the DB** — images should never be stored as base64 blobs in a relational database in production; only URLs/metadata live in Postgres.

## 4. Environments

| Environment | Purpose | Data |
|---|---|---|
| Local | Developer machines | Seeded/sample data, `API_BASE=http://localhost:4000/api` |
| Staging | Internal QA, content-preview before publishing | Copy of production schema, dummy/test data |
| Production | Live public site | Real data, backed up nightly |

## 5. Request Flow Examples

**Public page load:** browser fetches static `index.html` from CDN → loader script fetches each `sections/*.html` partial (static, cached) → `script.js` calls `GET /api/content` (public, no auth) to hydrate courses/faculty/testimonials/faqs/settings/banner from the database.

**Admin edit:** admin logged in (JWT in session) → edits a course → `PUT /api/courses/:id` with `Authorization: Bearer <token>` → API validates role, writes to Postgres, appends an activity-log row → response triggers a front-end re-render; the public `GET /api/content` endpoint now reflects the change for all visitors (short cache TTL, e.g. 30–60s, or cache-busted on admin save).

**Student password reset:** student submits email → API creates a one-time OTP row (short expiry) → email provider sends the code → student submits OTP + new password → API verifies, hashes new password, invalidates the OTP.

## 6. Security Boundary

- Public endpoints: read-only content needed for the marketing site (courses, faculty, testimonials, FAQs, banner, settings-that-are-safe-to-expose).
- Authenticated endpoints: everything under `/api/admin/*` and `/api/student/*`, gated by JWT + role check (`admin` vs `student`) on every request. See 03-RULES.md and 07-BACKEND.md for the full authorization matrix.
- No client-side code is ever trusted for authorization decisions — the front end may hide UI, but the API independently re-checks role/ownership on every request (e.g. a student can only ever fetch their own record).

## 7. Deployment Topology (suggested)

- Front end: static hosting with CDN (e.g. Netlify/Vercel/CloudFront+S3).
- API: single small container/VM (e.g. Fly.io, Render, or a small EC2/DigitalOcean droplet) behind HTTPS (managed TLS).
- Database: managed Postgres (e.g. RDS, Supabase, Neon) with automated daily backups and point-in-time recovery.
- Object storage: managed S3-compatible bucket with a CDN in front for gallery images.
- Secrets (DB URL, JWT signing key, email API key) live in the hosting platform's environment variable store — never committed to the repo.

## 8. Open Questions / Future Extensions

- Payment gateway integration (Razorpay/PayU) — settings already reserve a `gateway` toggle; wiring it up is a v2 item.
- SMS-based OTP as an alternative/addition to email.
- Role granularity beyond `admin`/`student` (e.g. a "counsellor" role limited to Messages + Students, not Settings) — the schema in 07-BACKEND.md is designed to support this later without a migration.
