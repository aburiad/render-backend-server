import PaperTemplate from '@/components/paper/PaperTemplate'
import usePaperStore from '@/store/paperStore'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

/**
 * Template picker preview — uses the same DOM shell + scale logic as PDFPreview
 * so the layout matches the real PDF preview exactly.
 */
export default function TemplatePaperPreview({ paperMeta, questions }) {
  const currentPaper = usePaperStore((s) => s.currentPaper)
  const previewWrapRef = useRef(null)
  const paperSheetRef = useRef(null)
  const paperRef = useRef(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [previewBox, setPreviewBox] = useState({ width: 0, height: 0 })

  const ps = currentPaper?.print_settings || {}
  const font = ps.font || 'Noto Serif Bengali'
  const size = ps.size || '12pt'
  const spacing = ps.spacing || '1.6'
  const orientation = ps.orientation || 'portrait'
  const columnGap = typeof ps.columnGap === 'string' ? ps.columnGap : ''
  const isLandscape = orientation === 'landscape'

  // Same fields handleApplyPaper() writes — rest comes from the live paper setup.
  const paper = useMemo(
    () => ({
      ...(currentPaper || {}),
      exam_title: paperMeta?.name || '',
      total_marks: paperMeta?.total_marks ?? 100,
      time_minutes: paperMeta?.time_minutes ?? 60,
      instructions: paperMeta?.instructions || '',
      set_variant: null,
    }),
    [currentPaper, paperMeta],
  )

  const previewQuestions = useMemo(
    () =>
      (questions || []).map((q, i) => ({
        ...q,
        id: q.id || `tpl-preview-${i}`,
        order: i,
      })),
    [questions],
  )

  useLayoutEffect(() => {
    const wrap = previewWrapRef.current
    const sheet = paperSheetRef.current
    if (!wrap || !sheet) return

    let raf = 0
    const compute = () => {
      const availW = wrap.clientWidth
      const paperEl = paperRef.current
      const sheetW = Math.max(
        sheet.offsetWidth,
        sheet.scrollWidth,
        paperEl?.scrollWidth || 0,
      )
      const sheetH = Math.max(sheet.offsetHeight, sheet.scrollHeight)
      if (!sheetW || !availW) {
        raf = requestAnimationFrame(compute)
        return
      }
      const s = Math.min(1, (availW - 8) / sheetW)
      setPreviewScale(s)
      setPreviewBox({
        width: Math.min(availW, Math.ceil(sheetW * s)),
        height: Math.ceil(sheetH * s) + 8,
      })
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(wrap)
    ro.observe(sheet)
    const onResize = () => compute()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [
    isLandscape,
    paperMeta,
    questions,
    font,
    size,
    spacing,
    orientation,
    columnGap,
    currentPaper,
  ])

  if (!paperMeta || !questions?.length) return null

  return (
    <div
      ref={previewWrapRef}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: '#e5e7eb',
        borderRadius: 12,
        padding: '12px 0',
      }}
    >
      <div
        style={{
          width: previewBox.width ? `${previewBox.width}px` : '100%',
          height: previewBox.height ? `${previewBox.height}px` : 'auto',
          maxWidth: '100%',
          overflow: 'visible',
        }}
      >
        <div
          ref={paperSheetRef}
          className="paper-sheet-shadow"
          style={{
            flexShrink: 0,
            padding: previewScale < 1 ? '0 0 14mm 0' : '14mm 0',
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}
        >
          <div
            ref={paperRef}
            style={{
              width: isLandscape ? '297mm' : '210mm',
              padding: '12px 12mm',
              boxSizing: 'border-box',
              background: '#fff',
            }}
          >
            <PaperTemplate
              paper={paper}
              questions={previewQuestions}
              font={font}
              size={size}
              spacing={spacing}
              orientation={orientation}
              columnGap={columnGap || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
