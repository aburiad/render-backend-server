import { forwardRef } from 'react'
import { MathText } from '@/utils/mathRender'
import { getSubLabel } from '@/utils/subNumbering'
import { computeQuestionNumbers } from '@/utils/sectionNumbering'

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

  // No padding on the element itself. Horizontal + vertical margins are added
  // outside this element so they apply consistently per page in every output:
  //   - html2pdf  → jsPDF `margin` option (PDFPreview.jsx)
  //   - browser print → @page margin in index.css
  //   - on-screen preview → wrapper padding around <PaperTemplate> in PDFPreview.jsx
  // Width is the printable content area (A4 210mm − 12mm × 2 horizontal margin).
  const pageStyle = {
    fontFamily: fontStack,
    fontSize: size,
    lineHeight: spacing,
    color: '#000',
    background: '#fff',
    width: '186mm',
    minHeight: '269mm',
    margin: '0 auto',
    boxSizing: 'border-box',
  }

  return (
    <div ref={ref} className="paper-print" style={pageStyle}>
      <Header paper={paper} />
      <QuestionList
        questions={questions}
        layout={paper?.layout || '1-column'}
        sectionMode={!!paper?.section_mode}
      />
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

      {/* Time (left) | Full marks (right) — borderless layout to avoid the
          html2canvas vertical-centering quirk with Bengali text inside two
          borders. Plain flex row — text positions itself naturally, no
          alignment needed. */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          marginBottom: 4,
          fontSize: '0.95em',
          fontWeight: 600,
        }}
      >
        <span>
          {paper.time_minutes ? `সময়: ${paper.time_minutes} মিনিট` : ''}
        </span>
        <span>
          {paper.total_marks ? `পূর্ণমান: ${paper.total_marks}` : ''}
        </span>
      </div>

      {/* Notes / instructions — plain text, no box. Avoids html2canvas
          vertical-centering quirks with Bengali fonts. */}
      {paper.instructions && (
        <div
          style={{
            marginTop: 10,
            fontSize: '0.9em',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>নির্দেশনা: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

function QuestionList({ questions, layout = '1-column', sectionMode = false }) {
  if (!questions || questions.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
        কোনো প্রশ্ন নেই।
      </p>
    )
  }

  // Section dividers are filtered out entirely when section mode is off.
  // When on, they stay in the array and the renderer below outputs a
  // header for each one, while computeQuestionNumbers resets the counter.
  const visible = sectionMode
    ? questions
    : questions.filter((q) => q?.type !== 'section')
  const numbers = computeQuestionNumbers(visible, sectionMode)

  // 1/2/3 column support. Multi-column uses CSS columns; per-question
  // break-inside avoid (already set on each question wrapper below) keeps
  // one question from getting sliced across two columns mid-text.
  const colCount = layout === '3-column' ? 3 : layout === '2-column' ? 2 : 1
  const containerStyle = colCount === 3
    ? { columnCount: 3, columnGap: '4mm', fontSize: '0.85em' }
    : colCount === 2
    ? { columnCount: 2, columnGap: '5mm' }
    : {}

  return (
    <div style={containerStyle}>
      {visible.map((q, i) => {
        if (q?.type === 'section') {
          return <SectionHeader key={q.id || `s-${i}`} q={q} />
        }
        return (
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
            <QuestionRow index={numbers[i]} q={q} />
          </div>
        )
      })}
    </div>
  )
}

function SectionHeader({ q }) {
  return (
    <div
      style={{
        margin: '14px 0 8px',
        textAlign: 'center',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontSize: '1.1em',
          fontWeight: 700,
          padding: '2px 24px',
          borderTop: '1.5px solid #000',
          borderBottom: '1.5px solid #000',
        }}
      >
        {q.title || ''}
      </div>
      {q.instruction && (
        <div
          style={{
            fontSize: '0.9em',
            fontStyle: 'italic',
            marginTop: 4,
            textAlign: 'center',
          }}
        >
          {q.instruction}
        </div>
      )}
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
    case 'accounting':
      return <AccountingQuestion q={q} />
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
  const numbering = q.sub_numbering || 'bn-letter'
  const layout = q.sub_layout || 2
  const optionKeys = ['a', 'b', 'c', 'd']
  const options = optionKeys
    .map((key, i) => ({
      label: getSubLabel(numbering, i, key.toUpperCase()),
      value: q[`option_${key}`],
    }))
    .filter((o) => o.value !== undefined && o.value !== null && o.value !== '')

  const cols = layout === 1 || layout === 2 || layout === 4 ? layout : 2
  return (
    <div>
      <MathText text={q.question || ''} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          columnGap: 24,
          rowGap: 4,
          marginTop: 6,
          marginLeft: 4,
        }}
      >
        {options.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, minWidth: 0 }}>
            <span style={{ fontWeight: 600, flexShrink: 0 }}>{o.label}.</span>
            <MathText as="span" text={String(o.value)} style={{ flex: 1, minWidth: 0 }} />
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
            margin: '2px 0 4px',
            // Stimulus often spans multiple lines — keep it together on one page
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        />
      )}
      {q.stimulus_image && (
        <div
          style={{
            margin: '6px 0',
            textAlign: 'center',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
          <img
            src={q.stimulus_image}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '90mm',
              objectFit: 'contain',
              display: 'inline-block',
            }}
            crossOrigin="anonymous"
          />
        </div>
      )}
      <SubQuestionGrid
        subs={q.sub_questions || []}
        numbering={q.sub_numbering || 'bn-letter'}
        layout={q.sub_layout || 1}
        labelSuffix=")"
      />
    </div>
  )
}

