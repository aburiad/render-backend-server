// Per-section question numbering. When sectionMode is on, the counter
// resets at every `{ type: 'section' }` divider in the questions array.
// When off, dividers are filtered out by the renderer so numbering is
// continuous as before.
//
// Returned array has same length as input. Section dividers map to `null`,
// real questions map to their 1-based number within the active section.

export function computeQuestionNumbers(questions, sectionMode) {
  const result = []
  let counter = 0
  for (const q of questions || []) {
    if (q?.type === 'section') {
      if (sectionMode) counter = 0
      result.push(null)
      continue
    }
    counter++
    result.push(counter)
  }
  return result
}

const BN_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ']

export function defaultSectionTitle(existingCount) {
  const letter = BN_LETTERS[existingCount] || `${existingCount + 1}`
  return `${letter} বিভাগ`
}
