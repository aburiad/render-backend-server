// Sub-question numbering styles for CQ + Accounting questions.
// User picks one style; renderer + editor compute label from style + index
// instead of relying on stored sub.label (which becomes the fallback for
// legacy data only).

export const NUMBERING_STYLES = {
  'bn-letter': ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ'],
  'en-letter': ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
  'arabic': ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'],
  'arabic-en': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  'roman': ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'],
}

export const NUMBERING_OPTIONS = [
  { value: 'bn-letter', label: 'ক, খ, গ, ঘ' },
  { value: 'en-letter', label: 'a, b, c, d' },
  { value: 'arabic', label: '১, ২, ৩, ৪' },
  { value: 'arabic-en', label: '1, 2, 3, 4' },
  { value: 'roman', label: 'i, ii, iii, iv' },
]

export const LAYOUT_OPTIONS = [
  { value: 1, label: '১ কলাম' },
  { value: 2, label: '২ কলাম' },
  { value: 4, label: '৪ কলাম' },
]

export function getSubLabel(style, index, fallback = '') {
  const arr = NUMBERING_STYLES[style]
  if (arr && index < arr.length) return arr[index]
  if (arr) return String(index + 1)
  return fallback
}
