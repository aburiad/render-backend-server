# Proshno Shala — Audit Report

**Date:** 2026-05-06
**Scope:** Full-app audit + all fixes from this session
**Auditor:** Claude (Opus 4.7)

---

## 0. TL;DR

- **5 security holes patched** — including a critical admin privilege-escalation bug that would have let any signed-up user instantly become Pro, change the Pro price to ৳0, view every user's email/payment history, and ban other accounts.
- **A4 PDF pipeline corrected** — exact 210×297 mm dimensions, consistent 14 mm vertical / 12 mm horizontal margins across html2pdf, browser print, and on-screen preview.
- **Math entry modernised** — `MathSymbolPicker` replaced with MathLive WYSIWYG editor in 8 question editors; storage format unchanged so existing papers, AI-scan output, and PDF rendering pipeline still work without migration.
- **Logout bypass fixed** — Supabase session is now invalidated alongside local store on logout.
- **Multiple UX fixes** — papers-list dot menu click target, modal centering, layout dropdown (1/2/3 column), instructions block styling.

**Production-blocking items: NONE remaining as of this audit. All critical fixes already in code.**

---

## 1. Security Audit

### 1.1 Critical — FIXED

#### #1 Admin route authorization missing
- **File:** `server/routes/admin.js`
- **Old code:** `router.use(requireAuth)` only verified the JWT — no role check.
- **Impact:** Any authenticated user (including a brand-new free-tier signup) could call:
  - `POST /api/admin/payments/verify` → instantly upgrade themselves or anyone to Pro
  - `PUT /api/admin/users/:uid` → change another user's role to `admin`, or ban them
  - `PUT /api/admin/subscription/config` → set Pro price to 0, set trial days to 9999
  - `GET /api/admin/users` → exfiltrate every user's email, role, subscription
  - `GET /api/admin/payments/all` → view every transaction
- **Fix:** New `requireAdmin` middleware in `server/middleware/auth.js:96-114` checks `req.profile.role === 'admin'` (server-managed DB column). Applied to `admin.js:8-12` as a router-level guard.
- **Test:** Non-admin call → `{ message: "Admin access required" }` (HTTP 403). Admin still passes.

#### #2 Role check falls back to client-controlled metadata
- **File:** `server/middleware/auth.js`
- **Issue:** `req.user.role = profile?.role || meta.role || null` — `meta.role` comes from Supabase `user_metadata`, which is **client-controlled** at signup. An attacker could send `role: 'admin'` in their signup payload and (if the profile row was missing) `req.user.role` would be `'admin'`.
- **Fix:** `requireAdmin` reads strictly from `req.profile.role` (DB-side), never from `req.user.role` or `user_metadata`. Bundled with #1.

### 1.2 High — FIXED

#### #3 Dependency CVEs (axios, follow-redirects, postcss)
- **Issue:** axios <1.15.2 had 5 advisories (auth bypass via prototype pollution CVSS 7.4, XSRF token leakage, JSON tampering, etc.). follow-redirects leaked auth headers on cross-domain redirects. postcss had XSS in CSS stringify.
- **Fix:** `npm audit fix` upgraded axios to a patched 1.x release. Result: `npm audit` reports **0 vulnerabilities**.
- **Reproducibility:** `npm audit` should stay at 0 — re-run after future `npm install`s.

#### #4 Server-side payment amount enforcement
- **File:** `server/services/manualPaymentService.js`, `server/routes/payment.js`
- **Issue:** `amount` in the manual-payment row came from `req.body`. A user could send `amount: 1` while sending the real bKash screenshot for ৳299, and the admin verifying could miss the discrepancy.
- **Fix:** Service now fetches `config.proPrice` and writes that into the row, ignoring whatever the client sends. The route also drops `amount` from the destructured body for defence-in-depth.
- **Test:** `POST /api/payment/manual` with `{ amount: 1, ... }` → DB row shows actual `proPrice`, not `1`.

