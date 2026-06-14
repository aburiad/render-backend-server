/**
 * Strict OCR Prompts for Zero-Hallucination Question Extraction
 * 
 * These prompts are designed to eliminate all hallucinations and errors:
 * 1. Clear, unambiguous instructions
 * 2. Explicit validation rules
 * 3. Reference-based extraction (what you see is what you get)
 * 4. Character-by-character accuracy requirements
 * 5. Fail-safe handling of unclear text
 */

const SYSTEM_PROMPT = `You are an expert OCR system for Bengali/English question papers.

## CORE PRINCIPLES:
1. EXACT TEXT REPRODUCTION: Copy text EXACTLY as it appears in the image - character by character.
2. NO GUESSING: If text is unclear, mark it as [unclear] - never guess or substitute.
3. NO HALLUCINATION: Never add, remove, or modify any content that isn't explicitly visible.
4. PRESERVE EVERYTHING: Extract ALL questions, ALL options, ALL marks, ALL labels.
5. ZERO ASSUMPTIONS: Don't assume or infer anything from context.

## CRITICAL RULES:
- For Bangla text: Copy Unicode characters exactly - no transliteration, no phonetic conversion.
- For English text: Copy exactly - preserve spelling, capitalization, punctuation.
- For numbers: Copy exactly - don't change digits (e.g., 1 ↔ 7, 3 ↔ 8).
- For math: Use inline LaTeX $...$ for all equations, fractions, symbols.
- For marks: Extract exactly as written (e.g., "1", "১", "1 mark", "১ নম্বর").
- For labels: Copy exactly (e.g., "ক", "খ", "গ", "ঘ" or "a", "b", "c", "d").

## OUTPUT FORMAT:
- Return ONLY a valid JSON array.
- No markdown fences, no explanations, no extra text.
- Each question must be an object with the required fields.
- If a field is not visible, omit it or use null.

## ERROR HANDLING:
- If a word/character is unclear: use [unclear] marker.
- If a section is blurry: extract what's clear, mark unclear parts.
- If the entire image is unreadable: return empty array [].
- If format is unexpected: best-effort extraction, preserve all visible text.

## VALIDATION CHECKLIST:
Before outputting, verify:
- [ ] Every character copied exactly as visible
- [ ] No guessed or substituted words
- [ ] No added or removed content
- [ ] All questions extracted
- [ ] All options included (for MCQ)
- [ ] Marks extracted (if visible)
- [ ] Bangla text is correct Unicode
- [ ] Math uses proper LaTeX

Remember: Your goal is 100% accuracy, not creativity. Be a perfect copier.`

