import ProGate from '@/components/shared/ProGate'
import useAuthStore from '@/store/authStore'
import usePaperStore from '@/store/paperStore'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

// InputGroup defined outside component to prevent recreation on each render
function InputGroup({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ 
        display: 'block', fontSize: 11, fontWeight: 700, 
        color: '#64748b', marginBottom: 6, paddingLeft: 4,
        textTransform: 'uppercase', letterSpacing: '0.02em'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const textInputStyle = {
  width: '100%', padding: '12px 14px', background: '#f8fafc',
  borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 14,
  color: '#1e293b', outline: 'none', transition: 'all 0.2s',
  fontWeight: 500
}

export default function PaperSetupForm() {
  const paper = usePaperStore((s) => s.currentPaper)
  const updatePaper = usePaperStore((s) => s.updatePaper)
  const user = useAuthStore((s) => s.user)
  const isPro = user?.tier === 'pro' || user?.tier === 'trial'
  const [expanded, setExpanded] = useState(false)

  const handleChange = (field, value) => {
    updatePaper({ [field]: value })
  }

  return (
    <div style={{ 
      background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
    }}>
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-press"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', textAlign: 'left', background: '#fff', border: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>পেপার সেটআপ</h3>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: '2px 0 0' }}>
              {paper?.exam_title || 'প্রশ্নপত্রের প্রাথমিক তথ্য দিন'}
            </p>
          </div>
        </div>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5}
          style={{ transition: 'transform 0.3s', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', padding: '0 20px 24px', borderTop: '1px solid #f8fafc' }}
          >
            <div style={{ height: 20 }} />
            
            <InputGroup label="প্রতিষ্ঠানের নাম">
              <input
                type="text"
                value={paper?.institution_name || ''}
                onChange={(e) => handleChange('institution_name', e.target.value)}
                placeholder="যেমন: ঢাকা কলেজিয়েট স্কুল"
                style={textInputStyle}
                key={paper?.id || 'new'}
              />
            </InputGroup>

            <InputGroup label="পরীক্ষার নাম" required>
              <input
                type="text"
                value={paper?.exam_title || ''}
                onChange={(e) => handleChange('exam_title', e.target.value)}
                placeholder="যেমন: বার্ষিক পরীক্ষা — ২০২৬"
                style={textInputStyle}
              />
            </InputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <InputGroup label="শ্রেণি">
                <input
                  type="text"
                  value={paper?.class_name || ''}
                  onChange={(e) => handleChange('class_name', e.target.value)}
                  placeholder="যেমন: ৯ম"
                  style={textInputStyle}
                />
              </InputGroup>
              <InputGroup label="বিষয়">
                <input
                  type="text"
                  value={paper?.subject || ''}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="যেমন: পদার্থবিজ্ঞান"
                  style={textInputStyle}
                />
              </InputGroup>
            </div>

            <InputGroup label="সেশন/বর্ষ">
              <input
                type="text"
                value={paper?.session_year || ''}
                onChange={(e) => handleChange('session_year', e.target.value)}
                placeholder="২০২৬"
                style={textInputStyle}
              />
            </InputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <InputGroup label="সময় (মিনিট)">
                <input
                  type="number"
                  value={paper?.time_minutes || ''}
                  onChange={(e) => handleChange('time_minutes', Number(e.target.value))}
                  placeholder="60"
                  min={1}
                  style={textInputStyle}
                />
              </InputGroup>
              <InputGroup label="পূর্ণমান">
                <input
                  type="number"
                  value={paper?.total_marks || ''}
                  onChange={(e) => handleChange('total_marks', Number(e.target.value))}
                  placeholder="100"
                  min={0}
                  style={textInputStyle}
                />
              </InputGroup>
            </div>

            <InputGroup label="নির্দেশনা / Notes">
              <textarea
                value={paper?.instructions || ''}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="যেমন: ডান পাশের সংখ্যাগুলো প্রশ্নের পূর্ণমান নির্দেশ করে। প্রতিটি বিভাগ থেকে নির্দিষ্ট সংখ্যক প্রশ্নের উত্তর দিতে হবে।"
                rows={3}
                style={{ ...textInputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </InputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <InputGroup label="লেআউট">
                <select
                  value={paper?.layout || '1-column'}
                  onChange={(e) => handleChange('layout', e.target.value)}
                  style={textInputStyle}
                >
                  <option value="1-column">১ কলাম</option>
                  <option value="2-column">২ কলাম</option>
                  <option value="3-column">৩ কলাম</option>
                </select>
              </InputGroup>
              <InputGroup label="হেডার অ্যালাইনমেন্ট">
                <select
                  value={paper?.header_alignment || 'center'}
                  onChange={(e) => handleChange('header_alignment', e.target.value)}
                  style={textInputStyle}
                >
                  <option value="left">বামে</option>
                  <option value="center">মাঝে</option>
                  <option value="right">ডানে</option>
                </select>
              </InputGroup>
            </div>

            <InputGroup label="সেট ভ্যারিয়েন্ট">
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: null, label: 'কোনোটি নয়' },
                  { value: 'A', label: 'সেট A' },
                  { value: 'B', label: 'সেট B' },
                ].map((opt) => {
                  const active = paper?.set_variant === opt.value
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleChange('set_variant', opt.value)}
                      style={{
                        flex: 1, padding: '10px', fontSize: 12, fontWeight: 700,
                        borderRadius: 12, transition: 'all 0.2s', border: '1px solid',
                        background: active ? '#eff6ff' : '#fff',
                        color: active ? '#2563eb' : '#64748b',
                        borderColor: active ? '#3b82f6' : '#e2e8f0',
                        boxShadow: active ? '0 2px 8px rgba(37,99,235,0.1)' : 'none'
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </InputGroup>

            <ProGate feature="logo_upload">
              <InputGroup label="প্রতিষ্ঠানের লোগো">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 16, border: '2px dashed #e2e8f0',
                    background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'visible'
                  }}>
                    {paper?.logo_url ? (
                      <>
                        <img 
                          src={paper.logo_url} color="Logo" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 14 }} 
                        />
                        <button
                          onClick={() => handleChange('logo_url', null)}
                          style={{
                            position: 'absolute', top: -8, right: -8, width: 22, height: 22,
                            background: '#ef4444', color: '#fff', borderRadius: '50%', border: '2px solid #fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900
                          }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, lineHeight: 1.4, maxWidth: 160 }}>
                    প্রফেশনাল লুকের জন্য লোগো আপলোড করুন (সর্বোচ্চ 80x80px)
                  </p>
                </div>
              </InputGroup>
            </ProGate>

            <InputGroup label="ওয়াটারমার্ক">
              {isPro ? (
                <input
                  type="text"
                  value={paper?.watermark || ''}
                  onChange={(e) => handleChange('watermark', e.target.value || null)}
                  placeholder="কাস্টম ওয়াটারমার্ক (খালি রাখলে থাকবে না)"
                  style={textInputStyle}
                />
              ) : (
                <div style={{ ...textInputStyle, color: '#94a3b8', fontStyle: 'italic', background: '#f1f5f9' }}>
                   AI Question Hub (Pro দরকার)
                </div>
              )}
            </InputGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
