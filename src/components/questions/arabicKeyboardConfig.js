export const LETTER_ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
]

export const FARSI_LETTER_ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'ژ'],
]

export const HARAKAT_ROWS = [
  ['َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ', 'ٰ'],
]

export const SYMBOL_ROWS = [
  ['ذ', 'أ', 'إ', 'آ', 'ﷲ', 'ﷺ', '،', '؛', '؟'],
]

export const FARSI_SYMBOL_ROWS = [
  ['ء', 'أ', 'إ', 'آ', 'ۀ', 'ؤ', 'ئ', '،', '؛', '؟'],
  ['‌', '«', '»', '٪', '٫', '٬', 'ﷲ'],
]

export const KEYBOARD_CONFIG = {
  ar: {
    trigger: 'ع',
    title: 'আরবি কীবোর্ড খুলুন',
    tabs: [
      ['letters', 'حروف'],
      ['harakat', 'حركات'],
      ['symbols', 'رموز'],
    ],
    rows: {
      letters: LETTER_ROWS,
      harakat: HARAKAT_ROWS,
      symbols: SYMBOL_ROWS,
    },
    gradient: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)',
    shadow: 'rgba(5, 150, 105, 0.32)',
    shadowHover: 'rgba(5, 150, 105, 0.42)',
    activeBorder: '#059669',
    activeBg: '#ecfdf5',
    activeText: '#047857',
  },
  fa: {
    trigger: 'پ',
    title: 'ফারসি কীবোর্ড খুলুন',
    tabs: [
      ['letters', 'حروف'],
      ['harakat', 'اعراب'],
      ['symbols', 'نمادها'],
    ],
    rows: {
      letters: FARSI_LETTER_ROWS,
      harakat: HARAKAT_ROWS,
      symbols: FARSI_SYMBOL_ROWS,
    },
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    shadow: 'rgba(124, 58, 237, 0.32)',
    shadowHover: 'rgba(124, 58, 237, 0.42)',
    activeBorder: '#7c3aed',
    activeBg: '#f5f3ff',
    activeText: '#6d28d9',
  },
}
