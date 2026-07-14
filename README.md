# GVC Sainik SSB Academy — Website, Student Portal & Admin Dashboard

A single web platform for GVC Sainik SSB Academy (Gwalior/Seoni, Madhya Pradesh) covering:

- A **public marketing site** (courses, faculty, results, testimonials, FAQ, contact/inquiry form)
- A **Student Portal** (register/login, attendance, results, study material)
- An **Admin Dashboard** (manage every piece of site content, students, payments, and settings — no code required)

> **Status:** Front-end prototype. All UI/UX and interactions are fully built and working; content currently persists to a shared browser-side key-value store and login is simulated client-side. See [`docs/05-TRD.md`](docs/05-TRD.md) §10 for the migration path to a real backend (already spec'd in `docs/07-BACKEND.md`).

---

## Project Structure

```
gvc-site/
├── index.html              # Shell page — placeholders + loader script only
├── styles.css              # All styling (design tokens, layout, components)
├── script.js                # All client logic (rendering, forms, admin/student UI)
├── sections/                 # One HTML partial per page section (see below)
│   ├── header.html
│   ├── hero.html
│   ├── founder.html
│   ├── about.html
│   ├── why.html
│   ├── courses.html
│   ├── ssb.html
│   ├── faculty.html
│   ├── selections.html
│   ├── gallery.html
│   ├── testimonials.html
│   ├── faq.html
│   ├── contact.html
│   ├── footer.html
│   ├── admin-modal.html
│   ├── student-modal.html
│   ├── student-dashboard.html
│   └── admin-dashboard.html
└── docs/                      # Full product & technical documentation
    ├── 01-PRD.md               # Product Requirements Document
    ├── 02-ARCHITECTURE.md       # System architecture (current + target production)
    ├── 03-RULES.md              # Business rules, validation, access control
    ├── 04-DESIGN.md             # Visual design system (colors, type, components)
    ├── 05-TRD.md                # Technical Requirements Document
    ├── 06-APP-FLOW.md           # User/flow diagrams (Mermaid)
    └── 07-BACKEND.md            # API contract & database schema
```

`index.html` contains only empty containers tagged `data-include="sections/..."`. A small loader script at the bottom of `index.html` fetches each partial and injects it, then loads `script.js` once every section is in the DOM.

## Running Locally

Because sections are loaded via `fetch()`, opening `index.html` directly (double-click / `file://`) **will not work** — browsers block local file fetches for security. Serve the folder instead:

```bash
cd gvc-site
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

Any other static server works too (VS Code "Live Server" extension, `npx serve`, etc.).

## What's Implemented

**Public site**
- Hero with animated stat counters, Founder profile, About (mission/vision/timeline), Why Choose Us, Course catalog with category filters, SSB process explainer, Faculty grid, Selections wall, Gallery, Testimonials, FAQ accordion, Contact/inquiry form, sitewide banner, maintenance-mode screen, dark/light theme toggle, WhatsApp floating button.

**Student Portal**
- Register, Login, Forgot Password → OTP → Reset, Dashboard (profile, attendance, results, study material).

**Admin Dashboard**
- Login with optional 2FA, Overview counts, CRUD for Courses/Faculty/Selections/Testimonials/FAQs, Inquiries, Students (add/edit/deactivate/reset password), Media Library (upload/browse/delete), Payments, Activity Log, Reports & Backup (CSV/JSON export/import), Settings.

## Documentation

Start with [`docs/01-PRD.md`](docs/01-PRD.md) for the product overview, then:

| Doc | Covers |
|---|---|
| [01-PRD.md](docs/01-PRD.md) | Goals, personas, features, success criteria |
| [02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | Current prototype vs. target production architecture |
| [03-RULES.md](docs/03-RULES.md) | Roles/permissions, validation, security policy |
| [04-DESIGN.md](docs/04-DESIGN.md) | Color/type tokens, components, motion, accessibility |
| [05-TRD.md](docs/05-TRD.md) | Stack, performance/security/testing requirements, migration steps |
| [06-APP-FLOW.md](docs/06-APP-FLOW.md) | Flow diagrams for every major user journey |
| [07-BACKEND.md](docs/07-BACKEND.md) | Database schema and full REST API contract |

## Known Limitations (Prototype)

- Content (courses, students, testimonials, etc.) is stored in a shared browser-side key-value store, not a real database — anyone's browser can currently read/write it.
- Login (admin and student) is simulated client-side; there is no real password hashing or session security yet.
- `script.js` already contains an `apiFetch` helper and `Session` object shaped for a real backend (`API_BASE`), designed so the swap to the production API in `docs/07-BACKEND.md` requires minimal changes to the calling code.

## Next Steps

Follow the migration path in [`docs/05-TRD.md`](docs/05-TRD.md) §10: stand up the Postgres schema and Express API from `docs/07-BACKEND.md`, replace the client-side storage calls in `script.js` with real API calls, seed the database from the existing default content, and wire up real authentication.
