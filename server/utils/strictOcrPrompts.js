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
  }
}

/**
 * Build complete prompt for a question type
 */
function buildPrompt(questionType) {
  const typeConfig = QUESTION_TYPE_PROMPTS[questionType] || QUESTION_TYPE_PROMPTS.mcq
  
  const prompt = [
    typeConfig.instruction,
    '\n### OUTPUT FORMAT:',
    JSON.stringify(typeConfig.format, null, 2),
    '\n### EXAMPLE:',
    typeConfig.examples,
    '\n### SPECIAL RULES:',
    typeConfig.specialRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n'),
    '\n### REMEMBER:',
    '- Copy text EXACTLY as it appears in the image',
    '- Use [unclear] for unreadable text',
    '- Never guess or substitute words',
    '- Extract ALL questions, don\'t skip any',
    '- Return ONLY the JSON array, no markdown, no explanation'
  ].join('\n')
  
  return {
    system: SYSTEM_PROMPT,
    user: prompt
  }
}

module.exports = {
  SYSTEM_PROMPT,
  QUESTION_TYPE_PROMPTS,
  buildPrompt
}