import { MathText } from '@/utils/mathRender'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Learning Hub — প্রশ্নশালার সম্পূর্ণ ব্যবহার টিউটোরিয়াল (বাংলায়)
 * সহজ ভাষায়, সংক্ষেপে, যেন সবাই বুঝতে পারে।
 */

/* ─── Tabs ──────────────────────────────────────────────────── */
const TABS = [
  { id: 'start', label: 'শুরু করুন', emoji: '🚀' },
  { id: 'paper', label: 'প্রশ্নপত্র', emoji: '📝' },
  { id: 'math', label: 'গণিত লেখা', emoji: '📐' },
  { id: 'extra', label: 'নোটিশ ও রুটিন', emoji: '📋' },
  { id: 'plan', label: 'প্ল্যান ও পেমেন্ট', emoji: '💎' },
]

/* ─── Tutorial Data ─────────────────────────────────────────── */

// Tab 1: Getting Started
const GET_STARTED = {
  welcome: `প্রশ্নশালা (AI Question Hub) হলো একটি স্মার্ট টুল — শিক্ষক, স্কুল, কোচিং সেন্টার ও প্রাইভেট টিউটরদের জন্য। এখানে আপনি মিনিটের মধ্যে পেশাদার প্রশ্নপত্র, নোটিশ, ক্লাস রুটিন তৈরি করতে পারবেন।`,
  steps: [
    {
      title: 'অ্যাকাউন্ট খুলুন',
      body: 'ইমেইল ও পাসওয়ার্ড দিয়ে রেজিস্টার করুন, অথবা Google অ্যাকাউন্ট দিয়ে সরাসরি লগইন করুন। রোল সিলেক্ট করুন: স্কুল / কোচিং / ভর্তি প্রস্তুতি / প্রাইভেট টিউটর।',
      icon: '👤',
    },
    {
      title: 'ড্যাশবোর্ড দেখুন',
      body: 'লগইন করলে ড্যাশবোর্ডে আপনার পরিসংখ্যান দেখাবে — কয়টি পেপার বানিয়েছেন, কয়টি প্রশ্ন আছে, ক্রেডিট ব্যালেন্স কত। "দ্রুত কাজ" থেকে সরাসরি যেকোনো ফিচারে যেতে পারবেন।',
      icon: '📊',
    },
    {
      title: 'পেপার তৈরি করুন',
      body: '"নতুন প্রশ্নপত্র" বাটনে ক্লিক করে প্রশ্নপত্র তৈরি শুরু করুন। বিষয়, ক্লাস, পরীক্ষার নাম দিয়ে হেডার সেটআপ করুন, তারপর প্রশ্ন যোগ করুন।',
      icon: '✏️',
    },
    {
      title: 'PDF ডাউনলোড',
      body: 'প্রশ্নপত্র তৈরি শেষে "প্রিভিউ" তে গিয়ে PDF হিসেবে ডাউনলোড করুন অথবা সরাসরি প্রিন্ট করুন।',
      icon: '🖨️',
    },
  ],
}

