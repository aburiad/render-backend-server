/**
 * Vault Question → PaperEditor question format converter
 *
 * Transforms vault_questions rows (from /api/vault) into the shape
 * that PaperEditor / paperStore expects.
 */

/**
 * Convert a vault question to PaperEditor format.
 * @param {Object} vq - Vault question from API
 * @returns {Object} PaperEditor-compatible question
 */
export function vaultToPaperQuestion(vq) {
  const id = crypto.randomUUID()

  if (vq.type === 'MCQ') {
    const d = vq
    return {
      id,
      type: 'MCQ',
      section: '',
      question: d.question || '',
      option_a: d.options?.ক || '',
      option_b: d.options?.খ || '',
      option_c: d.options?.গ || '',
      option_d: d.options?.ঘ || '',
      correct_answer: d.answer
        ? { ক: 'a', খ: 'b', গ: 'c', ঘ: 'd' }[d.answer] || null
        : null,
      marks: d.marks || 1,
      source: 'vault',
      vaultId: vq.id,
    }
  }

  if (vq.type === 'CQ') {
    const d = vq
    const parts = d.parts || {}
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
      stimulus: d.stimulus || '',
      sub_questions: subQuestions,
      marks: d.totalMarks || 10,
      source: 'vault',
      vaultId: vq.id,
    }
  }

  if (vq.type === 'short') {
    const d = vq
    return {
      id,
      type: 'short',
      section: '',
      question: d.question || '',
      marks: d.marks || 2,
      source: 'vault',
      vaultId: vq.id,
    }
  }

  // Fallback generic
  return {
    id,
    type: 'short',
    section: '',
    question: vq.question || '',
    marks: vq.marks || 1,
    source: 'vault',
    vaultId: vq.id,
  }
}

/**
 * Batch convert vault questions.
 * @param {Array} vaultQuestions
 * @returns {Array} PaperEditor questions
 */
export function vaultToPaperQuestions(vaultQuestions) {
  return (vaultQuestions || []).map(vaultToPaperQuestion)
}

/**
 * Vault chapter index (static) — maps class → subject → chapters
 * Used for dropdown population without API call.
 */
