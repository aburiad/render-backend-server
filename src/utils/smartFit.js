/**
 * SmartFit Utility - Auto-optimize PDF layout settings
 *
 * Uses binary search algorithm to find optimal font size, spacing,
 * and margins for perfect page fitting.
 */

// Constants (must match PaperTemplate.jsx)
const MM_PER_PX = 96 / 25.4
const ITEM_SPACING_PX = 14

// Page content area after margins (mm)
const PAGE_SIZES = {
  A4: { portrait: { width: 186, height: 269 }, landscape: { width: 273, height: 182 } },
  A3: { portrait: { width: 273, height: 410 }, landscape: { width: 410, height: 273 } },
  A5: { portrait: { width: 124, height: 181 }, landscape: { width: 181, height: 124 } },
  Legal: { portrait: { width: 202, height: 346 }, landscape: { width: 346, height: 202 } },
  Letter: { portrait: { width: 202, height: 269 }, landscape: { width: 269, height: 202 } },
}

// Margin sizes in mm (reduce usable page area)
const MARGIN_MAP = {
  none: { horizontal: 0, vertical: 0 },
  narrow: { horizontal: 16, vertical: 16 },
  normal: { horizontal: 24, vertical: 28 }, // 12mm sides, 14mm top/bottom
  wide: { horizontal: 30, vertical: 40 }, // 15mm sides, 20mm top/bottom
}

/**
 * Calculate usable page area in pixels
 */
function getUsablePageArea(pageFormat, orientation, pageMargin) {
  const dims = PAGE_SIZES[pageFormat]?.[orientation] || PAGE_SIZES.A4.portrait
  const margin = MARGIN_MAP[pageMargin] || MARGIN_MAP.normal

  return {
    width: (dims.width - margin.horizontal) * MM_PER_PX,
    height: (dims.height - margin.vertical) * MM_PER_PX,
  }
}

/**
 * Estimate total content height based on current settings
 * This is a simplified version - for real height measurement,
 * the component should use the actual rendered DOM
 */
function estimateContentHeight(questions, fontSize, spacing, colCount, columnGap, headerHeight) {
  // Base height adjusted for Bengali typography and KaTeX rendering
  const BASE_QUESTION_HEIGHT = 65 // px at 12pt, 1.6 spacing
  const FONT_SIZE_FACTOR = fontSize / 12
  const SPACING_FACTOR = spacing / 1.6

  // Calibration factor based on actual vs estimated measurements
  // Real PDF rendering tends to be ~1.3-1.5x taller than our estimation
  const CALIBRATION_FACTOR = 1.35

  const estimatedHeight = questions.reduce((total, q) => {
    if (q.type === 'section') return total + 30

    let multiplier = 1
    if (q.type === 'cq') multiplier = 2.0
    if (q.type === 'mcq') multiplier = 0.7
    if (q.type === 'matching') multiplier = 1.2
    if (q.type === 'fill_in_blanks') multiplier = 0.6

    return total + (BASE_QUESTION_HEIGHT * multiplier)
  }, 0)

  // Apply font and spacing factors
  const adjustedHeight = estimatedHeight * FONT_SIZE_FACTOR * SPACING_FACTOR

  // Add item spacing
  const spacingBetweenItems = (questions.length - 1) * ITEM_SPACING_PX

  // Apply calibration factor
  const totalHeight = (adjustedHeight + spacingBetweenItems + headerHeight) * CALIBRATION_FACTOR

  return totalHeight
}

/**
 * Binary search for optimal font size (10pt - 14pt)
 */
function findOptimalFontSize(
  questions,
  pageArea,
  colCount,
  spacing,
  columnGap,
  headerHeight,
  targetPages,
) {
  const sizes = ['10pt', '11pt', '12pt', '13pt', '14pt']
  let left = 0
  let right = sizes.length - 1
  let best = sizes[2] // Default to 12pt

  // Binary search for the largest size that fits
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const testSize = sizes[mid]
    const sizeNum = parseInt(testSize)

    const height = estimateContentHeight(
      questions,
      sizeNum,
      spacing,
      colCount,
      columnGap,
      headerHeight,
    )

    const contentPerPage = height / targetPages
    const fits = contentPerPage <= pageArea.height

    if (fits) {
      best = testSize
      left = mid + 1 // Try larger
    } else {
      right = mid - 1 // Try smaller
    }
  }

  return best
}