function SubQuestionGrid({ subs, numbering, layout, labelSuffix = '.' }) {
  if (!subs.length) return null
  const cols = layout === 2 || layout === 4 ? layout : 1
  const containerStyle =
    cols === 1
      ? { marginTop: 4 }
      : {
          marginTop: 4,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          columnGap: 12,
          rowGap: 2,
        }
  return (
    <div style={containerStyle}>
      {subs.map((sq, i) => {
        const displayLabel = getSubLabel(numbering, i, sq.label || '')
        return (
          <div
            key={i}
            style={{
              marginBottom: 2,
              display: 'flex',
              gap: 4,
              alignItems: 'baseline',
              minWidth: 0,
            }}
          >
            <span style={{ fontWeight: 600, flexShrink: 0 }}>
              {displayLabel}
              {displayLabel ? labelSuffix : ''}
            </span>
            <MathText as="span" text={sq.text || ''} style={{ flex: 1, minWidth: 0 }} />
            {sq.marks ? (
              <span style={{ fontWeight: 600, flexShrink: 0 }}>{sq.marks}</span>
            ) : null}
          </div>
        )
      })}
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
          // Matching tables look broken when split mid-row across pages
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
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
  const numbering = q.sub_numbering || 'arabic-en'
  const layout = q.sub_layout || 1
  const cols = layout === 1 || layout === 2 || layout === 4 ? layout : 1
  const sentences = q.sentences || []
  const containerStyle =
    cols === 1
      ? { marginTop: 4 }
      : {
          marginTop: 4,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          columnGap: 24,
          rowGap: 4,
        }
  return (
    <div>
      <div style={{ fontStyle: 'italic', marginBottom: 4 }}>
        {q.question || 'সঠিক ক্রমে সাজাও:'}
      </div>
      <div style={containerStyle}>
        {sentences.map((s, i) => {
          const displayLabel = getSubLabel(numbering, i, String(i + 1))
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'baseline',
                marginBottom: cols === 1 ? 2 : 0,
                minWidth: 0,
              }}
            >
              <span style={{ fontWeight: 600, flexShrink: 0 }}>{displayLabel}.</span>
              <MathText as="span" text={s} style={{ flex: 1, minWidth: 0 }} />
            </div>
          )
        })}
      </div>
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
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: 6,
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
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

function AccountingQuestion({ q }) {
  const headers = q.headers || []
  const alignments = q.alignments || headers.map((_, i) => (i === 0 ? 'left' : 'right'))
  const titleLines = (q.title_lines || []).filter((l) => l && String(l).trim() !== '')
  const showTotal = q.show_total !== false && Array.isArray(q.total_row)
  const subs = q.sub_questions || []

  return (
    <div>
      {/* বিবরণ — top intro */}
      {q.description && (
        <MathText as="div" text={q.description} style={{ marginBottom: 4 }} />
      )}

      {/* Optional stimulus image attached to বিবরণ */}
      {q.description_image && (
        <div
          style={{
            margin: '6px 0',
            textAlign: 'center',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
          <img
            src={q.description_image}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '90mm',
              objectFit: 'contain',
              display: 'inline-block',
            }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Centered title block */}
      {titleLines.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            margin: '4px 0 6px',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
          {titleLines.map((line, i) => (
            <div key={i} style={{ fontWeight: 600, lineHeight: 1.4 }}>
              <MathText as="span" text={line} />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {q.rows && headers.length > 0 && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '4px 0',
            fontSize: '0.95em',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    border: '1px solid #000',
                    padding: '4px 8px',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: '#f0f0f0',
                  }}
                >
                  <MathText as="span" text={h || ''} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.rows.map((row, ri) => (
              <tr key={ri}>
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    style={{
                      border: '1px solid #555',
                      padding: '3px 8px',
                      textAlign: alignments[ci] || 'left',
                    }}
                  >
                    <MathText as="span" text={(row && row[ci]) || ''} />
                  </td>
                ))}
              </tr>
            ))}
            {showTotal && (
              <tr>
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    style={{
                      border: '1px solid #000',
                      borderTop: '2px solid #000',
                      borderBottom: '3px double #000',
                      padding: '4px 8px',
                      fontWeight: 700,
                      textAlign: alignments[ci] || 'left',
                    }}
                  >
                    <MathText as="span" text={q.total_row[ci] || ''} />
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* সমন্বয় / Notes */}
      {q.notes && (
        <div style={{ marginTop: 4, marginBottom: 4 }}>
          {q.notes_label && (
            <span style={{ fontWeight: 700 }}>{q.notes_label}: </span>
          )}
          <MathText as="span" text={q.notes} />
        </div>
      )}

      {/* Sub-questions */}
      <SubQuestionGrid
        subs={subs}
        numbering={q.sub_numbering || 'bn-letter'}
        layout={q.sub_layout || 1}
        labelSuffix="."
      />
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