#### #5 Logout did not invalidate Supabase session
- **Files:** `src/store/authStore.js`, `src/components/shared/DesktopSidebar.jsx`, `src/components/shared/MobileHeader.jsx`, `src/main.jsx`
- **Issue:** `authStore.logout()` only cleared the local Zustand store. Supabase's own `localStorage` token (`sb-*-auth-token`) was untouched. After clicking logout, navigating to `/` re-ran `supabase.auth.getSession()` on page boot, found the still-valid session, called `applySession()`, set `isAuthenticated: true`, and `ProtectedRoute` waved the user through to `/dashboard`.
- **Fix:**
  1. `authStore.logout()` is now async and calls `supabase.auth.signOut()` after clearing local state.
  2. Logout call sites (`DesktopSidebar`, `MobileHeader`) `await logout()` and use `navigate('/login', { replace: true })` so back-button can't return to dashboard.
  3. `main.jsx` `onAuthStateChange` listener now also handles the SIGNED_OUT event — clears local store if Supabase fires it (covers cross-tab logout, expired sessions).
- **Test:** Login → logout → manually edit URL to `/` and press Enter → must land on `/login`, not `/dashboard`.

### 1.3 Medium — DEFERRED (this week / next sprint)

#### Rate limiting — not yet installed
- **Risk:** Brute-force on `/api/auth`, AI quota exhaustion via repeated `/api/ai/scan`, manual-payment spam, login retry abuse.
- **Plan:** install `express-rate-limit`, configure per-route:
  - `/api/auth/*`: 10 reqs / 15 min per IP
  - `/api/ai/*`: 30 reqs / hour per user
  - `/api/payment/manual`: 5 reqs / hour per user
  - global: 200 reqs / 15 min per IP
- **Effort:** ~30 min.

#### Body size limit too generous (25 MB everywhere)
- **Risk:** Attacker can stuff 25 MB payloads into `/api/papers`, polluting DB and inflating Vercel egress.
- **Plan:** per-route limits — papers/exam/questions: 1 MB; AI scan: 10 MB; payment screenshot: 3 MB.
- **Effort:** ~15 min.

#### CORS too permissive
- **File:** `server/app.js:33`
- **Issue:** `origin.endsWith('.vercel.app')` allows requests from **any** Vercel-hosted site, not just yours.
- **Plan:** Replace with explicit allowlist via `process.env.ALLOWED_ORIGINS` (comma-separated).

#### CSP disabled
- **File:** `server/app.js:47` — `contentSecurityPolicy: false`.
- **Plan:** Define a CSP that allows Supabase, AI providers, the Vite dev origin, and self.

### 1.4 Verified safe

- **No SQL injection vectors** — Supabase client uses parameterized queries throughout. Reviewed all `.eq()`, `.select()`, `.insert()`, `.update()` call sites.
- **No secrets in client bundle** — only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (intended public). Service role key, AI provider keys are backend-only.
- **XSS in math rendering safe** — `src/utils/mathRender.jsx`:
  - Plain text segments are HTML-escaped via `escapeHtml()` before being concatenated into HTML.
  - KaTeX is invoked with `trust: false`, blocking dangerous LaTeX commands like `\href`, `\url`, `\hyperlink`.
  - `<br>`-normalisation is whitelist (only `<br>` / `<br/>`), not an HTML parser, so injected `<script>` is escaped first then irrelevant.
- **Paper ownership check** — `paperService.getById(id, userId)` constrains by `user_id`. Confirmed in routes/papers.js.
- **JWT verification** — `requireAuth` calls `supabaseAdmin.auth.getUser(token)` which validates signature against Supabase's JWKS, not just decodes.
- **Helmet enabled** with `crossOriginOpenerPolicy: same-origin-allow-popups`, `crossOriginResourcePolicy: cross-origin`.
- **`trust proxy: 1`** set — correct for Vercel behind a single proxy hop.

---

## 2. PDF / A4 Pipeline

A4 is the entire app's promise: every paper must print correctly. After a deep audit:

### 2.1 Configuration matches A4

| Layer | Setting | Value | Correct? |
|---|---|---|---|
| jsPDF | `format`, `orientation`, `unit` | `'a4'`, `'portrait'`, `'mm'` | ✅ |
| jsPDF | `margin` | `[14, 0, 14, 0]` (top/bottom 14 mm, sides 0) | ✅ — sides come from wrapper padding |
| paperRef wrapper | `width`, `padding`, `box-sizing` | `210mm`, `0 12mm`, `border-box` | ✅ — bakes 12 mm side margin into captured image |
| PaperTemplate | `width` | `186mm` (= 210 − 24) | ✅ matches wrapper inner area |
| PaperTemplate | `minHeight` | `269mm` (= 297 − 28) | ✅ — fits one A4 page including jsPDF margins |
| index.css `@page` | print margin | `14mm 12mm` | ✅ matches html2pdf |
| index.css `.paper-print` | print width / min-height | `186mm` / `269mm !important` | ✅ matches inline |
| html2pdf | `image.type` | `'png'` | ✅ — JPEG was flattening light-gray backgrounds; PNG preserves them losslessly |
| html2pdf | font preload | Bengali (Hind Siliguri / Noto Serif Bengali / chosen) + KaTeX_Main / Math / Size1 / Size2 / AMS | ✅ |
| html2pdf | KaTeX onclone hook | normalises `.katex` font-size + line-height before capture | ✅ — prevents fraction-bar drift |

