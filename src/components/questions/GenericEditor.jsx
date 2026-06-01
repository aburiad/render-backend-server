import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import AutoTextarea from '@/components/shared/AutoTextarea'
import ImageUploadButton from '@/components/shared/ImageUploadButton'
import { MathPreview } from '@/utils/mathRender'

// Reusable textarea + math/arabic keyboard buttons — same pattern as CqEditor
function MathTextArea({ value, onChange, placeholder, rows = 1, dir, className }) {
  const inputRef = useRef(null)
  return (
    <div className="flex flex-col gap-1.5">
      <AutoTextarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        dir={dir}
        className={className || 'w-full px-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'}
      />
      <div className="flex justify-end">
        <MathLiveEditor inputRef={inputRef} onInsert={onChange} />
      </div>
    </div>
  )
}

export default function GenericEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)

  const handleUpdate = (updates) => {
    updateQuestion(question.id, updates)
  }

  const renderFields = () => {
    switch (question.type) {
      case 'short_question':
      case 'one_word':
      case 'math':
      case 'finance': {
        const isOneWord = question.type === 'one_word'
        const label = isOneWord ? 'প্রশ্ন' : 'প্রশ্ন টেক্সট'
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
              <MathTextArea
                value={question.question || ''}
                onChange={(v) => handleUpdate({ question: v })}
                placeholder="প্রশ্ন লিখুন..."
                rows={2}
              />
              <MathPreview text={question.question} />
            </div>

            {isOneWord && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">উত্তর</label>
                <MathTextArea
                  value={question.answer || ''}
                  onChange={(v) => handleUpdate({ answer: v })}
                  placeholder="এক কথায় উত্তর..."
                  rows={1}
                />
              </div>
            )}

            {question.type === 'math' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">সমাধান ধাপসমূহ (লাইন অনুযায়ী)</label>
                  <MathTextArea
                    value={Array.isArray(question.equations) ? question.equations.join('\n') : question.equations || ''}
                    onChange={(v) => handleUpdate({ equations: v.split('\n') })}
                    placeholder="ধাপ ১: ...&#10;ধাপ ২: ..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">চূড়ান্ত উত্তর</label>
                  <MathTextArea
                    value={question.answer || ''}
                    onChange={(v) => handleUpdate({ answer: v })}
                    placeholder="চূড়ান্ত উত্তর..."
                    rows={1}
                  />
                </div>
              </div>
            )}

            {question.type === 'finance' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">সূত্র (Formula)</label>
                  <MathTextArea
                    value={question.formula || ''}
                    onChange={(v) => handleUpdate({ formula: v })}
                    placeholder="যেমন: সরল সুদ = (P * R * T) / 100"
                    rows={1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">মানসমূহ (JSON বা কমা-সেপারেটেড)</label>
                  <MathTextArea
                    value={typeof question.values === 'object' ? JSON.stringify(question.values) : question.values || ''}
                    onChange={(v) => {
                      try {
                        handleUpdate({ values: JSON.parse(v) })
                      } catch {
                        handleUpdate({ values: v })
                      }
                    }}
                    placeholder='যেমন: {"আসল": 50000, "হার": "10%"}'
                    rows={1}
                  />
                </div>
              </div>
            )}
          </div>
        )
      }

      case 'essay': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">প্রবন্ধের বিষয় (Topic)</label>
              <MathTextArea
                value={question.topic || ''}
                onChange={(v) => handleUpdate({ topic: v })}
                placeholder="যেমন: বাংলাদেশের মুক্তিযুদ্ধ"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">শব্দ সীমা (Word Limit)</label>
              <input
                type="number"
                value={question.word_limit || ''}
                onChange={(e) => handleUpdate({ word_limit: Number(e.target.value) || undefined })}
                placeholder="যেমন: ৪০০"
                className="w-full px-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )
      }

      case 'paragraph': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">অনুচ্ছেদের বিষয় (Topic)</label>
              <MathTextArea
                value={question.topic || ''}
                onChange={(v) => handleUpdate({ topic: v })}
                placeholder="যেমন: My Favourite Season"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">সংকেত/হিন্টস (Hints - কমা দিয়ে লিখুন)</label>
              <MathTextArea
                value={Array.isArray(question.hints) ? question.hints.join(', ') : question.hints || ''}
                onChange={(v) => handleUpdate({ hints: v.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="weather, activities, why I like it"
                rows={1}
              />
            </div>
          </div>
        )
      }

      case 'letter': {
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-bold text-gray-500">ধরন (Type)</label>
              {[
                { value: 'application', label: 'দরখাস্ত (Application)' },
                { value: 'letter', label: 'ব্যক্তিগত চিঠি (Letter)' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="radio"
                    name={`subtype-${question.id}`}
                    value={opt.value}
                    checked={(question.subtype || 'application') === opt.value}
                    onChange={() => handleUpdate({ subtype: opt.value })}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বর্ণনা/दृশ্যপট (Scenario)</label>
              <MathTextArea
                value={question.scenario || ''}
                onChange={(v) => handleUpdate({ scenario: v })}
                placeholder="Write an application to your headmaster for sick leave..."
                rows={3}
              />
            </div>
          </div>
        )
      }

      case 'dialogue': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">দৃশ্যপট (Scenario)</label>
              <MathTextArea
                value={question.scenario || ''}
                onChange={(v) => handleUpdate({ scenario: v })}
                placeholder="Write a dialogue between two friends asking for directions..."
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">সর্বনিম্ন ডায়ালগ সংখ্যা (Turns)</label>
              <input
                type="number"
                value={question.turns || ''}
                onChange={(e) => handleUpdate({ turns: Number(e.target.value) || undefined })}
                placeholder="যেমন: ৬"
                className="w-full px-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )
      }

      case 'grammar': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">মূল বাক্য (Sentence)</label>
              <MathTextArea
                value={question.sentence || ''}
                onChange={(v) => handleUpdate({ sentence: v })}
                placeholder="যেমন: He wrote a letter."
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">নির্দেশনা (Instruction)</label>
              <MathTextArea
                value={question.instruction || ''}
                onChange={(v) => handleUpdate({ instruction: v })}
                placeholder="যেমন: Change the voice"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">সঠিক উত্তর</label>
              <MathTextArea
                value={question.answer || ''}
                onChange={(v) => handleUpdate({ answer: v })}
                placeholder="যেমন: A letter was written by him."
                rows={1}
              />
            </div>
          </div>
        )
      }

      case 'diagram_question': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">চিত্রের ইউআরএল/রেফারেন্স (Diagram Ref)</label>
              <MathTextArea
                value={question.diagram_ref || ''}
                onChange={(v) => handleUpdate({ diagram_ref: v })}
                placeholder="যেমন: cell_diagram.png"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">চিহ্নিত অংশসমূহ (Labels - কমা দিয়ে লিখুন)</label>
              <MathTextArea
                value={Array.isArray(question.labels) ? question.labels.join(', ') : question.labels || ''}
                onChange={(v) => handleUpdate({ labels: v.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="A, B, C, D"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">প্রশ্ন (Question)</label>
              <MathTextArea
                value={question.question || ''}
                onChange={(v) => handleUpdate({ question: v })}
                placeholder="চিত্রের A, B, C, D চিহ্নিত অংশের নাম লিখো..."
                rows={2}
              />
            </div>
          </div>
        )
      }

      case 'arabic':
      case 'hadith': {
        const isHadith = question.type === 'hadith'
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">নির্দেশনা (Instruction)</label>
              <MathTextArea
                value={question.instruction || ''}
                onChange={(v) => handleUpdate({ instruction: v })}
                placeholder={isHadith ? "যেমন: হাদীসটির ব্যাখ্যা করো।" : "যেমন: নিচের আয়াতটির অনুবাদ করো:"}
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">আরবি টেক্সট (Arabic Text)</label>
              <MathTextArea
                value={question.arabic_text || ''}
                onChange={(v) => handleUpdate({ arabic_text: v })}
                placeholder="RTL আরবি টেক্সট লিখুন..."
                rows={2}
                dir="rtl"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold font-arabic focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">উৎস (Source)</label>
              <MathTextArea
                value={question.source || ''}
                onChange={(v) => handleUpdate({ source: v })}
                placeholder={isHadith ? "যেমন: সহীহ বুখারী, হাদীস নং ১" : "যেমন: সূরা আল-ফাতিহা, আয়াত ১"}
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বাংলা অনুবাদ/ব্যাখ্যা</label>
              <MathTextArea
                value={isHadith ? (question.bangla_text || '') : (question.bangla_translation || '')}
                onChange={(v) => {
                  if (isHadith) {
                    handleUpdate({ bangla_text: v })
                  } else {
                    handleUpdate({ bangla_translation: v })
                  }
                }}
                placeholder="বাংলা টেক্সট..."
                rows={1}
              />
            </div>
          </div>
        )
      }

      case 'hifz': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">প্রশ্ন/নির্দেশনা (Prompt)</label>
              <MathTextArea
                value={question.prompt || ''}
                onChange={(v) => handleUpdate({ prompt: v })}
                placeholder="যেমন: সূরা ইখলাস সম্পূর্ণ আরবিতে লিখো।"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">সূরার নাম (Surah Name)</label>
              <MathTextArea
                value={question.surah_name || ''}
                onChange={(v) => handleUpdate({ surah_name: v })}
                placeholder="যেমন: সূরা আল-ইখলাস"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">আরবি টেক্সট (যাচাইয়ের জন্য)</label>
              <MathTextArea
                value={question.arabic_text || ''}
                onChange={(v) => handleUpdate({ arabic_text: v })}
                placeholder="আরবি আয়াতসমূহ..."
                rows={2}
                dir="rtl"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
              />
            </div>
          </div>
        )
      }

      case 'ebtedayi': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">মাসআলা নং</label>
              <input
                type="number"
                value={question.masala_number || ''}
                onChange={(e) => handleUpdate({ masala_number: Number(e.target.value) || undefined })}
                placeholder="যেমন: ৩"
                className="w-full px-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">নির্দেশনা (Instruction)</label>
              <MathTextArea
                value={question.instruction || ''}
                onChange={(v) => handleUpdate({ instruction: v })}
                placeholder="যেমন: অনুবাদ করো এবং ব্যাখ্যা দাও।"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">আরবি মাসআলা (Arabic Block)</label>
              <MathTextArea
                value={question.arabic_block || ''}
                onChange={(v) => handleUpdate({ arabic_block: v })}
                placeholder="আরবি ইবারত..."
                rows={2}
                dir="rtl"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">বাংলা অনুবাদ (Bangla Block)</label>
              <MathTextArea
                value={question.bangla_block || ''}
                onChange={(v) => handleUpdate({ bangla_block: v })}
                placeholder="অনুবাদ..."
                rows={1}
              />
            </div>
          </div>
        )
      }

      case 'poem': {
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">নির্দেশনা (Instruction)</label>
              <MathTextArea
                value={question.instruction || ''}
                onChange={(v) => handleUpdate({ instruction: v })}
                placeholder="যেমন: কবিতাংশটির মূলভাব লিখো।"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">কবি/লেখক (Author)</label>
              <MathTextArea
                value={question.author || ''}
                onChange={(v) => handleUpdate({ author: v })}
                placeholder="যেমন: রবীন্দ্রনাথ ঠাকুর"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">কবিতার লাইনসমূহ (প্রতিটি লাইনে এন্টার চাপুন)</label>
              <MathTextArea
                value={Array.isArray(question.lines) ? question.lines.join('\n') : question.lines || ''}
                onChange={(v) => handleUpdate({ lines: v.split('\n').filter(Boolean) })}
                placeholder="যেমন: আমার সোনার বাংলা..."
                rows={4}
              />
            </div>
          </div>
        )
      }

      case 'passage': {
        const subs = question.questions || []
        const addSubQuestion = () => {
          const newSub = { no: subs.length + 1, text: '', marks: 1 }
          handleUpdate({ questions: [...subs, newSub] })
        }
        const removeSubQuestion = (indexToRemove) => {
          const updated = subs.filter((_, idx) => idx !== indexToRemove).map((item, idx) => ({ ...item, no: idx + 1 }))
          handleUpdate({ questions: updated })
        }
        const updateSubQuestion = (idx, fields) => {
          const updated = [...subs]
          updated[idx] = { ...updated[idx], ...fields }
          handleUpdate({ questions: updated })
        }
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">প্যাসেজ টেক্সট (Passage Text)</label>
              <MathTextArea
                value={question.passage || ''}
                onChange={(v) => handleUpdate({ passage: v })}
                placeholder="Read the passage carefully..."
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="block text-xs font-bold text-gray-500">প্যাসেজভিত্তিক প্রশ্নসমূহ ({subs.length})</label>
              {subs.map((sq, idx) => (
                <div key={idx} className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">প্রশ্ন {sq.no || idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSubQuestion(idx)}
                      className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs font-bold rounded-lg transition-colors"
                    >
                      ডিলিট করুন
                    </button>
                  </div>
                  <MathTextArea
                    value={sq.text || ''}
                    onChange={(v) => updateSubQuestion(idx, { text: v })}
                    placeholder="প্রশ্ন লিখুন..."
                    rows={1}
                    className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">নম্বর (Marks)</label>
                    <input
                      type="number"
                      value={sq.marks || ''}
                      onChange={(e) => updateSubQuestion(idx, { marks: Number(e.target.value) || 0 })}
                      placeholder="মান..."
                      className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubQuestion}
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-500 rounded-xl hover:text-slate-700 transition-colors"
              >
                + প্রশ্ন যোগ করুন
              </button>
            </div>
          </div>
        )
      }

      case 'true_false': {
        const statements = question.statements || []
        const addStatement = () => {
          const newStmt = { text: '', answer: true }
          handleUpdate({ statements: [...statements, newStmt] })
        }
        const removeStatement = (indexToRemove) => {
          const updated = statements.filter((_, idx) => idx !== indexToRemove)
          handleUpdate({ statements: updated })
        }
        const updateStatement = (idx, fields) => {
          const updated = [...statements]
          updated[idx] = { ...updated[idx], ...fields }
          handleUpdate({ statements: updated })
        }
        return (
          <div className="flex flex-col gap-3">
            <label className="block text-xs font-bold text-gray-500">সত্য/মিথ্যা বিবৃতিসমূহ ({statements.length})</label>
            <div className="flex flex-col gap-3">
              {statements.map((stmt, idx) => (
                <div key={idx} className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">বিবৃতি {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStatement(idx)}
                      className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs font-bold rounded-lg transition-colors"
                    >
                      ডিলিট করুন
                    </button>
                  </div>
                  <MathTextArea
                    value={stmt.text || ''}
                    onChange={(v) => updateStatement(idx, { text: v })}
                    placeholder="বিবৃতি..."
                    rows={1}
                    className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <div className="flex flex-col gap-1">
                    <label className="block text-[10px] font-bold text-gray-400">উত্তর</label>
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden p-0.5 w-full">
                      {[
                        { val: true, label: 'True (সত্য)', color: 'text-green-600 bg-green-50' },
                        { val: false, label: 'False (মিথ্যা)', color: 'text-red-600 bg-red-50' },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => updateStatement(idx, { answer: opt.val })}
                          className={`px-3 py-2.5 text-xs font-black rounded transition-colors flex-1 ${
                            stmt.answer === opt.val ? opt.color : 'text-slate-400 hover:text-slate-600 bg-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addStatement}
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-500 rounded-xl hover:text-slate-700 transition-colors"
              >
                + বিবৃতি যোগ করুন
              </button>
            </div>
          </div>
        )
      }

      default:
        return (
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">প্রশ্ন টেক্সট</label>
            <MathTextArea
              value={question.question || ''}
              onChange={(v) => handleUpdate({ question: v })}
              placeholder="প্রশ্ন লিখুন..."
              rows={2}
            />
          </div>
        )
    }
  }

  const isPassage = question.type === 'passage'

  return (
    <div className="flex flex-col gap-4">
      {renderFields()}

      <ImageUploadButton
        value={question.image || null}
        onChange={(img) => handleUpdate({ image: img })}
        imageHeight={question.image_height}
        imageWidth={question.image_width}
        onHeightChange={(v) => handleUpdate({ image_height: v })}
        onWidthChange={(v) => handleUpdate({ image_width: v })}
        label="📷 ডায়াগ্রাম/ছবি"
      />
      {!isPassage && (
        <div className="flex flex-col gap-1.5 pt-2.5 border-t border-slate-100">
          <label className="text-xs font-bold text-gray-500">নম্বর (Marks)</label>
          <input
            type="number"
            value={question.marks || ''}
            onChange={(e) => handleUpdate({ marks: Number(e.target.value) })}
            min={0}
            className="w-full px-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  )
}