import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import usePaperStore from '@/store/paperStore'

/**
 * Primary Templates Modal
 * Shows readymade questions organized by category for Primary education
 * All types map to actual PaperEditor QUESTION_EDITORS keys
 */

// Readymade question templates by category
const PRIMARY_TEMPLATES = {
  // ─── Passage / প্যাসেজ ───
  parent_passage: {
    id: 'parent_passage',
    name: 'প্যাসেজ / কবিতা',
    nameEn: 'Passage / Poem',
    icon: '📖',
    color: '#16a34a',
    questions: [
      {
        instruction: 'নিচের অনুচ্ছেদটি পড়ে প্রশ্নগুলোর উত্তর দাও:',
        passage_body: 'বাংলাদেশ দক্ষিণ এশিয়ার একটি সুন্দর দেশ। এর আয়তন ১,৪৭,৫৭০ বর্গ কিলোমিটার। বাংলাদেশের জলবায়ু ক্রান্তীয় মৌসসুমী। এখানে ছয়টি ঋতু আছে। গ্রামবাংলার প্রকৃতি অত্যন্ত মনোরম। ধান ক্ষেত, সবুজ মাঠ, নদ-নদী আমাদের দেশের সৌন্দর্য।',
        sub_questions: [
          { id: 's1', type: 'short', text: 'বাংলাদেশের আয়তন কত?', answer: '১,৪৭,৫৭০ বর্গ কিলোমিটার', marks: 2 },
          { id: 's2', type: 'short', text: 'বাংলাদেশে কয়টি ঋতু আছে?', answer: '৬টি', marks: 2 },
          { id: 's3', type: 'true_false', text: 'বাংলাদেশের জলবায়ু শীতপ্রধান।', answer: 'false', marks: 1 },
        ],
        marks: 5,
      },
      {
        instruction: 'কবিতাটি পড়ে প্রশ্নগুলোর উত্তর দাও:',
        passage_body: 'আমার সোনার বাংলা,\nআমি তোমায় ভালোবাসি।\nমাঠে মাঠে সোনার ধান,\nনদীতে বইছে জল।',
        sub_questions: [
          { id: 's1', type: 'short', text: 'কবিতায় কোন দেশের কথা বলা হয়েছে?', answer: 'বাংলাদেশ', marks: 2 },
          { id: 's2', type: 'short', text: 'মাঠে কী আছে?', answer: 'সোনার ধান', marks: 2 },
        ],
        marks: 4,
      },
    ],
  },

  // ─── Creative CQ / সৃজনশীল ───
  creative_cq: {
    id: 'creative_cq',
    name: 'সৃজনশীল CQ',
    nameEn: 'Creative CQ',
    icon: '💡',
    color: '#7c3aed',
    questions: [
      {
        instruction: 'নিচের উদ্দীপকটি পড়ো এবং প্রশ্নগুলোর উত্তর দাও:',
        stimulus: 'রাহেলা প্রতিদিন সকালে স্কুলে যায়। সে সাইকেল চালিয়ে স্কুলে যায়। তার স্কুলের নাম "সূর্যোদয় সরকারি প্রাথমিক বিদ্যালয়"। সেখানে ৩০০ জন শিক্ষার্থী পড়ে।',
        subs: [
          { label: 'ক', text: 'রাহেলা কীভাবে স্কুলে যায়?', marks: 2 },
          { label: 'খ', text: 'স্কুলের নাম কী?', marks: 2 },
          { label: 'গ', text: 'স্কুলে কতজন শিক্ষার্থী পড়ে?', marks: 2 },
          { label: 'ঘ', text: 'তুমি কীভাবে স্কুলে যাও? লেখো।', marks: 4 },
        ],
        marks: 10,
      },
    ],
  },

  // ─── Science / BGS scenario ───
  science_scenario: {
    id: 'science_scenario',
    name: 'বিজ্ঞান / BGS',
    nameEn: 'Science / BGS',
    icon: '🔬',
    color: '#059669',
    questions: [
      {
        instruction: 'নিচের দৃশ্যপটটি পড়ো এবং প্রশ্নগুলোর উত্তর দাও:',
        passage_body: 'করিম সাহেবের বাগানে বিভিন্ন ধরনের গাছ আছে। আম গাছ, কাঁঠাল গাছ, পেঁপে গাছ এবং লেবু গাছ। বাগানের এক কোণে সবজির চাষ করেন। সেখানে লাউ, মিষ্টি কুমড়া, বেগুন জন্মায়।',
        sub_questions: [
          { id: 's1', type: 'short', text: 'করিম সাহেবের বাগানে কী কী গাছ আছে?', answer: 'আম, কাঁঠাল, পেঁপে, লেবু', marks: 3 },
          { id: 's2', type: 'short', text: 'বাগানে কোন সবজি জন্মায়?', answer: 'লাউ, মিষ্টি কুমড়া, বেগুন', marks: 2 },
          { id: 's3', type: 'true_false', text: 'বাগানে ফুলের গাছ আছে।', answer: 'false', marks: 1 },
        ],
        marks: 6,
      },
    ],
  },

  // ─── Column Matching / মিলকরণ ───
  column_matching: {
    id: 'column_matching',
    name: 'বাক্য মিলকরণ',
    nameEn: 'Matching',
    icon: '🔗',
    color: '#db2777',
    questions: [
      {
        instruction: 'বাম পাশের সাথে ডান পাশের সঠিক মিলটি খুঁজে বের করো:',
        pairs: [
          { column_a: 'ঢাকা', column_b: 'বাংলাদেশের রাজধানী' },
          { column_a: 'পদ্মা', column_b: 'একটি নদী' },
          { column_a: 'সূর্য', column_b: 'তারা' },
          { column_a: 'গরু', column_b: 'একটি পশু' },
        ],
        marks: 4,
      },
      {
        instruction: 'সংখ্যা ও শব্দ মিলিয়ে দাও:',
        pairs: [
          { column_a: 'এক', column_b: '1' },
          { column_a: 'দুই', column_b: '2' },
          { column_a: 'তিন', column_b: '3' },
          { column_a: 'চার', column_b: '4' },
          { column_a: 'পাঁচ', column_b: '5' },
        ],
        marks: 5,
      },
    ],
  },

  // ─── 3-Column Matching / ৩-কলাম ───
  three_col_matching: {
    id: 'three_col_matching',
    name: '৩-কলাম বোর্ড',
    nameEn: '3-Column Board',
    icon: '📊',
    color: '#ea580c',
    questions: [
      {
        instruction: 'তিনটি কলাম মিলিয়ে সঠিক বাক্য তৈরি কর:',
        pairs: [
          { column_a: 'He', column_b: 'goes to', column_c: 'school.' },
          { column_a: 'She', column_b: 'likes to', column_c: 'sing.' },
          { column_a: 'They', column_b: 'play', column_c: 'cricket.' },
          { column_a: 'We', column_b: 'eat', column_c: 'rice.' },
        ],
        marks: 4,
      },
    ],
  },

  // ─── Image Matching / ছবি মিলকরণ ───
  image_matching: {
    id: 'image_matching',
    name: 'ছবি মিলকরণ',
    nameEn: 'Image Matching',
    icon: '🖼️',
    color: '#8b5cf6',
    questions: [
      {
        instruction: 'ছবির সাথে সঠিক শব্দটি মিলিয়ে দাও:',
        pairs: [
          { column_a: '🍎', column_b: 'আপেল' },
          { column_a: '🍌', column_b: 'কলা' },
          { column_a: '🐱', column_b: 'বিড়াল' },
          { column_a: '🌸', column_b: 'ফুল' },
        ],
        marks: 4,
      },
    ],
  },

  // ─── Visual Comparison / তুলনা বক্স ───
  visual_compare: {
    id: 'visual_compare',
    name: 'তুলনা বক্স',
    nameEn: 'Compare Box',
    icon: '⚖️',
    color: '#f59e0b',
    questions: [
      { instruction: 'কোনটি বেশি?', left_asset: 'apple', left_count: 5, right_asset: 'apple', right_count: 3, operator: '>', marks: 1 },
      { instruction: 'কোনটি কম?', left_asset: 'star', left_count: 4, right_asset: 'star', right_count: 7, operator: '<', marks: 1 },
      { instruction: 'সমান কিন্তু ভিন্ন', left_asset: 'circle', left_count: 6, right_asset: 'square', right_count: 6, operator: '=', marks: 1 },
      { instruction: 'সঠিক চিহ্ন বসাও', left_asset: 'bird', left_count: 5, right_asset: 'bird', right_count: 5, operator: 'compare', marks: 1 },
    ],
  },

  // ─── Visual Math / ছবি গ্রিড ───
  visual_math: {
    id: 'visual_math',
    name: 'ছবি গণিত',
    nameEn: 'Visual Math',
    icon: '🔢',
    color: '#dc2626',
    questions: [
      { instruction: 'যোগফল কত?', left_asset: 'banana', left_count: 3, right_asset: 'banana', right_count: 4, operator: '+', math_question: 'মোট কলা কতটি?', marks: 1 },
      { instruction: 'বিয়োগ করো', left_asset: 'apple', left_count: 8, right_asset: 'apple', right_count: 3, operator: '-', math_question: 'কয়টি আপেল বাকি?', marks: 1 },
      { instruction: 'গুণ করো', left_asset: 'flower', left_count: 4, right_asset: 'flower', right_count: 2, operator: '×', math_question: 'মোট ফুল কতটি?', marks: 1 },
    ],
  },

  // ─── Tracing / ট্রেসিং ───
  tracing: {
    id: 'tracing',
    name: 'ট্রেসিং',
    nameEn: 'Tracing',
    icon: '✏️',
    color: '#ef4444',
    questions: [
      {
        instruction: 'অক্ষরগুলো ট্রেস করো (দেখে লেখো):',
        question: 'tracing',
        tracing_type: 'letter',
        tracing_chars: ['অ', 'আ', 'ই', 'ঈ'],
        marks: 4,
      },
      {
        instruction: 'সংখ্যাগুলো ট্রেস করো:',
        question: 'tracing',
        tracing_type: 'number',
        tracing_chars: ['১', '২', '৩', '৪', '৫'],
        marks: 5,
      },
      {
        instruction: 'বাংলা ব্যঞ্জনবর্ণ ট্রেস করো:',
        question: 'tracing',
        tracing_type: 'letter',
        tracing_chars: ['ক', 'খ', 'গ', 'ঘ', 'ঙ'],
        marks: 5,
      },
    ],
  },

  // ─── Number Line / সংখ্যা রেখা ───
  number_line: {
    id: 'number_line',
    name: 'সংখ্যা রেখা',
    nameEn: 'Number Line',
    icon: '📏',
    color: '#16a34a',
    questions: [
      {
        instruction: 'সংখ্যা রেখায় খালি ঘরে সঠিক সংখ্যা বসাও:',
        question: 'number_line',
        nl_start: 0,
        nl_end: 10,
        nl_jumps: [3, 5, 7],
        nl_question: 'খালি ঘরে সঠিক সংখ্যা বসাও',
        marks: 3,
      },
      {
        instruction: 'সংখ্যা রেখা পূরণ করো:',
        question: 'number_line',
        nl_start: 10,
        nl_end: 20,
        nl_jumps: [12, 15, 18],
        nl_question: 'খালি ঘরগুলো পূরণ করো',
        marks: 3,
      },
    ],
  },

  // ─── Geometry / জ্যামিতি ───
  geometry: {
    id: 'geometry',
    name: 'জ্যামিতি',
    nameEn: 'Geometry',
    icon: '📐',
    color: '#0284c7',
    questions: [
      {
        instruction: 'নিচের জ্যামিতিক আকৃতিগুলোর নাম লেখো:',
        question: 'নিচের আকৃতিগুলোর নাম লেখো:\n△ = ______\n□ = ______\n○ = ______\n▭ = ______',
        space_level: 'short',
        marks: 4,
      },
      {
        instruction: 'ত্রিভুজের বৈশিষ্ট্য লেখো:',
        question: 'ত্রিভুজের কয়টি বাহু ও কয়টি কোণ আছে?',
        space_level: 'medium',
        marks: 2,
      },
    ],
  },

  // ─── Graph / Chart / গ্রাফ ───
  graph_chart: {
    id: 'graph_chart',
    name: 'গ্রাফ / ছক',
    nameEn: 'Graph / Chart',
    icon: '📊',
    color: '#4f46e5',
    questions: [
      {
        instruction: 'নিচের তথ্য দেখে প্রশ্নগুলোর উত্তর দাও:',
        question: 'একটি বার চার্টে দেখানো হয়েছে:\nলাল = ৫টি\nনীল = ৩টি\nসবুজ = ৭টি\nহলুদ = ৪টি\n\n(ক) কোন রং সবচেয়ে বেশি?\n(খ) নীল ও হলুদ মিলিয়ে কত?',
        space_level: 'medium',
        marks: 4,
      },
    ],
  },

  // ─── Inline Boxes / ইনলাইন বক্স ───
  inline_boxes: {
    id: 'inline_boxes',
    name: 'ইনলাইন বক্স',
    nameEn: 'Inline Boxes',
    icon: '🟨',
    color: '#ca8a04',
    questions: [
      {
        instruction: 'শূন্যস্থানে সঠিক অক্ষর বসাও:',
        question: 'অ ___ ই ___ উ ___ এ',
        space_level: 'none',
        marks: 3,
      },
      {
        instruction: 'সংখ্যা বক্সে সঠিক উত্তর লেখো:',
        question: '___ + ___ = ১০\n___ + ___ = ১৫\n___ - ৩ = ৫',
        space_level: 'none',
        marks: 3,
      },
    ],
  },

  // ─── Math Vertical / ম্যাথ ভার্টিকাল ───
  math_vertical: {
    id: 'math_vertical',
    name: 'ম্যাথ ভার্টিকাল',
    nameEn: 'Math Vertical',
    icon: '➕',
    color: '#9333ea',
    questions: [
      {
        instruction: 'নিচের যোগফল বের করো:',
        question: '  ৫৩\n+ ২৮\n────\n  ???',
        space_level: 'short',
        marks: 2,
      },
      {
        instruction: 'বিয়োগ করো:',
        question: '  ৪৭\n- ১৯\n────\n  ???',
        space_level: 'short',
        marks: 2,
      },
      {
        instruction: 'গুণ করো:',
        question: '  ১২\n×  ৩\n────\n  ???',
        space_level: 'short',
        marks: 2,
      },
    ],
  },

  // ─── WH Questions / WH প্রশ্ন ───
  wh_questions: {
    id: 'wh_questions',
    name: 'WH প্রশ্ন',
    nameEn: 'WH Questions',
    icon: '❓',
    color: '#0d9488',
    questions: [
      {
        instruction: 'নিচের আন্ডারলাইন অংশের বিষয়ে প্রশ্ন তৈরি করো:',
        question: '[underline]রাহেলা[/underline] স্কুলে যায়।\nকে? → ______\n\n[underline]ঢাকা[/underline] বাংলাদেশের রাজধানী।\nকোথায়? → ______',
        space_level: 'short',
        marks: 4,
      },
      {
        instruction: 'WH প্রশ্ন তৈরি করো:',
        question: 'করিম ফুটবল খেলে। (কী খেলে?)\n→ ______\n\nসে মাঠে খেলে। (কোথায় খেলে?)\n→ ______',
        space_level: 'short',
        marks: 2,
      },
    ],
  },

  // ─── Dot Line / ডট লাইন ───
  dot_line: {
    id: 'dot_line',
    name: 'ডট লাইন',
    nameEn: 'Dot Line',
    icon: '✍️',
    color: '#f97316',
    questions: [
      {
        instruction: 'ডটেড লাইনে নিচের প্রশ্নের উত্তর লেখো:',
        question: 'তোমার প্রিয় ঋতু কোনটি? কেন?',
        space_level: 'medium',
        line_style: 'dotted',
        marks: 3,
      },
      {
        instruction: 'নিচের বাক্যটি ডটেড লাইনে কপি করো:',
        question: 'আমার দেশের নাম বাংলাদেশ।',
        space_level: 'short',
        line_style: 'dotted',
        marks: 2,
      },
    ],
  },

  // ─── Notebook Ruled / নোটবুক ───
  notebook_ruled: {
    id: 'notebook_ruled',
    name: 'নোটবুক রুলড',
    nameEn: 'Notebook Ruled',
    icon: '📓',
    color: '#6366f1',
    questions: [
      {
        instruction: 'নিচের বাক্যটি রুলড লাইনে সুন্দর করে লেখো:',
        question: 'আমার দেশের নাম বাংলাদেশ।',
        space_level: 'medium',
        line_style: 'ruled',
        marks: 2,
      },
      {
        instruction: 'ফোর-লাইনে বাংলা অক্ষর লেখো:',
        question: 'অ, আ, ই, ঈ, উ',
        space_level: 'medium',
        line_style: 'fourline',
        marks: 5,
      },
    ],
  },

  // ─── MCQ Grid / এমসিকিউ ───
  mcq_grid: {
    id: 'mcq_grid',
    name: 'MCQ গ্রিড',
    nameEn: 'MCQ Grid',
    icon: '☑️',
    color: '#2563eb',
    questions: [
      {
        instruction: 'সঠিক উত্তরটি বেছে নাও:',
        text: 'বাংলাদেশের রাজধানী কোন শহর?',
        options: [
          { key: 'ক', text: 'চট্টগ্রাম' },
          { key: 'খ', text: 'ঢাকা' },
          { key: 'গ', text: 'রাজশাহী' },
          { key: 'ঘ', text: 'খুলনা' },
        ],
        correct: 'খ',
        marks: 1,
      },
      {
        instruction: 'সঠিক উত্তরটি বেছে নাও:',
        text: '২ + ৩ = ?',
        options: [
          { key: 'ক', text: '৪' },
          { key: 'খ', text: '৫' },
          { key: 'গ', text: '৬' },
          { key: 'ঘ', text: '৭' },
        ],
        correct: 'খ',
        marks: 1,
      },
    ],
  },

  // ─── General Question / সাধারণ ───
  general_question: {
    id: 'general_question',
    name: 'সাধারণ প্রশ্ন',
    nameEn: 'General Question',
    icon: '📝',
    color: '#475569',
    questions: [
      {
        question: 'তোমার নাম কী?',
        space_level: 'short',
        marks: 1,
      },
      {
        question: 'তুমি কোন স্কুলে পড়ো?',
        space_level: 'short',
        marks: 1,
      },
      {
        question: 'তোমার বাবার পেশা কী?',
        space_level: 'short',
        marks: 1,
      },
    ],
  },
}

