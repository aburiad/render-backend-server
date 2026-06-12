import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MathText } from '@/utils/mathRender'
import { getSubLabel } from '@/utils/subNumbering'
import { computeQuestionNumbers, formatQuestionNumber } from '@/utils/sectionNumbering'
import { getPaperLabels } from '@/utils/paperLabels'

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
  const fontStack = `"${font}", "Hind Siliguri", "Noto Sans Bengali", "Noto Naskh Arabic", "Amiri", serif`
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
    position: 'relative',
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
            numberingStyle={paper?.print_settings?.questionNumbering || 'en'}
            questionDirection={paper?.print_settings?.questionDirection || 'ltr'}
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
          numberingStyle={paper?.print_settings?.questionNumbering || 'en'}
          questionDirection={paper?.print_settings?.questionDirection || 'ltr'}
          colCount={colCount}
          isLandscape={isLandscape}
          columnGap={columnGap}
          font={font}
          size={size}
          spacing={spacing}
        />
      )}
      {colCount === 1 && (
        <TiledWatermarks
          text={paper?.watermark}
          pageHeightMm={isLandscape ? 182 : 269}
        />
      )}
    </div>
  )
})

function WatermarkText({ text }) {
  return (
    <div
      style={{
        transform: 'rotate(-35deg)',
        transformOrigin: 'center center',
        fontSize: '3.5rem',
        fontWeight: 700,
        color: 'rgba(0, 0, 0, 0.07)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  )
}

/** Single-page watermark overlay (2/3-column paginated pages). */
function Watermark({ text }) {
  if (!text) return null
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <WatermarkText text={text} />
    </div>
  )
}

/** 1-column: repeat a centered watermark every A4 page height. */
function TiledWatermarks({ text, pageHeightMm }) {
  const hostRef = useRef(null)
  const [pageCount, setPageCount] = useState(1)
  const pageHeightPx = pageHeightMm * MM_PER_PX

  useLayoutEffect(() => {
    const parent = hostRef.current?.parentElement
    if (!parent || !text) return

    const update = () => {
      setPageCount(Math.max(1, Math.ceil(parent.offsetHeight / pageHeightPx)))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [text, pageHeightPx])

  if (!text) return null

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: pageCount }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: i * pageHeightPx,
            left: 0,
            width: '100%',
            height: pageHeightPx,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <WatermarkText text={text} />
        </div>
      ))}
    </div>
  )
}

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
  numberingStyle,
  questionDirection,
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
  }, [visible, sectionMode, numberingStyle, colCount, gapMm, isLandscape, font, size, spacing, pageColHeightPx])

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
              <RenderedItem
                q={q}
                number={formatQuestionNumber(numbers[i], numberingStyle)}
                questionDirection={questionDirection}
                outerColumns={colCount}
              />
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
              position: 'relative',
            }}
          >
            <Watermark text={paper?.watermark} />
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
                        <RenderedItem
                          q={q}
                          number={formatQuestionNumber(numbers[idx], numberingStyle)}
                          questionDirection={questionDirection}
                          outerColumns={colCount}
                        />
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

