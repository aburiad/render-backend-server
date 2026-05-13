const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const configService = require('./configService')
const creditService = require('./creditService')

// Allow only raster image types in screenshot uploads. We explicitly
// reject SVG because it can carry script/external-fetch payloads that
// would execute the moment an admin previews it. PNG/JPEG/WebP are
// inert raster formats — safe to render via <img>.
const SCREENSHOT_MAX_BYTES = 3 * 1024 * 1024 // 3MB — matches frontend cap
const SCREENSHOT_DATA_URL_RE =
  /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/

function validateScreenshotDataUrl(dataUrl) {
  if (!dataUrl) return null
  if (typeof dataUrl !== 'string') {
    throw new AppError('Invalid screenshot format', 400)
  }
  const m = SCREENSHOT_DATA_URL_RE.exec(dataUrl)
  if (!m) {
    throw new AppError('Only PNG/JPEG/WebP screenshots are allowed', 400)
  }
  // Rough size cap: base64 inflates ~33%, so 3MB raw ≈ 4MB encoded.
  if (m[2].length > Math.ceil(SCREENSHOT_MAX_BYTES * 1.4)) {
    throw new AppError('Screenshot too large (max 3MB)', 400)
  }
  return dataUrl
}

/**
 * Manual payment service for credit top-ups (bKash/Nagad/Rocket).
 *
 * Flow:
 *   1. User submits POST /api/payment/topup with amount + tranId/screenshot.
 *      → row inserted into `manual_payments` with status='pending'.
 *   2. Admin verifies in /admin/payments/manual → status='verified'.
 *      → credits added to user's pool via creditService.addCredits.
 *
 * Backwards-compat: `submitManualPayment` (old endpoint) is kept as an
 * alias to `submitTopUp` with the legacy proPrice fallback so the old
 * /api/payment/manual endpoint still works while frontend migrates.
 */
const manualPaymentService = {
  /**
   * Submit a top-up payment request.
   *
   * @param {string} userId
   * @param {object} payload
   * @param {number} payload.amount — BDT paid by user (validated against min_topup_bdt)
   * @param {string} payload.method — 'bKash' | 'Nagad' | 'Rocket'
   * @param {string|null} payload.tranId
   * @param {string|null} payload.phone
   * @param {string|null} payload.email
   * @param {string|null} payload.screenshot — data URL
   */
  async submitTopUp(userId, { amount, method, tranId, phone, email, screenshot }) {
    if (!tranId && !screenshot) {
      throw new AppError('Transaction ID অথবা স্ক্রিনশট দিন', 400)
    }

    // Validate amount against admin-configured bounds.
    const config = await configService.getConfig()
    const minBdt = config.creditConfig.min_topup_bdt
    const maxBdt = config.creditConfig.max_topup_bdt
    const amt = Math.floor(Number(amount) || 0)
    if (!Number.isFinite(amt) || amt < minBdt) {
      throw new AppError(`সর্বনিম্ন ${minBdt} ৳ top-up করতে হবে`, 400)
    }
    if (amt > maxBdt) {
      throw new AppError(`সর্বোচ্চ ${maxBdt} ৳ এক বারে top-up করা যাবে`, 400)
    }

    const safeScreenshot = validateScreenshotDataUrl(screenshot)

    const row = {
      user_id: userId,
      email: email || 'No Email',
      amount: String(amt),
      method: method || 'bKash',
      tran_id: tranId ? String(tranId).toUpperCase() : null,
      phone: phone || null,
      screenshot: safeScreenshot,
      status: 'pending',
    }

    const { data, error } = await supabaseAdmin
      .from('manual_payments')
      .insert(row)
      .select()
      .single()
    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      amount: data.amount,
      method: data.method,
      tranId: data.tran_id,
      phone: data.phone,
      screenshot: data.screenshot,
      status: data.status,
      createdAt: data.created_at,
    }
  },

  // Legacy alias — old Pricing.jsx still calls /api/payment/manual.
  // Falls back to proPrice for the amount if the client didn't send one.
  async submitManualPayment(userId, { method, tranId, phone, email, screenshot, amount }) {
    const config = await configService.getConfig()
    const fallback = Number(config.proPrice) || config.creditConfig.min_topup_bdt
    return this.submitTopUp(userId, {
      amount: amount ?? fallback,
      method,
      tranId,
      phone,
      email,
      screenshot,
    })
  },

  async listPendingPayments() {
    const { data, error } = await supabaseAdmin
      .from('manual_payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(formatPayment)
  },

  async listAllPayments() {
    const { data, error } = await supabaseAdmin
      .from('manual_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return (data || []).map(formatPayment)
  },

  /**
   * Verify a pending payment. On 'verified', credits are added to the
   * user's pool atomically.
   *
   * @param {string} paymentId
   * @param {'verified'|'rejected'} status
   * @param {string} adminId — admin uid for audit trail
   */
  async verifyPayment(paymentId, status, adminId) {
    if (!['verified', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', 400)
    }

    // Atomic guard: update ONLY if still pending. If two admins click
    // verify simultaneously, only one UPDATE will return a row; the other
    // gets `null` back and is rejected — preventing double-credit.
    const { data: payment, error: uErr } = await supabaseAdmin
      .from('manual_payments')
      .update({
        status,
        verified_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .eq('status', 'pending')
      .select()
      .maybeSingle()
    if (uErr) throw uErr
    if (!payment) {
      throw new AppError('Payment not found or already processed', 400)
    }

    if (status === 'verified') {
      // Compute ops based on current admin-configured rate.
      // We re-quote at verify-time (not submit-time) so admin price changes
      // don't unfairly penalise the user — they pay what they saw, and we
      // credit them at the rate active when they paid (read amount field).
      const config = await configService.getConfig()
      const { bdt_per_paper: bdtPerPaper, ops_per_paper: opsPerPaper } = config.creditConfig
      const amount = Math.floor(Number(payment.amount) || 0)
      const papers = Math.floor(amount / bdtPerPaper)
      const ops = papers * opsPerPaper

      if (ops > 0) {
        await creditService.addCredits(payment.user_id, {
          amountBdt: amount,
          opsAdded: ops,
          source: 'purchase',
          paymentId: payment.id,
          note: `${papers} paper(s) @ ${bdtPerPaper} BDT`,
        })
      }
    }

    return true
  },
}

function formatPayment(p) {
  return {
    id: p.id,
    userId: p.user_id,
    email: p.email,
    amount: p.amount,
    method: p.method,
    tranId: p.tran_id,
    phone: p.phone,
    screenshot: p.screenshot,
    status: p.status,
    createdAt: p.created_at,
  }
}

module.exports = manualPaymentService
