import ProGate from '@/components/shared/ProGate'
import useAuthStore from '@/store/authStore'
import usePaperStore from '@/store/paperStore'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

// InputGroup defined outside component to prevent recreation on each render
function InputGroup({ label, children, required }) {
  return (
    <div className="mb-2.5 sm:mb-3.5">
      <label
        className="block text-[10px] sm:text-[11px] font-bold text-slate-500 mb-1 sm:mb-1.5 pl-1 uppercase"
        style={{ letterSpacing: '0.02em' }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

// Used for raw inline `style={textInputStyle}` legacy spots. New JSX should
// prefer the responsive `text-input` className below for proper mobile sizing.
const textInputStyle = {
  width: '100%', padding: '12px 14px', background: '#f8fafc',
  borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 14,
  color: '#1e293b', outline: 'none', transition: 'all 0.2s',
  fontWeight: 500
}

// Responsive Tailwind variant that matches textInputStyle but scales down
// on mobile (smaller padding, tighter radius, 13px text).
const TEXT_INPUT_CN =
  'w-full bg-slate-50 border border-slate-200 text-slate-800 outline-none transition-all font-medium ' +
  'px-3 py-2 sm:px-3.5 sm:py-3 text-[13px] sm:text-sm rounded-xl sm:rounded-2xl'

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
    <div
      className="rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden bg-white"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-press w-full flex items-center justify-between text-left bg-white border-0 px-3 py-2.5 sm:px-5 sm:py-4"
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              color: '#2563eb',
            }}
          >
            <svg className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] sm:text-[15px] font-extrabold text-slate-900 m-0">পেপার সেটআপ</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5 m-0 truncate">
              {paper?.exam_title || 'প্রশ্নপত্রের প্রাথমিক তথ্য দিন'}
            </p>
          </div>
        </div>
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
          viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5}
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
            className="overflow-hidden px-3 sm:px-5 pb-3 sm:pb-6"
            style={{ borderTop: '1px solid #f8fafc' }}
          >
            <div className="h-3 sm:h-5" />
            
            <InputGroup label="প্রতিষ্ঠানের নাম">
              <input
                type="text"
                value={paper?.institution_name || ''}
                onChange={(e) => handleChange('institution_name', e.target.value)}
                placeholder="যেমন: ঢাকা কলেজিয়েট স্কুল"
                className={TEXT_INPUT_CN}
                key={paper?.id || 'new'}
              />
            </InputGroup>

            <InputGroup label="পরীক্ষার নাম" required>
              <input
                type="text"
                value={paper?.exam_title || ''}
                onChange={(e) => handleChange('exam_title', e.target.value)}
                placeholder="যেমন: বার্ষিক পরীক্ষা — ২০২৬"
                className={TEXT_INPUT_CN}
              />
            </InputGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <InputGroup label="শ্রেণি">
                <input
                  type="text"
                  value={paper?.class_name || ''}
                  onChange={(e) => handleChange('class_name', e.target.value)}
                  placeholder="যেমন: ৯ম"
                  className={TEXT_INPUT_CN}
                />
              </InputGroup>
              <InputGroup label="বিষয়">
                <input
                  type="text"
                  value={paper?.subject || ''}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="যেমন: পদার্থবিজ্ঞান"
                  className={TEXT_INPUT_CN}
                />
              </InputGroup>
            </div>

            <InputGroup label="সেশন/বর্ষ">
              <input
                type="text"
                value={paper?.session_year || ''}
                onChange={(e) => handleChange('session_year', e.target.value)}
                placeholder="২০২৬"
                className={TEXT_INPUT_CN}
              />
            </InputGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <InputGroup label="সময় (মিনিট)">
                <input
                  type="number"
                  value={paper?.time_minutes || ''}
                  onChange={(e) => handleChange('time_minutes', Number(e.target.value))}
                  placeholder="60"
                  min={1}
                  className={TEXT_INPUT_CN}
                />
              </InputGroup>
              <InputGroup label="পূর্ণমান">
                <input
                  type="number"
                  value={paper?.total_marks || ''}
                  onChange={(e) => handleChange('total_marks', Number(e.target.value))}
                  placeholder="100"
                  min={0}
                  className={TEXT_INPUT_CN}
                />
              </InputGroup>
            </div>

            <InputGroup label="নির্দেশনা / Notes">
              <textarea
                value={paper?.instructions || ''}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="যেমন: ডান পাশের সংখ্যাগুলো প্রশ্নের পূর্ণমান নির্দেশ করে। প্রতিটি বিভাগ থেকে নির্দিষ্ট সংখ্যক প্রশ্নের উত্তর দিতে হবে।"
                rows={3}
                className={`${TEXT_INPUT_CN} resize-y`}
                style={{ fontFamily: 'inherit' }}
              />
            </InputGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <InputGroup label="লেআউট">
                <select
                  value={paper?.layout || '1-column'}
                  onChange={(e) => handleChange('layout', e.target.value)}
                  className={TEXT_INPUT_CN}
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
                  className={TEXT_INPUT_CN}
                >
                  <option value="left">বামে</option>
                  <option value="center">মাঝে</option>
                  <option value="right">ডানে</option>
                </select>
              </InputGroup>
            </div>

            <InputGroup label="সেট ভ্যারিয়েন্ট">
              <div className="flex gap-1.5 sm:gap-2.5">
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
                      className="flex-1 py-2 px-1.5 sm:py-2.5 sm:px-3 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all"
                      style={{
                        border: '1px solid',
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
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-[60px] sm:h-[60px] rounded-xl sm:rounded-2xl flex items-center justify-center relative flex-shrink-0"
                    style={{
                      border: '2px dashed #e2e8f0',
                      background: '#f8fafc',
                    }}
                  >
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
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-snug max-w-[160px]">
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
                  className={TEXT_INPUT_CN}
                />
              ) : (
                <div className={`${TEXT_INPUT_CN} italic text-slate-400`} style={{ background: '#f1f5f9' }}>
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