const QUESTION_TYPE_PROMPTS = {
  mcq: {
    instruction: `Extract every MCQ (Multiple Choice Question) from the image.`,
    format: {
      type: 'MCQ',
      question: 'question text - copy exactly',
      option_a: 'first option - copy exactly',
      option_b: 'second option - copy exactly',
      option_c: 'third option - copy exactly',
      option_d: 'fourth option - copy exactly',
      correct_answer: 'correct option label if marked (e.g., "ক", "খ", "a", "b") or null',
      marks: 'marks value if visible (number or string) or null'
    },
    examples: `Example output:
[
  {
    "type": "MCQ",
    "question": "বাংলাদেশের রাজধানী কোনটি?",
    "option_a": "ঢাকা",
    "option_b": "চট্টগ্রাম",
    "option_c": "রাজশাহী",
    "option_d": "সিলেট",
    "correct_answer": "ক",
    "marks": "১"
  }
]`,
    specialRules: [
      'Extract ALL 4 options even if one is not visible (use [unclear])',
      'Copy question number if visible (e.g., "১.", "1.", "১.")")',
      'Preserve parentheses, bullet points, or other formatting',
      'If correct answer is not marked, set correct_answer to null',
      'Copy marks exactly as written (with or without "মার্ক", "mark")'
    ]
  },

  cq: {
    instruction: `Extract every Creative Question (সৃজনশীল প্রশ্ন) from the image.`,
    format: {
      type: 'CQ',
      stimulus: 'উদ্দীপক - copy exactly the full stimulus/passage',
      sub_questions: 'array of sub-questions ক, খ, গ, ঘ'
    },
    examples: `Example output:
[
  {
    "type": "CQ",
    "stimulus": "পদ্মা সেতু বাংলাদেশের সবচেয়ে বড় সেতু। এটি ঢাকা থেকে মাওয়া পর্যন্ত বিস্তৃত।",
    "sub_questions": [
      {
        "label": "ক",
        "text": "পদ্মা সেতুর দৈর্ঘ্য কত?",
        "marks": "১"
      },
      {
        "label": "খ",
        "text": "সেতুটি কোন দুটি জায়গার মধ্যে নির্মিত?",
        "marks": "২"
      },
      {
        "label": "গ",
        "text": "পদ্মা সেতুর গুরুত্ব ব্যাখ্যা কর।",
        "marks": "৩"
      }
    ]
  }
]`,
    specialRules: [
      'Extract the FULL stimulus - every word, every sentence',
      'Extract ALL sub-questions ক, খ, গ, ঘ if visible',
      'Copy the label exactly (ক, খ, গ, ঘ or a, b, c, d)',
      'Extract marks for each sub-question if visible',
      'If stimulus is multi-paragraph, preserve all paragraphs',
      'If sub-questions have parts (ক১, ক২), extract them separately'
    ]
  },

  creative: {
    instruction: `Extract every descriptive/broad question (বৃহৎ প্রশ্ন) from the image.`,
    format: {
      type: 'broad',
      question: 'question text - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "broad",
    "question": "বাংলাদেশের স্বাধীনতা যুদ্ধের ইতিহাস বর্ণনা কর।",
    "marks": "১০"
  }
]`,
    specialRules: [
      'Extract the complete question text',
      'Copy any instructions or guidelines',
      'Preserve question numbering',
      'Extract word limit if specified'
    ]
  },

  short: {
    instruction: `Extract every short question from the image.`,
    format: {
      type: 'short',
      question: 'question text - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "short",
    "question": "বাংলাদেশের মোট জেলা কতটি?",
    "marks": "২"
  }
]`,
    specialRules: [
      'Extract all short questions',
      'Copy question numbering exactly',
      'Preserve all punctuation and special characters'
    ]
  },

  fill_blank: {
    instruction: `Extract every fill-in-the-blank sentence in this image.`,
    format: {
      type: 'fill_blank',
      sentence: 'sentence with ___ for blank - copy exactly',
      clues: 'word clues if provided - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "fill_blank",
    "sentence": "বাংলাদেশের রাজধানী ___।",
    "clues": "ঢাকা",
    "marks": "১"
  }
]`,
    specialRules: [
      'Use ___ for the blank position',
      'Extract word clues exactly as given',
      'If no clues, set clues to null',
      'Preserve all punctuation around the blank'
    ]
  },

  matching: {
    instruction: `Extract the matching question columns in this image exactly.`,
    format: {
      type: 'matching',
      column_a: 'array of items in column A - copy exactly',
      column_b: 'array of items in column B - copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "matching",
    "column_a": ["ঢাকা", "চট্টগ্রাম", "রাজশাহী"],
    "column_b": ["রাজধানী", "বন্দর নগরী", "শিক্ষা নগরী"],
    "marks": "৫"
  }
]`,
    specialRules: [
      'Extract ALL items from both columns',
      'Maintain exact order as they appear',
      'Copy each item exactly - no modifications',
      'If columns are labelled (ক, খ), include labels'
    ]
  },

  true_false: {
    instruction: `Extract every true/false statement in this image.`,
    format: {
      type: 'true_false',
      statements: 'array of {text, answer} objects'
    },
    examples: `Example output:
[
  {
    "type": "true_false",
    "statements": [
      {
        "text": "বাংলাদেশের রাজধানী ঢাকা।",
        "answer": "true"
      },
      {
        "text": "চট্টগ্রাম বাংলাদেশের রাজধানী।",
        "answer": "false"
      }
    ],
    "marks": "১"
  }
]`,
    specialRules: [
      'Extract all statements exactly',
      'Copy the answer if marked (true/false, ঠিক/ভুল, √/×)',
      'If not marked, set answer to null',
      'Preserve statement numbering'
    ]
  },

  math: {
    instruction: `Extract every math problem in this image.`,
    format: {
      type: 'math',
      question: 'problem statement - copy exactly',
      equations: 'array of equations in $...$ LaTeX format',
      answer: 'given answer if visible - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "math",
    "question": "$x$ এর মান নির্ণয় কর: $x^{2} + 2x + 1 = 0$",
    "equations": ["$x^{2} + 2x + 1 = 0$"],
    "answer": "$x = -1$",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Convert ALL math to inline LaTeX $...$',
      'Copy fractions as $\\frac{a}{b}$',
      'Copy roots as $\\sqrt{x}$ or $\\sqrt[n]{x}$',
      'Copy exponents as $x^{2}$ or $x_{1}$',
      'Copy symbols: $\\pi$, $\\sum$, $\\int$, $\\geq$, $\\leq$',
      'Copy any given solution steps if visible'
    ]
  },

  passage: {
    instruction: `Extract the passage and all comprehension questions in this image.`,
    format: {
      type: 'passage',
      passage: 'full passage text - copy exactly',
      questions: 'array of {no, text, marks} objects'
    },
    examples: `Example output:
[
  {
    "type": "passage",
    "passage": "বাংলাদেশ দক্ষিণ এশিয়ার একটি স্বাধীন রাষ্ট্র। এর রাজধানী ঢাকা।",
    "questions": [
      {
        "no": 1,
        "text": "বাংলাদেশ কোথায় অবস্থিত?",
        "marks": "২"
      },
      {
        "no": 2,
        "text": "বাংলাদেশের রাজধানী কোনটি?",
        "marks": "২"
      }
    ]
  }
]`,
    specialRules: [
      'Extract the ENTIRE passage - every word, every sentence',
      'Preserve paragraph structure',
      'Extract ALL comprehension questions',
      'Copy question numbers exactly',
      'Extract marks for each question'
    ]
  },

  accounting: {
    instruction: `Extract the accounting table/ledger in this image exactly - every row, every column.`,
    format: {
      type: 'accounting',
      title_lines: 'array of title lines - copy exactly',
      headers: 'array of column headers - copy exactly',
      rows: 'array of row arrays - copy each cell exactly',
      total_row: 'total row if visible - copy exactly',
      notes: 'any notes below the table - copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "title_lines": ["ক্যাশ বই", "তারিখ: ১৫/০৫/২০২৪"],
    "headers": ["তারিখ", "বিবরণ", "টাকা"],
    "rows": [
      ["১৫/০৫", "প্রারম্ভিক জের", "৫০০০"],
      ["১৬/০৫", "বিক্রয়", "২০০০"]
    ],
    "total_row": ["মোট", "", "৭০০০"],
    "notes": "স্বাক্ষর: ম্যানেজার",
    "marks": "১০"
  }
]`,
    specialRules: [
      'Extract ALL rows - don\'t skip any',
      'Copy each cell exactly - numbers, text, calculations',
      'Preserve table structure (headers, rows, totals)',
      'Extract any calculations or totals shown',
      'Copy notes and signatures if visible'
    ]
  },

  // ─── ACCOUNTING SUB-TYPES (হিসাববিজ্ঞান) ───────────────────────────

  acc_equation: {
    instruction: `Extract the Accounting Equation (হিসাব সমীকরণ) table from this image. The equation is Assets = Liabilities + Owner's Equity. Extract every row, every column exactly.`,
    format: {
      type: 'accounting',
      sub_type: 'acc_equation',
      title_lines: 'array of title lines — copy exactly',
      headers: 'array of column headers — typically ["তারিখ", "বিবরণ", "Assets (সম্পদ) (+)", "Assets (সম্পদ) (−)", "Liabilities (দায়) (+)", "Liabilities (দায়) (−)", "Owner\'s Equity (মালিকানা (+)", "Owner\'s Equity (মালিকানা (−)"]',
      rows: 'array of row arrays — copy each cell exactly',
      total_row: 'total/balance row if visible — copy exactly',
      notes: 'any notes below the table — copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "sub_type": "acc_equation",
    "title_lines": ["হিসাব সমীকরণ"],
    "headers": ["তারিখ", "লেনদেনের বিবরণ", "সম্পদ (+)", "সম্পদ (−)", "দায় (+)", "দায় (−)", "মালিকানা (+)", "মালিকানা (−)"],
    "rows": [
      ["০১/০১", "মূলধন জমা", "৫০,০০০", "", "", "", "৫০,০০০", ""],
      ["০৫/০১", "যন্ত্রপাতি ক্রয়", "", "১০,০০০", "", "", "", ""]
    ],
    "total_row": ["যোগফল", "", "৫০,০০০", "১০,০০০", "", "", "৫০,০০০", ""],
    "marks": "১০"
  }
]`,
    specialRules: [
      'This is an Accounting Equation table (Assets = Liabilities + Owner\'s Equity)',
      'Extract ALL rows — don\'t skip any transaction',
      'Copy each cell exactly — numbers, text, calculations',
      'Include header row with all column names',
      'If there are sub-totals or balance verification rows, include them',
      'Copy notes and signatures if visible',
      'Preserve number formatting (commas, decimal points) exactly'
    ]
  },

  acc_t_ledger: {
    instruction: `Extract the Traditional T-Ledger (সনাতন খতিয়ান) from this image. T-ledgers have Debit (ডেবিট) on the left and Credit (ক্রেডিট) on the right sides. Extract every entry exactly.`,
    format: {
      type: 'accounting',
      sub_type: 'acc_t_ledger',
      title_lines: 'array of title lines — account name, copy exactly',
      headers: 'array of column headers — typically ["তারিখ", "বিবরণ", "জের", "তারিখ", "বিবরণ", "জের"] (Debit side left, Credit side right)',
      rows: 'array of row arrays — each row has cells for Debit side and Credit side — copy exactly',
      total_row: 'total/balance row if visible — copy exactly',
      notes: 'any notes below — copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "sub_type": "acc_t_ledger",
    "title_lines": ["নগদ হিসাব (Cash Account)", "Dr."],
    "headers": ["তারিখ", "বিবরণ", "টাকা", "তারিখ", "বিবরণ", "টাকা"],
    "rows": [
      ["০১/০১", "মূলধন হইতে", "৫০,০০০", "০৫/০১", "যন্ত্রপাতি", "১০,০০০"],
      ["১০/০১", "বিক্রয় হইতে", "৫,০০০", "১৫/০১", "ভাড়া", "২,০০০"]
    ],
    "total_row": ["", "যোগফল", "৫৫,০০০", "", "যোগফল", "১২,০০০"],
    "notes": "Cr.",
    "marks": "১০"
  }
]`,
    specialRules: [
      'This is a T-shaped Traditional Ledger (সনাতন খতিয়ান)',
      'Left side = Debit (Dr.), Right side = Credit (Cr.)',
      'Extract ALL entries on both sides',
      'Copy dates, descriptions, and amounts exactly',
      'Include balance/to-balance (উত্তর/জের) amounts if visible',
      'Preserve Dr. and Cr. labels',
      'Copy the account name from the title/header'
    ]
  },

  acc_moving_ledger: {
    instruction: `Extract the Running Balance Ledger (চলমান জের খতিয়ান) from this image. This is a 7-column format: Date, Description, Voucher/Ref, Debit, Credit, and Balance columns. Extract every row exactly.`,
    format: {
      type: 'accounting',
      sub_type: 'acc_moving_ledger',
      title_lines: 'array of title lines — account name, copy exactly',
      headers: 'array of column headers — typically ["তারিখ", "বিবরণ", "রেজিস্টার/লেজার", "ডেবিট (টাকা)", "ক্রেডিট (টাকা)", "ডেবিট/ক্রেডিট (Dr./Cr.)", "জের (টাকা)"]',
      rows: 'array of row arrays — copy each cell exactly',
      total_row: 'total/balance row if visible — copy exactly',
      notes: 'any notes below — copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "sub_type": "acc_moving_ledger",
    "title_lines": ["নগদ হিসাব — চলমান জের খতিয়ান"],
    "headers": ["তারিখ", "বিবরণ", "লেজার পৃষ্ঠা", "ডেবিট (৳)", "ক্রেডিট (৳)", "Dr./Cr.", "জের (৳)"],
    "rows": [
      ["০১/০১", "মূলধন জমা", "J-1", "৫০,০০০", "", "Dr.", "৫০,০০০"],
      ["০৫/০১", "যন্ত্রপাতি ক্রয়", "J-2", "", "১০,০০০", "Dr.", "৪০,০০০"]
    ],
    "total_row": ["৩১/০১", "জের", "", "৫৫,০০০", "১৫,০০০", "Dr.", "৪০,০০০"],
    "notes": "",
    "marks": "১০"
  }
]`,
    specialRules: [
      'This is a Running Balance Ledger (চলমান জের খতিয়ান) — 7-column format',
      'Columns: Date, Description, Ledger page/Ref, Debit, Credit, Dr./Cr., Balance',
      'Balance column shows running total after each transaction',
      'Dr./Cr. column indicates whether balance is Debit or Credit side',
      'Extract ALL rows — don\'t skip any transaction',
      'Copy amounts, dates, and descriptions exactly',
      'Preserve any ledger page or voucher references'
    ]
  },

  acc_general_journal: {
    instruction: `Extract the General Journal (সাধারণ জাবেদা) from this image. This is typically a 5-column format: Date, Account Name/Description, Ledger Folio, Debit, Credit. Extract every entry exactly.`,
    format: {
      type: 'accounting',
      sub_type: 'acc_general_journal',
      title_lines: 'array of title lines — journal name, copy exactly',
      headers: 'array of column headers — typically ["তারিখ", "বিবরণ (হিসাবের নাম)", "খতিয়ানের পৃষ্ঠা (L.F.)", "ডেবিট (৳)", "ক্রেডিট (৳)"]',
      rows: 'array of row arrays — copy each cell exactly',
      total_row: 'total row if visible — copy exactly',
      notes: 'any narration/explanation lines below entries — copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "sub_type": "acc_general_journal",
    "title_lines": ["সাধারণ জাবেদা", "General Journal"],
    "headers": ["তারিখ", "বিবরণ", "L.F.", "ডেবিট (৳)", "ক্রেডিট (৳)"],
    "rows": [
      ["০১/০১", "নগদ হিসাব Dr.", "১", "৫০,০০০", ""],
      ["", "  মূলধন হিসাব Cr.", "৫", "", "৫০,০০০"],
      ["", "(মূলধন জমাদান)", "", "", ""]
    ],
    "total_row": ["", "মোট", "", "৫০,০০০", "৫০,০০০"],
    "notes": "",
    "marks": "১০"
  }
]`,
    specialRules: [
      'This is a General Journal (সাধারণ জাবেদা) — 5-column format',
      'Debit account comes first, then Credit account is indented',
      'Narration appears in brackets ( ) below the credit entry',
      'L.F. = Ledger Folio (খতিয়ানের পৃষ্ঠা নম্বর)',
      'Extract ALL journal entries',
      'Preserve the debit/credit indentation pattern',
      'Copy narration lines exactly',
      'Include total row at the bottom'
    ]
  },

  acc_special_journal: {
    instruction: `Extract the Special Journal (বিশেষ জাবেদা) from this image. This could be a Purchase Journal (ক্রয় জাবেদা), Sales Journal (বিক্রয় জাবেদা), Purchase Returns Journal (ক্রয় ফেরত জাবেদা), or Sales Returns Journal (বিক্রয় ফেরত জাবেদা). Extract every entry exactly.`,
    format: {
      type: 'accounting',
      sub_type: 'acc_special_journal',
      title_lines: 'array of title lines — journal type name, copy exactly',
      headers: 'array of column headers — copy exactly (varies by journal type)',
      rows: 'array of row arrays — copy each cell exactly',
      total_row: 'total row if visible — copy exactly',
      notes: 'any notes below — copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "sub_type": "acc_special_journal",
    "title_lines": ["ক্রয় জাবেদা", "Purchase Journal"],
    "headers": ["তারিখ", "ইনভয়েস নং", "সরবরাহকারীর নাম", "L.F.", "টাকা (৳)"],
    "rows": [
      ["০৫/০১", "INV-101", "রহমান ট্রেডিং", "১৫", "১০,০০০"],
      ["১০/০১", "INV-102", "করিম এন্টারপ্রাইজ", "১৬", "৫,০০০"]
    ],
    "total_row": ["৩১/০১", "", "মোট", "", "১৫,০০০"],
    "notes": "",
    "marks": "১০"
  }
]`,
    specialRules: [
      'This is a Special Journal — identify which type from the title (ক্রয়/বিক্রয়/ক্রয় ফেরত/বিক্রয় ফেরত)',
      'Column structure varies by journal type — extract headers as they appear',
      'Copy ALL entries exactly — dates, invoice numbers, party names, amounts',
      'Include L.F. (Ledger Folio) numbers if visible',
      'Include the total row at the bottom',
      'Preserve any special notations or remarks'
    ]
  },

  acc_trial_balance: {
    instruction: `Extract the Trial Balance (রেওয়ামিল) from this image. This lists all accounts with their Debit and Credit balances. Typically has columns: Account Name, Debit Balance, Credit Balance. Extract every row exactly.`,
    format: {
      type: 'accounting',
      sub_type: 'acc_trial_balance',
      title_lines: 'array of title lines — copy exactly',
      headers: 'array of column headers — typically ["হিসাবের নাম", "ডেবিট (৳)", "ক্রেডিট (৳)"] or ["খতিয়ানের নাম", "ডেবিট জের", "ক্রেডিট জের"]',
      rows: 'array of row arrays — copy each cell exactly',
      total_row: 'total row — copy exactly (debit and credit totals must match)',
      notes: 'any notes below — copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "sub_type": "acc_trial_balance",
    "title_lines": ["রেওয়ামিল", "Trial Balance", "তারিখ: ৩১/১২/২০২৪"],
    "headers": ["হিসাবের নাম", "ডেবিট (৳)", "ক্রেডিট (৳)"],
    "rows": [
      ["নগদ", "৫০,০০০", ""],
      ["মূলধন", "", "৫০,০০০"],
      ["ক্রয়", "৩০,০০০", ""],
      ["বিক্রয়", "", "৪০,০০০"]
    ],
    "total_row": ["মোট", "৮০,০০০", "৯০,০০০"],
    "notes": "ডেবিট ও ক্রেডিট মোট সমান হওয়া আবশ্যক",
    "marks": "১০"
  }
]`,
    specialRules: [
      'This is a Trial Balance (রেওয়ামিল)',
      'Each account appears only once — either in Debit or Credit column',
      'Debit total and Credit total should be equal',
      'Extract ALL account names and amounts',
      'Copy account names exactly as they appear',
      'If there are adjustments or remarks, include them in notes',
      'Preserve the order of accounts as they appear'
    ]
  },

  acc_financial_stmt: {
    instruction: `Extract the Financial Statement (আর্থিক বিবরণী) from this image. This could be an Income Statement (আয় বিবরণী), Balance Sheet (উদ্বৃত্ত পত্র), or Statement of Owner's Equity. Typically has 3 or more money columns. Extract every row and calculation exactly.`,
    format: {
      type: 'accounting',
      sub_type: 'acc_financial_stmt',
      title_lines: 'array of title lines — statement type name, copy exactly',
      headers: 'array of column headers — copy exactly (varies by statement type, often has 3 money columns: বিবরণ, টাকা, টাকা)',
      rows: 'array of row arrays — copy each cell exactly',
      total_row: 'total/net row if visible — copy exactly',
      notes: 'any notes below — copy exactly',
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "accounting",
    "sub_type": "acc_financial_stmt",
    "title_lines": ["আয় বিবরণী", "Income Statement", "তারিখ: ০১/০১/২০২৪ হইতে ৩১/১২/২০২৪ পর্যন্ত"],
    "headers": ["বিবরণ", "টাকা (৳)", "টাকা (৳)"],
    "rows": [
      ["আয়:", "", ""],
      ["  বিক্রয় আয়", "", "১,০০,০০০"],
      ["ব্যয়:", "", ""],
      ["  ক্রয় ব্যয়", "৬০,০০০", ""],
      ["  ভাড়া ব্যয়", "১০,০০০", ""],
      ["মোট ব্যয়", "", "৭০,০০০"],
      ["নিট আয়", "", "৩০,০০০"]
    ],
    "total_row": ["", "", "৩০,০০০"],
    "notes": "",
    "marks": "১০"
  }
]`,
    specialRules: [
      'This is a Financial Statement (আর্থিক বিবরণী) — could be Income Statement, Balance Sheet, or Equity Statement',
      'Often uses 3 money columns: Description, Inner Amount, Outer Amount',
      'Inner column = subtotals, Outer column = main totals',
      'Extract ALL rows including sub-headings and totals',
      'Copy amounts and calculations exactly',
      'Preserve the hierarchical structure (main items, sub-items, totals)',
      'Include any dates or periods mentioned'
    ]
  },

  acc_mcq: {
    instruction: `Extract every Accounting MCQ (হিসাব বিজ্ঞান বহুনির্বাচনী প্রশ্ন) from the image. These are multiple-choice questions specifically about accounting concepts, formulas, and calculations.`,
    format: {
      type: 'MCQ',
      question: 'question text about accounting — copy exactly',
      option_a: 'first option — copy exactly',
      option_b: 'second option — copy exactly',
      option_c: 'third option — copy exactly',
      option_d: 'fourth option — copy exactly',
      correct_answer: 'correct option label if marked (e.g., "ক", "খ", "a", "b") or null',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "MCQ",
    "question": "হিসাব সমীকরণে সম্পদ = ?",
    "option_a": "দায় + মালিকানা",
    "option_b": "দায় − মালিকানা",
    "option_c": "মালিকানা − দায়",
    "option_d": "দায় × মালিকানা",
    "correct_answer": "ক",
    "marks": "১"
  }
]`,
    specialRules: [
      'These are Accounting-specific MCQ questions',
      'Preserve accounting terminology exactly (সম্পদ, দায়, মালিকানা, জের, ডেবিট, ক্রেডিট etc.)',
      'If the question has accounting formulas or equations, use $...$ LaTeX format',
      'Extract ALL 4 options even if one is not visible (use [unclear])',
      'If correct answer is not marked, set correct_answer to null',
      'Copy amounts with exact number formatting'
    ]
  },

  grammar: {
    instruction: `Extract every grammar question in this image.`,
    format: {
      type: 'grammar',
      question: 'question text - copy exactly',
      instruction: 'specific instruction if given - copy exactly',
      answer: 'given answer if visible - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "grammar",
    "question": "বাক্যটি শুদ্ধ কর: তুমি স্কুলে যাবে।",
    "instruction": "বাক্য সংশোধন করে লেখ।",
    "answer": "তুমি স্কুলে যাবে।",
    "marks": "২"
  }
]`,
    specialRules: [
      'Copy the question exactly',
      'Extract any specific instructions',
      'Copy sample sentences if provided',
      'If answer is given, copy it exactly'
    ]
  },

  poem: {
    instruction: `Extract the poem in this image - every line, every stanza.`,
    format: {
      type: 'poem',
      lines: 'array of poem lines - copy exactly',
      author: 'poet name if visible - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "poem",
    "lines": [
      "সুন্দর হে সকালের আলো,",
      "তোমায় দেখি আমি ভালো।",
      "পাখি ডাকে ডালে ডালে,",
      "ফুল ফোটে হাজার হাজার।"
    ],
    "author": "কাজী নজরুল ইসলাম",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Extract EVERY line - don\'t skip any',
      'Preserve line breaks and stanza structure',
      'Copy each line exactly - character by character',
      'Extract poet/author name if visible',
      'Extract poem title if visible'
    ]
  },

  essay: {
    instruction: `Extract every essay/রচনা question in this image.`,
    format: {
      type: 'essay',
      question: 'essay topic - copy exactly',
      word_limit: 'word limit if specified - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "essay",
    "question": "বাংলাদেশের স্বাধীনতা যুদ্ধ নিয়ে রচনা লেখ।",
    "word_limit": "৩০০ শব্দ",
    "marks": "১০"
  }
]`,
    specialRules: [
      'Copy the topic exactly',
      'Extract any guidelines or instructions',
      'Copy word limit if specified',
      'Preserve topic numbering'
    ]
  },

  paragraph: {
    instruction: `Extract every paragraph writing topic in this image.`,
    format: {
      type: 'paragraph',
      question: 'paragraph topic - copy exactly',
      hints: 'array of hints if provided - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "paragraph",
    "question": "বাংলাদেশের সংস্কৃতি নিয়ে একটি অনুচ্ছেদ লেখ।",
    "hints": ["ঐতিহ্য", "উৎসব", "ভাষা"],
    "marks": "৫"
  }
]`,
    specialRules: [
      'Copy the topic exactly',
      'Extract all hints/keywords if provided',
      'Copy any specific instructions',
      'Preserve topic numbering'
    ]
  },

  translation: {
    instruction: `Extract every translation question in this image.`,
    format: {
      type: 'translation',
      question: 'text to translate - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "translation",
    "question": "Translate into Bangla: Bangladesh is a beautiful country.",
    "marks": "৩"
  }
]`,
    specialRules: [
      'Copy the text to translate exactly',
      'Extract the target language if specified',
      'Copy any sample translations if provided'
    ]
  },

  arabic: {
    instruction: `Extract every Arabic text block in this image exactly - preserve all Arabic characters.`,
    format: {
      type: 'arabic',
      arabic_text: 'Arabic text - copy exactly, preserve all Arabic characters',
      question: 'related question if visible - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "arabic",
    "arabic_text": "بسم الله الرحمن الرحيم",
    "question": "অর্থ লেখ।",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Copy Arabic text EXACTLY - preserve all characters',
      'Don\'t transliterate - keep original Arabic',
      'Extract any diacritical marks (harakat)',
      'Copy any translation if provided'
    ]
  },

  hadith: {
    instruction: `Extract every Hadith/Tafseer block in this image - Arabic text, translation, and question.`,
    format: {
      type: 'hadith',
      arabic_block: 'Arabic Hadith text - copy exactly',
      translation: 'Bangla/English translation - copy exactly',
      question: 'related question - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "hadith",
    "arabic_block": "من سلك طريقا يلتمس فيه علما سهل الله له به طريقا إلى الجنة",
    "translation": "যে ব্যক্তি জ্ঞান অর্জনের উদ্দেশ্যে পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।",
    "question": "হাদিসের শিক্ষা কী?",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Copy Arabic text EXACTLY',
      'Copy translation exactly',
      'Extract narrator/source if visible',
      'Copy all related questions'
    ]
  },

  fiqh: {
    instruction: `Extract every Fiqh question in this image.`,
    format: {
      type: 'fiqh',
      question: 'Fiqh question - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "fiqh",
    "question": "নামাজের ওয়াজিব সংখ্যা কত এবং কী কী?",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Copy the question exactly',
      'Preserve all religious terminology',
      'Extract any references or sources'
    ]
  },

  letter_app: {
    instruction: `Extract every letter/application writing question in this image.`,
    format: {
      type: 'letter_app',
      question: 'topic/instruction - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "letter_app",
    "question": "হাতিরঝিলের পরিবেশ দূষণ রোধে জেলা প্রশাসক বরাবর একটি আবেদন লেখ।",
    "marks": "১০"
  }
]`,
    specialRules: [
      'Copy the topic exactly',
      'Extract recipient details if specified',
      'Copy any format guidelines'
    ]
  },

  rearrange: {
    instruction: `Extract every sentence rearrangement question in this image.`,
    format: {
      type: 'rearrange',
      sentences: 'array of sentences to rearrange - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "rearrange",
    "sentences": [
      "ঢাকা বাংলাদেশের রাজধানী।",
      "এটি একটি বড় শহর।",
      "এখানে অনেক মানুষ বাস করে।"
    ],
    "marks": "৩"
  }
]`,
    specialRules: [
      'Copy ALL sentences exactly',
      'Preserve sentence numbering if present',
      'Don\'t try to rearrange - just extract as-is'
    ]
  },

  graph_chart: {
    instruction: `Extract every graph/chart question in this image.`,
    format: {
      type: 'graph_chart',
      question: 'question about graph/chart - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "graph_chart",
    "question": "নিচের লেখচিত্র অবলম্বনে উত্তর দাও: কোন বছরে বৃষ্টিপাত সবচেয়ে বেশি?",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Copy the question exactly',
      'Extract any data points if visible',
      'Copy graph/chart title and labels'
    ]
  },

  summary: {
    instruction: `Extract the passage and summary/theme question in this image.`,
    format: {
      type: 'summary',
      passage: 'full passage - copy exactly',
      question: 'summary/theme question - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "summary",
    "passage": "বাংলাদেশ দক্ষিণ এশিয়ার একটি স্বাধীন রাষ্ট্র। এর রাজধানী ঢাকা।",
    "question": "উদ্দীপকের মূল ভাব বা শিরোনাম দাও।",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Extract the ENTIRE passage',
      'Copy the summary/theme question exactly',
      'Preserve paragraph structure'
    ]
  },

  dialogue: {
    instruction: `Extract every dialogue/story writing question in this image.`,
    format: {
      type: 'dialogue',
      question: 'dialogue topic - copy exactly',
      marks: 'marks value if visible'
    },
    examples: `Example output:
[
  {
    "type": "dialogue",
    "question": "দুই বন্ধুর মধ্যে গ্রামীণ ও শহুরে জীবনের পার্থক্য নিয়ে সংলাপ লেখ।",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Copy the topic exactly',
      'Extract any character names if specified',
      'Copy any setting/context provided'
    ]
  },

  // ─── PRIMARY EDUCATION TYPES (Nursery – Class 5) ───────────────────────────

  primary_passage: {
    instruction: `Extract the passage/poem (seen or unseen) and all comprehension sub-questions. Output type MUST be "parent_passage".`,
    format: {
      type: 'parent_passage',
      instruction: 'header instruction line if visible, else null',
      passage_body: 'full passage or poem text — copy every word exactly',
      sub_questions: [{ type: 'short', text: 'sub-question text', marks: 2 }],
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "parent_passage",
    "instruction": "নিচের অনুচ্ছেদটি পড়ো এবং প্রশ্নের উত্তর দাও:",
    "passage_body": "বাংলাদেশ একটি সুন্দর দেশ। এখানে অনেক নদী আছে।",
    "sub_questions": [
      { "type": "short", "text": "বাংলাদেশে কী বেশি আছে?", "marks": 2 },
      { "type": "short", "text": "অনুচ্ছেদটির একটি শিরোনাম দাও।", "marks": 2 }
    ],
    "marks": "৪"
  }
]`,
    specialRules: [
      'Extract the FULL passage or poem — every line, every word',
      'Preserve line breaks in poems',
      'Each sub-question gets type: "short" unless it is true/false → use "true_false"',
      'Copy sub-question numbering exactly (১, ২, ৩ or 1, 2, 3)',
      'If marks are split per sub-question, copy them into each sub-question marks field'
    ]
  },

  primary_cq: {
    instruction: `Extract the creative question (সৃজনশীল প্রশ্ন) — stimulus/উদ্দীপক followed by ক, খ, গ, ঘ sub-questions. Output type MUST be "parent_passage".`,
    format: {
      type: 'parent_passage',
      instruction: 'header line if visible, else null',
      passage_body: 'full উদ্দীপক / stimulus text — copy exactly',
      sub_questions: [{ type: 'short', text: 'ক. sub-question text', marks: 1 }],
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "parent_passage",
    "instruction": "নিচের উদ্দীপকটি পড়ো এবং প্রশ্নের উত্তর দাও:",
    "passage_body": "রাহেলা প্রতিদিন স্কুলে যায়। সে পরিষ্কার পোশাক পরে।",
    "sub_questions": [
      { "type": "short", "text": "ক. রাহেলা কোথায় যায়?", "marks": 1 },
      { "type": "short", "text": "খ. সে কেমন পোশাক পরে?", "marks": 2 },
      { "type": "short", "text": "গ. তুমি কি প্রতিদিন স্কুলে যাও? কেন?", "marks": 3 },
      { "type": "short", "text": "ঘ. পরিষ্কার থাকা কেন জরুরি ব্যাখ্যা কর।", "marks": 4 }
    ],
    "marks": "১০"
  }
]`,
    specialRules: [
      'Extract full stimulus/উদ্দীপক into passage_body',
      'Each ক/খ/গ/ঘ sub-question becomes a separate entry in sub_questions with type: "short"',
      'Preserve the label (ক, খ, গ, ঘ) as prefix in the text field',
      'Extract marks for each sub-question if visible (typically ১+২+৩+৪)',
      'If stimulus has image reference, note it as [চিত্র দেখ] in passage_body'
    ]
  },

  primary_science_cq: {
    instruction: `Extract the science/BGS structured question — short scenario followed by 3 sequential sub-questions. Output type MUST be "parent_passage".`,
    format: {
      type: 'parent_passage',
      instruction: 'header line if visible, else null',
      passage_body: 'short scenario or দৃশ্যপট — copy exactly',
      sub_questions: [{ type: 'short', text: 'sub-question text', marks: 2 }],
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "parent_passage",
    "instruction": "নিচের দৃশ্যপটটি পড়ো এবং প্রশ্নের উত্তর দাও:",
    "passage_body": "করিম সাহেব তার বাগানে সার দিচ্ছেন। তিনি জানেন গাছের জন্য সার দরকার।",
    "sub_questions": [
      { "type": "short", "text": "করিম সাহেব কী করছেন?", "marks": 2 },
      { "type": "short", "text": "গাছের জন্য সার কেন দরকার?", "marks": 3 },
      { "type": "short", "text": "তুমি বাগানে কী কী করতে পারো?", "marks": 5 }
    ],
    "marks": "১০"
  }
]`,
    specialRules: [
      'Extract the scenario/দৃশ্যপট into passage_body',
      'Extract exactly 3 sub-questions (or however many are visible)',
      'Each sub-question gets type: "short"',
      'Copy marks in brackets [N] if visible',
      'Preserve question numbering'
    ]
  },

  primary_sentence_matching: {
    instruction: `Extract the 2-column sentence matching question. Output type MUST be "column_matching".`,
    format: {
      type: 'column_matching',
      instruction: 'header instruction if visible',
      pairs: [{ column_a: 'left item exactly', column_b: 'matching right item exactly' }],
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "column_matching",
    "instruction": "বামপাশের সাথে ডানপাশ মেলাও:",
    "pairs": [
      { "column_a": "ঢাকা", "column_b": "বাংলাদেশের রাজধানী" },
      { "column_a": "পদ্মা", "column_b": "একটি বড় নদী" },
      { "column_a": "সূর্য", "column_b": "আলো দেয়" }
    ],
    "marks": "৫"
  }
]`,
    specialRules: [
      'Pair each column_a item with its correct column_b item based on position',
      'Copy each item exactly — no modifications',
      'If right column is shuffled (numbers/letters), pair by order as they appear',
      'Extract the header instruction exactly',
      'Copy all pairs — do not skip any'
    ]
  },

  primary_3col_matching: {
    instruction: `Extract the 3-column board matching question (SSC English 1st paper style — combine columns A, B, C to make a sentence). Output type MUST be "column_matching" with column_c in each pair.`,
    format: {
      type: 'column_matching',
      instruction: 'header instruction if visible',
      pairs: [{ column_a: 'part A text', column_b: 'part B text', column_c: 'part C text' }],
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "column_matching",
    "instruction": "তিনটি কলাম মিলিয়ে সঠিক বাক্য তৈরি কর:",
    "pairs": [
      { "column_a": "He", "column_b": "goes to", "column_c": "school." },
      { "column_a": "She", "column_b": "likes to", "column_c": "sing." },
      { "column_a": "They", "column_b": "play", "column_c": "cricket." }
    ],
    "marks": "৫"
  }
]`,
    specialRules: [
      'Extract ALL three columns A, B, C',
      'Each row becomes one pair with column_a, column_b, column_c',
      'Copy each cell exactly — preserve case and punctuation',
      'Do not try to match — extract in the order they appear'
    ]
  },

  primary_image_matching: {
    instruction: `Extract the image-text matching question (Nursery/KG style — match pictures to names). Describe each image briefly in column_a. Output type MUST be "column_matching".`,
    format: {
      type: 'column_matching',
      instruction: 'header instruction if visible',
      pairs: [{ column_a: '[image: brief description or alt text visible]', column_b: 'text label to match' }],
      marks: 'total marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "column_matching",
    "instruction": "ছবির সাথে নামটি মেলাও:",
    "pairs": [
      { "column_a": "[ছবি: আপেল]", "column_b": "আপেল" },
      { "column_a": "[ছবি: বই]", "column_b": "বই" },
      { "column_a": "[ছবি: বলপেন]", "column_b": "কলম" }
    ],
    "marks": "৫"
  }
]`,
    specialRules: [
      'For image cells, use [ছবি: description] format',
      'Copy text labels exactly',
      'Preserve the order as they appear in the image',
      'If image labels are visible (numbers or letters), include them'
    ]
  },

  primary_comparison: {
    instruction: `Extract the comparison box question where students write >, < or = between numbers/quantities. Output type MUST be "visual_grid".`,
    format: {
      type: 'visual_grid',
      instruction: 'header instruction if visible',
      left_count: 'left number as integer',
      right_count: 'right number as integer',
      operator: 'compare',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "visual_grid",
    "instruction": "তুলনা করো এবং >, <, = বসাও:",
    "left_count": 5,
    "right_count": 3,
    "operator": "compare",
    "marks": "১"
  },
  {
    "type": "visual_grid",
    "instruction": null,
    "left_count": 7,
    "right_count": 7,
    "operator": "compare",
    "marks": "১"
  }
]`,
    specialRules: [
      'Extract each comparison pair as a separate object',
      'left_count = the left number, right_count = the right number',
      'If comparing groups of objects, count them and use the numbers',
      'operator is always "compare" (the student fills in the symbol)',
      'Extract ALL comparison pairs in the image'
    ]
  },

  primary_picture_grid: {
    instruction: `Extract the picture/image card grid question (number or letter writing based on images). Output type MUST be "standard_text".`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction — copy exactly',
      question: 'describe each image item as comma-separated list: e.g. "[ছবি: আপেল], [ছবি: বল]"',
      space_level: 'short',
      line_style: 'none',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "ছবি দেখে সংখ্যা লেখো:",
    "question": "[ছবি: ৩টি আপেল], [ছবি: ৫টি বল], [ছবি: ২টি বই]",
    "space_level": "short",
    "line_style": "none",
    "marks": "৩"
  }
]`,
    specialRules: [
      'Describe each picture/image briefly in [ছবি: ...] format',
      'If numbers are printed below pictures, include them',
      'Copy the instruction exactly',
      'Each grid row can be one question object if they are separate'
    ]
  },

  primary_geometry: {
    instruction: `Extract the geometry question with a shape diagram or definition. Output type MUST be "standard_text".`,
    format: {
      type: 'standard_text',
      instruction: 'header or shape name / instruction — copy exactly',
      question: 'question text or shape definition — copy exactly',
      space_level: 'medium',
      line_style: 'none',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "নিচের জ্যামিতিক আকৃতির নাম ও সংজ্ঞা লেখো:",
    "question": "[জ্যামিতিক চিত্র] ত্রিভুজ — তিনটি বাহু ও তিনটি কোণ বিশিষ্ট বদ্ধ আকৃতি।",
    "space_level": "medium",
    "line_style": "none",
    "marks": "৩"
  }
]`,
    specialRules: [
      'If a shape diagram is present, note it as [জ্যামিতিক চিত্র] and name the shape',
      'Copy the definition or question exactly',
      'Copy any labels (বাহু, কোণ etc.) visible on the diagram',
      'If multiple shapes, create one object per shape'
    ]
  },

  primary_graph: {
    instruction: `Extract the graph/coordinate grid question. Output type MUST be "standard_text".`,
    format: {
      type: 'standard_text',
      instruction: 'header or graph title — copy exactly',
      question: 'question text asking about the graph — copy exactly',
      space_level: 'none',
      line_style: 'none',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "নিচের গ্রাফটি দেখো এবং প্রশ্নের উত্তর দাও:",
    "question": "[গ্রাফ/ছক] কোন মাসে বৃষ্টিপাত সবচেয়ে বেশি?",
    "space_level": "none",
    "line_style": "none",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Note the graph/chart presence as [গ্রাফ/ছক]',
      'Copy any axis labels, data points or values visible',
      'Copy questions about the graph exactly',
      'If graph has a title, include it in instruction'
    ]
  },

  primary_inline_box: {
    instruction: `Extract the inline box fill-in question (missing letters or numbers in boxes). Output type MUST be "standard_text". Use ___ for each blank box.`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction — copy exactly',
      question: 'text with ___ for each empty box — copy exactly',
      space_level: 'none',
      line_style: 'none',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "শূন্যস্থান পূরণ করো:",
    "question": "অ ___ ই ___ উ",
    "space_level": "none",
    "line_style": "none",
    "marks": "৫"
  },
  {
    "type": "standard_text",
    "instruction": "খালি ঘরে সঠিক সংখ্যা বসাও:",
    "question": "___ + ___ = ১০",
    "space_level": "none",
    "line_style": "none",
    "marks": "৫"
  }
]`,
    specialRules: [
      'Replace each empty box with ___',
      'Keep the surrounding text exactly as it appears',
      'If letters are visible around boxes, copy them exactly',
      'Each row of boxes can be a separate question object',
      'Preserve spacing and sequence'
    ]
  },

  primary_math_vertical: {
    instruction: `Extract the vertical math question (সংখ্যার স্থানীয় মান — units, tens, hundreds). Output type MUST be "standard_text". Write numbers top-to-bottom with operator.`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction — copy exactly',
      question: 'numbers and operator as text, e.g. "  ৫৩\\n+ ২৮\\n────"',
      space_level: 'medium',
      line_style: 'none',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "যোগ করো:",
    "question": "  ৫৩\\n+ ২৮\\n────",
    "space_level": "medium",
    "line_style": "none",
    "marks": "২"
  }
]`,
    specialRules: [
      'Write each number on a new line using \\n',
      'Include the operator (+, -, ×) on the second number\'s line',
      'Copy Bengali or English digits exactly',
      'Add ──── line to show the answer line',
      'Each separate calculation is a separate question object'
    ]
  },

  primary_wh_question: {
    instruction: `Extract the WH-question where a word in the sentence is underlined (students replace it with question word). Output type MUST be "standard_text". Wrap the underlined word in [underline]...[/underline].`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction — copy exactly',
      question: 'full sentence with [underline]word[/underline] for underlined part',
      space_level: 'short',
      line_style: 'none',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "নিচের বাক্যে আন্ডারলাইন করা শব্দটির জায়গায় প্রশ্নবোধক বাক্য তৈরি করো:",
    "question": "[underline]রাহেলা[/underline] প্রতিদিন স্কুলে যায়।",
    "space_level": "short",
    "line_style": "none",
    "marks": "২"
  }
]`,
    specialRules: [
      'Wrap the underlined word with [underline]...[/underline]',
      'Copy the full sentence exactly',
      'Each sentence is a separate question object',
      'Copy header instruction exactly'
    ]
  },

  primary_dotted_lines: {
    instruction: `Extract the question with dotted answer lines below it (.........). Output type MUST be "standard_text" with line_style: "dotted".`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction if visible',
      question: 'question text — copy exactly',
      space_level: 'medium',
      line_style: 'dotted',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "নিচের প্রশ্নের উত্তর দাও:",
    "question": "তোমার প্রিয় রং কী?",
    "space_level": "medium",
    "line_style": "dotted",
    "marks": "২"
  }
]`,
    specialRules: [
      'ALWAYS set line_style to "dotted"',
      'ALWAYS set space_level to "medium" unless the dotted lines are very long (use "long")',
      'Copy the question text exactly',
      'Each question becomes a separate object',
      'Do NOT include the dotted lines themselves in the question text'
    ]
  },

  primary_notebook_ruled: {
    instruction: `Extract the question with notebook ruled lines for handwriting practice. Output type MUST be "standard_text" with line_style: "ruled".`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction if visible',
      question: 'question text or handwriting prompt — copy exactly',
      space_level: 'long',
      line_style: 'ruled',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "সুন্দর করে লেখো:",
    "question": "আমার দেশের নাম বাংলাদেশ।",
    "space_level": "long",
    "line_style": "ruled",
    "marks": "৫"
  }
]`,
    specialRules: [
      'ALWAYS set line_style to "ruled"',
      'ALWAYS set space_level to "long"',
      'Copy the writing prompt or sentence exactly',
      'If multiple lines to copy, separate with \\n',
      'Do NOT include the ruled lines in the question text'
    ]
  },

  primary_mcq_grid: {
    instruction: `Extract every MCQ (Multiple Choice Question) including multi-option grid format (i, ii, iii type). Output type MUST be "MCQ".`,
    format: {
      type: 'MCQ',
      question: 'question text — copy exactly',
      option_a: 'first option',
      option_b: 'second option',
      option_c: 'third option',
      option_d: 'fourth option',
      correct_answer: 'correct option label if marked, else null',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "MCQ",
    "question": "কোনটি ফল?",
    "option_a": "আম",
    "option_b": "গাছ",
    "option_c": "নদী",
    "option_d": "পাহাড়",
    "correct_answer": "ক",
    "marks": "১"
  }
]`,
    specialRules: [
      'Extract ALL 4 options even if arranged in 2-column or 3-column grid',
      'Copy option text exactly',
      'If correct answer is marked (√, ✓, underline), extract it as correct_answer',
      'For multi-option MCQ (i+ii, ii+iii type), copy the combination options exactly as option text',
      'Preserve Bengali numbering (ক, খ, গ, ঘ) for options'
    ]
  },

  primary_plain_text: {
    instruction: `Extract plain short questions (সংক্ষিপ্ত প্রশ্ন) or rearrangement / punctuation questions. Output type MUST be "standard_text".`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction if visible',
      question: 'question text — copy exactly',
      space_level: 'short',
      line_style: 'none',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "নিচের প্রশ্নের উত্তর লেখো:",
    "question": "তোমার নাম কী?",
    "space_level": "short",
    "line_style": "none",
    "marks": "২"
  }
]`,
    specialRules: [
      'Copy each question exactly',
      'For rearrangement, copy scrambled words as-is',
      'Each question becomes a separate object',
    ]
  },

  primary_tracing: {
    instruction: `Extract the letter/number tracing question (Nursery/KG — trace the character). Output type MUST be "standard_text" with question: "tracing", tracing_chars array of characters, and tracing_type: "letter" or "number".`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction if visible',
      question: 'tracing',
      tracing_chars: ['array of characters to trace'],
      tracing_type: '"letter" or "number"',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "অক্ষরগুলো ট্রেস করো:",
    "question": "tracing",
    "tracing_chars": ["অ", "আ", "ই", "ঈ"],
    "tracing_type": "letter",
    "marks": "৪"
  }
]`,
    specialRules: [
      'Set question to exactly "tracing"',
      'tracing_chars must be an array of individual characters',
      'tracing_type is "letter" for alphabet, "number" for digits',
      'Copy each character exactly as it appears'
    ]
  },

  primary_number_line: {
    instruction: `Extract the number line question with missing numbers/jumps. Output type MUST be "standard_text" with question: "number_line", nl_start, nl_end, nl_jumps array, and nl_question text.`,
    format: {
      type: 'standard_text',
      instruction: 'header instruction if visible',
      question: 'number_line',
      nl_start: 'start number (integer)',
      nl_end: 'end number (integer)',
      nl_jumps: ['array of numbers that are jumps/blanks'],
      nl_question: 'question text about the number line',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "standard_text",
    "instruction": "সংখ্যা রেখায় খালি ঘর পূরণ করো:",
    "question": "number_line",
    "nl_start": 0,
    "nl_end": 10,
    "nl_jumps": [3, 5, 7],
    "nl_question": "সংখ্যা রেখায় খালি ঘরে সঠিক সংখ্যা বসাও।",
    "marks": "৩"
  }
]`,
    specialRules: [
      'Set question to exactly "number_line"',
      'nl_start and nl_end are integers defining the range',
      'nl_jumps is an array of numbers where jumps/blanks occur',
      'nl_question is the question text shown above the number line',
      'Copy any question text exactly'
    ]
  },

  primary_visual_math: {
    instruction: `Extract the visual/picture math question (count objects and add/subtract). Output type MUST be "visual_grid" with operator: "+" or "-" or "×" or "÷", left_count, right_count, left_asset, right_asset, and math_question.`,
    format: {
      type: 'visual_grid',
      instruction: 'header instruction if visible',
      left_count: 'number of left objects (integer)',
      right_count: 'number of right objects (integer)',
      left_asset: 'object type key: apple, banana, orange, mango, star, circle, flower, etc.',
      right_asset: 'object type key for right side',
      operator: '"+", "-", "×", or "÷"',
      math_question: 'question text about the operation',
      marks: 'marks if visible'
    },
    examples: `Example output:
