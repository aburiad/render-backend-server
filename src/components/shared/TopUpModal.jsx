import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'
import toast from 'react-hot-toast'

const MAX_SCREENSHOT_BYTES = 3 * 1024 * 1024

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * TopUpModal — universal credit purchase modal.
 *
 * Reads pricing config from /api/payment/config so that:
 *   - bdt_per_paper, ops_per_paper, min_topup_bdt, suggested_topups_bdt
 *     are all admin-controlled (no hard-coded magic numbers).
 *   - manual payment method numbers (bKash/Nagad/Rocket) come from config too.
 *
 * Flow:
 *   1. User selects suggested amount or types custom.
 *   2. Live quote shown: "100 BDT = 10 papers = 250 AI ops".
 *   3. User pays externally, returns and enters tranId + screenshot.
 *   4. POST /api/payment/topup → "pending verification" state.
 *   5. onSuccess() callback fires (parent typically refetches balance — though
 *      balance only changes after admin verifies, this resets local UI).
 */
export default function TopUpModal({ onClose, onSuccess }) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState(0)
  const [quote, setQuote] = useState(null)
  const [form, setForm] = useState({
    method: 'bKash',
    phone: '',
    tranId: '',
    screenshot: null,
    screenshotName: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/payment/config')
        if (cancelled) return
        setConfig(data.config)
        const suggested = data.config.creditConfig?.suggested_topups_bdt || [10, 50, 200, 500]
        setAmount(suggested[1] || suggested[0] || 10)
      } catch {
        toast.error('সেটিংস লোড করতে সমস্যা হচ্ছে')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Live quote from server — keeps math centralised.
  useEffect(() => {
    let cancelled = false
    if (!amount || amount < 1) {
      setQuote(null)
      return
    }
    ;(async () => {
      try {
        const { data } = await api.get('/payment/quote', { params: { amount } })
        if (!cancelled) setQuote(data)
      } catch {
        if (!cancelled) setQuote(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [amount])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return toast.error('শুধুমাত্র ইমেজ ফাইল আপলোড করুন')
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      return toast.error('ছবি ৩ MB এর কম হতে হবে')
    }
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((p) => ({ ...p, screenshot: dataUrl, screenshotName: file.name }))
    } catch {
      toast.error('ছবি পড়তে ব্যর্থ হয়েছে')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.tranId) {
      return toast.error('Transaction ID দিন')
    }
    if (!quote || quote.ops < 1) {
      return toast.error('সঠিক amount দিন')
    }
    setSubmitting(true)
    try {
      await api.post('/payment/topup', {
        amount: quote.effectiveAmount,
        method: form.method,
        phone: form.phone,
        tranId: form.tranId,
        screenshot: form.screenshot,
      })
      toast.success(
        `টপ-আপ সাবমিট হয়েছে! ভেরিফাই হলে ${quote.ops} AI ক্রেডিট যোগ হবে।`,
      )
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'সাবমিট করতে ব্যর্থ হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white rounded-2xl px-8 py-6 text-sm text-gray-500">
          লোড হচ্ছে…
        </div>
      </div>
    )
  }

  const suggested = config?.creditConfig?.suggested_topups_bdt || []
  const methods = config?.manualPaymentMethods || []
  const opsPerPaper = config?.creditConfig?.ops_per_paper || 25
  const bdtPerPaper = config?.creditConfig?.bdt_per_paper || 10
  const minBdt = config?.creditConfig?.min_topup_bdt || 10

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900">ক্রেডিট কিনুন</h3>
              <p className="text-gray-500 text-sm mt-1">
                ১ পেপার = {bdtPerPaper} ৳ = {opsPerPaper}টি AI prompt
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
            কত টাকা টপ-আপ করবেন?
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {suggested.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAmount(s)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  amount === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s} ৳
              </button>
            ))}
          </div>
          <input
            type="number"
            min={minBdt}
            step={bdtPerPaper}
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            placeholder={`কাস্টম amount (min ${minBdt} ৳)`}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          />

          {quote && quote.ops > 0 ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm">
              <p className="font-bold text-blue-900">
                {quote.effectiveAmount} ৳ = {quote.papersEquivalent} পেপার = {quote.ops} AI prompt
              </p>
              {quote.effectiveAmount !== amount && (
                <p className="text-[11px] text-blue-700 mt-1">
                  ⚠️ {amount - quote.effectiveAmount} ৳ rounding — শুধু {quote.effectiveAmount} ৳ ক্রেডিট হবে
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-amber-50 rounded-xl text-xs text-amber-800">
              সর্বনিম্ন {minBdt} ৳ লাগবে
            </div>
          )}
        </div>

        <div className="p-6 pt-0 space-y-3">
          {methods.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900">
              পেমেন্ট নম্বর এখনো configure করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।
            </div>
          )}
          {methods.map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">
                  {m.name}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{m.number}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest">{m.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(m.number)
                  toast.success('নম্বর কপি হয়েছে')
                }}
                className="text-blue-600 font-bold text-xs"
              >
                Copy
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                মেথড
              </label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg font-bold text-sm"
              >
                {(methods.length ? methods : [{ name: 'bKash' }, { name: 'Nagad' }, { name: 'Rocket' }])
                  .map((m) => (
                    <option key={m.name}>{m.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                আপনার নম্বর
              </label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              placeholder="TRX12345"
              value={form.tranId}
              onChange={(e) => setForm({ ...form, tranId: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg font-bold text-sm uppercase"
            />
          </div>

          {/*
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
            <div className="flex-1 h-px bg-gray-200" />
            অথবা স্ক্রিনশট
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <label className="block cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div className="w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-center hover:border-blue-600 transition-colors">
              {form.screenshot ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={form.screenshot} alt="" className="max-h-32 rounded-lg" />
                  <p className="text-xs font-bold text-gray-600 truncate max-w-full">
                    {form.screenshotName}
                  </p>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.preventDefault()
                      setForm((p) => ({ ...p, screenshot: null, screenshotName: '' }))
                    }}
                    className="text-xs font-bold text-red-600"
                  >
                    সরিয়ে ফেলুন
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  ছবি আপলোড — ৩MB এর কম
                </p>
              )}
            </div>
          </label>
          */}

          <button
            type="submit"
            disabled={submitting || !quote || quote.ops < 1}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            {submitting ? 'পাঠানো হচ্ছে…' : 'টপ-আপ সাবমিট করুন'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
