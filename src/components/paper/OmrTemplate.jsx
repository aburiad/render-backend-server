import React from 'react'

const toBengaliDigit = (num) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return num.toString().split('').map(digit => bengaliDigits[digit] || digit).join('')
}

// ── Shared inline style objects (avoids Tailwind production build issues) ──

const pink400 = '#f472b6'
const pink500 = '#ec4899'
const pink700 = '#be185d'
const pink900 = '#831843'
const pink50 = '#fdf2f8'
const gray50 = '#f9fafb'
const gray200 = '#e5e7eb'
const gray400 = '#9ca3af'
const gray500 = '#6b7280'
const gray800 = '#1f2937'
const red600 = '#dc2626'

const bubbleLabelStyle = {
  width: 16.5,
  height: 16.5,
  borderRadius: '50%',
  border: `1px solid ${pink500}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 8.5,
  fontWeight: 900,
  color: pink700,
  background: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}

const digitBubbleStyle = {
  width: 11.5,
  height: 11.5,
  borderRadius: '50%',
  border: `1px solid ${pink400}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 6.5,
  lineHeight: 1,
  fontWeight: 700,
  color: pink700,
  background: '#fff',
}

const digitColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  alignItems: 'center',
}

const headerLabelStyle = {
  fontSize: 8,
  fontWeight: 900,
  textAlign: 'center',
  borderBottom: `1px solid ${pink400}`,
  marginBottom: 2,
  background: pink50,
  padding: '2px 0',
  textTransform: 'uppercase',
  lineHeight: 1,
}

