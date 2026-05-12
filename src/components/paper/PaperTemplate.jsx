import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MathText } from '@/utils/mathRender'
import { getSubLabel } from '@/utils/subNumbering'
import { computeQuestionNumbers } from '@/utils/sectionNumbering'

// CSS px per mm at the 96-dpi spec ratio: 1mm = 96/25.4 ≈ 3.7795 px.
// CSS unit calculations are always in CSS pixels, independent of devicePixelRatio.
const MM_PER_PX = 96 / 25.4
// Inter-item spacing in CSS pixels (matches inline `marginBottom: 14` used below).
const ITEM_SPACING_PX = 14

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
  { paper, questions, font = 'Noto Serif Bengali', size = '12pt', spacing = '1.85', orientation = 'portrait', columnGap },
  ref,
) {
  const fontStack = `"${font}", "Hind Siliguri", "Noto Sans Bengali", serif`
  const isLandscape = orientation === 'landscape'

  // No padding on the element itself. Horizontal + vertical margins are added
  // outside this element so they apply consistently per page in every output:
  //   - html2pdf  → jsPDF `margin` option (PDFPreview.jsx)
  //   - browser print → @page margin in index.css
  //   - on-screen preview → wrapper padding around <PaperTemplate> in PDFPreview.jsx
  // Width = printable content area (A4 − 12mm × 2 horizontal margin):
  //   portrait  → 210 − 24 = 186mm wide, 297 − 28 = 269mm tall
  //   landscape → 297 − 24 = 273mm wide, 210 − 28 = 182mm tall
  const pageStyle = {
    fontFamily: fontStack,
    fontSize: size,
    lineHeight: spacing,
    color: '#000',
    background: '#fff',
    width: isLandscape ? '273mm' : '186mm',
    minHeight: isLandscape ? '182mm' : '269mm',
    margin: '0 auto',
    boxSizing: 'border-box',
  }

  const layoutKey = paper?.layout || '1-column'
  const colCount = layoutKey === '3-column' ? 3 : layoutKey === '2-column' ? 2 : 1

  return (
    <div
      ref={ref}
      className={`paper-print${isLandscape ? ' paper-print-landscape' : ''}`}
      style={pageStyle}
    >
      {colCount === 1 ? (
        <>
          {/*
           * Single column path: header on top, then natural block flow.
           * html2pdf captures the tall flow and jsPDF slices it by A4 height,
           * which preserves natural top-to-bottom reading order — no
           * pre-pagination needed.
           */}
          <Header paper={paper} />
          <QuestionList
            questions={questions}
            layout={layoutKey}
            sectionMode={!!paper?.section_mode}
            columnGap={columnGap}
          />
        </>
      ) : (
        /*
         * Multi-column path: pre-paginate. CSS multi-column inside a tall
         * single container makes html2pdf slice the column-balanced output
         * into A4 strips, which scrambles reading order (page 1 left col =
         * top items, page 1 right col = items from somewhere down the
         * middle of the second column). Instead we measure each question's
         * height, bin-pack into A4-sized pages with explicit grid columns,
         * and set `pageBreakAfter: always` between pages so html2pdf
         * actually starts a new PDF page where we say to.
         *
         * Section dividers force the next column (or next page if already
         * in the last column) so a section always starts at a fresh boundary.
         * The institution / exam header is placed inside page 1's first
         * column only, never repeated.
         */
        <PaginatedColumns
          paper={paper}
          questions={questions}
          sectionMode={!!paper?.section_mode}
          colCount={colCount}
          isLandscape={isLandscape}
          columnGap={columnGap}
          font={font}
          size={size}
          spacing={spacing}
        />
      )}
    </div>
  )
})

