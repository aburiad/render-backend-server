/**
 * Question structural validator.
 *
 * The Magic Scan workflow has a strong contract: the teacher tells us the
 * question type BEFORE the AI sees the image. We exploit that contract to
 * sanity-check the AI's output. If the AI returns an MCQ-shaped object but
 * the teacher said CQ — or returns a CQ with no sub-questions — we know
 * something is wrong, retry once with explicit feedback, then throw 422
 * (which refunds credit via withChargedCredit).
 *
 * Two error tiers:
 *
 *   HARD errors  → the result is unusable. Retry once with feedback prompt;
 *                  if still hard-failing, throw and refund.
 *   SOFT warnings → result is usable but worth highlighting in the review UI
 *                  (e.g. option (ঘ) marked [unclear], correct_answer missing).
 *
 * The validator is permissive by design — only the truly broken cases are
 * HARD. Otherwise we'd false-reject legitimate variations (e.g. some math
 * MCQs have only 3 options, some CQs have only ক/খ visible after a tight
 * crop). The teacher will see and fix soft warnings in the review UI.
 */

const UNCLEAR_RE = /\[unclear\]|\[\?\]/i

function isNonEmptyString(v, minLen = 1) {
  return typeof v === 'string' && v.trim().length >= minLen
}

function hasUnclear(v) {
  return typeof v === 'string' && UNCLEAR_RE.test(v)
}

// ─── Per-type validators ─────────────────────────────────────────────────

function validateMCQ(q) {
  const hard = []
  const soft = []

  if (!isNonEmptyString(q.question, 3)) hard.push('mcq_question_missing')

  // 3 OR 4 options are both legitimate — math/English MCQs often have 3.
  // Hard-fail only on fewer than 3 (clearly incomplete crop or bad OCR).
  const opts = [q.option_a, q.option_b, q.option_c, q.option_d]
  const present = opts.filter(o => isNonEmptyString(o, 1)).length
  if (present < 3) hard.push(`mcq_only_${present}_options_visible`)

  opts.forEach((o, i) => {
    if (hasUnclear(o)) soft.push(`mcq_option_${String.fromCharCode(97 + i)}_unclear`)
  })
  if (hasUnclear(q.question)) soft.push('mcq_question_has_unclear')

  if (q.correct_answer == null) soft.push('mcq_correct_answer_missing')

  return { hard, soft }
}

function validateCQ(q) {
  const hard = []
  const soft = []

  if (!isNonEmptyString(q.stimulus, 5)) hard.push('cq_stimulus_missing')

  // 3 OR 4 sub-questions are both legitimate — math/English CQs often have
  // only ক/খ/গ (no ঘ). Hard-fail only on fewer than 3.
  const subs = Array.isArray(q.sub_questions) ? q.sub_questions : []
  if (subs.length < 3) hard.push(`cq_only_${subs.length}_sub_questions`)

  subs.forEach((s, i) => {
    if (!isNonEmptyString(s?.text, 2)) hard.push(`cq_sub_${i}_text_missing`)
    if (hasUnclear(s?.text)) soft.push(`cq_sub_${i}_unclear`)
  })

  if (hasUnclear(q.stimulus)) soft.push('cq_stimulus_unclear')
  return { hard, soft }
}

function validateShort(q) {
  const hard = []
  const soft = []
  if (!isNonEmptyString(q.question, 3)) hard.push('short_question_missing')
  if (hasUnclear(q.question)) soft.push('short_question_unclear')
  return { hard, soft }
}

function validateBroad(q) {
  const hard = []
  const soft = []
  if (!isNonEmptyString(q.question, 5)) hard.push('broad_question_missing')
  if (hasUnclear(q.question)) soft.push('broad_question_unclear')
  return { hard, soft }
}

function validateFillBlank(q) {
  const hard = []
  const soft = []
  if (!isNonEmptyString(q.sentence, 3)) hard.push('fill_blank_sentence_missing')
  // Either ___ or [unclear] is fine — but ZERO blank markers means it's not
  // really a fill-blank.
  if (isNonEmptyString(q.sentence) && !q.sentence.includes('___') && !UNCLEAR_RE.test(q.sentence)) {
    hard.push('fill_blank_no_blank_marker')
  }
  return { hard, soft }
}

