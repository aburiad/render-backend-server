import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import api from '@/services/api'
import DashboardSkeleton from '@/components/shared/SkeletonCard'
import toast from 'react-hot-toast'

/* ─── Hub config per role ─────────────────────────────────── */
const HUB_CONFIG = {
  school: {
    title: 'একাডেমিক হাব',
    greeting: 'আজকের প্রশ্নপত্র তৈরি শুরু করুন',
    quickActions: [
      {
        label: 'প্রশ্নপত্র তৈরি',
        description: 'নতুন পেপার বানান',
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
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z',
      },
    ],
  },
  coaching: {
    title: 'কোচিং হাব',
    greeting: 'আজকের প্রশ্নপত্র তৈরি শুরু করুন',
    quickActions: [
      { label: 'MCQ সেট', description: 'নতুন প্রশ্নপত্র', path: '/papers/new', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)', glow: 'rgba(37,99,235,0.2)', icon: 'M12 4.5v15m7.5-7.5h-15' },
      { label: 'AI স্ক্যান', description: 'ছবি থেকে প্রশ্ন', path: '/papers/new?scan=true', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', glow: 'rgba(124,58,237,0.2)', icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z' },
      { label: 'ফলাফল', description: 'স্কোরবোর্ড দেখুন', path: '/results', gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', glow: 'rgba(22,163,74,0.2)', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z' },
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
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff',
      padding: '16px 8px',
      borderRadius: 16,
      textAlign: 'center',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid #f1f5f9',
    }}>
      <p style={{
        fontSize: 24,
        fontWeight: 800,
        color: color,
        margin: '0 0 2px',
        lineHeight: 1,
        fontFamily: 'var(--font-english)',
      }}>
        {value}
      </p>
      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        {label}
      </p>
    </div>
  )
}

function QuickActionCard({ action }) {
  return (
    <Link
      to={action.path}
      className="btn-press"
      style={{
        borderRadius: 'var(--radius-lg)',
        background: '#fff',
        boxShadow: 'var(--shadow-card)',
        padding: '12px 10px',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        textAlign: 'center',
        border: '1px solid #f1f5f9',
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-sm)',
        background: action.gradient,
        boxShadow: `0 3px 8px ${action.glow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeights: 700, color: 'var(--text-primary)', margin: '0 0 2px', lineHeight: 1.2 }}>
          {action.label}
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
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
      className="btn-press"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        textDecoration: 'none',
        borderBottom: '1px solid #f8fafc',
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: '#f1f5f9',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 15,
        flexShrink: 0,
      }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {paper.exam_title || 'শিরোনামবিহীন'}
        </p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
          {paper.questions?.length || 0} টি প্রশ্ন
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2.5}>
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
      style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}
    >
      {/* ── Welcome Area ───────────────────────────────────── */}
      <motion.div variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              {hub.title}
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
              হ্যালো, {firstName}! 👋
            </h1>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #fff, #f8fafc)',
            padding: '6px 14px',
            borderRadius: 100,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #e2e8f0',
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: user?.subscription === 'pro' ? '#f59e0b' : '#64748b' }}>
              {user?.subscription === 'pro' ? '✦ PRO' : 'FREE'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <motion.div variants={item}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard label="মোট পেপার" value={totalPapers} color="var(--primary)" />
          <StatCard label="এই মাসে" value={thisMonthPapers} color="#10b981" />
          <StatCard label="মোট প্রশ্ন" value={totalQuestions} color="#8b5cf6" />
        </div>
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <motion.div variants={item}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 12px', paddingLeft: 4 }}>
          দ্রুত কাজ
        </p>
        <div className="no-scrollbar" style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(3, 1fr)'
        }}>
          {hub.quickActions.map((action, i) => (
            <QuickActionCard key={i} action={action} />
          ))}
        </div>
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

      {/* ── Premium CTA ───────────────────────────────────── */}
      {user?.subscription !== 'pro' && (
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
              <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>প্রিমিয়াম ফিচারে আপগ্রেড</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px', lineHeight: 1.5 }}>
                আনলিমিটেড এআই স্ক্যানিং এবং অটো-কোয়েশ্চেন জেনারেশন সুবিধা পান।
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
                প্যাক দেখুন
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