/**
 * Binary search for optimal line spacing (1.2 - 2.0)
 */
function findOptimalSpacing(
  questions,
  pageArea,
  colCount,
  fontSize,
  columnGap,
  headerHeight,
  targetPages,
) {
  const spacings = [1.2, 1.5, 1.6, 1.8, 2.0]
  let left = 0
  let right = spacings.length - 1
  let best = spacings[2] // Default to 1.6

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const testSpacing = spacings[mid]

    const height = estimateContentHeight(
      questions,
      fontSize,
      testSpacing,
      colCount,
      columnGap,
      headerHeight,
    )

    const contentPerPage = height / targetPages
    const fits = contentPerPage <= pageArea.height

    if (fits) {
      best = testSpacing
      left = mid + 1 // Try larger spacing
    } else {
      right = mid - 1 // Try smaller spacing
    }
  }

  return best
}

/**
 * Calculate optimal settings for perfect page fit
 *
 * @param {Object} params
 * @param {Array} params.questions - Array of question objects
 * @param {string} params.pageFormat - 'A4', 'A3', etc.
 * @param {string} params.orientation - 'portrait' or 'landscape'
 * @param {string} params.pageMargin - 'none', 'narrow', 'normal', 'wide'
 * @param {number} params.colCount - Number of columns (1, 2, or 3)
 * @param {string} params.columnGap - Column gap in mm (e.g., '5mm')
 * @param {number} params.headerHeight - Height of header in pixels
 * @param {number} params.currentPageCount - Current number of pages
 * @param {number} params.lastPageFillPercent - How much of last page is filled (0-100)
 * @param {string} params.currentFontSize - Current font size (e.g., '12pt')
 * @param {number} params.currentSpacing - Current line spacing (e.g., 1.6)
 *
 * @returns {Object} { fontSize, spacing, pageMargin, result, message }
 */
