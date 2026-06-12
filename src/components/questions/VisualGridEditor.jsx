import { useState } from 'react'
import usePaperStore from '@/store/paperStore'
import SvgAssetPicker from './SvgAssetPicker'

/**
 * Visual Grid Editor
 * For: Math box counting, shape comparison, image matching (Class 1-3)
 * Uses emoji for consistency with PDF preview
 */
export default function VisualGridEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [pickerSide, setPickerSide] = useState(null) // 'left' or 'right'

  const instruction = question.instruction || ''
  const leftAsset = question.left_asset || ''
  const leftCount = question.left_count || 0
  const rightAsset = question.right_asset || ''
  const rightCount = question.right_count || 0
  const operator = question.operator || 'compare' // compare, <, >, =, +, -, ×, ÷
  const mathQuestion = question.math_question || ''
  const marks = question.marks || 1

  const handleAssetSelect = (assetKey) => {
    if (pickerSide === 'left') {
      updateQuestion(question.id, { left_asset: assetKey })
    } else {
      updateQuestion(question.id, { right_asset: assetKey })
    }
    setShowAssetPicker(false)
    setPickerSide(null)
  }

  const openPicker = (side) => {
    setPickerSide(side)
    setShowAssetPicker(true)
  }

  // Asset emoji mapping (same as PDF preview)
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

  const getEmoji = (assetKey) => assetEmojis[assetKey] || '❓'

  return (
    <div className="space-y-4">
      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <SvgAssetPicker
              value={pickerSide === 'left' ? leftAsset : rightAsset}
              onChange={handleAssetSelect}
              onClose={() => {
                setShowAssetPicker(false)
                setPickerSide(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Instruction */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          নির্দেশনা
        </label>
        <input
          type="text"
          value={instruction}
          onChange={(e) => updateQuestion(question.id, { instruction: e.target.value })}
          placeholder="যেমন: সংখ্যাগুলো তুলনা করো"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Comparison Grid Builder */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Left Side */}
          <div className="space-y-2">
            <label className="block text-[10px] font-medium text-slate-500">
              বাম পাশ
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openPicker('left')}
                className="w-12 h-12 flex items-center justify-center bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-pink-400 transition-colors"
                title="ছবি সিলেক্ট করুন"
              >
                {leftAsset ? (
                  <span className="text-2xl">{getEmoji(leftAsset)}</span>
                ) : (
                  <span className="text-slate-300 text-xl">+</span>
                )}
              </button>
              <input
                type="number"
                value={leftCount}
                onChange={(e) => updateQuestion(question.id, { left_count: Number(e.target.value) })}
                min={0}
                max={20}
                className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center"
              />
            </div>
            {leftAsset && (
              <p className="text-[10px] text-slate-400 truncate">{leftAsset}</p>
            )}
          </div>

          {/* Operator */}
          <div className="flex flex-col items-center gap-2">
            <select
              value={operator}
              onChange={(e) => updateQuestion(question.id, { operator: e.target.value })}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center"
            >
              <option value="compare">?</option>
              <option value="<">{'<'}</option>
              <option value=">">{'>'}</option>
              <option value="=">=</option>
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="×">×</option>
              <option value="÷">÷</option>
            </select>
          </div>

          {/* Right Side */}
          <div className="space-y-2">
            <label className="block text-[10px] font-medium text-slate-500">
              ডান পাশ
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openPicker('right')}
                className="w-12 h-12 flex items-center justify-center bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-pink-400 transition-colors"
                title="ছবি সিলেক্ট করুন"
              >
                {rightAsset ? (
                  <span className="text-2xl">{getEmoji(rightAsset)}</span>
                ) : (
                  <span className="text-slate-300 text-xl">+</span>
                )}
              </button>
              <input
                type="number"
                value={rightCount}
                onChange={(e) => updateQuestion(question.id, { right_count: Number(e.target.value) })}
                min={0}
                max={20}
                className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center"
              />
            </div>
            {rightAsset && (
              <p className="text-[10px] text-slate-400 truncate">{rightAsset}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {(leftAsset || rightAsset) && (
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 mb-2">প্রিভিউ:</p>
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(leftCount, 5) }).map((_, i) => (
                <span key={i} className="text-2xl">
                  {getEmoji(leftAsset)}
                </span>
              ))}
              {leftCount > 5 && <span className="text-sm text-slate-400">+{leftCount - 5}</span>}
            </div>
            <span className="text-2xl font-bold text-slate-400">
              {operator === 'compare' ? '?' : operator}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(rightCount, 5) }).map((_, i) => (
                <span key={i} className="text-2xl">
                  {getEmoji(rightAsset)}
                </span>
              ))}
              {rightCount > 5 && <span className="text-sm text-slate-400">+{rightCount - 5}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Math Question (for visual math) */}
      {(operator === '+' || operator === '-' || operator === '×' || operator === '÷') && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            প্রশ্ন (ঐচ্ছিক)
          </label>
          <input
            type="text"
            value={mathQuestion}
            onChange={(e) => updateQuestion(question.id, { math_question: e.target.value })}
            placeholder="যেমন: মোট আপেল কতটি?"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      )}

      {/* Marks */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={marks}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Quick Tips */}
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
        <p className="text-[10px] font-medium text-purple-700 mb-1">টিপস:</p>
        <ul className="text-[10px] text-purple-600 space-y-0.5">
          <li>• ছবি সিলেক্ট করতে + বাটনে ক্লিক করুন</li>
          <li>• সংখ্যা সেট করুন (১-২০ পর্যন্ত)</li>
          <li>• প্রিন্টের সময় ডান পাশ শ্যাফল হবে</li>
        </ul>
      </div>
    </div>
  )
}
