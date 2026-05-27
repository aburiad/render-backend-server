/**
 * html2pdf.js uses html2canvas which cannot parse oklch()/oklab()
 * colors (Tailwind v4 default).
 *
 * APPROACH: Temporarily replace oklch/oklab in the MAIN document's
 * <style> tag textContent (not stylesheets), generate PDF, then restore.
 * This is the most reliable method because:
 *  - Vite injects CSS as <style> tags (both dev and prod)
 *  - textContent modification updates CSSOM immediately
 *  - html2canvas reads from the live CSSOM
 *
 * Usage:
 *   const restore = stripOklchForPdf()
 *   try { await html2pdf()...from(el).save() }
 *   finally { restore() }
 */

const OKL_REGEX = /okl[a-z]+\([^)]*\)/g

/**
 * Replaces oklch()/oklab() in all <style> tags with fallback hex colors.
 * Returns a restore function that puts back the original CSS.
 *
 * IMPORTANT: Call restore() in a finally block to avoid broken styles!
 */
export function stripOklchForPdf() {
  /** @type {Array<{el: HTMLStyleElement, original: string}>} */
  const saved = []

  // Save and replace in all <style> tags
  document.querySelectorAll('style').forEach((el) => {
    const css = el.textContent || ''
    if (css.includes('oklch') || css.includes('oklab')) {
      saved.push({ el, original: css })
      el.textContent = css.replace(OKL_REGEX, '#333')
    }
  })

  // Also fix inline styles on elements (rare but possible)
  const inlineFixed = []
  document.querySelectorAll('[style]').forEach((el) => {
    const css = el.style.cssText
    if (css && (css.includes('oklch') || css.includes('oklab'))) {
      inlineFixed.push({ el, original: css })
      el.style.cssText = css.replace(OKL_REGEX, '#333')
    }
  })

  // Return restore function
  return function restore() {
    for (const { el, original } of saved) {
      try { el.textContent = original } catch { /* */ }
    }
    for (const { el, original } of inlineFixed) {
      try { el.style.cssText = original } catch { /* */ }
    }
  }
}