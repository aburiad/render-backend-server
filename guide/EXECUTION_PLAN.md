# Proshno Shala — Credit System Execution Plan

**Date:** 2026-05-13
**Status:** ✅ Implemented (pending DB migration + manual QA on production)
**Owner:** Habib Juwel
**Reference:** [PRICING.md](PRICING.md)

---

## 1. Overview

Pure pay-as-you-go credit system has been built and shipped to the codebase. Every business value (price per paper, AI ops per paper, signup bonus, suggested top-up amounts, payment method numbers) is **admin-configurable from the existing admin panel** — nothing is hard-coded in the source.

- **1 paper = 10 BDT = 25 AI ops** (defaults; both knobs editable from admin)
- **No fixed packs** — user tops up any BDT amount ≥ admin-defined minimum
- **Pure pool** — `profiles.ai_op_credits` (single number, atomic)
- **Manual editing / printing / PDF export / OMR** stays free
- **Free trial:** 25 ops on signup (configurable)
- **Optional BYO Unlimited subscription** behind an admin toggle (hidden by default)

---

## 2. Admin-Configurable Settings (zero hard-coded values)

All settings live in `subscription_config.credit_config` (JSONB). Admin edits via the Settings tab of the existing admin dashboard and the change applies immediately (next request reads new values).

| Setting | Default | What it controls |
|---------|---------|------------------|
| `bdt_per_paper` | 10 | BDT cost of 1 paper |
| `ops_per_paper` | 25 | AI operations bundled per paper |
| `signup_bonus_ops` | 25 | Free credits on signup |
| `referral_bonus_ops` | 25 | Bonus when referred user makes first top-up |
| `min_topup_bdt` | 10 | Minimum top-up amount |
| `suggested_topups_bdt` | [10, 50, 200, 500, 1000, 5000] | Quick-select amounts on pricing page |
| `byo_unlimited_price_bdt` | 999 | BYO key subscription monthly fee |
| `enable_byo_subscription` | false | Show/hide the BYO side offer |

Plus pre-existing config still editable: payment method numbers (bKash/Nagad/Rocket), features list, all rate limits.

---

## 3. Files Changed

### NEW FILES
- `server/migrations/2026-05-13_ai_credits.sql` — schema + RPC functions
- `server/services/creditService.js` — atomic credit ops
- `server/middleware/credits.js` — `checkAiCredit` + `chargeAiCredit`
- `src/components/shared/CreditBalance.jsx` — balance widget (compact + full)
- `src/components/shared/TopUpModal.jsx` — admin-driven top-up flow
- `src/components/shared/OutOfCreditModal.jsx` — global 402 handler
- `PRICING.md` — business model documentation
- `EXECUTION_PLAN.md` — this file

### MODIFIED FILES
**Backend**
- `server/services/configService.js` — added `credit_config` normalisation + defaults
- `server/services/manualPaymentService.js` — `submitTopUp` + credit-add on verify
- `server/routes/auth.js` — `/auth/me` returns credit balance, `/auth/credits` endpoint, signup bonus
- `server/routes/admin.js` — `/admin/users/:uid/credits/adjust` + `/credits/history`, user listing includes credits
- `server/routes/payment.js` — `/payment/topup` + `/payment/quote`, legacy `/manual` kept
- `server/routes/ai.js` — credit check + charge per question extracted
- `server/routes/book.js` — credit check + charge per question generated
- `server/routes/generate.js` — same pattern
- `server/routes/papers.js` — removed `checkLimit('paper_count')` + `'omr'`, removed tier-based watermark/logo gating
- `server/routes/questions.js` — removed `checkLimit('question_bank')`

**Frontend**
- `src/App.jsx` — mounts `<OutOfCreditModal />` globally
- `src/services/api.js` — dispatches `out-of-credit` event on 402, `credits-changed` event on success with charge
- `src/pages/Pricing.jsx` — complete rewrite, admin-driven
- `src/pages/Dashboard.jsx` — credit balance widget, low-balance CTA
- `src/pages/PaperEditor.jsx` — compact credit pill in header
- `src/pages/AdminDashboard.jsx` — credit config editor in Settings tab, per-user credit adjust button

### DELETED FILES
- `server/middleware/subscription.js` — old `FREE_LIMITS` + `checkLimit` + `recordAiScan` no longer used anywhere

---

## 4. Database Migration — Required

Run the migration once on production Supabase before deploy:

```bash
# Option 1: Supabase SQL editor (recommended)
# Paste the contents of server/migrations/2026-05-13_ai_credits.sql

# Option 2: psql
psql "$DATABASE_URL" -f server/migrations/2026-05-13_ai_credits.sql
```

