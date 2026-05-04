import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import toast from 'react-hot-toast'
import Loader from '@/components/shared/Loader.jsx'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('settings')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [config, setConfig] = useState({ proPrice: 0, trialDays: 0, isTrialActive: false, features: [], manualPaymentMethods: [] })
  const [pendingPayments, setPendingPayments] = useState([])
  const [users, setUsers] = useState([])
  const [allPayments, setAllPayments] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)

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
      setConfig(configRes.data.config)
      setPendingPayments(paymentsRes.data.payments)
      if (usersRes.data.users) setUsers(usersRes.data.users)
      if (allPaymentsRes.data.payments) setAllPayments(allPaymentsRes.data.payments)
    } catch (err) {
      toast.error('তথ্য লোড করতে সমস্যা হচ্ছে')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConfig = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/admin/subscription/config', config)
      toast.success('কনফিগারেশন সেভ হয়েছে')
    } catch (err) {
      toast.error('সেভ করতে ব্যর্থ হয়েছে')
    } finally {
      setSaving(false)
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
          <p className="text-gray-500">সাবস্ক্রিপশন ও পেমেন্ট ম্যানেজমেন্ট</p>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <StatCard title="মোট ইউজার" value={stats?.totalUsers} icon="users" color="bg-blue-50 text-blue-600" />
            <StatCard title="মোট প্রশ্নপত্র" value={stats?.totalPapers} icon="file-text" color="bg-purple-50 text-purple-600" />
            <StatCard title="মোট আয় (৳)" value={stats?.totalRevenue || 0} icon="credit-card" color="bg-emerald-50 text-emerald-600" />
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
                    <th className="p-6 whitespace-nowrap">ভূমিকা (Role)</th>
                    <th className="p-6 whitespace-nowrap">সাবস্ক্রিপশন</th>
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
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${
                          user.subscription === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.subscription || 'free'}
                        </span>
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
                           {(payment.paymentMethod || payment.method || 'ssl').replace('sslcommerz', 'ssl')}
                        </p>
                        <p className="text-[10px] text-gray-400 tracking-wider mt-0.5">{payment.tranId}</p>
                      </td>
                      <td className="p-6 font-black text-gray-900">৳{payment.amount}</td>
                      <td className="p-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center ${
                          payment.status === 'success' || payment.status === 'verified' ? 'bg-green-100 text-green-700' :
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
            <h2 className="text-xl font-bold mb-6">সাবস্ক্রিপশন কনফিগারেশন</h2>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">প্রো প্ল্যান প্রাইস (৳)</label>
                  <input
                    type="number"
                    value={config.proPrice}
                    onChange={(e) => setConfig({ ...config, proPrice: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">ফ্রি ট্রায়াল দিন</label>
                  <input
                    type="number"
                    value={config.trialDays}
                    onChange={(e) => setConfig({ ...config, trialDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div>
                  <h4 className="font-bold text-blue-900">গ্লোবাল ফ্রি ট্রায়াল রিলিজ</h4>
                  <p className="text-xs text-blue-700 opacity-80">এটি অন থাকলে সব ইউজার নির্দিষ্ট দিন পর্যন্ত প্রো ফিচার ব্যবহার করতে পারবে</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, isTrialActive: !config.isTrialActive })}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${config.isTrialActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${config.isTrialActive ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">ফিচার লিস্ট (কমা দিয়ে আলাদা করুন)</label>
                <textarea
                  value={config.features.join(', ')}
                  onChange={(e) => setConfig({ ...config, features: e.target.value.split(',').map(f => f.trim()) })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm h-32 leading-relaxed"
                />
              </div>

              {/* Manual Payment Numbers Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">ম্যানুয়াল পেমেন্ট নম্বর</h3>
                {config.manualPaymentMethods.map((method, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">মেথড</label>
                      <input
                        type="text"
                        value={method.name}
                        onChange={(e) => {
                          const newMethods = [...config.manualPaymentMethods]
                          newMethods[index].name = e.target.value
                          setConfig({ ...config, manualPaymentMethods: newMethods })
                        }}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">নম্বর</label>
                      <input
                        type="text"
                        value={method.number}
                        onChange={(e) => {
                          const newMethods = [...config.manualPaymentMethods]
                          newMethods[index].number = e.target.value
                          setConfig({ ...config, manualPaymentMethods: newMethods })
                        }}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">টাইপ</label>
                      <input
                        type="text"
                        value={method.type}
                        onChange={(e) => {
                          const newMethods = [...config.manualPaymentMethods]
                          newMethods[index].type = e.target.value
                          setConfig({ ...config, manualPaymentMethods: newMethods })
                        }}
                        className="w-full px-3 py-2 bg-white border-0 rounded-lg text-sm font-bold"
                      />
                    </div>
                  </div>
                ))}
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
                <div key={payment.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="font-black text-xs uppercase">{payment.method}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-gray-900 text-lg">৳{payment.amount}</span>
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">PENDING</span>
                      </div>
                      <p className="text-xs text-blue-600 font-bold mb-1">{payment.email}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                         Tran ID: <span className="font-bold text-gray-600">{payment.tranId}</span> • Phone: <span className="font-bold text-gray-600">{payment.phone}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
    } catch (err) {
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

function StatCard({ title, value, icon, color }) {
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
