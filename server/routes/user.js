const express = require('express')
const { requireAuth } = require('../middleware/auth')
const userApiKeyService = require('../services/userApiKeyService')
const { PROVIDER_META, PROVIDER_BY_NAME } = require('../services/aiProviders/providerMeta')
const { ALL: ALL_PROVIDERS } = require('../services/aiProviders')
const { AppError } = require('../middleware/errorHandler')

const PROVIDER_MODULE_BY_NAME = Object.fromEntries(ALL_PROVIDERS.map((p) => [p.name, p]))

const router = express.Router()
router.use(requireAuth)

/**
 * GET /api/user/ai-keys
 * Returns the metadata for every provider AND, for each, whether the
 * current user has a key configured (with masked preview / verification
 * status). Frontend uses this single call to render the entire Settings
 * page in one shot.
 */
router.get('/ai-keys', async (req, res, next) => {
  try {
    const userKeys = await userApiKeyService.listForUser(req.user.uid)
    const byProvider = Object.fromEntries(userKeys.map((k) => [k.provider, k]))

    const providers = PROVIDER_META.map((p) => {
      const stored = byProvider[p.name]
      const systemConfigured = !!process.env[p.envVar]
      return {
        name: p.name,
        label: p.label,
        description: p.description,
        signupUrl: p.signupUrl,
        supportsVision: p.supportsVision,
        supportsText: p.supportsText,
        recommended: !!p.recommended,
        keyPrefix: p.keyPrefix || null,
        systemConfigured,
        userKey: stored
          ? {
              preview: stored.key_preview,
              isVerified: stored.is_verified,
              lastVerifiedAt: stored.last_verified_at,
              lastUsedAt: stored.last_used_at,
              updatedAt: stored.updated_at,
            }
          : null,
      }
    })

    res.json({ success: true, providers })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/user/ai-keys/:provider
 * Body: { apiKey: '...' }
 * Stores the encrypted key. Validation (a real test call) is a separate
 * endpoint so users can save a key even if validation is temporarily down.
 */
router.put('/ai-keys/:provider', async (req, res, next) => {
  try {
    const { provider } = req.params
    if (!PROVIDER_BY_NAME[provider]) throw new AppError('Unknown provider', 400)
    const { apiKey } = req.body || {}
    const stored = await userApiKeyService.setKey(req.user.uid, provider, apiKey, {
      isVerified: false,
    })
    res.json({ success: true, key: stored })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/user/ai-keys/:provider
 * Removes the user's key for that provider — falls back to system key.
 */
router.delete('/ai-keys/:provider', async (req, res, next) => {
  try {
    const { provider } = req.params
    if (!PROVIDER_BY_NAME[provider]) throw new AppError('Unknown provider', 400)
    await userApiKeyService.removeKey(req.user.uid, provider)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/user/ai-keys/:provider/test
 * Body: { apiKey?: string }
 *
 * If `apiKey` is in the body, validates THAT (typical: user pasting a new
 * key, hitting "Test" before saving). Otherwise validates the stored key.
 *
 * Calls the provider's real chat() endpoint with a 1-token prompt and
 * reports back whether it succeeded. On success against a stored key,
 * also flips `is_verified` to true.
 */
router.post('/ai-keys/:provider/test', async (req, res, next) => {
  try {
    const { provider } = req.params
    if (!PROVIDER_BY_NAME[provider]) throw new AppError('Unknown provider', 400)

    const providerModule = PROVIDER_MODULE_BY_NAME[provider]
    if (!providerModule) {
      return res.json({ success: true, valid: false, message: 'Provider implementation missing' })
    }

    let keyToTest = req.body?.apiKey
    let isStoredKey = false
    if (!keyToTest) {
      keyToTest = await userApiKeyService.getDecryptedKey(req.user.uid, provider)
      isStoredKey = !!keyToTest
    }
    if (!keyToTest) {
      return res.json({ success: true, valid: false, message: 'কোনো API key পাওয়া যায়নি' })
    }

    // 1-token text completion is the cheapest valid test for every chat
    // provider in our pool. We hard-cap response size at the request level
    // (max_tokens: 4096 in chat()) but the model rarely returns more than
    // a few words for "respond with OK".
    try {
      const result = await Promise.race([
        providerModule.chat({
          apiKey: keyToTest,
          messages: [{ role: 'user', content: 'Reply with the single word: OK' }],
          vision: false,
          jsonMode: false,
          temperature: 0,
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Test timed out (10s)')), 10_000)),
      ])
      const ok = typeof result === 'string' && result.length > 0
      if (ok && isStoredKey) {
        await userApiKeyService.markVerified(req.user.uid, provider, true)
      }
      return res.json({
        success: true,
        valid: ok,
        message: ok ? 'API key কাজ করছে ✓' : 'কোনো response পাইনি',
      })
    } catch (err) {
      const msg = err?.message || String(err)
      if (isStoredKey) {
        await userApiKeyService.markVerified(req.user.uid, provider, false)
      }
      // Common Bengali-friendly translation of common provider errors
      const friendly =
        /401|unauthor/i.test(msg) ? 'Invalid API key (unauthorised)'
        : /403|forbidden/i.test(msg) ? 'Key valid কিন্তু permission নেই'
        : /429|rate.?limit|quota/i.test(msg) ? 'Rate limit / quota শেষ — পরে চেষ্টা করুন'
        : /timed?.?out/i.test(msg) ? 'Provider response slow — পরে চেষ্টা করুন'
        : `Test failed: ${msg.slice(0, 200)}`
      return res.json({ success: true, valid: false, message: friendly })
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