export const VAULT_INDEX = {
  6: {
    math: [
      { id: 'ch-1', titleBn: 'স্বাভাবিক সংখ্যা ও ভগ্নাংশ', titleEn: 'Natural Numbers & Fractions' },
      { id: 'ch-2', titleBn: 'অনুপাত ও শতকরা', titleEn: 'Ratio & Percentage' },
      { id: 'ch-3', titleBn: 'পূর্ণসংখ্যা', titleEn: 'Integers' },
      { id: 'ch-4', titleBn: 'বীজগণিতীয় রাশি', titleEn: 'Algebraic Expressions' },
      { id: 'ch-5', titleBn: 'সরল সমীকরণ', titleEn: 'Simple Equations' },
      { id: 'ch-6', titleBn: 'জ্যামিতির মৌলিক ধারণা', titleEn: 'Basic Geometry' },
      { id: 'ch-7', titleBn: 'ব্যবহারিক জ্যামিতি', titleEn: 'Practical Geometry' },
      { id: 'ch-8', titleBn: 'তথ্য ও উপাত্ত', titleEn: 'Data & Statistics' },
    ],
  },
  7: {
    math: [
      { id: 'ch-1', titleBn: 'মূলদ ও অমূলদ সংখ্যা', titleEn: 'Rational & Irrational Numbers' },
      { id: 'ch-2', titleBn: 'সমানুপাত ও লাভ-ক্ষতি', titleEn: 'Proportion & Profit-Loss' },
      { id: 'ch-3', titleBn: 'পরিমাপ', titleEn: 'Measurement' },
      { id: 'ch-4', titleBn: 'বীজগণিতীয় রাশির গুণ ও ভাগ', titleEn: 'Multiplication & Division of Algebraic Expressions' },
      { id: 'ch-5', titleBn: 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ', titleEn: 'Algebraic Formulas & Applications' },
      { id: 'ch-6', titleBn: 'বীজগণিতীয় ভগ্নাংশ', titleEn: 'Algebraic Fractions' },
      { id: 'ch-7', titleBn: 'সরল সমীকরণ', titleEn: 'Simple Equations' },
      { id: 'ch-8', titleBn: 'সমান্তরাল সরলরেখা', titleEn: 'Parallel Straight Lines' },
      { id: 'ch-9', titleBn: 'ত্রিভুজ', titleEn: 'Triangle' },
      { id: 'ch-10', titleBn: 'সর্বসমতা ও সদৃশতা', titleEn: 'Congruence & Similarity' },
      { id: 'ch-11', titleBn: 'তথ্য ও উপাত্ত', titleEn: 'Data & Statistics' },
    ],
  },
  8: {
    math: [
      { id: 'ch-1', titleBn: 'প্যাটার্ন', titleEn: 'Pattern' },
      { id: 'ch-2', titleBn: 'মুনাফা', titleEn: 'Profit (Interest)' },
      { id: 'ch-3', titleBn: 'পরিমাপ', titleEn: 'Measurement' },
      { id: 'ch-4', titleBn: 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ', titleEn: 'Algebraic Formulas & Application' },
      { id: 'ch-5', titleBn: 'বীজগণিতীয় ভগ্নাংশ', titleEn: 'Algebraic Fractions' },
      { id: 'ch-6', titleBn: 'সরল সহসমীকরণ', titleEn: 'Simple Simultaneous Equations' },
      { id: 'ch-7', titleBn: 'সেট', titleEn: 'Sets' },
      { id: 'ch-8', titleBn: 'চতুর্ভুজ', titleEn: 'Quadrilaterals' },
      { id: 'ch-9', titleBn: 'পিথাগোরাসের উপপাদ্য', titleEn: 'Pythagoras Theorem' },
      { id: 'ch-10', titleBn: 'বৃত্ত', titleEn: 'Circle' },
      { id: 'ch-11', titleBn: 'তথ্য ও উপাত্ত', titleEn: 'Data & Statistics' },
    ],
  },
  9: {
    math: [
      { id: 'ch-1', titleBn: '১. বাস্তব সংখ্যা', titleEn: 'Real Numbers' },
      { id: 'ch-2', titleBn: '২. সেট ও ফাংশন', titleEn: 'Sets and Functions' },
      { id: 'ch-3', titleBn: '৩. বীজগাণিতিক রাশি', titleEn: 'Algebraic Expressions' },
      { id: 'ch-4', titleBn: '৪. সূচক ও লগারিদম', titleEn: 'Exponents and Logarithms' },
      { id: 'ch-5', titleBn: '৫. এক চলকবিশিষ্ট সমীকরণ', titleEn: 'Single Variable Equations' },
      { id: 'ch-6', titleBn: '৬. রেখা, কোণ ও ত্রিভুজ', titleEn: 'Lines, Angles & Triangles' },
      { id: 'ch-7', titleBn: '৭. ব্যবহারিক জ্যামিতি', titleEn: 'Practical Geometry' },
      { id: 'ch-8', titleBn: '৮. বৃত্ত', titleEn: 'Circle' },
      { id: 'ch-9', titleBn: '৯. ত্রিকোণমিতিক অনুপাত', titleEn: 'Trigonometric Ratios' },
      { id: 'ch-10', titleBn: '১০. দূরত্ব ও উচ্চতা', titleEn: 'Distance & Heights' },
      { id: 'ch-11', titleBn: '১১. বীজগাণিতিক অনুপাত ও সমানুপাত', titleEn: 'Algebraic Ratio & Proportion' },
      { id: 'ch-12', titleBn: '১২. দুই চলকবিশিষ্ট সরল সহসমীকরণ', titleEn: 'Two-Variable Simultaneous Equations' },
      { id: 'ch-13', titleBn: '১৩. সসীম ধারা', titleEn: 'Finite Series' },
      { id: 'ch-14', titleBn: '১৪. অনুপাত, সদৃশতা ও প্রতিসমতা', titleEn: 'Ratio, Similarity & Symmetry' },
      { id: 'ch-15', titleBn: '১৫. ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য', titleEn: 'Area Theorems & Constructions' },
      { id: 'ch-16', titleBn: '১৬. পরিমিতি', titleEn: 'Mensuration' },
      { id: 'ch-17', titleBn: '১৭. পরিসংখ্যান', titleEn: 'Statistics' },
    ],
  },
}

export const VAULT_CLASSES = [6, 7, 8, 9, 10]
export const VAULT_SUBJECTS = { 6: ['math'], 7: ['math'], 8: ['math'], 9: ['math'], 10: ['math'] }
export const VAULT_TYPES = [
  { value: 'mcq', label: 'MCQ', icon: '☑️' },
  { value: 'cq', label: 'সৃজনশীল (CQ)', icon: '✍️' },
  { value: 'saq', label: 'সংক্ষিপ্ত', icon: '📝' },
]