function validateMatching(q) {
  const hard = []
  const soft = []
  const a = Array.isArray(q.column_a) ? q.column_a : []
  const b = Array.isArray(q.column_b) ? q.column_b : []
  if (a.length < 2) hard.push('matching_column_a_too_short')
  if (b.length < 2) hard.push('matching_column_b_too_short')
  // Allow ±1 length difference — sometimes column_b has a label or distractor.
  if (Math.abs(a.length - b.length) > 1) soft.push('matching_column_length_mismatch')
  return { hard, soft }
}

function validateTrueFalse(q) {
  const hard = []
  const soft = []
  const stmts = Array.isArray(q.statements) ? q.statements : []
  if (stmts.length === 0) hard.push('true_false_no_statements')
  return { hard, soft }
}

function validatePassage(q) {
  const hard = []
  const soft = []
  if (!isNonEmptyString(q.passage, 10)) hard.push('passage_text_missing')
  const qs = Array.isArray(q.questions) ? q.questions : Array.isArray(q.sub_questions) ? q.sub_questions : []
  if (qs.length === 0) hard.push('passage_no_sub_questions')
  return { hard, soft }
}

// Primary types use `parent_passage` shape — same fields as passage.
function validateParentPassage(q) {
  const hard = []
  const soft = []
  if (!isNonEmptyString(q.passage_body, 5)) hard.push('parent_passage_body_missing')
  const subs = Array.isArray(q.sub_questions) ? q.sub_questions : []
  if (subs.length === 0) hard.push('parent_passage_no_sub_questions')
  return { hard, soft }
}

const VALIDATORS_BY_TYPE = {
  mcq: validateMCQ,
  acc_mcq: validateMCQ,
  primary_mcq_grid: validateMCQ,

  cq: validateCQ,

  short: validateShort,
  primary_plain_text: validateShort,

  broad: validateBroad,
  creative: validateBroad,
  essay: validateBroad,
  paragraph: validateBroad,
  dialogue: validateBroad,
  letter_app: validateBroad,
  translation: validateBroad,

  fill_blank: validateFillBlank,
  matching: validateMatching,
  true_false: validateTrueFalse,
  passage: validatePassage,
  summary: validatePassage,

  primary_passage: validateParentPassage,
  primary_cq: validateParentPassage,
  primary_science_cq: validateParentPassage,
}

// Expected schema "type" field per user-selected questionType. If the model
// returns an object whose `type` field disagrees, that's a hard signal the
// model misread what we asked for.
const EXPECTED_TYPE_FIELD = {
  mcq: 'MCQ',
  acc_mcq: 'MCQ',
  primary_mcq_grid: 'MCQ',
  cq: 'CQ',
  short: 'short',
  primary_plain_text: 'standard_text',
  broad: 'broad',
  creative: 'broad',
  essay: 'essay',
  paragraph: 'paragraph',
  dialogue: 'dialogue',
  letter_app: 'letter_app',
  translation: 'translation',
  fill_blank: 'fill_blank',
  matching: 'matching',
  true_false: 'true_false',
  passage: 'passage',
  summary: 'summary',
  primary_passage: 'parent_passage',
  primary_cq: 'parent_passage',
  primary_science_cq: 'parent_passage',
  math: 'math',
  arabic: 'arabic',
  hadith: 'hadith',
  fiqh: 'fiqh',
  grammar: 'grammar',
  poem: 'poem',
  rearrange: 'rearrange',
  graph_chart: 'graph_chart',
}

/**
 * Validate a single extracted question against the user-selected type.
 *
 * @param {Object} question — the parsed JSON object from the model
 * @param {string} expectedType — the questionType key the user picked
 * @returns {{ hard: string[], soft: string[] }}
 */
function validateQuestion(question, expectedType) {
  if (!question || typeof question !== 'object') {
    return { hard: ['result_not_object'], soft: [] }
  }

  // Type-mismatch check: the user told us what they cropped. If the model
  // returned a different shape, this is a hard error — retry with feedback.
  const expectedTypeField = EXPECTED_TYPE_FIELD[expectedType]
  if (expectedTypeField && question.type && question.type !== expectedTypeField) {
    return {
      hard: [`type_mismatch_expected_${expectedTypeField}_got_${question.type}`],
      soft: [],
    }
  }

  const fn = VALIDATORS_BY_TYPE[expectedType]
  if (!fn) {
    // Unknown / unmapped type — accept silently. Better than over-restricting
    // on types we haven't profiled (accounting tables vary too much to lock).
    return { hard: [], soft: [] }
  }
  return fn(question)
}

/**
 * Build a Bangla-friendly feedback prompt the model will see on retry.
 * The wording stays in English because the prompts are English; only the
 * outward-facing error to the teacher (in aiService) is in Bangla.
 */
