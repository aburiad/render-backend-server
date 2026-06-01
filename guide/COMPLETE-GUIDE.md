# 📘 Proshno Shala — Complete Everything Guide

> সব গাইড, ডকুমেন্টেশন, টেকনিক্যাল ডিটেইল একটা ফাইলে।
> **Last updated:** 2026-06-01

---

## 📋 Table of Contents

1. [App Overview](#1-app-overview)
2. [Architecture & Dual Backend](#2-architecture--dual-backend)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Environment Variables](#5-environment-variables)
6. [Database Schema](#6-database-schema)
7. [API Routes Reference](#7-api-routes-reference)
8. [AI Provider Strategy](#8-ai-provider-strategy)
9. [Auth Flow](#9-auth-flow)
10. [Credit System & Pricing](#10-credit-system--pricing)
11. [Subscription / Tier System](#11-subscription--tier-system)
12. [Admin Guide](#12-admin-guide)
13. [Payment System](#13-payment-system)
14. [User API Keys (BYO)](#14-user-api-keys-byo)
15. [Deployment — Vercel + Render](#15-deployment--vercel--render)
16. [Local Development](#16-local-development)
17. [Rate Limits](#17-rate-limits)
18. [Security Model](#18-security-model)
19. [Common Code Patterns](#19-common-code-patterns)
20. [Anti-Patterns](#20-anti-patterns)
21. [Where to Add New Feature](#21-where-to-add-new-feature)
22. [Migration Workflow](#22-migration-workflow)
23. [Troubleshooting](#23-troubleshooting)
24. [Load Test Results](#24-load-test-results)
25. [Roadmap](#25-roadmap)

---

## 1. App Overview

**Proshno Shala** — বাংলাদেশের শিক্ষকদের জন্য AI-powered question paper builder।

### কে ব্যবহার করে:
- স্কুল শিক্ষক
- কোচিং সেন্টার
- এডমিশন প্রিপারেশন
- প্রাইভেট টিউটর

### Core Features:

| Feature | কী করে | Free | Pro |
|---------|---------|------|-----|
| AI Scan | ছবি → OCR → প্রশ্ন বের | ✅ limited | ✅ unlimited |
| Book Generate | NCTB chapter → AI questions | ✅ limited | ✅ unlimited |
| Paper Editor | ম্যানুয়াল + AI প্রশ্ন তৈরি | ✅ ১০টি | ✅ unlimited |
| Question Bank | প্রশ্ন save/reuse | ✅ ৩০টি | ✅ unlimited |
| OMR Generator | OMR sheet তৈরি | ❌ | ✅ |
| Notice + Routine | ইনস্টিটিউশন ডকুমেন্ট | ✅ | ✅ |
| Online Exam | লাইভ পরীক্ষা | ✅ | ✅ |
| BYO AI Keys | নিজের API key ব্যবহার | ✅ | ✅ |
| PDF Print | Watermark-free print | ❌ | ✅ |
| Custom Logo | পেপারে নিজের logo | ❌ | ✅ |

### Question Types:
MCQ, CQ (creative), Short, Broad, Fill-in-blank, Matching, Rearranging, Table, Translation

---

## 2. Architecture & Dual Backend

App-এ **দুটি backend** আছে — Vercel (primary) + Render (persistent):

```
Browser (React SPA)
   │
   ├─→ Vercel Serverless (rongtonu.com)
   │    ├── Frontend: React + Vite
   │    ├── API: Express via serverless-http
   │    ├── Timeout: 10s hard limit
   │    └── AI: Gemini + fallbacks (no queue needed)
   │
   └─→ Render Persistent Server (render-backend-server)
        ├── Express app (always-on)
        ├── Timeout: 60s (no serverless limit)
        ├── AI: Gemini (async.queue concurrency=4) + fallbacks
        └── Queue: handles 50+ concurrent requests
```

### কেন দুটি backend?
- **Vercel** = fast, free, serverless — কিন্তু 10s timeout
- **Render** = persistent, no timeout — 50+ concurrent users handle করতে পারে
- Frontend `/api/backend-config` endpoint থেকে active backend dynamically switch করে

### Frontend Backend Switching:
```
GET /api/backend-config → { active: 'vercel' | 'render', vercel_url, render_url }
```
Frontend `api.js` এই config অনুযায়ী API base URL সেট করে।

---

## 3. Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | React | 19 |
| Build | Vite | 7+ |
| Styling | Tailwind CSS | 4 |
| State | Zustand | 5 |
| Routing | React Router | 7 |
| Animation | framer-motion | - |
| Math | KaTeX + MathLive | - |
| DnD | @dnd-kit | - |
| HTTP | axios | - |
| PDF | html2pdf.js | client-side |
| Backend | Express | 5 |
| Database | Supabase (Postgres) | - |
| Auth | Supabase Auth (JWT) | - |
| AI | 8+ provider fallback chain | - |
| Hosting | Vercel + Render | - |

---

## 4. Folder Structure

```
questionbankk/
├── api/
│   └── index.js                    # Vercel serverless entrypoint
│
├── src/                            # ← FRONTEND (React)
│   ├── main.jsx
│   ├── App.jsx                     # Routes + auth guards
│   ├── components/
│   │   ├── AuthBootstrap.jsx
│   │   ├── shared/
│   │   │   ├── AppShell.jsx        # Main layout (sidebar + outlet)
│   │   │   ├── DesktopSidebar.jsx
│   │   │   ├── MobileHeader.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── Modal.jsx, Loader.jsx, FAB.jsx
│   │   │   ├── TopUpModal.jsx      # bKash/Nagad payment
│   │   │   └── CreditBalance.jsx
│   │   ├── paper/
│   │   │   ├── PaperSetupForm.jsx
│   │   │   ├── PaperTemplate.jsx   # Print preview
│   │   │   ├── OmrSettingsModal.jsx
│   │   │   └── ExamPublishModal.jsx
│   │   └── questions/
│   │       ├── McqEditor, CqEditor, ShortEditor, BroadEditor
│   │       ├── FillBlankEditor, MatchingEditor, RearrangingEditor
│   │       ├── TableEditor, TranslationEditor
│   │       ├── MagicScanModal.jsx    # AI image scan
│   │       ├── BookGenerateModal.jsx # AI book generate
│   │       └── ImportFromBankModal.jsx
│   ├── pages/
│   │   ├── Login.jsx, Register.jsx, AuthCallback.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PaperEditor.jsx, PapersList.jsx
│   │   ├── PDFPreview.jsx, OmrPreview.jsx
│   │   ├── QuestionBank.jsx
│   │   ├── ScanUpload.jsx
│   │   ├── Pricing.jsx
│   │   ├── SettingsAIKeys.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ExamPortal.jsx, Results.jsx
│   │   ├── NoticesList.jsx, NoticeEditor.jsx, NoticePreview.jsx
│   │   └── RoutinesList.jsx, RoutineEditor.jsx, RoutinePreview.jsx
│   ├── store/
│   │   ├── authStore.js, paperStore.js, examStore.js
│   │   ├── noticeStore.js, routineStore.js
│   ├── services/
│   │   └── api.js                  # axios + JWT interceptor
│   ├── lib/
│   │   └── supabase.js             # Browser client (anon key)
│   └── utils/
│       ├── formatting.js
│       ├── imageCompress.js
│       └── mathRender.js
│
├── render-backend-server/          # ← RENDER BACKEND (persistent)
│   ├── app.js                      # Express app
│   ├── index.js                    # Server entry
│   ├── package.json                # CommonJS
│   ├── config/
│   │   └── supabase.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT verify + ban check + requireAdmin
│   │   ├── credits.js              # checkAiCredit, withChargedCredit
│   │   ├── rateLimit.js
│   │   └── errorHandler.js         # AppError class
│   ├── routes/
│   │   ├── auth.js, ai.js, book.js, generate.js
│   │   ├── papers.js, questions.js, exam.js
│   │   ├── payment.js, admin.js, user.js
│   │   ├── notice.js, routine.js
│   │   ├── limits.js, pdfServer.js
│   ├── services/
│   │   ├── aiService.js            # Multi-provider orchestrator + hedge
│   │   ├── aiProviders/
│   │   │   ├── index.js            # Provider registry + chain
│   │   │   ├── gemini.js           # async.queue(concurrency=4)
│   │   │   ├── groq.js, mistral.js, sambanova.js
│   │   │   ├── novita.js, huggingface.js, cohere.js, zai.js
│   │   │   └── providerMeta.js     # UI metadata
│   │   ├── creditService.js
│   │   ├── configService.js
│   │   ├── manualPaymentService.js
│   │   ├── paperService.js, questionService.js
│   │   ├── examService.js
│   │   ├── bookService.js
│   │   ├── noticeService.js, routineService.js
│   │   ├── userApiKeyService.js
│   │   └── cryptoService.js        # AES-256-GCM
│   ├── utils/
│   │   ├── imagePreprocessor.js
│   │   ├── imageQualityAssessor.js
│   │   └── strictOcrPrompts.js
│   └── data/
│       └── bookCurriculumFallback.json
│
├── vercel.json                     # Vercel routing
├── vite.config.js                  # Vite + dev proxy
├── package.json
└── guide/                          # Documentation
```

---

## 5. Environment Variables

### Vercel (Production)

```bash
# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# CORS
ALLOWED_ORIGINS=https://rongtonu.com,https://www.rongtonu.com
CLIENT_URL=https://rongtonu.com
FRONTEND_URL=https://rongtonu.com

# BYO Key Encryption
KEYS_ENCRYPTION_SECRET=<openssl rand -hex 32>

# AI Provider Keys (system fallback)
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
MISTRAL_API_KEY=...
SAMBANOVA_API_KEY=...
COHERE_API_KEY=...
NOVITA_API_KEY=...
HUGGINGFACE_API_KEY=hf_...
Z_API_KEY=...

# Gemini (multiple keys for round-robin)
GEMINI_API_KEY=...
GEMINI_API_KEY_TWO=...
GEMINI_API_KEY_THREE=...
GEMINI_API_KEY_FOUR=...
GEMINI_API_KEY_FIVE=...

# Node
NODE_ENV=production
```

### Render (Backend Server)

Same as Vercel minus `VITE_*` vars. Plus:
```bash
PORT=5000  # or whatever Render assigns
```

### Key Notes:
- `VITE_*` vars are **browser-exposed** — never put secrets there
- `KEYS_ENCRYPTION_SECRET` = 32-byte hex for AES-256-GCM (BYO key encryption)
- Multiple Gemini keys = 5 keys × 4 models = massive free quota
- `AI_PROVIDER_TIMEOUT_MS` env var is **intentionally ignored** on Render (hardcoded 60s)

---

## 6. Database Schema

### Active Tables (14+)

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `profiles` | id, email, display_name, role, ai_op_credits, is_banned | User profile + credits |
| `papers` | id, user_id, exam_title, questions (JSONB), ai_ops_used | Question papers |
| `question_bank` | id, user_id, type, data (JSONB) | Saved questions |
| `manual_payments` | id, user_id, amount, method, tran_id, status, screenshot | Top-up records |
| `credit_purchases` | id, user_id, amount_bdt, ai_ops_added, source | Credit audit trail |
| `notices` | id, user_id, title, content (JSONB) | Notice generator |
| `class_routines` | id, user_id, name, schedule (JSONB) | Class routines |
| `exams` | id, user_id, code, settings (JSONB) | Live exams |
| `exam_submissions` | id, exam_id, student_name, answers (JSONB) | Exam responses |
| `book_chapters` | id, class_num, subject, chapter_id, full_text | NCTB content |
| `book_questions` | id, chapter_id, type, data (JSONB) | Book questions |
| `user_api_keys` | id, user_id, provider, key_encrypted | BYO AI keys |
| `subscription_config` | id=1, pro_price, rate_limits, credit_config | Global config |
| `rate_limit_counters` | scope, key, count, reset_at | Rate limit state |

### Atomic Postgres RPCs

| Function | Purpose |
|----------|---------|
| `decrement_ai_credits(uid, count)` | Race-safe credit consumption |
| `increment_ai_credits(uid, count)` | Race-safe credit addition |
| `increment_paper_ai_ops(paperId, count)` | Per-paper analytics |
| `grant_bulk_signup_bonus(bonus, admin_uid)` | Bulk retroactive bonus |
| `rate_limit_increment(scope, key, window)` | Distributed rate limiting |

### RLS Status:
- All tables have RLS enabled
- Backend = service role key → bypasses RLS
- Frontend = anon key → deny-all

---

## 7. API Routes Reference

### Auth (`/api/auth/*`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/auth/me` | Required | User profile + credits |
| GET | `/auth/credits` | Required | Credit balance + history |
| PUT | `/auth/set-role` | Required | Set role after OAuth signup |

### AI (`/api/ai/*`, `/api/book/*`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/ai/scan` | Required | Vision OCR |
| POST | `/generate-question` | Required | Legacy alias for scan |
| POST | `/book/generate` | Required | NCTB → AI questions |
| GET | `/book/subjects/:class` | Required | List subjects |
| GET | `/book/chapters/:class/:subject` | Required | List chapters |

### Papers (`/api/papers/*`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/papers` | Required | Create paper |
| GET | `/papers` | Required | List user papers |
| GET/PUT/DELETE | `/papers/:id` | Required | CRUD |
| GET | `/papers/:id/omr` | Required | OMR data |

### Payment (`/api/payment/*`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/payment/config` | Public | Pricing config |
| GET | `/payment/quote?amount=` | Required | Top-up preview |
| POST | `/payment/topup` | Required | Submit payment |

### Admin (`/api/admin/*`) — requireAdmin
| Method | Path | Purpose |
|--------|------|---------|
| GET/PUT | `/admin/subscription/config` | Admin config |
| GET/PUT | `/admin/users` / `/admin/users/:uid` | User management |
| POST | `/admin/users/:uid/credits/adjust` | Manual credit adjust |
| GET | `/admin/payments/manual` | Pending top-ups |
| GET | `/admin/payments/all` | All payments |
| POST | `/admin/payments/verify` | Verify/reject payment |
| GET | `/admin/stats` | Dashboard stats |

### Other
| Path | Purpose |
|------|---------|
| `/api/health` | Health check (public) |
| `/api/health/deep` | Deep health (public) |
| `/api/backend-config` | Active backend config (public) |
| `/api/limits/status` | Rate limit dashboard |
| `/api/user/api-keys/*` | BYO AI key CRUD |
| `/api/questions/*` | Question bank CRUD |
| `/api/exam/*` | Live exam |
| `/api/notices/*`, `/api/routines/*` | Document CRUD |
| `/api/pdf-server/*` | PDF generation proxy |

---

## 8. AI Provider Strategy

### Provider Chain (Render Backend)

```
VISION: gemini → groq → mistral → sambanova → huggingface (+ cohere, novita, zai)
TEXT:   gemini → groq → sambanova → mistral → cohere → novita → huggingface → zai
```

### Gemini (Primary) — Multi-Key Round-Robin

**Models (Vision):**
| Model | RPM | RPD | Notes |
|-------|-----|-----|-------|
| gemini-3.1-flash-lite | 15 | 500 | 🏆 Highest quota |
| gemini-3.5-flash | 5 | 20 | Fast (~5s) |
| gemini-2.5-flash-lite | 10 | 20 | Fast (~5.5s) |
| gemini-2.5-flash | 5 | 20 | Good quality (~9s) |

**Models (Text):**
| Model | RPM | RPD | Notes |
|-------|-----|-----|-------|
| gemma-4-31b-it | 15 | 1,500 | 🏆 Best text |
| gemma-4-26b-a4b-it | 15 | 1,500 | 🏆 Best text |
| + all vision models as fallback | | | |

**5 API keys × 4-6 models = ~17.5K calls/day free!**

### Queue System (Render only):
- `async.queue(concurrency=4)` — 4 requests at a time
- 20 requests = 5 batches × ~12s = ~60s total wall time
- 100% success rate with queue
- `getQueueInfo()` exposed for queue-aware hedge delay

### Hedged Fallback:
1. Fire Gemini immediately
2. After 8-10s (hedge delay), if no response → fire ALL fallbacks in parallel
3. Return first success
4. Hedge delay is queue-aware (adjusts based on queue depth)

### Timeout Configuration:
| Environment | Provider Timeout | Hedge Delay |
|-------------|-----------------|-------------|
| Vercel | 8s | 8s |
| Render | 60s | 10s (capped) |

### Other Providers:
| Provider | Vision | Text | Free Tier |
|----------|--------|------|-----------|
| Groq | ✅ | ✅ | Generous |
| Mistral | ✅ | ✅ | Moderate |
| SambaNova | ❌ | ✅ | Good |
| Cohere | ❌ | ✅ | Limited |
| Novita | ✅ | ✅ | Limited |
| HuggingFace | ✅ | ✅ | Limited |
| Z.ai | ❌ | ✅ | Limited |

---

## 9. Auth Flow

```
Frontend Supabase client → signInWithPassword / signInWithOAuth
       ↓
Supabase JWT in localStorage
       ↓
axios interceptor attaches Authorization: Bearer <token>
       ↓
Backend requireAuth middleware:
   1. Extract token
   2. supabaseAdmin.auth.getUser(token) — cryptographic verify
   3. Load profile from DB
   4. Check is_banned → 403 if banned
   5. Compute tier (free/trial/pro) → req.user.tier
   6. Populate req.user, req.profile
       ↓
Route handler with authenticated context
```

**Roles:** `school`, `coaching`, `admission`, `private_tutor`, `admin`

**Important:** সবসময় `req.profile.role` check করো — `req.user.role` নয় (client-controllable metadata)।

---

## 10. Credit System & Pricing

### Pay-as-You-Go Model:

```
1 paper = 10 BDT = 25 AI ops (admin-configurable)
```

- Signup → 25 free ops (configurable)
- 1 AI scan/generate = 1 op per question
- Manual typing/edit/print/PDF = **FREE**
- Credits never expire

### Pricing Math:
```js
ops = floor(amount_bdt / bdt_per_paper) * ops_per_paper
// 100 BDT @ 10৳/paper × 25 ops/paper = 250 ops
```

### Admin Configurable:
- `subscription_config.credit_config` JSONB column
- AdminDashboard → Settings থেকে change করা যায়
- No code change needed

### Credit Charge Pattern (Race-Safe):
```js
const result = await withChargedCredit(
  uid, paperId, 1,              // initial charge
  () => aiService.scan(...),    // work
  (out) => Math.max(0, out.count - 1),  // extra charge
)
```

---

## 11. Subscription / Tier System

### Three Tiers:

```
created_at + trialDays > now  →  TRIAL (full pro features)
subscription='pro' && end_at > now  →  PRO
otherwise  →  FREE (limited)
```

### Where Enforced:

| File | What |
|------|------|
| `middleware/auth.js` | Computes tier per request → `req.user.tier` |
| `middleware/subscription.js` | `checkLimit(type)` — paper/question/AI count cap |
| `routes/papers.js` | Watermark/logo gate |

### Free Tier Limits:
```js
const FREE_LIMITS = {
  papers: 10,
  question_bank: 30,
  ai_scan: 30, // per month, auto-reset
}
```

### trialDays Setting:
- `subscription_config` table (single row, id=1)
- Admin panel → Settings থেকে change করা যায়
- Backend 60s cache

---

## 12. Admin Guide

### A. নিজেকে admin বানানো (একবারই)

```sql
UPDATE profiles SET role = 'admin', updated_at = NOW()
WHERE email = 'YOUR_EMAIL@example.com';
```

Logout → login → `/admin` URL-এ যাও।

### B. Admin Dashboard Tabs

#### 1. একনজরে (Overview)
- মোট ইউজার, মোট পেপার, মোট আয় (৳)

#### 2. ইউজার (Users)
- সব registered user list
- Role বদলানো, subscription toggle, ban/unban
- Instant Pro upgrade

#### 3. সকল লেনদেন (Transactions)
- সব payment history

#### 4. সেটিংস (Settings) ⭐
- প্রো প্ল্যান প্রাইস (৳)
- ফ্রি ট্রায়াল দিন (default 90)
- ফিচার লিস্ট
- ম্যানুয়াল পেমেন্ট নম্বর (bKash/Nagad/Rocket)
- Credit system config

#### 5. ম্যানুয়াল পেমেন্ট (Pending) ⭐ Daily Routine
- Screenshot thumbnail + lightbox
- User email, phone, transaction ID
- Verify/বাতিল button
- Verify = instant Pro (30 days)

### C. Daily Workflow:
1. Pending payments tab → new requests দেখো
2. Screenshot/tranId verify (নিজের bKash app-এ মিলিয়ে)
3. সঠিক → "ভেরিফাই", spam → "বাতিল"
4. Monthly: Overview → revenue tracking

---

## 13. Payment System

### Manual Payment (bKash/Nagad/Rocket):

1. User → Pricing page → Top-up modal
2. Amount select → payment number দেখায়
3. User bKash/Nagad-এ টাকা পাঠায়
4. Screenshot upload + transaction ID submit
5. Admin → Pending payments → Verify/Reject
6. Verify = credits added instantly

### Payment Config:
- Numbers stored in `subscription_config.manual_payment_methods` (JSONB)
- Admin settings থেকে add/delete
- ⚠️ কমপক্ষে একটা নম্বর সেট করো — না হলে warning দেখাবে

---

## 14. User API Keys (BYO)

### System:
- User নিজের AI API key দিতে পারে (Settings → AI Keys)
- Keys AES-256-GCM encrypted (`KEYS_ENCRYPTION_SECRET`)
- Stored in `user_api_keys` table
- User's key tried FIRST before system fallback

### Security:
- 🔑 `KEYS_ENCRYPTION_SECRET` = 32-byte hex
- Encryption: AES-256-GCM with random IV
- Keys never logged or exposed in API responses
- `userApiKeyService.js` handles encrypt/decrypt

### Supported Providers:
- Gemini (user gets unlimited quota with own key)
- OpenAI (if added)

---

## 15. Deployment — Vercel + Render

### Vercel (Primary — rongtonu.com)

```bash
git push origin main
  ↓ Vercel auto-deploy
  ↓ Vite build + serverless bundle
  ↓ Health check
  ↓ Live at https://rongtonu.com
```

**Config:**
- `vercel.json` — `/api/*` → serverless, বাকি → SPA
- Vercel Free tier: **10s function timeout**
- AI provider timeout: 8s (hardcoded)

### Render (Persistent Backend)

**Repo:** `render-backend-server/` subfolder
**URL:** `https://render-backend-server-irsv.onrender.com`

**Deploy:**
```bash
cd render-backend-server
git add .
git commit -m "message"
git push origin main
```

**Key differences from Vercel:**
- No timeout limit (60s provider timeout for queue wait)
- `async.queue(concurrency=4)` for Gemini
- Persistent process — shared event loop
- Queue-aware hedge delay

### Pre-Deploy Checklist:
- [ ] `npx vite build` passes
- [ ] `node --check server/app.js` passes
- [ ] Env vars updated if new
- [ ] Migrations applied to Supabase

### Post-Deploy Verify:
```bash
# Vercel
curl https://rongtonu.com/api/health
# Render
curl https://render-backend-server-irsv.onrender.com/api/health
# Expect: { "status": "ok", "debug": { "providerTimeoutMs": ... } }
```

---

## 16. Local Development

```bash
# 1. Clone + install
git clone <repo>
cd questionbankk
npm install

# 2. .env file তৈরি করো (Supabase + AI keys)

# 3. Run frontend + backend
npm run dev          # Vite on :5173
npm run dev:server   # Express on :5000
# OR:
npm run dev:all      # Both together
```

Vite dev server `/api/*` requests `:5000`-এ proxy করে।

### Render Backend Locally:
```bash
cd render-backend-server
npm install
npm run dev    # or node index.js
```

---

## 17. Rate Limits

### Scope-based Rate Limiting:

| Scope | Window | Limit | Applied To |
|-------|--------|-------|------------|
| global | 15 min | 200 req | All /api (production only) |
| auth | 15 min | 10 req | Login/register |
| ai | 1 min | 10 req | AI scan/generate |
| user-key | 1 min | 5 req | BYO key management |

### Storage:
- `rate_limit_counters` table (Supabase)
- Atomic `rate_limit_increment()` RPC
- Production only — dev bypasses

### Admin Dashboard:
- `/api/limits/status` → current usage
- Admin Settings → change limits (no code change)

---

## 18. Security Model

### CORS:
- Explicit allowlist (no `*.vercel.app` wildcard)
- `ALLOWED_ORIGINS` + `CLIENT_URL` + `FRONTEND_URL` env vars
- Localhost allowed only in non-production

### Auth:
- Supabase JWT (cryptographic verification)
- `req.profile.role` for RBAC (NOT `req.user.role`)
- `requireAdmin` middleware for admin routes

### BYO Key Encryption:
- AES-256-GCM with 32-byte secret
- Random IV per encryption
- Keys stored encrypted in DB
- Never logged or returned in API responses

### Rate Limiting:
- Per-user (uid-based) for authenticated routes
- Per-IP for unauthenticated routes
- `trust proxy = 1` (trust last hop only)

### Helmet:
- CORS, CSP, COOP, CORP headers
- Content security policy disabled (needs PDF work)

---

## 19. Common Code Patterns

### Backend Route Skeleton:
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

### Credit-Charged Route:
```js
const { checkAiCredit, withChargedCredit } = require('../middleware/credits')

router.post('/scan', checkAiCredit(1), async (req, res, next) => {
  try {
    const result = await withChargedCredit(
      req.user.uid, req.body.paperId, 1,
      () => aiService.scan(req.body.image),
      (out) => Math.max(0, out.count - 1),
    )
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
})
```

### Frontend API Call:
```jsx
import api from '@/services/api'
import toast from 'react-hot-toast'

try {
  const { data } = await api.post('/my-endpoint', { foo: 'bar' })
  toast.success('Done!')
} catch (err) {
  toast.error(err.response?.data?.message || 'Failed')
}
```

### Zustand Store:
```js
import { create } from 'zustand'
const useMyStore = create((set, get) => ({
  items: [],
  loading: false,
  fetchItems: async () => {
    set({ loading: true })
    const { data } = await api.get('/my-endpoint')
    set({ items: data.items, loading: false })
  },
}))
```

---

## 20. Anti-Patterns

### ❌ NEVER Trust `user_metadata.role`
```js
// ❌ Client-controllable
if (req.user.role === 'admin')
// ✅ DB-verified
if (req.profile.role === 'admin')
```

### ❌ NEVER Charge Credits AFTER AI Call
```js
// ❌ Race condition
const result = await aiService.scan(...)
await chargeAiCredit(...)
// ✅ Atomic pre-charge
await withChargedCredit(uid, paperId, 1, () => aiService.scan(...))
```

### ❌ NEVER Query DB from Frontend
```js
// ❌ RLS deny + leaks anon key
await supabase.from('papers').select('*')
// ✅ Through backend
await api.get('/papers')
```

### ❌ NEVER Skip try/catch in Routes
```js
// ❌ Unhandled rejection crashes
router.post('/', async (req, res) => { ... })
// ✅ Pass to errorHandler
router.post('/', async (req, res, next) => {
  try { ... } catch (err) { next(err) }
})
```

### ❌ NEVER Hard-Code Prices
```js
// ❌ Wrong
if (amount < 10) return error
// ✅ Config-driven
const config = await configService.getConfig()
if (amount < config.creditConfig.min_topup_bdt) return error
```

### ❌ NEVER Forget RLS on New Tables
```sql
CREATE TABLE new_table (...);
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
```

---

## 21. Where to Add New Feature

### New Route:
1. `server/services/myService.js` — DB logic
2. `server/routes/myRoute.js` — Express router
3. `server/app.js` → `app.use('/api/my-route', ...)`
4. Frontend → `api.get('/my-route')`

### New Page:
1. `src/pages/MyPage.jsx`
2. `src/App.jsx` → Route যোগ
3. Sidebar/BottomNav → link যোগ

### New Question Type:
1. `src/components/questions/MyTypeEditor.jsx`
2. `QuestionWrapper.jsx` → register
3. `PaperTemplate.jsx` → render logic

### New AI Provider:
1. `server/services/aiProviders/X.js` → `{ name, supportsVision, supportsText, chat }`
2. `index.js` → VISION_CHAIN / TEXT_CHAIN-এ যোগ
3. `.env` → new key

### New Admin Config:
1. `configService.js` → default + normalizer
2. `AdminDashboard.jsx` → input field
3. No migration needed — JSONB

---

## 22. Migration Workflow

### Creating Migration:
```sql
-- File: migrations/YYYY-MM-DD_description.sql
-- Always IF NOT EXISTS / IF EXISTS for idempotency

ALTER TABLE my_table
  ADD COLUMN IF NOT EXISTS new_field TEXT DEFAULT 'default';

CREATE TABLE IF NOT EXISTS new_table (...);
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
```

### Apply:
- Supabase Dashboard → SQL Editor → paste → Run
- Verify with SELECT queries

### Rollback:
- Write DROP COLUMN/TABLE/FUNCTION script
- Test on staging first
- Free tier: no PITR

### Existing Migrations:
| Migration | Purpose |
|-----------|---------|
| `2026-05-12_papers_print_settings.sql` | Print settings |
| `2026-05-13_ai_credits.sql` | Credit system schema + RPCs |
| `2026-05-13b_bulk_signup_bonus.sql` | Bulk bonus RPC |
| `2026-05-13c_drop_legacy_payments.sql` | SSLCommerz cleanup |
| `2026-05-13d_enable_rls_all_tables.sql` | RLS on all 14 tables |

---

## 23. Troubleshooting

| Symptom | কারণ | Fix |
|---------|-------|-----|
| `/admin` redirect | role ≠ admin | SQL: `UPDATE profiles SET role='admin' WHERE email='...'` |
| Payment number missing | config empty | Admin → Settings → add number |
| Free user gets pro features | trialDays misconfigured | Check admin settings |
| AI scan 502 | All providers fail | Check `/api/health`, verify env keys |
| CORS error | Domain not allowed | Update `ALLOWED_ORIGINS` env var |
| Site unreachable from BD | ISP DNS | Use custom domain (rongtonu.com) |
| 401 on every call | JWT expired | Logout + relogin |
| 402 insufficient credit | Credits exhausted | Top-up or admin adjust |
| Google OAuth redirect error | URL mismatch | Supabase → Auth → URL config |
| Supabase paused | 7-day inactivity | Unpause + verify UptimeRobot ping |
| AI timeout 60s+ | Render queue congested | Normal with queue — hedge fires at 10s |
| `providerTimeoutMs` wrong in health | Old code deployed | Redeploy render-backend-server |

---

## 24. Load Test Results

### Vercel (rongtonu.com) — 20 concurrent:
```
✅ 20/20 SUCCESS
Avg: 8.9s
Provider: Gemini 20/20
```

### Render — 20 concurrent (with queue):
```
✅ 20/20 SUCCESS
Min: 53.5s | Avg: 58.8s | Max: 62.2s
Provider: Gemini 20/20
Wall time: 62.2s
```

### Test Command:
```bash
node test-20users-concurrent.cjs
```

### Key Config for Success:
- `async.queue(concurrency=4)` on Render
- `PROVIDER_TIMEOUT_MS = 60s` (includes queue wait)
- Hedge delay capped at 10s
- 5 Gemini API keys × 4 models = high quota

---

## 25. Roadmap

### Potential Future Features:
- Annual subscription
- Auto-downgrade cron (subscription_end_at past → free)
- Per-user trial extension
- Coupon/discount codes
- Referral bonus
- Email notifications
- Analytics dashboard
- Bulk question import (CSV/Excel)
- Multi-language (English UI)
- Stripe/card payment
- Auto AI provider switching based on quota

---

**End of Complete Guide.** সব কিছু একটা ফাইলে। 🎯