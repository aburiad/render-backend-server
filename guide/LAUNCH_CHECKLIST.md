# Proshno Shala — Launch Checklist (Free Tier @ ~50 Users)

**Last updated:** 2026-05-13
**Hosting:** Vercel Hobby + Supabase Free
**Target load:** 50 paid users (~100 trial signups, ~300 papers/month, ~6000 AI ops/month)

This is a severity-ranked list of issues you may hit, with fixes already applied (✅) or instructions you need to run yourself (⚠️).

---

## 🔴 CRITICAL — Will Break the App If Not Done

### C-1: Supabase Project Auto-Pause After 7 Days Inactivity ⚠️

**Issue:** Free Supabase projects pause if no API hits for 7 days. Pause = `/api/auth/me` returns 503 = login dies = "site can't be reached" for users.

**Real risk for 50-user app:** Medium-high — Bangladesh weekends + holidays could naturally produce 7-day low-traffic windows.

**Fix (free, 5 min):** Set up an external uptime monitor that pings every 5 min:

1. Sign up at [UptimeRobot](https://uptimerobot.com/) — free
2. Add monitor:
   - **Type:** HTTP(S)
   - **URL:** `https://<your-vercel-domain>/api/health`
   - **Interval:** every 5 minutes
3. This hits your API every 5 min → Supabase touched → never pauses
4. Bonus: free email/SMS alert if your app goes down

**Alternative:** [Cronjob.org](https://cron-job.org/) — same pattern, 60-second resolution.

---

### C-2: Vercel Hobby Tier Forbids Commercial Use ⚠️

**Issue:** Vercel's [Hobby tier ToS](https://vercel.com/legal/fair-use-policy) restricts use to "personal projects, non-commercial." A paid SaaS technically violates this.

**Real risk:** Low for 50 users, but Vercel has been known to flag and rate-limit commercial-looking Hobby projects. Sudden enforcement = downtime.

**Decision tree:**
- **0-49 users:** Risk-it on Hobby. Worst case → migrate to Pro overnight.
- **50+ paid users:** Upgrade to **Vercel Pro ($20/month = ~2,400 BDT)** for legitimacy + 60s function timeout + better cold-start performance.

**Math:** At 50 users × 200 BDT avg/month = 10,000 BDT MRR — Pro tier covers itself.

---

### C-3: Vercel Function Timeout (10s on Hobby) ⚠️

**Issue:** Hobby tier serverless functions have a hard **10-second** execution timeout. Gemini 2.5 Flash vision calls typically take 3-8s but can spike to 12-15s on cold start + slow user network.

**Symptoms:** Some AI scans fail with 504 Gateway Timeout. User gets "scan failed" toast.

**Mitigation in place:**
- ✅ Frontend retries once on 408/502/503/504 ([MagicScanModal:55-77](src/components/questions/MagicScanModal.jsx#L55))
- ✅ Multi-provider AI fallback chain (8 providers) reduces single-provider slow calls

**Real fix:** Vercel Pro tier = 60s timeout. Until then, **document this for users** as "scan failed? Try again."

---

## 🟠 HIGH — Likely Pain Points

### H-1: Database Storage Growth from Screenshots ⚠️

**Issue:** Top-up screenshots are stored as **base64 data URLs in the `manual_payments.screenshot` column**. Base64 inflates size by ~33%. At 50 users × 2 top-ups/month × 500KB avg = **66 MB/month database growth just from screenshots**.

**Free tier limit:** 500 MB.
**Estimated time to limit:** ~6-7 months at 50 users (extrapolated faster with growth).

**Fix (future — 1-2 hours of work):** Move screenshots to Supabase Storage:
```js
// Frontend uploads to Storage bucket
const { data } = await supabase.storage
  .from('payment-screenshots')
  .upload(`${userId}/${Date.now()}.jpg`, file)
// Store ONLY the path in manual_payments.screenshot
```

**Immediate workaround:** Tighten frontend size cap from 3MB → 1MB to slow growth. Already enforced server-side.

**Schedule:** Tackle when DB usage > 300 MB (check Supabase dashboard monthly).

---

### H-2: Image Upload Size on Vercel Hobby ✅ FIXED

**Issue:** Vercel Hobby caps serverless function request body at ~4.5MB. Modern phone cameras produce 5-12MB JPEGs. Direct uploads from camera fail with 413 Payload Too Large.

**Fix applied:** ✅ Client-side image compression via [src/utils/imageCompress.js](src/utils/imageCompress.js):
- Scales longest side to 1600px (plenty for OCR)
- Re-encodes as JPEG @ 0.85 quality
- Skips compression for files <1MB (passthrough)
- Hard reject in UI if compressed result still >3.5MB

**Wired into:** [MagicScanModal.jsx](src/components/questions/MagicScanModal.jsx) — main AI scan upload path.

**Result:** Typical phone shot (8MB) → ~600-900KB compressed. Always under Vercel limit.

---

### H-3: Cold Start Latency on First Request ⚠️

**Issue:** Vercel serverless functions go cold after ~5 min of no traffic. First request after idle = 500ms-2s extra latency. User sees "loading…" longer.

**Real impact for 50 users:** Mild UX annoyance, especially during off-peak hours (3-6 AM BD time).

**Fix (combined with C-1):** The 5-min UptimeRobot ping keeps the function "warm" — solves both issues simultaneously.

---

### H-4: Single Admin (You) Manual Verify Bottleneck ⚠️

**Issue:** Every top-up needs admin manual verification (open admin panel, check tranID, click verify). At 50 users with 100 top-ups/month, that's ~3-4 admin actions per day.

**Mitigation in place:**
- ✅ WhatsApp link/CTA prominently on pricing page (you can notify user faster)
- ✅ Admin "Pending" tab shows count
- ✅ All verifications atomic (no double-credit risk)

**Future fix (month 2):** Auto-verify trusted users — after 3 successful manual verifies, auto-approve future top-ups up to a daily cap.

---

## 🟡 MEDIUM — Watch but Don't Block Launch

### M-1: Supabase Egress Bandwidth (5GB/month free) 🟡

**Estimate at 50 users:** ~2-3 GB/month (book content reads + paper data + screenshots being viewed by admin).
**Risk:** Low — well under cap. Upgrade required if you cross 4 GB.

**Monitor:** Supabase dashboard → Project → Settings → Usage.

---

### M-2: Vercel Bandwidth (100GB/month free) 🟡

**Estimate at 50 users:** ~5-10 GB/month (JS bundle + API responses + image downloads).
**Risk:** Low — 10% of cap.

**Monitor:** Vercel dashboard → Usage.

---

### M-3: Gemini API Free Tier (1500 req/day) 🟡

**Estimate at 50 users:** ~200-300 AI calls/day (peak). Below 1500 free-tier daily cap.
**Above cap cost:** ~3-5 paisa per call. Even at worst case (5000 calls/day) cost is ~250 BDT/day = 7,500 BDT/month.

**Mitigation in place:**
- ✅ Multi-provider fallback (Groq free, OpenRouter free, etc.) — most calls don't even hit Gemini
- ✅ BYO key option — power users use own keys, your cost = 0

**Monitor:** [Google AI Studio billing](https://aistudio.google.com/) weekly.

---

### M-4: Supabase Pooled Connections (Free Tier Limit) 🟡

**Issue:** Supabase Free has 200 max DB connections via pooler, 20 direct. Each Vercel serverless function instance opens a pool. Concurrent peak could hit limits.

**Real risk at 50 users:** Low — concurrent active users maybe 10-15 max. Pool handles fine.

**Monitor:** Supabase dashboard → Database → Connection pooling stats. Upgrade Pro if you ever see "max connections" errors.

---

### M-5: No Database Backups on Supabase Free ⚠️

**Issue:** Supabase Free has **no Point-in-Time Recovery** and only daily auto-backups for 1 day. If you accidentally `DELETE` users or run a bad migration, recovery is limited.

**Fix (do this week):**
- Weekly SQL dump via cron OR manual:
  ```bash
  pg_dump "<your-supabase-connection-string>" > backup-$(date +%F).sql
  ```
- Save backups to Google Drive / Dropbox

**Or:** Pay $25/mo for Supabase Pro → 7-day PITR + 30-day backup retention.

---

### M-6: Error Visibility (Vercel Logs Disappear in 4hrs) 🟡

**Issue:** Hobby tier logs retained only 4 hours. Intermittent bug at 2 AM = no evidence by 9 AM.

**Fix:** Add [Sentry](https://sentry.io/) free tier (5K events/month) for error tracking:
1. `npm install @sentry/node @sentry/react`
2. Init Sentry in `server/app.js` and `src/main.jsx`
3. ~30 min setup, saves hours of debugging later

---

## 🟢 LOW — Nice to Have Eventually

### L-1: Function Invocations 🟢

**Vercel Hobby:** ~100K invocations/day. At 50 users → ~25K/month total. **0.8% of cap.** ✅

### L-2: Build Minutes 🟢

**6000 min/month.** Each build ~2 min. Allows 3000 deploys/month. ✅

### L-3: Vercel Edge Region 🟢

Default region might be US-East. BD users → +100ms latency. Not noticeable for our flows.
**Fix later:** Vercel Pro → multi-region. Or set region to Singapore via `vercel.json`.

### L-4: Cron Job Limits 🟢

**Vercel Hobby:** 2 cron jobs, once-per-day max. We don't currently use any. UptimeRobot avoids this entirely.

---

## ✅ Already Hardened (No Action Required)

| Concern | Status |
|---------|--------|
| Race conditions in credit decrement | ✅ Atomic Postgres RPC |
| Payment verification double-credit | ✅ Conditional UPDATE |
| Banned user can still use API | ✅ Enforced in `requireAuth` |
| Admin role validation | ✅ Set-based whitelist |
| Top-up amount fraud | ✅ Min/max bounds + server-side amount |
| Screenshot XSS via SVG | ✅ Mime-whitelist (PNG/JPEG/WebP only) |
| RLS on public tables | ✅ Enabled on all 14 tables |
| Trust proxy IP spoofing | ✅ Documented + rate limit primarily uses UID |
| AI cost leak from parallel requests | ✅ Pre-charge + refund pattern |
| Rate limits configurable | ✅ Admin panel |

---

## 📋 Pre-Launch Checklist (Do These Before Going Public)

- [ ] **C-1** Set up UptimeRobot pinging `/api/health` every 5 minutes
- [ ] **C-2** Decide: stay on Vercel Hobby (free, ToS-risky) or upgrade Pro ($20/mo)
- [ ] **M-5** Take initial DB backup (manual `pg_dump` once)
- [ ] **M-6** (Optional but recommended) Set up Sentry for errors
- [ ] Smoke test the full flow: signup → trial → AI scan → top-up → admin verify → balance increase
- [ ] WhatsApp support number visible on Pricing page
- [ ] Sample paper PDFs ready as lead magnets for Facebook posts
- [ ] Run all 4 migrations on production Supabase if not already:
  1. `2026-05-13_ai_credits.sql`
  2. `2026-05-13b_bulk_signup_bonus.sql`
  3. `2026-05-13c_drop_legacy_payments.sql`
  4. `2026-05-13d_enable_rls_all_tables.sql`

---

## 🎯 Decision Matrix: When to Upgrade Tiers

| Users | Monthly Revenue (~) | Recommended Hosting |
|-------|--------------------|--------------------|
| 0-49 | <10K BDT | **Free tiers** + UptimeRobot |
| 50-150 | 10-30K BDT | **Vercel Pro** ($20/mo) keep Supabase Free |
| 150-400 | 30-80K BDT | **Vercel Pro + Supabase Pro** ($45/mo combined) |
| 400+ | 80K+ BDT | Pro tiers + consider Cloudflare CDN |

**Break-even analysis:**
- Vercel Pro pays for itself at ~12 paid users (covers $20 with margin)
- Supabase Pro pays for itself at ~15 paid users
- Both Pro tiers = ~45 paid users to net-positive

---

## 🚨 What to Watch in Week 1 (Launch)

Daily glance at:

1. **Supabase Dashboard → Reports → Storage** (don't cross 300 MB)
2. **Vercel Dashboard → Usage** (bandwidth + invocations)
3. **Admin Panel → Pending Payments** (clear backlog daily)
4. **Admin Panel → Live Saved Values** (sanity check pricing)
5. **WhatsApp / email inbox** (user complaints, signup issues)

Set a **calendar reminder for day 7** to check Supabase usage trends — best indicator of when you need to upgrade.

---

## 🛡️ Emergency Playbook (If Things Break)

### Site shows "can't be reached"
1. Vercel dashboard → check deployment status
2. Supabase dashboard → check project status (paused?)
3. Unpause if needed; redeploy if needed

### Users can't log in
- Likely Supabase issue or env var misconfig
- Check `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel env vars

### Credit not added after admin verify
- Check `credit_purchases` table — was a row inserted?
- If yes but balance didn't update, check `decrement_ai_credits` / `increment_ai_credits` RPCs exist (migration 2026-05-13_ai_credits)

### AI scan failing for everyone
- Vercel function timeout? → check logs
- Gemini quota exhausted? → check Google AI Studio
- Multi-provider fallback should kick in automatically; if not, check provider keys in env vars

### Spam signup wave (CAPTCHA gap)
- Lower `signup_bonus_ops` to 0 temporarily via admin panel
- Use admin "±" button to manually grant to legitimate users
- Add hCaptcha post-incident

---

**Bottom line:** Apnar 50-user load free tier-e fit hoy। Main risks: auto-pause (UptimeRobot), Vercel ToS (decide upgrade timing), screenshot DB growth (defer to month 2-3). Everything else is monitor-and-react.
