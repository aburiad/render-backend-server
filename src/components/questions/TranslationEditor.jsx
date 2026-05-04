import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathSymbolPicker from './MathSymbolPicker'

export default function TranslationEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const sourceRef = useRef(null)

  return (
    <div className="space-y-3">
      {/* Direction toggle */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">অনুবাদের দিক</label>
        <div className="flex gap-2">
          {[
            { value: 'bn-en', label: 'বাংলা → ইংরেজি' },
            { value: 'en-bn', label: 'English → বাংলা' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateQuestion(question.id, { direction: opt.value })}
              className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors ${
                (question.direction || 'bn-en') === opt.value
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source text */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {(question.direction || 'bn-en') === 'bn-en' ? 'বাংলা টেক্সট' : 'English Text'}
        </label>
        <div className="flex items-start gap-1.5">
          <textarea
            ref={sourceRef}
            value={question.source_text || ''}
            onChange={(e) => updateQuestion(question.id, { source_text: e.target.value })}
            placeholder={
              (question.direction || 'bn-en') === 'bn-en'
                ? 'অনুবাদ করতে হবে এমন বাংলা টেক্সট...'
                : 'Enter the English text to translate...'
            }
            rows={3}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <MathSymbolPicker inputRef={sourceRef} onInsert={(v) => updateQuestion(question.id, { source_text: v })} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={question.marks || ''}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