### 2.2 Page-break behaviour

- Question wrapper divs **deliberately do NOT use `break-inside: avoid`**, because html2pdf treats `avoid` as "push the whole element to the next page if it doesn't fit" — that creates large empty gaps. Questions split naturally at the page boundary.
- Atomic blocks DO get `breakInside: avoid` so they stay together:
  - **CQ stimulus** (multi-line bordered text)
  - **Matching table** (full table — column-ক / column-খ shouldn't split mid-row) ✅ added this session
  - **Generic table question** ✅ added this session

### 2.3 Multi-column layouts

- Dropdown in `PaperSetupForm.jsx:185` now offers `১ কলাম`, `২ কলাম`, `৩ কলাম`.
- Rendering in `PaperTemplate.jsx:158-167`:
  - 1-column: no special style.
  - 2-column: `columnCount: 2`, `columnGap: 5mm`, font size unchanged.
  - 3-column: `columnCount: 3`, `columnGap: 4mm`, `fontSize: 0.85em` (auto smaller because 12 pt would be cramped).
- Per-question `WebkitColumnBreakInside: avoid` keeps questions whole within a column.
- ⚠️ **Recommendation:** test with a real 10–15 question paper in both 2-column and 3-column to confirm no awkward column breaks. Multi-column + html2pdf interaction can occasionally surprise.

### 2.4 Header rendering

After several iterations:
- **Title block:** centered, scales with chosen font.
- **Time / Marks row:** plain flex `space-between` — no borders. (Earlier iterations with two horizontal borders had a Bengali ascender / html2canvas vertical-centering quirk that no padding combination fully solved.)
- **Instructions block:** `borderLeft` callout, plain text, no background. Also iterated through symmetric/asymmetric padding before settling on this.
- **Logo + institution name:** still uses `crossOrigin="anonymous"` + `useCORS: true`. ⚠️ See §5.1.

### 2.5 Question-type rendering verified

| Type | Component | Status |
|---|---|---|
| MCQ | `McqQuestion` | ✅ 2-col grid for options |
| CQ | `CqQuestion` | ✅ stimulus + sub-questions, sub-question marks shown as `[N]` |
| Short / Broad | `SimpleQuestion` | ✅ |
| Fill-blank | `FillBlankQuestion` | ✅ supports clues |
| Matching | `MatchingQuestion` | ✅ + page-split protection |
| Rearranging | `RearrangingQuestion` | ✅ ordered list |
| Translation | `TranslationQuestion` | source still has `border + #fafafa background` — discretionary, see §6 |
| Table | `TableQuestion` | ✅ + page-split protection |

---

## 3. MathLive Integration

Replaces the old `MathSymbolPicker` (an emoji-keyboard-style picker that inserted LaTeX template strings).

### 3.1 What changed

- New `src/components/questions/MathLiveEditor.jsx` — modal with a `<math-field>` (MathLive web component), live KaTeX preview underneath, optional LaTeX-source textarea for power users, "যোগ করুন" / "আপডেট করুন" actions.
- API identical to the old picker: `<MathLiveEditor inputRef={ref} onInsert={fn} />`. Drop-in replacement, swap was a single-token rename in 8 editor files.
- `mathlive ^0.109.2` added; `MathSymbolPicker.jsx` deleted.
- Cursor-positioned insert: detects if the textarea cursor is already inside a `$...$` block and pre-fills the editor for editing instead of always inserting fresh.

### 3.2 Storage format unchanged

- Math is still stored as `$LaTeX$` text inside the same prose fields (question, stimulus, options, sentence, sub-question text, table cells, matching cells, translation source).
- KaTeX (`MathText` / `renderMathToHtml`) renders both editor preview and `PDFPreview` → `html2pdf.js`.
- The MathLive widget is **only the input UI**, never used for read-only display, because shadow-DOM web components don't capture cleanly into html2pdf.

### 3.3 Coverage

| Editor | Wired? |
|---|---|
| MCQ, CQ, Short, Broad, FillBlank, Matching, Table, Translation | ✅ all 8 |
| Rearranging | ❌ by design — Bengali sentence rearranging, no math entry |

### 3.4 Virtual keyboard z-index fix

`src/index.css` adds `--keyboard-zindex: 10010` so MathLive's virtual keyboard stacks above the editor modal (`z-index: 9999`).

---

## 4. UI / UX fixes this session

### 4.1 Papers list — dot button click conflict
- **Problem:** the row-level `onClick` for navigation conflicted with the dot button's `onClick` for menu, even with `stopPropagation`. Framer Motion's `layout` prop occasionally swallowed the click.
- **Fix:** restructured to **sibling click targets**:
  - Left half (avatar + text) → its own `onClick` to navigate
  - Dot button → its own `onClick` to open menu
  - Chevron arrow → now a real `<button>`, its own `onClick` to navigate
  - No nesting, no `stopPropagation` needed.
- Dot button enlarged from 32 px to 36 px for easier mobile tap. Both action buttons have `title=` tooltips.

### 4.2 Action menu — centered, not bottom-anchored
- **Problem:** `BottomSheet` was used for the per-paper action menu. It is `position: fixed; bottom: 0`, so for items low in the list, the menu felt anchored to viewport bottom rather than relative to the click.
- **Fix:** switched to centred `Modal` (existing component, `inset:0` + flex center). Menu now opens screen-centre regardless of which row was clicked. Same `BottomSheetItem` rows reused inside.

### 4.3 Layout dropdown — 1/2/3 columns
- `PaperSetupForm.jsx`: added "৩ কলাম" option.
- `PaperTemplate.jsx`: renders 3-column with smaller font and tighter gap.

### 4.4 Math input UX
- See §3.

---

## 5. Outstanding items — recommendations

### 5.1 Logo CORS
- `PaperTemplate.jsx` uses `<img crossOrigin="anonymous">`. If logos are uploaded to Supabase Storage, the bucket needs CORS configured to allow the Vercel origin. Otherwise html2canvas silently skips the image and the PDF prints without the logo.
- **Action:** when you upload a logo and download the paper, confirm the logo appears. If missing, configure Supabase Storage CORS.

### 5.2 Translation question source styling
- `TranslationQuestion` still wraps source text in a `border: 1px solid #999; background: #fafafa` box. CQ stimulus had this removed earlier. Decide if you want consistency.

### 5.3 Multi-column real-world test
- 10–15 question paper, try 2-column and 3-column download. If columns split awkwardly mid-question, we can tighten `WebkitColumnBreakInside`.

### 5.4 Single-question paper page count
- A 1-question paper now renders on a single PDF page (not 2 with extra blank). Confirm in production.

### 5.5 Pending security tasks (deferred from §1.3)
1. Rate limiting (`express-rate-limit`)
2. Per-route body size limits
3. CORS allowlist
4. Content Security Policy

---

## 6. Test plan before next deploy

### Auth
- [ ] Login → logout → URL-bar to `/` + Enter → lands on `/login`. (Was the bypass.)
- [ ] Login in tab 1 → tab 2 logout → tab 1 auto-logs out on next interaction.
- [ ] Browser back button after logout doesn't reach `/dashboard`.

### Admin authorisation
- [ ] As non-admin, in DevTools console:
  ```js
  fetch('/api/admin/users', {
    headers: { Authorization: 'Bearer ' + (await supabase.auth.getSession()).data.session.access_token }
  }).then(r => r.status)
  ```
  Expect **403**.
- [ ] As admin, `/admin` page loads users + payments normally.
- [ ] As non-admin, attempt `POST /api/admin/payments/verify` with body `{ paymentId: '...', status: 'verified' }`. Expect **403**.

### Manual payment amount
- [ ] Submit `/api/payment/manual` with `{ amount: 1, method: 'bKash', tranId: 'TEST', phone: '01...', ... }`.
- [ ] In Supabase, inspect the new `manual_payments` row → `amount` column should equal `subscription_config.pro_price`, not `1`.

### A4 PDF
- [ ] Single-page paper (1 question) → PDF is exactly one page.
- [ ] Multi-page paper (15 questions, 1-column) → no question splits awkwardly across pages.
- [ ] 2-column paper → questions stay within columns.
- [ ] 3-column paper → text size readable, no overflow.
- [ ] Math equations render with correct fraction bars (no "strikethrough" artefact).
- [ ] Bengali text uses the correct font (Noto Serif Bengali or chosen).
- [ ] Header gray background (instructions) renders in PDF, not flattened to white. (PNG fix.)

### Math input
- [ ] Open MCQ editor → click `fx` → type `1/2` in math-field → it auto-converts to fraction → save → preview shows rendered fraction.
- [ ] Open existing question with `$\frac{a}{b}$` in text → place cursor inside → `fx` opens with the fraction prefilled → edit → "আপডেট করুন" replaces the original.
- [ ] Virtual keyboard opens above modal (not below).

### UI
- [ ] Papers list → click avatar/text on a row → navigates.
- [ ] Click dot → centred modal opens with edit/preview/delete.
- [ ] Click chevron → navigates.
- [ ] Clicks work for first row, last row, mid-list — modal always centred.

---

## 7. Deploy checklist

```bash
# 1. Confirm clean state
npm audit              # expect 0 vulnerabilities
npm run build          # expect ✓ built in ~1s
npm test               # if you have CI, run vitest

# 2. Test locally as both admin and non-admin (see §6)

# 3. Deploy
git add -A
git commit -m "security: admin auth + payment amount + logout + dep upgrade"
git push origin main
# Vercel auto-deploys

# 4. Post-deploy smoke test
# - Login as a real account
# - Logout, edit URL to "/", press Enter → expect /login
# - As non-admin user, try the admin endpoints test from §6
# - Generate a real paper PDF; print on physical paper to confirm A4 layout
```

---

## 8. Files changed this session (reference)

### Server
- `server/middleware/auth.js` — added `requireAdmin`
- `server/routes/admin.js` — applied `requireAdmin`
- `server/routes/payment.js` — drop client `amount`
- `server/services/manualPaymentService.js` — server-side `proPrice`

### Frontend
- `src/main.jsx` — SIGNED_OUT handler
- `src/store/authStore.js` — `supabase.auth.signOut()` on logout
- `src/components/shared/DesktopSidebar.jsx` — await logout, replace nav
- `src/components/shared/MobileHeader.jsx` — same
- `src/pages/PapersList.jsx` — sibling click targets, Modal instead of BottomSheet
- `src/pages/PDFPreview.jsx` — wrapper-baked horizontal padding, jsPDF margin, PNG image type
- `src/components/paper/PaperTemplate.jsx` — A4 sizing, multi-column, header iterations, table page-break protection
- `src/components/paper/PaperSetupForm.jsx` — 3-column option
- `src/index.css` — A4 print rules, MathLive virtual keyboard z-index
- `src/components/questions/MathLiveEditor.jsx` — new file
- `src/components/questions/MathSymbolPicker.jsx` — deleted
- `src/components/questions/{Mcq,Cq,Short,Broad,FillBlank,Matching,Table,Translation}Editor.jsx` — switched picker import

### Dependencies
- Added: `mathlive ^0.109.2`
- Upgraded (via `npm audit fix`): `axios`, `follow-redirects`, `postcss` (transitive)

---

## 9. Risk register (post-fix)

| Risk | Likelihood | Impact | Mitigation in place |
|---|---|---|---|
| Privilege escalation via admin endpoints | very low | severe | `requireAdmin` |
| Self-upgrade via fake payment amount | very low | high | server-side proPrice |
| Session hijack via incomplete logout | very low | medium | full Supabase signOut |
| Dependency CVEs | low | varies | `npm audit fix` + monitor |
| AI quota exhaustion via spam | medium | low | ⚠️ no rate limit yet |
| Body-size DDoS | low | low | ⚠️ 25 MB limit needs tightening |
| 3rd-party Vercel origin call | low | low | ⚠️ CORS allows `.vercel.app` |
| XSS via inline scripts | very low | medium | KaTeX `trust: false`, no `dangerouslySetInnerHTML` on user input directly |

---

**End of report.** Ping me when the deferred §1.3 items are due — I can knock out rate limiting + body limits in ~1 hour combined.