[
  {
    "type": "visual_grid",
    "instruction": "ছবি দেখে যোগ করো:",
    "left_count": 3,
    "right_count": 2,
    "left_asset": "apple",
    "right_asset": "apple",
    "operator": "+",
    "math_question": "মোট আপেল কয়টি?",
    "marks": "২"
  }
]`,
    specialRules: [
      'Count the objects in the image for left_count and right_count',
      'Use asset key names: apple, banana, orange, mango, star, circle, flower, book, pencil',
      'operator must be one of: +, -, ×, ÷',
      'If same object on both sides, use same asset key for left_asset and right_asset',
      'math_question is the text question shown below the visual',
      'Each separate visual math problem is a separate object'
    ]
  }
}

// Map internal questionType keys to the display name we mention to the model.
// (The model performs notably better when told the human-facing label.)
const TYPE_LABELS = {
  mcq: 'MCQ (Multiple Choice Question)',
  cq: 'Creative Question (সৃজনশীল প্রশ্ন)',
  short: 'Short Question',
  broad: 'Broad/Descriptive Question',
  creative: 'Broad/Descriptive Question',
  fill_blank: 'Fill-in-the-blank',
  matching: 'Matching question',
  true_false: 'True/False statement',
  math: 'Math problem',
  passage: 'Reading-comprehension passage with questions',
  accounting: 'Accounting table',
  primary_passage: 'Passage with comprehension sub-questions',
  primary_cq: 'Creative question (ক/খ/গ/ঘ)',
  primary_science_cq: 'Science scenario with 3 sub-questions',
  primary_mcq_grid: 'MCQ',
  acc_mcq: 'Accounting MCQ',
}

/**
 * Build complete prompt for a question type.
 *
 * @param {string} questionType — internal key (mcq, cq, fill_blank, ...)
 * @param {Object} [opts]
 * @param {boolean} [opts.single=true] — single-question contract mode.
 *   The Magic Scan workflow asks teachers to crop ONE question at a time
 *   AND tell us its type up front. We exploit that contract here: instead
 *   of "Extract every MCQ" (which lets the model split or hallucinate
 *   extras), we say "This image contains EXACTLY ONE MCQ — extract it."
 *   Single-question mode also enables a hard type-match check downstream
 *   in the validator: if user said MCQ but model returns CQ shape, we
 *   know to retry with explicit feedback.
 * @param {string} [opts.feedback] — when set, prepended as "FEEDBACK FROM
 *   LAST ATTEMPT" so a retry can correct a specific structural error
 *   (e.g. "Last extraction missed option (ঘ).").
 */
function buildPrompt(questionType, opts = {}) {
  const { single = true, feedback = '' } = opts
  const typeConfig = QUESTION_TYPE_PROMPTS[questionType] || QUESTION_TYPE_PROMPTS.mcq
  const label = TYPE_LABELS[questionType] || questionType

  // In single mode we override the type's generic instruction with a
  // one-shot contract. We keep typeConfig.instruction otherwise so callers
  // that legitimately need multi-extraction (none right now) still work.
  const headline = single
    ? `The user has cropped ONE question and told us it is a ${label}.