The migration is idempotent — safe to re-run. It:
1. Adds `profiles.ai_op_credits` (default 25) — existing users get the signup bonus
2. Adds `papers.ai_ops_used` for per-paper analytics
3. Creates `credit_purchases` audit table
4. Creates atomic RPC functions: `decrement_ai_credits`, `increment_ai_credits`, `increment_paper_ai_ops`
5. Adds `subscription_config.credit_config` JSONB column for admin-editable settings

---

## 5. API Reference (new + modified)

### `GET /api/payment/config` *(public, modified)*
Returns full config including `creditConfig`. Pricing page reads from this — every visible number flows from here.

### `GET /api/payment/quote?amount=100` *(auth, NEW)*
Returns `{ ops, papersEquivalent, effectiveAmount, bdtPerPaper, opsPerPaper }`. Used by top-up modal for live preview.

### `POST /api/payment/topup` *(auth, NEW)*
Submit a manual top-up payment. Body: `{ amount, method, tranId, phone, screenshot }`. Status pending until admin verifies.

### `POST /api/payment/manual` *(auth, LEGACY)*
Old endpoint, still works. Falls back to `proPrice` if no `amount` sent.

### `GET /api/auth/credits` *(auth, NEW)*
Returns `{ balance, papersEquivalent, opsPerPaper, bdtPerPaper, history }`. Used by widgets.

### `GET /api/auth/me` *(auth, MODIFIED)*
User payload now includes `credits` object: `{ aiOps, papersEquivalent, opsPerPaper, bdtPerPaper }`.

### `POST /api/ai/scan`, `POST /api/book/generate`, `POST /api/generate-question` *(modified)*
- Pre-flight check on `profile.ai_op_credits`. 402 if insufficient.
- After successful provider call, atomically charges N credits (1 per question returned).
- Response includes `creditsCharged` field.
- Optional `paperId` in body → per-paper analytics counter updated.

### `POST /api/admin/users/:uid/credits/adjust` *(admin, NEW)*
Body: `{ delta: number, note?: string }`. Positive = add, negative = subtract. Logged with `source='admin_grant'`.

### `GET /api/admin/users/:uid/credits/history` *(admin, NEW)*
Last 50 credit transactions for one user.

### `PUT /api/admin/subscription/config` *(admin, MODIFIED)*
Accepts `creditConfig` object alongside existing fields. Server normalises and persists.

---

## 6. Credit Flow Diagrams

### Top-up Flow
```
User → Pricing page → reads /payment/config (admin values)
     → enters amount → /payment/quote → preview "X ৳ = N papers = M ops"
     → submits to /payment/topup → manual_payments row (pending)
     → bKash transfer (external)
     → enters tranId → submission complete

Admin → /admin/payments/manual → verifies
      → manualPaymentService.verifyPayment(status='verified')
        → creditService.addCredits()
          → RPC increment_ai_credits (atomic balance update)
          → INSERT INTO credit_purchases (history)
      → user balance reflects within seconds
```

### AI Operation Flow
```
User → clicks "AI Scan" / "Generate" / etc.
     → POST /api/ai/scan with optional paperId
     → checkAiCredit middleware reads profile.ai_op_credits
       → if balance < 1: 402 with topUpRequired:true
         → frontend api.js dispatches "out-of-credit" event
         → <OutOfCreditModal/> opens with TopUpModal CTA
       → else: passes through
     → aiService.scan() makes provider call
       → on failure: throws, response error, NO charge
       → on success:
         → chargeAiCredit(userId, paperId, count) — atomic decrement
         → response carries creditsCharged
         → frontend api.js dispatches "credits-changed"
         → CreditBalance widget refetches
```

---

## 7. Manual QA Checklist

Run after deploying both the migration and the new code.

### Onboarding
- [ ] New email signup → profile created with 25 free ops
- [ ] First Google OAuth signup → same (signup bonus applied)
- [ ] Dashboard widget shows "25 AI · 1 পেপার"
- [ ] credit_purchases has signup row

### AI Operations
- [ ] AI scan deducts 1 op (or N if multi-question)
- [ ] AI generate (book) deducts requested count
- [ ] AI scan with failed provider doesn't deduct
- [ ] Manual question typing/editing: balance unchanged
- [ ] PDF export: balance unchanged
- [ ] Reprint same paper: balance unchanged