// Map template category → PaperEditor question type
const CATEGORY_TYPE_MAP = {
  parent_passage: 'parent_passage',
  creative_cq: 'cq',
  science_scenario: 'parent_passage',
  column_matching: 'column_matching',
  three_col_matching: 'column_matching',
  image_matching: 'column_matching',
  visual_compare: 'visual_grid',
  visual_math: 'visual_grid',
  tracing: 'standard_text',
  number_line: 'standard_text',
  geometry: 'standard_text',
  graph_chart: 'standard_text',
  inline_boxes: 'standard_text',
  math_vertical: 'standard_text',
  wh_questions: 'standard_text',
  dot_line: 'standard_text',
  notebook_ruled: 'standard_text',
  mcq_grid: 'mcq',
  general_question: 'standard_text',
}

export default function PrimaryTemplatesModal({ onClose }) {
  const addQuestion = usePaperStore((s) => s.addQuestion)

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [addedIds, setAddedIds] = useState(new Set())

  // Get current category data
  const categoryData = selectedCategory ? PRIMARY_TEMPLATES[selectedCategory] : null

  // Asset emoji mapping
  const assetEmojis = {
    apple: '🍎', banana: '🍌', orange: '🍊', mango: '🥭',
    star: '⭐', circle: '⚪', square: '⬜', triangle: '🔺',
    rectangle: '▬', cat: '🐱', dog: '🐕', bird: '🐦',
    book: '📖', pencil: '✏️', bag: '🎒', sun: '☀️',
    moon: '🌙', flower: '🌸', tree: '🌲',
  }

  const getEmoji = (key) => assetEmojis[key] || '❓'

  // Generate unique ID for tracking
  const getQuestionId = (category, index) => `${category}-${index}`

  // Add single question
  const handleAddOne = (template) => {
    const editorType = CATEGORY_TYPE_MAP[selectedCategory] || selectedCategory
    const q = { ...template, type: editorType, id: Date.now() }
    addQuestion(q)
    const id = getQuestionId(selectedCategory, PRIMARY_TEMPLATES[selectedCategory].questions.indexOf(template))
    setAddedIds((prev) => new Set(prev).add(id))
    toast.success('প্রশ্ন যোগ হয়েছে!')
  }

  // Add all from category
  const handleAddAll = () => {
    if (!categoryData) return
    const editorType = CATEGORY_TYPE_MAP[selectedCategory] || selectedCategory
    categoryData.questions.forEach((q, i) => {
      const question = { ...q, type: editorType, id: Date.now() + i }
      addQuestion(question)
    })
    const allIds = categoryData.questions.map((_, i) => getQuestionId(selectedCategory, i))
    setAddedIds((prev) => new Set([...prev, ...allIds]))
    toast.success(`${categoryData.questions.length}টি প্রশ্ন যোগ হয়েছে!`)
  }

  // Reset when category changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId)
    setAddedIds(new Set())
  }

  // Back to categories
  const handleBack = () => {
    setSelectedCategory(null)
    setAddedIds(new Set())
  }

  // Render preview for a question based on its category
  const renderPreview = (q, category) => {
    // Passage / CQ / Science
    if (q.passage_body || q.stimulus) {
      const text = q.passage_body || q.stimulus
      return (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 11, fontStyle: 'italic', color: '#475569', lineHeight: 1.6, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
            "{text.substring(0, 120)}..."
          </p>
          {q.sub_questions && (
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
              {q.sub_questions.length}টি উপ-প্রশ্ন
            </div>
          )}
          {q.subs && (
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
              {q.subs.length}টি উপ-প্রশ্ন (ক খ গ ঘ)
            </div>
          )}
        </div>
      )
    }

    // Visual Grid / Math
    if (q.left_asset || q.right_asset) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '8px 0' }}>
          <span style={{ fontSize: 20 }}>{getEmoji(q.left_asset)}</span>
          <span style={{ fontSize: 12 }}>×{q.left_count}</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{q.operator === 'compare' ? '?' : q.operator}</span>
          <span style={{ fontSize: 20 }}>{getEmoji(q.right_asset)}</span>
          <span style={{ fontSize: 12 }}>×{q.right_count}</span>
        </div>
      )
    }

    // Column Matching (2 or 3 col)
    if (q.pairs) {
      const hasColC = q.pairs.some(p => p.column_c)
      return (
        <div style={{ marginTop: 8 }}>
          {q.pairs.slice(0, 3).map((pair, pi) => (
            <div key={pi} style={{ display: 'flex', gap: 12, fontSize: 11, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, minWidth: 80 }}>{pair.column_a}</span>
              <span style={{ color: '#94a3b8' }}>⟷</span>
              {hasColC && <span style={{ minWidth: 80, color: '#059669' }}>{pair.column_c}</span>}
              {hasColC && <span style={{ color: '#94a3b8' }}>⟷</span>}
              <span style={{ minWidth: 80 }}>{pair.column_b}</span>
            </div>
          ))}
          {q.pairs.length > 3 && (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>+{q.pairs.length - 3}টি আরও...</span>
          )}
        </div>
      )
    }

    // MCQ
    if (q.options) {
      return (
        <div style={{ marginTop: 8 }}>
          {q.options.map((opt, oi) => (
            <div key={oi} style={{ display: 'flex', gap: 6, fontSize: 11, marginBottom: 2 }}>
              <span style={{
                fontWeight: 700,
                color: opt.key === q.correct ? '#16a34a' : '#64748b',
              }}>
                {opt.key}.
              </span>
              <span style={{ color: opt.key === q.correct ? '#16a34a' : '#64748b' }}>
                {opt.text}
              </span>
              {opt.key === q.correct && <span style={{ color: '#16a34a', fontSize: 10 }}>✓</span>}
            </div>
          ))}
        </div>
      )
    }

    // Tracing
    if (q.question === 'tracing') {
      return (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {(q.tracing_chars || []).map((ch, i) => (
            <span key={i} style={{
              width: 36, height: 36, border: '1.5px solid #fecaca', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#ef4444', background: '#fff5f5',
            }}>
              {ch}
            </span>
          ))}
        </div>
      )
    }

    // Number Line
    if (q.question === 'number_line') {
      return (
        <div style={{ marginTop: 8, fontSize: 11, color: '#16a34a' }}>
          {q.nl_start} → {q.nl_end} ({q.nl_jumps?.length || 0}টি খালি ঘর)
        </div>
      )
    }

    // Standard text / General question
    if (q.question) {
      return (
        <div style={{ marginTop: 8, fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
          {q.question.length > 100 ? q.question.substring(0, 100) + '...' : q.question}
        </div>
      )
    }

    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: 640,
            maxHeight: '90vh',
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="sm:rounded-[24px]"
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px 12px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {selectedCategory && (
                <button
                  onClick={handleBack}
                  className="btn-press"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <span style={{ fontSize: 22 }}>{categoryData?.icon || '📚'}</span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {categoryData?.name || 'প্রাথমিক টেমপ্লেট'}
                </h3>
                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>
                  {categoryData?.nameEn || 'Readymade questions for primary classes'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {!selectedCategory ? (
              // Category Selection — 3 columns grid
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {Object.values(PRIMARY_TEMPLATES).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className="btn-press"
                    style={{
                      padding: '12px 8px',
                      borderRadius: 14,
                      border: '2px solid',
                      borderColor: cat.color + '40',
                      background: cat.color + '08',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>{cat.icon}</span>
                    <h4 style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', margin: '0 0 2px' }}>
                      {cat.name}
                    </h4>
                    <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>
                      {cat.questions.length}টি
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              // Questions List
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {categoryData.questions.map((q, i) => {
                  const id = getQuestionId(selectedCategory, i)
                  const isAdded = addedIds.has(id)

                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        border: `1px solid ${isAdded ? '#d1fae5' : '#f1f5f9'}`,
                        background: isAdded ? '#f0fdf4' : '#fff',
                      }}
                    >
                      {/* Instruction */}
                      {(q.instruction || q.question) && (
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
                          {q.instruction || q.question?.substring(0, 80)}
                        </p>
                      )}

                      {/* Type-specific preview */}
                      {renderPreview(q, selectedCategory)}

                      {/* Marks & Action */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                          {q.marks || 1} নম্বর
                        </span>
                        {!isAdded ? (
                          <button
                            onClick={() => handleAddOne(q)}
                            className="btn-press"
                            style={{
                              padding: '4px 12px',
                              borderRadius: 8,
                              border: 'none',
                              background: categoryData.color,
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            + যোগ
                          </button>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>
                            ✓ যোগ হয়েছে
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer - Add All */}
          {selectedCategory && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#fafafa',
              }}
            >
              <button
                onClick={handleAddAll}
                className="btn-press"
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: categoryData.color,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                সব যোগ করুন ({categoryData.questions.length}টি)
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}