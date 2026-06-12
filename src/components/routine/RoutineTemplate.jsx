import { forwardRef } from 'react'

const RoutineTemplate = forwardRef(function RoutineTemplate(
  { routine, font = 'Noto Serif Bengali' },
  ref,
) {
  if (!routine) return null
  const isLandscape = (routine.orientation || 'landscape') === 'landscape'
  const fontStack = `"${font}", "Hind Siliguri", "Noto Sans Bengali", serif`

  // A4 landscape: 297mm × 210mm; portrait: 210mm × 297mm. We bake horizontal margin.
  const pageStyle = {
    fontFamily: fontStack,
    color: '#000',
    background: '#fff',
    width: isLandscape ? '273mm' : '186mm',
    minHeight: isLandscape ? '186mm' : '269mm',
    margin: '0 auto',
    boxSizing: 'border-box',
  }

  const subjectMap = Object.fromEntries((routine.subjects || []).map((s) => [s.id, s]))
  const cellMap = {}
  for (const c of routine.cells || []) {
    cellMap[`${c.day_index}_${c.period_id}`] = c
  }

  return (
    <div ref={ref} className="routine-print" style={pageStyle}>
      <Header routine={routine} />
      <Grid routine={routine} subjectMap={subjectMap} cellMap={cellMap} />
      <Footer routine={routine} />
    </div>
  )
})

function Header({ routine }) {
  return (
    <header style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1.5px solid #000' }}>
      {routine.header_top_line && (
        <div style={{ textAlign: 'center', fontSize: '0.85em', fontWeight: 600 }}>
          {routine.header_top_line}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {routine.header_logo_url && (
          <img
            src={routine.header_logo_url}
            alt=""
            style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
            crossOrigin="anonymous"
          />
        )}
        <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
          {routine.school_name && (
            <div style={{ fontSize: '1.5em', fontWeight: 800, lineHeight: 1.2 }}>
              {routine.school_name}
            </div>
          )}
          {routine.school_subtitle && (
            <div style={{ fontSize: '0.92em', fontWeight: 600 }}>{routine.school_subtitle}</div>
          )}
          {routine.school_address && (
            <div style={{ fontSize: '0.85em' }}>{routine.school_address}</div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 6,
          textAlign: 'center',
          fontSize: '1.15em',
          fontWeight: 800,
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        {routine.title || 'ক্লাস রুটিন'}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          margin: '4px 0 0',
          fontSize: '0.9em',
          fontWeight: 600,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span>
          {routine.class_name && `শ্রেণি: ${routine.class_name}`}
          {routine.section && ` (${routine.section})`}
        </span>
        <span>
          {routine.year && `বছর: ${routine.year}`}
          {routine.effective_from && `   কার্যকর: ${routine.effective_from}`}
        </span>
      </div>
    </header>
  )
}

function Grid({ routine, subjectMap, cellMap }) {
  const days = routine.days || []
  const periods = routine.periods || []
  const showTime = routine.show_period_time !== false
  const showTeacher = routine.show_teacher_name !== false

  // html2canvas treats <th> Bengali text as baseline-aligned, even though
  // the browser defaults to vertical-align: middle. Set it explicitly here
  // AND wrap text in a flex container below — that combination is what
  // actually makes html2canvas honor vertical centering with Bengali fonts.
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
    fontSize: '0.88em',
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
          <th style={{ ...headerCellStyle, width: '18%' }}>
            <div style={centerWrap}>পিরিয়ড</div>
          </th>
          {days.map((d, i) => (
            <th key={i} style={headerCellStyle}>
              <div style={centerWrap}>{d}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {periods.map((p) => {
          if (p.is_break) {
            return (
              <tr key={p.id}>
                <td style={{ ...dataCellStyle, fontWeight: 700, background: '#fef9c3' }}>
                  {p.label}
                  {showTime && p.start && p.end && (
                    <div style={{ fontSize: '0.8em', fontWeight: 500, color: '#666' }}>
                      {p.start}–{p.end}
                    </div>
                  )}
                </td>
                <td
                  colSpan={days.length}
                  style={{
                    ...dataCellStyle,
                    fontWeight: 700,
                    background: '#fef9c3',
                    fontStyle: 'italic',
                  }}
                >
                  {p.break_label || 'ব্রেক'}
                </td>
              </tr>
            )
          }
          return (
            <tr key={p.id}>
              <td style={{ ...dataCellStyle, fontWeight: 700, background: '#f8fafc' }}>
                {p.label}
                {showTime && p.start && p.end && (
                  <div style={{ fontSize: '0.78em', fontWeight: 500, color: '#666' }}>
                    {p.start}–{p.end}
                  </div>
                )}
              </td>
              {days.map((_, dayIdx) => {
                const cell = cellMap[`${dayIdx}_${p.id}`]
                const subject = cell ? subjectMap[cell.subject_id] : null
                if (!subject) {
                  return <td key={dayIdx} style={dataCellStyle}>—</td>
                }
                const teacher = cell.override_teacher || subject.teacher
                return (
                  <td
                    key={dayIdx}
                    style={{
                      ...dataCellStyle,
                      borderLeft: `4px solid ${subject.color || '#475569'}`,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{subject.name}</div>
                    {showTeacher && teacher && (
                      <div style={{ fontSize: '0.8em', color: '#444' }}>{teacher}</div>
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Footer({ routine }) {
  if (!routine.footer_note && !routine.signature_name && !routine.signature_title) return null
  return (
    <div
      style={{
        marginTop: 18,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        fontSize: '0.9em',
      }}
    >
      <div style={{ fontStyle: 'italic', maxWidth: '60%', whiteSpace: 'pre-line' }}>
        {routine.footer_note}
      </div>
      <div style={{ textAlign: 'right' }}>
        {routine.signature_name && <div style={{ fontWeight: 700 }}>{routine.signature_name}</div>}
        {routine.signature_title && <div style={{ fontWeight: 600 }}>{routine.signature_title}</div>}
      </div>
    </div>
  )
}

export default RoutineTemplate
