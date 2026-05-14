# Proshno Shala — Pricing & Business Model

**Last Updated:** 2026-05-13
**Status:** Launch-ready strategy
**Owner:** Habib Juwel (habib41juwel@gmail.com)

---

## 1. Executive Summary

Proshno Shala uses a **pure pay-as-you-go credit system** — no monthly subscriptions, no fixed packs. Users top up their account balance and consume credits as they create papers.

- **Unit price:** 1 paper = **10 BDT** (flat, no volume discount)
- **Per-paper AI budget:** 25 AI operations (scan + generate + extract + regenerate)
- **Free trial:** 25 AI ops on signup (≈ 1 paper)
- **Credit expiry:** Never expires
- **Payment:** Manual bKash/Nagad/Rocket only (no recurring)

**Why this model:**
- BD school/coaching market doesn't commit to monthly SaaS subscriptions
- Schools buy in bursts (quarterly exam time), coachings buy weekly
- "10 BDT per paper" matches local pricing intuition (phone balance / data pack mental model)
- No tier confusion — single price, transparent
- Manual labor (typing/editing) stays free; user only pays for AI value

---

## 2. Business Model Overview

### Single Metric: AI Operations

| What Costs Money (charged) | What's Free (no charge) |
|----------------------------|-------------------------|
| AI scan from photo | Manual question typing |
| AI generate from prompt | Editing existing question text |
| AI extract from book chapter | Reordering questions |
| AI regenerate question | Print / PDF export |
| Multi-question batch generate (counted per question) | Reprint same paper |
| Multi-question scan extraction (counted per question extracted) | Adding/removing manual questions |

### Credit Unit Conversion

```
1 BDT  = 0.10 paper  = 2.5 AI ops
10 BDT = 1 paper     = 25 AI ops
100 BDT = 10 papers  = 250 AI ops
1000 BDT = 100 papers = 2,500 AI ops
```

User-facing display: **"You have N papers worth of credit"** (BD-friendly).
Backend tracking: **AI operations consumed from a single pool** (cost-aligned).

---

## 3. Pricing Structure

### Top-up Amounts (Suggested Defaults)

User can top up **any custom amount** (minimum 10 BDT for 1 paper), but suggested defaults:

| Top-up | Papers | AI Ops | Use Case |
|--------|--------|--------|----------|
| 10 BDT | 1 | 25 | Trial / single paper |
| 50 BDT | 5 | 125 | Coaching weekly tests |
| 200 BDT | 20 | 500 | Monthly coaching |
| 500 BDT | 50 | 1,250 | School quarterly |
| 1,000 BDT | 100 | 2,500 | School half-year |
| 2,500 BDT | 250 | 6,250 | School annual |
| 5,000 BDT | 500 | 12,500 | Institution annual |

**No volume discount** — all amounts are at the same 10 BDT/paper rate.

### Free Tier

- **Signup bonus:** 25 AI ops (1 free paper)
- **Referral bonus:** When User A refers User B who tops up, both get 25 ops (1 paper) free
- **No recurring free quota** — pure pay-as-you-go after trial

### Optional Side Offer: BYO Key Subscription

For power users who want unlimited AI with their own API key:

```
🟡 BYO Unlimited — 999 BDT/month
   ✓ Unlimited papers (no AI op limit)
   ✓ User provides their own Gemini/OpenAI key
   ✓ Platform fee only
```

This is an advanced option, not the primary pricing path.

---

## 4. Cost Analysis

### Per-Paper Cost Breakdown (Worst Case)

| Component | Cost (BDT) |
|-----------|-----------|
| AI (Gemini 2.5 Flash, 25 ops × 0.065 BDT worst case) | 1.63 |
| Vercel hosting (bandwidth + function) | 0.08 |
| Supabase (DB + storage + auth) | 0.12 |
| Domain + email + misc | 0.05 |
| Operations overhead (your time, payment verify, support) | 0.62 |
| **TOTAL** | **~2.50 BDT** |

### Margin per Paper

```
Revenue per paper:  10.00 BDT
Cost per paper:     2.50 BDT (worst case)
Gross margin:       7.50 BDT  =  75%
```

Realistic average cost: ~1.50 BDT → **margin 85%**.

### Margin at Different AI Provider Strategies

| Strategy | Cost per paper | Margin |
|----------|---------------|--------|
| Free tier providers only (Groq free, OpenRouter free) | 0.85 BDT (overhead only) | 91.5% |
| Gemini 2.5 Flash paid (recommended) | 2.50 BDT | 75% |
| Cohere fallback (worst case) | 4.50 BDT | 55% |

