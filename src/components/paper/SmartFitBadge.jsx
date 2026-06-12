import { motion } from 'framer-motion'

/**
 * SmartFitBadge - Visual indicator for SmartFit status
 *
 * Shows a badge with icon and message indicating the fit quality:
 * - perfect (green): 80-95% page utilization
 * - optimal (blue): 90-100% utilization
 * - good (yellow): 70-90% utilization
 * - loose (gray): <70% utilization
 * - overflow (red): Content exceeds page
 */
export function SmartFitBadge({ result, message, calculating = false }) {
  const getResultConfig = () => {
    if (calculating) {
      return {
        icon: '⏳',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
      }
    }

    switch (result) {
      case 'perfect':
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
        }
      case 'optimal':
        return {
          icon: '✨',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300',
        }
      case 'good':
        return {
          icon: '👍',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-300',
        }
      case 'loose':
        return {
          icon: '📄',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
        }
      case 'overflow':
        return {
          icon: '⚠️',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-300',
        }
      default:
        return {
          icon: '📊',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
        }
    }
  }

  const config = getResultConfig()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        text-[10px] sm:text-[11px] font-bold
      `}
    >
      <span className="text-sm">{config.icon}</span>
      <span>{calculating ? 'হিসাব করা হচ্ছে...' : message}</span>
    </motion.div>
  )
}

/**
 * SmartFitToggle - Checkbox for enabling SmartFit with page selection
 */
export function SmartFitToggle({
  enabled,
  onToggle,
  onPageSelect,
  selectedPages = 'auto',
  badge,
  currentPageCount = 0,
}) {
  // Generate page options based on current page count
  const pageOptions = []

  // Always show 1, 2, 3 options
  pageOptions.push({ value: '1', label: '১ পেজ', subLabel: '1 Page' })
  pageOptions.push({ value: '2', label: '২ পেজ', subLabel: '2 Pages' })
  pageOptions.push({ value: '3', label: '৩ পেজ', subLabel: '3 Pages' })

  // Add current page count if > 3
  if (currentPageCount > 3) {
    const existing = pageOptions.find(p => p.value === String(currentPageCount))
    if (!existing) {
      pageOptions.push({ value: String(currentPageCount), label: `${currentPageCount} পেজ`, subLabel: `${currentPageCount} Pages` })
    }
  }

  // Add current + 1 if exists
  if (currentPageCount + 1 > 3 && currentPageCount + 1 !== currentPageCount) {
    const existing = pageOptions.find(p => p.value === String(currentPageCount + 1))
    if (!existing) {
      pageOptions.push({ value: String(currentPageCount + 1), label: `${currentPageCount + 1} পেজ`, subLabel: `${currentPageCount + 1} Pages` })
    }
  }

  // Add Auto option
  pageOptions.push({ value: 'auto', label: 'অটো', subLabel: 'Auto' })

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-100">
      {/* Main Toggle */}
      <label className="flex items-center gap-2 sm:gap-3 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-gray-800">🤖 SmartFit</span>
            {enabled && badge && <SmartFitBadge {...badge} />}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
            অটো-ফিট পেজ — কত পেজে ফিট করবেন সিলেক্ট করুন
          </p>
        </div>
      </label>

      {/* Page Selection - Only show when enabled */}
      {enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="ml-6 sm:ml-8"
        >
          <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            টার্গেট পেজ সংখ্যা
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {pageOptions.map((option) => {
              const isSelected = selectedPages === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onPageSelect?.(option.value)}
                  className={`
                    flex flex-col items-center gap-0.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl
                    border-2 transition-all btn-press
                    ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'
                    }
                  `}
                >
                  <span className="text-[10px] sm:text-[11px] font-bold leading-none">
                    {option.label}
                  </span>
                  <span className="text-[7px] sm:text-[8px] uppercase opacity-60 leading-none">
                    {option.subLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
