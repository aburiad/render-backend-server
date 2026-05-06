# BYO User API Key — Security Audit

**Feature:** Users can supply their own AI provider API keys, stored encrypted, used in preference to system `.env` fallback.
**Date:** 2026-05-06
**Scope:** Phases 1, 2, 3 (foundation + provider integration + UI). Reviewed end-to-end: user input → DB → AI request.

---

## 1. Executive Summary

| Layer | Protection | Status |
|---|---|---|
| **Encryption at rest** | AES-256-GCM, random IV per row, GCM auth tag | ✅ |
| **Master key storage** | Env var only (Vercel + local `.env`); never in DB or git | ✅ |
| **Database isolation** | Supabase RLS — user can only `SELECT` own rows | ✅ |
| **Authorization** | Every `/api/user/ai-keys/*` route gated by `requireAuth` | ✅ |
| **Transport** | HTTPS in prod (Vercel-enforced); JWT bearer tokens | ✅ |
| **Plaintext exposure surfaces** | Decrypt only at AI call time; never returned to client | ✅ |
| **Logging** | Provider key never logged; only masked preview + error message slices | ✅ |
| **Input validation** | Real provider test call before persistence | ✅ |
| **User deletion cascade** | `ON DELETE CASCADE` on `user_api_keys.user_id` | ✅ |
| **Master key rotation** | Documented as "do not rotate without migration" | ⚠️ accepted risk |
| **Rate limiting on save endpoint** | Not implemented yet | ⚠️ deferred |
| **Brute-force protection on /test** | Not implemented yet | ⚠️ deferred |

**Bottom line:** the BYO key feature is production-deployable with the listed protections. Two deferred items (rate limiting + brute-force on test) should be addressed in the next sprint as part of broader rate-limit work.

---

## 2. Threat Model

### Assets to protect
1. **Plaintext user API keys** — direct money/quota: a leaked Groq key can be used by an attacker until the user revokes it; meanwhile they consume the user's free or paid quota.
2. **Master encryption key** — if leaked, attacker can decrypt every stored user key.
3. **User identity ↔ key mapping** — even masked, the row reveals which providers a user has configured.

### Threat actors
| Actor | Capability | Mitigations |
|---|---|---|
| **Anonymous internet user** | Hits public API endpoints | All `/api/user/ai-keys/*` require valid Supabase JWT → 401 |
| **Authenticated regular user** | Has valid JWT for own account | Routes use `req.user.uid` exclusively; cannot specify another user's `userId` |
| **Authenticated user reading another's keys** | Tries to query `user_api_keys` directly via Supabase anon key | Supabase RLS policy restricts `SELECT` to `auth.uid() = user_id` |
| **Database read access (compromised Supabase service-role key)** | Sees ciphertext + IV + auth tag | Without `API_KEY_ENCRYPTION_KEY`, ciphertext is computationally infeasible to decrypt (AES-256) |
| **Server log access** | Reads stdout / Vercel logs | Only masked previews and error message slices (`.slice(0, 200)`) printed; raw key never logged |
| **Attacker with both DB + master key** | Full compromise | Out of scope — single-vendor catastrophic compromise; no defence at this layer |

### Out of scope
- TLS interception between browser and Vercel (assumed Vercel TLS)
- Attacker controlling user's browser (XSS) — covered by separate XSS audit (`mathRender.jsx` `escapeHtml` + KaTeX `trust:false`)
- Compromise of the upstream AI provider (Groq side-channel) — outside our control

---

## 3. Encryption Layer

### Algorithm choice
**AES-256-GCM** via Node.js built-in `crypto.createCipheriv('aes-256-gcm', ...)`.

| Property | Value | Why |
|---|---|---|
| Key size | 256 bits | NIST-approved, >2030 quantum-resistant for symmetric crypto |
| Mode | GCM | Authenticated encryption — detects tampering, prevents bit-flipping attacks against ciphertext |
| IV size | 96 bits (12 bytes) | GCM standard; random per encrypt; never reused with same key |
| IV storage | Stored alongside ciphertext (base64) — IV is not secret | Standard practice; reusing IV with same key would break confidentiality |
| Auth tag | 128 bits, stored separately (base64) | Decryption fails if any of {ciphertext, IV, auth tag, key} is tampered with |
| Encoding | base64 in DB columns | Storage-efficient, JSON-safe |

### Implementation
[server/services/cryptoService.js](server/services/cryptoService.js)

```js
function encrypt(plaintext) {
  const key = getKey()                              // 32 bytes from env
  const iv = crypto.randomBytes(12)                 // fresh random per call
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return { ciphertext: enc.toString('base64'), iv: iv.toString('base64'), authTag: tag.toString('base64') }
}
```

