/**
 * Automatically converts chemical formulas into subscripted HTML.
 * Example: H2O -> H₂O, H2SO4 -> H₂SO₄
 */
export const autoFormatChemistry = (text) => {
  if (!text) return ''

  // Subscript digits that follow a letter
  // Matches: H2, O2, SO4, etc.
  // Using biological/chemical subscript characters for clean text-only output if possible, 
  // but standard HTML <sub> is safer for PDF rendering.
  
  // Replace digit after letter with <sub>digit</sub>
  return text.replace(/([A-Z][a-z]?)(\d+)/g, (match, p1, p2) => {
    return `${p1}<sub>${p2}</sub>`
  })
}

/**
 * Strips HTML tags for clean data storage if needed.
 */
export const stripHtml = (html) => {
  if (!html) return ''
  const doc = new Array().slice.call(new DOMParser().parseFromString(html, 'text/html').body.childNodes)
  return doc.map(n => n.textContent).join('')
}
