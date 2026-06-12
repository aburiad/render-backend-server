import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'
import toast from 'react-hot-toast'
import Loader from '@/components/shared/Loader.jsx'
import TopUpModal from '@/components/shared/TopUpModal.jsx'
import CreditBalance from '@/components/shared/CreditBalance.jsx'

/**
 * Pricing page — pure credit / pay-as-you-go model.
 *
 * Every visible price, feature list, and suggested top-up amount comes from
 * `subscription_config` (admin-editable). The only hard-coded fallbacks are
 * for the brief moment before /payment/config returns.
 */
export default function Pricing() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/payment/config')
        if (!cancelled) setConfig(data.config)
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

  if (loading) return <Loader />

  const credit = config?.creditConfig || {}
  const bdtPerPaper = credit.bdt_per_paper || 10
  const opsPerPaper = credit.ops_per_paper || 25
  const minBdt = credit.min_topup_bdt || 10
  const suggested = credit.suggested_topups_bdt || [10, 50, 200, 500, 1000, 5000]
  const features = config?.features || []
  const byoEnabled = !!credit.enable_byo_subscription
  const byoPrice = credit.byo_unlimited_price_bdt || 999

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">
          মাত্র <span className="text-blue-600">{bdtPerPaper} ৳</span> প্রতি পেপার
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
          কোনো সাবস্ক্রিপশন নেই। যা ব্যবহার করবেন, ততটুকুই পেমেন্ট। ক্রেডিট কখনো expire হবে না।
        </p>
      </div>

      {/* Current balance card */}
      <div className="max-w-md mx-auto mb-10">
        <CreditBalance compact={false} showTopUp />
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
        <div className="p-5 bg-blue-50 rounded-2xl">
          <div className="text-2xl mb-2">💰</div>
          <h3 className="font-black text-blue-900 mb-1">টপ-আপ করুন</h3>
          <p className="text-xs text-blue-800">
            {minBdt} ৳ থেকে শুরু — যত খুশি ক্রেডিট কিনুন।
          </p>
        </div>
        <div className="p-5 bg-green-50 rounded-2xl">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-black text-green-900 mb-1">AI ব্যবহার করুন</h3>
          <p className="text-xs text-green-800">
            ১ পেপার = {opsPerPaper}টি AI prompt (scan / generate / book-extract)।
          </p>
        </div>
        <div className="p-5 bg-purple-50 rounded-2xl">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-black text-purple-900 mb-1">প্রিন্ট / ম্যানুয়াল ফ্রি</h3>
          <p className="text-xs text-purple-800">
            যত খুশি Edit, Reprint, PDF download — কোনো credit লাগবে না।
          </p>
        </div>
      </div>

      {/* Top-up grid */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 max-w-4xl mx-auto mb-10">
        <h2 className="text-xl font-black text-gray-900 mb-2">টপ-আপ অপশন</h2>
        <p className="text-sm text-gray-500 mb-6">
          যেকোনো amount নির্বাচন করুন। সব amount-এ একই rate ({bdtPerPaper} ৳ = ১ পেপার = {opsPerPaper} AI prompt)।
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {suggested.map((amount) => {
            const papers = Math.floor(amount / bdtPerPaper)
            const ops = papers * opsPerPaper
            const isPopular = amount === 500 // soft-highlight one tier
            return (
              <motion.button
                key={amount}
                whileHover={{ y: -2 }}
                onClick={() => setShowModal(true)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                  isPopular
                    ? 'border-blue-600 bg-blue-50/40 shadow-lg shadow-blue-600/10'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full">
                    জনপ্রিয়
                  </span>
                )}
                <div className="text-2xl font-black text-gray-900 mb-1">{amount} ৳</div>
                <div className="text-sm text-gray-600 font-bold">{papers} পেপার</div>
                <div className="text-xs text-gray-400">{ops} AI prompt</div>
              </motion.button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
        >
          ক্রেডিট কিনুন
        </button>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="max-w-4xl mx-auto mb-10">
          <h2 className="text-lg font-black text-gray-900 mb-4 text-center">
            কী কী পাবেন
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
              >
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                  ✓
                </div>
                <span className="text-sm text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BYO subscription side offer — admin-toggleable */}
      {byoEnabled && (
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-3xl border-2 border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔑</div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-amber-900 mb-1">
                BYO Unlimited — {byoPrice} ৳/মাস
              </h3>
              <p className="text-sm text-amber-800 mb-2">
                আপনার নিজের Gemini/OpenAI key দিন, unlimited পেপার বানান। আমরা শুধু platform fee নিই।
              </p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>✓ Unlimited AI prompt (আপনার key, আপনার খরচ)</li>
                <li>✓ Priority support (WhatsApp)</li>
                <li>✓ কোনো top-up ঝামেলা নেই</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="text-lg font-black text-gray-900 mb-4 text-center">প্রশ্ন</h2>
        <div className="space-y-3">
          {[
            {
              q: 'ক্রেডিট কতদিন valid থাকবে?',
              a: 'ক্রেডিট কখনো expire হবে না। যখন খুশি ব্যবহার করুন।',
            },
            {
              q: 'কতগুলো AI prompt মানে ১ পেপার?',
              a: `${opsPerPaper}টি AI prompt = ১ পেপার (recommendation)। বড় পেপারে বেশি ব্যবহার হবে, ছোট পেপারে কম।`,
            },
            {
              q: 'কোনো monthly fee আছে?',
              a: 'না। যত ব্যবহার, তত খরচ। কোনো subscription নেই।',
            },
            {
              q: 'AI fail হলে কি ক্রেডিট কাটা হবে?',
              a: 'না। AI provider success দিলেই শুধু ক্রেডিট কাটা হয়।',
            },
            {
              q: 'Manual টাইপ করলে ক্রেডিট কাটবে?',
              a: 'না। ম্যানুয়াল টাইপ, edit, print, PDF — সব ফ্রি।',
            },
          ].map((item, i) => (
            <details
              key={i}
              className="group p-4 bg-white rounded-2xl border border-gray-100"
            >
              <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                {item.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="text-sm text-gray-600 mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {showModal && <TopUpModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