/**
 * Multi-column paginated renderer. Two-pass:
 *   1. Hidden measurer renders each question at the exact final column width
 *      and reads offsetHeight after fonts are ready.
 *   2. binPack distributes items into pages × columns by cumulative height,
 *      honouring section dividers as forced column/page breaks. Page 1's
 *      first column reserves the header's height so the header fits there.
 *
 * Re-measures whenever anything that affects rendered height changes
 * (font / size / spacing / orientation / column gap / question list).
 */
function PaginatedColumns({
  paper,
  questions,
  sectionMode,
  colCount,
  isLandscape,
  columnGap,
  font,
  size,
  spacing,
}) {
  const measurerRef = useRef(null)
  const [pages, setPages] = useState(null)

  // Memoise so the measurement effect's identity-based dependency check
  // doesn't re-fire on every parent render. Without this, every font/size
  // tweak in the parent would loop measurement → setState → re-render → measure.
  const visible = useMemo(
    () => (sectionMode ? (questions || []) : (questions || []).filter((q) => q?.type !== 'section')),
    [questions, sectionMode],
  )
  const numbers = useMemo(() => computeQuestionNumbers(visible, sectionMode), [visible, sectionMode])

  // Default gap matches the legacy single-pass values: 5mm for 2-col, 4mm for 3-col.
  const defaultGapMm = colCount === 3 ? 4 : 5
  const gapMm = (() => {
    const v = parseFloat(String(columnGap || '').replace(/[^0-9.]/g, ''))
    return Number.isFinite(v) && v > 0 ? v : defaultGapMm
  })()
  // A4 printable area inside the 12mm horizontal / 14mm vertical margins
  // already baked in by the wrapper / jsPDF.
  const pageWidthMm = isLandscape ? 273 : 186
  const pageHeightMm = isLandscape ? 182 : 269
  const colWidthMm = (pageWidthMm - gapMm * (colCount - 1)) / colCount
  const pageColHeightPx = pageHeightMm * MM_PER_PX

  useLayoutEffect(() => {
    if (!measurerRef.current) return
    let cancelled = false

    const measure = () => {
      if (cancelled || !measurerRef.current) return
      const headerEl = measurerRef.current.querySelector('[data-pq-header]')
      const headerHeight = headerEl?.offsetHeight || 0
      const itemEls = measurerRef.current.querySelectorAll('[data-pq-idx]')
      const heights = []
      itemEls.forEach((el) => {
        heights.push(el.offsetHeight)
      })
      const packed = binPack(visible, heights, headerHeight, pageColHeightPx, colCount)
      if (!cancelled) setPages(packed)
    }

    // KaTeX + Bengali font swap can shift measured heights — wait for
    // fonts before reading offsetHeight, otherwise the system fallback
    // gives different metrics than the final rendered output.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // rAF: ensure layout has settled after fonts swapped in.
        requestAnimationFrame(measure)
      })
    } else {
      requestAnimationFrame(measure)
    }

    return () => { cancelled = true }
    // numbers is derived from visible + sectionMode (already in deps).
    // pageColHeightPx / colWidthMm are derived from gapMm + isLandscape (in deps).
  }, [visible, sectionMode, colCount, gapMm, isLandscape, font, size, spacing, pageColHeightPx])

  return (
    <>
      {/* Hidden measurer.
          Header is measured at FULL paper content width because in the
          visible render it spans across all columns at the top of page 1
          — not confined to any single column. Question items are measured
          at single-column width to match where they actually render. */}
      <div
        ref={measurerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-99999px',
          top: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div data-pq-header style={{ width: `${pageWidthMm}mm` }}>
          <Header paper={paper} />
        </div>
        <div style={{ width: `${colWidthMm}mm` }}>
          {visible.map((q, i) => (
            <div key={q?.id || `m-${i}`} data-pq-idx={i} style={{ marginBottom: ITEM_SPACING_PX }}>
              <RenderedItem q={q} number={numbers[i]} outerColumns={colCount} />
            </div>
          ))}
        </div>
      </div>

      {/* Real paginated render. Until measurement completes, render a
          placeholder of one A4 page height so the layout doesn't jump. */}
      {pages === null ? (
        <div style={{ height: `${pageHeightMm}mm` }} />
      ) : (
        pages.map((page, pi) => (
          /*
           * Each page wrapper is *exactly* the A4 content area in height.
           * html2pdf's auto-pagination slices the captured image at the same
           * 269mm boundary (= page content area after jsPDF's 14mm top/bottom
           * margins), so wrapper N aligns exactly with PDF page N.
           *
           * Critically: DO NOT use `page-break-after: always` here. That would
           * fire IN ADDITION to auto-pagination, double-breaking and producing
           * a blank PDF page after every real page. Likewise no `marginTop`
           * between wrappers — any gap shifts the next wrapper out of alignment
           * with the 269mm slice boundary and causes content to spill across
           * pages.
           *
           * overflow:hidden clips a single ultra-tall question that exceeds
           * column height; without it the overflow would paint over the next
           * page wrapper and html2canvas would capture the collision.
           *
           * Page 1 layout:  [ full-width Header        ]
           *                 [ col 1 │ col 2 │ … col N  ]   ← flex:1 fills remainder
           * Pages 2..N:     [ col 1 │ col 2 │ … col N  ]   ← no header, full height
           */
          <div
            key={pi}
            style={{
              height: `${pageHeightMm}mm`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {pi === 0 && <Header paper={paper} />}
            <div
              style={{
                flex: '1 1 0',
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                columnGap: `${gapMm}mm`,
                overflow: 'hidden',
              }}
            >
              {page.cols.map((col, ci) => (
                <div key={ci} style={{ minWidth: 0 }}>
                  {col.map((idx) => {
                    const q = visible[idx]
                    return (
                      <div key={q?.id || idx} style={{ marginBottom: ITEM_SPACING_PX }}>
                        <RenderedItem q={q} number={numbers[idx]} outerColumns={colCount} />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  )
}

function RenderedItem({ q, number, outerColumns }) {
  if (q?.type === 'section') {
    return <SectionHeader q={q} />
  }
  return <QuestionRow index={number} q={q} outerColumns={outerColumns} />
}

/**
 * Greedy first-fit pagination.
 *
 * Per item we add (offsetHeight + ITEM_SPACING_PX) to the current column.
 * Page 1 columns have a reduced capacity equal to (pageColHeightPx − headerHeight)
 * because the full-width header sits *above* the columns on that page,
 * shrinking the column area for every column on page 1. Pages 2+ use the
 * full pageColHeightPx capacity (no header).
 *
 * Section dividers force a move to the next column (or next page if the
 * current column is the last one) UNLESS the current column is already
 * empty — then the section can stay where it is.
 *
 * If a single item is taller than a full column it still gets placed
 * (because we always place at least one item per column) — the overflow
 * is clipped by the wrapper's overflow:hidden. Edge case; acceptable.
 */
function binPack(visible, heights, headerHeight, pageColHeightPx, colCount) {
  const capacityFor = (pageIdx) =>
    pageIdx === 0 ? Math.max(0, pageColHeightPx - headerHeight) : pageColHeightPx

  const pages = [makePage(colCount)]
  let curPage = 0
  let curCol = 0

  const moveToNextSlot = () => {
    if (curCol + 1 < colCount) {
      curCol++
    } else {
      pages.push(makePage(colCount))
      curPage++
      curCol = 0
    }
  }

  for (let i = 0; i < visible.length; i++) {
    const q = visible[i]
    const h = (heights[i] || 0) + ITEM_SPACING_PX

    if (q?.type === 'section') {
      // Force a fresh column for the section header
      while (pages[curPage].cols[curCol].length > 0) {
        moveToNextSlot()
      }
      pages[curPage].cols[curCol].push(i)
      pages[curPage].colH[curCol] += h
      continue
    }

    // Place regular questions: try current column, else move to next.
    while (true) {
      const slot = pages[curPage]
      const colHeight = slot.colH[curCol]
      const colItems = slot.cols[curCol]
      const capacity = capacityFor(curPage)
      if (colItems.length === 0 || colHeight + h <= capacity) {
        slot.cols[curCol].push(i)
        slot.colH[curCol] += h
        break
      }
      moveToNextSlot()
    }
  }

  return pages
}

function makePage(colCount) {
  return {
    cols: Array.from({ length: colCount }, () => []),
    colH: Array.from({ length: colCount }, () => 0),
  }
}

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

function QuestionList({ questions, layout = '1-column', sectionMode = false, columnGap }) {
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
  // break-inside avoid (set on each question wrapper below) prevents one
  // question from getting sliced across columns mid-text — we set BOTH the
  // legacy WebkitColumnBreakInside and the standard `break-inside: avoid-column`,
  // because some Chromium builds (which html2canvas uses) honor only the
  // standard property reliably and ignore the legacy one. That's the bug
  // that caused later questions' number prefixes to bleed into the previous
  // question's option grid (e.g. "১৮." showing up inside Q11's options).
  const colCount = layout === '3-column' ? 3 : layout === '2-column' ? 2 : 1
  // Column gap: user override wins; otherwise per-layout default (3-col tighter).
  const effectiveGap = columnGap || (colCount === 3 ? '4mm' : '5mm')
  const containerStyle = colCount === 3
    ? { columnCount: 3, columnGap: effectiveGap, fontSize: '0.85em' }
    : colCount === 2
    ? { columnCount: 2, columnGap: effectiveGap }
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
              // Standard + legacy column-break avoidance. `avoid-column` only
              // protects against column splits, NOT page splits — so html2pdf
              // can still split a tall question across pages without leaving
              // big gaps. WebkitColumnBreakInside kept for old WebKit fallback.
              breakInside: 'avoid-column',
              WebkitColumnBreakInside: 'avoid',
            }}
          >
            <QuestionRow index={numbers[i]} q={q} outerColumns={colCount} />
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

function QuestionRow({ index, q, outerColumns = 1 }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ flexShrink: 0, fontWeight: 700 }}>
        {index}.
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <QuestionBody q={q} outerColumns={outerColumns} />
      </div>
    </div>
  )
}

function QuestionBody({ q, outerColumns = 1 }) {
  switch (q.type) {
    case 'MCQ':
      return <McqQuestion q={q} outerColumns={outerColumns} />
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

function McqQuestion({ q, outerColumns = 1 }) {
  const numbering = q.sub_numbering || 'bn-letter'
  const optionKeys = ['a', 'b', 'c', 'd']
  const options = optionKeys
    .map((key, i) => ({
      label: getSubLabel(numbering, i, key.toUpperCase()),
      value: q[`option_${key}`],
    }))
    .filter((o) => o.value !== undefined && o.value !== null && o.value !== '')

  // When the paper itself is rendered in 2 or 3 outer columns, each column
  // is already narrow (~90mm in 2-col, ~57mm in 3-col). Putting MCQ options
  // in 2 sub-columns on top of that gives ~40mm / ~25mm wide cells — too
  // narrow for typical set-notation options like {4,8,12,16,20,24,28,32,36,40}
  // which render as a single KaTeX inline-block that cannot word-wrap. The
  // result was options visually bleeding into adjacent cells (the Q4 bug).
  // So when the outer layout is multi-column, force MCQ options to stack
  // vertically (1 column) — giving each option the full column width.
  const requested = q.sub_layout || 2
  const safeRequested = requested === 1 || requested === 2 || requested === 4 ? requested : 2
  const cols = outerColumns > 1 ? 1 : safeRequested
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
          <div key={i} style={{ display: 'flex', gap: 6, minWidth: 0, overflowWrap: 'anywhere' }}>
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
