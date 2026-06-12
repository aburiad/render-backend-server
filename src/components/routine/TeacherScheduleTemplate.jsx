import { forwardRef } from 'react'

const TeacherScheduleTemplate = forwardRef(function TeacherScheduleTemplate(
  { schedule, schoolName, font = 'Noto Serif Bengali' },
  ref,
) {
  if (!schedule) return null
  const fontStack = `"${font}", "Hind Siliguri", "Noto Sans Bengali", serif`

  const pageStyle = {
    fontFamily: fontStack,
    color: '#000',
    background: '#fff',
    // 287mm = A4 landscape (297) − 5mm × 2 horizontal margin. Wider than
    // class routine (273mm) because teacher schedule typically has more
    // columns when classes have differing period structures.
    width: '287mm',
    minHeight: '200mm',
    margin: '0 auto',
    boxSizing: 'border-box',
  }

  const cellMap = {}
  for (const c of schedule.cells || []) {
    cellMap[`${c.day_index}_${c.time_slot_index}`] = c
  }

  const headerCellStyle = {
    border: '1.5px solid #000',
    padding: '6px 8px',
    fontWeight: 800,
    background: '#f0f0f0',
    textAlign: 'center',
    fontSize: '0.92em',
    verticalAlign: 'middle',
    lineHeight: 1.2,
  }
  const dataCellStyle = {
    border: '1px solid #555',
    padding: '6px 8px',
    textAlign: 'center',
    fontSize: '0.85em',
    verticalAlign: 'middle',
    lineHeight: 1.3,
  }
  const centerWrap = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 18,
  }

  return (
    <div ref={ref} className="routine-print" style={pageStyle}>
      <header style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1.5px solid #000' }}>
        {schoolName && (
          <div style={{ textAlign: 'center', fontSize: '1.4em', fontWeight: 800, lineHeight: 1.2 }}>
            {schoolName}
          </div>
        )}
        <div
          style={{
            marginTop: 6,
            textAlign: 'center',
            fontSize: '1.1em',
            fontWeight: 800,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          {schedule.teacher} — সাপ্তাহিক রুটিন
        </div>
        <div
          style={{
            marginTop: 4,
            textAlign: 'center',
            fontSize: '0.88em',
            color: '#444',
          }}
        >
          মোট ক্লাস: {schedule.totalSlots} • শ্রেণি সংখ্যা: {schedule.classCount}
          {schedule.conflicts > 0 && (
            <span style={{ color: '#dc2626', fontWeight: 700 }}>
              {' '}• ⚠ সময়ের দ্বন্দ্ব: {schedule.conflicts}
            </span>
          )}
        </div>
      </header>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: 4,
          breakInside: 'avoid',
        }}
      >
        <thead>
          <tr>
            <th style={{ ...headerCellStyle, width: '16%' }}>
              <div style={centerWrap}>সময়</div>
            </th>
            {schedule.days.map((d, i) => (
              <th key={i} style={headerCellStyle}>
                <div style={centerWrap}>{d}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.timeSlots.map((slot, si) => (
            <tr key={si}>
              <td style={{ ...dataCellStyle, fontWeight: 700, background: '#f8fafc' }}>
                <div style={{ fontSize: '0.95em' }}>{slot.label}</div>
                {slot.start && slot.end && (
                  <div style={{ fontSize: '0.78em', color: '#666' }}>
                    {slot.start}–{slot.end}
                  </div>
                )}
              </td>
              {schedule.days.map((_, di) => {
                const cell = cellMap[`${di}_${si}`]
                if (!cell || cell.items.length === 0) {
                  return <td key={di} style={dataCellStyle}>—</td>
                }
                const conflicted = cell.items.length > 1
                return (
                  <td
                    key={di}
                    style={{
                      ...dataCellStyle,
                      borderLeft: `4px solid ${cell.items[0].color || '#475569'}`,
                      background: conflicted ? '#fef2f2' : undefined,
                    }}
                  >
                    {cell.items.map((it, idx) => (
                      <div key={idx} style={{ marginBottom: idx < cell.items.length - 1 ? 2 : 0 }}>
                        <div style={{ fontSize: '0.85em', fontWeight: 700, color: '#111' }}>
                          {it.class_name}
                        </div>
                        <div style={{ fontSize: '0.78em', color: '#444' }}>
                          {it.subject_name}
                        </div>
                      </div>
                    ))}
                    {conflicted && (
                      <div style={{ fontSize: '0.7em', color: '#dc2626', marginTop: 2 }}>
                        ⚠ একই সময়
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

export default TeacherScheduleTemplate
