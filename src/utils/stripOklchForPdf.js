/**
 * html2pdf.js uses html2canvas which cannot parse oklch() colors
 * (Tailwind v4 default). This utility temporarily replaces oklch()
 * in ALL document stylesheets before html2pdf runs, then restores.
 *
 * Strategy: For each stylesheet containing oklch, read all CSS rules,
 * replace oklch() with a safe fallback, inject as a new <style> tag,
 * and REMOVE the original stylesheet node from the DOM entirely.
 * After PDF generation, put the originals back.
 *
 * We must REMOVE (not just disable) because html2canvas may still
 * read "disabled" stylesheets. Physically removing them from the DOM
 * is the only reliable way.
 */

/**
 * Recursively collect all CSS text from a CSSRule list,
 * including nested rules (media, layer, supports, container).
 */
function collectCssText(rules) {
  let text = ''
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (rule.cssRules) {
      text += rule.cssText.split('{')[0] + '{\n'
      text += collectCssText(rule.cssRules)
      text += '}\n'
    } else {
      text += rule.cssText + '\n'
    }
  }
  return text
}

/**
 * Strip oklch() from all document stylesheets by:
 * 1. Reading all CSS text from each sheet
 * 2. Replacing oklch() with #333
 * 3. Injecting a clean <style> tag
 * 4. REMOVING the original stylesheet node from the DOM
 *
 * Returns a restore function — call it after html2pdf finishes.
 */
export function stripOklchForPdf() {
  const entries = []

  // Collect all stylesheets into an array first (DOM changes mid-loop can skip items)
  const sheets = [...document.styleSheets]

  for (const sheet of sheets) {
    try {
      const cssText = collectCssText(sheet.cssRules)
      if (!cssText.includes('oklch')) continue

      const cleanCss = cssText.replace(/oklch\([^)]*\)/g, '#333')

      const styleEl = document.createElement('style')
      styleEl.setAttribute('data-oklch-patch', '1')
      styleEl.textContent = cleanCss
      document.head.appendChild(styleEl)

      // REMOVE the original stylesheet node from DOM entirely
      const ownerNode = sheet.ownerNode
      if (ownerNode && ownerNode.parentNode) {
        ownerNode.parentNode.removeChild(ownerNode)
        entries.push({ cleanStyleEl: styleEl, originalNode: ownerNode, insertBefore: styleEl })
      }
    } catch {
      // Cross-origin stylesheet — skip
    }
  }

  return function restore() {
    for (const { cleanStyleEl, originalNode } of entries) {
      cleanStyleEl.remove()
      // Put the original back where the patch was
      if (originalNode) {
        document.head.appendChild(originalNode)
      }
    }
  }
}