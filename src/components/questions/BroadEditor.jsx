import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import AutoTextarea from '@/components/shared/AutoTextarea'
import { MathPreview } from '@/utils/mathRender'

export default function BroadEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const questionRef = useRef(null)

  return (
    <div className="space-y-3">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5">
          <AutoTextarea
            ref={questionRef}
            value={question.question || ''}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            placeholder="রচনামূলক প্রশ্ন লিখুন..."
            rows={3}
            className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={questionRef} onInsert={(v) => updateQuestion(question.id, { question: v })} />
          </div>
        </div>
        <MathPreview text={question.question} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={question.marks || ''}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