export function calculateOptimalFit(params) {
  const {
    questions,
    pageFormat = 'A4',
    orientation = 'portrait',
    pageMargin: currentMargin = 'normal',
    colCount = 1,
    columnGap = '',
    headerHeight = 60,
    currentPageCount,
    lastPageFillPercent,
    currentFontSize = '12pt',
    currentSpacing = 1.6,
  } = params

  // If we have perfect fit (>80% last page, no overflow), return current settings
  if (lastPageFillPercent >= 80 && lastPageFillPercent <= 95) {
    return {
      fontSize: currentFontSize,
      spacing: currentSpacing,
      pageMargin: currentMargin,
      result: 'perfect',
      message: 'পারফেক্ট ফিট ✅',
    }
  }

  const pageArea = getUsablePageArea(pageFormat, orientation, currentMargin)

  // NEW STRATEGY: Try to reduce page count while maintaining readability
  // Start from current pages - 1 and try to fit, but don't go below minimum readable size
  const minReadableSize = 10 // Minimum font size in pt
  const minReadableSpacing = 1.2 // Minimum spacing

  // Try to fit in progressively fewer pages
  let bestTargetPages = currentPageCount
  let bestSize = 14 // Start with max
  let bestSpacing = currentSpacing

  for (let targetPages = Math.max(1, currentPageCount - 2); targetPages <= currentPageCount; targetPages++) {
    // Find the largest font that fits in targetPages
    const testSize = parseInt(findOptimalFontSize(
      questions,
      pageArea,
      colCount,
      currentSpacing,
      columnGap,
      headerHeight,
      targetPages,
    ))

    // Check if this size is readable (>= 10pt)
    if (testSize >= minReadableSize) {
      // This target is achievable with readable font
      // Now try to optimize spacing too
      const testSpacing = findOptimalSpacing(
        questions,
        pageArea,
        colCount,
        testSize,
        columnGap,
        headerHeight,
        targetPages,
      )

      const testHeight = estimateContentHeight(
        questions,
        testSize,
        testSpacing,
        colCount,
        columnGap,
        headerHeight,
      )

      const utilization = (testHeight / targetPages / pageArea.height) * 100

      // If utilization is good (70-95%), this is a viable option
      if (utilization >= 70 && utilization <= 100) {
        // Prefer fewer pages with larger font
        if (targetPages < bestTargetPages || testSize > bestSize) {
          bestTargetPages = targetPages
          bestSize = testSize
          bestSpacing = testSpacing
        }
      }
    }
  }

  let optimalSize = bestSize

  let optimalSpacing = bestSpacing

  // Step 3: Determine result status
  const finalHeight = estimateContentHeight(
    questions,
    optimalSize,
    optimalSpacing,
    colCount,
    columnGap,
    headerHeight,
  )

  const heightPerPage = finalHeight / bestTargetPages
  const utilizationPercent = (heightPerPage / pageArea.height) * 100

  console.log('[SmartFit] Calculation:', {
    optimalSize,
    optimalSpacing,
    finalHeight: Math.round(finalHeight),
    heightPerPage: Math.round(heightPerPage),
    pageHeight: Math.round(pageArea.height),
    utilizationPercent: Math.round(utilizationPercent),
    targetPages: bestTargetPages,
    originalPages: currentPageCount,
    pagesReduced: currentPageCount - bestTargetPages,
    note: 'Calibrated: ×1.35 for actual PDF rendering',
  })

  let result, message
  if (utilizationPercent > 100) {
    result = 'overflow'
    message = 'সব প্রশ্ন মুড়িয়ে যাচ্ছে, ফন্ট কমানো হচ্ছে...'
  } else if (bestTargetPages < currentPageCount) {
    result = 'optimal'
    message = `পেজ কমানো হয়েছে! ${currentPageCount} → ${bestTargetPages} 📉`
  } else if (utilizationPercent > 90) {
    result = 'optimal'
    message = 'অপটিমাল ফিট ✨'
  } else if (utilizationPercent > 70) {
    result = 'good'
    message = 'ভালো ফিট 👍'
  } else {
    result = 'loose'
    message = 'পেজে ফাঁকা জায়গা আছে'
  }

  // Convert number to string format
  const sizeStr = `${optimalSize}pt`
  const spacingStr = optimalSpacing.toFixed(1)

  return {
    fontSize: sizeStr,
    spacing: parseFloat(spacingStr),
    pageMargin: currentMargin,
    result,
    message,
    utilizationPercent: Math.round(utilizationPercent),
    targetPages: bestTargetPages,
    originalPages: currentPageCount,
    pagesReduced: currentPageCount - bestTargetPages,
  }
}

/**
 * Quick check if SmartFit should suggest changes
 */
export function shouldSuggestSmartFit(lastPageFillPercent, hasOverflow) {
  return hasOverflow || lastPageFillPercent < 50 || lastPageFillPercent > 100
}

/**
 * Calculate optimal settings for a specific page target
 *
 * @param {Object} params
 * @param {Array} params.questions - Array of question objects
 * @param {string} params.pageFormat - 'A4', 'A3', etc.
 * @param {string} params.orientation - 'portrait' or 'landscape'
 * @param {string} params.pageMargin - 'none', 'narrow', 'normal', 'wide'
 * @param {number} params.colCount - Number of columns (1, 2, or 3)
 * @param {string} params.columnGap - Column gap in mm
 * @param {number} params.headerHeight - Height of header in pixels
 * @param {number|string} params.targetPages - Target page count (1, 2, 3, or 'auto')
 * @param {number} params.currentPages - Current estimated page count
 *
 * @returns {Object} { fontSize, spacing, pageMargin, result, message, targetPages }
 */