### Why not just `crypto.createCipher`?
Deprecated since Node 10 — uses key-derivation that's weak by modern standards. `createCipheriv` requires explicit IV → safer.

### Master key validation
`getKey()` rejects any non-64-char-hex string at runtime → fast-fail if env var is missing or malformed. No silent fallback to weak keys.

---

## 4. Storage Layer (Database)

### Schema
```sql
CREATE TABLE user_api_keys (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider     text NOT NULL,
  ciphertext   text NOT NULL,        -- AES-256-GCM ciphertext (base64)
  iv           text NOT NULL,        -- 96-bit IV (base64)
  auth_tag     text NOT NULL,        -- GCM auth tag (base64)
  key_preview  text,                 -- last 4 chars only ("•••••AB12")
  is_verified  boolean DEFAULT false,
  last_verified_at  timestamptz,
  last_used_at      timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);
```

### Properties
- **`UNIQUE(user_id, provider)`** — prevents duplicate keys for same provider; `upsert(...)` overwrites cleanly.
- **`ON DELETE CASCADE`** — when a user is deleted from `auth.users`, all their stored keys are automatically purged. No orphaned secrets.
- **No plaintext column** — by design. There is no field where the unencrypted key could accidentally be stored.
- **`key_preview`** — masked display: only last 4 chars + bullets. Useful for UI confirmation without exposing the secret. Last 4 chars chosen because (a) typical AI keys have unique prefixes (`gsk_`, `sk-or-`, `hf_`) so showing prefix would identify the provider but not the user; (b) last 4 lets the user visually confirm "yes this is the key I pasted".
- **Indexed on `user_id`** — fast lookup at AI request time (1 query loads all 8 user keys).

### Row-Level Security (RLS)
```sql
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own keys"
  ON user_api_keys FOR SELECT
  USING (auth.uid() = user_id);
```

**Backend writes via `supabaseAdmin` (service-role key)** which bypasses RLS — that's correct because the Express route already authenticated the user via JWT and constrains writes to `req.user.uid`.

**RLS protects against**: a developer accident (e.g. swapping to anon key in some new endpoint) or a future client-side query that tries to `SELECT *`. Defence in depth — even if the auth layer is misused, RLS prevents cross-user reads.

---

## 5. Access Control Layer (HTTP)

### Routes
[server/routes/user.js](server/routes/user.js)

```js
router.use(requireAuth)   // EVERY route below requires valid JWT
router.get('/ai-keys', ...)
router.put('/ai-keys/:provider', ...)
router.delete('/ai-keys/:provider', ...)
router.post('/ai-keys/:provider/test', ...)
```

### Identity binding
- `userId` is **always** read from `req.user.uid` (set by `requireAuth` after Supabase JWT verification)
- **Never** accepted from URL path, body, or query string
- A user pasting their own JWT into the body cannot impersonate another user — the path doesn't contain a `userId` parameter

### Allowed actions
| Action | Endpoint | Side effect |
|---|---|---|
| List own keys (masked) | `GET /api/user/ai-keys` | Read-only, no decryption |
| Save/replace key | `PUT /api/user/ai-keys/:provider` | Encrypt + upsert |
| Remove key | `DELETE /api/user/ai-keys/:provider` | Delete row |
| Test key | `POST /api/user/ai-keys/:provider/test` | Real provider API call; flips `is_verified` |

### Disallowed actions
- Cannot read another user's keys (RLS + route-level binding)
- Cannot read own key in plaintext (no endpoint returns it; only `key_preview`)
- Cannot inject SQL (Supabase parameterised queries)

---

## 6. Transport Layer

| Hop | Protection |
|---|---|
| Browser ↔ Vercel | TLS 1.3 (Vercel default), enforced by `Cross-Origin-Opener-Policy` header |
| Vercel ↔ Supabase | TLS, validated by Supabase JS client |
| Vercel ↔ AI provider | TLS to each provider's HTTPS endpoint |
| Local dev | HTTP on localhost — acceptable; production-equivalent via Vite proxy |

JWT bearer tokens travel only over HTTPS. Cookies (Supabase session) marked `Secure` when `https:` is detected.

---

## 7. Application-Layer Defences

### 7.1 Pre-save validation
[src/pages/SettingsAIKeys.jsx](src/pages/SettingsAIKeys.jsx) `handleSaveAndTest`:

```js
1. POST /test with the typed key → real Groq API call with 1-token prompt
2. Only if test passes → PUT to persist (encrypted)
3. Re-test the stored key to set is_verified = true
```

