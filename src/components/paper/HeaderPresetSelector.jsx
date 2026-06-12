import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * 4 Header Presets
 */
const HEADER_PRESETS = [
  {
    id: 'school_classic',
    name: 'স্কুল ক্লাসিক',
    nameEn: 'School Classic Layout',
    icon: '🏫',
    tag: 'স্কুল',
    tagColor: '#0891b2',
    description: 'উপরে স্কুল ও বিষয় তথ্য, নিচে বামে সময় ডানে পূর্ণমান',
  },
  {
    id: 'primary_classic',
    name: 'প্রাইমারি ক্লাসিক',
    nameEn: 'Primary Classy Layout',
    icon: '📐',
    tag: 'প্রাথমিক',
    tagColor: '#059669',
    description: 'ক্লিন ডটেড লাইন, শিক্ষার্থী ইনফো গ্রিড, বড় ফন্ট',
  },
  {
    id: 'kids_illustrated',
    name: 'কিডস ইলাস্ট্রেটেড',
    nameEn: 'Kids Fun Layout',
    icon: '🧸',
    tag: 'কিডস',
    tagColor: '#db2777',
    description: 'সেন্টার লোগো, রাউন্ডেড ব্যাজ, কালারফুল ফান লেআউট',
  },
  {
    id: 'modern_academy',
    name: 'মডার্ন একাডেমি',
    nameEn: 'Modern Primary Layout',
    icon: '✨',
    tag: 'মডার্ন',
    tagColor: '#2563eb',
    description: 'মিনিমাল, ক্লিন লাইন, নো বর্ডার, স্টাইলিশ',
  },
  {
    id: 'nctb_board',
    name: 'এনসিটিবি বোর্ড স্ট্যান্ডার্ড',
    nameEn: 'NCTB Board Heavy Table',
    icon: '📋',
    tag: 'বোর্ড',
    tagColor: '#dc2626',
    description: 'ডাবল বর্ডার টেবিল, ভারী NCTB স্টাইল (মাধ্যমিক)',
  },
]

/**
 * Mini preview renderer — shows a scaled-down dummy of each header style
 */
function PresetPreview({ presetId }) {
  const containerStyle = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '16px 12px',
    transform: 'scale(1)',
    transformOrigin: 'top center',
    fontFamily: '"Hind Siliguri", "Noto Sans Bengali", sans-serif',
  }

  switch (presetId) {
    case 'school_classic':
      return (
        <div style={containerStyle}>
          {/* School name + info centered */}
          <div style={{ textAlign: 'center' }}>
            {/* Logo placeholder */}
            <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f1f5f9', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#1e293b' }}>সূর্যমুখী উচ্চ বিদ্যালয়</div>
            <div style={{ fontSize: 7, fontWeight: 600, marginTop: 2, color: '#475569' }}>
              বার্ষিক পরীক্ষা — ২০২৬
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4, fontSize: 6, fontWeight: 600, color: '#64748b' }}>
              <span>শ্রেণি: ষষ্ঠ</span>
              <span>বিষয়: গণিত</span>
              <span>সেট: ক</span>
            </div>
          </div>
          {/* Bottom row: time left, marks right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: '#0891b2' }}>সময়: ২ ঘণ্টা</span>
            <span style={{ fontSize: 7, fontWeight: 700, color: '#0891b2' }}>পূর্ণমান: ১০০</span>
          </div>
        </div>
      )

    case 'primary_classic':
      return (
        <div style={containerStyle}>
          {/* Logo + Name + Time */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f1f5f9', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#1e293b' }}>সূর্যমুখী স্কুল</div>
              <div style={{ display: 'inline-block', marginTop: 2, padding: '1px 8px', borderRadius: 8, background: '#f3f4f6', fontSize: 7, fontWeight: 600 }}>
                বার্ষিক পরীক্ষা — ২০২৬
              </div>
            </div>
            <div style={{ fontSize: 6, fontWeight: 600, color: '#64748b', textAlign: 'right', lineHeight: 1.5 }}>
              সময়: ২০<br />পূর্ণমান: ১০
            </div>
          </div>
          {/* Student info grid */}
          <div style={{ marginTop: 8, paddingBottom: 6, borderBottom: '1px dashed #94a3b8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, fontWeight: 600 }}>
              <span>নাম: ....................</span>
              <span>রোল: ........</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, fontWeight: 600, marginTop: 3 }}>
              <span>শ্রেণি: ৩য়</span>
              <span>বিষয়: বাংলা</span>
              <span>তারিখ: ........</span>
            </div>
          </div>
        </div>
      )

    case 'kids_illustrated':
      return (
        <div style={{ ...containerStyle, background: '#fffbeb' }}>
          {/* Centered logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', border: '2px solid #fbbf24', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              🌟
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400e' }}>🎨 ছোট্ট পাখি স্কুল</div>
            <div style={{ display: 'inline-block', marginTop: 3, padding: '2px 10px', borderRadius: 10, background: '#fef9c3', border: '1px solid #fde68a', fontSize: 7, fontWeight: 700, color: '#a16207' }}>
              ✏️ মাসিক পরীক্ষা
            </div>
          </div>
          {/* Fun info row */}
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-around' }}>
            {['নাম: _______', 'ক্লাস: ২য়', 'তারিখ: _______'].map((t, i) => (
              <span key={i} style={{ fontSize: 6, fontWeight: 600, color: '#92400e', background: '#fef9c3', padding: '1px 5px', borderRadius: 6, border: '1px solid #fde68a' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )

    case 'modern_academy':
      return (
        <div style={containerStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', letterSpacing: '0.03em' }}>
              মডার্ন একাডেমি
            </div>
            <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', margin: '4px auto' }} />
            <div style={{ fontSize: 8, fontWeight: 600, color: '#3b82f6' }}>
              সেমিস্টার পরীক্ষা — ২০২৬
            </div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 6, fontWeight: 600, color: '#475569' }}>
            <span>শ্রেণি: ৪র্থ</span>
            <span>বিষয়: গণিত</span>
            <span>সময়: ১২০ মি.</span>
            <span>পূর্ণমান: ১০০</span>
          </div>
        </div>
      )

    case 'nctb_board':
      return (
        <div style={containerStyle}>
          {/* Double border table */}
          <div style={{ border: '3px solid #000', padding: 4 }}>
            <div style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 800 }}>উত্তরা হাই স্কুল</div>
              <div style={{ fontSize: 7, fontWeight: 600, marginTop: 1 }}>শিক্ষাবোর্ড পরীক্ষা — ২০২৬</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4, fontSize: 6 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 600 }}>শ্রেণি</td>
                  <td style={{ border: '1px solid #000', padding: '2px 4px' }}>দশম</td>
                  <td style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 600 }}>বিষয়</td>
                  <td style={{ border: '1px solid #000', padding: '2px 4px' }}>পদার্থবিজ্ঞান</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 600 }}>সময়</td>
                  <td style={{ border: '1px solid #000', padding: '2px 4px' }}>৩ ঘণ্টা</td>
                  <td style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 600 }}>পূর্ণমান</td>
                  <td style={{ border: '1px solid #000', padding: '2px 4px' }}>১০০</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )

    default:
      return null
  }
}

