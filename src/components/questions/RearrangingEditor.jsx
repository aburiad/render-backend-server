import usePaperStore from '@/store/paperStore'

export default function RearrangingEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)

  const sentences = question.sentences || ['', '', '', '']

  const handleSentenceChange = (index, value) => {
    const updated = [...sentences]
    updated[index] = value
    updateQuestion(question.id, { sentences: updated })
  }

  const addSentence = () => {
    updateQuestion(question.id, { sentences: [...sentences, ''] })
  }

  const removeSentence = (index) => {
    if (sentences.length <= 2) return
    updateQuestion(question.id, {
      sentences: sentences.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          প্রশ্ন/নির্দেশনা (ঐচ্ছিক)
        </label>
        <input
          type="text"
          value={question.question || ''}
          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
          placeholder="নিচের বাক্যগুলো সঠিক ক্রমে সাজাও"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-gray-400">
          বাক্যগুলো (এলোমেলো ক্রমে)
        </span>
        {sentences.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
            <input
              type="text"
              value={s}
              onChange={(e) => handleSentenceChange(i, e.target.value)}
              placeholder={`বাক্য ${i + 1}`}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button
              onClick={() => removeSentence(i)}
              disabled={sentences.length <= 2}
              className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addSentence}
        className="text-xs text-yellow-600 font-medium hover:text-yellow-700"
      >
        + আরেকটি বাক্য যোগ করুন
      </button>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          সঠিক ক্রম (কমা দিয়ে আলাদা করুন, যেমন: 3,1,4,2)
        </label>
        <input
          type="text"
          value={(question.correct_order || []).join(',')}
          onChange={(e) =>
            updateQuestion(question.id, {
              correct_order: e.target.value
                .split(',')
                .map((n) => Number(n.trim()))
                .filter(Boolean),
            })
          }
          placeholder="3,1,4,2"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={question.marks || ''}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
