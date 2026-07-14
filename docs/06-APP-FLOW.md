# 06 — App Flow Document
### GVC Sainik SSB Academy

**Status:** Draft v1.0
**Last updated:** 2026-07-14

---

## 1. Visitor → Inquiry Submission

```mermaid
flowchart TD
    A[Visitor lands on homepage] --> B[Browses Courses / Why Us / Selections / FAQ]
    B --> C[Scrolls to Contact section]
    C --> D[Fills inquiry form: name, phone, course, optional email/message]
    D --> E{Client-side validation passes?}
    E -- No --> D
    E -- Yes --> F[POST /api/messages]
    F --> G{API validation passes?}
    G -- No --> H[Show inline error]
    G -- Yes --> I[Message persisted in DB]
    I --> J[Confirmation shown to visitor]
    I --> K[Appears in Admin > Inquiries]
```

## 2. Student Registration & Login

```mermaid
flowchart TD
    A[Student clicks Student Login] --> B{Has account?}
    B -- No --> C[Register: name, email, phone, password]
    C --> D[POST /api/auth/student-register]
    D --> E[Account created, status active]
    E --> F[Auto-login or redirect to login]
    B -- Yes --> G[Enter email + password]
    G --> H[POST /api/auth/student-login]
    H --> I{Credentials valid?}
    I -- No --> G
    I -- Yes --> J[JWT issued, session stored]
    J --> K[Student Dashboard: profile, attendance, results, materials]
```

## 3. Student — Forgot Password

```mermaid
flowchart TD
    A[Click 'Forgot password?'] --> B[Enter email]
    B --> C[POST /api/auth/forgot-password]
    C --> D[API creates OTP, emails it, 10 min expiry]
    D --> E[Student enters 6-digit OTP + new password]
    E --> F[POST /api/auth/reset-password]
    F --> G{OTP valid and not expired?}
    G -- No --> E
    G -- Yes --> H[Password updated, OTP invalidated]
    H --> I[Redirect to login]
```

## 4. Admin Login (with optional 2FA)

```mermaid
flowchart TD
    A[Admin opens Admin Login] --> B[Enter username + password]
    B --> C[POST /api/auth/login]
    C --> D{Credentials valid?}
    D -- No --> B
    D -- Yes --> E{2FA enabled in Settings?}
    E -- No --> F[JWT issued, Admin Dashboard opens]
    E -- Yes --> G[Enter 6-digit 2FA code]
    G --> H[POST /api/auth/verify-2fa]
    H --> I{Code valid?}
    I -- No --> G
    I -- Yes --> F
```

## 5. Admin — Editing Public Content (generic CRUD flow, applies to Courses / Faculty / Selections / Testimonials / FAQs)

```mermaid
flowchart TD
    A[Admin opens relevant tab] --> B[GET /api/admin/<entity>]
    B --> C[List renders with Edit/Delete per row]
    C --> D{Action}
    D -- Add --> E[Open blank form]
    D -- Edit --> F[Open pre-filled form]
    D -- Delete --> G[Confirm dialog]
    E --> H[POST /api/admin/<entity>]
    F --> I[PUT /api/admin/<entity>/:id]
    G --> J[DELETE /api/admin/<entity>/:id]
    H --> K[Activity Log entry written]
    I --> K
    J --> K
    K --> L[Public site reflects change on next content fetch]
```

## 6. Admin — Managing a Student

```mermaid
flowchart TD
    A[Admin opens Students tab] --> B[Search/filter by status]
    B --> C{Action}
    C -- Add student --> D[Fill name/phone/email/course; system generates studentId + username]
    D --> E[POST /api/admin/students]
    E --> F[Share credentials with student out-of-band]
    C -- Reset password --> G[POST /api/admin/students/:id/reset-password]
    G --> H[New temp password shown to admin to share manually]
    C -- Deactivate --> I[PATCH status=inactive]
    I --> J[Student can no longer log in; historical data retained]
```

## 7. Admin — Recording a Payment

```mermaid
flowchart TD
    A[Admin opens Payments tab] --> B[Select existing student]
    B --> C[Enter amount, method, date]
    C --> D[POST /api/admin/payments]
    D --> E{Amount > 0 and student exists?}
    E -- No --> C
    E -- Yes --> F[Record saved, Activity Log entry written]
    F --> G[Record appears in student's payment history]
```

## 8. Site-Wide Banner / Maintenance Mode

```mermaid
flowchart TD
    A[Admin opens Site Content tab] --> B[Toggle banner active + edit text]
    B --> C[PUT /api/admin/settings]
    C --> D[Public site shows/hides banner on next load]
    A --> E[Toggle Maintenance Mode in Settings]
    E --> F[PUT /api/admin/settings]
    F --> G[All visitors see maintenance screen]
    G --> H[Admin-login link on maintenance screen always remains reachable]
    H --> I[Admin logs in and can turn Maintenance Mode back off]
```

## 9. Backup & Restore

```mermaid
flowchart TD
    A[Admin opens Reports & Backup] --> B{Action}
    B -- Export CSV --> C[GET /api/admin/reports/csv?entity=...]
    B -- Export full backup --> D[GET /api/admin/backup]
    B -- Restore --> E[Upload JSON backup file]
    E --> F[Confirmation dialog: lists what will be overwritten]
    F --> G{Confirmed?}
    G -- No --> A
    G -- Yes --> H[POST /api/admin/backup/restore]
    H --> I[Data restored, Activity Log entry written]
```
