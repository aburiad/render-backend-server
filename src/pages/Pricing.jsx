import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import api from '@/services/api'
import toast from 'react-hot-toast'
import Loader from '@/components/shared/Loader.jsx'

export default function Pricing() {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const [config, setConfig] = useState(null)
  const [showManualModal, setShowManualModal] = useState(false)
  
  // Manual Payment Form
  const [manualForm, setManualForm] = useState({
    method: 'bKash',
    phone: '',
    tranId: '',
    amount: ''
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/payment/config')
      setConfig(data.config)
      setManualForm(prev => ({ ...prev, amount: data.config.proPrice }))
    } catch (err) {
      toast.error('সেটিংস লোড করতে সমস্যা হচ্ছে')
    } finally {
      setLoading(false)
    }
  }

  const handleOnlinePayment = async () => {
    setBtnLoading(true)
    try {
      const { data } = await api.post('/payment/init', { planId: 'pro_monthly' })
      if (data.success && data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'পেমেন্ট গেটওয়ে কানেক্ট করতে সমস্যা হচ্ছে')
    } finally {
      setBtnLoading(false)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualForm.phone || !manualForm.tranId) return toast.error('সব তথ্য দিন')
    
    setBtnLoading(true)
    try {
      await api.post('/payment/manual', manualForm)
      toast.success('রিকোয়েস্ট পাঠানো হয়েছে! ভেরিফিকেশনের জন্য অপেক্ষা করুন।')
      setShowManualModal(false)
    } catch (err) {
      toast.error('সাবমিট করতে ব্যর্থ হয়েছে')
    } finally {
      setBtnLoading(false)
    }
  }

  if (loading) return <Loader />

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '০',
      features: [
        'সর্বোচ্চ ৫টি প্রশ্নপত্র',
        'সর্বোচ্চ ৫০টি প্রশ্ন ব্যাংক',
        '১০টি AI স্ক্যান (প্রতি মাস)',
        'স্ট্যান্ডার্ড পিডিএফ ডিজাইন',
        'ওয়াটারমার্ক সহ প্রিন্ট',
      ],
      buttonText: 'বর্তমান প্ল্যান',
      current: user?.subscription !== 'pro',
      disabled: true,
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
        'ওয়াটারমার্ক ছাড়া প্রিন্ট',
        'OMR জেনারেটর'
      ],
      buttonText: user?.subscription === 'pro' ? 'বর্তমান প্ল্যান' : 'এখনই আপগ্রেড করুন',
      current: user?.subscription === 'pro',
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center relative">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">আপনার টিচিং ক্যারিয়ারকে <br/><span className="text-blue-600">Smart</span> করুন</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">AI Question Hub ব্যবহার করে কয়েক সেকেন্ডে প্রশ্ন তৈরি করুন।</p>
      </div>

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
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            {!plan.current && plan.popular && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleOnlinePayment}
                  disabled={btnLoading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all btn-press disabled:opacity-50"
                >
                  {btnLoading ? 'অপেক্ষা করুন...' : 'কার্ড বা মোবাইল ব্যাংকিং (Online)'}
                </button>
                <button
                  onClick={() => setShowManualModal(true)}
                  disabled={btnLoading}
                  className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all"
                >
                  বিকাশ/নগদ (Manual)
                </button>
              </div>
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
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowManualModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50">
                <h3 className="text-2xl font-black text-gray-900 mb-2">ম্যানুয়াল পেমেন্ট</h3>
                <p className="text-gray-500 text-sm">নিচের যেকোনো নাম্বারে <span className="font-bold text-gray-900">৳{config.proPrice}</span> টাকা "Send Money" করুন।</p>
              </div>

              <div className="p-8 space-y-4 bg-gray-50/50">
                {config.manualPaymentMethods.map(m => (
                  <div key={m.name} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xs font-black text-blue-600 uppercase">
                        {m.name}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{m.number}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{m.type}</p>
                      </div>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(m.number); toast.success('নাম্বার কপি হয়েছে') }} className="text-blue-600 font-bold text-xs">Copy</button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleManualSubmit} className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">পেমেন্ট মেথড</label>
                    <select 
                      value={manualForm.method}
                      onChange={(e) => setManualForm({ ...manualForm, method: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold"
                    >
                      <option>bKash</option>
                      <option>Nagad</option>
                      <option>Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">আপনার মোবাইল নম্বর</label>
                    <input 
                      type="text" 
                      placeholder="01XXXXXXXXX"
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Transaction ID</label>
                  <input 
                    type="text" 
                    placeholder="TRX123456789"
                    value={manualForm.tranId}
                    onChange={(e) => setManualForm({ ...manualForm, tranId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl font-bold uppercase"
                  />
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
