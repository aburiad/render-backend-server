import { useState } from 'react'
import GeoGebraModal from '@/components/questions/GeoGebraModal'
import GeometryQuickSheet from '@/components/questions/GeometryQuickSheet'
import SVGShapePreviewModal from '@/components/questions/SVGShapePreviewModal'

export default function DiagramButton({ onSave, label = '📐 জ্যামিতি আঁকুন' }) {
  const [quickSheetOpen, setQuickSheetOpen] = useState(false)
  const [geoGebraOpen, setGeoGebraOpen]     = useState(false)
  const [svgPreviewOpen, setSvgPreviewOpen] = useState(false)
  const [activeShapeId, setActiveShapeId]   = useState(null)

  const handleOpenGeoGebra = (shapeId) => {
    setActiveShapeId(shapeId)
    setGeoGebraOpen(true)
  }

  const handleOpenSVG = (shapeId) => {
    setActiveShapeId(shapeId)
    setSvgPreviewOpen(true)
  }

  const handleSave = (dataUrl) => {
    onSave(dataUrl)
    setGeoGebraOpen(false)
    setSvgPreviewOpen(false)
    setActiveShapeId(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setQuickSheetOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-[12px] sm:text-xs font-bold text-blue-700 active:scale-95 transition-all min-h-[44px]"
        title="জ্যামিতিক চিত্র তৈরি করুন"
        style={{ WebkitTapHighlightColor: 'transparent', backfaceVisibility: 'hidden' }}
      >
        <span className="text-sm">{label.split(' ')[0]}</span>
        <span className="hidden sm:inline">{label.split(' ').slice(1).join(' ')}</span>
      </button>

      <GeometryQuickSheet
        isOpen={quickSheetOpen}
        onClose={() => setQuickSheetOpen(false)}
        onSave={handleSave}
        onOpenGeoGebra={handleOpenGeoGebra}
        onOpenSVG={handleOpenSVG}
      />

      <SVGShapePreviewModal
        open={svgPreviewOpen}
        onClose={() => { setSvgPreviewOpen(false); setActiveShapeId(null) }}
        onSave={handleSave}
        shapeId={activeShapeId}
      />

      <GeoGebraModal
        open={geoGebraOpen}
        onClose={() => { setGeoGebraOpen(false); setActiveShapeId(null) }}
        onSave={handleSave}
        initialShape={activeShapeId}
      />
    </>
  )
}
