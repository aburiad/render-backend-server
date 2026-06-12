import { useEffect, useState } from 'react'
import api from '@/services/api'

const LIMIT_META = {
  ai: {
    label: 'AI স্ক্যান + Book Generate',
    icon: '✨',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  payment: {
    label: 'Manual Payment Submit',
    icon: '💸',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  userKey: {
    label: 'AI Key Save / Test',
    icon: '🔑',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
}

function formatResetIn(resetAt) {
  if (!resetAt) return 'এখনো ব্যবহার করেননি'
  const ms = new Date(resetAt).getTime() - Date.now()
  if (ms <= 0) return 'এখনই reset হবে'
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} মিনিট পর reset`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h} ঘন্টা ${m} মিনিট পর reset` : `${h} ঘন্টা পর reset`
}

function formatWindow(ms) {
  const hours = ms / 3600000
  return hours >= 1 ? `${hours} ঘন্টা` : `${Math.round(ms / 60000)} মিনিট`
}

export default function LimitsWidget() {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      api.get('/limits/status')
        .then(({ data }) => {
          if (!cancelled) setUsage(data.usage)
        })
        .catch(() => { /* silent — dashboard widget */ })
        .finally(() => { if (!cancelled) setLoading(false) })
    }
    load()
    // refresh every 30s while dashboard open — counters drift between instances anyway
    const interval = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={{ ...skeletonStyle, width: '40%' }} />
        <div style={{ ...skeletonStyle, width: '70%', height: 8, marginTop: 8 }} />
      </div>
    )
  }

  if (!usage) return null

  const isUnlimited = usage.ai.unlimited === true
  const isBYO = usage.ai.mode === 'byo'
  const aiPct = isUnlimited ? 0 : (usage.ai.used / (usage.ai.max || 1)) * 100
  const aiNearLimit = !isUnlimited && aiPct >= 70

  return (
    <div style={cardStyle}>
      {/* Compact — always show AI usage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{LIMIT_META.ai.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              {LIMIT_META.ai.label}
              {isBYO && (
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                  background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
                  letterSpacing: '0.04em',
                }}>
                  🔑 OWN KEY
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
              {isUnlimited
                ? 'নিজের API key — কোনো limit নেই'
                : `${formatResetIn(usage.ai.resetAt)} • প্রতি ${formatWindow(usage.ai.windowMs)}`}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: isUnlimited ? '#16a34a' : aiNearLimit ? '#dc2626' : LIMIT_META.ai.color,
            fontFamily: 'var(--font-english)',
          }}
        >
          {isUnlimited ? (
            <span style={{ fontSize: 18 }}>∞</span>
          ) : (
            <>
              {usage.ai.used}<span style={{ color: '#94a3b8', fontSize: 11 }}>/{usage.ai.max}</span>
            </>
          )}
        </div>
      </div>

      {!isUnlimited && (
        <ProgressBar
          value={usage.ai.used}
          max={usage.ai.max}
          color={aiNearLimit ? '#dc2626' : LIMIT_META.ai.color}
        />
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-press"
        style={{
          marginTop: 10,
          width: '100%',
          padding: '6px 10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 700,
          color: '#475569',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {expanded ? 'কম দেখান' : 'সব limit দেখুন'}
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LimitRow data={usage.payment} meta={LIMIT_META.payment} />
          <LimitRow data={usage.userKey} meta={LIMIT_META.userKey} />
          {isBYO ? (
            <div style={{
              fontSize: 10,
              color: '#047857',
              padding: '6px 8px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              lineHeight: 1.5,
            }}>
              ✓ আপনি নিজের API key ব্যবহার করছেন। তাই {isUnlimited ? 'কোনো limit নেই' : 'বেশি quota পাচ্ছেন'}।
            </div>
          ) : (
            <div style={{
              fontSize: 10,
              color: '#7c2d12',
              padding: '6px 8px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 8,
              lineHeight: 1.5,
            }}>
              💡 আরো quota চান? <a href="/settings/ai-keys" style={{ color: '#c2410c', fontWeight: 700, textDecoration: 'underline' }}>নিজের AI key যোগ করুন</a> — সেটিংস থেকে।
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LimitRow({ data, meta }) {
  const pct = (data.used / data.max) * 100
  const nearLimit = pct >= 70
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 14 }}>{meta.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>
          {meta.label}
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>
          {formatResetIn(data.resetAt)}
        </div>
      </div>
      <div style={{
        fontSize: 12,
        fontWeight: 800,
        color: nearLimit ? '#dc2626' : meta.color,
        fontFamily: 'var(--font-english)',
        flexShrink: 0,
      }}>
        {data.used}<span style={{ color: '#94a3b8', fontSize: 10 }}>/{data.max}</span>
      </div>
    </div>
  )
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{
      width: '100%',
      height: 8,
      background: '#f1f5f9',
      borderRadius: 999,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        background: color,
        transition: 'width 0.4s ease, background 0.2s',
        borderRadius: 999,
      }} />
    </div>
  )
}

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: '12px 14px',
  border: '1px solid #f1f5f9',
  boxShadow: 'var(--shadow-card)',
}

const skeletonStyle = {
  height: 14,
  background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
  backgroundSize: '200% 100%',
  borderRadius: 6,
  animation: 'shimmer 1.5s infinite',
}
