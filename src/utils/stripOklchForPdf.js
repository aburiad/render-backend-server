/**
 * html2pdf.js uses html2canvas which cannot parse oklch() colors
 * (Tailwind v4 default). This utility temporarily replaces oklch()
 * in ALL document stylesheets before html2pdf runs, then restores.
 *
 * Strategy: For each stylesheet, read all CSS rules, replace oklch()
 * with a safe fallback, inject as a new <style> tag, and DISABLE the
 * original stylesheet. After PDF generation, reverse the process.
 */

/**
 * Recursively collect all CSS text from a CSSRule list,
 * including nested rules (media, layer, supports, etc.)
 */
function collectCssText(rules) {
  let text = ''
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (rule.cssRules) {
      // Nested rules (media, layer, supports, container)
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
 * 4. Disabling the original stylesheet
 *
 * Returns a restore function — call it after html2pdf finishes.
 */
export function stripOklchForPdf() {
  const entries = []

  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i]
    try {
      const cssText = collectCssText(sheet.cssRules)
      if (!cssText.includes('oklch')) continue

      const cleanCss = cssText.replace(/oklch\([^)]*\)/g, '#333')

      const styleEl = document.createElement('style')
      styleEl.setAttribute('data-oklch-patch', '1')
      styleEl.textContent = cleanCss
      document.head.appendChild(styleEl)

      // Disable the original stylesheet owner node
      const ownerNode = sheet.ownerNode
      if (ownerNode) {
        ownerNode.setAttribute('data-oklch-disabled', '1')
        ownerNode.disabled = true
      }

      entries.push({ cleanStyleEl: styleEl, originalNode: ownerNode })
    } catch {
      // Cross-origin stylesheet — skip
    }
  }

  return function restore() {
    for (const { cleanStyleEl, originalNode } of entries) {
      cleanStyleEl.remove()
      if (originalNode) {
        originalNode.disabled = false
        originalNode.removeAttribute('data-oklch-disabled')
      }
    }
  }
}