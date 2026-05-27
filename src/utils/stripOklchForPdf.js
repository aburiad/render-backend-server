/**
 * html2pdf.js uses html2canvas which cannot parse oklch()/oklab()
 * colors (Tailwind v4 default).
 *
 * The CORRECT approach: fix them inside the onclone callback by
 * directly modifying <style> tag textContent AND stylesheet rules.
 * html2canvas creates a cloned document, calls onclone, THEN parses
 * styles — so our changes take effect before rendering.
 *
 * Usage in html2pdf:
 *   html2canvas: { onclone: oklchOnclone(), ...otherOptions }
 */

const OKL_REGEX = /okl[a-z]+\([^)]*\)/g

/**
 * Recursively walk CSS rules and replace oklch/oklab in individual properties.
 */
function fixStylesheetRules(rules) {
  for (const rule of rules) {
    try {
      if (rule.cssRules) fixStylesheetRules(rule.cssRules)
      if (rule.style && rule.style.length) {
        for (let i = 0; i < rule.style.length; i++) {
          const prop = rule.style[i]
          const val = rule.style.getPropertyValue(prop)
          if (val && OKL_REGEX.test(val)) {
            const prio = rule.style.getPropertyPriority(prop)
            rule.style.setProperty(prop, val.replace(OKL_REGEX, '#333'), prio)
          }
        }
      }
    } catch { /* read-only rule */ }
  }
}

/**
 * Returns an onclone handler for html2canvas that strips oklch()/oklab()
 * from the CLONED document. The main document is never modified.
 *
 * Uses THREE methods for maximum compatibility:
 *  1. Modify <style> textContent directly (works for Vite dev mode)
 *  2. Modify stylesheet rules via CSSOM (works for production builds)
 *  3. Fix inline styles on elements
 */
export function oklchOnclone() {
  return (clonedDoc) => {
    // Resolve the actual Document object — html2canvas passes the
    // Document, but some versions might pass an Element.
    const doc = clonedDoc.documentElement
      ? clonedDoc
      : (clonedDoc.ownerDocument || clonedDoc)

    // ── Method 1: Fix <style> tag textContent ────────────────
    // In Vite dev mode, CSS is injected as <style> tags.
    // Directly modifying textContent ensures html2canvas reads fixed CSS.
    try {
      doc.querySelectorAll('style').forEach(styleEl => {
        const css = styleEl.textContent || ''
        if (css.includes('oklch') || css.includes('oklab')) {
          styleEl.textContent = css.replace(OKL_REGEX, '#333')
        }
      })
    } catch { /* non-critical */ }

    // ── Method 2: Fix stylesheet rules via CSSOM ──────────────
    // In production, CSS may be in <link> stylesheets.
    try {
      const sheets = doc.styleSheets || []
      for (const sheet of sheets) {
        try { fixStylesheetRules(sheet.cssRules) } catch { /* cross-origin */ }
      }
    } catch { /* non-critical */ }

    // ── Method 3: Fix inline styles on elements ───────────────
    try {
      doc.querySelectorAll('[style]').forEach(el => {
        const css = el.style.cssText
        if (css && (css.includes('oklch') || css.includes('oklab'))) {
          el.style.cssText = css.replace(OKL_REGEX, '#333')
        }
      })
    } catch { /* non-critical */ }
  }
}