// Tab 2: Question Paper
const PAPER_GUIDE = [
  {
    id: 'create',
    title: 'প্রশ্নপত্র তৈরি',
    color: '#2563eb',
    steps: [
      'সাইডবার থেকে "নতুন প্রশ্নপত্র" এ ক্লিক করুন।',
      'পরীক্ষার নাম, প্রতিষ্ঠানের নাম, ক্লাস, বিষয়, সময়, পূর্ণমান ইত্যাদি দিন।',
      'নিচে "প্রশ্ন যোগ করুন" বাটনে ক্লিক করে প্রশ্নের ধরন সিলেক্ট করুন (MCQ, CQ, সংক্ষিপ্ত, বিস্তারিত ইত্যাদি)।',
      'প্রশ্ন লিখুন বা AI দিয়ে জেনারেট করুন।',
      'সব শেষে "সেভ" করুন, তারপর প্রিভিউ দেখে PDF ডাউনলোড করুন।',
    ],
  },
  {
    id: 'ai-scan',
    title: 'AI স্ক্যান (ছবি → প্রশ্ন)',
    color: '#7c3aed',
    steps: [
      'বইয়ের পাতা বা প্রশ্নের ছবি তুলুন (ফোনের ক্যামেরা দিয়ে)।',
      '"AI স্ক্যান" পেজে গিয়ে ছবি আপলোড করুন।',
      'AI স্বয়ংক্রিয়ভাবে ছবি থেকে প্রশ্ন চিনে নিবে এবং এডিটরে বসিয়ে দিবে।',
      'প্রয়োজনে প্রশ্ন এডিট করুন, তারপর সেভ করুন।',
    ],
    tip: 'AI স্ক্যান-এ মাসে ৩০টি ফ্রি স্ক্যান পাবেন। Pro তে আনলিমিটেড!',
  },
  {
    id: 'book-gen',
    title: 'বই থেকে প্রশ্ন জেনারেট',
    color: '#059669',
    steps: [
      'পেপার এডিটরে "বই" বাটনে ক্লিক করুন।',
      'বইয়ের নাম, ক্লাস, অধ্যায়, প্রশ্নের ধরন ও সংখ্যা দিন।',
      'AI আপনার জন্য প্রশ্ন তৈরি করে দিবে।',
      'পছন্দ মতো এডিট করে পেপারে যোগ করুন।',
    ],
  },
  {
    id: 'qbank',
    title: 'প্রশ্ন ব্যাংক',
    color: '#d97706',
    steps: [
      'আপনি যেকোনো প্রশ্ন "প্রশ্ন ব্যাংক"-এ সেভ করতে পারেন।',
      '"প্রশ্ন ব্যাংক" পেজে গেলে আপনার সেভ করা সব প্রশ্ন দেখাবে।',
      'বিষয় ও অধ্যায় অনুযায়ী ফিল্টার করে দেখুন।',
      'যেকোনো প্রশ্ন নতুন পেপারে "ইমপোর্ট" করে ব্যবহার করুন — বারবার লিখতে হবে না!',
    ],
    tip: 'ফ্রি ইউজাররা ৩০টি প্রশ্ন ব্যাংকে সেভ করতে পারবেন। Pro-তে আনলিমিটেড!',
  },
  {
    id: 'qtypes',
    title: 'প্রশ্নের ধরন',
    color: '#be123c',
    types: [
      { name: 'MCQ', desc: 'বহুনির্বাচনি — ৪টি অপশন সহ', emoji: '🔘' },
      { name: 'CQ', desc: 'সৃজনশীল / রচনামূলক প্রশ্ন', emoji: '✍️' },
      { name: 'সংক্ষিপ্ত', desc: 'ছোট উত্তরের প্রশ্ন', emoji: '📌' },
      { name: 'বিস্তারিত', desc: 'বড় উত্তরের প্রশ্ন', emoji: '📖' },
      { name: 'শূন্যস্থান পূরণ', desc: 'ফিল-ইন-দ্য-ব্ল্যাংক', emoji: '🔤' },
      { name: 'মিলানো', desc: 'ম্যাচিং / জোড়া মেলানো', emoji: '🔗' },
      { name: 'সাজানো', desc: 'বিন্যাস্ত / সিরিয়াল', emoji: '🔢' },
      { name: 'ছক', desc: 'টেবিল / ছক পূরণ', emoji: '📊' },
      { name: 'অনুবাদ', desc: 'ট্রান্সলেশন', emoji: '🌐' },
    ],
  },
]

// Tab 3: Math (simplified from existing)
const MATH_COMPARISON = [
  {
    title: 'fx বাটন (LaTeX)',
    when: 'আপনি LaTeX কোড জানেন বা টাইপ করে দ্রুত গণিত লিখতে চান।',
    steps: [
      'টেক্সট বক্সে কার্সর রাখুন যেখানে গণিত বসাবেন।',
      '"fx" বাটনে ক্লিক করুন।',
      'LaTeX কোড লিখুন (যেমন: \\frac{a}{b})।',
      'নিচে প্রিভিউ দেখুন, ঠিক থাকলে "যোগ করুন" চাপুন।',
    ],
    accent: '#94a3b8',
  },
  {
    title: 'কীবোর্ড বাটন',
    when: 'আপনি LaTeX কোড জানেন না — টাচ করে সিম্বল বাছাই করতে চান।',
    steps: [
      'টেক্সট বক্সে কার্সর রাখুন।',
      'নীল কীবোর্ড বাটনে ক্লিক করুন।',
      'প্যালেট থেকে সিম্বল (∫, √, π, x², ভগ্নাংশ) ট্যাপ করুন।',
      'সাজানো হলে "যোগ করুন" চাপুন।',
    ],
    accent: '#2563eb',
  },
]

