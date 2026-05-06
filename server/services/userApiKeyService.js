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

module.exports = {
  listForUser,
  getDecryptedKey,
  setKey,
  removeKey,
  markUsed,
  markVerified,
  loadAllForUser,
}