export function calculateForPageTarget(params) {
  const {
    questions,
    pageFormat = 'A4',
    orientation = 'portrait',
    pageMargin: currentMargin = 'normal',
    colCount = 1,
    columnGap = '',
    headerHeight = 60,
    targetPages = 'auto',
    currentPages = 1,
  } = params

  const pageArea = getUsablePageArea(pageFormat, orientation, currentMargin)

  // If auto, use the existing calculateOptimalFit logic
  if (targetPages === 'auto') {
    return calculateOptimalFit({
      ...params,
      currentPageCount: currentPages,
      lastPageFillPercent: 50, // Default mid-value for auto
      currentFontSize: '12pt',
      currentSpacing: 1.6,
    })
  }

  // Specific page target
  const targetPageNum = parseInt(targetPages)
  if (isNaN(targetPageNum) || targetPageNum < 1) {
    return {
      fontSize: '12pt',
      spacing: 1.6,
      pageMargin: currentMargin,
      result: 'error',
      message: 'Invalid page target',
      targetPages,
    }
  }

  // Calculate what font size and spacing are needed for this page count
  const minSize = 10
  const maxSize = 14
  const sizes = ['10pt', '11pt', '12pt', '13pt', '14pt']

  // Binary search for the largest font that fits in target pages
  let left = 0
  let right = sizes.length - 1
  let bestSize = sizes[0] // Start with smallest
  let bestSpacing = 1.2

  // Try each size from largest to smallest
  for (let i = sizes.length - 1; i >= 0; i--) {
    const testSizeNum = parseInt(sizes[i])
    const testHeight = estimateContentHeight(
      questions,
      testSizeNum,
      1.6, // Start with default spacing
      colCount,
      columnGap,
      headerHeight,
    )

    const heightPerPage = testHeight / targetPageNum
    const utilization = (heightPerPage / pageArea.height) * 100

    // If fits (<= 100%), this size works
    if (utilization <= 100) {
      bestSize = sizes[i]

      // Now optimize spacing for this size
      const spacings = [1.2, 1.5, 1.6, 1.8, 2.0]
      for (let j = spacings.length - 1; j >= 0; j--) {
        const testSpacing = spacings[j]
        const testHeight2 = estimateContentHeight(
          questions,
          testSizeNum,
          testSpacing,
          colCount,
          columnGap,
          headerHeight,
        )

        const heightPerPage2 = testHeight2 / targetPageNum
        const utilization2 = (heightPerPage2 / pageArea.height) * 100

        if (utilization2 <= 100) {
          bestSpacing = testSpacing
          break
        }
      }
      break // Found the largest size, no need to check smaller ones
    }
  }

  const finalHeight = estimateContentHeight(
    questions,
    parseInt(bestSize),
    bestSpacing,
    colCount,
    columnGap,
    headerHeight,
  )

  const utilizationPercent = (finalHeight / targetPageNum / pageArea.height) * 100

  console.log('[SmartFit] Page Target Calculation:', {
    targetPages: targetPageNum,
    bestSize,
    bestSpacing,
    finalHeight: Math.round(finalHeight),
    heightPerPage: Math.round(finalHeight / targetPageNum),
    pageHeight: Math.round(pageArea.height),
    utilizationPercent: Math.round(utilizationPercent),
    note: 'Calibrated: ×1.35 for actual PDF rendering',
  })

  let result, message
  if (utilizationPercent > 100) {
    result = 'overflow'
    message = `${targetPageNum} পেজে মুড়িয়ে যাবে, পেজ বাড়ান`
  } else if (utilizationPercent > 95) {
    result = 'perfect'
    message = `পারফেক্ট ${targetPageNum} পেজে ✅`
  } else if (utilizationPercent > 85) {
    result = 'optimal'
    message = `${targetPageNum} পেজে ফিট হবে ✨`
  } else if (utilizationPercent > 70) {
    result = 'good'
    message = `${targetPageNum} পেজে হবে 👍`
  } else {
    result = 'loose'
    message = `${targetPageNum} পেজে ফাঁকা জায়গা থাকবে`
  }

  return {
    fontSize: bestSize,
    spacing: bestSpacing,
    pageMargin: currentMargin,
    result,
    message,
    targetPages: targetPageNum,
    utilizationPercent: Math.round(utilizationPercent),
  }
}
