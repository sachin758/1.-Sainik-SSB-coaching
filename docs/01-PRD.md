# 01 — Product Requirements Document (PRD)
### GVC Sainik SSB Academy — Website, Student Portal & Admin Dashboard

**Status:** Draft v1.0
**Owner:** Product
**Last updated:** 2026-07-14

---

## 1. Summary

GVC Sainik SSB Academy is an SSB/NDA/CDS/AFCAT coaching institute based in Gwalior/Seoni, Madhya Pradesh. The product is a single web platform with three audiences:

1. **Public marketing site** — informs prospective students and parents, generates admission inquiries.
2. **Student Portal** — gives enrolled students self-service access to their profile, attendance, results, and study material.
3. **Admin Dashboard** — lets academy staff manage every piece of content on the public site (courses, faculty, testimonials, FAQs, gallery), handle inquiries and student records, track payments, and configure site settings — without needing a developer.

The current build is a functional front-end prototype: the public site and both portals are fully interactive, but content is persisted to a shared key-value store rather than a production database, and authentication is a placeholder. This PRD defines the product as it should work end-to-end in production, which the accompanying Architecture, TRD, and Backend documents implement.

## 2. Problem Statement

- The academy currently relies on manual updates (calls, WhatsApp, word-of-mouth) to communicate batch availability, seat counts, and results — this doesn't scale and looks unprofessional next to larger coaching chains.
- Staff have no self-service way to update course pricing, seats, or testimonials without editing code.
- Enrolled students have no digital way to check attendance, results, or download study material — everything goes through the front office.
- There is no structured record of inquiries, so leads are lost or followed up inconsistently.

## 3. Goals

| Goal | Metric |
|---|---|
| Convert visitors into inquiries | Inquiry form submissions / month |
| Reduce front-office load for routine student questions | % of students actively using the portal |
| Let non-technical staff manage content | Time to publish a content change (target: < 5 min, no developer) |
| Maintain a reliable record of every lead | 0% of inquiries lost (all persisted, none only in someone's WhatsApp) |
| Present a credible, professional brand online | Qualitative — page performance, mobile usability, load time |

## 4. Non-Goals (Out of Scope for v1)

- Full LMS (video lessons, quizzes, live classes) — study material is file/document based only.
- Native mobile apps (the portal is a responsive web app only).
- Online payment gateway integration (v1 supports recording UPI/bank/cash payments manually; gateway is a settings toggle reserved for a later phase).
- Multi-branch / multi-tenant support (single academy, single location, in v1).
- Public course marketplace or e-commerce checkout.

## 5. Personas

**Aspirant / Parent (Visitor)** — Discovers the academy via search, WhatsApp share, or word of mouth. Wants to quickly understand courses, pricing, faculty credentials, and past selections, then either calls, WhatsApps, or submits the inquiry form.

**Enrolled Student** — Already paying student. Wants to check attendance %, exam/mock-interview results, download notes/PDFs, and see their course/batch details, without visiting the office.

**Front Office / Counsellor (Admin — limited role)** — Handles day-to-day: reads inquiries, adds/edits student records, records payments, resets student passwords.

**Academy Owner / Principal (Admin — full role)** — Everything above, plus edits course catalog, faculty, testimonials, gallery, site-wide settings (maintenance mode, banner, 2FA), and can view the activity log and export backups.

## 6. Features

### 6.1 Public Site
- Hero section with rotating stats (students trained, selections, mentors, years).
- Founder/Chief Mentor profile section.
- About (mission/vision/timeline).
- "Why Choose Us" feature grid.
- Course catalog with category filter chips (Army / Air Force / SSB), live seat-count badges, pricing (with strikethrough old price where applicable).
- SSB process explainer (5-stage breakdown: Screening → Psychology → GTO → Interview → Conference).
- Faculty grid.
- Selections/results wall (name, entry, All India Rank).
- Photo gallery.
- Testimonials carousel/grid with star ratings.
- FAQ accordion.
- Contact section: address, phone, email, hours, social links, inquiry form.
- Sitewide announcement banner (admin-controlled, dismissible).
- Maintenance mode screen (admin toggle; shows a holding page with a direct admin-login escape hatch).
- WhatsApp floating action button.
- Dark/light theme toggle.

### 6.2 Student Portal
- Register (name, email, phone, password) and Login.
- Forgot password → email OTP → reset.
- Dashboard: profile summary, course/batch, attendance %, latest results, downloadable study material.
- Logout / "view public site" shortcut.

### 6.3 Admin Dashboard
- Login with username/password, optional 2FA (6-digit code) — toggle in Settings.
- Overview tab: at-a-glance counts (courses, faculty, students, unread messages, etc.).
- CRUD tabs for: Courses, Faculty, Selections, Testimonials.
- Inquiries (Messages) tab: view and delete submitted inquiry-form messages.
- Students tab: add/edit/deactivate students, reset passwords, filter by status.
- Site Content tab: banner text/toggle, FAQ CRUD, maintenance mode.
- Media Library: upload, browse, delete images used across the site (client-side downscaling before storage).
- Payments tab: configure accepted methods (UPI/bank/cash/gateway placeholder) and manually log payment records per student.
- Activity Log: chronological audit trail of admin actions; clearable.
- Reports & Backup: export data as CSV, export/import full JSON backup.
- Settings tab: site identity (name, tagline, logo initials), contact details, social links, SEO title/description, maintenance mode, 2FA toggle.

## 7. Key User Flows (see 06-APP-FLOW.md for diagrams)
1. Visitor → browses courses → submits inquiry form → inquiry appears in Admin → Messages.
2. Prospective student → admin manually creates a Student record → student receives credentials → registers/logs in → views dashboard.
3. Admin → logs in (+2FA if enabled) → edits a course price/seats → change is live on public site immediately.
4. Student forgets password → requests reset → receives OTP by email → sets new password.

## 8. Requirements Summary

- **Functional** requirements are enumerated in section 6 above and detailed further in 07-BACKEND.md (API contract) and 03-RULES.md (business rules/validation).
- **Non-functional** requirements (performance, security, availability, browser support) are defined in 05-TRD.md.

## 9. Assumptions & Constraints

- Single institute, single location, single currency (INR).
- Content changes should reflect on the public site without a redeploy (admin-editable, not hardcoded).
- The academy's own staff, not developers, will operate the Admin Dashboard day-to-day.
- Initial user base is small (hundreds of students, low concurrent admin usage) — the architecture should be simple to run and cheap to host, not built for hyperscale.

## 10. Success Criteria for v1 Launch

- Public site fully responsive (mobile/tablet/desktop) and passes the acceptance checklist in 03-RULES.md.
- Admin can perform every CRUD action in section 6.3 without developer help.
- Students can register, log in, recover a forgotten password, and see their own data only.
- All inquiry submissions and student data persist in the production database (see 07-BACKEND.md), replacing the current shared key-value prototype store.
- Real authentication (hashed passwords, signed session tokens) replaces the current placeholder login.