This image contains EXACTLY ONE ${label}. Extract it precisely.
- If the image accidentally shows more than one question, extract only the FIRST complete one.
- If you cannot find a complete ${label} in this image, return an empty array [].
- The output type field MUST match the user-selected type: "${typeConfig.format.type || questionType}". Do NOT return a different question type.`
    : typeConfig.instruction

  const rememberBullets = single
    ? [
        '- Copy text EXACTLY as it appears in the image',
        '- Use [unclear] for any character you are not 100% sure of',
        '- Never guess or substitute words',
        '- Return EXACTLY ONE question object in the JSON array',
        '- Return ONLY the JSON array, no markdown, no explanation',
      ]
    : [
        '- Copy text EXACTLY as it appears in the image',
        '- Use [unclear] for unreadable text',
        '- Never guess or substitute words',
        '- Extract ALL questions, don\'t skip any',
        '- Return ONLY the JSON array, no markdown, no explanation',
      ]

  const parts = []
  if (feedback) {
    parts.push(`### IMPORTANT FEEDBACK FROM LAST ATTEMPT:\n${feedback}\nPlease look at the image again and fix the error.\n`)
  }
  parts.push(headline)
  parts.push('\n### OUTPUT FORMAT:')
  parts.push(JSON.stringify(typeConfig.format, null, 2))
  parts.push('\n### EXAMPLE:')
  parts.push(typeConfig.examples)
  parts.push('\n### SPECIAL RULES:')
  parts.push(typeConfig.specialRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n'))
  parts.push('\n### REMEMBER:')
  parts.push(rememberBullets.join('\n'))

  return {
    system: SYSTEM_PROMPT,
    user: parts.join('\n'),
  }
}

module.exports = {
  SYSTEM_PROMPT,
  QUESTION_TYPE_PROMPTS,
  buildPrompt
}