function RenderedItem({ q, number, questionDirection = 'ltr', outerColumns }) {
  if (q?.type === 'section') {
    return <SectionHeader q={q} />
  }
  return <QuestionRow index={number} q={q} questionDirection={questionDirection} outerColumns={outerColumns} />
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

/**
 * Check if the class is primary level (Nursery to Class 5)
 */
function isPrimaryClass(className) {
  if (!className) return false
  const str = String(className).trim()
  const primaryNames = ['নার্সারি', 'কেজি', 'প্লে', 'nursery', 'kg', 'play']
  if (primaryNames.some((p) => str.toLowerCase().includes(p.toLowerCase()) || str.includes(p))) return true
  const primaryNums = ['১', '২', '৩', '৪', '৫', '1', '2', '3', '4', '5']
  // Match exact digit or "Class 1" / "শ্রেণি ১" patterns
  if (primaryNums.some((n) => str === n || str === `শ্রেণি ${n}` || str === `Class ${n}` || str === `class ${n}`)) return true
  // Match "১ম" (1st), "২য়" (2nd) etc.
  if (/^[১৫১২৩৪][ময়র্ং]?(\s|$)/.test(str)) return true
  return false
}

/**
 * School Classic Header — Traditional school exam paper layout
 * Top: School name + exam title + class/subject/set centered
 * Bottom row: Time (left) | Marks (right)
 */
function SchoolClassicHeader({ paper }) {
  const numberingStyle = paper?.print_settings?.questionNumbering || 'en'
  const timeValue = paper.time_minutes ? formatQuestionNumber(paper.time_minutes, numberingStyle) : ''
  const marksValue = paper.total_marks ? formatQuestionNumber(paper.total_marks, numberingStyle) : ''
  const logoAlign = paper?.print_settings?.logoAlignment || 'left'

  return (
    <header style={{ marginBottom: 18 }}>
      {/* Top section: School name + exam info */}
      {/* Logo + Institution Name — block level, stacked */}
      {paper.logo_url && (
        <div style={{
          textAlign: logoAlign === 'right' ? 'right' : logoAlign === 'center' ? 'center' : 'left',
          marginBottom: 4,
        }}>
          <img
            src={paper.logo_url}
            alt=""
            style={{ width: 55, height: 55, objectFit: 'contain', display: 'inline-block' }}
            crossOrigin="anonymous"
          />
        </div>
      )}
      {paper.institution_name ? (
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: '1.35em', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.3 }}>
            {paper.institution_name}
          </div>
        </div>
      ) : null}
      <div style={{ textAlign: 'center' }}>
        {/* Exam title + session year */}
        {paper.exam_title && (
          <div style={{ fontSize: '1.1em', fontWeight: 700, marginTop: 4 }}>
            {paper.exam_title}
            {paper.session_year ? ` — ${paper.session_year}` : ''}
            {paper.set_variant ? ` (সেট ${paper.set_variant})` : ''}
          </div>
        )}
        {/* Class + Subject row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6, fontSize: '0.95em', fontWeight: 600 }}>
          {paper.class_name && <span>শ্রেণি: {paper.class_name}</span>}
          {paper.subject && <span>বিষয়: {paper.subject}</span>}
        </div>
      </div>

      {/* Divider line */}
      <div style={{ borderBottom: '1.5px solid #000', marginTop: 10, marginBottom: 8 }} />

      {/* Bottom row: Time (left) | Marks (right) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.95em',
        fontWeight: 600,
      }}>
        <span>
          {timeValue ? `সময়: ${timeValue} মিনিট` : '\u00A0'}
        </span>
        <span>
          {marksValue ? `পূর্ণমান: ${marksValue}` : '\u00A0'}
        </span>
      </div>

      {/* Instructions */}
      {paper.instructions && (
        <div style={{ marginTop: 10, fontSize: '0.9em', fontStyle: 'italic', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>নির্দেশনা: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

/**
 * Primary & KG Kids-Friendly Header
 * Framed layout: Logo | School Name + Exam Badge | Time/Marks box | Student Info grid
 * Print-safe: borders + subtle #f5f5f5 only — no saturated colors.
 */
function PrimaryHeader({ paper }) {
  const numberingStyle = paper?.print_settings?.questionNumbering || 'en'
  const timeValue = paper.time_minutes ? formatQuestionNumber(paper.time_minutes, numberingStyle) : ''
  const marksValue = paper.total_marks ? formatQuestionNumber(paper.total_marks, numberingStyle) : ''

  return (
    <header style={{ marginBottom: 18 }}>
      {/* Outer frame */}
      <div style={{ border: '2.5px solid #000', borderRadius: 4 }}>

        {/* Top section: Logo | Name + Badge | Time/Marks box */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px 8px' }}>
          {/* Logo */}
          {paper.logo_url && (
            <div style={{ flexShrink: 0, marginRight: 12 }}>
              <img
                src={paper.logo_url}
                alt=""
                style={{ width: 62, height: 62, objectFit: 'contain', display: 'block' }}
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Center: Institution + Badge */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            {paper.institution_name && (
              <div style={{ fontSize: '21px', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.25 }}>
                {paper.institution_name}
              </div>
            )}
            {/* Thin rule with diamond */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '5px auto', maxWidth: 200 }}>
              <div style={{ flex: 1, height: 0, borderTop: '1px solid #777' }} />
              <div style={{ width: 5, height: 5, border: '1px solid #555', transform: 'rotate(45deg)', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 0, borderTop: '1px solid #777' }} />
            </div>
            {paper.exam_title && (
              <div style={{
                display: 'inline-block',
                padding: '2px 16px',
                border: '1.5px solid #333',
                borderRadius: 18,
                fontSize: '13px',
                fontWeight: 700,
                background: '#f5f5f5',
                letterSpacing: '0.03em',
              }}>
                {paper.exam_title}{paper.session_year ? ` — ${paper.session_year}` : ''}
              </div>
            )}
          </div>

          {/* Right: Time & Marks in stacked box */}
          {(timeValue || marksValue) && (
            <div style={{
              flexShrink: 0,
              marginLeft: 12,
              textAlign: 'center',
              fontSize: '0.88em',
              fontWeight: 700,
              lineHeight: 1,
              border: '1px solid #bbb',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              {timeValue && (
                <div style={{ padding: '5px 10px', background: '#f5f5f5', borderBottom: marksValue ? '1px solid #bbb' : 'none' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#555', marginBottom: 2 }}>সময়</div>
                  <div>{timeValue} মিনিট</div>
                </div>
              )}
              {marksValue && (
                <div style={{ padding: '5px 10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#555', marginBottom: 2 }}>পূর্ণমান</div>
                  <div>{marksValue}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Student info strip: Name | Roll | Date */}
        <div style={{
          borderTop: '1.5px solid #000',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
        }}>
          <div style={{ padding: '6px 12px', borderRight: '1px solid #bbb', display: 'flex', alignItems: 'baseline', gap: 5, fontSize: '0.9em', fontWeight: 600 }}>
            <span style={{ flexShrink: 0 }}>শিক্ষার্থীর নাম:</span>
            <span style={{ flex: 1, borderBottom: '1.5px dotted #444', display: 'inline-block', minWidth: 0 }}>{' '}</span>
          </div>
          <div style={{ padding: '6px 12px', borderRight: '1px solid #bbb', display: 'flex', alignItems: 'baseline', gap: 5, fontSize: '0.9em', fontWeight: 600 }}>
            <span style={{ flexShrink: 0 }}>রোল নং:</span>
            <span style={{ flex: 1, borderBottom: '1.5px dotted #444', display: 'inline-block', minWidth: 0 }}>{' '}</span>
          </div>
          <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'baseline', gap: 5, fontSize: '0.9em', fontWeight: 600 }}>
            <span style={{ flexShrink: 0 }}>তারিখ:</span>
            <span style={{ flex: 1, borderBottom: '1.5px dotted #444', display: 'inline-block', minWidth: 0 }}>{' '}</span>
          </div>
        </div>

        {/* Class + Subject strip */}
        <div style={{
          borderTop: '1px dashed #aaa',
          display: 'flex',
          padding: '5px 12px',
          background: '#f7f7f7',
        }}>
          {paper.class_name && (
            <div style={{ marginRight: 24, fontSize: '0.88em', fontWeight: 700 }}>
              শ্রেণি: <span style={{ fontWeight: 800 }}>{paper.class_name}</span>
            </div>
          )}
          {paper.subject && (
            <div style={{ fontSize: '0.88em', fontWeight: 700 }}>
              বিষয়: <span style={{ fontWeight: 800 }}>{paper.subject}</span>
            </div>
          )}
        </div>
      </div>

      {paper.instructions && (
        <div style={{ marginTop: 8, fontSize: '0.9em', fontStyle: 'italic', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>নির্দেশনা: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

/**
 * Kids Illustrated Header — Centered, framed with diamond rule + bordered info grid
 * Print-safe: borders + subtle #f8f8f8 only — no saturated colors.
 */
function KidsIllustratedHeader({ paper }) {
  const numberingStyle = paper?.print_settings?.questionNumbering || 'en'
  const timeValue = paper.time_minutes ? formatQuestionNumber(paper.time_minutes, numberingStyle) : ''
  const marksValue = paper.total_marks ? formatQuestionNumber(paper.total_marks, numberingStyle) : ''

  const infoPills = [
    paper.class_name ? `শ্রেণি: ${paper.class_name}` : '',
    paper.subject ? `বিষয়: ${paper.subject}` : '',
    timeValue ? `সময়: ${timeValue} মি.` : '',
    marksValue ? `পূর্ণমান: ${marksValue}` : '',
  ].filter(Boolean)

  return (
    <header style={{ marginBottom: 18 }}>
      {/* Outer decorative frame */}
      <div style={{ border: '2.5px solid #000', borderRadius: 4, position: 'relative' }}>
        {/* Inner dashed border for depth */}
        <div style={{
          position: 'absolute', inset: 3,
          border: '1px dashed #777',
          borderRadius: 2,
          pointerEvents: 'none',
        }} />

        {/* Logo + Institution */}
        <div style={{ textAlign: 'center', padding: '12px 20px 10px', position: 'relative' }}>
          {paper.logo_url && (
            <div style={{ marginBottom: 6 }}>
              <img
                src={paper.logo_url}
                alt=""
                style={{ width: 64, height: 64, objectFit: 'contain', display: 'inline-block' }}
                crossOrigin="anonymous"
              />
            </div>
          )}
          {paper.institution_name && (
            <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.2 }}>
              {paper.institution_name}
            </div>
          )}
          {/* Diamond rule */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '6px auto', maxWidth: 220 }}>
            <div style={{ flex: 1, height: 0, borderTop: '1px solid #888' }} />
            <div style={{ width: 6, height: 6, border: '1.5px solid #555', transform: 'rotate(45deg)', flexShrink: 0 }} />
            <div style={{ flex: 1, height: 0, borderTop: '1px solid #888' }} />
          </div>
          {/* Exam badge */}
          {paper.exam_title && (
            <div style={{
              display: 'inline-block',
              padding: '3px 18px',
              border: '1.5px solid #333',
              borderRadius: 20,
              fontSize: '13px',
              fontWeight: 700,
              background: '#f8f8f8',
              letterSpacing: '0.03em',
            }}>
              {paper.exam_title}{paper.session_year ? ` — ${paper.session_year}` : ''}
            </div>
          )}
        </div>

        {/* Info grid */}
        {infoPills.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${infoPills.length}, 1fr)`,
            borderTop: '1.5px solid #000',
          }}>
            {infoPills.map((t, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '5px 4px',
                fontSize: '0.88em',
                fontWeight: 700,
                borderRight: i < infoPills.length - 1 ? '1px solid #bbb' : 'none',
                background: i % 2 === 0 ? '#f5f5f5' : '#fff',
              }}>
                {t}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student info row */}
      <div style={{
        marginTop: 10,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.92em',
        fontWeight: 600,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span>নাম:</span>
          <span style={{ display: 'inline-block', width: 180, borderBottom: '1.5px dotted #333' }}>{' '}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span>রোল:</span>
          <span style={{ display: 'inline-block', width: 80, borderBottom: '1.5px dotted #333' }}>{' '}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span>তারিখ:</span>
          <span style={{ display: 'inline-block', width: 80, borderBottom: '1.5px dotted #333' }}>{' '}</span>
        </div>
      </div>
      <div style={{ borderBottom: '1.5px dashed #555', marginTop: 8 }} />

      {paper.instructions && (
        <div style={{ marginTop: 6, fontSize: '0.88em', fontStyle: 'italic', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>নির্দেশনা: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

/**
 * Modern Academy Header — Minimal, clean, no borders, stylish
 */
function ModernAcademyHeader({ paper }) {
  const numberingStyle = paper?.print_settings?.questionNumbering || 'en'
  const timeValue = paper.time_minutes ? formatQuestionNumber(paper.time_minutes, numberingStyle) : ''
  const marksValue = paper.total_marks ? formatQuestionNumber(paper.total_marks, numberingStyle) : ''

  return (
    <header style={{ marginBottom: 18 }}>
      <div style={{ textAlign: 'center' }}>
        {paper.institution_name && (
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.03em' }}>
            {paper.institution_name}
          </div>
        )}
        {/* Decorative line */}
        <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', margin: '6px auto' }} />
        {paper.exam_title && (
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#3b82f6' }}>
            {paper.exam_title}{paper.session_year ? ` — ${paper.session_year}` : ''}
            {paper.set_variant ? ` (সেট ${paper.set_variant})` : ''}
          </div>
        )}
      </div>
      {/* Info row */}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.92em', fontWeight: 600, color: '#475569' }}>
        {paper.class_name && <span>শ্রেণি: {paper.class_name}</span>}
        {paper.subject && <span>বিষয়: {paper.subject}</span>}
        {timeValue && <span>সময়: {timeValue} মিনিট</span>}
        {marksValue && <span>পূর্ণমান: {marksValue}</span>}
      </div>
      {paper.instructions && (
        <div style={{ marginTop: 8, fontSize: '0.88em', fontStyle: 'italic', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>নির্দেশনা: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

/**
 * NCTB Board Header — Official board-style layout
 * Top row: Logo box | School name + exam title | Seal box
 * Bottom row: 4-column grid (শ্রেণি, বিষয়, সময়, পূর্ণমান)
 */
function NCTBBoardHeader({ paper }) {
  const numberingStyle = paper?.print_settings?.questionNumbering || 'en'
  const timeValue = paper.time_minutes ? formatQuestionNumber(paper.time_minutes, numberingStyle) : ''
  const marksValue = paper.total_marks ? formatQuestionNumber(paper.total_marks, numberingStyle) : ''

  return (
    <header style={{ marginBottom: 18 }}>
      <div style={{ border: '1.5px dashed #999', overflow: 'hidden' }}>
        {/* ── Top Row: Logo | School Info | Seal ── */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px dashed #999' }}>
          {/* Logo box */}
          <div style={{
            width: 110, height: 100, borderRight: '1px dashed #999',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {paper.logo_url ? (
              <img
                src={paper.logo_url}
                alt=""
                style={{
                  width: 72, height: 72, objectFit: 'contain', display: 'inline-block',
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: '50%', border: '1.5px dashed #999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#111',
              }}>
                🏫
              </div>
            )}
          </div>

          {/* School name + exam title */}
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 16px' }}>
            {paper.institution_name && (
              <div style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: '#000', letterSpacing: '1px' }}>
                {paper.institution_name}
              </div>
            )}
            {/* Decorative divider */}
            <div style={{ width: 60, height: 2, background: '#111', margin: '0 auto 6px' }} />
            {paper.exam_title && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#222', letterSpacing: '2px' }}>
                {paper.exam_title}{paper.session_year ? ` — ${paper.session_year}` : ''}
                {paper.set_variant ? ` (সেট ${paper.set_variant})` : ''}
              </div>
            )}
          </div>

          {/* Seal box — shows class/subject/set from paper meta */}
          <div style={{
            width: 110, height: 100, borderLeft: '1px dashed #999',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, background: '#f2f2f2', flexShrink: 0, padding: '4px 6px',
          }}>
            <span style={{ fontSize: 18, color: '#333' }}>📋</span>
            {paper.class_name && (
              <span style={{ fontSize: 11, color: '#111', textAlign: 'center', fontWeight: 700, lineHeight: 1.2 }}>
                শ্রেণি: {paper.class_name}
              </span>
            )}
            {paper.subject && (
              <span style={{ fontSize: 10, color: '#333', textAlign: 'center', fontWeight: 600, lineHeight: 1.2 }}>
                {paper.subject}
              </span>
            )}
            {paper.set_variant && (
              <span style={{ fontSize: 10, color: '#555', textAlign: 'center', letterSpacing: 1, fontWeight: 700 }}>
                সেট: {paper.set_variant}
              </span>
            )}
          </div>
        </div>

        {/* ── Bottom Row: 4-column info grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <InfoCell label="শ্রেণি" value={paper.class_name || ''} odd />
          <InfoCell label="বিষয়" value={paper.subject || ''} />
          <InfoCell label="সময়" value={timeValue ? `${timeValue} মিনিট` : ''} odd />
          <InfoCell label="পূর্ণমান" value={marksValue || ''} />
        </div>
      </div>
      {paper.instructions && (
        <div style={{ marginTop: 8, fontSize: '0.88em', fontStyle: 'italic', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>নির্দেশনা: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

/** Single info cell for NCTB bottom grid */
function InfoCell({ label, value, odd }) {
  return (
    <div style={{
      padding: '8px 14px',
      background: odd ? '#f2f2f2' : 'transparent',
      borderRight: '1px dashed #ccc',
    }}>
      <div style={{ fontSize: 10, color: '#555', margin: '0 0 2px', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#000' }}>{value}</div>
    </div>
  )
}

function Header({ paper }) {
  if (!paper) return null

  // ─── Header Preset Selection ────────────────────────────
  // If header_preset is explicitly set, use it directly.
  // Otherwise fall back to auto-detect based on level/class.
  const preset = paper.header_preset
  if (preset === 'school_classic') {
    return <SchoolClassicHeader paper={paper} />
  }
  if (preset === 'primary_classic') {
    return <PrimaryHeader paper={paper} />
  }
  if (preset === 'kids_illustrated') {
    return <KidsIllustratedHeader paper={paper} />
  }
  if (preset === 'modern_academy') {
    return <ModernAcademyHeader paper={paper} />
  }
  if (preset === 'nctb_board') {
    return <NCTBBoardHeader paper={paper} />
  }

  // Auto-detect fallback: if class is primary level, use the kid-friendly header
  const paperLevel = paper.level || paper.metadata?.level
  if (paperLevel === 'primary' || isPrimaryClass(paper.class_name)) {
    return <PrimaryHeader paper={paper} />
  }

  const align = paper.header_alignment || 'center'
  const logoAlign = paper?.print_settings?.logoAlignment || 'left'
  const labelLanguage = paper?.print_settings?.labelLanguage || 'bn'
  const numberingStyle = paper?.print_settings?.questionNumbering || 'en'
  const labels = getPaperLabels(labelLanguage)
  const isRtlLabels = labelLanguage === 'ar' || labelLanguage === 'fa'
  const timeValue = paper.time_minutes ? formatQuestionNumber(paper.time_minutes, numberingStyle) : ''
  const marksValue = paper.total_marks ? formatQuestionNumber(paper.total_marks, numberingStyle) : ''

  return (
    <header dir={isRtlLabels ? 'rtl' : 'ltr'} style={{ marginBottom: 18 }}>
      {/* Optional: institution name + logo — block level, stacked */}
      {paper.logo_url && (
        <div style={{
          textAlign: logoAlign === 'right' ? 'right' : logoAlign === 'center' ? 'center' : 'left',
          marginBottom: 4,
        }}>
          <img
            src={paper.logo_url}
            alt=""
            style={{ width: 48, height: 48, objectFit: 'contain', display: 'inline-block' }}
            crossOrigin="anonymous"
          />
        </div>
      )}
      {paper.institution_name && (
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: '1.3em', fontWeight: 700, letterSpacing: '0.01em' }}>
            {paper.institution_name}
          </div>
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
            {paper.set_variant ? ` (${labels.set} ${paper.set_variant})` : ''}
          </div>
        )}
        {paper.class_name && (
          <div style={{ fontSize: '1em', fontWeight: 600, margin: '2px 0' }}>
            {labels.className}: {paper.class_name}
          </div>
        )}
        {paper.subject && (
          <div style={{ fontSize: '1em', fontWeight: 600, margin: '2px 0' }}>
            {labels.subject}: {paper.subject}
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
          {timeValue ? `${labels.time}: ${timeValue} ${labels.minutes}` : ''}
        </span>
        <span>
          {marksValue ? `${labels.totalMarks}: ${marksValue}` : ''}
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
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>{labels.instructions}: </span>
          <span style={{ whiteSpace: 'pre-line' }}>{paper.instructions}</span>
        </div>
      )}
    </header>
  )
}

function QuestionList({ questions, layout = '1-column', sectionMode = false, numberingStyle = 'en', questionDirection = 'ltr', columnGap }) {
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
            <QuestionRow
              index={formatQuestionNumber(numbers[i], numberingStyle)}
              q={q}
              questionDirection={questionDirection}
              outerColumns={colCount}
            />
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

function QuestionRow({ index, q, questionDirection = 'ltr', outerColumns = 1 }) {
  const isRtl = questionDirection === 'rtl'
  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
      }}
    >
      <div
        dir="ltr"
        style={{
          flexShrink: 0,
          fontWeight: 700,
          unicodeBidi: 'isolate',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        {index}.
      </div>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ flex: 1, minWidth: 0, textAlign: isRtl ? 'right' : 'left' }}
      >
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
    case 'short_question':
      return <SimpleQuestion q={q} />
    case 'one_word':
      return <SimpleQuestion q={q} />
    case 'essay':
      return <EssayQuestion q={q} />
    case 'paragraph':
      return <ParagraphQuestion q={q} />
    case 'letter':
      return <LetterQuestion q={q} />
    case 'dialogue':
      return <DialogueQuestion q={q} />
    case 'grammar':
      return <GrammarQuestion q={q} />
    case 'math':
      return <SimpleQuestion q={q} />
    case 'finance':
      return <SimpleQuestion q={q} />
    case 'diagram_question':
      return <DiagramQuestion q={q} />
    case 'arabic':
      return <ArabicQuestion q={q} />
    case 'hifz':
      return <HifzQuestion q={q} />
    case 'hadith':
      return <HadithQuestion q={q} />
    case 'ebtedayi':
      return <EbtedayiQuestion q={q} />
    case 'poem':
      return <PoemQuestion q={q} />
    case 'passage':
      return <PassageQuestion q={q} />
    case 'true_false':
      return <TrueFalseQuestion q={q} />
    case 'visual_grid':
      return <VisualGridQuestion q={q} />
    case 'parent_passage':
      return <ParentPassageQuestion q={q} />
    case 'column_matching':
      return <ColumnMatchingQuestion q={q} />
    case 'standard_text':
      return <StandardTextQuestion q={q} />
    case 'short':
    case 'broad':
    default:
      return <SimpleQuestion q={q} />
  }
}

function SimpleQuestion({ q }) {
  const imgMaxH = q.image_height ? pxToMm(q.image_height) : undefined
  const imgMaxW = q.image_width ? pxToMm(q.image_width) : undefined
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <MathText text={q.question || q.text || ''} />
        {q.image && <QuestionImage src={q.image} maxHeight={imgMaxH} maxWidth={imgMaxW} />}
      </div>
      {q.marks ? (
        <span style={{ fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>{q.marks}</span>
      ) : null}
    </div>
  )
}

/** Convert px to mm (96 DPI: 1mm ≈ 3.78px). */
function pxToMm(px) {
  return typeof px === 'number' && px > 0 ? `${(px / 3.78).toFixed(1)}mm` : undefined
}

/** Reusable image renderer for question diagrams in PDF/print output. */
function QuestionImage({ src, maxHeight = '60mm', maxWidth = '100%', align = 'center' }) {
  return (
    <div
      style={{
        margin: '6px 0',
        textAlign: align,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          maxWidth,
          maxHeight,
          objectFit: 'contain',
          display: 'inline-block',
        }}
        crossOrigin="anonymous"
      />
    </div>
  )
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
  const stimImgH = q.stimulus_image_height ? pxToMm(q.stimulus_image_height) : undefined
  const stimImgW = q.stimulus_image_width ? pxToMm(q.stimulus_image_width) : undefined
  const stimImgAlign = q.stimulus_image_align || 'center'
  return (
    <div>
      {q.stimulus && (
        <MathText
          as="div"
          text={q.stimulus}
          style={{
            margin: '2px 0 4px',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        />
      )}
      {q.stimulus_image && (
        <QuestionImage
          src={q.stimulus_image}
          maxHeight={stimImgH || '90mm'}
          maxWidth={stimImgW}
          align={stimImgAlign}
        />
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

function EssayQuestion({ q }) {
  const limitStr = q.word_limit ? ` (অনূর্ধ্ব ${q.word_limit} শব্দ)` : ''
  const enLimitStr = q.word_limit ? ` (within ${q.word_limit} words)` : ''
  const isEn = /^[A-Za-z0-9\s.,?!"'-]+$/.test(q.topic || '')
  const mainPrompt = isEn
    ? `Write an essay on one of the following topics${enLimitStr}:`
    : `যেকোনো একটি বিষয়ে প্রবন্ধ লিখুন${limitStr}:`
  return (
    <div>
      <div>{mainPrompt}</div>
      <div style={{ marginLeft: 16, marginTop: 4, fontWeight: 600 }}>
        (ক) <MathText as="span" text={q.topic || ''} />
      </div>
    </div>
  )
}

function ParagraphQuestion({ q }) {
  return (
    <div>
      <div>
        Write a paragraph on <strong>'{q.topic || ''}'</strong> using the following hints:
      </div>
      {q.hints && q.hints.length > 0 && (
        <div style={{ fontStyle: 'italic', marginTop: 4, color: '#444' }}>
          Hints: {Array.isArray(q.hints) ? q.hints.join(', ') : q.hints}
        </div>
      )}
    </div>
  )
}

function LetterQuestion({ q }) {
  return <MathText text={q.scenario || ''} />
}

function DialogueQuestion({ q }) {
  const turnsStr = q.turns ? ` (Take at least ${q.turns} turns)` : ''
  return (
    <div>
      <MathText text={`${q.scenario || ''}${turnsStr}`} />
    </div>
  )
}

function GrammarQuestion({ q }) {
  return (
    <div>
      <MathText as="span" text={q.sentence || ''} />
      {q.instruction && (
        <span style={{ fontStyle: 'italic', color: '#555', marginLeft: 6 }}>
          ({q.instruction})
        </span>
      )}
    </div>
  )
}

function DiagramQuestion({ q }) {
  return (
    <div>
      {q.diagram_ref && (
        <div style={{ margin: '6px 0', textAlign: 'center', breakInside: 'avoid' }}>
          <img
            src={q.diagram_ref}
            alt="Diagram"
            style={{ maxWidth: '100%', maxHeight: '60mm', objectFit: 'contain' }}
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}
      <MathText text={q.question || ''} />
    </div>
  )
}

function ArabicQuestion({ q }) {
  return (
    <div style={{ textAlign: 'center', breakInside: 'avoid' }}>
      {q.instruction && (
        <div style={{ textAlign: 'left', fontStyle: 'italic', marginBottom: 6 }}>
          {q.instruction}
        </div>
      )}
      <div
        style={{
          fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
          fontSize: '1.4em',
          lineHeight: 1.8,
          margin: '10px 0',
          direction: 'rtl',
        }}
      >
        {q.arabic_text}
      </div>
      {q.source && (
        <div style={{ fontSize: '0.85em', color: '#444', fontStyle: 'italic' }}>
          (উৎস: {q.source})
        </div>
      )}
    </div>
  )
}

function HifzQuestion({ q }) {
  return <MathText text={q.prompt || ''} />
}

function HadithQuestion({ q }) {
  return (
    <div style={{ textAlign: 'center', breakInside: 'avoid' }}>
      {q.instruction && (
        <div style={{ textAlign: 'left', fontStyle: 'italic', marginBottom: 6 }}>
          {q.instruction}
        </div>
      )}
      <div
        style={{
          fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
          fontSize: '1.4em',
          lineHeight: 1.8,
          margin: '10px 0',
          direction: 'rtl',
        }}
      >
        {q.arabic_text}
      </div>
      {q.source && (
        <div style={{ fontSize: '0.85em', color: '#444', fontStyle: 'italic' }}>
          (উৎস: {q.source})
        </div>
      )}
    </div>
  )
}

function EbtedayiQuestion({ q }) {
  return (
    <div style={{ breakInside: 'avoid' }}>
      <div>
        <strong>মাসআলা নং {q.masala_number || ''}:</strong> {q.instruction || ''}
      </div>
      {q.arabic_block && (
        <div
          style={{
            fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
            fontSize: '1.3em',
            lineHeight: 1.8,
            margin: '8px 0',
            textAlign: 'center',
            direction: 'rtl',
          }}
        >
          {q.arabic_block}
        </div>
      )}
    </div>
  )
}

function PoemQuestion({ q }) {
  const lines = Array.isArray(q.lines) ? q.lines : []
  return (
    <div style={{ breakInside: 'avoid' }}>
      {q.instruction && <div style={{ fontStyle: 'italic', marginBottom: 6 }}>{q.instruction}</div>}
      <div style={{ margin: '8px 0', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6 }}>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        {q.author && (
          <div style={{ marginTop: 4, fontWeight: 600, textAlign: 'right', marginRight: '20%' }}>
            — {q.author}
          </div>
        )}
      </div>
    </div>
  )
}

function PassageQuestion({ q }) {
  return (
    <div style={{ breakInside: 'avoid' }}>
      <div style={{ fontStyle: 'italic', marginBottom: 6 }}>
        Read the passage carefully and answer the questions:
      </div>
      <div
        style={{
          padding: '10px 12px',
          border: '1px solid #aaa',
          background: '#fcfcfc',
          marginBottom: 10,
          whiteSpace: 'pre-line',
          lineHeight: 1.5,
        }}
      >
        {q.passage}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 12 }}>
        {(q.questions || []).map((sq, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
            <span style={{ fontWeight: 600 }}>{sq.no || i + 1}.</span>
            <span style={{ flex: 1 }}><MathText text={sq.text || ''} /></span>
            {sq.marks ? <span style={{ fontWeight: 600 }}>({sq.marks})</span> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function TrueFalseQuestion({ q }) {
  return (
    <div style={{ breakInside: 'avoid' }}>
      <div style={{ fontStyle: 'italic', marginBottom: 6 }}>
        নিচের বাক্যগুলো সত্য নাকি মিথ্যা নির্ণয় করো:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 12 }}>
        {(q.statements || []).map((stmt, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
            <span style={{ fontWeight: 600 }}>{i + 1}.</span>
            <span style={{ flex: 1 }}><MathText text={stmt.text || ''} /></span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Visual Grid Question (ছবি তুলনা)
 * For primary education: image matching, counting, comparison
 * Renders: instruction + left items (count × asset) + operator + right items
 */
function VisualGridQuestion({ q }) {
  const leftCount = q.left_count || 0
  const rightCount = q.right_count || 0
  const operator = q.operator || 'compare'

  // Asset emoji fallback for print (SVG rendering would require fetching assets)
  const assetEmojis = {
    apple: '🍎',
    banana: '🍌',
    orange: '🍊',
    mango: '🥭',
    star: '⭐',
    circle: '⚪',
    square: '⬜',
    triangle: '🔺',
    rectangle: '▬',
    cat: '🐱',
    dog: '🐕',
    bird: '🐦',
    book: '📖',
    pencil: '✏️',
    bag: '🎒',
    sun: '☀️',
    moon: '🌙',
    flower: '🌸',
    tree: '🌲',
  }

  const getEmoji = (key) => assetEmojis[key] || '❓'
  const isMathMode = ['+', '-', '×', '÷'].includes(operator)
  const operatorSymbol = operator === 'compare' ? '?' : operator === '<' ? '<' : operator === '>' ? '>' : operator === '=' ? '=' : operator

  return (
    <div style={{ breakInside: 'avoid' }}>
      {q.instruction && (
        <div style={{ fontStyle: 'italic', marginBottom: 6 }}>
          <MathText text={q.instruction} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '8px 0' }}>
        {/* Left side */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', minWidth: 60 }}>
          {Array.from({ length: Math.min(leftCount, 10) }).map((_, i) => (
            <span key={i} style={{ fontSize: '1.8em', lineHeight: 1 }}>
              {getEmoji(q.left_asset)}
            </span>
          ))}
          {leftCount > 10 && <span style={{ fontSize: '0.9em', color: '#666' }}>+{leftCount - 10}</span>}
        </div>

        {/* Operator */}
        <span style={{ fontSize: '2em', fontWeight: 700, color: isMathMode ? '#ea580c' : '#333', minWidth: 30, textAlign: 'center' }}>
          {operatorSymbol}
        </span>

        {/* Right side */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', minWidth: 60 }}>
          {Array.from({ length: Math.min(rightCount, 10) }).map((_, i) => (
            <span key={i} style={{ fontSize: '1.8em', lineHeight: 1 }}>
              {getEmoji(q.right_asset)}
            </span>
          ))}
          {rightCount > 10 && <span style={{ fontSize: '0.9em', color: '#666' }}>+{rightCount - 10}</span>}
        </div>

        {/* Equals + answer box for math mode */}
        {isMathMode && (
          <>
            <span style={{ fontSize: '2em', fontWeight: 700, color: '#333', minWidth: 20, textAlign: 'center' }}>=</span>
            <div style={{
              width: 48, height: 40, borderBottom: '2px solid #000',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              fontSize: '1.4em', fontWeight: 700,
            }} />
          </>
        )}
      </div>

      {/* Math question text */}
      {isMathMode && q.math_question && (
        <div style={{ marginTop: 4, fontWeight: 500, textAlign: 'center' }}>
          <MathText text={q.math_question} />
        </div>
      )}
    </div>
  )
}

/**
 * Parent Passage Question (প্যাসেজ/কবিতাভিত্তিক)
 * For primary education: passage-based comprehension
 * Supports both `q.passage` (generic) and `q.passage_body` (primary templates).
 */
function ParentPassageQuestion({ q }) {
  const passageText = q.passage || q.passage_body || ''
  return (
    <div style={{ breakInside: 'avoid' }}>
      {q.instruction && (
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          <MathText text={q.instruction} />
        </div>
      )}
      {passageText && (
        <div
          style={{
            padding: '8px 10px',
            border: '1px solid #aaa',
            background: '#fafafa',
            marginBottom: 8,
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            fontSize: '0.95em',
          }}
        >
          <MathText text={passageText} />
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

/**
 * Column Matching Question (মিলকরণ ২/৩ কলাম)
 * For primary education: two or three-column matching
 * Supports column_a, column_b, and optional column_c (3-column board).
 */
function ColumnMatchingQuestion({ q }) {
  const pairs = q.pairs || []
  const hasColC = pairs.some((p) => p.column_c)
  const leftCol = pairs.map((p) => p.column_a)
  const midCol = hasColC ? pairs.map((p) => p.column_c) : null
  const rightCol = pairs.map((p) => p.column_b)

  return (
    <div style={{ breakInside: 'avoid' }}>
      {q.instruction && (
        <div style={{ fontStyle: 'italic', marginBottom: 6 }}>
          <MathText text={q.instruction} />
        </div>
      )}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: 6,
          fontSize: '0.95em',
        }}
      >
        <tbody>
          {Array.from({ length: Math.max(leftCol.length, rightCol.length) }).map((_, i) => (
            <tr key={i}>
              <td style={cellTD}><MathText text={leftCol[i] || ''} /></td>
              {midCol && <td style={cellTD}><MathText text={midCol[i] || ''} /></td>}
              <td style={cellTD}><MathText text={rightCol[i] || ''} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Standard Text Question (শূন্যস্থান/যুক্তাক্ষর/সাধারণ প্রশ্ন)
 * For primary education: fill-in-the-blanks with visual clues,
 * plain text questions, dotted/ruled lines, inline boxes, etc.
 *
 * Two modes:
 *   1. `q.items` array → structured fill-in-the-blanks (prefix/answer/suffix)
 *   2. `q.question` text → free-form text with optional answer space lines
 *
 * Supports `q.space_level` (none/short/medium/long) and
 * `q.line_style` (none/dotted/ruled) for answer space.
 */
function StandardTextQuestion({ q }) {
  const items = q.items || []
  const hasItems = items.length > 0
  const questionText = q.question || ''
  const spaceLevel = q.space_level || 'none'
  const lineStyle = q.line_style || 'none'

  // Determine how many answer lines to draw based on space_level
  const lineCount = spaceLevel === 'long' ? 8 : spaceLevel === 'medium' ? 5 : spaceLevel === 'short' ? 2 : 0

  // ─── Tracing Mode (Nursery – KG) ───────────────────────────
  if (questionText === 'tracing' && q.tracing_chars?.length) {
    const chars = q.tracing_chars
    const isNumber = q.tracing_type === 'number'
    return (
      <div style={{ breakInside: 'avoid' }}>
        {q.instruction && (
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            <MathText text={q.instruction} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', padding: '8px 0' }}>
          {chars.map((ch, i) => (
            <div key={i} style={{
              width: 72, height: 80, border: '1.5px solid #fca5a5', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', background: '#fff5f5',
            }}>
              {/* Dotted background character */}
              <span style={{
                fontSize: isNumber ? 42 : 40, fontWeight: 700, color: '#fecaca',
                position: 'absolute', userSelect: 'none', lineHeight: 1,
              }}>
                {ch}
              </span>
              {/* Dot pattern overlay for tracing guide */}
              <div style={{
                position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 3,
              }}>
                {[...Array(5)].map((_, d) => (
                  <div key={d} style={{ width: 3, height: 3, borderRadius: '50%', background: '#ef4444', opacity: 0.4 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Extra blank tracing row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', padding: '4px 0' }}>
          {chars.map((_, i) => (
            <div key={`blank-${i}`} style={{
              width: 72, height: 80, border: '1.5px dashed #fecaca', borderRadius: 8,
              background: '#fffbfb',
            }} />
          ))}
        </div>
      </div>
    )
  }

  // ─── Number Line Mode (Class 1 – 3) ───────────────────────
  if (questionText === 'number_line' && q.nl_end != null) {
    const start = q.nl_start || 0
    const end = q.nl_end || 10
    const jumps = q.nl_jumps || []
    const totalTicks = end - start + 1
    const svgWidth = Math.max(totalTicks * 28, 200)
    const lineY = 50
    const marginL = 20
    const spacing = (svgWidth - marginL * 2) / (totalTicks - 1 || 1)
    return (
      <div style={{ breakInside: 'avoid' }}>
        {q.instruction && (
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            <MathText text={q.instruction} />
          </div>
        )}
        {q.nl_question && (
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            <MathText text={q.nl_question} />
          </div>
        )}
        <div style={{ overflowX: 'auto', padding: '4px 0' }}>
          <svg viewBox={`0 0 ${svgWidth} 80`} style={{ width: '100%', maxWidth: svgWidth, height: 80 }}>
            {/* Main line */}
            <line x1={marginL} y1={lineY} x2={svgWidth - marginL} y2={lineY} stroke="#16a34a" strokeWidth={2.5} />
            {/* Arrow at end */}
            <polygon points={`${svgWidth - marginL},${lineY} ${svgWidth - marginL - 6},${lineY - 4} ${svgWidth - marginL - 6},${lineY + 4}`} fill="#16a34a" />
            {/* Ticks and numbers */}
            {Array.from({ length: totalTicks }).map((_, i) => {
              const x = marginL + i * spacing
              const num = start + i
              const isJump = jumps.includes(num)
              return (
                <g key={i}>
                  <line x1={x} y1={lineY - 6} x2={x} y2={lineY + 6} stroke="#16a34a" strokeWidth={1.5} />
                  {isJump ? (
                    <circle cx={x} cy={lineY} r={10} fill="#dcfce7" stroke="#16a34a" strokeWidth={1.5} />
                  ) : (
                    <text x={x} y={lineY + 20} fontSize={11} fill="#15803d" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
                      {String(num).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d])}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div style={{ breakInside: 'avoid' }}>
      {q.instruction && (
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          <MathText text={q.instruction} />
        </div>
      )}

      {/* Mode 1: Structured fill-in-the-blanks with items array */}
      {hasItems && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontWeight: 600, flexShrink: 0, minWidth: 24 }}>
                {(i + 1)}.
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {item.prefix && (
                  <span style={{ marginRight: 4 }}>
                    <MathText text={item.prefix} />
                  </span>
                )}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '60px',
                    borderBottom: '1px solid #000',
                    margin: '0 4px',
                  }}
                >
                  {item.show_answer && <MathText text={item.answer || ''} />}
                </span>
                {item.suffix && (
                  <span style={{ marginLeft: 4 }}>
                    <MathText text={item.suffix} />
                  </span>
                )}
                {item.clue && (
                  <span style={{ fontSize: '0.85em', color: '#666', marginLeft: 8 }}>
                    ({item.clue})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode 2: Free-form question text with optional answer lines */}
      {!hasItems && questionText && (
        <div>
          <MathText as="div" text={questionText} style={{ whiteSpace: 'pre-line' }} />
          {lineCount > 0 && (
            <div style={{ marginTop: 8 }}>
              {Array.from({ length: lineCount }).map((_, i) => {
                const lineStyleObj =
                  lineStyle === 'dotted'
                    ? { borderBottom: '1px dotted #999', height: '1.8em' }
                    : lineStyle === 'ruled'
                    ? { borderBottom: '1px solid #bbb', height: '1.8em' }
                    : { height: '1.8em' }
                return <div key={i} style={lineStyleObj} />
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PaperTemplate
