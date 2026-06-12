/**
 * Board Question → PaperEditor question format converter
 *
 * Transforms board_questions API responses into the shape
 * that PaperEditor / paperStore expects — same pattern as vaultConverter.
 */

/**
 * Board label map for display
 */
export const BOARD_LABELS = {
  dhaka: 'ঢাকা',
  comilla: 'কুমিল্লা',
  rajshahi: 'রাজশাহী',
  jessore: 'যশোর',
  chittagong: 'চট্টগ্রাম',
  barishal: 'বরিশাল',
  sylhet: 'সিলেট',
  dinajpur: 'দিনাজপুর',
  mymensingh: 'ময়মনসিংহ',
  all: 'সকল বোর্ড',
}

/**
 * Convert a board question to PaperEditor format.
 * @param {Object} bq - Board question from API
 * @returns {Object} PaperEditor-compatible question
 */
export function boardToPaperQuestion(bq) {
  const id = crypto.randomUUID()
  const meta = bq.board_meta || {}

  if (bq.type === 'MCQ') {
    return {
      id,
      type: 'MCQ',
      section: '',
      question: bq.question || '',
      option_a: bq.options?.ক || '',
      option_b: bq.options?.খ || '',
      option_c: bq.options?.গ || '',
      option_d: bq.options?.ঘ || '',
      correct_answer: bq.answer
        ? { ক: 'a', খ: 'b', গ: 'c', ঘ: 'd' }[bq.answer] || null
        : null,
      marks: bq.marks || 1,
      source: 'board',
      sourceLabel: `${BOARD_LABELS[meta.board] || meta.board} ${String(meta.year).slice(-2)}`,
      boardId: bq.id,
    }
  }

  if (bq.type === 'CQ') {
    const parts = bq.parts || {}
    const subQuestions = Object.entries(parts).map(([label, text]) => {
      const markMap = { ক: 1, খ: 2, গ: 3, ঘ: 4 }
      return {
        label,
        text: typeof text === 'string' ? text : '',
        marks: markMap[label] || 2,
      }
    })
    // Ensure at least 4 sub-questions
    while (subQuestions.length < 4) {
      const labels = ['ক', 'খ', 'গ', 'ঘ']
      subQuestions.push({ label: labels[subQuestions.length] || 'ঘ', text: '', marks: 2 })
    }
    return {
      id,
      type: 'CQ',
      section: '',
      stimulus: bq.stimulus || '',
      sub_questions: subQuestions,
      marks: bq.totalMarks || 10,
      source: 'board',
      sourceLabel: `${BOARD_LABELS[meta.board] || meta.board} ${String(meta.year).slice(-2)}`,
      boardId: bq.id,
    }
  }

  // short / saq
  return {
    id,
    type: 'short',
    section: '',
    question: bq.question || '',
    marks: bq.marks || 2,
    source: 'board',
    sourceLabel: `${BOARD_LABELS[meta.board] || meta.board} ${String(meta.year).slice(-2)}`,
    boardId: bq.id,
  }
}

/**
 * Batch convert board questions.
 * @param {Array} boardQuestions
 * @returns {Array} PaperEditor questions
 */
export function boardToPaperQuestions(boardQuestions) {
  return (boardQuestions || []).map(boardToPaperQuestion)
}

/**
 * Static config for Board Question filters (used client-side for dropdowns)
 */
export const BOARD_EXAM_OPTIONS = [
  { value: 'SSC', label: 'SSC' },
  { value: 'HSC', label: 'HSC' },
]

export const BOARD_YEAR_OPTIONS = [
  { value: 2026, label: '২০২৬' },
  { value: 2025, label: '২০২৫' },
  { value: 2024, label: '২০২৪' },
  { value: 2023, label: '২০২৩' },
  { value: 2022, label: '২০২২' },
  { value: 2021, label: '২০২১' },
  { value: 2020, label: '২০২০' },
  { value: 2019, label: '২০১৯' },
  { value: 2018, label: '২০১৮' },
  { value: 2017, label: '২০১৭' },
  { value: 2016, label: '২০১৬' },
  { value: 2015, label: '২০১৫' },
]

export const BOARD_OPTIONS = [
  { value: 'all', label: 'সকল বোর্ড' },
  { value: 'dhaka', label: 'ঢাকা বোর্ড' },
  { value: 'comilla', label: 'কুমিল্লা বোর্ড' },
  { value: 'rajshahi', label: 'রাজশাহী বোর্ড' },
  { value: 'jessore', label: 'যশোর বোর্ড' },
  { value: 'chittagong', label: 'চট্টগ্রাম বোর্ড' },
  { value: 'barishal', label: 'বরিশাল বোর্ড' },
  { value: 'sylhet', label: 'সিলেট বোর্ড' },
  { value: 'dinajpur', label: 'দিনাজপুর বোর্ড' },
  { value: 'mymensingh', label: 'ময়মনসিংহ বোর্ড' },
]

export const BOARD_SUBJECT_OPTIONS = {
  SSC: [
    { value: 'general_math', label: 'সাধারণ গণিত' },
    { value: 'higher_math', label: 'উচ্চতর গণিত' },
    { value: 'physics', label: 'পদার্থবিজ্ঞান' },
    { value: 'chemistry', label: 'রসায়ন' },
    { value: 'biology', label: 'জীববিজ্ঞান' },
    { value: 'bangla', label: 'বাংলা' },
    { value: 'english', label: 'ইংরেজি' },
    { value: 'ict', label: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
    { value: 'accounting', label: 'হিসাববিজ্ঞান' },
    { value: 'bgs', label: 'বাংলাদেশ ও বিশ্বপরিচয়' },
  ],
  HSC: [
    { value: 'h_physics', label: 'পদার্থবিজ্ঞান' },
    { value: 'h_chemistry', label: 'রসায়ন' },
    { value: 'h_math', label: 'উচ্চতর গণিত' },
    { value: 'h_biology', label: 'জীববিজ্ঞান' },
    { value: 'h_bangla', label: 'বাংলা' },
    { value: 'h_english', label: 'ইংরেজি' },
    { value: 'h_ict', label: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
    { value: 'h_accounting', label: 'হিসাববিজ্ঞান' },
  ],
}