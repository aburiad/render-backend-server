import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MathText } from '@/utils/mathRender'

/**
 * Bengali guide for the two math entry tools used across question editors:
 *   1. "fx" button — opens a LaTeX text editor (type math as code).
 *   2. Math-palette button — opens MathLive's tap-based virtual keyboard.
 *
 * Mobile-first responsive layout: single column on phone, two columns on
 * tablet+, with comfortable touch targets and copyable LaTeX snippets.
 */

const COMPARISON = [
  {
    accent: '#94a3b8',
    accentBg: '#f8fafc',
    title: 'fx বাটন',
    subtitle: 'LaTeX এডিটর',
    icon: <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: '#475569' }}>fx</span>,
    when: 'আপনি যদি LaTeX সিনট্যাক্স জানেন বা টাইপ করে দ্রুত গণিত লিখতে চান।',
    how: [
      'টেক্সট বক্সে যেখানে গণিত বসাতে চান, সেখানে কার্সর রাখুন।',
      '"fx" বাটনে ক্লিক করুন — মডাল খুলবে।',
      'টেক্সট ফিল্ডে LaTeX লিখুন (যেমন: \\frac{a}{b})।',
      'নিচে লাইভ প্রিভিউ দেখুন — সঠিক দেখালে "যোগ করুন" চাপুন।',
    ],
    pros: ['দ্রুত টাইপিং', 'কপি-পেস্ট সহজ', 'প্রফেশনাল ব্যবহার'],
  },
  {
    accent: '#2563eb',
    accentBg: '#eff6ff',
    title: 'কীবোর্ড বাটন',
    subtitle: 'ভিজ্যুয়াল মাথ প্যালেট',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <text x="3" y="11" fontFamily="serif" fontStyle="italic" fontSize="9" fontWeight="700" fill="#2563eb">π</text>
        <text x="13" y="11" fontFamily="serif" fontStyle="italic" fontSize="9" fontWeight="700" fill="#2563eb">x²</text>
        <text x="3" y="21" fontFamily="serif" fontSize="9" fontWeight="700" fill="#2563eb">√</text>
        <text x="13" y="21" fontFamily="serif" fontSize="9" fontWeight="700" fill="#2563eb">Σ</text>
      </svg>
    ),
    when: 'আপনি যদি LaTeX কোড না জানেন এবং সিম্বল ট্যাপ করে গণিত বানাতে চান।',
    how: [
      'টেক্সট বক্সে কার্সর রাখুন যেখানে গণিত বসাতে চান।',
      'নীল রঙের কীবোর্ড বাটনে ক্লিক করুন — মডাল + কীবোর্ড খুলবে।',
      'নিচের প্যালেট থেকে সিম্বল (∫, √, π, x², ভগ্নাংশ ইত্যাদি) ট্যাপ করুন।',
      'সাজানো হলে "যোগ করুন" চাপুন।',
    ],
    pros: ['কোড জানার দরকার নাই', 'টাচ-ফ্রেন্ডলি', 'নতুন ব্যবহারকারীদের জন্য সহজ'],
  },
]

