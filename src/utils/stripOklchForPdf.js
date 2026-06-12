/**
 * html2pdf.js uses html2canvas which cannot parse oklch()/oklab()
 * colors (Tailwind v4 default).
 *
 * TWO-PRONGED FIX:
 *  1. stripOklchForPdf() — modifies <style> tag textContent to fix
 *     CSS variable definitions BEFORE html2canvas clones the DOM
 *  2. oklchOnclone() — walks ALL elements in the cloned document,
 *     reads their computed styles, and sets hex inline overrides.
 *     This catches any oklch/oklab that survived step 1.
 *
 * Usage:
 *   const restore = stripOklchForPdf()
 *   try {
 *     await html2pdf().set({
 *       html2canvas: { onclone: oklchOnclone(), ... }
 *     })...
 *   } finally { restore() }
 */

const OKL_REGEX = /okl[a-z]+\([^)]*\)/g

// ─── Step 1: Fix <style> tag textContent ────────────────────

export function stripOklchForPdf() {
  const saved = []

  document.querySelectorAll('style').forEach((el) => {
    const css = el.textContent || ''
    if (css.includes('oklch') || css.includes('oklab')) {
      saved.push({ el, original: css })
      el.textContent = css.replace(OKL_REGEX, '#333')
    }
  })

  const inlineFixed = []
  document.querySelectorAll('[style]').forEach((el) => {
    const css = el.style.cssText
    if (css && (css.includes('oklch') || css.includes('oklab'))) {
      inlineFixed.push({ el, original: css })
      el.style.cssText = css.replace(OKL_REGEX, '#333')
    }
  })

  return function restore() {
    for (const { el, original } of saved) {
      try { el.textContent = original } catch { /* */ }
    }
    for (const { el, original } of inlineFixed) {
      try { el.style.cssText = original } catch { /* */ }
    }
  }
}

// ─── Step 2: Fix computed styles in cloned document ─────────
//
// html2canvas reads computed styles from the cloned iframe document.
// Even after fixing <style> tags, some oklch/oklab values may survive
// (e.g., from browser-cached styles, cross-origin sheets, or computed
// values). This onclone handler walks ALL elements and overrides
// color properties with hex values using !important.

const COLOR_PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'caret-color',
  'column-rule-color',
  'border-color',
]

export function oklchOnclone() {
  return (clonedDoc) => {
    try {
      // Also fix <style> tags in the clone (belt & suspenders)
      clonedDoc.querySelectorAll('style').forEach((el) => {
        const css = el.textContent || ''
        if (css.includes('oklch') || css.includes('oklab')) {
          el.textContent = css.replace(OKL_REGEX, '#333')
        }
      })
    } catch { /* non-critical */ }

    // Walk ALL elements and override color properties with hex
    try {
      // Get the iframe's window for getComputedStyle
      const view = clonedDoc.defaultView || window
      const allElements = clonedDoc.querySelectorAll('*')

      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i]
        try {
          const cs = view.getComputedStyle(el)
          for (const prop of COLOR_PROPS) {
            const val = cs.getPropertyValue(prop)
            if (val && (val.includes('oklch') || val.includes('oklab'))) {
              // Set a safe hex color inline with !important
              // Use the appropriate color based on property type
              const isBg = prop.includes('background')
              const isBorder = prop.includes('border') || prop.includes('outline')
              const fallback = isBg ? '#ffffff' : isBorder ? '#000000' : '#333333'
              el.style.setProperty(prop, fallback, 'important')
            }
          }
        } catch { /* skip elements we can't access */ }
      }
    } catch { /* non-critical */ }

    // Fix inline styles on elements
    try {
      clonedDoc.querySelectorAll('[style]').forEach((el) => {
        const css = el.style.cssText
        if (css && (css.includes('oklch') || css.includes('oklab'))) {
          el.style.cssText = css.replace(OKL_REGEX, '#333')
        }
      })
    } catch { /* non-critical */ }
  }
}