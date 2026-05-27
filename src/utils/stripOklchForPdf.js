/**
 * html2pdf.js uses html2canvas which cannot parse oklch() colors
 * (Tailwind v4 default). 
 *
 * The CORRECT approach is to fix oklch inside the onclone callback.
 * html2canvas creates a cloned document in an iframe, then calls onclone,
 * THEN parses styles. So we can modify the cloned stylesheets safely
 * without touching the main document.
 *
 * Usage in html2pdf:
 *   html2canvas: { onclone: oklchOnclone(), ...otherOptions }
 */

/**
 * Recursively walk CSS rules (including nested @layer, @media, @supports)
 * and replace oklch() values in individual style properties.
 */
function replaceOklchInRules(rules) {
  for (const rule of rules) {
    try {
      // Recurse into nested rules (@layer, @media, @supports, @container)
      if (rule.cssRules) {
        replaceOklchInRules(rule.cssRules)
      }
      // Replace oklch/oklab in individual properties of this rule
      if (rule.style && rule.style.length) {
        for (let i = 0; i < rule.style.length; i++) {
          const prop = rule.style[i]
          const val = rule.style.getPropertyValue(prop)
          if (val && (val.includes('oklch') || val.includes('oklab'))) {
            const prio = rule.style.getPropertyPriority(prop)
            rule.style.setProperty(prop, val.replace(/okl[a-z]+\([^)]*\)/g, '#333'), prio)
          }
        }
      }
    } catch {
      // Some rules are read-only — skip
    }
  }
}

/**
 * Returns an onclone handler for html2canvas that strips oklch()
 * from the CLONED document's stylesheets. The main document is
 * never modified.
 */
export function oklchOnclone() {
  return (clonedDoc) => {
    try {
      // Fix oklch in cloned document's stylesheets
      const sheets = clonedDoc.styleSheets || []
      for (const sheet of sheets) {
        try {
          replaceOklchInRules(sheet.cssRules)
        } catch {
          // Cross-origin stylesheet — skip
        }
      }
    } catch {
      // Non-critical — best effort
    }

    // Also fix inline styles on elements that might have oklch
    try {
      clonedDoc.querySelectorAll('[style]').forEach(el => {
        const css = el.style.cssText
        if (css && (css.includes('oklch') || css.includes('oklab'))) {
          el.style.cssText = css.replace(/okl[a-z]+\([^)]*\)/g, '#333')
        }
      })
    } catch {
      // Non-critical
    }
  }
}