---

## 5. Revenue Projections

### Assumptions
- Average paid user makes 30 papers/month
- Free trial converts at ~10%
- Mix of school/coaching/tutor as customers

### Year 1 Projection (Conservative — 100 paid users)

| User Type | Count | Avg papers/month | Monthly Spend |
|-----------|-------|------------------|---------------|
| Tutor (10-20 papers/mo) | 40 | 15 | 6,000 BDT |
| Mid coaching (40-60 papers/mo) | 35 | 50 | 17,500 BDT |
| Large coaching (100+ papers/mo) | 20 | 100 | 20,000 BDT |
| School (200+ papers/quarter) | 5 | 75 (averaged) | 3,750 BDT |
| **TOTAL MRR** | **100** | — | **~47,250 BDT/month** |

**Annual revenue: ~5.67 lakh BDT**
**Annual cost: ~1.42 lakh BDT (AI + infra + ops)**
**Net profit Year 1: ~4.25 lakh BDT**

### Year 2 Projection (Growth — 300 paid users)
- MRR: ~1.42 lakh BDT
- ARR: ~17 lakh BDT
- Net profit: ~13 lakh BDT

### Year 3 Projection (Scale — 1,000 paid users)
- MRR: ~4.73 lakh BDT
- ARR: ~57 lakh BDT
- Net profit: ~45 lakh BDT

---

## 6. Credit System Mechanics

### Top-up Flow

```
1. User clicks "Add Credit" on dashboard
2. Enters BDT amount (or selects suggested default)
3. System shows: "{X} BDT = {X/10} papers = {X*2.5} AI ops"
4. User pays via bKash/Nagad/Rocket (manual transaction)
5. Submits transaction ID + screenshot
6. Admin verifies in 24 hours (or auto-verify for trusted users later)
7. Credit added to user's pool atomically
8. User receives notification (in-app + WhatsApp)
```

### Consumption Flow

```
1. User opens paper editor
2. Top-bar shows: "Account balance: 473 AI ops (≈ 19 papers)"
3. Helper notice: "Recommended: 25 ops per paper. Beyond that, 
   credits will be used from other papers' allocation."

4. User clicks "AI Scan" / "AI Generate" / etc.
   → Backend: check ai_op_credits >= 1
   → If yes: call AI provider
   → On success: atomic decrement (-1)
   → Track per-paper in papers.ai_ops_used (analytics)

5. When pool hits 0:
   → 402 response with message
   → Frontend modal: "Out of credit — top up to continue"
   → bKash QR + amount entry → admin verify → credit add
```

### Anti-Abuse Defenses

| Loophole | Defense |
|----------|---------|
| User regenerates same question 1000x | Each regen = 1 op → naturally caps spend |
| User edits text manually after AI → "free questions" | Allowed — manual labor is user's cost |
| User reprints same paper 1000x | Allowed — same content, no new AI cost |
| User scans 1 image with 10 questions | 10 ops charged (per question extracted) |
| User generates 50 questions in 1 prompt | 50 ops charged (per question generated) |
| User deletes paper to "refund" credit | No refund — one-way deduction |

### Per-Paper Soft Notice (Not Enforcement)

When user opens paper editor, show:

```
ℹ️ Recommendation: Use up to 25 AI scans per paper.
   If you exceed, credit will be deducted from your 
   account balance (which is shared across all papers).
```

This is **informational**, not blocking. Pool is the only enforcement layer.

---

## 7. UX Rules

### Dashboard Widget (Always Visible)

```
┌──────────────────────────────────────┐
│ 💳 AI Credit Balance                 │
│                                      │
│ ⚡ 473 AI prompts left                │
│ ≈ 19 papers (avg 25 ops/paper)       │
│                                      │
│ [+ Add Credit]   [📜 History]        │
└──────────────────────────────────────┘
```

### Paper Editor Top Bar

```
┌──────────────────────────────────────────────────────┐
│ 📝 This paper: 17 AI scans used                      │
│ ⚡ Account balance: 473 ops left                     │
│ 💡 ~25 ops recommended per paper                     │
└──────────────────────────────────────────────────────┘
```

### Out-of-Credit Modal

```
┌──────────────────────────────────────┐
│ 🚫 AI quota exhausted                │
│                                      │
│ Your balance: 0 AI prompts           │
│                                      │
│ Top up to continue:                  │
│   10 BDT   — 1 paper                 │
│   100 BDT  — 10 papers               │
│   500 BDT  — 50 papers               │
│   Custom: [_____] BDT                │
│                                      │
│ [Pay with bKash] [Pay with Nagad]    │
│                                      │
│ Or: continue with manual editing     │
└──────────────────────────────────────┘
```