function buildFeedbackPrompt(hardErrors, expectedType) {
  const errSet = new Set(hardErrors)
  const lines = ['Your previous extraction had structural problems:']

  for (const e of hardErrors) {
    if (e.startsWith('mcq_only_') && e.endsWith('_options_visible')) {
      const n = e.match(/(\d+)/)?.[1] || '?'
      lines.push(`- You returned only ${n} options. An MCQ should have at least 3 options (most have 4: option_a/b/c/d, but math/English MCQs may legitimately have only 3). Look again — options may continue below or to the right of what you first noticed.`)
    } else if (e === 'mcq_question_missing') {
      lines.push('- The MCQ question text was missing. Extract the question stem from the top.')
    } else if (e === 'cq_stimulus_missing') {
      lines.push('- The CQ stimulus (উদ্দীপক) was missing. It is the paragraph at the top.')
    } else if (e.startsWith('cq_only_')) {
      lines.push('- A CQ should have at least 3 sub-questions (ক, খ, গ — some math/English CQs have only 3, most Bangla/social CQs have 4 including ঘ). Look again, sub-question text may span multiple lines.')
    } else if (e.startsWith('cq_sub_') && e.endsWith('_text_missing')) {
      lines.push('- One of the CQ sub-questions had empty text. Look at ক/খ/গ/ঘ again.')
    } else if (e.startsWith('type_mismatch_')) {
      const m = e.match(/type_mismatch_expected_(\w+)_got_(\w+)/)
      lines.push(`- The user said this image is a "${m?.[1]}" but you returned "${m?.[2]}". Re-extract using the ${m?.[1]} format only.`)
    } else if (e === 'fill_blank_no_blank_marker') {
      lines.push('- The fill-in-the-blank sentence had no ___ marker. Replace the blank space in the original sentence with ___.')
    } else if (e === 'matching_column_a_too_short' || e === 'matching_column_b_too_short') {
      lines.push('- The matching question needs at least 2 items in each column. Extract all visible items.')
    } else {
      lines.push(`- ${e}`)
    }
  }

  return lines.join('\n')
}

/**
 * Convert a hard-error array into a Bangla user-facing message for the 422
 * response, so the teacher knows specifically why we couldn't extract.
 */
function bnMessageForHardErrors(hardErrors, expectedType) {
  const errSet = new Set(hardErrors)

  if ([...errSet].some(e => e.startsWith('mcq_only_'))) {
    const e = [...errSet].find(x => x.startsWith('mcq_only_'))
    const n = e.match(/(\d+)/)?.[1] || '?'
    return `এই MCQ এ শুধু ${n}টি option পেলাম — অন্তত ৩টি option দরকার (সাধারণত ৪টি)। সব option visible রেখে আবার crop করুন।`
  }
  if (errSet.has('mcq_question_missing')) {
    return 'MCQ এর প্রশ্ন অংশ খুঁজে পেলাম না — উপরে question stem visible রেখে আবার crop করুন।'
  }
  if (errSet.has('cq_stimulus_missing')) {
    return 'CQ এর উদ্দীপক খুঁজে পেলাম না — উদ্দীপকের paragraph সহ crop করুন।'
  }
  if ([...errSet].some(e => e.startsWith('cq_only_'))) {
    const e = [...errSet].find(x => x.startsWith('cq_only_'))
    const n = e.match(/(\d+)/)?.[1] || '?'
    return `CQ এ শুধু ${n}টি sub-question পেলাম — অন্তত ৩টি (ক/খ/গ) দরকার। সব sub-question সহ আবার crop করুন।`
  }
  if ([...errSet].some(e => e.startsWith('type_mismatch_'))) {
    const e = [...errSet].find(x => x.startsWith('type_mismatch_'))
    const m = e.match(/type_mismatch_expected_(\w+)_got_(\w+)/)
    return `আপনি ${expectedType} select করেছেন কিন্তু ছবিটি ${m?.[2] || 'অন্য'} ধরনের প্রশ্ন বলে মনে হচ্ছে — সঠিক question type select করুন অথবা আবার crop করুন।`
  }
  return 'ছবি থেকে সম্পূর্ণ প্রশ্ন বের করতে পারলাম না — দয়া করে আরও স্পষ্ট ভাবে crop করুন।'
}

module.exports = {
  validateQuestion,
  buildFeedbackPrompt,
  bnMessageForHardErrors,
}
