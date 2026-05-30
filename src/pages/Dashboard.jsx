import CreditBalance from '@/components/shared/CreditBalance'
import DashboardSkeleton from '@/components/shared/SkeletonCard'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

/* ─── Hub config per role ─────────────────────────────────── */
const HUB_CONFIG = {
  school: {
    title: 'একাডেমিক হাব',
    greeting: 'আজকের প্রশ্নপত্র তৈরি শুরু করুন',
    quickActions: [
      {
        label: 'প্রশ্নপত্র তৈরি',
        description: 'AI দিয়ে দ্রুত বানান',
        path: '/papers/new',
        gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
        glow: 'rgba(37,99,235,0.2)',
        icon: 'M12 4.5v15m7.5-7.5h-15',
      },
      {
        label: 'AI স্ক্যান',
        description: 'ছবি থেকে প্রশ্ন',
        path: '/papers/new?scan=true',
        gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        glow: 'rgba(124,58,237,0.2)',
        icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z',
      },
      {
        label: 'ফলাফল',
        description: 'পরীক্ষার রিপোর্ট',
        path: '/results',
        gradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
        glow: 'rgba(22,163,74,0.2)',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
      },
      {
        label: 'নোটিশ তৈরি',
        description: 'স্কুল/অফিস নোটিশ',
        path: '/notices',
        gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
        glow: 'rgba(217,119,6,0.2)',
        icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
      },
      {
        label: 'ক্লাস রুটিন',
        description: 'সাপ্তাহিক রুটিন',
        path: '/routines',
        gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        glow: 'rgba(30,64,175,0.2)',
        icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
      },
      {
        label: 'OMR শিট',
        description: 'উত্তরপত্র বানান',
        path: '/papers?omr=1',
        gradient: 'linear-gradient(135deg, #be123c, #f43f5e)',
        glow: 'rgba(190,18,60,0.2)',
        icon: 'M9 12h6m-6 4h6m-7-8h8a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm0 0V3m8 1V3',
      },
    ],
  },
  coaching: {
    title: 'কোচিং হাব',
    greeting: 'আজকের প্রশ্নপত্র তৈরি শুরু করুন',
    quickActions: [
      { label: 'MCQ সেট', description: 'নতুন প্রশ্নপত্র', path: '/papers/new', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)', glow: 'rgba(37,99,235,0.2)', icon: 'M12 4.5v15m7.5-7.5h-15' },
      { label: 'AI স্ক্যান', description: 'ছবি থেকে প্রশ্ন', path: '/papers/new?scan=true', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', glow: 'rgba(124,58,237,0.2)', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z' },
      { label: 'ফলাফল', description: 'স্কোরবোর্ড দেখুন', path: '/results', gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', glow: 'rgba(22,163,74,0.2)', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
      { label: 'নোটিশ তৈরি', description: 'অফিস নোটিশ', path: '/notices', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', glow: 'rgba(217,119,6,0.2)', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z' },
      { label: 'ক্লাস রুটিন', description: 'সাপ্তাহিক রুটিন', path: '/routines', gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)', glow: 'rgba(30,64,175,0.2)', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
      { label: 'OMR শিট', description: 'উত্তরপত্র বানান', path: '/papers?omr=1', gradient: 'linear-gradient(135deg, #be123c, #f43f5e)', glow: 'rgba(190,18,60,0.2)', icon: 'M9 12h6m-6 4h6m-7-8h8a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm0 0V3m8 1V3' },
    ],
  },
}

/* ─── Animation variants ─────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

/* ─── Sub-Components ─────────────────────────────────────── */
function StatCard({ label, value, color, gradient }) {
  return (
    <div
      className="text-center rounded-2xl sm:rounded-3xl"
      style={{
        background: gradient || `linear-gradient(145deg, ${color}, ${color}dd)`,
        padding: '10px 6px 8px',
      }}
    >
      <p
        className="text-[20px] sm:text-2xl font-extrabold m-0"
        style={{
          color: '#fff',
          lineHeight: 1,
          fontFamily: 'var(--font-english)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
      <p
        className="text-[8px] sm:text-[9px] font-bold m-0 mt-1 leading-tight"
        style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}
      >
        {label}
      </p>
    </div>
  )
}

function QuickActionCard({ action }) {
  return (
    <Link
      to={action.path}
      className="btn-press flex items-center gap-3 bg-white no-underline p-3 sm:p-3.5 border border-slate-100 rounded-xl sm:rounded-2xl"
      style={{ boxShadow: 'var(--shadow-card)', minHeight: 64 }}
    >
      <div
        className="w-10 h-10 sm:w-9 sm:h-10 rounded-xl sm:rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: action.gradient,
          boxShadow: `0 3px 8px ${action.glow}`,
        }}
      >
        <svg
          className="w-[18px] h-[18px] sm:w-[18px] sm:h-[18px]"
          viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
        </svg>
      </div>
      <div className="min-w-0 text-left">
        <p
          className="text-[13px] sm:text-xs font-semibold m-0 leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {action.label}
        </p>
        <p
          className="text-[11px] sm:text-[10px] m-0 mt-0.5 leading-tight"
          style={{ color: 'var(--text-muted)' }}
        >
          {action.description}
        </p>
      </div>
    </Link>
  )
}

