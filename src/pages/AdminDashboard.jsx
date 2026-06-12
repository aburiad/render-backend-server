import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import toast from 'react-hot-toast'
import Loader from '@/components/shared/Loader.jsx'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('settings')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  // Legacy fields (proPrice / trialDays / isTrialActive) are kept in the
  // server payload for backwards-compat but the admin UI no longer surfaces
  // them. Local state only carries what the credit-system UI needs.
  const [config, setConfig] = useState({
    features: [],
    manualPaymentMethods: [],
    rateLimits: {
      ai: { max: 30, windowMinutes: 60, byoMax: 0, byoWindowMinutes: 60 },
      payment: { max: 5, windowMinutes: 60 },
      userKey: { max: 20, windowMinutes: 60 },
      auth: { max: 10, windowMinutes: 15 },
      global: { max: 200, windowMinutes: 15 },
    },
    creditConfig: {
      bdt_per_paper: 10,
      ops_per_paper: 25,
      signup_bonus_ops: 25,
      referral_bonus_ops: 25,
      min_topup_bdt: 10,
      max_topup_bdt: 100000,
      suggested_topups_bdt: [10, 50, 200, 500, 1000, 5000],
      byo_unlimited_price_bdt: 999,
      enable_byo_subscription: false,
    },
    aiProviderConfig: {
      vision_chain: ['gemini', 'groq', 'openrouter', 'mistral', 'sambanova', 'cohere', 'novita', 'huggingface', 'zai'],
      text_chain: ['gemini', 'groq', 'sambanova', 'mistral', 'openrouter', 'cohere', 'novita', 'huggingface', 'zai']
    },
    backendConfig: {
      active: 'vercel',
      vercel_url: '',
      render_url: '',
    },
    pdfServerConfig: {
      active: 'auto',
      render_url: 'https://proshno-shala-pdf.onrender.com',
      hfspace_url: 'https://riadahsan-proshno-shala-pdf.hf.space',
    },
  })
  const [pendingPayments, setPendingPayments] = useState([])
  const [users, setUsers] = useState([])
  const [allPayments, setAllPayments] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, configRes, paymentsRes, usersRes, allPaymentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/subscription/config'),
        api.get('/admin/payments/manual'),
        api.get('/admin/users'),
        api.get('/admin/payments/all')
      ])
      setStats(statsRes.data)
      // Merge server config over our local defaults so creditConfig is always
      // a complete object — protects the form from server returning a partial
      // shape and the spread-update pattern losing fields.
      setConfig((prev) => ({
        ...prev,
        ...configRes.data.config,
        creditConfig: {
          ...prev.creditConfig,
          ...(configRes.data.config?.creditConfig || {}),
        },
        backendConfig: {
          active: 'vercel',
          vercel_url: '',
          render_url: '',
          ...(configRes.data.config?.backendConfig || {}),
        },
        pdfServerConfig: {
          active: 'auto',
          render_url: 'https://proshno-shala-pdf.onrender.com',
          hfspace_url: 'https://riadahsan-proshno-shala-pdf.hf.space',
          ...(configRes.data.config?.pdfServerConfig || {}),
        },
        aiProviderConfig: (() => {
          const dbChain = configRes.data.config?.aiProviderConfig || {}
          const mergeChain = (dbArr, prevArr) => {
            const base = dbArr?.length ? dbArr : prevArr
            // Ensure gemini is always first if not already in the chain
            return base.includes('gemini') ? base : ['gemini', ...base]
          }
          return {
            vision_chain: mergeChain(dbChain.vision_chain, prev.aiProviderConfig?.vision_chain),
            text_chain: mergeChain(dbChain.text_chain, prev.aiProviderConfig?.text_chain),
          }
        })()
      }))
      setPendingPayments(paymentsRes.data.payments)
      if (usersRes.data.users) setUsers(usersRes.data.users)
      if (allPaymentsRes.data.payments) setAllPayments(allPaymentsRes.data.payments)
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হচ্ছে')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConfig = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Sync local state with the server-normalised response so admin sees
      // EXACTLY what was persisted (in case backend defaults rewrote anything).
      const { data } = await api.put('/admin/subscription/config', config)
      if (data?.config) {
        // Merge to preserve pdfServerConfig in case server doesn't echo it back
        setConfig((prev) => ({
          ...data.config,
          pdfServerConfig: {
            ...(prev.pdfServerConfig || {}),
            ...(data.config.pdfServerConfig || {}),
          },
        }))
      }
      toast.success('কনফিগারেশন সেভ হয়েছে — পরিবর্তন এখন live')
    } catch (err) {
      toast.error(err.response?.data?.message || 'সেভ করতে ব্যর্থ হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  const handleApplySignupBonus = async () => {
    if (!window.confirm('সব existing user-কে current signup bonus retroactively দেওয়া হবে (যাদের credit history নেই)। চালিয়ে যাবেন?')) return
    try {
      const { data } = await api.post('/admin/credits/apply-signup-bonus')
      toast.success(data.message || 'বোনাস apply হয়েছে')
    } catch (err) {
      toast.error(err.response?.data?.message || 'ব্যর্থ')
    }
  }

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      await api.post('/admin/payments/verify', { paymentId, status })
      toast.success(status === 'verified' ? 'পেমেন্ট ভেরিফাই হয়েছে' : 'পেমেন্ট রিজেক্ট হয়েছে')
      setPendingPayments(prev => prev.filter(p => p.id !== paymentId))
    } catch (err) {
      toast.error('অ্যাকশনটি সফল হয়নি')
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-gray-500">ক্রেডিট সিস্টেম ও পেমেন্ট ম্যানেজমেন্ট</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {['overview', 'users', 'transactions', 'settings', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' ? 'একনজরে' : 
               tab === 'users' ? 'ইউজার' : 
               tab === 'transactions' ? 'সকল লেনদেন' : 
               tab === 'settings' ? 'সেটিংস' : 'ম্যানুয়াল পেমেন্ট'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="মোট ইউজার" value={stats?.totalUsers} icon="users" color="bg-blue-50 text-blue-600" />
              <StatCard title="মোট প্রশ্নপত্র" value={stats?.totalPapers} icon="file-text" color="bg-purple-50 text-purple-600" />
              <StatCard title="মোট আয় (৳)" value={stats?.totalRevenue || 0} icon="credit-card" color="bg-emerald-50 text-emerald-600" />
            </div>

            {/* AI Usage Stats Graph */}
            {stats?.aiStats && stats.aiStats.length > 0 && (
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">AI API ব্যবহার (Usage Stats)</h3>
                <div className="space-y-4">
                  {stats.aiStats.map(stat => {
                    const total = stat.success_count + stat.fail_count
                    const successPct = total > 0 ? Math.round((stat.success_count / total) * 100) : 0
                    const failPct = total > 0 ? Math.round((stat.fail_count / total) * 100) : 0
                    
                    return (
                      <div key={stat.provider} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="capitalize text-gray-700">{stat.provider}</span>
                          <span className="text-gray-500">{total} calls ({successPct}% success)</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-green-500 transition-all duration-1000" 
                            style={{ width: `${successPct}%` }}
                            title={`${stat.success_count} Success`}
                          ></div>
                          <div 
                            className="h-full bg-red-500 transition-all duration-1000" 
                            style={{ width: `${failPct}%` }}
                            title={`${stat.fail_count} Failed`}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    <th className="p-6 whitespace-nowrap">নাম ও ইমেইল</th>
                    <th className="p-6 whitespace-nowrap">ভূমিকা</th>
                    <th className="p-6 whitespace-nowrap">ক্রেডিট</th>
                    <th className="p-6 text-right whitespace-nowrap">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.uid} className={`hover:bg-gray-50/50 ${user.isBanned ? 'opacity-50 grayscale' : ''}`}>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          {user.isBanned && (
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 truncate max-w-[200px]">{user.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-sm font-bold text-gray-600 uppercase">{user.role || 'user'}</td>
                      <td className="p-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50">
                          <span className="text-xs font-black text-blue-700">⚡ {user.aiOpCredits ?? 0}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              const raw = window.prompt(
                                `${user.name || user.email}-এর ক্রেডিট adjust:\n+10 = যোগ, -5 = বাদ`,
                              )
                              const delta = parseInt(raw, 10)
                              if (!Number.isFinite(delta) || !delta) return
                              try {
                                const { data } = await api.post(
                                  `/admin/users/${user.uid}/credits/adjust`,
                                  { delta, note: 'Manual admin adjust' },
                                )
                                toast.success(data.message)
                                setUsers((prev) =>
                                  prev.map((u) =>
                                    u.uid === user.uid ? { ...u, aiOpCredits: data.balance } : u,
                                  ),
                                )
                              } catch (e) {
                                toast.error(e.response?.data?.message || 'ব্যর্থ')
                              }
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                            title="ক্রেডিট adjust"
                          >
                            ±
                          </button>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors btn-press"
                        >
                          এডিট
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                     <tr>
                       <td colSpan="4" className="p-12 text-center text-gray-400 font-medium">কোন ইউজার পাওয়া যায়নি</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    <th className="p-6 whitespace-nowrap">তারিখ</th>
                    <th className="p-6 whitespace-nowrap">ইমেইল</th>
                    <th className="p-6 whitespace-nowrap">মেথড / Tran ID</th>
                    <th className="p-6 whitespace-nowrap">অ্যামাউন্ট</th>
                    <th className="p-6 whitespace-nowrap">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50">
                      <td className="p-6 text-sm text-gray-600 whitespace-nowrap">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-GB') : 
                         payment.timestamp ? new Date(payment.timestamp).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="p-6">
                        <p className="font-medium text-gray-900 truncate max-w-[150px]">{payment.email || '-'}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-bold text-sm text-gray-900 uppercase">
                           {payment.method || '-'}
                        </p>
                        <p className="text-[10px] text-gray-400 tracking-wider mt-0.5">{payment.tranId || '—'}</p>
                      </td>
                      <td className="p-6 font-black text-gray-900">৳{payment.amount || '-'}</td>
                      <td className="p-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center ${
                          payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {allPayments.length === 0 && (
                     <tr>
                       <td colSpan="5" className="p-12 text-center text-gray-400 font-medium">কোন লেনদেন পাওয়া যায়নি</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm max-w-2xl"
          >
            <h2 className="text-xl font-bold mb-2">ক্রেডিট সিস্টেম কনফিগারেশন</h2>
            <p className="text-sm text-gray-500 mb-6">
              পেপার দাম, AI ops, top-up amount — সব এখান থেকে নিয়ন্ত্রিত। কোনো hard-coded value নেই।
            </p>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Pricing Page Features
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  এই list-টি public pricing page-এ "কী কী পাবেন" সেকশনে দেখাবে। কমা দিয়ে আলাদা করুন।
                </p>
                <textarea
                  value={(config.features || []).join(', ')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      features: e.target.value.split(',').map((f) => f.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm h-28 leading-relaxed"
                  placeholder="প্রতি পেপার মাত্র ১০ ৳, ১ পেপার = ২৫টি AI prompt"
                />
              </div>

              {/* Manual Payment Numbers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">ম্যানুয়াল পেমেন্ট নম্বর</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(config.manualPaymentMethods || []), { name: 'bKash', number: '', type: 'Personal' }]
                      setConfig({ ...config, manualPaymentMethods: next })
                    }}
                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    + নতুন যোগ করুন
                  </button>
                </div>

                {(config.manualPaymentMethods || []).length === 0 && (
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                    <p className="text-sm font-bold text-amber-900 mb-1">কোনো পেমেন্ট নম্বর নেই</p>
                    <p className="text-xs text-amber-700">"নতুন যোগ করুন" বাটনে চাপ দিয়ে bKash/Nagad/Rocket নম্বর যোগ করুন। নাহলে user-রা পেমেন্ট করার নম্বর দেখতে পাবে না।</p>
                  </div>
                )}

                {(config.manualPaymentMethods || []).map((method, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-end">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">মেথড</label>
                      <input
                        type="text"
                        placeholder="bKash"
                        value={method.name || ''}
                        onChange={(e) => {
                          const newMethods = [...config.manualPaymentMethods]
                          newMethods[index] = { ...newMethods[index], name: e.target.value }
                          setConfig({ ...config, manualPaymentMethods: newMethods })
                        }}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">নম্বর</label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={method.number || ''}
                        onChange={(e) => {
                          const newMethods = [...config.manualPaymentMethods]
                          newMethods[index] = { ...newMethods[index], number: e.target.value }
                          setConfig({ ...config, manualPaymentMethods: newMethods })
                        }}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">টাইপ</label>
                      <input
                        type="text"
                        placeholder="Personal"
                        value={method.type || ''}
                        onChange={(e) => {
                          const newMethods = [...config.manualPaymentMethods]
                          newMethods[index] = { ...newMethods[index], type: e.target.value }
                          setConfig({ ...config, manualPaymentMethods: newMethods })
                        }}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newMethods = config.manualPaymentMethods.filter((_, i) => i !== index)
                        setConfig({ ...config, manualPaymentMethods: newMethods })
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors"
                      title="ডিলিট"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Rate Limits — admin-configurable */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Rate Limits (অপব্যবহার রোধ)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    সব value backend-এ ৬০ সেকেন্ড cache হয় — সেভ করার পর
                    ১ মিনিটের মধ্যে effect হবে।
                  </p>
                </div>

                {/* AI limiter — dual-tier (system key vs BYO key) */}
                {(() => {
                  const ai = config.rateLimits?.ai || { max: 30, windowMinutes: 60, byoMax: 0, byoWindowMinutes: 60 }
                  const setAi = (fields) =>
                    setConfig({
                      ...config,
                      rateLimits: { ...config.rateLimits, ai: { ...ai, ...fields } },
                    })
                  return (
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 space-y-3">
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />
                          AI স্ক্যান + Book Generate
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          ২টা tier: যারা আমাদের system key ব্যবহার করে (cost আমাদের) vs যারা নিজের API key দিয়েছে (cost তাদের)
                        </div>
                      </div>

                      {/* System key tier */}
                      <div className="grid grid-cols-[1fr_90px_90px] gap-3 items-center bg-white p-2.5 rounded-lg border border-gray-100">
                        <div>
                          <div className="text-xs font-bold text-gray-700">🏢 System Key User</div>
                          <div className="text-[10px] text-gray-500">আমাদের AI key ব্যবহারকারী — cost protection</div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 mb-1">সর্বোচ্চ</label>
                          <input type="number" min={1} value={ai.max}
                            onChange={(e) => setAi({ max: parseInt(e.target.value, 10) || 0 })}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 mb-1">মিনিট</label>
                          <input type="number" min={1} value={ai.windowMinutes}
                            onChange={(e) => setAi({ windowMinutes: parseInt(e.target.value, 10) || 0 })}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                      </div>

                      {/* BYO key tier */}
                      <div className="grid grid-cols-[1fr_90px_90px] gap-3 items-center bg-white p-2.5 rounded-lg border border-gray-100">
                        <div>
                          <div className="text-xs font-bold text-gray-700">🔑 BYO Key User</div>
                          <div className="text-[10px] text-gray-500">নিজের key দিয়েছে — সর্বোচ্চ <strong>0 = unlimited</strong></div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 mb-1">সর্বোচ্চ</label>
                          <input type="number" min={0} value={ai.byoMax ?? 0}
                            onChange={(e) => setAi({ byoMax: parseInt(e.target.value, 10) || 0 })}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 mb-1">মিনিট</label>
                          <input type="number" min={1} value={ai.byoWindowMinutes ?? 60}
                            onChange={(e) => setAi({ byoWindowMinutes: parseInt(e.target.value, 10) || 0 })}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>

                      <div className="text-[10px] text-purple-700 bg-purple-100/40 px-2 py-1.5 rounded">
                        💡 marketing tip: BYO max <code>0</code> রাখলে — "নিজের API key দিলে unlimited AI scan!" — paid feature/incentive
                      </div>
                    </div>
                  )
                })()}

                {/* Other limiters — single-tier */}
                {[
                  { key: 'payment', label: 'Manual Payment Submit', desc: 'প্রতি user, admin inbox spam রোধ', accent: '#16a34a' },
                  { key: 'userKey', label: 'AI Key Save / Test', desc: 'প্রতি user, BYO key brute-force রোধ', accent: '#0891b2' },
                  { key: 'auth', label: 'Login / Register', desc: 'প্রতি IP, password brute-force রোধ', accent: '#dc2626' },
                  { key: 'global', label: 'Global API Cap', desc: 'প্রতি IP, DDoS catch-all', accent: '#475569' },
                ].map((row) => {
                  const limit = config.rateLimits?.[row.key] || { max: 0, windowMinutes: 0 }
                  return (
                    <div
                      key={row.key}
                      className="grid grid-cols-[1fr_90px_90px] gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 items-center"
                    >
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.accent }} />
                          {row.label}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{row.desc}</div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 mb-1">সর্বোচ্চ</label>
                        <input type="number" min={1} value={limit.max}
                          onChange={(e) => setConfig({
                            ...config,
                            rateLimits: {
                              ...config.rateLimits,
                              [row.key]: { ...limit, max: parseInt(e.target.value, 10) || 0 },
                            },
                          })}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 mb-1">মিনিট</label>
                        <input type="number" min={1} value={limit.windowMinutes}
                          onChange={(e) => setConfig({
                            ...config,
                            rateLimits: {
                              ...config.rateLimits,
                              [row.key]: { ...limit, windowMinutes: parseInt(e.target.value, 10) || 0 },
                            },
                          })}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Credit System Config — pricing + bonuses + suggested top-ups ── */}
              <div className="space-y-4 p-5 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100">
                <div>
                  <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">
                    Credit System
                  </h3>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    1 পেপার = X ৳ → Y AI প্রম্পট। সব value এখান থেকে edit করা যাবে — কোনো hard-code নেই।
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      পেপার দাম (৳)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={config.creditConfig?.bdt_per_paper ?? 10}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          creditConfig: {
                            ...config.creditConfig,
                            bdt_per_paper: parseInt(e.target.value, 10) || 1,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      প্রতি পেপার AI ops
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={config.creditConfig?.ops_per_paper ?? 25}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          creditConfig: {
                            ...config.creditConfig,
                            ops_per_paper: parseInt(e.target.value, 10) || 1,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      সাইনআপ বোনাস (ops)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={config.creditConfig?.signup_bonus_ops ?? 25}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          creditConfig: {
                            ...config.creditConfig,
                            signup_bonus_ops: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Referral বোনাস (ops)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={config.creditConfig?.referral_bonus_ops ?? 25}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          creditConfig: {
                            ...config.creditConfig,
                            referral_bonus_ops: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Min top-up (৳)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={config.creditConfig?.min_topup_bdt ?? 10}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          creditConfig: {
                            ...config.creditConfig,
                            min_topup_bdt: parseInt(e.target.value, 10) || 1,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Max top-up (৳)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={config.creditConfig?.max_topup_bdt ?? 100000}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          creditConfig: {
                            ...config.creditConfig,
                            max_topup_bdt: parseInt(e.target.value, 10) || 1,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      BYO Unlimited (৳/মাস)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={config.creditConfig?.byo_unlimited_price_bdt ?? 999}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          creditConfig: {
                            ...config.creditConfig,
                            byo_unlimited_price_bdt: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Suggested top-ups (কমা দিয়ে আলাদা ৳ amount)
                  </label>
                  <input
                    type="text"
                    value={(config.creditConfig?.suggested_topups_bdt || []).join(', ')}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        creditConfig: {
                          ...config.creditConfig,
                          suggested_topups_bdt: e.target.value
                            .split(',')
                            .map((v) => parseInt(v.trim(), 10))
                            .filter((v) => Number.isFinite(v) && v > 0),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Example: 10, 50, 200, 500, 1000, 5000
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">BYO Unlimited Subscription</h4>
                    <p className="text-[10px] text-emerald-700">
                      ON করলে pricing page-এ side offer card দেখাবে
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        creditConfig: {
                          ...config.creditConfig,
                          enable_byo_subscription: !config.creditConfig?.enable_byo_subscription,
                        },
                      })
                    }
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      config.creditConfig?.enable_byo_subscription ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.creditConfig?.enable_byo_subscription ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Retroactive signup bonus action */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-emerald-900 text-sm">
                      Existing user-দের signup bonus দিন
                    </h4>
                    <p className="text-[10px] text-emerald-700">
                      যাদের credit history নেই তাদের current signup_bonus_ops retroactively grant করুন (safe to re-run)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplySignupBonus}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                </div>

                {/* Live snapshot — what's actually in DB after most recent save */}
                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 text-xs mb-2 uppercase tracking-widest">
                    Live Saved Values (verify after each save)
                  </h4>
                  <pre className="text-[10px] text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(config.creditConfig, null, 2)}</pre>
                </div>
              </div>

              {/* ── AI Provider Configuration ── */}
              <div className="space-y-4 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100">
                <div>
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">
                    AI API Priorities
                  </h3>
                  <p className="text-[11px] text-indigo-800 mt-1">
                    API গুলো কোন সিরিয়ালে কল হবে তা কন্ট্রোল করুন। কমা দিয়ে নামগুলো লিখুন। Available: gemini, groq, openrouter, mistral, sambanova, cohere, novita, huggingface, zai
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                      Vision Chain (Image Scan)
                    </label>
                    <textarea
                      value={(config.aiProviderConfig?.vision_chain || []).join(', ')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aiProviderConfig: {
                            ...config.aiProviderConfig,
                            vision_chain: e.target.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-indigo-500 text-sm h-16"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                      Text Chain (Book Generate)
                    </label>
                    <textarea
                      value={(config.aiProviderConfig?.text_chain || []).join(', ')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aiProviderConfig: {
                            ...config.aiProviderConfig,
                            text_chain: e.target.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-0 rounded-lg font-bold focus:ring-2 focus:ring-indigo-500 text-sm h-16"
                    />
                  </div>
                </div>
              </div>

              {/* ── Backend Config — Vercel vs Render ── */}
              <div className="space-y-4 p-5 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <span>⚡</span> Backend Server
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Vercel (10s timeout) বা Render (unlimited timeout) — যেটা active সেটাতে সব API call যাবে।
                    Render deploy করলে URL দিন এবং Render select করুন।
                  </p>
                </div>

                {/* Active backend selector */}
                <div className="grid grid-cols-2 gap-3">
                  {['vercel', 'render'].map((backend) => {
                    const isActive = (config.backendConfig?.active || 'vercel') === backend
                    return (
                      <button
                        key={backend}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            backendConfig: { ...(config.backendConfig || {}), active: backend },
                          })
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <span className="font-black text-sm uppercase">{backend}</span>
                          {isActive && (
                            <span className="ml-auto text-[9px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 ml-5">
                          {backend === 'vercel'
                            ? 'Serverless — 10s timeout, no cold start'
                            : 'Persistent — unlimited timeout, 30-60s cold start'}
                        </p>
                      </button>
                    )
                  })}
                </div>

                {/* URLs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Vercel URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.rongtonu.com"
                      value={config.backendConfig?.vercel_url || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backendConfig: { ...(config.backendConfig || {}), vercel_url: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Render URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://proshno-api.onrender.com"
                      value={config.backendConfig?.render_url || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backendConfig: { ...(config.backendConfig || {}), render_url: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                  💡 সেভ করার পর user-রা page reload করলে নতুন backend এ switch হবে।
                  Render deploy করতে <code className="bg-gray-100 px-1 rounded">render-server/README.md</code> দেখুন।
                </div>
              </div>

              {/* ── PDF Server Config — Render vs HF Space ── */}
              <div className="space-y-4 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
                <div>
                  <h3 className="text-sm font-black text-orange-900 uppercase tracking-widest flex items-center gap-2">
                    <span>📄</span> PDF Server
                  </h3>
                  <p className="text-[11px] text-orange-700 mt-1">
                    PDF তৈরি কোন সার্ভার করবে। Auto = প্রথমে Render, fail হলে HF Space-এ fallback।
                  </p>
                </div>

                {/* Active PDF server selector */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: 'Auto', desc: 'Render → HF fallback', icon: '🔄' },
                    { id: 'render', label: 'Render', desc: 'Primary server', icon: '🟢' },
                    { id: 'hfspace', label: 'HF Space', desc: 'Fallback server', icon: '🤗' },
                  ].map((server) => {
                    const isActive = (config.pdfServerConfig?.active || 'auto') === server.id
                    return (
                      <button
                        key={server.id}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            pdfServerConfig: { ...(config.pdfServerConfig || {}), active: server.id },
                          })
                        }
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          isActive
                            ? 'border-orange-500 bg-orange-100'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg mb-1">{server.icon}</div>
                        <div className="font-black text-xs uppercase">{server.label}</div>
                        <div className="text-[9px] text-gray-500 mt-0.5">{server.desc}</div>
                        {isActive && (
                          <div className="mt-1.5 text-[8px] font-black text-orange-600 bg-orange-200 px-2 py-0.5 rounded-full inline-block">
                            ACTIVE
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* PDF Server URLs */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Render PDF Server URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://proshno-shala-pdf.onrender.com"
                      value={config.pdfServerConfig?.render_url || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          pdfServerConfig: { ...(config.pdfServerConfig || {}), render_url: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      HF Space PDF Server URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://riadahsan-proshno-shala-pdf.hf.space"
                      value={config.pdfServerConfig?.hfspace_url || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          pdfServerConfig: { ...(config.pdfServerConfig || {}), hfspace_url: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live status indicators */}
                <div className="grid grid-cols-2 gap-2">
                  <PdfServerStatusCard
                    label="Render"
                    url={config.pdfServerConfig?.render_url || 'https://proshno-shala-pdf.onrender.com'}
                  />
                  <PdfServerStatusCard
                    label="HF Space"
                    url={config.pdfServerConfig?.hfspace_url || 'https://riadahsan-proshno-shala-pdf.hf.space'}
                  />
                </div>

                <div className="text-[10px] text-orange-700 bg-white px-3 py-2 rounded-lg border border-orange-100">
                  💡 <strong>Auto mode:</strong> প্রথমে Render-এ try করবে, fail হলে (timeout/5xx) automatically HF Space-এ fallback।
                  যদি শুধু HF Space use করতে চাও তাহলে "HF Space" select করো।
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all btn-press disabled:opacity-50"
              >
                {saving ? 'সেভ হচ্ছে...' : 'সেভ সেটিংস'}
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {pendingPayments.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">কোন পেন্ডিং পেমেন্ট রিকোয়েস্ট নেই</p>
              </div>
            ) : (
              pendingPayments.map((payment) => (
                <div key={payment.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {payment.screenshot ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(payment.screenshot)}
                        className="w-full md:w-40 flex-shrink-0 group"
                      >
                        <img
                          src={payment.screenshot}
                          alt="payment screenshot"
                          className="w-full h-40 object-cover rounded-2xl border border-gray-100 group-hover:border-blue-500 transition-colors"
                        />
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-2">View full size</p>
                      </button>
                    ) : (
                      <div className="w-full md:w-40 h-40 flex-shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        কোনো স্ক্রিনশট নেই
                      </div>
                    )}

                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-gray-900 text-lg">৳{payment.amount || '-'}</span>
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">PENDING</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{payment.method}</span>
                      </div>
                      <p className="text-xs text-blue-600 font-bold mb-2">{payment.email}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          <span className="text-gray-400 uppercase tracking-wide">Tran ID:</span>{' '}
                          <span className="font-bold text-gray-700">{payment.tranId || '—'}</span>
                        </p>
                        <p>
                          <span className="text-gray-400 uppercase tracking-wide">Phone:</span>{' '}
                          <span className="font-bold text-gray-700">{payment.phone || '—'}</span>
                        </p>
                        {payment.createdAt && (
                          <p>
                            <span className="text-gray-400 uppercase tracking-wide">Submitted:</span>{' '}
                            <span className="font-bold text-gray-700">{new Date(payment.createdAt).toLocaleString('en-GB')}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 self-start md:self-center">
                      <button
                        onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                        className="px-4 py-2 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(payment.id, 'verified')}
                        className="px-6 py-2 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all btn-press"
                      >
                        ভেরিফাই করুন
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUser && (
          <UserEditModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={(updatedUser) => {
              setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u))
              setEditingUser(null)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setPreviewImage(null)}
          >
            <img
              src={previewImage}
              alt="payment screenshot full size"
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl font-bold flex items-center justify-center backdrop-blur-md"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UserEditModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    role: user.role || 'user',
    subscription: user.subscription || 'free',
    isBanned: user.isBanned || false
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/admin/users/${user.uid}`, formData)
      toast.success('ইউজারের তথ্য আপডেট করা হয়েছে')
      onSave({ ...user, ...formData })
    } catch {
      toast.error('তথ্য আপডেট করতে ব্যর্থ হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          ✕
        </button>
        
        <h3 className="text-xl font-black mb-1">ইউজার এডিট</h3>
        <p className="text-xs font-medium text-gray-500 mb-6 truncate">{user.email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">ভূমিকা (Role)</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-sm outline-none"
            >
              <option value="school">School</option>
              <option value="coaching">Coaching</option>
              <option value="admission">Admission</option>
              <option value="tutor">Private Tutor</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">সাবস্ক্রিপশন</label>
            <select
              value={formData.subscription}
              onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-sm outline-none"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100 mt-2">
            <input
              type="checkbox"
              id="banToggle"
              checked={formData.isBanned}
              onChange={(e) => setFormData({ ...formData, isBanned: e.target.checked })}
              className="w-5 h-5 rounded border-red-200 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="banToggle" className="text-xs font-bold text-red-900 cursor-pointer flex-1">
              অ্যাকাউন্ট ব্যান করুন
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
            >
              ক্যান্সেল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 btn-press disabled:opacity-50 text-sm"
            >
              {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/**
 * Live health-status card for one PDF server endpoint.
 * Pings /health once on mount and shows 🟢 / 🔴 / ⏳.
 */
function PdfServerStatusCard({ label, url }) {
  const [status, setStatus] = useState(() => (!url ? 'down' : 'loading'))
  const [latency, setLatency] = useState(null)

  useEffect(() => {
    if (!url) return
    let cancelled = false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const t0 = Date.now()
    // Use backend proxy to avoid CORS issues with direct PDF server fetch
    const proxyUrl = `/api/pdf-server/health-proxy?url=${encodeURIComponent(url.replace(/\/+$/, '') + '/health')}`
    fetch(proxyUrl, { signal: controller.signal })
      .then((r) => {
        clearTimeout(timer)
        if (cancelled) return
        setLatency(Date.now() - t0)
        setStatus(r.ok ? 'up' : 'down')
      })
      .catch(() => {
        clearTimeout(timer)
        if (!cancelled) setStatus('down')
      })

    return () => { cancelled = true; clearTimeout(timer); controller.abort() }
  }, [url])

  return (
    <div className="p-2.5 bg-white rounded-xl border border-gray-100 flex items-center gap-2">
      <span className="text-sm">
        {status === 'loading' ? '⏳' : status === 'up' ? '🟢' : '🔴'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black text-gray-700 uppercase">{label}</div>
        <div className="text-[9px] text-gray-400 truncate">{url || '—'}</div>
      </div>
      {latency != null && status === 'up' && (
        <span className="text-[9px] font-bold text-green-600">{latency}ms</span>
      )}
    </div>
  )
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
        {/* Placeholder for SVG icons */}
        <div className="w-8 h-8 opacity-70 border-2 border-current rounded-lg" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</h4>
        <div className="text-3xl font-black text-gray-900">{value || 0}</div>
      </div>
    </div>
  )
}
