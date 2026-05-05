import { forwardRef } from 'react'
import { MathText } from '@/utils/mathRender'

/**
 * Renders a paper as A4-sized HTML, ready to print or pass to html2pdf.
 *
 * Design: clean, B&W, exam-board style. Sharp edges, restrained typography,
 * thin borders only where structurally needed (CQ stimulus, matching table).
 *
 * Math: question/option/stimulus text may contain $...$ inline LaTeX, which
 * MathText renders via KaTeX. Plain text (Bengali included) passes through
 * unchanged. Works in print and html2pdf because KaTeX outputs static HTML.
 */
const PaperTemplate = forwardRef(function PaperTemplate(
  { paper, questions, font = 'Noto Serif Bengali', size = '12pt', spacing = '1.85' },
  ref,
) {
  const fontStack = `"${font}", "Hind Siliguri", "Noto Sans Bengali", serif`

  // Top/bottom padding intentionally 0: when html2pdf splits this tall element
  // across multiple pages, internal top/bottom padding appears only on page 1
  // and last page. Page-level margins are added by jsPDF (margin option) and
  // by @page CSS for browser print, which apply consistently to every page.
  const pageStyle = {
    fontFamily: fontStack,
    fontSize: size,
    lineHeight: spacing,
    color: '#000',
    background: '#fff',
    width: '210mm',
    minHeight: '297mm',
    padding: '0 12mm',
    margin: '0 auto',
    boxSizing: 'border-box',
  }

  return (
    <div ref={ref} className="paper-print" style={pageStyle}>
      <Header paper={paper} />
      <QuestionList questions={questions} layout={paper?.layout || '1-column'} />
    </div>
  )
})

function Header({ paper }) {
  if (!paper) return null
  const align = paper.header_alignment || 'center'

  return (
    <header style={{ marginBottom: 18 }}>
      {/* Optional: institution name + logo at the very top */}
      {(paper.institution_name || paper.logo_url) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
            gap: 12,
            marginBottom: 10,
          }}
        >
          {paper.logo_url && (
            <img
              src={paper.logo_url}
              alt=""
              style={{ width: 48, height: 48, objectFit: 'contain' }}
              crossOrigin="anonymous"
            />
          )}
          {paper.institution_name && (
            <div style={{ fontSize: '1.3em', fontWeight: 700, letterSpacing: '0.01em' }}>
              {paper.institution_name}
            </div>
          )}
        </div>
      )}

      {/* Standard heading: exam name → session → class → subject, all centered */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        {paper.exam_title && (
          <div
            style={{
              fontSize: '1.4em',
              fontWeight: 700,
              margin: '0 0 4px',
            }}
          >
            {paper.exam_title}
            {paper.session_year ? ` — ${paper.session_year}` : ''}
            {paper.set_variant ? ` (সেট ${paper.set_variant})` : ''}
          </div>
        )}
        {paper.class_name && (
          <div style={{ fontSize: '1em', fontWeight: 600, margin: '2px 0' }}>
            শ্রেণি: {paper.class_name}
          </div>
        )}
        {paper.subject && (
          <div style={{ fontSize: '1em', fontWeight: 600, margin: '2px 0' }}>
            বিষয়: {paper.subject}
          </div>
        )}
      </div>

      {/* Time (left) | Full marks (right)
          Using a table instead of flex+lineHeight: html2canvas renders
          flex containers' padding asymmetrically when the parent has a
          tall line-height (the bottom border drifts up onto descenders).
          Table cell padding is part of the cell box model and html2canvas
          honors it symmetrically. */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderTop: '1px solid #000',
          borderBottom: '1px solid #000',
          marginTop: 4,
          tableLayout: 'fixed',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: '8px 0',
                textAlign: 'left',
                fontSize: '0.95em',
                fontWeight: 600,
                lineHeight: 1.3,
                verticalAlign: 'middle',
              }}
            >
              {paper.time_minutes ? `সময়: ${paper.time_minutes} মিনিট` : ''}
            </td>
            <td
              style={{
                padding: '8px 0',
                textAlign: 'right',
                fontSize: '0.95em',
                fontWeight: 600,
                lineHeight: 1.3,
                verticalAlign: 'middle',
              }}
            >
              {paper.total_marks ? `পূর্ণমান: ${paper.total_marks}` : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes / instructions */}
      {paper.instructions && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            fontSize: '0.9em',
            fontStyle: 'italic',
            lineHeight: 1.5,
            borderLeft: '3px solid #555',
            background: '#fafafa',
          }}
        >
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>নির্দেশনা: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

function QuestionList({ questions, layout = '1-column' }) {
  if (!questions || questions.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
        কোনো প্রশ্ন নেই।
      </p>
    )
  }

  const isTwoCol = layout === '2-column'
  const containerStyle = isTwoCol
    ? {
        columnCount: 2,
        columnGap: '5mm',
      }
    : {}

  return (
    <div style={containerStyle}>
      {questions.map((q, i) => (
        <div
          key={q.id || i}
          style={{
            marginBottom: 14,
            // No break-inside avoid here. With html2pdf, "avoid" pushes the
            // whole tall question to the next page if it doesn't fit, leaving
            // a big gap on the current page. We let questions split naturally
            // — only protect atomic blocks like the CQ stimulus and tables.
            WebkitColumnBreakInside: 'avoid', // still keep for column layout
          }}
        >
          <QuestionRow index={i + 1} q={q} />
        </div>
      ))}
    </div>
  )
}