function PaperRow({ paper }) {
  const initial = (paper.exam_title || paper.institution_name || 'প')?.charAt(0)
  return (
    <Link
      to={`/papers/${paper.id}`}
      className="btn-press flex items-center gap-2 sm:gap-3 px-2.5 py-2 sm:px-4 sm:py-3.5 no-underline border-b border-slate-50"
    >
      <div
        className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-[12px] sm:text-[15px] flex-shrink-0"
        style={{ background: '#f1f5f9', color: '#64748b' }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[12px] sm:text-sm font-semibold m-0 truncate"
          style={{ color: '#1e293b' }}
        >
          {paper.exam_title || 'শিরোনামবিহীন'}
        </p>
        <p
          className="text-[10px] sm:text-[11px] m-0 mt-0.5"
          style={{ color: '#94a3b8' }}
        >
          {paper.questions?.length || 0} টি প্রশ্ন
        </p>
      </div>
      <svg
        className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
        viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const hub = HUB_CONFIG[user?.role] || HUB_CONFIG.school
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.name?.split(' ')[0] || 'ব্যবহারকারী'

  useEffect(() => {
    let cancelled = false
    api.get('/papers')
      .then(({ data }) => {
        if (!cancelled) setPapers(data.papers || [])
      })
      .catch(() => {
        if (!cancelled) toast.error('পেপার লোড করতে ব্যর্থ হয়েছে')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const totalPapers = papers.length
  const thisMonthPapers = papers.filter(p => {
    if (!p.createdAt) return false
    const d = new Date(p.createdAt)
    const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).length
  const totalQuestions = papers.reduce((sum, p) => sum + (p.questions?.length || 0), 0)

  if (loading) return <DashboardSkeleton />

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 sm:gap-6 pb-6"
    >
      {/* ── Welcome Area + Stats (side by side) ──────────────── */}
      <motion.div variants={item}>
        {/* Desktop: side-by-side | Mobile: stacked */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <span
              className="text-[12px] sm:text-sm"
              style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}
            >
              {hub.title}
            </span>
            <h1
              className="text-[18px] sm:text-[26px]"
              style={{ fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}
            >
              হ্যালো, {firstName}! 👋
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 sm:flex-1">
            <StatCard label="মোট পেপার" value={totalPapers} gradient="linear-gradient(145deg, #2563eb, #3b82f6)" />
            <StatCard label="এই মাসে" value={thisMonthPapers} gradient="linear-gradient(145deg, #059669, #10b981)" />
            <StatCard label="মোট প্রশ্ন" value={totalQuestions} gradient="linear-gradient(145deg, #7c3aed, #a855f7)" />
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <motion.div variants={item}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 12px', paddingLeft: 4 }}>
          দ্রুত কাজ
        </p>
        <div className="no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {hub.quickActions.map((action, i) => (
            <QuickActionCard key={i} action={action} />
          ))}
        </div>
      </motion.div>

      {/* ── Credit Balance ────────────────────────────────── */}
      <motion.div variants={item}>
        <CreditBalance compact={false} showTopUp />
      </motion.div>

      {/* ── Recent Papers List ─────────────────────────────── */}
      <motion.div variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>সাম্প্রতিক পেপার</h2>
          <Link to="/papers" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
            সব দেখুন →
          </Link>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          border: '1px solid #f1f5f9',
        }}>
          {papers.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>কোনো পেপার পাওয়া যায়নি</p>
              <Link to="/papers/new" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: 12 }}>
                প্রথম পেপার তৈরি করুন
              </Link>
            </div>
          ) : (
            papers.slice(0, 5).map((paper) => (
              <PaperRow key={paper.id} paper={paper} />
            ))
          )}
        </div>
      </motion.div>

      {/* ── Credit Top-up CTA — shown when balance is low ── */}
      {(user?.credits?.aiOps ?? 0) < (user?.credits?.opsPerPaper || 25) && (
        <motion.div variants={item}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: 24,
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
          }}>
            <div style={{
              position: 'absolute',
              top: -24,
              right: -24,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>ক্রেডিট কম পড়েছে</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px', lineHeight: 1.5 }}>
                মাত্র {user?.credits?.bdtPerPaper || 10} ৳-এ ১ পেপার। টপ-আপ করুন।
              </p>
              <Link
                to="/pricing"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                }}
              >
                ক্রেডিট কিনুন
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