const MATH_EXAMPLES = [
  { latex: '\\frac{a}{b}', desc: 'ভগ্নাংশ' },
  { latex: 'x^2 + y^2 = z^2', desc: 'সূচক/ঘাত' },
  { latex: '\\sqrt{2}', desc: 'বর্গমূল' },
  { latex: 'a_1 + a_2', desc: 'নিম্নসূচক' },
  { latex: '\\sum_{i=1}^{n} i', desc: 'সিগমা/যোগফল' },
  { latex: '\\int_0^1 x \\, dx', desc: 'ইন্টিগ্রেশন' },
  { latex: '\\sin^2\\theta + \\cos^2\\theta = 1', desc: 'ত্রিকোণমিতি' },
  { latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', desc: 'দ্বিঘাত সূত্র' },
]

const MATH_TIPS = [
  { title: 'বাংলা ও গণিত একসাথে', body: 'বাংলা টেক্সটের মাঝে $...$ দিয়ে গণিত বসান:', sample: 'সমীকরণ সমাধান করো: $x^2 - 5x + 6 = 0$' },
  { title: 'বড় করে দেখাতে চাইলে', body: '$$...$$ (ডবল ডলার) ব্যবহার করুন:', sample: 'সূত্র: $$E = mc^2$$' },
]

// Tab 4: Notice & Routine
const EXTRA_GUIDE = [
  {
    id: 'notice',
    title: 'নোটিশ তৈরি',
    emoji: '📢',
    color: '#d97706',
    steps: [
      'সাইডবার থেকে "নোটিশ" এ ক্লিক করুন।',
      '"নতুন নোটিশ" বাটনে ক্লিক করুন।',
      'নোটিশের শিরোনাম, তারিখ, বিষয়বস্তু লিখুন।',
      'প্রিভিউ দেখুন এবং PDF ডাউনলোড করুন।',
    ],
    tip: 'স্কুল, কোচিং বা অফিসের যেকোনো নোটিশ পেশাদারভাবে তৈরি করুন।',
  },
  {
    id: 'routine',
    title: 'ক্লাস রুটিন',
    emoji: '📅',
    color: '#2563eb',
    steps: [
      '"ক্লাস রুটিন" মেনুতে যান।',
      '"নতুন রুটিন" এ ক্লিক করুন।',
      'শ্রেণি, সেকশন, সময়কাল, বিষয় ও শিক্ষক সেট করুন।',
      'ছক আকারে সাপ্তাহিক রুটিন তৈরি হবে।',
      'প্রিভিউ দেখে PDF ডাউনলোড করুন।',
    ],
    tip: 'শিক্ষকদের শিডিউলও আলাদাভাবে দেখতে পারবেন!',
  },
  {
    id: 'omr',
    title: 'OMR শিট',
    emoji: '📝',
    color: '#be123c',
    steps: [
      'যেকোনো প্রশ্নপত্র তৈরি করার পর OMR শিট জেনারেট করতে পারবেন।',
      'পেপারের প্রিভিউ পেজ থেকে "OMR" অপশন সিলেক্ট করুন।',
      'MCQ প্রশ্নের সংখ্যা অনুযায়ী OMR শিট তৈরি হবে।',
      'PDF ডাউনলোড করে প্রিন্ট করুন।',
    ],
    tip: 'OMR শিট শুধুমাত্র Trial ও Pro ইউজারদের জন্য।',
  },
  {
    id: 'exam',
    title: 'অনলাইন পরীক্ষা',
    emoji: '💻',
    color: '#059669',
    steps: [
      'প্রশ্নপত্র তৈরি করার পর "অনলাইন পরীক্ষা" বাটনে ক্লিক করুন।',
      'পরীক্ষার সময়কাল ও নিয়ম সেট করুন।',
      'একটি লিংক পাবেন — শিক্ষার্থীদেরকে এই লিংক দিন।',
      'শিক্ষার্থীরা লিংকে গিয়ে অনলাইনে পরীক্ষা দিতে পারবে।',
      'পরীক্ষা শেষে "ফলাফল" পেজে সবার স্কোর দেখুন।',
    ],
  },
]

// Tab 5: Plans & Payment
const PLAN_INFO = [
  {
    tier: 'ফ্রি (Free)',
    color: '#94a3b8',
    features: [
      '১০টি প্রশ্নপত্র',
      '৩০টি প্রশ্ন ব্যাংকে সেভ',
      'মাসে ৩০টি AI স্ক্যান',
      'ওয়াটারমার্ক থাকবে',
    ],
  },
  {
    tier: 'ট্রায়াল (Trial)',
    color: '#2563eb',
    features: [
      'আনলিমিটেড প্রশ্নপত্র',
      'আনলিমিটেড প্রশ্ন ব্যাংক',
      'আনলিমিটেড AI স্ক্যান',
      'OMR শিট',
      'নিজের লোগো',
      'ওয়াটারমার্ক ছাড়া',
    ],
  },
  {
    tier: 'প্রো (Pro)',
    color: '#7c3aed',
    features: [
      'ট্রায়ালের সব ফিচার',
      'সর্বোচ্চ ক্রেডিট ব্যালেন্স',
      'প্রায়োরিটি সাপোর্ট',
    ],
  },
]

const PAYMENT_STEPS = [
  'সাইডবার থেকে "Pricing" বা আপগ্রেড ব্যানারে ক্লিক করুন।',
  'Pro প্ল্যান সিলেক্ট করুন।',
  'পেমেন্ট নম্বর দেখাবে — bKash/Nagad/Rocket-এ টাকা পাঠান।',
  'Transaction ID লিখুন এবং স্ক্রিনশট আপলোড করুন।',
  'অ্যাডমিন ভেরিফাই করলে আপনার অ্যাকাউন্ট Pro হয়ে যাবে!',
]

/* ─── Main Component ────────────────────────────────────────── */
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
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 12px',
            background: 'linear-gradient(135deg, #eff6ff, #ede9fe)',
            border: '1px solid #dbeafe', borderRadius: 999, marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12 }}>🎓</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Learning Hub
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.25 }}>
          প্রশ্নশালা — ব্যবহার টিউটোরিয়াল
        </h1>
        <p style={{ fontSize: 'clamp(12px, 2.2vw, 14px)', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          সহজ বাংলায় সব ফিচার শিখুন। যেকোনো ট্যাবে ক্লিক করুন।
        </p>
      </header>

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
          marginBottom: 20, scrollbarWidth: 'none',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 12,
              background: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
              color: activeTab === tab.id ? '#fff' : '#475569',
              border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          borderRadius: 20, padding: 20, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 80, height: 80,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }} />
        <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, position: 'relative' }}>
          {GET_STARTED.welcome}
        </p>
      </div>

      {/* Steps */}
      {GET_STARTED.steps.map((step, i) => (
        <div
          key={i}
          style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 16, padding: 16,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}
        >
          <div style={{
            minWidth: 40, height: 40, borderRadius: 12,
            background: '#f1f5f9', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            {step.icon}
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              {step.title}
            </h3>
            <p style={{ fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.65 }}>
              {step.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Tab 2: Question Paper ─────────────────────────────────── */
function PaperTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {PAPER_GUIDE.map((section) => (
        <section
          key={section.id}
          style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 16, padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${section.color}15`, border: `1.5px solid ${section.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 15 }}>{section.id === 'create' ? '📝' : section.id === 'ai-scan' ? '🤖' : section.id === 'book-gen' ? '📚' : section.id === 'qbank' ? '🏦' : '🏷️'}</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {section.title}
            </h3>
          </div>

          {/* Steps list */}
          {section.steps && (
            <ol style={{ paddingLeft: 18, margin: '0 0 10px', fontSize: 12.5, color: '#334155', lineHeight: 1.75 }}>
              {section.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}

          {/* Question types grid */}
          {section.types && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {section.types.map((t) => (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', background: '#f8fafc',
                  borderRadius: 10, border: '1px solid #e2e8f0',
                }}>
                  <span style={{ fontSize: 14 }}>{t.emoji}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tip */}
          {section.tip && (
            <div style={{
              marginTop: 8, padding: '8px 12px',
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 10, fontSize: 11.5, color: '#92400e', lineHeight: 1.55,
            }}>
              💡 {section.tip}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

/* ─── Tab 3: Math ───────────────────────────────────────────── */
function MathTab({ copiedIdx, onCopy }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Comparison */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12,
      }}>
        {MATH_COMPARISON.map((c) => (
          <div key={c.title} style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 16, padding: 16,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              {c.title}
            </h3>
            <p style={{ fontSize: 11.5, color: '#64748b', margin: '0 0 10px', lineHeight: 1.55 }}>
              {c.when}
            </p>
            <ol style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: '#334155', lineHeight: 1.75 }}>
              {c.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        ))}
      </div>

      {/* Examples */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
          ক্লিক করলেই LaTeX কপি হবে
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8,
        }}>
          {MATH_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCopy(ex.latex, i)}
              style={{
                textAlign: 'left', background: '#f8fafc',
                border: `1.5px solid ${copiedIdx === i ? '#22c55e' : '#e2e8f0'}`,
                borderRadius: 10, padding: 10, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              <div style={{
                minHeight: 32, padding: '4px 6px', background: '#fff',
                border: '1px dashed #cbd5e1', borderRadius: 6,
                fontSize: 14, lineHeight: 1.5, color: '#0f172a', marginBottom: 4,
              }}>
                <MathText text={`$${ex.latex}$`} />
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
      {MATH_TIPS.map((t) => (
        <div key={t.title} style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 14, padding: 14,
        }}>
          <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{t.title}</h4>
          <p style={{ fontSize: 12, color: '#334155', margin: '0 0 8px', lineHeight: 1.6 }}>{t.body}</p>
          <div style={{
            background: '#f8fafc', border: '1px dashed #cbd5e1',
            borderRadius: 10, padding: 10, fontSize: 13, lineHeight: 1.7, color: '#0f172a',
          }}>
            <MathText text={t.sample} />
          </div>
        </div>
      ))}

      {/* Warning */}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {EXTRA_GUIDE.map((section) => (
        <section
          key={section.id}
          style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 16, padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{section.emoji}</span>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {section.title}
            </h3>
          </div>
          <ol style={{ paddingLeft: 18, margin: '0 0 8px', fontSize: 12.5, color: '#334155', lineHeight: 1.75 }}>
            {section.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {section.tip && (
            <div style={{
              padding: '8px 12px', background: '#fffbeb',
              border: '1px solid #fde68a', borderRadius: 10,
              fontSize: 11.5, color: '#92400e', lineHeight: 1.55,
            }}>
              💡 {section.tip}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

/* ─── Tab 5: Plans & Payment ────────────────────────────────── */
function PlanTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Plan Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12,
      }}>
        {PLAN_INFO.map((plan) => (
          <div key={plan.tier} style={{
            background: '#fff', border: `1.5px solid ${plan.color}33`,
            borderRadius: 16, padding: 16, display: 'flex',
            flexDirection: 'column', gap: 10,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: plan.color, margin: 0 }}>
              {plan.tier}
            </h3>
            <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: '#334155', lineHeight: 1.8 }}>
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment Steps */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 20, padding: 20, color: '#fff',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px' }}>
          💳 পেমেন্ট কীভাবে করবেন?
        </h3>
        <ol style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, lineHeight: 1.85, color: '#e2e8f0' }}>
          {PAYMENT_STEPS.map((step, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{step}</li>
          ))}
        </ol>
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