/**
 * Header Preset Selector Component
 * Renders a dropdown + modal preview for selecting header style
 */
export default function HeaderPresetSelector({ value, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [previewPreset, setPreviewPreset] = useState(null)

  const selectedPreset = HEADER_PRESETS.find((p) => p.id === value)

  const handlePresetClick = (preset) => {
    setPreviewPreset(preset)
    setModalOpen(true)
  }

  const handleSelect = () => {
    if (previewPreset) {
      onChange(previewPreset.id)
    }
    setModalOpen(false)
    setPreviewPreset(null)
  }

  const handleCancel = () => {
    setModalOpen(false)
    setPreviewPreset(null)
  }

  return (
    <>
      {/* Dropdown select */}
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => {
            const preset = HEADER_PRESETS.find((p) => p.id === e.target.value)
            if (preset) {
              handlePresetClick(preset)
            }
          }}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 outline-none transition-all font-medium px-3 py-2 sm:px-3.5 sm:py-3 text-[13px] sm:text-sm rounded-xl sm:rounded-2xl appearance-none cursor-pointer"
        >
          <option value="" disabled>
            হেডার প্রিসেট নির্বাচন করুন...
          </option>
          {HEADER_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.icon} {preset.name} ({preset.nameEn})
            </option>
          ))}
        </select>
        {/* Selected indicator */}
        {selectedPreset && (
          <div
            className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md"
            style={{ background: `${selectedPreset.tagColor}15`, border: `1px solid ${selectedPreset.tagColor}30` }}
          >
            <span style={{ color: selectedPreset.tagColor, fontSize: 8, fontWeight: 800 }}>
              {selectedPreset.tag}
            </span>
          </div>
        )}
        {/* Chevron */}
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {modalOpen && previewPreset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{previewPreset.icon}</span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 m-0">{previewPreset.name}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold m-0">{previewPreset.nameEn}</p>
                  </div>
                  <span
                    className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: `${previewPreset.tagColor}15`, color: previewPreset.tagColor }}
                  >
                    {previewPreset.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{previewPreset.description}</p>
              </div>

              {/* Preview Area */}
              <div className="px-5 pb-4">
                <div
                  className="rounded-2xl p-4"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <div className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    Live Preview
                  </div>
                  <PresetPreview presetId={previewPreset.id} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={handleSelect}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-white"
                  style={{
                    background: `linear-gradient(135deg, ${previewPreset.tagColor}, ${previewPreset.tagColor}dd)`,
                    boxShadow: `0 4px 14px ${previewPreset.tagColor}40`,
                  }}
                >
                  ✅ Select Header
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
