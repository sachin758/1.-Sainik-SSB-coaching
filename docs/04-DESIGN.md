# 04 — Design Document
### Visual Design System & UX Guidelines

**Status:** Draft v1.0 — reflects tokens already implemented in `styles.css`
**Last updated:** 2026-07-14

---

## 1. Design Direction

The brand tone is **military-institutional meets editorial** — olive/khaki tones, gold accents (rank/medal association), stencil-style display type for headings, and a mono typeface for small tactical-looking labels ("eyebrows", counters, badges). The goal is to read as disciplined and credible, not as a generic ed-tech template.

## 2. Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--olive-dark` | `#20220f` | Darkest background (footer, dark sections) |
| `--olive` | `#454b23` | Primary brand green |
| `--olive-mid` | `#5c6430` | Secondary green, hover states |
| `--olive-light` | `#7a8442` | Tertiary green, subtle accents |
| `--sand` | `#d8caa0` | Warm neutral, accents on dark backgrounds |
| `--cream` | `#f5f1e4` | Section-alt background |
| `--off-white` | `#faf8f1` | Default page background |
| `--gold` | `#c79a2b` | Primary accent (CTAs, ranks, highlights) |
| `--gold-bright` | `#e0b64a` | Hover/active accent state |
| `--ink` | `#181a10` | Primary text |
| `--ink-soft` | `#3a3c2c` | Secondary/muted text |
| `--line` | `rgba(24,26,16,.12)` | Light-mode hairlines/borders |
| `--line-dark` | `rgba(245,241,228,.14)` | Dark-mode hairlines/borders |

Dark mode (via the theme toggle) should invert the ink/background pairing while keeping gold as the constant accent — gold must retain sufficient contrast in both modes.

## 3. Typography

| Token | Font | Usage |
|---|---|---|
| `--ff-display` | Anton | Big display headings (hero, section titles) |
| `--ff-stencil` | Big Shoulders Stencil | "Eyebrow" labels above headings, tactical accents |
| `--ff-body` | Inter | All body copy, forms, UI text |
| `--ff-mono` | JetBrains Mono | Counters, badges, small tactical labels, admin username hints |

Base body: 16px equivalent, `line-height: 1.6`. Headings use the display/stencil fonts sparingly — never for long-form paragraph text.

## 4. Layout

- Global content width: `.wrap` — `max-width: 1240px`, `padding: 0 32px`.
- Border radius is nearly flat (`--radius: 2px`) — intentional, reinforces the disciplined/institutional feel over a soft consumer-app look. Do not introduce large rounded corners (e.g. 12px+ cards) elsewhere in the product; stay consistent with this near-square aesthetic.
- Shadows are soft and dark (`--shadow: 0 18px 40px -20px rgba(20,22,10,.45)`), used sparingly for elevation (cards, modals) — not on every element.
- Sections alternate background between `--off-white` and `--cream` (`.section-alt`) to create rhythm down the page without hard dividers.

## 5. Components (existing patterns to reuse)

- **Eyebrow label** — small stencil-font, uppercase-style kicker above every section title ("About the Academy", "Why Choose Us", etc.). Every new section should follow this same eyebrow → `h2.section-title` → optional `.section-sub` pattern for consistency.
- **Value / Why / Course cards** — bordered, flat-cornered cards with an icon (inline SVG, stroke-based, `stroke-width:1.6`), a bold short heading, and one supporting sentence. Reuse this exact icon style (line icons, not filled) for any new card grid.
- **Dogtags (stat counters)** — animated count-up numbers in the hero, styled like military dog tags. Any new headline stat should follow this pattern rather than introducing a new stat component.
- **Timeline** — year-marker + heading + one sentence, used in About. Reuse for any future "milestones" content.
- **Badges** ("18 Seats Left", "Rolling Batch") — mono font, small, high-contrast chip. Keep badge copy short (2–3 words) so it doesn't wrap.
- **Admin/Student modals** — centered card over a dim overlay, close button top-right (`✕` icon button), consistent field/label pattern (`.field` wrapping `label` + `input`).
- **Admin dashboard shell** — fixed topbar (brand + "view site" + logout) and a left sidebar of tabs with live count badges; main content area swaps per tab. Any new admin tab must follow this shell, not introduce a new dashboard layout.

## 6. Responsive Behavior

- Breakpoint already in use: `900px` (e.g. `.report-grid` collapses to 1 column; nav burger takes over from the full nav at this width — confirm exact breakpoint in `styles.css` before adding new ones, and reuse it rather than introducing new arbitrary breakpoints).
- Mobile nav collapses behind the burger button; ensure any new top-level nav item is added to both the desktop nav list and the burger menu.
- Grids (course grid, why-grid, faculty-grid, etc.) should degrade gracefully: 3–4 columns desktop → 2 columns tablet → 1 column mobile, consistent with the existing card grids.

## 7. Motion

- Reveal-on-scroll (`.reveal` class + `IntersectionObserver`) is the standard entrance animation for sections — reuse this for any new section rather than inventing a new animation.
- Count-up number animation (`data-count` attribute) is standard for any new headline statistic.
- All motion must respect `prefers-reduced-motion: reduce` (already globally handled in `styles.css` — do not bypass this in new components).

## 8. Iconography

- Inline SVG only (no icon font, no external icon library dependency) — keeps the site fast and avoids extra network requests.
- Style: 24×24 viewBox, `stroke="currentColor"`, `stroke-width` between 1.6–2, `fill="none"` (line icons), rounded joins. Match this exactly for any new icon so the set feels drawn by one hand.

## 9. Voice & Tone (content guidelines)

- Confident, direct, slightly formal — mirrors how the Founder's bio and section copy currently reads ("We don't run a tuition centre — we run a Board rehearsal").
- Avoid marketing hyperbole/exclamation marks; let concrete numbers (years, selections, AIRs) do the persuading.
- Course/eligibility copy should be precise and scannable (age ranges, durations, entry codes) — this is an audience that wants facts, not fluff.

## 10. Accessibility

- Maintain WCAG AA contrast for all text/background combinations, especially gold-on-dark and gold-on-light accent text — verify any new color combination against this standard before shipping.
- All icon-only buttons must carry `aria-label` (already the pattern for nav icon buttons; continue it).
- Form fields must always have an associated `<label for=...>` — never a placeholder-only field.