export default function OmrTemplate({ settings }) {
  const { schoolName, examType, year, totalQuestions, rules } = settings

  // Parse rules text into individual rule lines
  const ruleLines = (rules || '').split('\n').filter(r => r.trim())

  // Calculate grid dimensions
  const questionsPerColumn = Math.ceil(totalQuestions / 3)
  const columns = []
  for (let i = 0; i < 3; i++) {
    const start = i * questionsPerColumn
    if (start < totalQuestions) {
      columns.push(Array.from({ length: Math.min(questionsPerColumn, totalQuestions - start) }, (_, idx) => start + idx + 1))
    }
  }

  // Exam type display: show presets + custom if not in presets
  const presetExamTypes = ['অর্ধ-বার্ষিক', 'বার্ষিক', 'প্রাক-নির্বাচনী', 'নির্বাচনী পরীক্ষা']
  const isCustomExam = !presetExamTypes.includes(examType)
  const displayExamTypes = isCustomExam ? [...presetExamTypes, examType] : presetExamTypes

  const bubbleLabels = ['ক', 'খ', 'গ', 'ঘ']
  const classes = ['৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম']
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div style={{
      background: '#ffffff',
      color: '#000000',
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: 0,
      fontFamily: "'Kalpurush','Hind Siliguri',sans-serif",
      position: 'relative',
      overflow: 'hidden',
      fontSize: 11,
      boxSizing: 'border-box',
    }}>

      {/* Left Timing Marks */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '48px 0',
        zIndex: 20,
      }}>
        {Array.from({ length: 45 }).map((_, i) => (
          <div key={i} style={{ width: 14, height: 6, background: '#000' }} />
        ))}
      </div>

      {/* Main content area */}
      <div style={{ marginLeft: 32, paddingRight: 32, paddingTop: 24, paddingBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>

        {/* ── Header Section ── */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1.2, textTransform: 'uppercase' }}>
            {schoolName}
          </h1>

          {/* Exam type radio buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontWeight: 700, marginBottom: 10 }}>
            {displayExamTypes.map((type) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: '1px solid #000',
                  ...(examType === type ? { backgroundColor: '#000', boxShadow: 'inset 0 0 0 2px #fff' } : {}),
                }} />
                <span style={{ fontSize: 10 }}>{type}</span>
              </div>
            ))}

            {/* Year block */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: 8,
              padding: '2px 6px',
              border: '1px solid #000',
              borderRadius: 4,
              background: gray50,
              transform: 'scale(0.9)',
            }}>
              <span style={{ fontSize: 16 }}>২</span>
              <span style={{ fontSize: 16 }}>০</span>
              <span style={{ fontSize: 16, fontWeight: 900 }}>{toBengaliDigit(year[2] || '২')}</span>
              <div style={{
                width: 20,
                height: 24,
                border: '1px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                background: '#fff',
              }}>
                {toBengaliDigit(year[3] || '')}
              </div>
            </div>
          </div>

          {/* Warning text - black */}
          <div style={{
            background: '#000',
            color: '#fff',
            padding: '4px 16px',
            fontSize: 9,
            fontWeight: 700,
            display: 'inline-block',
            margin: '0 auto 4px',
            borderRadius: 2,
            whiteSpace: 'nowrap',
          }}>
            উত্তরপত্রের নির্ধারিত স্থান ব্যতীত কোন স্থানে অবাঞ্ছিত দাগ বা কোন কিছু লেখা যাবে না
          </div>
          <br />

          {/* Warning text - red */}
          <div style={{
            border: `1px solid ${red600}`,
            padding: '4px 20px',
            fontSize: 9,
            fontWeight: 900,
            display: 'inline-block',
            margin: '0 auto 4px',
            textTransform: 'uppercase',
            borderRadius: 2,
            color: red600,
            backgroundColor: 'rgba(254, 242, 242, 0.2)',
          }}>
            অবশ্যই কালো বল-পয়েন্ট কলম দিয়ে বৃত্ত ভরাট করতে হবে
          </div>
          <br />

          <h2 style={{
            fontSize: 12,
            fontWeight: 900,
            borderBottom: '2px solid #000',
            display: 'inline-block',
            padding: '0 40px 2px',
            marginTop: 4,
            textTransform: 'uppercase',
            color: gray800,
          }}>
            পরীক্ষার্থীর তথ্য
          </h2>
        </div>

        {/* ── Student Info Blocks ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, height: 'auto', justifyContent: 'center' }}>

          {/* Roll Number */}
          <div style={{ border: `1px solid ${pink400}`, padding: 2, display: 'flex', flexDirection: 'column', borderRadius: 4, background: '#fff', width: 130 }}>
            <div style={headerLabelStyle}>রোল নম্বর</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, marginBottom: 2, height: 14, padding: '0 2px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ border: `1px solid ${pink400}`, height: '100%', borderRadius: 2 }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0, padding: '0 2px 2px' }}>
              {Array.from({ length: 6 }).map((_, col) => (
                <div key={col} style={digitColumnStyle}>
                  {digits.map(d => (
                    <div key={d} style={digitBubbleStyle}>{toBengaliDigit(d)}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Registration Number */}
          <div style={{ border: `1px solid ${pink400}`, padding: 2, display: 'flex', flexDirection: 'column', borderRadius: 4, background: '#fff', width: 210 }}>
            <div style={headerLabelStyle}>রেজিস্ট্রেশন নম্বর</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2, marginBottom: 2, height: 14, padding: '0 2px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ border: `1px solid ${pink400}`, height: '100%', borderRadius: 2 }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 0, padding: '0 2px 2px' }}>
              {Array.from({ length: 10 }).map((_, col) => (
                <div key={col} style={digitColumnStyle}>
                  {digits.map(d => (
                    <div key={d} style={digitBubbleStyle}>{toBengaliDigit(d)}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Subject & Class Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Subject Code */}
            <div style={{ border: `1px solid ${pink400}`, padding: 2, display: 'flex', flexDirection: 'column', borderRadius: 4, background: '#fff', width: 80 }}>
              <div style={headerLabelStyle}>বিষয় কোড</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 2, height: 14, padding: '0 2px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ border: `1px solid ${pink400}`, height: '100%', borderRadius: 2 }} />
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, padding: '0 2px 2px' }}>
                {Array.from({ length: 3 }).map((_, col) => (
                  <div key={col} style={digitColumnStyle}>
                    {digits.map(d => (
                      <div key={d} style={digitBubbleStyle}>{toBengaliDigit(d)}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Class selector */}
            <div style={{ border: `1px solid ${pink400}`, padding: 2, display: 'flex', flexDirection: 'column', borderRadius: 4, background: '#fff', width: 80, flex: 1 }}>
              <div style={{
                fontSize: 8,
                fontWeight: 900,
                textAlign: 'center',
                borderBottom: `1px solid ${pink400}`,
                marginBottom: 4,
                background: pink50,
                padding: '2px 0',
              }}>শ্রেণী</div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, padding: '0 4px', gap: 2 }}>
                {classes.map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1px solid ${pink400}`, background: '#fff' }} />
                    <span style={{ fontSize: 8, fontWeight: 700 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Signature Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 96 }}>
            <div style={{ border: '1px solid #000', padding: 4, display: 'flex', flexDirection: 'column', background: gray50, height: 45, position: 'relative', borderRadius: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: gray500, position: 'absolute', top: -6, left: 6, background: '#fff', padding: '0 4px' }}>তারিখ:</span>
              <div style={{ marginTop: 4, borderBottom: '1px solid rgba(0,0,0,0.1)', width: '100%' }} />
            </div>
            <div style={{ border: '1px solid #000', padding: 4, display: 'flex', flexDirection: 'column', background: '#fff', flex: 1, borderRadius: 4, position: 'relative' }}>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 7.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>কক্ষ পরিদর্শকের স্বাক্ষর</div>
            </div>
          </div>
        </div>

        {/* ── Answer Grid Separator Title ── */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <h3 style={{
            fontSize: 12,
            fontWeight: 900,
            borderBottom: '1px solid #000',
            display: 'inline-block',
            padding: '0 48px 2px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            নৈর্ব্যক্তিক অভীক্ষা উত্তরপত্র
          </h3>
        </div>

        {/* ── Main Answer Grid ── */}
        <div style={{ border: `1px solid ${pink400}`, padding: 12, borderRadius: 4, background: '#fff', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {columns.map((col, colIdx) => (
              <div key={colIdx}>
                {/* Column header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 1fr',
                  borderBottom: `1px solid ${pink400}`,
                  paddingBottom: 2,
                  marginBottom: 4,
                  fontSize: 8,
                  fontWeight: 900,
                  color: pink700,
                  textTransform: 'uppercase',
                }}>
                  <div>SL</div>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {bubbleLabels.map(l => <span key={l}>{l}</span>)}
                  </div>
                </div>

                {/* Question rows */}
                {col.map((qNum) => (
                  <div key={qNum} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: pink900 }}>{toBengaliDigit(qNum)}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
                      {bubbleLabels.map((label) => (
                        <div key={label} style={bubbleLabelStyle}>{label}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Set Code and Rules ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'start' }}>
          {/* Set Code */}
          <div style={{ border: `1px solid ${pink400}`, padding: 10, borderRadius: 4, background: '#fff', position: 'relative' }}>
            <div style={{
              fontSize: 9,
              fontWeight: 900,
              textAlign: 'center',
              borderBottom: `1px solid ${pink400}`,
              marginBottom: 8,
              background: pink50,
              padding: '2px 0',
            }}>নৈর্ব্যক্তিক প্রশ্নের সেট</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 4px' }}>
              {bubbleLabels.map(l => (
                <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 19,
                    height: 19,
                    borderRadius: '50%',
                    border: `1px solid ${pink500}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9.5,
                    fontWeight: 900,
                    color: pink700,
                    background: '#fff',
                  }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ color: red600, fontSize: 8, fontWeight: 900, fontStyle: 'italic', marginTop: 6, textAlign: 'center', lineHeight: 1 }}>
              (বি.দ্র. কোন প্রকার সীল মোহর দেয়া নিষেধ)
            </div>
          </div>

          {/* Rules Section */}
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.4,
            padding: '10px 16px',
            borderRadius: 4,
            border: `1px solid ${gray200}`,
            backgroundColor: 'rgba(249, 250, 251, 0.2)',
          }}>
            <div style={{
              fontWeight: 900,
              borderBottom: '1px solid #000',
              display: 'inline-block',
              marginBottom: 4,
              fontSize: 11,
              color: '#000',
              paddingBottom: 2,
            }}>নিয়মাবলি</div>
            {ruleLines.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 24, rowGap: 4 }}>
                {ruleLines.map((rule, i) => (
                  <p key={i} style={{
                    margin: 0,
                    gridColumn: (ruleLines.length <= 2 || i === ruleLines.length - 1) ? 'span 2' : undefined,
                  }}>{rule}</p>
                ))}
              </div>
            ) : (
              <p style={{ color: gray400, fontStyle: 'italic', margin: 0 }}>কোন নিয়ম দেওয়া হয়নি</p>
            )}
          </div>
        </div>
      </div>

      {/* Print-only CSS — no Tailwind dependency */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen and (max-width: 767px) {
          .omr-scale-wrap { zoom: 0.42; }
        }
        @media screen and (min-width: 768px) and (max-width: 1023px) {
          .omr-scale-wrap { zoom: 0.7; }
        }
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            position: relative !important;
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
          }
          .omr-scale-wrap {
            zoom: 1 !important;
            width: auto !important;
            max-width: none !important;
            overflow: visible !important;
          }
        }
      `}} />
    </div>
  )
}