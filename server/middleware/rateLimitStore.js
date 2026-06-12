const { supabaseAdmin } = require('../config/supabase')

/**
 * Supabase-backed Store for express-rate-limit. Replaces the default
 * MemoryStore so counters survive Vercel cold starts and are consistent
 * across function instances.
 *
 * Uses the rate_limit_increment(scope, key, window_seconds) Postgres
 * function (defined in the SQL migration) to atomically increment OR
 * reset-and-set in a single round-trip.
 *
 * Failure mode: fail-OPEN. If Supabase is unreachable we return a
 * permissive value so a transient DB hiccup doesn't 500 the entire app.
 * Rate limiting is defense-in-depth, not the only security layer.
 *
 * Implements the full Store interface:
 *   - init(options)     ← receives windowMs from limiter
 *   - increment(key)    ← called on each rate-limited request
 *   - decrement(key)    ← required by express-rate-limit v8 type check
 *   - resetKey(key)     ← required by express-rate-limit v8 type check
 *   - get(key)          ← called by /api/limits/status to peek
 *
 * decrement is a true decrement (used by skipFailedRequests if enabled);
 * resetKey deletes the row.
 */
class SupabaseStore {
  constructor(scope) {
    this.scope = scope
    this.windowMs = 60_000 // overridden in init()
  }

  init(options) {
    if (options?.windowMs) this.windowMs = options.windowMs
  }

  async increment(key) {
    const windowSeconds = Math.max(1, Math.ceil(this.windowMs / 1000))
    try {
      const { data, error } = await supabaseAdmin.rpc('rate_limit_increment', {
        p_scope: this.scope,
        p_key: String(key),
        p_window_seconds: windowSeconds,
      })
      if (error) throw error
      const row = Array.isArray(data) ? data[0] : data
      if (!row) throw new Error('empty rpc response')
      return {
        totalHits: Number(row.count) || 1,
        resetTime: new Date(row.reset_at),
      }
    } catch (err) {
      // Fail-open: permit the request, log warning. Better to over-allow
      // than to block legitimate traffic during a Supabase outage.
      console.warn(`[rateLimit:${this.scope}] increment failed (fail-open):`, err.message)
      return {
        totalHits: 1,
        resetTime: new Date(Date.now() + this.windowMs),
      }
    }
  }

  async decrement(key) {
    // Used when skipFailedRequests / skipSuccessfulRequests is enabled.
    // We don't enable those, but v8 type-check requires this method.
    try {
      await supabaseAdmin.rpc('rate_limit_decrement', {
        p_scope: this.scope,
        p_key: String(key),
      })
    } catch (err) {
      // If the RPC isn't defined yet (older migration), fall back to no-op.
      // Since we don't use skip* options, decrement never actually fires
      // on the hot path — this branch is only hit if the limiter manually
      // decrements (which it doesn't in our config).
      if (!/rate_limit_decrement/i.test(err.message || '')) {
        console.warn(`[rateLimit:${this.scope}] decrement failed:`, err.message)
      }
    }
  }

  async resetKey(key) {
    try {
      await supabaseAdmin
        .from('rate_limit_counters')
        .delete()
        .eq('scope', this.scope)
        .eq('key', String(key))
    } catch (err) {
      console.warn(`[rateLimit:${this.scope}] resetKey failed:`, err.message)
    }
  }

  async get(key) {
    try {
      const { data, error } = await supabaseAdmin
        .from('rate_limit_counters')
        .select('count, reset_at')
        .eq('scope', this.scope)
        .eq('key', String(key))
        .maybeSingle()
      if (error) throw error
      if (!data) return undefined
      // Window expired — caller should see 0 used.
      if (new Date(data.reset_at) <= new Date()) return undefined
      return {
        totalHits: Number(data.count) || 0,
        resetTime: new Date(data.reset_at),
      }
    } catch (err) {
      console.warn(`[rateLimit:${this.scope}] get failed:`, err.message)
      return undefined
    }
  }
}

module.exports = SupabaseStore