### First-time User Tutorial Toast

```
Welcome! You have 25 free AI ops (1 paper).
Try creating a paper with AI scan or generate.
When you finish, top up for more.
```

---

## 8. Market Positioning

### Comparison with Alternatives

| Alternative | What it costs (BD market) | Per paper equivalent |
|-------------|--------------------------|---------------------|
| Hired question maker (full-time) | 8,000-10,000 BDT/month | ~160-200 BDT/paper |
| Pre-made question book (printed) | 200 BDT/book × 20 papers | 10 BDT/paper (but generic, no custom) |
| Photocopy + manual edit (Word) | Teacher's 2-3 hours/paper | ~50-100 BDT/paper |
| **Proshno Shala** | **10 BDT/paper** | **10 BDT/paper** (custom, AI, instant) |

**Positioning:** Same price as generic question book, but custom, instant, AI-powered.

### Unique Selling Points

1. **Bengali-first UI** — competitors are mostly English
2. **NCTB book content** built-in (Class 6-12 math, expanding)
3. **Math fidelity** — MathLive + KaTeX, symbol-perfect questions
4. **Multi-provider AI fallback** — 8 providers, never down
5. **bKash manual payment** — BD trust factor (no card needed)
6. **Free trial** — 1 paper free on signup (no credit card)
7. **Credits never expire** — buy once, use anytime

---

## 9. Launch Strategy

### Phase 1: Soft Launch (Week 1-2)

- Direct outreach to 20 coaching center owners (WhatsApp/personal network)
- "Founder's program" — first 50 users get 50 BDT bonus credit on first top-up
- Collect feedback, iterate on UX

### Phase 2: Public Launch (Week 3-4)

- Facebook page launch with demo video (Bengali, 3-5 min)
- Post in groups: "Coaching Owners BD", "Teachers of Bangladesh"
- "Free trial — 1 paper, no card required" headline

### Phase 3: Growth (Month 2-3)

- Referral program: refer a coaching → both get 50 BDT credit
- Demo at local coaching centers (1-2 per week)
- Sample question PDFs as free downloads (lead magnets)

### Phase 4: Scale (Month 4-6)

- Local agent/reseller program (20% commission per top-up)
- Annual contract for institutions (custom pricing for 500+ papers/year)
- Content marketing: NCTB-aligned chapter-wise free samples

---

## 10. Edge Cases & FAQs

**Q: What if user's AI op fails (network error)?**
A: No charge — credit only deducted on AI provider success response.

**Q: What if Supabase is down during top-up?**
A: Payment is recorded; credit added when service recovers (manual reconciliation).

**Q: Can user gift credit to another user?**
A: Not in v1. Future feature consideration.

**Q: What about volume discounts later?**
A: Stay simple in v1. After 500+ users, consider tiered top-up bonuses (e.g., "Top up 5000 BDT, get 500 BDT bonus").

**Q: What if AI ops cost rises (Gemini price hike)?**
A: Adjust the ops-per-paper ratio (e.g., 1 paper = 20 ops instead of 25) without changing user-facing price.

**Q: What if user disputes a charge?**
A: Refund policy: 7-day money-back if no questions generated. After AI op consumed, no refund (cost already incurred).

---

## 11. Future Pricing Considerations (Post-Launch)

- **Volume bonuses** after 6 months data: e.g., "Top up 5000 BDT, get +500 bonus credit"
- **Annual institutional contracts** for 200+ papers/year — custom invoice billing
- **White-label tier** for big coaching chains (custom domain, branding) — 5,000+ BDT/month
- **Question quality tiers** — premium AI (Claude/GPT-4) at 2x op cost
- **OMR scan as separate metered service** if usage diverges from question generation

These are **future considerations** — launch with the simple credit system first.

---

## Appendix A: Pricing Calculator (Quick Reference)

| BDT Topped Up | AI Ops | Papers (~25 ops each) | Margin |
|---------------|--------|----------------------|--------|
| 10 | 25 | 1 | 75% |
| 50 | 125 | 5 | 75% |
| 100 | 250 | 10 | 75% |
| 500 | 1,250 | 50 | 75% |
| 1,000 | 2,500 | 100 | 75% |
| 5,000 | 12,500 | 500 | 75% |

Margins computed at worst-case AI cost (Gemini 2.5 Flash paid, 2x retry multiplier).
Realistic average margin: **85%+** with free-tier provider routing.