function QuestionRow({ index, q }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ flexShrink: 0, fontWeight: 700 }}>
        {index}.
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <QuestionBody q={q} />
      </div>
    </div>
  )
}

function QuestionBody({ q }) {
  switch (q.type) {
    case 'MCQ':
      return <McqQuestion q={q} />
    case 'CQ':
      return <CqQuestion q={q} />
    case 'fill_blank':
      return <FillBlankQuestion q={q} />
    case 'matching':
      return <MatchingQuestion q={q} />
    case 'rearranging':
      return <RearrangingQuestion q={q} />
    case 'translation':
      return <TranslationQuestion q={q} />
    case 'table':
      return <TableQuestion q={q} />
    case 'short':
    case 'broad':
    default:
      return <SimpleQuestion q={q} />
  }
}

function SimpleQuestion({ q }) {
  return <MathText text={q.question || q.text || ''} />
}

function McqQuestion({ q }) {
  const options = [
    ['ক', q.option_a],
    ['খ', q.option_b],
    ['গ', q.option_c],
    ['ঘ', q.option_d],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '')

  return (
    <div>
      <MathText text={q.question || ''} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: 24,
          rowGap: 4,
          marginTop: 6,
          marginLeft: 4,
        }}
      >
        {options.map(([label, val]) => (
          <div key={label} style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontWeight: 600, minWidth: '1.2em' }}>{label}.</span>
            <MathText text={String(val)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function CqQuestion({ q }) {
  return (
    <div>
      {q.stimulus && (
        <MathText
          as="div"
          text={q.stimulus}
          style={{
            padding: '6px 8px',
            border: '1px solid #999',
            margin: '2px 0 4px',
            background: '#fafafa',
            // Stimulus is a bordered box — splitting it across pages looks bad
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        />
      )}
      <div>
        {(q.sub_questions || []).map((sq, i) => (
          <div key={i} style={{ marginBottom: 2, display: 'flex', gap: 4 }}>
            <span style={{ fontWeight: 600 }}>{sq.label || ''}</span>
            <MathText as="span" text={sq.text || ''} style={{ flex: 1 }} />
            {sq.marks ? (
              <span style={{ fontWeight: 600 }}>[{sq.marks}]</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function FillBlankQuestion({ q }) {
  return (
    <div>
      <MathText text={q.sentence || q.question || ''} />
      {q.clues && (
        <div style={{ fontSize: '0.88em', marginTop: 4, color: '#444' }}>
          (সংকেত: <MathText as="span" text={q.clues} />)
        </div>
      )}
    </div>
  )
}

function MatchingQuestion({ q }) {
  const a = q.column_a || []
  const b = q.column_b || []
  const rows = Math.max(a.length, b.length)
  return (
    <div>
      {q.question && <MathText as="div" text={q.question} />}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: 6,
          fontSize: '0.95em',
        }}
      >
        <thead>
          <tr>
            <th style={cellTH}>কলাম-ক</th>
            <th style={cellTH}>কলাম-খ</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td style={cellTD}><MathText text={a[i] || ''} /></td>
              <td style={cellTD}><MathText text={b[i] || ''} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RearrangingQuestion({ q }) {
  return (
    <div>
      <div style={{ fontStyle: 'italic', marginBottom: 4 }}>
        সঠিক ক্রমে সাজাও:
      </div>
      <ol style={{ listStyle: 'decimal', paddingLeft: '1.5em', margin: 0 }}>
        {(q.sentences || []).map((s, i) => (
          <li key={i}><MathText text={s} /></li>
        ))}
      </ol>
    </div>
  )
}

function TranslationQuestion({ q }) {
  const dir =
    q.direction === 'bn-en'
      ? 'বাংলা থেকে ইংরেজিতে অনুবাদ করুন:'
      : 'ইংরেজি থেকে বাংলায় অনুবাদ করুন:'
  return (
    <div>
      <div style={{ fontStyle: 'italic', marginBottom: 4 }}>{dir}</div>
      <MathText
        as="div"
        text={q.source_text || ''}
        style={{
          padding: '10px 12px',
          border: '1px solid #999',
          background: '#fafafa',
        }}
      />
    </div>
  )
}

function TableQuestion({ q }) {
  return (
    <div>
      {q.question && <MathText as="div" text={q.question} />}
      {q.rows && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
          <tbody>
            {q.rows.map((row, i) => (
              <tr key={i}>
                {(row || []).map((cell, j) => (
                  <td key={j} style={cellTD}><MathText text={cell || ''} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const cellTH = {
  border: '1px solid #555',
  padding: '5px 10px',
  fontWeight: 700,
  textAlign: 'left',
  background: '#f5f5f5',
}
const cellTD = {
  border: '1px solid #999',
  padding: '5px 10px',
}

export default PaperTemplate
