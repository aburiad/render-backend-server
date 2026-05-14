const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const cryptoService = require('./cryptoService')
const { PROVIDER_BY_NAME } = require('./aiProviders/providerMeta')

const TABLE = 'user_api_keys'

function assertProvider(provider) {
  if (!PROVIDER_BY_NAME[provider]) {
    throw new AppError(`Unknown provider: ${provider}`, 400)
  }
}

/**
 * List all keys for a user — masked. Never returns the decrypted key.
 * Use for rendering the Settings page.
 */
async function listForUser(userId) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('provider, key_preview, is_verified, last_verified_at, last_used_at, updated_at')
    .eq('user_id', userId)
  if (error) throw error
  return data || []
}

/**
 * Get the decrypted plaintext key for a single provider, or null if the
 * user hasn't configured one. Used at AI request time to decide whether
 * to use the user's key or fall back to env.
 */
async function getDecryptedKey(userId, provider) {
  assertProvider(provider)
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('ciphertext, iv, auth_tag')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  try {
    return cryptoService.decrypt({
      ciphertext: data.ciphertext,
      iv: data.iv,
      authTag: data.auth_tag,
    })
  } catch (err) {
    console.error('[userApiKeyService] decrypt failed:', err.message)
    return null
  }
}

/**
 * Encrypt + store (or replace) a user's key for one provider.
 * Caller is responsible for verifying the key works first (test API call).
 */
async function setKey(userId, provider, plaintextKey, { isVerified = false } = {}) {
  assertProvider(provider)
  if (!plaintextKey || typeof plaintextKey !== 'string') {
    throw new AppError('API key দিতে হবে', 400)
  }
  const trimmed = plaintextKey.trim()
  if (trimmed.length < 8) {
    throw new AppError('API key অনেক ছোট — সঠিক key দিন', 400)
  }

  const enc = cryptoService.encrypt(trimmed)
  const row = {
    user_id: userId,
    provider,
    ciphertext: enc.ciphertext,
    iv: enc.iv,
    auth_tag: enc.authTag,
    key_preview: cryptoService.preview(trimmed),
    is_verified: !!isVerified,
    last_verified_at: isVerified ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .upsert(row, { onConflict: 'user_id,provider' })
    .select('provider, key_preview, is_verified, last_verified_at, updated_at')
    .single()
  if (error) throw error
  return data
}

async function removeKey(userId, provider) {
  assertProvider(provider)
  const { error } = await supabaseAdmin
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider)
  if (error) throw error
  return true
}

/**
 * Update last_used_at when a user-supplied key is actually used in a
 * request. Best-effort — never throw, never block the AI request.
 */
async function markUsed(userId, provider) {
  try {
    await supabaseAdmin
      .from(TABLE)
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', provider)
  } catch (err) {
    console.warn('[userApiKeyService.markUsed] non-fatal:', err.message)
  }
}

async function markVerified(userId, provider, isVerified) {
  try {
    await supabaseAdmin
      .from(TABLE)
      .update({
        is_verified: !!isVerified,
        last_verified_at: isVerified ? new Date().toISOString() : null,
      })
      .eq('user_id', userId)
      .eq('provider', provider)
  } catch (err) {
    console.warn('[userApiKeyService.markVerified] non-fatal:', err.message)
  }
}

/**
 * Load every stored key for a user, decrypted. Returns
 *   { groq: 'gsk_...', mistral: 'xyz', ... }
 *
 * One DB round-trip — used at the start of every AI request to decide
 * which providers in the fallback chain should use the user's key vs
 * the system .env fallback. Never throws; on decrypt failure for any row
 * (e.g. someone rotated API_KEY_ENCRYPTION_KEY without migrating) we
 * skip that row silently and log a warning, so the system fallback can
 * still run.
 */
async function loadAllForUser(userId) {
  if (!userId) return {}
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('provider, ciphertext, iv, auth_tag')
      .eq('user_id', userId)
    if (error) throw error
    const out = {}
    for (const row of data || []) {
      try {
        out[row.provider] = cryptoService.decrypt({
          ciphertext: row.ciphertext,
          iv: row.iv,
          authTag: row.auth_tag,
        })
      } catch (err) {
        console.warn(`[userApiKeyService] decrypt failed for ${row.provider}:`, err.message)
      }
    }
    return out
  } catch (err) {
    console.error('[userApiKeyService.loadAllForUser]', err.message)
    return {}
  }
}

