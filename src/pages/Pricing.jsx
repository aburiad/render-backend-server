import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import api from '@/services/api'
import toast from 'react-hot-toast'
import Loader from '@/components/shared/Loader.jsx'

const MAX_SCREENSHOT_BYTES = 3 * 1024 * 1024 // 3MB

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function Pricing() {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const [config, setConfig] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    method: 'bKash',
    phone: '',
    tranId: '',
    screenshot: null,
    screenshotName: '',
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/payment/config')
      setConfig(data.config)
    } catch (err) {
      toast.error('সেটিংস লোড করতে সমস্যা হচ্ছে')
    } finally {
      setLoading(false)
    }
  }

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
      setForm((prev) => ({ ...prev, screenshot: dataUrl, screenshotName: file.name }))
    } catch {
      toast.error('ছবি পড়তে ব্যর্থ হয়েছে')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.tranId && !form.screenshot) {
      return toast.error('Transaction ID অথবা স্ক্রিনশট দিন')
    }
    setBtnLoading(true)
    try {
      await api.post('/payment/manual', {
        method: form.method,
        phone: form.phone,
        tranId: form.tranId,
        screenshot: form.screenshot,
        amount: config?.proPrice,
      })
      toast.success('রিকোয়েস্ট পাঠানো হয়েছে! অ্যাডমিন ভেরিফাই করার পর প্রো হবে।')
      setShowModal(false)
      setForm({ method: 'bKash', phone: '', tranId: '', screenshot: null, screenshotName: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'সাবমিট করতে ব্যর্থ হয়েছে')
    } finally {
      setBtnLoading(false)
    }
  }

  if (loading) return <Loader />

  const tier = user?.tier || 'free'
  const trialDays = config?.trialDays || 0
  const trialEndAt = user?.trialEndAt ? new Date(user.trialEndAt) : null
  const trialDaysLeft =
    trialEndAt && tier === 'trial'
      ? Math.max(0, Math.ceil((trialEndAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '০',
      features: [
        `প্রথম ${trialDays} দিন: সব Pro features unlocked`,
        'এরপর সর্বোচ্চ ১০টি প্রশ্নপত্র',
        'সর্বোচ্চ ৩০টি Question Bank',
        '৩০টি AI স্ক্যান (প্রতি মাস)',
        'OMR Generator বন্ধ',
        'ওয়াটারমার্ক সহ প্রিন্ট',
      ],
      current: tier !== 'pro',
    },
    {
      id: 'pro_monthly',
      name: 'Pro',
      price: config?.proPrice || '২৯৯',
      popular: true,
      features: config?.features || [
        'আনলিমিটেড প্রশ্নপত্র',
        'আনলিমিটেড প্রশ্ন ব্যাংক',
        'আনলিমিটেড AI স্ক্যান',
        'নিজের লোগো ব্যবহার',
        'ওয়াটারমার্ক ছাড়া প্রিন্ট',
        'OMR জেনারেটর',
      ],
      current: tier === 'pro',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center relative">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          আপনার টিচিং ক্যারিয়ারকে <br />
          <span className="text-blue-600">Smart</span> করুন
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          AI Question Hub ব্যবহার করে কয়েক সেকেন্ডে প্রশ্ন তৈরি করুন।
        </p>
      </div>

      {tier === 'trial' && (
        <div className="mb-10 max-w-2xl mx-auto bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-center gap-3">
          <span className="text-2xl">🎁</span>
          <p className="text-sm font-bold text-blue-900">
            আপনি এখন <span className="text-blue-600">FREE TRIAL</span>-এ আছেন। সব Pro features unlocked।
            আর <span className="text-blue-600 font-black">{trialDaysLeft}</span> দিন বাকি।
          </p>
        </div>
      )}

      {tier === 'free' && (
        <div className="mb-10 max-w-2xl mx-auto bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center justify-center gap-3">
          <span className="text-2xl">⏰</span>
          <p className="text-sm font-bold text-amber-900">
            আপনার Free Trial শেষ হয়েছে। সম্পূর্ণ AI access ফিরে পেতে Pro-তে আপগ্রেড করুন।
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-white p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${
              plan.popular ? 'border-blue-600 shadow-2xl shadow-blue-600/10 scale-105 z-10' : 'border-gray-50 shadow-sm'
            }`}
          >
            <div className="text-left mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">৳{plan.price}</span>
                <span className="text-gray-400 font-medium text-sm">/মাস</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 text-left">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.popular ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            {!plan.current && plan.popular && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all btn-press"
              >
                এখনই কিনুন (Buy Now)
              </button>
            )}

            {plan.current && (
              <div className="py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl italic">
                আপনার বর্তমান প্ল্যান
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-gray-50">
                <h3 className="text-2xl font-black text-gray-900 mb-2">পেমেন্ট সাবমিট করুন</h3>
                <p className="text-gray-500 text-sm">
                  নিচের যেকোনো নাম্বারে <span className="font-bold text-gray-900">৳{config.proPrice}</span> টাকা "Send Money" করুন,
                  তারপর Transaction ID অথবা স্ক্রিনশট দিন।
                </p>
              </div>

              <div className="p-8 space-y-3 bg-gray-50/50">
                {config.manualPaymentMethods.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xs font-black text-blue-600 uppercase">
                        {m.name}
                      </div>
                      <div className="text-left">
                        <p className="font-black text-gray-900">{m.number}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{m.type}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(m.number)
                        toast.success('নাম্বার কপি হয়েছে')
                      }}
                      className="text-blue-600 font-bold text-xs"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">পেমেন্ট মেথড</label>
                    <select
                      value={form.method}
                      onChange={(e) => setForm({ ...form, method: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold"
                    >
                      <option>bKash</option>
                      <option>Nagad</option>
                      <option>Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">আপনার মোবাইল নম্বর (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    placeholder="TRX123456789"
                    value={form.tranId}
                    onChange={(e) => setForm({ ...form, tranId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold uppercase"
                  />
                </div>

                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex-1 h-px bg-gray-200" />
                  অথবা
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">পেমেন্ট স্ক্রিনশট</label>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="w-full px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-blue-600 hover:bg-blue-50/50 transition-colors">
                      {form.screenshot ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={form.screenshot}
                            alt="screenshot preview"
                            className="max-h-40 rounded-lg shadow"
                          />
                          <p className="text-xs font-bold text-gray-600 truncate max-w-full">{form.screenshotName}</p>
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
                        <div className="text-gray-500">
                          <p className="font-bold text-sm">ছবি আপলোড করুন</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">৩MB এর কম, JPG/PNG</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={btnLoading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all btn-press disabled:opacity-50"
                >
                  {btnLoading ? 'প্রসেসিং...' : 'সাবমিট করুন'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
