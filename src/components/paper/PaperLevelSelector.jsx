import { useNavigate } from 'react-router-dom'
import usePaperStore from '@/store/paperStore'

export default function PaperLevelSelector() {
  const navigate = useNavigate()
  const clearPaper = usePaperStore((s) => s.clearPaper)

  const levels = [
    {
      id: 'primary',
      nameBn: 'প্রাথমিক',
      subtitleBn: 'নার্সারি — শ্রেণি ৫',
      icon: '🧸',
      gradient: 'linear-gradient(145deg, var(--accent) 0%, #6d28d9 100%)',
      glow: 'rgba(124, 58, 237, 0.38)',
      features: ['বড় ফন্ট', 'ছবি সহ প্রশ্ন', 'মিলকরণ', 'হাতের লেখা'],
    },
    {
      id: 'higher',
      nameBn: 'মাধ্যমিক',
      subtitleBn: 'শ্রেণি ৬ — শ্রেণি ১০',
      icon: '📚',
      gradient: 'linear-gradient(145deg, var(--primary) 0%, var(--primary-dark) 100%)',
      glow: 'var(--primary-glow)',
      features: ['এমসিকিউ', 'সৃজনশীল', 'ম্যাথ', 'বোর্ড ফরম্যাট'],
    },
  ]

  const handleSelect = (level) => {
    clearPaper()
    if (level.id === 'primary') {
      navigate('/papers/new/primary', { state: { level: 'primary', template: 'kids-worksheet' } })
    } else {
      navigate('/papers/new/editor', { state: { level: 'higher', template: 'default' } })
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 16px 16px',
      background: 'var(--bg-base)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          width: 46, height: 46,
          borderRadius: 14,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px',
          fontSize: 22,
        }}>📝</div>
        <h1 style={{
          fontSize: 18, fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 4px',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          নতুন প্রশ্নপত্র
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
          শিক্ষার স্তর বেছে নিন
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        width: '100%',
        maxWidth: 420,
      }}>
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => handleSelect(level)}
            className="btn-press"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              padding: 0,
              borderRadius: 18,
              border: 'none',
              cursor: 'pointer',
              overflow: 'hidden',
              background: level.gradient,
              boxShadow: `0 6px 20px ${level.glow}, 0 2px 6px rgba(0,0,0,0.1)`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
              e.currentTarget.style.boxShadow = `0 14px 36px ${level.glow}, 0 4px 10px rgba(0,0,0,0.12)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = `0 6px 20px ${level.glow}, 0 2px 6px rgba(0,0,0,0.1)`
            }}
          >
            {/* Shine */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.13) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            {/* Body */}
            <div style={{ padding: 14 }}>
              {/* Icon */}
              <div style={{
                width: 40, height: 40,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.22)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {level.icon}
              </div>

              {/* Title */}
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', marginTop: 10 }}>
                {level.nameBn}
              </div>

              {/* Subtitle */}
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.72)', lineHeight: 1.4, marginTop: 4 }}>
                {level.subtitleBn}
              </div>

              {/* Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                {level.features.map((f, i) => (
                  <span key={i} style={{
                    padding: '3px 7px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.17)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    fontSize: 9, fontWeight: 700,
                    color: '#fff',
                  }}>{f}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 500, lineHeight: 1.4 }}>
        যেকোনো সময় পরিবর্তন করা যাবে
      </p>
    </div>
  )
}
