# Proshno Shala — Codebase Guide (AI Handoff Document)

**Purpose:** Eta hocche apnar app er **complete developer/AI handoff** document। Apni jodi Cursor, Claude, GitHub Copilot, ChatGPT, ba kuno AI tool ke task den, eta share korlei tara **immediately codebase bujhbe** ar correctly modify korte parbe।

**Last updated:** 2026-05-13
**App version:** v1.0 (Launch-ready)
**Production URL:** https://rongtonu.com
**Stack:** React 19 + Vite + Express 5 + Supabase + Vercel

---

## 📋 Table of Contents

1. [Quick Overview — App Kī Kore](#1-quick-overview)
2. [Tech Stack & Architecture](#2-tech-stack)
3. [File Structure Map](#3-file-structure)
4. [Database Schema](#4-database-schema)
5. [API Routes Reference](#5-api-routes)
6. [Environment Variables](#6-environment-variables)
7. [Key Business Concepts](#7-key-concepts)
8. [Where to Add New Feature](#8-add-new-feature)
9. [Where to Update Existing](#9-update-existing)
10. [How to Remove a Feature](#10-remove-feature)
11. [Common Code Patterns](#11-code-patterns)
12. [Anti-Patterns — Eshob KORBEN NA](#12-anti-patterns)
13. [Migration Workflow](#13-migration-workflow)
14. [Deployment Pipeline](#14-deployment)
15. [Troubleshooting Common Issues](#15-troubleshooting)
16. [AI Provider Strategy](#16-ai-providers)
17. [Security Model Quick Reference](#17-security-quick-ref)

---

## 1. Quick Overview

**Proshno Shala** is a BD-market AI-powered question-paper generation SaaS for schools, coachings, admission centers, and private tutors.

### Core Features

| Feature | What | File Hint |
|---------|------|-----------|
| AI Scan | Camera photo → OCR → questions extracted | `server/routes/ai.js`, `src/components/questions/MagicScanModal.jsx` |
| Book Generate | NCTB chapter → AI generates questions | `server/routes/book.js`, `src/components/questions/BookGenerateModal.jsx` |
| Paper Editor | Manual + AI question composition | `src/pages/PaperEditor.jsx` |
| Question Bank | Save/reuse questions | `src/pages/QuestionBank.jsx`, `server/routes/questions.js` |
| Credit System | Pay-as-you-go AI ops pool | `server/services/creditService.js`, `server/middleware/credits.js` |
| Top-up | bKash/Nagad/Rocket manual payment | `src/components/shared/TopUpModal.jsx`, `server/routes/payment.js` |
| Admin Panel | Pricing config, user manage, verify payments | `src/pages/AdminDashboard.jsx`, `server/routes/admin.js` |
| Exam Portal | Live exams for students | `src/pages/ExamPortal.jsx`, `server/routes/exam.js` |
| Notice + Routine | Institution document generator | `src/pages/Notice*.jsx`, `src/pages/Routine*.jsx` |
| BYO AI Keys | User provides own Gemini/OpenAI key | `src/pages/SettingsAIKeys.jsx`, `server/services/userApiKeyService.js` |

---

## 2. Tech Stack & Architecture

```
Browser (React SPA)
   │ HTTPS + JWT
   ▼
Vercel Edge → Serverless Function (api/index.js)
   │
   ├─ Express App (server/app.js)
   │   ├─ Middleware: auth, credits, rateLimit, errorHandler
   │   ├─ Routes: auth, ai, book, papers, payment, admin, ...
   │   └─ Services: creditService, paperService, aiService, ...
   │
   ├─ Supabase (Postgres + Auth + Storage)
   │   ├─ Service role key (server-side)
   │   └─ Anon key (frontend — auth only, no direct DB)
   │
   └─ 8-Provider AI Fallback Chain
       Groq → OpenRouter → Mistral → SambaNova → Cohere
              → Novita → HuggingFace → Z.ai
```

### Key Versions

| Tech | Version |
|------|---------|
| Node.js | 20+ |
| React | 19.0 |
| Vite | 7.1 |
| Express | 5.1 |
| Supabase JS | 2.43 |
| Tailwind | 4.0 |
| Zustand | 5.0 |
| MathLive | 0.106 |
| KaTeX | 0.16 |

---

## 3. File Structure Map

```
proshno-shala-v1/
├── api/
│   └── index.js                    # Vercel serverless entrypoint (wraps Express)
│
├── server/                         # ← BACKEND CODE
│   ├── app.js                      # Express app setup (CORS, middleware, routes)
│   ├── index.js                    # Local dev server (listens on PORT)
│   │
│   ├── config/
│   │   └── supabase.js             # Supabase clients (admin + anon)
│   │
│   ├── middleware/
│   │   ├── auth.js                 # JWT verify + ban check + requireAdmin
│   │   ├── credits.js              # checkAiCredit, withChargedCredit (race-safe)
│   │   ├── rateLimit.js            # Configurable per-scope rate limits
│   │   ├── rateLimitStore.js       # Supabase-backed atomic rate limit store
│   │   └── errorHandler.js         # AppError class + global error handler
│   │
│   ├── routes/                     # ← EXPRESS ROUTES
│   │   ├── auth.js                 # /auth/me, /auth/credits, /auth/set-role
│   │   ├── ai.js                   # /ai/scan (vision OCR)
│   │   ├── book.js                 # /book/generate (NCTB AI generation)
│   │   ├── generate.js             # /generate-question (legacy AI scan)
│   │   ├── papers.js               # /papers CRUD + OMR
│   │   ├── questions.js            # /questions (question bank)
│   │   ├── exam.js                 # /exam create + take + submit
│   │   ├── notice.js               # /notices CRUD
│   │   ├── routine.js              # /routines CRUD
│   │   ├── payment.js              # /payment/topup, /payment/manual, /payment/quote
│   │   ├── admin.js                # All /admin/* (RBAC-gated)
│   │   ├── user.js                 # /user/api-keys (BYO AI keys)
│   │   └── limits.js               # /limits/status (rate limit dashboard)
│   │
│   ├── services/                   # ← BUSINESS LOGIC
│   │   ├── creditService.js        # Atomic credit RPCs
│   │   ├── configService.js        # subscription_config CRUD + defaults
│   │   ├── manualPaymentService.js # Top-up submit + verify + credit add
│   │   ├── paperService.js         # papers table CRUD
│   │   ├── questionService.js      # question_bank CRUD
│   │   ├── examService.js          # exams + exam_submissions
│   │   ├── noticeService.js        # notices CRUD
│   │   ├── routineService.js       # class_routines CRUD
│   │   ├── bookService.js          # book_chapters + book_questions queries
│   │   ├── userApiKeyService.js    # BYO key encrypt/decrypt
│   │   ├── cryptoService.js        # AES-256-GCM encryption helper
│   │   ├── aiService.js            # Multi-provider fallback orchestrator
│   │   └── aiProviders/            # Per-provider adapter
│   │       ├── index.js            # Provider registry
│   │       ├── providerMeta.js     # UI metadata (signupUrl, etc.)
│   │       ├── groq.js
│   │       ├── openrouter.js
│   │       ├── mistral.js
│   │       ├── sambanova.js
│   │       ├── cohere.js
│   │       ├── novita.js
│   │       ├── huggingface.js
│   │       └── zai.js
│   │
│   ├── migrations/                 # ← SQL MIGRATIONS (applied via Supabase SQL editor)
│   │   ├── 2026-05-12_papers_print_settings.sql
│   │   ├── 2026-05-13_ai_credits.sql              # Credit system schema + RPCs
│   │   ├── 2026-05-13b_bulk_signup_bonus.sql      # Atomic bulk bonus RPC
│   │   ├── 2026-05-13c_drop_legacy_payments.sql   # SSLCommerz cleanup
│   │   └── 2026-05-13d_enable_rls_all_tables.sql  # RLS on all 14 tables
│   │
│   ├── data/
│   │   └── books/                  # NCTB curriculum (markdown source)
│   │       ├── class-7/math/*.md
│   │       ├── class-8/math/*.md
│   │       └── class-9/math/*.md
│   │
│   └── scripts/                    # ← SEED + MAINTENANCE SCRIPTS
│       ├── seedClass7Math.js       # Parse markdown → DB
│       ├── seedClass8Math.js
│       ├── seedClass9Math.js
│       ├── seedBookContent.js      # Generic seed (uses Gemini)
│       └── verifyData.js
│
├── src/                            # ← FRONTEND CODE
│   ├── main.jsx                    # React entry + routing setup
│   ├── App.jsx                     # Route definitions + auth guards
│   ├── App.css, index.css          # Global styles + Tailwind
│   │
│   ├── lib/
│   │   └── supabase.js             # Browser Supabase client (anon key, AUTH ONLY)
│   │
│   ├── services/
│   │   └── api.js                  # Axios instance + 401/402 global handlers
│   │
│   ├── store/                      # ← ZUSTAND STORES (state mgmt)
│   │   ├── authStore.js            # user, token, applySession, logout
│   │   ├── paperStore.js           # Paper editor state
│   │   ├── examStore.js            # Exam taking state
│   │   ├── noticeStore.js
│   │   └── routineStore.js
│   │
│   ├── pages/                      # ← ROUTE COMPONENTS
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AuthCallback.jsx        # Google OAuth landing
│   │   ├── Dashboard.jsx
│   │   ├── PaperEditor.jsx
│   │   ├── PapersList.jsx
│   │   ├── PDFPreview.jsx
│   │   ├── OmrPreview.jsx
│   │   ├── QuestionBank.jsx
│   │   ├── ScanUpload.jsx
│   │   ├── Pricing.jsx
│   │   ├── SettingsAIKeys.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ExamPortal.jsx          # Public exam (no shell)
│   │   ├── Results.jsx
│   │   ├── LearningHub.jsx
│   │   ├── NoticesList.jsx, NoticeEditor.jsx, NoticePreview.jsx
│   │   ├── RoutinesList.jsx, RoutineEditor.jsx, RoutinePreview.jsx
│   │   ├── TeachersList.jsx, TeacherSchedulePage.jsx
│   │   └── (test files: *.test.jsx)
│   │
│   ├── components/                 # ← REUSABLE COMPONENTS
│   │   ├── AuthBootstrap.jsx       # Auto-applies session on app load
│   │   ├── shared/
│   │   │   ├── AppShell.jsx        # Protected route wrapper (nav + auth)
│   │   │   ├── CreditBalance.jsx   # Balance widget (compact + full)
│   │   │   ├── TopUpModal.jsx      # bKash payment modal
│   │   │   ├── OutOfCreditModal.jsx # Global 402 handler
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── SkeletonCard.jsx
│   │   ├── paper/
│   │   │   ├── PaperSetupForm.jsx
│   │   │   └── ExamPublishModal.jsx
│   │   ├── questions/
│   │   │   ├── QuestionWrapper.jsx
│   │   │   ├── McqEditor.jsx, CqEditor.jsx, ShortEditor.jsx, ...
│   │   │   ├── MagicScanModal.jsx       # AI scan upload UI
│   │   │   ├── BookGenerateModal.jsx    # AI book generate UI
│   │   │   └── ImportFromBankModal.jsx
│   │   ├── notice/
│   │   └── routine/
│   │
│   └── utils/
│       ├── imageCompress.js        # Client-side image compression
│       └── mathRender.js           # MathLive + KaTeX integration
│
├── public/                         # Static assets (favicon, manifest, icons)
│
├── dist/                           # ← BUILD OUTPUT (gitignored, generated)
│
├── api/                            # Vercel function entry
│
├── vercel.json                     # Vercel routing config
├── vite.config.js                  # Vite build config
├── eslint.config.js                # ESLint rules
├── package.json                    # Dependencies + scripts
│
└── *.md                            # Documentation
    ├── CODEBASE_GUIDE.md           # ← THIS FILE
    ├── project-technical.md        # Full project + security overview (Bangla)
    ├── PRICING.md                  # Business model
    ├── EXECUTION_PLAN.md           # Credit system rollout
    ├── LAUNCH_CHECKLIST.md         # Pre-launch + scaling guide
    ├── AUDIT_REPORT.md             # Initial code audit
    ├── PROJECT_GUIDE.md            # Older guide
    ├── RATE_LIMITS.md              # Rate limit config
    ├── README.md                   # Quick start
    └── userapikeysetupsecurity.md  # BYO key encryption details
```

---

## 4. Database Schema

### Active Tables (14)

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `profiles` | `id, email, display_name, role, ai_op_credits, is_banned` | User profile + credit balance |
| `papers` | `id, user_id, exam_title, questions (jsonb), ai_ops_used` | User-created papers |
| `question_bank` | `id, user_id, type, data (jsonb)` | Saved questions |
| `manual_payments` | `id, user_id, amount, method, tran_id, status, screenshot` | Top-up records |
| `credit_purchases` | `id, user_id, amount_bdt, ai_ops_added, source` | Credit audit trail |
| `notices` | `id, user_id, title, content (jsonb)` | Notice generator |
| `class_routines` | `id, user_id, name, schedule (jsonb)` | Class routines |
| `exams` | `id, user_id, code, settings (jsonb)` | Live exams |
| `exam_submissions` | `id, exam_id, student_name, answers (jsonb)` | Exam responses |
| `book_chapters` | `id, class_num, subject, chapter_id, full_text` | NCTB content |
| `book_questions` | `id, chapter_id, type, data (jsonb)` | Existing book questions |
| `user_api_keys` | `id, user_id, provider, key_encrypted` | BYO AI keys (AES-256-GCM) |
| `subscription_config` | `id=1, pro_price, rate_limits, credit_config` | Global admin config |
| `rate_limit_counters` | `scope, key, count, reset_at` | Rate limit state |

### Atomic Postgres Functions (RPCs)

| Function | Purpose | Defined In |
|----------|---------|------------|
| `decrement_ai_credits(uid, count)` | Race-safe credit consumption | `2026-05-13_ai_credits.sql` |
| `increment_ai_credits(uid, count)` | Race-safe credit addition | `2026-05-13_ai_credits.sql` |
| `increment_paper_ai_ops(paperId, count)` | Per-paper analytics | `2026-05-13_ai_credits.sql` |
| `grant_bulk_signup_bonus(bonus, admin_uid)` | Bulk retroactive bonus | `2026-05-13b_bulk_signup_bonus.sql` |
| `rate_limit_increment(scope, key, window)` | Distributed rate limiting | (already existed) |

### RLS Status
- All 14 public tables have RLS enabled (migration `2026-05-13d`)
- Backend uses **service role key** → bypasses RLS
- Frontend uses **anon key** → deny-all (no direct DB access)

---

## 5. API Routes Reference

### Auth (`/api/auth/*`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/auth/me` | Required | User profile + credits |
| GET | `/auth/credits` | Required | Credit balance + history |
| PUT | `/auth/set-role` | Required | Set role after OAuth signup |

### AI (`/api/ai/*`, `/api/generate-question`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/ai/scan` | Required | Vision OCR (1 op per question extracted) |
| POST | `/generate-question` | Required | Legacy alias for `/ai/scan` |
| POST | `/book/generate` | Required | NCTB chapter → AI questions (N ops) |
| GET | `/book/subjects/:class` | Required | List NCTB subjects |
| GET | `/book/chapters/:class/:subject` | Required | List chapters |

### Papers (`/api/papers/*`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/papers` | Required | Create paper (FREE — no AI) |
| GET | `/papers` | Required | List user papers |
| GET | `/papers/:id` | Required | Get one paper |
| PUT | `/papers/:id` | Required | Update paper |
| DELETE | `/papers/:id` | Required | Soft delete |
| GET | `/papers/:id/omr` | Required | OMR data |

### Payment (`/api/payment/*`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/payment/config` | Public | Pricing config (for marketing pages) |
| GET | `/payment/quote?amount=` | Required | Live top-up preview |
| POST | `/payment/topup` | Required | Submit top-up payment |
| POST | `/payment/manual` | Required | Legacy alias for `/topup` |

### Admin (`/api/admin/*`) — All require `requireAdmin`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/subscription/config` | Get admin config |
| PUT | `/admin/subscription/config` | Update config |
| GET | `/admin/users` | List users |
| PUT | `/admin/users/:uid` | Update user (role, sub, ban) |
| POST | `/admin/users/:uid/credits/adjust` | Manual credit add/sub |
| GET | `/admin/users/:uid/credits/history` | Per-user credit history |
| POST | `/admin/credits/apply-signup-bonus` | Bulk retroactive bonus |
| GET | `/admin/payments/manual` | Pending top-ups |
| GET | `/admin/payments/all` | All payments history |
| POST | `/admin/payments/verify` | Verify/reject payment |
| GET | `/admin/stats` | Dashboard stats |

### Other

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | Public | Health check (touches Supabase) |
| GET | `/health/deep` | Public | Deep health (returns 503 if DB down) |
| GET | `/limits/status` | Required | Rate limit usage dashboard |
| `/user/api-keys/*` | Required | BYO AI key CRUD |
| `/questions/*` | Required | Question bank CRUD |
| `/exam/*` | Mixed | Live exam create + take |
| `/notices/*`, `/routines/*` | Required | Document CRUD |

---

## 6. Environment Variables

### Vercel (Production) — Required

```bash
# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VITE_SUPABASE_URL=https://<project>.supabase.co       # Frontend (must match SUPABASE_URL)
VITE_SUPABASE_ANON_KEY=eyJhbGc...                     # Frontend public key

# Custom Domain CORS
ALLOWED_ORIGINS=https://rongtonu.com,https://www.rongtonu.com
CLIENT_URL=https://rongtonu.com
FRONTEND_URL=https://rongtonu.com

# BYO Key Encryption (32-byte hex)
KEYS_ENCRYPTION_SECRET=<openssl rand -hex 32>

# AI Provider Keys (system fallback chain)
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
MISTRAL_API_KEY=...
SAMBANOVA_API_KEY=...
COHERE_API_KEY=...
NOVITA_API_KEY=...
HUGGINGFACE_API_KEY=hf_...
Z_API_KEY=...

# Node environment
NODE_ENV=production
```

### Local Dev — `server/.env` and `.env`

Copy from `server/.env.example` (if exists) or replicate above with dev keys.

---

## 7. Key Business Concepts

### Credit System (Pay-as-You-Go)

```
1 paper  =  10 BDT  =  25 AI ops  (admin-configurable)
```

- User signup → 25 free ops (configurable bonus)
- 1 AI scan/generate/extract = 1 op
- Multi-question batch = N ops (one per question)
- Manual typing / edit / print / PDF = **FREE**
- Credits never expire

**Source of truth:** `subscription_config.credit_config` JSONB column, admin-editable from `AdminDashboard.jsx` Settings tab.

### Pricing Math

```js
ops = floor(amount_bdt / bdt_per_paper) * ops_per_paper
// 100 BDT @ 10 ৳/paper × 25 ops/paper = 250 ops
```

Code reference: [server/services/creditService.js](server/services/creditService.js) — `quoteTopUp()`.

### Auth Flow

```
Frontend Supabase client → signInWithPassword / signInWithOAuth
       ↓
Supabase JWT in localStorage
       ↓
Frontend axios attaches Authorization: Bearer <token> (api.js interceptor)
       ↓
Backend requireAuth middleware:
   1. Extract token
   2. supabaseAdmin.auth.getUser(token) — cryptographic verify
   3. Load profile from DB
   4. Check is_banned → 403 if banned
   5. Populate req.user, req.profile
       ↓
Route handler executes with authenticated user context
```

### RBAC (Admin Routes)

```js
router.use(requireAuth)       // 1. JWT verify
router.use(requireAdmin)      // 2. Check req.profile.role === 'admin'
//                             ^ NEVER use req.user.role (metadata, client-controllable)
```

### Credit Charge Pattern (Race-Safe)

```js
// ❌ DON'T do this (race condition):
const result = await aiService.scan(...)
await chargeAiCredit(uid, paperId, count)  // Too late — parallel requests already fired AI

// ✅ DO this (atomic pre-charge):
const result = await withChargedCredit(
  uid,
  paperId,
  1,  // initial charge
  () => aiService.scan(...),  // work
  (out) => Math.max(0, out.count - 1),  // extra charge
)
```

Reference: [server/middleware/credits.js](server/middleware/credits.js)

---

## 8. Where to Add New Feature

### "Add a new AI feature (e.g., translation)"

1. **Service:** Create `server/services/translationService.js` (or extend `aiService.js`)
2. **Route:** `server/routes/translation.js` — wire `withChargedCredit()` for cost
3. **Register route:** `server/app.js` — `app.use('/api/translation', requireAuth, ...)`
4. **Frontend page:** `src/pages/Translation.jsx`
5. **Route in App.jsx:** Add `<Route path="translation" element={<Translation />} />` inside `<AppShell>`
6. **Sidebar link:** Update `src/components/shared/AppShell.jsx` nav menu
7. **No DB migration** if reusing existing tables, or add migration if new entity
8. **Test:** Manual signup → use feature → verify credit decrement

### "Add a new admin config setting"

1. **Schema:** Add field to `DEFAULT_CREDIT_CONFIG` in `server/services/configService.js`
2. **Normalizer:** Update `normalizeCreditConfig()` to validate new field
3. **Frontend UI:** Add input field in `src/pages/AdminDashboard.jsx` Settings tab
4. **Read in code:** Wherever needed, `const config = await configService.getConfig(); config.creditConfig.your_new_field`
5. **No migration needed** — JSONB column accepts new keys

### "Add a new database table"

1. **Migration file:** `server/migrations/YYYY-MM-DD_<feature>.sql`
   - `CREATE TABLE` statement
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` (mandatory)
   - Add indices for common queries
2. **Run migration:** Paste into Supabase SQL editor
3. **Service:** Create `server/services/<feature>Service.js` with CRUD functions
4. **Route:** `server/routes/<feature>.js`
5. **Register route:** `server/app.js`
6. **Frontend:** Page + components + Zustand store if complex

### "Add a new payment method (e.g., card via Stripe)"

1. **Service:** Extend `manualPaymentService.js` OR create `stripeService.js`
2. **Route:** New endpoint `server/routes/payment.js` — `POST /payment/stripe`
3. **Webhook:** Add `server/routes/webhooks.js` for Stripe events
4. **Frontend:** Add to `TopUpModal.jsx` with method selector
5. **Admin UI:** Add Stripe config in admin settings (API keys via env vars, not DB)
6. **Test:** Stripe test mode end-to-end

### "Add a new AI provider"

1. **Adapter:** `server/services/aiProviders/<provider>.js`
   - Export `{ name, scan, generate }` with matching signature
2. **Meta:** Add to `providerMeta.js` for UI display
3. **Register:** Add to chain in `server/services/aiService.js` (priority order matters)
4. **Env var:** Document new `<PROVIDER>_API_KEY` requirement
5. **Test:** Force fallback to new provider (disable others) and verify

---

## 9. Where to Update Existing

### "Change pricing (BDT per paper)"

- **No code change needed!**
- Admin Dashboard → Settings → Credit System → "পেপার দাম (৳)" input → Save
- Lives in `subscription_config.credit_config.bdt_per_paper`

### "Change rate limits"

- Admin Dashboard → Settings → Rate Limits section
- Backend cache (60s TTL) auto-refreshes
- No code change

### "Update OAuth redirect URLs"

- Supabase Dashboard → Authentication → URL Configuration
- No code change

### "Update CORS allowlist"

- Vercel Dashboard → Settings → Environment Variables → `ALLOWED_ORIGINS`
- Redeploy after edit

### "Modify AI scan prompt"

- `server/services/aiService.js` — find `SCAN_SYSTEM_PROMPT` or similar
- Test with various images before deploy
- Affects ALL providers — eta all-or-nothing change

### "Change paper editor layout"

- `src/pages/PaperEditor.jsx` (top-level layout)
- Individual question types: `src/components/questions/*Editor.jsx`
- State: `src/store/paperStore.js`

### "Update signup flow"

- `src/pages/Register.jsx` — UI
- `src/store/authStore.js` — `applySession` function (auto-runs on session detect)
- `server/routes/auth.js` — `/me` handler creates profile on first hit

### "Modify question type schema"

- Definition: Look in `src/components/questions/<Type>Editor.jsx`
- Backend storage: `papers.questions` is JSONB — schemaless, just consistent shape
- Render: `src/utils/mathRender.js` for math fields

---

## 10. How to Remove a Feature

### General Steps

1. **Identify all references:**
   ```
   grep -r "<feature-name>" src/ server/
   ```
2. **Remove route registration** in `server/app.js`
3. **Delete route file** `server/routes/<feature>.js`
4. **Delete service** `server/services/<feature>Service.js` (and tests)
5. **Remove from frontend:**
   - Delete page `src/pages/<Feature>.jsx`
   - Remove route from `src/App.jsx`
   - Remove nav link from `AppShell.jsx`
   - Remove Zustand store if exists
6. **Database cleanup (optional):**
   - Create migration to `DROP TABLE` if no longer needed
   - Or keep table for historical data
7. **Test build:** `npx vite build` — should succeed
8. **Test backend:** `node -e "require('./server/app.js')"` — should load

### Example: Removing "Routines" feature

1. Delete: `server/routes/routine.js`, `server/services/routineService.js`
2. Remove from `server/app.js`: `app.use('/api/routines', ...)`
3. Delete: `src/pages/Routines*.jsx`, `src/components/routine/`, `src/store/routineStore.js`
4. Remove routes from `src/App.jsx`
5. Remove nav links from `src/components/shared/AppShell.jsx`
6. Migration (optional): `DROP TABLE class_routines CASCADE;`
7. Build verify

---

## 11. Common Code Patterns

### Backend Route Skeleton

```js
const express = require('express')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')
const myService = require('../services/myService')

const router = express.Router()
router.use(requireAuth)

router.post('/', async (req, res, next) => {
  try {
    const { foo } = req.body
    if (!foo) throw new AppError('foo is required', 400)

    const result = await myService.create(req.user.uid, { foo })
    res.json({ success: true, result })
  } catch (err) {
    next(err)
  }
})

module.exports = router
```

### Backend Route with Credit Charge

```js
const { checkAiCredit, withChargedCredit } = require('../middleware/credits')

router.post('/scan', checkAiCredit(1), async (req, res, next) => {
  try {
    const result = await withChargedCredit(
      req.user.uid,
      req.body.paperId,
      1,
      () => aiService.scan(req.body.image),
      (out) => Math.max(0, out.count - 1),
    )
    res.json({ success: true, ...result, creditsCharged: result.creditsCharged })
  } catch (err) {
    next(err)
  }
})
```

### Service Pattern (Supabase)

```js
const { supabaseAdmin } = require('../config/supabase')

async function create(userId, data) {
  const { data: row, error } = await supabaseAdmin
    .from('my_table')
    .insert({ user_id: userId, ...data })
    .select()
    .single()
  if (error) throw error
  return row
}

async function listByUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('my_table')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

module.exports = { create, listByUser }
```

### Frontend API Call

```jsx
import api from '@/services/api'
import toast from 'react-hot-toast'

async function handleSubmit() {
  try {
    const { data } = await api.post('/my-endpoint', { foo: 'bar' })
    toast.success('Done!')
    return data.result
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed')
  }
}
```

### Frontend Auth-Protected Page

```jsx
// src/App.jsx — wrap inside <ProtectedRoute>
<Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
  <Route path="my-page" element={<MyPage />} />
</Route>
```

`ProtectedRoute` automatically redirects unauthenticated users to `/login`.

### Zustand Store Pattern

```js
// src/store/myStore.js
import { create } from 'zustand'

const useMyStore = create((set, get) => ({
  items: [],
  loading: false,
  
  fetchItems: async () => {
    set({ loading: true })
    const { data } = await api.get('/my-endpoint')
    set({ items: data.items, loading: false })
  },
  
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
}))

export default useMyStore
```

### Postgres RPC (Atomic Operations)

```sql
-- Define in migration
CREATE OR REPLACE FUNCTION my_atomic_op(p_uid UUID, p_count INT)
RETURNS INT AS $$
DECLARE result INT;
BEGIN
  UPDATE my_table SET balance = balance + p_count
  WHERE id = p_uid AND balance + p_count >= 0
  RETURNING balance INTO result;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'insufficient_balance';
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

```js
// Call from JS
const { data, error } = await supabaseAdmin.rpc('my_atomic_op', {
  p_uid: userId,
  p_count: 5,
})
if (error) throw error
return data
```

---

## 12. Anti-Patterns — Eshob KORBEN NA

### ❌ NEVER Trust `user_metadata.role`

```js
// ❌ Wrong — client can set this at signup
if (req.user.role === 'admin') { /* dangerous */ }

// ✅ Right — DB-side check
if (req.profile.role === 'admin') { /* safe */ }
```

### ❌ NEVER Charge Credits AFTER AI Call

```js
// ❌ Race condition — parallel requests bypass check
const result = await aiService.scan(...)
await chargeAiCredit(...)

// ✅ Atomic pre-charge with refund
await withChargedCredit(uid, paperId, 1, () => aiService.scan(...))
```

### ❌ NEVER Query DB Directly from Frontend

```js
// ❌ Wrong — RLS deny + leaks anon key surface
import { supabase } from '@/lib/supabase'
const { data } = await supabase.from('papers').select('*')

// ✅ Right — go through backend
const { data } = await api.get('/papers')
```

### ❌ NEVER Skip `try/catch` in Routes

```js
// ❌ Wrong — unhandled rejection crashes
router.post('/', async (req, res) => {
  const result = await dangerousOp()
  res.json(result)
})

// ✅ Right — pass to errorHandler
router.post('/', async (req, res, next) => {
  try {
    const result = await dangerousOp()
    res.json(result)
  } catch (err) {
    next(err)
  }
})
```

### ❌ NEVER Hard-Code Prices/Limits

```js
// ❌ Wrong
if (amount < 10) return error

// ✅ Right
const config = await configService.getConfig()
if (amount < config.creditConfig.min_topup_bdt) return error
```

### ❌ NEVER Forget RLS on New Tables

```sql
-- ❌ Wrong — table is exposed to anon key
CREATE TABLE my_new_table (...);

-- ✅ Right — always enable RLS
CREATE TABLE my_new_table (...);
ALTER TABLE my_new_table ENABLE ROW LEVEL SECURITY;
```

### ❌ NEVER Block on `chargeAiCredit` Failure

```js
// ❌ Wrong — if charge fails after AI success, user already paid for nothing
await chargeAiCredit(uid, paperId, count)  // throws → 402 even though AI worked
res.json(result)

// ✅ Right — log and continue (the `withChargedCredit` wrapper handles this)
```

### ❌ NEVER Mix Frontend Supabase Auth with Direct DB

The frontend `supabase` client (`src/lib/supabase.js`) is for **auth ONLY**:
- ✅ `supabase.auth.signInWithPassword(...)`
- ✅ `supabase.auth.signInWithOAuth(...)`
- ✅ `supabase.auth.signOut()`
- ✅ `supabase.auth.getSession()`
- ❌ `supabase.from('...').select(...)` — RLS will reject anyway

---

## 13. Migration Workflow

### Creating a New Migration

1. **File naming:** `server/migrations/YYYY-MM-DD<suffix>_<description>.sql`
   - Example: `2026-05-14_add_referrals.sql`
   - Use `b`, `c`, etc. suffix for same-day order: `2026-05-13b_xyz.sql`

2. **Template:**
   ```sql
   -- Proshno Shala — <Feature Name>
   -- YYYY-MM-DD
   --
   -- Description: <what this migration does>
   -- Idempotent: <yes/no — safe to re-run?>

   -- Always include IF NOT EXISTS / IF EXISTS guards for idempotency
   ALTER TABLE my_table
     ADD COLUMN IF NOT EXISTS new_field TEXT DEFAULT 'default';

   -- New tables: ALWAYS enable RLS
   CREATE TABLE IF NOT EXISTS new_table (...);
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

   -- Atomic operations: use Postgres functions
   CREATE OR REPLACE FUNCTION my_func(p_arg INT) RETURNS INT AS $$
   BEGIN
     -- ...
   END;
   $$ LANGUAGE plpgsql;
   ```

3. **Apply via Supabase SQL Editor:**
   - Supabase Dashboard → SQL Editor → paste → Run
   - Watch for errors
   - Verify with `SELECT` queries

4. **Document in `CODEBASE_GUIDE.md`** under Database Schema section.

### Rolling Back a Migration

- Supabase Free tier: no PITR, manual revert SQL needed
- Write `DROP COLUMN IF EXISTS`, `DROP TABLE IF EXISTS`, `DROP FUNCTION IF EXISTS` script
- Always test rollback on staging first

---

## 14. Deployment Pipeline

### Vercel Auto-Deploy

```
git push origin main
  ↓
Vercel webhook triggers
  ↓
Vite build (frontend) + serverless function bundle
  ↓
Health check on /api/health
  ↓
DNS routing (custom domain via Cloudflare)
  ↓
Live at https://rongtonu.com
```

### Manual Deploy

```bash
vercel --prod
```

### Pre-Deploy Checklist

- [ ] `npx vite build` passes locally
- [ ] `node --check server/app.js` passes
- [ ] Env vars updated in Vercel if any new variables
- [ ] Migrations applied to Supabase if schema changed
- [ ] Test critical paths (login, AI scan, top-up) in preview deployment

### Post-Deploy Verify

```bash
curl https://rongtonu.com/api/health
# Expect: { "status": "ok", "supabase": "reachable", ... }
```

---

## 15. Troubleshooting Common Issues

### "Site can't be reached" from BD home internet

**Cause:** ISP DNS issue with `*.vercel.app`.
**Fix:** Use custom domain (`rongtonu.com`) — already configured.
**Verify:** `nslookup rongtonu.com` returns Vercel IPs.

### "CORS error" in browser console

**Cause:** Domain not in `ALLOWED_ORIGINS` env var.
**Fix:** Vercel → Env Vars → update `ALLOWED_ORIGINS` → Redeploy.

### "401 Unauthorized" on every API call

**Cause:** JWT expired or invalid.
**Fix:** User should logout + relogin. Check `applySession` in `authStore.js`.

### "402 Payment Required" with insufficient credit

**Cause:** AI op pool exhausted.
**Fix:** User tops up via Pricing page. Or admin adjusts via Settings → Users → ± button.

### "redirect_uri_mismatch" on Google OAuth

**Cause:** Supabase redirect URL not configured for current domain.
**Fix:** Supabase Dashboard → Authentication → URL Configuration → Add domain.

### Supabase project paused

**Cause:** 7-day inactivity on free tier.
**Fix:** Unpause from Supabase dashboard. UptimeRobot 5-min ping prevents this — verify monitor URL is `https://rongtonu.com/api/health`.

### AI scan returns 504 timeout

**Cause:** Vercel Hobby 10-second function timeout, AI provider slow.
**Fix:**
- Frontend retries once on 504 (already implemented)
- Upgrade to Vercel Pro (60s timeout) for permanent fix
- Multi-provider fallback chain reduces single-provider slow calls

### Build fails on Vercel

**Cause:** Syntax error, missing env var, dependency issue.
**Fix:**
- Check Vercel build logs
- Run `npx vite build` locally first
- Verify all `VITE_*` env vars set in Vercel

### Admin "Apply Now" (bulk signup bonus) returns error

**Cause:** `grant_bulk_signup_bonus` RPC missing.
**Fix:** Run migration `2026-05-13b_bulk_signup_bonus.sql` in Supabase SQL editor.

### Top-up amount validates wrong

**Cause:** `min_topup_bdt` or `max_topup_bdt` config issue.
**Fix:** Admin Dashboard → Settings → Credit System → verify values.

---

## 16. AI Provider Strategy

### Chain Order (server/services/aiService.js)

```
1. User's BYO key (if configured for the operation)
2. Groq (free tier — Llama-4 Scout/Maverick)
3. OpenRouter (free models)
4. Mistral (Pixtral/Mistral Small free quota)
5. SambaNova (Llama-4 fast inference)
6. Cohere (Command-A)
7. Novita (Qwen2.5-VL)
8. HuggingFace
9. Z.ai (paid, reliable safety net)
10. Gemini 2.5 Flash (paid, last resort if you add it)
```

### When a Provider Is Skipped

- Missing API key in env
- Provider returned non-200 in last call (temporary blacklist)
- Rate limit hit (we respect their 429)

### Adding a New Provider

See [Section 8 → "Add a new AI provider"](#8-add-new-feature).

### BYO Key Encryption

- User submits API key → `cryptoService.encrypt()` with `KEYS_ENCRYPTION_SECRET`
- Stored encrypted in `user_api_keys.key_encrypted`
- Decrypted only at API call time, never logged
- See `userapikeysetupsecurity.md` for details

---

## 17. Security Model Quick Reference

### Layer Stack (Top to Bottom)

```
1. Helmet HTTP headers              → server/app.js
2. CORS strict allowlist            → server/app.js (uses ALLOWED_ORIGINS env)
3. Body parser limits per route     → server/app.js
4. Global IP rate limit (300/15min) → server/middleware/rateLimit.js
5. JWT verify per request           → server/middleware/auth.js
6. Banned user block                → server/middleware/auth.js:70
7. Auth rate limit (10/15min)       → server/middleware/rateLimit.js
8. Per-scope rate limit             → server/middleware/rateLimit.js
9. Credit pool pre-check            → server/middleware/credits.js
10. Atomic pre-charge (RPC)         → server/services/creditService.js
11. AI provider call                → server/services/aiService.js
12. Refund on failure               → server/middleware/credits.js
13. Admin RBAC (DB role)            → server/middleware/auth.js:118
14. Input validation                → per-route
15. Postgres RLS                    → all 14 public tables
```

### Where Security Checks Live

| Concern | File |
|---------|------|
| JWT verify | `server/middleware/auth.js:requireAuth` |
| Admin check | `server/middleware/auth.js:requireAdmin` |
| Ban enforcement | `server/middleware/auth.js:70` |
| Credit pre-charge | `server/middleware/credits.js:withChargedCredit` |
| Payment double-credit | `server/services/manualPaymentService.js:verifyPayment` |
| Role validation | `server/routes/admin.js:222` |
| Screenshot mime | `server/services/manualPaymentService.js:6` |
| Rate limit | `server/middleware/rateLimit.js` |
| CORS allowlist | `server/app.js:isAllowedOrigin` |
| RLS policies | `server/migrations/2026-05-13d_enable_rls_all_tables.sql` |

---

## 🤖 For AI Tools: Quick Briefing

If you (an AI agent) are reading this for the first time:

1. **Read this file fully** — it's your complete map
2. **Always check the related `*.md` files** for context:
   - `project-technical.md` — security + project overview
   - `PRICING.md` — business model
   - `LAUNCH_CHECKLIST.md` — operational concerns
3. **Before adding code:**
   - Find similar existing patterns (Section 11)
   - Avoid anti-patterns (Section 12)
4. **Before suggesting DB changes:**
   - Check migration workflow (Section 13)
   - All new tables need RLS (Section 12)
5. **For race-safe operations:** Use Postgres RPCs (atomic), not JS loops
6. **For credit-charging features:** Use `withChargedCredit()` wrapper
7. **For admin features:** Stack `requireAuth` + `requireAdmin`
8. **For public endpoints:** No middleware (rare — only `/health`, `/payment/config`)

### Style Conventions

- Comment WHY, not WHAT (let names speak)
- Throw `AppError(msg, statusCode)` for expected errors
- Use `try/catch + next(err)` in routes
- Service functions take `userId` as first arg
- Use `supabaseAdmin` (service role) in backend
- Use absolute path imports: `@/services/api`, `@/store/authStore`

### Don't Do

- Don't introduce new state management (use existing Zustand stores)
- Don't add new global CSS files (use Tailwind)
- Don't add new HTTP clients (use existing `api` axios instance)
- Don't add new SQL migration without idempotency guards
- Don't query the DB from frontend
- Don't trust `user_metadata` for security decisions
- Don't hard-code prices/limits

---

## 📞 Need Help?

For any task:
1. Search this guide for the relevant section
2. Search the codebase: `grep -r "<keyword>" src/ server/`
3. Check related `*.md` files
4. Look at similar existing code (e.g., `papers.js` for new CRUD pattern)

---

**Document maintained by Habib Juwel.**
**Goal: Any AI tool or developer should be able to make changes correctly using only this guide + the codebase.**