**Why test BEFORE save?** A user pasting `gsk_invalid` should get an error, not a successfully-saved-but-broken key in the DB. Cuts down on "my AI scan doesn't work" support tickets.

### 7.2 Length sanity check
[server/services/userApiKeyService.js](server/services/userApiKeyService.js):

```js
if (trimmed.length < 8) throw new AppError('API key অনেক ছোট — সঠিক key দিন', 400)
```

Trivial protection against accidentally pasting "abc" or empty whitespace. Real validation comes from the test call.

### 7.3 Logging
[server/services/aiService.js:84](server/services/aiService.js#L84):

```js
console.warn(`[ai:${label}] ✗ ${provider.name}: ${msg}`)
```

- Provider error message is logged, but **the API key is never logged** — `chat()` never echoes the key, and `tryModel` only logs HTTP status + response body (which from Groq/etc never contains the request key).
- Test endpoint masks errors via friendly translation:
  ```js
  /401|unauthor/i.test(msg) ? 'Invalid API key (unauthorised)'
  ```
  → user sees "Invalid API key", not raw provider error which could leak request internals.

### 7.4 Decrypt failure isolation
`loadAllForUser` catches per-row decrypt failures:

```js
try {
  out[row.provider] = cryptoService.decrypt(...)
} catch (err) {
  console.warn(`[userApiKeyService] decrypt failed for ${row.provider}:`, err.message)
  // skip this row, continue with others
}
```

If `API_KEY_ENCRYPTION_KEY` is rotated and old rows can't be decrypted, the user just falls back to system keys — they don't see a global failure.

### 7.5 markUsed is fire-and-forget
```js
if (isUserKey && userId) {
  userApiKeyService.markUsed(userId, provider.name).catch(() => {})
}
```

A DB write failure when updating `last_used_at` doesn't block or fail the AI request. The user-facing AI scan succeeds even if Supabase has a transient outage.

---

## 8. Master Key Lifecycle

### Generation
```bash
# Cryptographically secure (Windows-friendly, no openssl needed)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Output is 64 hex characters = 256 bits of entropy.

### Storage
- **Local dev:** `.env` at project root (excluded from git via `.gitignore`)
- **Production:** Vercel → Project Settings → Environment Variables (encrypted at rest by Vercel)
- **Never:** in source code, in DB, in any committed file, in error messages

### Rotation policy: ⚠️ DO NOT ROTATE without migration
Rotating `API_KEY_ENCRYPTION_KEY` makes every existing `user_api_keys` row undecryptable. Users would all show "verify হয়নি" status and AI calls would fall back to system keys silently.

If rotation becomes necessary (e.g. suspected leak):
1. Generate new key as `API_KEY_ENCRYPTION_KEY_NEW`
2. Backfill script: for each row, decrypt with old key → re-encrypt with new key → write back
3. Then promote `API_KEY_ENCRYPTION_KEY_NEW` → `API_KEY_ENCRYPTION_KEY`
4. (Optionally support a second-key fallback during the migration window — `cryptoService` would need a `keyVersion` column to do this cleanly)

**Currently no migration path is implemented.** Acceptable for v1: the master key has never been exposed and the rotation case is rare. Document this as a known limitation.

### Backup
The user is instructed to back up the master key (1Password, secure notes). A lost master key with live encrypted data = unrecoverable.

---

## 9. Known Risks / Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Master key leaks via env var dump | low | catastrophic (every user key decryptable) | Vercel env vars are encrypted at rest; access requires Vercel auth + project membership |
| Master key lost (forgotten / accidental delete) | low | major (all stored keys unreadable; users must re-add) | Backup instruction explicit; failure mode is graceful (decrypt errors → fall back to system keys) |
| User pastes a real key into a phishing site that mimics our UI | medium | user-level (their key, their problem) | Out of scope; standard phishing risk applies |
| User's browser extension reads paste contents | low | user-level | Same; advise users to use private browsing if paranoid |
| Replay attack on /test endpoint | very low | nuisance — could enumerate "is this key valid for this user account" | `/test` is auth-required; an attacker would need a valid JWT first; no rate limiting yet |
| Brute-force on `/test` endpoint trying random keys | low | provider-side rate limits already exist | Add app-level rate limit (deferred to next sprint) |
| Side-channel: timing of "valid vs invalid" responses | very low | nuisance | All test paths take ~equal time (network call dominates) |
| Two users share same physical key (e.g., team Groq key) | n/a | accepted feature | Each user encrypts independently with same plaintext; ciphertext differs (different IV) |

---

## 10. Deferred Items (next sprint)

These were scoped out of the BYO feature delivery but should be addressed soon:

1. **Rate limiting** on `PUT /api/user/ai-keys/:provider` — prevent abuse of "save lots of garbage keys" or repeated test calls.
2. **Provider-call timeout** on `/test` is currently 10 s; could be tightened to 6 s to match Vercel function budget.
3. **Audit log** of save / remove / verify events (separate `user_api_key_events` table) — would let admins investigate "user X says their key was changed without their knowledge".
4. **Multi-key version support** for safe master-key rotation (keyVersion column + multi-key decrypt with fallback).

---

## 11. Verification Checklist (post-deploy)

Run through this after every meaningful change:

### Encryption
- [ ] `API_KEY_ENCRYPTION_KEY` set in Vercel + local — exactly 64 hex chars
- [ ] `node -e "require('dotenv').config(); console.log(require('./server/services/cryptoService').encrypt('test'))"` runs without error
- [ ] Decrypting a known ciphertext returns the original plaintext

### DB
- [ ] `user_api_keys` table exists in Supabase
- [ ] RLS enabled (Supabase → Authentication → Policies)
- [ ] `ON DELETE CASCADE` on `user_id`
- [ ] No plaintext columns

### Access control
- [ ] Logged-out user `GET /api/user/ai-keys` → 401
- [ ] User A cannot see User B's keys (try in DevTools as A: query Supabase with anon key, expect 0 rows for User B's keys)
- [ ] No endpoint returns the decrypted key in the response body

### Save / remove flow
- [ ] Save invalid Groq key → "Invalid API key (unauthorised)" toast, **no row in DB**
- [ ] Save valid Groq key → `user_api_keys` row exists with `ciphertext != 'gsk_real_value'` (encrypted, not plaintext)
- [ ] Remove key → row deleted
- [ ] Replace key → ciphertext / IV / auth_tag all change

### AI request flow
- [ ] With user key configured, scan → server log shows `(user-key)` not `(system-key)`
- [ ] Response includes `"source": "user"`
- [ ] Provider's own dashboard (e.g. console.groq.com) shows the request charged to user's account
- [ ] After remove, scan falls back to system → log shows `(system-key)`

### Logs
- [ ] No raw API key value appears in any log line (search for `gsk_` `sk-or-` `hf_` etc.)
- [ ] Errors are bounded length (`.slice(0, 200)`)

---

## 12. File Reference

### Backend
| Path | Role |
|---|---|
| [server/services/cryptoService.js](server/services/cryptoService.js) | AES-256-GCM encrypt / decrypt / preview |
| [server/services/userApiKeyService.js](server/services/userApiKeyService.js) | DB CRUD, decrypt-at-call-time, `loadAllForUser`, `markUsed`, `markVerified` |
| [server/services/aiProviders/providerMeta.js](server/services/aiProviders/providerMeta.js) | UI metadata for 8 providers |
| [server/services/aiProviders/{groq,openrouter,mistral,sambanova,cohere,novita,huggingface,zai}.js](server/services/aiProviders/) | All accept `apiKey` parameter, env fallback only when not provided |
| [server/services/aiService.js](server/services/aiService.js) | `callWithFallback` routes per-provider via user-key vs system-key resolution |
| [server/routes/user.js](server/routes/user.js) | `requireAuth`-gated `/api/user/ai-keys` endpoints; pre-save validation via real test call |

### Frontend
| Path | Role |
|---|---|
| [src/pages/SettingsAIKeys.jsx](src/pages/SettingsAIKeys.jsx) | UI: paste → test → save → re-verify; remove; per-provider cards |

### Database
| Object | Role |
|---|---|
| `user_api_keys` table (Supabase) | Encrypted-at-rest storage; RLS-protected |

---

## 13. Compliance Posture

- **Industry standard for "store user secrets":** AES-GCM with random IV ≈ what AWS Secrets Manager, GCP Secret Manager, and 1Password use under the hood. ✅
- **OWASP Top 10 (2021)** review:
  - A01 Broken Access Control → mitigated (auth on every route, RLS, no userId from input)
  - A02 Cryptographic Failures → mitigated (AES-256-GCM, IV, auth tag, no weak hash)
  - A03 Injection → mitigated (parameterised Supabase queries, no string concat)
  - A04 Insecure Design → addressed (test-before-save, fail-safe fallback, no plaintext column)
  - A05 Security Misconfiguration → fail-fast on missing key
  - A07 Auth & Session → reuses Supabase JWT verification
  - A09 Logging Failures → keys never logged, errors bounded
- **GDPR-ish posture:** user can delete their key any time; cascade cleanup on account deletion; no third-party processors handle the secret.

---

**End of audit.**
This document should be re-reviewed when:
- Master key rotation is implemented
- A new provider is added
- Logging output changes
- Rate limiting is added
- An incident is reported
