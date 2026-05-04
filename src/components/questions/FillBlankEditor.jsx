import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathSymbolPicker from './MathSymbolPicker'

export default function FillBlankEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const sentenceRef = useRef(null)

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          বাক্য (শূন্যস্থানে ___ ব্যবহার করুন)
        </label>
        <div className="flex items-start gap-1.5">
          <textarea
            ref={sentenceRef}
            value={question.sentence || ''}
            onChange={(e) => updateQuestion(question.id, { sentence: e.target.value })}
            placeholder="বাংলাদেশের রাজধানী ___ ।"
            rows={2}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <MathSymbolPicker inputRef={sentenceRef} onInsert={(v) => updateQuestion(question.id, { sentence: v })} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          সূত্র/ক্লু (ঐচ্ছিক)
        </label>
        <input
          type="text"
          value={question.clues || ''}
          onChange={(e) => updateQuestion(question.id, { clues: e.target.value })}
          placeholder="ঢাকা, চট্টগ্রাম, রাজশাহী"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={question.marks || ''}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
