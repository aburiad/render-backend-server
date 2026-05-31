import { MathText } from '@/utils/mathRender'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Learning Hub — Premium tutorial with SVG icons & step-by-step visuals
 */

/* ─── SVG Icon Components ─────────────────────────────── */
function IconRegister({ size = 20, color = '#2563eb' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M16 3.5a2 2 0 013 1.5" />
    </svg>
  )
}

function IconDashboard({ size = 20, color = '#2563eb' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconPaper({ size = 20, color = '#2563eb' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  )
}

function IconDownload({ size = 20, color = '#2563eb' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconScan({ size = 20, color = '#7c3aed' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="9" />
      <circle cx="15" cy="15" r="3" />
      <path d="M15 12v-1" />
      <path d="M15 19v-1" />
      <path d="M12 15h-1" />
      <path d="M19 15h-1" />
    </svg>
  )
}

function IconBook({ size = 20, color = '#059669' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

function IconBank({ size = 20, color = '#d97706' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M12 3l9 7H3l9-7z" />
      <line x1="7" y1="10" x2="7" y2="21" />
      <line x1="12" y1="10" x2="12" y2="21" />
      <line x1="17" y1="10" x2="17" y2="21" />
    </svg>
  )
}

function IconNotice({ size = 20, color = '#d97706' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

function IconRoutine({ size = 20, color = '#2563eb' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="8" y1="18" x2="8" y2="18.01" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
    </svg>
  )
}

function IconOmr({ size = 20, color = '#be123c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <circle cx="7" cy="8" r="1.5" />
      <circle cx="7" cy="13" r="1.5" />
      <circle cx="7" cy="18" r="1.5" />
      <line x1="12" y1="8" x2="19" y2="8" />
      <line x1="12" y1="13" x2="19" y2="13" />
      <line x1="12" y1="18" x2="19" y2="18" />
    </svg>
  )
}

function IconOnlineExam({ size = 20, color = '#059669' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <polyline points="10 8 12 10 15 7" />
    </svg>
  )
}

function IconChevronRight({ size = 16, color = '#94a3b8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconCheck({ size = 16, color = '#10b981' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconArrowDown({ size = 20, color = '#cbd5e1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  )
}

/* ─── Tabs ──────────────────────────────────────────────────── */
const TABS = [
  { id: 'start', label: 'শুরু করুন', icon: IconRegister },
  { id: 'paper', label: 'প্রশ্নপত্র', icon: IconPaper },
  { id: 'math', label: 'গণিত লেখা', icon: IconScan },
  { id: 'extra', label: 'নোটিশ ও রুটিন', icon: IconNotice },
  { id: 'plan', label: 'প্ল্যান ও পেমেন্ট', icon: IconBank },
]

/* ─── Step Card Component ─────────────────────────────── */
function StepCard({ stepNumber, icon, title, description, mockup, color = '#2563eb', isLast = false }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {/* Left: Number + Connector line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `\${color}12`, border: `2px solid \${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {icon}
          <span style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18, borderRadius: '50%',
            background: color, color: '#fff',
            fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>{stepNumber}</span>
        </div>
        {!isLast && (
          <div style={{
            width: 2, height: 32, background: '#e2e8f0',
            borderRadius: 1, marginTop: 4,
          }} />
        )}
      </div>

      {/* Right: Content */}
      <div style={{
        flex: 1, background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 14, padding: 14, marginBottom: isLast ? 0 : 8,
      }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
          {title}
        </h4>
        <p style={{ fontSize: 11.5, color: '#475569', margin: 0, lineHeight: 1.65 }}>
          {description}
        </p>
        {/* Mini UI Mockup */}
        {mockup && (
          <div style={{
            marginTop: 10, padding: 10, background: '#f8fafc',
            borderRadius: 10, border: '1px solid #e2e8f0',
            fontSize: 10, color: '#64748b',
          }}>
            {mockup}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Feature Card with Mockup ────────────────────────── */
function FeatureCard({ icon, title, color, steps, tip }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 18, padding: 18, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `\${color}10`, border: `1.5px solid \${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {title}
        </h3>
      </div>

      {/* Steps with arrows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, i) => (
          <div key={i}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px',
              background: i === 0 ? `\${color}06` : 'transparent',
              borderRadius: 8,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: `\${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 12, color: '#334155', lineHeight: 1.55 }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ paddingLeft: 19, paddingVertical: 2 }}>
                <div style={{ width: 1.5, height: 10, background: '#e2e8f0', borderRadius: 1 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tip */}
      {tip && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 10, fontSize: 11, color: '#92400e', lineHeight: 1.55,
          display: 'flex', gap: 6, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
          <span>{tip}</span>
        </div>
      )}
    </div>
  )
}

/* ─── Mockup Builders ─────────────────────────────────── */
function MiniMockupPaper() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{
        width: 48, height: 60, background: '#fff', border: '1.5px solid #cbd5e1',
        borderRadius: 4, display: 'flex', flexDirection: 'column', padding: 4, gap: 3,
      }}>
        <div style={{ height: 2, background: '#2563eb', borderRadius: 1, width: '80%', margin: '0 auto' }} />
        <div style={{ height: 1.5, background: '#e2e8f0', borderRadius: 1, width: '100%' }} />
        <div style={{ height: 1.5, background: '#e2e8f0', borderRadius: 1, width: '90%' }} />
        <div style={{ height: 1.5, background: '#e2e8f0', borderRadius: 1, width: '95%' }} />
        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
          <div style={{ height: 1.5, background: '#e2e8f0', borderRadius: 1, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
          <div style={{ height: 1.5, background: '#e2e8f0', borderRadius: 1, flex: 1 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#334155' }}>প্রশ্নপত্র প্রিভিউ</span>
        <span style={{ fontSize: 8, color: '#94a3b8' }}>হেডার → প্রশ্ন → প্রিন্ট</span>
        <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 7, padding: '2px 6px', background: '#2563eb15', color: '#2563eb', borderRadius: 4, fontWeight: 700 }}>PDF</span>
          <span style={{ fontSize: 7, padding: '2px 6px', background: '#05966915', color: '#059669', borderRadius: 4, fontWeight: 700 }}>Print</span>
        </div>
      </div>
    </div>
  )
}

function MiniMockupScan() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{
        width: 44, height: 44, background: '#7c3aed08', border: '2px dashed #7c3aed40',
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={1.5}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#334155' }}>ছবি আপলোড → AI স্ক্যান</span>
        <span style={{ fontSize: 8, color: '#94a3b8' }}>বইয়ের পাতা থেকে স্বয়ংক্রিয় প্রশ্ন</span>
      </div>
    </div>
  )
}

function MiniMockupBook() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{
        width: 44, height: 44, background: '#05966908', border: '1.5px solid #05966930',
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconBook size={22} color="#059669" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#334155' }}>অধ্যায় → প্রশ্নের ধরন → AI</span>
        <span style={{ fontSize: 8, color: '#94a3b8' }}>বই থেকে মিনিটে ১০-২০টি প্রশ্ন</span>
      </div>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────── */
export default function LearningHub() {
  const [activeTab, setActiveTab] = useState('start')
  const [copiedIdx, setCopiedIdx] = useState(null)

  const handleCopy = async (latex, idx) => {
    try {
      await navigator.clipboard.writeText(latex)
      setCopiedIdx(idx)
      toast.success('কপি হয়েছে!', { duration: 1200 })
      setTimeout(() => setCopiedIdx(null), 1200)
    } catch {
      toast.error('কপি ব্যর্থ')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: 900, margin: '0 auto' }}
    >
      {/* Header */}
      <header style={{ marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px',
          background: 'linear-gradient(135deg, #eff6ff, #ede9fe)',
          border: '1px solid #dbeafe', borderRadius: 999, marginBottom: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={2}>
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Learning Hub
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.25 }}>
          প্রশ্নশালা ব্যবহার গাইড
        </h1>
        <p style={{ fontSize: 'clamp(12px, 2.2vw, 14px)', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          স্টেপ-বাই-স্টেপ ভিজ্যুয়াল গাইড — ছবি দেখে শিখুন, মিনিটে শুরু করুন।
        </p>
      </header>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
        marginBottom: 20, scrollbarWidth: 'none',
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 12,
                background: isActive ? '#0f172a' : '#f1f5f9',
                color: isActive ? '#fff' : '#475569',
                border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              <TabIcon size={14} color={isActive ? '#fff' : '#64748b'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'start' && <StartTab />}
          {activeTab === 'paper' && <PaperTab />}
          {activeTab === 'math' && <MathTab copiedIdx={copiedIdx} onCopy={handleCopy} />}
          {activeTab === 'extra' && <ExtraTab />}
          {activeTab === 'plan' && <PlanTab />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Tab 1: Getting Started ────────────────────────────────── */
function StartTab() {
  const steps = [
    {
      icon: <IconRegister size={20} color="#7c3aed" />,
      title: 'অ্যাকাউন্ট খুলুন',
      description: 'ইমেইল ও পাসওয়ার্ড দিয়ে রেজিস্টার করুন, অথবা Google অ্যাকাউন্ট দিয়ে সরাসরি লগইন করুন।',
      mockup: (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            padding: '4px 10px', background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 6, fontSize: 9, fontWeight: 600, color: '#334155',
          }}>📧 ইমেইল</div>
          <div style={{
            padding: '4px 10px', background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 6, fontSize: 9, fontWeight: 600, color: '#334155',
          }}>🔒 পাসওয়ার্ড</div>
          <div style={{
            padding: '4px 10px', background: '#4285f4', borderRadius: 6,
            fontSize: 9, fontWeight: 600, color: '#fff',
          }}>G Google</div>
        </div>
      ),
      color: '#7c3aed',
    },
    {
      icon: <IconDashboard size={20} color="#2563eb" />,
      title: 'ড্যাশবোর্ড দেখুন',
      description: 'লগইন করলে আপনার ড্যাশবোর্ডে পরিসংখ্যান দেখাবে — পেপার সংখ্যা, প্রশ্ন সংখ্যা, ক্রেডিট ব্যালেন্স।',
      mockup: (
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb' }}>৫</div>
            <div style={{ fontSize: 7, color: '#94a3b8' }}>পেপার</div>
          </div>
          <div style={{ padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#059669' }}>৪৮</div>
            <div style={{ fontSize: 7, color: '#94a3b8' }}>প্রশ্ন</div>
          </div>
          <div style={{ padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#d97706' }}>২৫০</div>
            <div style={{ fontSize: 7, color: '#94a3b8' }}>ক্রেডিট</div>
          </div>
        </div>
      ),
      color: '#2563eb',
    },
    {
      icon: <IconPaper size={20} color="#059669" />,
      title: 'প্রশ্নপত্র তৈরি করুন',
      description: '"নতুন প্রশ্নপত্র" বাটনে ক্লিক করে পরীক্ষার নাম, বিষয়, ক্লাস দিন। তারপর MCQ, CQ, সংক্ষিপ্ত ইত্যাদি প্রশ্ন যোগ করুন।',
      mockup: <MiniMockupPaper />,
      color: '#059669',
    },
    {
      icon: <IconDownload size={20} color="#be123c" />,
      title: 'PDF ডাউনলোড বা প্রিন্ট',
      description: 'প্রশ্নপত্র তৈরি শেষে "PDF Preview" তে গিয়ে PDF ডাউনলোড করুন অথবা সরাসরি প্রিন্ট করুন।',
      mockup: (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <div style={{ padding: '4px 8px', background: '#2563eb15', borderRadius: 6, fontSize: 8, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconDownload size={10} color="#2563eb" /> PDF ডাউনলোড
          </div>
          <div style={{ padding: '4px 8px', background: '#05966915', borderRadius: 6, fontSize: 8, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            প্রিন্ট
          </div>
        </div>
      ),
      color: '#be123c',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 18, padding: 20, color: '#fff',
        marginBottom: 16, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -10, left: '40%', width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={1.8}>
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>প্রশ্নশালা — AI Question Hub</span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, position: 'relative', color: '#e2e8f0' }}>
          শিক্ষক, স্কুল, কোচিং সেন্টার ও প্রাইভেট টিউটরদের জন্য স্মার্ট টুল। মিনিটের মধ্যে পেশাদার প্রশ্নপত্র, নোটিশ, ক্লাস রুটিন তৈরি করুন।
        </p>
      </div>

      {/* Steps */}
      {steps.map((step, i) => (
        <StepCard
          key={i}
          stepNumber={i + 1}
          icon={step.icon}
          title={step.title}
          description={step.description}
          mockup={step.mockup}
          color={step.color}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  )
}

/* ─── Tab 2: Question Paper ─────────────────────────────────── */
function PaperTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FeatureCard
        icon={<IconPaper size={20} color="#2563eb" />}
        title="প্রশ্নপত্র তৈরি"
        color="#2563eb"
        steps={[
          <>সাইডবার থেকে <strong>"নতুন প্রশ্নপত্র"</strong> এ ক্লিক করুন</>,
          <>পরীক্ষার নাম, প্রতিষ্ঠান, ক্লাস, বিষয়, সময়, পূর্ণমান দিন</>,
          <><strong>"প্রশ্ন যোগ করুন"</strong> বাটনে ক্লিক করে প্রশ্নের ধরন বাছাই করুন (MCQ, CQ, সংক্ষিপ্ত ইত্যাদি)</>,
          <>প্রশ্ন লিখুন অথবা <strong>AI দিয়ে জেনারেট</strong> করুন</>,
          <><strong>"সেভ"</strong> করুন → <strong>"PDF Preview"</strong> → PDF ডাউনলোড</>,
        ]}
        tip="প্রথমবার শুধু পরীক্ষার নাম দিলেই হবে — বাকি পরে আপডেট করা যায়।"
      />

      <FeatureCard
        icon={<IconScan size={20} color="#7c3aed" />}
        title="AI স্ক্যান — ছবি থেকে প্রশ্ন"
        color="#7c3aed"
        steps={[
          'বইয়ের পাতা বা প্রশ্নের ছবি তুলুন (ফোনের ক্যামেরা দিয়ে)',
          <>পেপার এডিটরে <strong>"📷 ছবি স্ক্যান"</strong> বাটনে ক্লিক করুন</>,
          'ছবি আপলোড করুন — AI স্বয়ংক্রিয়ভাবে প্রশ্ন চিনে নিবে',
          'প্রয়োজনে এডিট করুন, তারপর সেভ করুন',
        ]}
        tip="মাসে ৩০টি ফ্রি স্ক্যান পাবেন। Pro তে আনলিমিটেড!"
      />

      <FeatureCard
        icon={<IconBook size={20} color="#059669" />}
        title="বই থেকে প্রশ্ন জেনারেট"
        color="#059669"
        steps={[
          <>পেপার এডিটরে <strong>"📚 বই থেকে"</strong> বাটনে ক্লিক করুন</>,
          'বইয়ের নাম, ক্লাস, অধ্যায়, প্রশ্নের ধরন ও সংখ্যা দিন',
          'AI আপনার জন্য প্রশ্ন তৈরি করে দিবে',
          'পছন্দ মতো এডিট করে পেপারে যোগ করুন',
        ]}
      />

      {/* Question Types Grid */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 18, padding: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#be123c10', border: '1.5px solid #be123c25',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth={1.8}>
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            প্রশ্নের ধরনসমূহ
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {[
            { name: 'MCQ', desc: 'বহুনির্বাচনি — ৪টি অপশন', color: '#4c1d95' },
            { name: 'CQ', desc: 'সৃজনশীল / রচনামূলক', color: '#5b21b6' },
            { name: 'সংক্ষিপ্ত', desc: 'ছোট উত্তরের প্রশ্ন', color: '#065f46' },
            { name: 'হিসাববিজ্ঞান', desc: 'অ্যাকাউন্টিং টেবিল', color: '#92400e' },
            { name: 'শূন্যস্থান', desc: 'ফিল-ইন-দ্য-ব্ল্যাংক', color: '#be185d' },
            { name: 'মিলানো', desc: 'জোড়া মেলানো', color: '#b91c1c' },
            { name: 'সাজানো', desc: 'সিরিয়াল / বিন্যাস্ত', color: '#115e59' },
            { name: 'অনুবাদ', desc: 'ট্রান্সলেশন', color: '#4338ca' },
            { name: 'ছক', desc: 'টেবিল / ছক পূরণ', color: '#475569' },
          ].map((t) => (
            <div key={t.name} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', background: '#f8fafc',
              borderRadius: 10, border: '1px solid #e2e8f0',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 3,
                background: t.color, flexShrink: 0,
              }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Tab 3: Math ───────────────────────────────────────────── */
const MATH_EXAMPLES = [
  { latex: '\\\\frac{a}{b}', desc: 'ভগ্নাংশ' },
  { latex: 'x^2 + y^2 = z^2', desc: 'সূচক/ঘাত' },
  { latex: '\\\\sqrt{2}', desc: 'বর্গমূল' },
  { latex: 'a_1 + a_2', desc: 'নিম্নসূচক' },
  { latex: '\\\\sum_{i=1}^{n} i', desc: 'সিগমা/যোগফল' },
  { latex: '\\\\int_0^1 x \\\\, dx', desc: 'ইন্টিগ্রেশন' },
  { latex: '\\\\sin^2\\\\theta + \\\\cos^2\\\\theta = 1', desc: 'ত্রিকোণমিতি' },
  { latex: 'x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}', desc: 'দ্বিঘাত সূত্র' },
]

function MathTab({ copiedIdx, onCopy }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Two methods */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        <FeatureCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={1.8}><text x="4" y="18" fontSize="14" fontStyle="italic" fill="#64748b" stroke="none">fx</text></svg>}
          title="fx বাটন (LaTeX)"
          color="#64748b"
          steps={[
            'টেক্সট বক্সে কার্সর রাখুন যেখানে গণিত বসাবেন',
            '"fx" বাটনে ক্লিক করুন',
            'LaTeX কোড লিখুন (যেমন: \\\\frac{a}{b})',
            'প্রিভিউ দেখুন → "যোগ করুন" চাপুন',
          ]}
        />
        <FeatureCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={1.8}><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="7" y1="4" x2="7" y2="20" /><line x1="2" y1="10" x2="22" y2="10" /><text x="10" y="9" fontSize="6" fill="#2563eb" stroke="none">∑</text><text x="10" y="17" fontSize="6" fill="#2563eb" stroke="none">√</text><text x="15" y="9" fontSize="6" fill="#2563eb" stroke="none">π</text><text x="15" y="17" fontSize="6" fill="#2563eb" stroke="none">x²</text></svg>}
          title="কীবোর্ড বাটন"
          color="#2563eb"
          steps={[
            'টেক্সট বক্সে কার্সর রাখুন',
            'নীল কীবোর্ড বাটনে ক্লিক করুন',
            'প্যালেট থেকে সিম্বল (∫, √, π, x²) ট্যাপ করুন',
            'সাজানো হলে "যোগ করুন" চাপুন',
          ]}
        />
      </div>

      {/* Copy Examples */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
          ক্লিক করলেই LaTeX কপি হবে
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {MATH_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCopy(ex.latex, i)}
              style={{
                textAlign: 'left', background: '#f8fafc',
                border: `1.5px solid \${copiedIdx === i ? '#22c55e' : '#e2e8f0'}`,
                borderRadius: 10, padding: 10, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              <div style={{
                minHeight: 32, padding: '4px 6px', background: '#fff',
                border: '1px dashed #cbd5e1', borderRadius: 6,
                fontSize: 14, lineHeight: 1.5, color: '#0f172a', marginBottom: 4,
              }}>
                <MathText text={`$\${ex.latex}$`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b' }}>{ex.desc}</span>
                <span style={{ fontSize: 9, color: copiedIdx === i ? '#22c55e' : '#94a3b8' }}>
                  {copiedIdx === i ? '✓ কপি' : '📋'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          বাংলা ও গণিত একসাথে লেখা
        </h4>
        <p style={{ fontSize: 12, color: '#334155', margin: '0 0 8px', lineHeight: 1.6 }}>
          বাংলা টেক্সটের মাঝে <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 4, fontSize: 11 }}>$...$</code> দিয়ে গণিত বসান। বড় করে দেখাতে <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 4, fontSize: 11 }}>$$...$$</code> ব্যবহার করুন।
        </p>
        <div style={{
          background: '#f8fafc', border: '1px dashed #cbd5e1',
          borderRadius: 10, padding: 10, fontSize: 13, lineHeight: 1.7, color: '#0f172a',
        }}>
          <MathText text="সমীকরণ সমাধান করো: $x^2 - 5x + 6 = 0$" />
        </div>
      </div>

      <div style={{
        padding: 14, background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
        border: '1px solid #fecaca', borderRadius: 14, textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: '#991b1b', margin: 0, lineHeight: 1.6 }}>
          ⚠️ গণিতে একটি ভুল সিম্বলও সমস্যা হতে পারে। সবসময় <strong>প্রিভিউ</strong> দেখে নিশ্চিত হন।
        </p>
      </div>
    </div>
  )
}

/* ─── Tab 4: Notice & Routine ───────────────────────────────── */
function ExtraTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FeatureCard
        icon={<IconNotice size={20} color="#d97706" />}
        title="নোটিশ তৈরি"
        color="#d97706"
        steps={[
          'সাইডবার থেকে "নোটিশ" এ ক্লিক করুন',
          '"নতুন নোটিশ" বাটনে ক্লিক করুন',
          'নোটিশের শিরোনাম, তারিখ, বিষয়বস্তু লিখুন',
          'প্রিভিউ দেখুন এবং PDF ডাউনলোড করুন',
        ]}
        tip="স্কুল, কোচিং বা অফিসের যেকোনো নোটিশ পেশাদারভাবে তৈরি করুন।"
      />
      <FeatureCard
        icon={<IconRoutine size={20} color="#2563eb" />}
        title="ক্লাস রুটিন"
        color="#2563eb"
        steps={[
          '"ক্লাস রুটিন" মেনুতে যান',
          '"নতুন রুটিন" এ ক্লিক করুন',
          'শ্রেণি, সেকশন, সময়কাল, বিষয় ও শিক্ষক সেট করুন',
          'ছক আকারে সাপ্তাহিক রুটিন তৈরি হবে',
          'প্রিভিউ দেখে PDF ডাউনলোড করুন',
        ]}
        tip="শিক্ষকদের শিডিউলও আলাদাভাবে দেখতে পারবেন!"
      />
      <FeatureCard
        icon={<IconOmr size={20} color="#be123c" />}
        title="OMR শিট"
        color="#be123c"
        steps={[
          'প্রশ্নপত্র তৈরি করার পর OMR শিট জেনারেট করতে পারবেন',
          'পেপারের প্রিভিউ পেজ থেকে "OMR" অপশন সিলেক্ট করুন',
          'MCQ প্রশ্নের সংখ্যা অনুযায়ী OMR শিট তৈরি হবে',
          'PDF ডাউনলোড করে প্রিন্ট করুন',
        ]}
        tip="OMR শিট শুধুমাত্র Trial ও Pro ইউজারদের জন্য।"
      />
      <FeatureCard
        icon={<IconOnlineExam size={20} color="#059669" />}
        title="অনলাইন পরীক্ষা"
        color="#059669"
        steps={[
          'প্রশ্নপত্র তৈরি করার পর "অনলাইন পরীক্ষা" বাটনে ক্লিক করুন',
          'পরীক্ষার সময়কাল ও নিয়ম সেট করুন',
          'একটি লিংক পাবেন — শিক্ষার্থীদেরকে এই লিংক দিন',
          'শিক্ষার্থীরা লিংকে গিয়ে অনলাইনে পরীক্ষা দিতে পারবে',
          'পরীক্ষা শেষে "ফলাফল" পেজে সবার স্কোর দেখুন',
        ]}
      />
    </div>
  )
}

/* ─── Tab 5: Plans & Payment ────────────────────────────────── */
function PlanTab() {
  const plans = [
    {
      tier: 'ফ্রি (Free)',
      color: '#94a3b8',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.8}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
      features: ['১০টি প্রশ্নপত্র', '৩০টি প্রশ্ন ব্যাংকে সেভ', 'মাসে ৩০টি AI স্ক্যান', 'ওয়াটারমার্ক থাকবে'],
    },
    {
      tier: 'ট্রায়াল (Trial)',
      color: '#2563eb',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
      features: ['আনলিমিটেড প্রশ্নপত্র', 'আনলিমিটেড প্রশ্ন ব্যাংক', 'আনলিমিটেড AI স্ক্যান', 'OMR শিট', 'নিজের লোগো', 'ওয়াটারমার্ক ছাড়া'],
      popular: true,
    },
    {
      tier: 'প্রো (Pro)',
      color: '#7c3aed',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={1.8}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
      features: ['ট্রায়ালের সব ফিচার', 'সর্বোচ্চ ক্রেডিট ব্যালেন্স', 'প্রায়োরিটি সাপোর্ট'],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {plans.map((plan) => (
          <div key={plan.tier} style={{
            background: '#fff', border: `1.5px solid \${plan.color}33`,
            borderRadius: 16, padding: 16, display: 'flex',
            flexDirection: 'column', gap: 8, position: 'relative',
          }}>
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -8, right: 12,
                background: plan.color, color: '#fff',
                padding: '2px 8px', borderRadius: 6,
                fontSize: 8, fontWeight: 800, letterSpacing: '0.05em',
              }}>POPULAR</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {plan.icon}
              <h3 style={{ fontSize: 15, fontWeight: 800, color: plan.color, margin: 0 }}>
                {plan.tier}
              </h3>
            </div>
            <ul style={{ paddingLeft: 8, margin: 0, fontSize: 11.5, color: '#334155', lineHeight: 1.8, listStyle: 'none' }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconCheck size={12} color={plan.color} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment Steps */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 18, padding: 20, color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={1.8}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
            পেমেন্ট কীভাবে করবেন?
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'সাইডবার থেকে "Pricing" বা আপগ্রেড ব্যানারে ক্লিক করুন',
            'Pro প্ল্যান সিলেক্ট করুন',
            'পেমেন্ট নম্বর দেখাবে — bKash/Nagad/Rocket-এ টাকা পাঠান',
            'Transaction ID লিখুন এবং স্ক্রিনশট আপলোড করুন',
            'অ্যাডমিন ভেরিফাই করলে আপনার অ্যাকাউন্ট Pro হয়ে যাবে!',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#60a5fa', flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.55 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 14, padding: 14, textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.65 }}>
          🎁 নতুন অ্যাকাউন্ট খুললেই <strong>ফ্রি ট্রায়াল</strong> পাবেন! ট্রায়াল চলাকালীন সব Pro ফিচার ব্যবহার করুন।
        </p>
      </div>

      <div style={{
        background: '#fefce8', border: '1px solid #fde68a',
        borderRadius: 14, padding: 14, textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: '#854d0e', margin: 0, lineHeight: 1.65 }}>
          ⏱️ পেমেন্ট ভেরিফাই হতে ১-২৪ ঘন্টা সময় লাগতে পারে। ধৈর্য ধরুন।
        </p>
      </div>
    </div>
  )
}