/**
 * Fast boolean check: does this user have AT LEAST ONE verified API key?
 * Used by the rate limiter to decide whether to apply BYO-tier limits
 * (or skip entirely) without burning a full key-decrypt round-trip on
 * every AI request.
 *
 * Cached in-memory per Vercel function instance for HAS_KEY_CACHE_MS.
 * Cache is invalidated by setKey/removeKey so admin UI changes propagate.
 */
const HAS_KEY_CACHE_MS = 5 * 60 * 1000
const hasKeyCache = new Map() // userId -> { has: bool, fetchedAt: ms }

function invalidateHasKey(userId) {
  if (userId) hasKeyCache.delete(userId)
}

async function userHasOwnKeys(userId) {
  if (!userId) return false
  const cached = hasKeyCache.get(userId)
  const now = Date.now()
  if (cached && now - cached.fetchedAt < HAS_KEY_CACHE_MS) return cached.has

  try {
    // Only count VERIFIED keys — unverified ones might be broken/typos.
    // Limit 1 → query short-circuits, no full row fetch.
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('provider', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_verified', true)
      .limit(1)
    if (error) throw error
    const has = (data?.length ?? 0) > 0 || false
    // The head:true variant returns count via .count, not data; supabase-js
    // surfaces it differently across versions, so we check both shapes.
    hasKeyCache.set(userId, { has, fetchedAt: now })
    return has
  } catch (err) {
    console.warn('[userApiKeyService.userHasOwnKeys]', err.message)
    return cached?.has ?? false // fail-conservative: serve last-known
  }
}

/**
 * Looser variant: returns true if the user has ANY stored key, verified or
 * not. Used by the credit middleware so that a user who saved a key but
 * whose post-save verification ping failed (transient network blip,
 * provider rate-limit, etc.) still gets the BYO-bypass treatment they
 * expect. The downside — a bad key bypasses credits but the AI call then
 * fails — is acceptable because the failure surfaces immediately and the
 * user knows their key is wrong; the alternative (silent credit charge)
 * is more confusing.
 *
 * Separate from `userHasOwnKeys` (which the rate limiter still uses with
 * `is_verified=true`) so we don't relax abuse-prevention along with the
 * billing fix.
 */
const HAS_ANY_KEY_CACHE_MS = 5 * 60 * 1000
const hasAnyKeyCache = new Map()

function invalidateHasAnyKey(userId) {
  if (userId) hasAnyKeyCache.delete(userId)
}

async function userHasAnyOwnKey(userId) {
  if (!userId) return false
  const cached = hasAnyKeyCache.get(userId)
  const now = Date.now()
  if (cached && now - cached.fetchedAt < HAS_ANY_KEY_CACHE_MS) return cached.has

  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('provider', { count: 'exact', head: true })
      .eq('user_id', userId)
      .limit(1)
    if (error) throw error
    const has = (data?.length ?? 0) > 0 || false
    hasAnyKeyCache.set(userId, { has, fetchedAt: now })
    return has
  } catch (err) {
    console.warn('[userApiKeyService.userHasAnyOwnKey]', err.message)
    return cached?.has ?? false
  }
}

// Replace setKey + removeKey wrappers to also bust both caches.
const _setKey = setKey
async function setKeyAndInvalidate(userId, provider, plaintextKey, opts) {
  const result = await _setKey(userId, provider, plaintextKey, opts)
  invalidateHasKey(userId)
  invalidateHasAnyKey(userId)
  return result
}

const _removeKey = removeKey
async function removeKeyAndInvalidate(userId, provider) {
  const result = await _removeKey(userId, provider)
  invalidateHasKey(userId)
  invalidateHasAnyKey(userId)
  return result
}

const _markVerified = markVerified
async function markVerifiedAndInvalidate(userId, provider, isVerified) {
  const result = await _markVerified(userId, provider, isVerified)
  invalidateHasKey(userId)
  return result
}

module.exports = {
  listForUser,
  getDecryptedKey,
  setKey: setKeyAndInvalidate,
  removeKey: removeKeyAndInvalidate,
  markUsed,
  markVerified: markVerifiedAndInvalidate,
  loadAllForUser,
  userHasOwnKeys,
  userHasAnyOwnKey,
  invalidateHasKey,
  invalidateHasAnyKey,
}
