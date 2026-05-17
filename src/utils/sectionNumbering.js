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

const BN_DIGITS = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF']
const AR_DIGITS = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669']
const FA_DIGITS = ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4', '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9']

function convertDigits(value, digits) {
  return String(value).replace(/\d/g, (d) => digits[Number(d)] || d)
}

export const QUESTION_NUMBERING_OPTIONS = [
  { value: 'en', label: '1, 2, 3' },
  { value: 'bn', label: '\u09E7, \u09E8, \u09E9' },
  { value: 'ar', label: '\u0661, \u0662, \u0663' },
  { value: 'fa', label: '\u06F1, \u06F2, \u06F3' },
]

export const QUESTION_DIRECTION_OPTIONS = [
  { value: 'ltr', label: 'LTR - \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AC\u09BE\u09AE\u09C7' },
  { value: 'rtl', label: 'RTL - \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A1\u09BE\u09A8\u09C7' },
]

export function formatQuestionNumber(number, style = 'en') {
  if (number == null) return null
  if (style === 'bn') return convertDigits(number, BN_DIGITS)
  if (style === 'ar') return convertDigits(number, AR_DIGITS)
  if (style === 'fa') return convertDigits(number, FA_DIGITS)
  return String(number)
}

const BN_LETTERS = ['\u0995', '\u0996', '\u0997', '\u0998', '\u0999', '\u099A', '\u099B', '\u099C']

export function defaultSectionTitle(existingCount) {
  const letter = BN_LETTERS[existingCount] || `${existingCount + 1}`
  return `${letter} \u09AC\u09BF\u09AD\u09BE\u0997`
}
