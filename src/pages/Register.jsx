import { supabase } from '@/lib/supabase'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const ROLES = [
  {
    value: 'school',
    label: 'স্কুল/কলেজ',
    description: 'একাডেমিক পরীক্ষার প্রশ্নপত্র',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    color: 'blue',
  },
  {
    value: 'coaching',
    label: 'কোচিং/চাকরি',
    description: 'BCS, ব্যাংক, MCQ পরীক্ষা',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    color: 'green',
  },
  {
    value: 'admission',
    label: 'ভর্তি পরীক্ষা',
    description: 'ইউনিট ফরম্যাট, স্পিড টেস্ট',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'orange',
  },
  {
    value: 'private_tutor',
    label: 'প্রাইভেট টিউটর',
    description: 'কাস্টম ব্র্যান্ডিং, হোমওয়ার্ক',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    color: 'purple',
  },
]

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', ring: 'ring-blue-500/20' },
  green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600', ring: 'ring-green-500/20' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-600', ring: 'ring-orange-500/20' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-600', ring: 'ring-purple-500/20' },
}

export default function Register() {
  const [searchParams] = useSearchParams()
  const applySession = useAuthStore((s) => s.applySession)
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)
  // Only allow skipping to step 2 via URL if user is already logged in (e.g. Google OAuth completing role)
  const initialStep = 1
  const [step, setStep] = useState(initialStep)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmitInfo = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return toast.error('পাসওয়ার্ড মিলছে না')
    }
    await handleRoleSelect('school')
  }

  const handleGoogleRegister = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) toast.error(error.message)
    } catch {
      toast.error('Google সাইন-আপ ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = async (selectedRole) => {
    setRole(selectedRole)
    setLoading(true)
    try {
      if (user) {
        const { data } = await api.put('/auth/set-role', { role: selectedRole })
        setUser(data.user)
        toast.success('অ্যাকাউন্ট তৈরি হয়েছে!')
        navigate('/dashboard', { replace: true })
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, full_name: name, role: selectedRole },
          },
        })
        if (error) throw error
        if (data.session) {
          const finalUser = await applySession(data.session)
          // Backend /auth/me may not have role yet for fresh email signups (profile row was just created).
          // Force-set the role we picked so we land on dashboard not back at role-step.
          if (finalUser && !finalUser.role) {
            try {
              const { data: roleRes } = await api.put('/auth/set-role', { role: selectedRole })
              setUser(roleRes.user)
            } catch {
              // best-effort — user can still navigate manually
            }
          }
          toast.success('অ্যাকাউন্ট তৈরি হয়েছে!')
          navigate('/dashboard', { replace: true })
        } else {
          toast.success('ইমেইলে লিংক পাঠানো হয়েছে — নিশ্চিত করুন, তারপর লগইন করুন।')
          navigate('/login')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে')
      setRole('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 px-6 pt-16 pb-12" style={{ paddingTop: 'calc(var(--safe-top) + 64px)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === 1 ? 'অ্যাকাউন্ট তৈরি করুন' : 'আপনি কে?'}
          </h1>
          <p className="text-blue-100 text-sm">
            {step === 1 ? 'বিনামূল্যে শুরু করুন' : 'আপনার ভূমিকা নির্বাচন করুন'}
          </p>
          <div className="flex gap-2 mt-6">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </motion.div>
      </div>

      <div className="flex-1 scroll-area bg-white -mt-6 rounded-t-3xl px-6 pt-8 pb-8 relative z-10">
        <div className="max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl font-medium hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Google দিয়ে সাইন আপ
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">অথবা ইমেইল দিয়ে</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <form onSubmit={handleSubmitInfo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">নাম</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="আপনার নাম"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">পাসওয়ার্ড নিশ্চিত করুন</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="আবার পাসওয়ার্ড লিখুন"
                      minLength={6}
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg">
                    পরবর্তী ধাপ
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-8">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                    লগইন করুন
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div className="space-y-3">
                  {ROLES.map((r) => {
                    const colors = COLOR_MAP[r.color]
                    const isSelected = role === r.value
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleRoleSelect(r.value)}
                        disabled={loading}
                        className={`w-full flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all disabled:opacity-70 ${
                          isSelected ? `${colors.border} ${colors.bg} ring-4 ${colors.ring}` : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>{r.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{r.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{r.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {!user && (
                  <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-500 mt-6 py-2">
                    ← আগের ধাপে ফিরে যান
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
