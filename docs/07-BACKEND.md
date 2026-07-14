# 07 — Backend Document
### API Contract, Data Model & Server Configuration

**Status:** Draft v1.0
**Last updated:** 2026-07-14

---

## 1. Base Configuration

- Base URL: `https://api.<domain>/api` in production; `http://localhost:4000/api` locally (matches the `API_BASE` already referenced in `script.js`).
- All requests/responses: JSON (`Content-Type: application/json`), except file uploads (`multipart/form-data`).
- Auth: `Authorization: Bearer <JWT>` header on all non-public endpoints.
- Errors: always `{ "error": "human readable message" }` with an appropriate HTTP status code — the front end's `apiFetch` helper already expects and surfaces this shape.

## 2. Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signing key for access tokens |
| `JWT_EXPIRES_ADMIN` | e.g. `8h` |
| `JWT_EXPIRES_STUDENT` | e.g. `24h` |
| `EMAIL_API_KEY` | Transactional email provider key |
| `EMAIL_FROM` | Sender address for OTP/reset emails |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Object storage for media |
| `CORS_ORIGIN` | Comma-separated allowed front-end origins |
| `NODE_ENV` | `development` / `staging` / `production` |

## 3. Data Model (PostgreSQL)

```sql
-- Admin users
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  two_fa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,       -- e.g. GVC2024-041
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  course TEXT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'inactive'
  attendance_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Password reset OTPs (students)
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,     -- 'army' | 'airforce' | 'ssb'
  code TEXT NOT NULL,         -- NDA, CDS, AFCAT, ...
  badge TEXT,
  name TEXT NOT NULL,
  eligibility TEXT,
  age_range TEXT,
  duration TEXT,
  price INTEGER NOT NULL,
  old_price INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Faculty
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Selections (results wall)
CREATE TABLE selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entry TEXT,      -- e.g. 'TGC-144th Course'
  air TEXT,         -- e.g. 'AIR 34'
  sort_order INTEGER DEFAULT 0
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  sort_order INTEGER DEFAULT 0
);

-- Inquiry messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FAQs
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL,   -- 'UPI' | 'Bank Transfer' | 'Cash'
  paid_on DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Media library
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  filename TEXT,
  used_in TEXT[],     -- e.g. array of entity references, for delete-warning UX
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id),
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site settings (single row)
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT,
  tagline TEXT,
  logo_initials TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  hours TEXT,
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  footer_text TEXT,
  seo_title TEXT,
  seo_desc TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  two_fa_enabled BOOLEAN DEFAULT false,
  banner_active BOOLEAN DEFAULT false,
  banner_text TEXT,
  payment_methods JSONB,   -- {upi:true, bank:true, cash:true, gateway:false}
  upi_id TEXT,
  bank_name TEXT,
  bank_acc_name TEXT,
  bank_acc_number TEXT,
  bank_ifsc TEXT,
  CHECK (id = 1)
);
```

## 4. API Endpoints

### 4.1 Public (no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/api/content` | Returns all public content in one payload: courses, faculty, selections, testimonials, faqs, banner, settings (public-safe subset) |
| POST | `/api/messages` | Submit inquiry form |

### 4.2 Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login (username + password) → returns JWT, or a flag indicating 2FA is required |
| POST | `/api/auth/verify-2fa` | Verify admin 2FA code → returns JWT |
| POST | `/api/auth/student-register` | Student self-registration |
| POST | `/api/auth/student-login` | Student login (email + password) → JWT |
| POST | `/api/auth/forgot-password` | Request OTP (student) |
| POST | `/api/auth/reset-password` | Submit OTP + new password |
| POST | `/api/auth/logout` | Invalidate current token (if using a server-side blocklist) |

### 4.3 Student (auth required, role=student)

| Method | Path | Description |
|---|---|---|
| GET | `/api/student/me` | Own profile, attendance, results, course/batch info |
| GET | `/api/student/materials` | Own downloadable study material list |
| PATCH | `/api/student/me` | Edit own editable fields (phone/email) |

### 4.4 Admin (auth required, role=admin)

| Method | Path | Description |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/admin/courses[/:id]` | Course CRUD |
| GET/POST/PUT/DELETE | `/api/admin/faculty[/:id]` | Faculty CRUD |
| GET/POST/PUT/DELETE | `/api/admin/selections[/:id]` | Selections CRUD |
| GET/POST/PUT/DELETE | `/api/admin/testimonials[/:id]` | Testimonials CRUD |
| GET/POST/PUT/DELETE | `/api/admin/faqs[/:id]` | FAQ CRUD |
| GET/DELETE | `/api/admin/messages[/:id]` | View/delete inquiries |
| GET/POST/PUT/PATCH/DELETE | `/api/admin/students[/:id]` | Student CRUD, `PATCH .../:id/status`, `POST .../:id/reset-password` |
| GET/POST/DELETE | `/api/admin/payments[/:id]` | Payment records |
| GET | `/api/admin/media` | List media |
| POST | `/api/admin/media/upload-url` | Get a signed upload URL for direct-to-bucket upload |
| DELETE | `/api/admin/media/:id` | Delete media (warns via `used_in` first, per 03-RULES.md) |
| GET/PUT | `/api/admin/settings` | Read/update site settings |
| GET/DELETE | `/api/admin/activity-log` | View/clear activity log (clear = archive, not hard delete — 03-RULES.md §9) |
| GET | `/api/admin/reports/csv?entity=` | CSV export per entity |
| GET | `/api/admin/backup` | Full JSON backup export |
| POST | `/api/admin/backup/restore` | Restore from JSON backup (confirmation required client-side) |
| GET | `/api/admin/overview` | Dashboard counts (courses, faculty, students, unread messages, etc.) |

## 5. Authorization Rules (enforced server-side, not just hidden in UI)

- Every `/api/admin/*` route requires a valid admin JWT; every `/api/student/*` route requires a valid student JWT.
- `GET /api/student/me` and `PATCH /api/student/me` always resolve the student from the JWT's subject claim — never from a client-supplied ID — so a student can never fetch or edit another student's data (03-RULES.md §1).
- Password hashes are never included in any API response, including admin-facing student list/detail endpoints.

## 6. Rate Limiting (see also 03-RULES.md §2, 05-TRD.md §5)

| Endpoint | Limit |
|---|---|
| `/api/auth/login`, `/api/auth/student-login` | 10 attempts / 15 min / IP |
| `/api/auth/forgot-password` | 5 requests / hour / email |
| `/api/auth/verify-2fa`, `/api/auth/reset-password` | 10 attempts / 15 min / IP |

## 7. Notes on Migrating from the Prototype's `apiFetch`

The prototype's `script.js` already contains an `apiFetch(path, { method, body, auth, isForm })` helper and a `Session` object matching this contract almost exactly — implementing the endpoints above should require **no changes to the calling convention already used in the front end**, only:

1. Pointing `API_BASE` at the real deployed API.
2. Replacing the direct `window.storage` reads (`loadAllContent`, `storageGet`, `storageSet`) with calls to `GET /api/content` (public data) and the relevant `/api/admin/*` endpoints (admin-only data), matching the `STORAGE_KEYS` entity names 1:1 to the tables above.
3. Wiring the login forms to actually call `/api/auth/login` / `/api/auth/student-login` instead of the current client-side simulation, and storing the real returned JWT in `Session.token`.
