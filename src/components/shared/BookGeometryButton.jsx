/**
 * BookGeometryButton
 *
 * A "📚 বই থেকে জ্যামিতি" trigger button for chapter-wise geometry selection.
 * Opens BookGeometryModal where teachers can navigate by Class → Chapter → Figures.
 *
 * Similar to DiagramButton but organized by curriculum chapters instead of
 * shape categories.
 *
 * onSave(dataUrl) receives the PNG and the parent stores it like any
 * other uploaded image.
 */

import { useState } from 'react'
import BookGeometryModal from '@/components/questions/BookGeometryModal'

export default function BookGeometryButton({
  onSave,
  label = '📚 বই থেকে জ্যামিতি'
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleSave = (dataUrl) => {
    onSave(dataUrl)
    setModalOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[12px] sm:text-xs font-bold text-emerald-700 active:scale-95 transition-all min-h-[44px]"
        title="বই অনুযায়ী জ্যামিতিক চিত্র নির্বাচন করুন"
        style={{
          WebkitTapHighlightColor: 'transparent',
          backfaceVisibility: 'hidden',
        }}
      >
        <span className="text-sm">{label.split(' ')[0]}</span>
        <span className="hidden sm:inline">{label.split(' ').slice(1).join(' ')}</span>
      </button>

      <BookGeometryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