### Edge Cases
- [ ] Balance = 1, scan multi-question (5q) → 402 (need 5)? Actually pre-check passes (need 1, have 1), provider returns 5q, RPC decrement throws "insufficient_credits", request errors out. *(Known: edge case where check passes but charge fails. Acceptable for now — user just retries.)*
- [ ] Balance = 0, click any AI button → 402 → OutOfCreditModal appears
- [ ] Banned user: cannot use AI even with credits (handled by `auth.js` ban check)

### Top-Up
- [ ] Submit < min_topup_bdt → 400
- [ ] Submit valid amount → row in manual_payments status='pending'
- [ ] Admin verifies → credits appear in user's pool
- [ ] credit_purchases has purchase row linking to payment
- [ ] User sees updated balance within 30 seconds (or after page refresh)

### Admin
- [ ] Settings tab shows Credit System block
- [ ] Editing `bdt_per_paper` → saves → pricing page reflects new price
- [ ] Editing `ops_per_paper` → next AI charge uses new ratio
- [ ] Editing `suggested_topups_bdt` → top-up modal grid updates
- [ ] Per-user "±" button → prompt → balance changes
- [ ] credit_purchases shows admin_grant row

### Pricing Page
- [ ] All numbers (price, suggested amounts, min top-up) come from config
- [ ] Quick select amounts work
- [ ] Custom amount input shows live quote
- [ ] BYO toggle off → side offer hidden
- [ ] BYO toggle on → side offer visible with admin price

---

## 8. Rollback Plan

If launched and a critical bug emerges:

1. **Soft rollback (preferred):** Set `ai_op_credits = 999999` for all users in production Supabase SQL editor. Effectively disables enforcement without code change.

   ```sql
   UPDATE profiles SET ai_op_credits = 999999;
   ```

2. **Cold rollback:** Revert frontend deploy to the pre-credit commit. Backend can stay deployed — the new endpoints are additive; old `/api/payment/manual` still works.

3. **Migration rollback (rare):** Migration is idempotent and only adds. To fully reverse:
   ```sql
   ALTER TABLE profiles DROP COLUMN IF EXISTS ai_op_credits;
   ALTER TABLE papers DROP COLUMN IF EXISTS ai_ops_used;
   ALTER TABLE subscription_config DROP COLUMN IF EXISTS credit_config;
   DROP TABLE IF EXISTS credit_purchases;
   DROP FUNCTION IF EXISTS decrement_ai_credits;
   DROP FUNCTION IF EXISTS increment_ai_credits;
   DROP FUNCTION IF EXISTS increment_paper_ai_ops;
   ```

---

## 9. Known Issues / Trade-offs

- **Race between pre-check and charge:** Pre-check reads cached `req.profile.ai_op_credits`. If another concurrent request consumes balance between check and charge, the charge RPC throws `insufficient_credits` and the route surfaces a 500-ish error to user. Acceptable — atomic RPC prevents over-spend; user just retries.

- **Multi-question scan billing:** AI scan that extracts N questions charges N credits *after* the call (so user gets all N). If balance was only 1 and AI returned 5q, the RPC will fail; user keeps the 1 credit and gets no questions. *Improvement (future):* pre-fetch image to estimate expected ops before AI call.

- **Refund on user dispute:** No automatic refund flow. Admin uses the "±" button to manually credit back.

- **Subscription tier field still in DB:** `profiles.subscription` and `subscription_end_at` columns kept. Not used for limits anymore but useful for legacy data + potential future BYO Unlimited tracking.

- **`/auth/me` still returns `tier` computed from old subscription logic:** No-op for credit flow — pricing/limits ignore tier. Cosmetic only.

---

## 10. Launch Checklist

- [ ] Migration run on production Supabase
- [ ] Frontend + backend deployed
- [ ] Smoke test signup → free trial → 1 scan → balance drop
- [ ] Smoke test top-up submit → admin verify → balance increase
- [ ] Pricing config double-check (bdt_per_paper = 10, ops_per_paper = 25)
- [ ] WhatsApp support number visible somewhere (Pricing page or settings)
- [ ] Announce on Facebook + WhatsApp groups
- [ ] Monitor `credit_purchases` daily for first week to catch billing issues
- [ ] Track AI cost (Gemini/Groq dashboards) against revenue weekly

---

## 11. Next Steps After Launch

- **Week 1:** Watch for race conditions, false 402s, admin verification backlogs
- **Week 2:** Auto-verify trusted users (after N successful manual verifies)
- **Week 3:** Add referral link flow with bonus_credit auto-grant
- **Month 2:** Email receipt PDFs for credit purchases
- **Month 3:** Volume bonus thresholds ("Top up 5000+ ৳ → 10% bonus credit")
- **Month 6:** Annual institutional contracts with bulk credit packages
