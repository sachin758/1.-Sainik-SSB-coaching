# 03 — Rules Document
### Business Rules, Validation & Access Control

**Status:** Draft v1.0
**Last updated:** 2026-07-14

---

This document is the single source of truth for validation and business logic. If the UI, API, and this document ever disagree, this document wins and the others should be corrected.

## 1. Roles & Permissions

| Action | Visitor | Student | Admin |
|---|:---:|:---:|:---:|
| View public site content | ✅ | ✅ | ✅ |
| Submit inquiry form | ✅ | ✅ | ✅ |
| Register/login to student portal | — | ✅ (self) | — |
| View own attendance/results/materials | — | ✅ (self only) | ✅ (any student) |
| Edit own student profile fields (phone/email) | — | ✅ | ✅ |
| Reset own password | — | ✅ | ✅ |
| CRUD courses/faculty/selections/testimonials/FAQs | — | — | ✅ |
| CRUD student records, reset student passwords | — | — | ✅ |
| View/delete inquiry messages | — | — | ✅ |
| Manage banner / maintenance mode | — | — | ✅ |
| Manage payments records | — | — | ✅ |
| View/clear activity log | — | — | ✅ |
| Export/import backups | — | — | ✅ |
| Edit site settings (identity, SEO, 2FA toggle) | — | — | ✅ |

A student can **never** read or modify another student's record, regardless of what the client sends — the API re-derives the student ID from the authenticated session, never from a client-supplied ID, for any "own data" endpoint.

## 2. Authentication Rules

- **Admin login:** username + password required. If 2FA is enabled in Settings, a valid 6-digit code is additionally required before a session token is issued.
- **Student login:** email + password.
- **Passwords (all users):** minimum 8 characters. No maximum below 128. Hashed with bcrypt (or equivalent) server-side; never stored or logged in plaintext, never returned by any API response.
- **Session tokens:** JWT, short expiry (recommend 24h for students, 8h for admin), refreshed on activity. Tokens are invalidated on logout and on password change.
- **Forgotten password (student):** email → OTP (6 digits, expires in 10 minutes, single use) → new password. Rate-limit OTP requests to prevent abuse (max 5 requests per email per hour).
- **Account lockout:** after 5 consecutive failed login attempts (admin or student), lock the account for 15 minutes and log the event to the Activity Log.

## 3. Student Record Rules

- Required fields to create a student: full name, phone, email, course.
- `studentId` is system-generated and unique (format: `GVC{year}-{sequence}`, e.g. `GVC2024-041`), never editable after creation.
- `username` must be unique across all students.
- A student's `status` is one of `active` / `inactive`. Inactive students cannot log in but their historical records (attendance, payments) are retained.
- Deleting a student is a **soft delete** (status change + retention) unless an admin explicitly confirms a hard delete — payment history must never silently disappear.
- Only Admin can reset a student's password; the new password must be shared with the student out-of-band (the API does not auto-email it in v1, to avoid sending credentials by email — see Security Notes).

## 4. Course Rules

- Required fields: category (`army` / `airforce` / `ssb`), code, name, eligibility, age range, duration, price.
- `oldPrice`, when present, must be greater than `price` (used to render a strikethrough discount) — the API rejects a save where `oldPrice <= price`.
- `badge` (e.g. "18 Seats Left") is free text set by admin; it is not derived automatically from an enrollment count in v1 — admins are responsible for keeping it current. (A future version could compute this from actual enrolled-student counts per course.)
- Category filter chips on the public site must always reflect the live set of categories present in the course list — do not hardcode categories in the front end.

## 5. Content Publishing Rules

- Any admin edit to public-facing content (courses, faculty, selections, testimonials, FAQs, banner text) must be reflected on the public site without requiring a code deploy.
- The site-wide **banner** has an `active` boolean; when false, it must not render at all (not just be visually hidden) so it doesn't affect layout or accessibility trees.
- **Maintenance mode**, when enabled, must show the maintenance screen to all visitors *except* it must always leave a working path to `/admin` login so staff can turn it back off — the site must never be able to lock itself out.
- Testimonials require a star rating from 1–5 (integer); the public site must not render a testimonial with 0 or missing stars.

## 6. Inquiry Form Rules

- Required fields: full name, phone, course of interest. Email and message are optional.
- Phone must be a valid 10-digit Indian mobile number (basic format check; do not silently truncate or reformat what the user typed beyond trimming whitespace).
- Every submission is persisted server-side as a `message` record even if the admin never reads it — inquiries must never be lost. Optionally, the API sends a notification email/WhatsApp alert to staff on submission (nice-to-have, not blocking for v1).
- Admin deleting a message is permanent — no soft delete needed for this entity, since it carries no historical/financial value once handled.

## 7. Payments Rules

- Payment method configuration (`upi`/`bank`/`cash`/`gateway`) is a Settings-level toggle controlling what's *displayed to prospective students* on the contact/course flow — it does not itself process money in v1 (no gateway integration yet; see 02-ARCHITECTURE.md §8).
- A payment record requires: student (must reference an existing student), amount (> 0), method, date. Records are append-only from the UI (edits should be rare and always logged); deleting a payment record requires confirmation and is logged to the Activity Log.
- Amounts are stored and displayed in INR, integers (paise-level precision is not required for this business).

## 8. Media Library Rules

- Accepted file types: JPEG, PNG, WebP. Reject anything else with a clear error, never a silent failure.
- Images are downsized/compressed before upload to keep the site fast (target: no dimension above ~1600px on the long edge, reasonable JPEG/WebP quality — see 05-TRD.md for exact performance budgets).
- Deleting a media item that is still referenced by a course/faculty/gallery entry should warn the admin before deleting ("this image is used in 2 places") rather than silently breaking a reference.

## 9. Activity Log Rules

- Every admin write action (create/update/delete on any entity, settings change, login, password reset performed on a student) is appended to the Activity Log with: timestamp, admin identity, action, and a short human-readable detail string.
- The Activity Log is append-only from the API's perspective; the "Clear Log" admin action archives/truncates the *view* but the underlying audit trail should be retained for a minimum of 12 months for accountability (production concern — the prototype's client-side "clear" simply deletes; production must not permanently destroy audit data on a single click without confirmation, and should keep a durable copy per 05-TRD.md retention requirements).

## 10. Backup / Restore Rules

- Exports (CSV per entity, full JSON backup) never include password hashes or session tokens.
- Restoring from a backup is a destructive, admin-only action that must show a confirmation step naming exactly what will be overwritten, and should itself be recorded in the Activity Log.

## 11. Accessibility & Content Rules

- All interactive elements (nav, forms, modals, accordions) must be keyboard-operable and carry appropriate ARIA labels — several already do in the current markup (`aria-label` on icon buttons); this must be maintained for every new component.
- Respect `prefers-reduced-motion` (already implemented in `styles.css`) for all future animations.
- No public-facing copy should ever expose internal IDs, emails of unrelated students, or admin usernames.

## 12. Security Notes

- Never log or display plaintext passwords anywhere, including the Activity Log detail strings.
- Rate-limit all authentication endpoints (login, register, forgot-password, OTP verify) to mitigate brute force.
- CORS on the API should allow only the known front-end origin(s) (production domain + staging), not `*`.
- All admin and student endpoints require HTTPS; no credentials or tokens are ever sent over plain HTTP.