const EXAMPLES = [
  {
    category: 'ভগ্নাংশ (Fraction)',
    items: [
      { latex: '\\frac{a}{b}', desc: 'সাধারণ ভগ্নাংশ' },
      { latex: '\\frac{x+1}{x-1}', desc: 'রাশি ভগ্নাংশ' },
      { latex: '\\frac{1}{2} + \\frac{1}{3}', desc: 'যোগফল' },
    ],
  },
  {
    category: 'সূচক (Exponent / Power)',
    items: [
      { latex: 'x^2', desc: 'বর্গ' },
      { latex: 'x^{n+1}', desc: 'মিশ্র সূচক' },
      { latex: '2^{10} = 1024', desc: 'বড় সূচক' },
    ],
  },
  {
    category: 'নিম্নসূচক (Subscript)',
    items: [
      { latex: 'a_1, a_2, \\ldots, a_n', desc: 'অনুক্রম' },
      { latex: 'x_{ij}', desc: 'মিশ্র নিম্নসূচক' },
      { latex: 'H_2O', desc: 'রাসায়নিক সংকেত' },
    ],
  },
  {
    category: 'মূল (Root / Radical)',
    items: [
      { latex: '\\sqrt{2}', desc: 'বর্গমূল' },
      { latex: '\\sqrt{x^2 + y^2}', desc: 'রাশি সহ' },
      { latex: '\\sqrt[3]{27} = 3', desc: 'ঘনমূল' },
    ],
  },
  {
    category: 'যোগ ও সমাকল (Sum / Integral)',
    items: [
      { latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', desc: 'যোগফল সূত্র' },
      { latex: '\\int_0^1 x^2 \\, dx', desc: 'নির্দিষ্ট সমাকল' },
      { latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', desc: 'সীমা' },
    ],
  },
  {
    category: 'সমীকরণ ও তুলনা (Equation / Compare)',
    items: [
      { latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', desc: 'দ্বিঘাত সূত্র' },
      { latex: 'a^2 + b^2 = c^2', desc: 'পিথাগোরাস' },
      { latex: 'x \\leq y \\leq z', desc: 'কম-সমান' },
    ],
  },
  {
    category: 'সেট ও সম্ভাবনা (Set / Probability)',
    items: [
      { latex: 'A \\cup B', desc: 'ইউনিয়ন' },
      { latex: 'x \\in \\{1, 2, 3\\}', desc: 'সদস্য' },
      { latex: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}', desc: 'শর্তসাপেক্ষ' },
    ],
  },
  {
    category: 'ত্রিকোণমিতি (Trigonometry)',
    items: [
      { latex: '\\sin^2\\theta + \\cos^2\\theta = 1', desc: 'মৌলিক সূত্র' },
      { latex: '\\tan(A+B) = \\frac{\\tan A + \\tan B}{1 - \\tan A \\tan B}', desc: 'যোগের সূত্র' },
      { latex: '\\sin 60° = \\frac{\\sqrt{3}}{2}', desc: 'মান' },
    ],
  },
]

const TIPS = [
  {
    title: 'বাংলা ও গণিত একসাথে',
    body: 'আপনি বাংলা টেক্সটের মাঝখানে $...$ দিয়ে গণিত বসাতে পারেন। উদাহরণ:',
    sample: 'নিচের সমীকরণ সমাধান করো: $x^2 - 5x + 6 = 0$ এবং উত্তর লেখো।',
  },
  {
    title: 'ডিসপ্লে গণিত (বড় করে)',
    body: 'গণিতকে আলাদা লাইনে বড় করে দেখাতে চাইলে $$...$$ (ডবল ডলার) ব্যবহার করুন:',
    sample: 'সূত্র: $$E = mc^2$$',
  },
  {
    title: 'গ্রিক বর্ণ',
    body: 'গ্রিক বর্ণ লিখতে ব্যাকস্ল্যাশ দিয়ে নাম লিখুন: \\alpha = α, \\beta = β, \\theta = θ, \\pi = π, \\Sigma = Σ, \\Delta = Δ',
    sample: 'কোণ $\\theta = 30°$ এবং $\\pi \\approx 3.1416$',
  },
  {
    title: 'বিদ্যমান গণিত এডিট',
    body: 'যদি কোনো $...$ গণিতের ভেতরে কার্সর রেখে fx বা কীবোর্ড বাটন চাপেন, সেটি প্রি-ফিল্ড হয়ে এডিট মোডে খুলবে — "যোগ করুন" এর বদলে "আপডেট করুন" দেখাবে।',
  },
  {
    title: 'প্রিভিউ চেক করুন',
    body: 'মডালে নিচের প্রিভিউ অংশে যা দেখাচ্ছে, PDF-এও ঠিক সেটাই আসবে। সব সিম্বল ঠিক দেখাচ্ছে কিনা প্রিভিউতে যাচাই করুন।',
  },
]

export default function LearningHub() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: 960, margin: '0 auto' }}
    >
      {/* Hero */}
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #eff6ff, #ede9fe)',
            border: '1px solid #dbeafe',
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Learning Hub
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.25 }}>
          গণিত কীবোর্ড — ব্যবহার গাইড
        </h1>
        <p style={{ fontSize: 'clamp(13px, 2.4vw, 15px)', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          প্রশ্নপত্র তৈরির সময় গণিত লিখার দুটি উপায় আছে। দুটোর তফাত, ব্যবহার এবং উদাহরণ — সব এক জায়গায়।
        </p>
      </header>

      {/* Two-method comparison */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeading number="১" title="দুটি ইনপুট পদ্ধতি — তফাত" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            marginTop: 12,
          }}
        >
          {COMPARISON.map((c) => (
            <article
              key={c.title}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              {/* Button preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: c.accentBg,
                    border: `1.5px solid ${c.accent}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{c.title}</h3>
                  <p style={{ fontSize: 12, color: c.accent, margin: '2px 0 0', fontWeight: 600 }}>{c.subtitle}</p>
                </div>
              </div>

              {/* When to use */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                  কখন ব্যবহার করবেন
                </p>
                <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.55 }}>{c.when}</p>
              </div>

              {/* How */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
                  কীভাবে ব্যবহার করবেন
                </p>
                <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                  {c.how.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Pros chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                {c.pros.map((p) => (
                  <span
                    key={p}
                    style={{
                      fontSize: 11,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: c.accentBg,
                      color: c.accent,
                      fontWeight: 600,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Examples grid */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeading number="২" title="সাধারণ গণিতের উদাহরণ" />
        <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 14px', lineHeight: 1.6 }}>
          নিচের যেকোনো নমুনায় ক্লিক করে LaTeX কোড কপি করতে পারেন — তারপর fx এডিটরে পেস্ট করুন।
        </p>
        <div style={{ display: 'grid', gap: 16 }}>
          {EXAMPLES.map((cat) => (
            <ExampleCategory key={cat.category} category={cat.category} items={cat.items} />
          ))}
        </div>
      </section>

      {/* Tips */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeading number="৩" title="টিপস ও কৌশল" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {TIPS.map((t) => (
            <TipCard key={t.title} {...t} />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div
        style={{
          padding: 16,
          background: 'linear-gradient(135deg, #eff6ff, #ede9fe)',
          border: '1px solid #dbeafe',
          borderRadius: 16,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 13, color: '#1e293b', margin: 0, lineHeight: 1.6 }}>
          ⚠️ গণিতে <strong>একটি মাত্র ভুল</strong> সিম্বল (+, −, ×, ÷, ব্রাকেট) ব্যবসায় ক্ষতি ও সুনাম নষ্টের কারণ হতে পারে।
          সবসময় প্রিভিউতে যাচাই করুন।
        </p>
      </div>
    </motion.div>
  )
}

function SectionHeading({ number, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          minWidth: 28, height: 28, borderRadius: 8,
          background: '#0f172a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800,
        }}
      >
        {number}
      </span>
      <h2 style={{ fontSize: 'clamp(16px, 2.6vw, 19px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
        {title}
      </h2>
    </div>
  )
}

function ExampleCategory({ category, items }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 14,
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>{category}</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 10,
        }}
      >
        {items.map((it) => (
          <ExampleCard key={it.latex} latex={it.latex} desc={it.desc} />
        ))}
      </div>
    </div>
  )
}

function ExampleCard({ latex, desc }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latex)
      setCopied(true)
      toast.success('LaTeX কপি হয়েছে', { duration: 1500 })
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('কপি করা যায়নি')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-press"
      style={{
        textAlign: 'left',
        background: '#f8fafc',
        border: `1.5px solid ${copied ? '#22c55e' : '#e2e8f0'}`,
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
    >
      {/* Rendered preview — uses the SAME MathText that PDF/preview pages use */}
      <div
        style={{
          minHeight: 38,
          padding: '8px 10px',
          background: '#fff',
          border: '1px dashed #cbd5e1',
          borderRadius: 8,
          fontSize: 16,
          lineHeight: 1.6,
          color: '#0f172a',
          overflowX: 'auto',
        }}
      >
        <MathText text={`$${latex}$`} />
      </div>

      {/* Description */}
      <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', margin: 0 }}>{desc}</p>

      {/* LaTeX source */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          color: '#475569',
          background: '#0f172a',
          padding: '6px 8px',
          borderRadius: 6,
          overflowX: 'auto',
        }}
      >
        <code style={{ color: '#e2e8f0', flex: 1, whiteSpace: 'nowrap' }}>{latex}</code>
        <span style={{ fontSize: 10, color: copied ? '#22c55e' : '#94a3b8', fontWeight: 700, flexShrink: 0 }}>
          {copied ? '✓' : '📋'}
        </span>
      </div>
    </button>
  )
}

function TipCard({ title, body, sample }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h4>
      <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.6 }}>{body}</p>
      {sample && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: 10,
            padding: 10,
            fontSize: 14,
            lineHeight: 1.7,
            color: '#0f172a',
          }}
        >
          <MathText text={sample} />
        </div>
      )}
    </div>
  )
}
