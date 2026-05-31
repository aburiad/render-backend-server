import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import Spinner from '@/components/shared/Spinner'
import api from '@/services/api'
import usePaperStore from '@/store/paperStore'

import ExamPublishModal from '@/components/paper/ExamPublishModal'
import PaperSetupForm from '@/components/paper/PaperSetupForm'
import BookGenerateModal from '@/components/questions/BookGenerateModal'
import MagicScanModal from '@/components/questions/MagicScanModal'
import QuestionWrapper from '@/components/questions/QuestionWrapper'
import CreditBalance from '@/components/shared/CreditBalance'
import Modal from '@/components/shared/Modal'

import AccountingEditor from '@/components/questions/AccountingEditor'
import BroadEditor from '@/components/questions/BroadEditor'
import CqEditor from '@/components/questions/CqEditor'
import FillBlankEditor from '@/components/questions/FillBlankEditor'
import GenericEditor from '@/components/questions/GenericEditor'
import MatchingEditor from '@/components/questions/MatchingEditor'
import McqEditor from '@/components/questions/McqEditor'
import RearrangingEditor from '@/components/questions/RearrangingEditor'
import SectionDivider from '@/components/questions/SectionDivider'
import ShortEditor from '@/components/questions/ShortEditor'
import TableEditor from '@/components/questions/TableEditor'
import TranslationEditor from '@/components/questions/TranslationEditor'
import {
  computeQuestionNumbers,
  defaultSectionTitle,
  formatQuestionNumber,
} from '@/utils/sectionNumbering'

const QUESTION_TYPES = [
  { type: 'MCQ', label: 'MCQ', icon: 'list_alt', from: '#60a5fa', to: '#2563eb', shadow: 'rgba(59,130,246,0.25)' },
  { type: 'CQ', label: 'সৃজনশীল', icon: 'edit_note', from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(139,92,246,0.25)' },
  { type: 'accounting', label: 'হিসাববিজ্ঞান', icon: 'account_balance_wallet', from: '#fb923c', to: '#ea580c', shadow: 'rgba(249,115,22,0.25)' },
  { type: 'short', label: 'সংক্ষিপ্ত', icon: 'short_text', from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.25)' },
  { type: 'broad', label: 'রচনামূলক', icon: 'article', from: '#22d3ee', to: '#0891b2', shadow: 'rgba(6,182,212,0.25)' },
  { type: 'fill_blank', label: 'শূন্যস্থান', icon: 'horizontal_rule', from: '#f472b6', to: '#db2777', shadow: 'rgba(236,72,153,0.25)' },
  { type: 'matching', label: 'মিলকরণ', icon: 'join_inner', from: '#f87171', to: '#dc2626', shadow: 'rgba(248,113,113,0.25)' },
  { type: 'rearranging', label: 'পুনর্বিন্যাস', icon: 'low_priority', from: '#2dd4bf', to: '#0d9488', shadow: 'rgba(20,184,166,0.25)' },
  { type: 'translation', label: 'অনুবাদ', icon: 'translate', from: '#818cf8', to: '#4f46e5', shadow: 'rgba(99,102,241,0.25)' },
  { type: 'table', label: 'টেবিল', icon: 'table_chart', from: '#94a3b8', to: '#475569', shadow: 'rgba(100,116,139,0.25)' },
  { type: 'short_question', label: 'সংক্ষিপ্ত প্রশ্ন', icon: 'qr_code_scanner', from: '#38bdf8', to: '#0284c7', shadow: 'rgba(14,165,233,0.25)' },
  { type: 'one_word', label: 'এক কথায়', icon: 'chat_bubble', from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(168,85,247,0.25)' },
  { type: 'essay', label: 'প্রবন্ধ', icon: 'history_edu', from: '#fb7185', to: '#e11d48', shadow: 'rgba(225,29,72,0.25)' },
  { type: 'paragraph', label: 'অনুচ্ছেদ', icon: 'format_align_left', from: '#34d399', to: '#047857', shadow: 'rgba(5,150,105,0.25)' },
  { type: 'letter', label: 'চিঠি', icon: 'mail', from: '#3b82f6', to: '#4338ca', shadow: 'rgba(37,99,235,0.25)' },
  { type: 'dialogue', label: 'কথোপকথন', icon: 'forum', from: '#a78bfa', to: '#6d28d9', shadow: 'rgba(124,58,237,0.25)' },
  { type: 'grammar', label: 'ব্যাকরণ', icon: 'spellcheck', from: '#f472b6', to: '#be185d', shadow: 'rgba(219,39,119,0.25)' },
  { type: 'math', label: 'গণিত', icon: 'calculate', from: '#fb923c', to: '#c2410c', shadow: 'rgba(234,88,12,0.25)' },
  { type: 'finance', label: 'ফিন্যান্স', icon: 'payments', from: '#22d3ee', to: '#0e7490', shadow: 'rgba(8,145,178,0.25)' },
  { type: 'diagram_question', label: 'চিত্রভিত্তিক', icon: 'image', from: '#a3e635', to: '#4d7c0f', shadow: 'rgba(101,163,13,0.25)' },
  { type: 'arabic', label: 'আরবি', icon: 'auto_stories', from: '#2dd4bf', to: '#0f766e', shadow: 'rgba(13,148,136,0.25)' },
  { type: 'hifz', label: 'হিফজ', icon: 'menu_book', from: '#22c55e', to: '#15803d', shadow: 'rgba(22,163,74,0.25)' },
  { type: 'hadith', label: 'হাদীস', icon: 'book_4', from: '#fbbf24', to: '#b45309', shadow: 'rgba(180,83,9,0.25)' },
  { type: 'ebtedayi', label: 'মাসআলা', icon: 'quiz', from: '#60a5fa', to: '#1d4ed8', shadow: 'rgba(29,78,216,0.25)' },
  { type: 'poem', label: 'মূলভাব', icon: 'auto_awesome', from: '#c084fc', to: '#7e22ce', shadow: 'rgba(147,51,234,0.25)' },
  { type: 'passage', label: 'প্যাসেজ', icon: 'chrome_reader_mode', from: '#38bdf8', to: '#0369a1', shadow: 'rgba(2,132,199,0.25)' },
  { type: 'true_false', label: 'সত্য/মিথ্যা', icon: 'check_circle', from: '#4ade80', to: '#15803d', shadow: 'rgba(21,128,61,0.25)' },
]

const PRIMARY_TYPES = QUESTION_TYPES.slice(0, 4) // MCQ, সৃজনশীল, হিসাববিজ্ঞান, সংক্ষিপ্ত
const MORE_TYPES = QUESTION_TYPES.slice(4)

const EDITOR_MAP = {
  MCQ: McqEditor,
  CQ: CqEditor,
  accounting: AccountingEditor,
  short: ShortEditor,
  broad: BroadEditor,
  fill_blank: FillBlankEditor,
  matching: MatchingEditor,
  rearranging: RearrangingEditor,
  translation: TranslationEditor,
  table: TableEditor,
  short_question: GenericEditor,
  one_word: GenericEditor,
  essay: GenericEditor,
  paragraph: GenericEditor,
  letter: GenericEditor,
  dialogue: GenericEditor,
  grammar: GenericEditor,
  math: GenericEditor,
  finance: GenericEditor,
  diagram_question: GenericEditor,
  arabic: GenericEditor,
  hifz: GenericEditor,
  hadith: GenericEditor,
  ebtedayi: GenericEditor,
  poem: GenericEditor,
  passage: GenericEditor,
  true_false: GenericEditor,
}

function SortableQuestion({ question, index, displayNumber, questionDirection = 'ltr' }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  // Section dividers render outside QuestionWrapper — they're not questions.
  if (question.type === 'section') {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <SectionDivider question={question} dragHandleProps={listeners} />
      </div>
    )
  }

  const Editor = EDITOR_MAP[question.type]

  if (!Editor) return null

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <QuestionWrapper
        question={question}
        index={index}
        displayNumber={displayNumber}
        questionDirection={questionDirection}
        dragHandleProps={listeners}
      >
        <Editor question={question} />
      </QuestionWrapper>
    </div>
  )
}

export default function PaperEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showMagicScan, setShowMagicScan] = useState(false)
  const [showBookGenerate, setShowBookGenerate] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showMoreTypes, setShowMoreTypes] = useState(false)
  const [quickPrompt, setQuickPrompt] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickProgress, setQuickProgress] = useState(null) // { chapter, type, total, done }

  const currentPaper = usePaperStore((s) => s.currentPaper)
  const questions = usePaperStore((s) => s.questions)
  const isDirty = usePaperStore((s) => s.isDirty)
  const setPaper = usePaperStore((s) => s.setPaper)
  const updatePaper = usePaperStore((s) => s.updatePaper)
  const addQuestion = usePaperStore((s) => s.addQuestion)
  const reorderQuestions = usePaperStore((s) => s.reorderQuestions)
  const clearPaper = usePaperStore((s) => s.clearPaper)
  const markClean = usePaperStore((s) => s.markClean)
  const getTotalMarks = usePaperStore((s) => s.getTotalMarks)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    if (id && id !== 'new') {
      loadPaper(id)
    } else {
      if (currentPaper?.id) {
        clearPaper()
      }
      if (!usePaperStore.getState().currentPaper) {
        const currentYear = new Date().getFullYear()
        const toBengaliNum = (n) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d])
        setPaper({
          institution_name: '',
          exam_title: '',
          session_year: toBengaliNum(currentYear),
          subject: '',
          time_minutes: 60,
          total_marks: 100,
          header_alignment: 'center',
          layout: '1-column',
          watermark: null,
          set_variant: null,
          logo_url: null,
          print_settings: { questionNumbering: 'en', questionDirection: 'ltr', labelLanguage: 'bn' },
          questions: [],
        })
      }
    }
  }, [id])

  async function loadPaper(paperId) {
    setLoading(true)
    try {
      const { data } = await api.get(`/papers/${paperId}`)
      setPaper(data.paper)
    } catch {
      toast.error('প্রশ্নপত্র লোড করতে ব্যর্থ')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const saveToBackend = useCallback(async () => {
    const state = usePaperStore.getState()
    if (!state.isDirty || saving) return

    const paper = state.currentPaper
    const qs = state.questions

    if (!paper?.exam_title?.trim()) {
      return
    }

    setSaving(true)
    try {
      const payload = { ...paper, questions: qs }
      if (paper?.id) {
        const { data } = await api.put(`/papers/${paper.id}`, payload)
        updatePaper(data.paper)
      } else {
        const { data } = await api.post('/papers', payload)
        setPaper(data.paper)
        window.history.replaceState(null, '', `/papers/${data.paper.id}`)
      }
      markClean()
    } catch (err) {
      console.error('Save failed:', err.message)
    } finally {
      setSaving(false)
    }
  }, [saving])

  // Auto-save disabled - uncomment to enable
  // useEffect(() => {
  //   if (isDirty) {
  //     const timer = setTimeout(saveToBackend, 5000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [isDirty, saveToBackend])

  const handleAddQuestion = (type) => {
    const defaults = { type, section: '' }
    if (type === 'section') {
      const existingSections = questions.filter((q) => q?.type === 'section').length
      Object.assign(defaults, {
        title: defaultSectionTitle(existingSections),
        instruction: '',
      })
    } else if (type === 'MCQ') {
      Object.assign(defaults, { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: null, marks: 1 })
    } else if (type === 'CQ') {
      Object.assign(defaults, { stimulus: '', sub_questions: [{ label: 'ক', text: '', marks: 0 }, { label: 'খ', text: '', marks: 0 }, { label: 'গ', text: '', marks: 0 }, { label: 'ঘ', text: '', marks: 0 }] })
    } else if (type === 'fill_blank') {
      Object.assign(defaults, { sentence: '', clues: '', marks: 1 })
    } else if (type === 'matching') {
      Object.assign(defaults, { question: '', column_a: ['', '', '', ''], column_b: ['', '', '', ''], marks: 1 })
    } else if (type === 'rearranging') {
      Object.assign(defaults, { question: '', sentences: ['', '', '', ''], correct_order: [], marks: 1 })
    } else if (type === 'translation') {
      Object.assign(defaults, { source_text: '', direction: 'bn-en', marks: 5 })
    } else if (type === 'table') {
      Object.assign(defaults, { question: '', headers: ['', '', ''], rows: [['', '', ''], ['', '', '']], accounting_type: false, marks: 5 })
    } else if (type === 'accounting') {
      Object.assign(defaults, {
        description: 'শাপলু এন্ড কোং-এর ২০১৬ সালের ৩০ জুন তারিখের রেওয়ামিলটি নিম্নরূপ:',
        title_lines: ['শাপলু এন্ড কোং', 'রেওয়ামিল', '৩০ জুন ২০১৬ খ্রি.'],
        headers: ['হিসাবের নাম', 'ডেবিট (টাকা)', 'ক্রেডিট (টাকা)'],
        alignments: ['left', 'right', 'right'],
        rows: [
          ['ক্রয় ও বিক্রয়', '৮০,০০০', '১,৬৯,০০০'],
          ['ফেরত', '৭,০০০', '৬,০০০'],
          ['পরিবহন', '৮,০০০', ''],
          ['কুঋণ ও কুঋণ সঞ্চিতি', '২,০০০', '৩,৫০০'],
          ['উপভাড়া', '', '২২,০০০'],
          ['বেতন', '১৭,৫০০', ''],
          ['শুল্ক', '১২,০০০', ''],
          ['দেনাদার ও পাওনাদার', '৭৫,৫০০', '২০,০০০'],
          ['মনিহারি', '৩,৫০০', ''],
          ['কমিশন', '২,০০০', '৫,০০০'],
          ['মজুদ পণ্য (০১.০৭.২০১৫)', '১৫,৫০০', ''],
          ['বিজ্ঞাপন', '২,৫০০', ''],
        ],
        show_total: true,
        total_row: ['মোট', '২,২৫,৫০০', '২,২৫,৫০০'],
        notes_label: 'সমন্বয়সমূহ',
        notes: '১. সমাপনী মজুদ পণ্য ৩৫,০০০ টাকা। ২. দেনাদারের ২,৫০০ টাকা আদায়যোগ্য নয়। ৩. ভোক্তাদের নিকট বিনামূল্যে পণ্য বিতরণ ২,০০০ টাকা হিসাবভুক্ত হয়নি। ৪. বেতন বকেয়া আছে ৫,০০০ টাকা।',
        sub_questions: [
          { label: 'ক', text: 'শাপলু এন্ড কোং-এর চলতি দায়ের পরিমাণ নির্ণয় করো।', marks: 2 },
          { label: 'খ', text: 'শাপলু এন্ড কোং-এর মোট মুনাফা বা ক্ষতির পরিমাণ নির্ণয় করো।', marks: 4 },
          { label: 'গ', text: 'শাপলু এন্ড কোং-এর পরিচালন মুনাফা নির্ণয় করো।', marks: 4 },
        ],
      })
    } else if (type === 'short_question') {
      Object.assign(defaults, { question: '', marks: 2 })
    } else if (type === 'one_word') {
      Object.assign(defaults, { question: '', answer: '', marks: 1 })
    } else if (type === 'essay') {
      Object.assign(defaults, { topic: '', word_limit: 500, marks: 10 })
    } else if (type === 'paragraph') {
      Object.assign(defaults, { topic: '', hints: [], marks: 5 })
    } else if (type === 'letter') {
      Object.assign(defaults, { subtype: 'application', scenario: '', marks: 8 })
    } else if (type === 'dialogue') {
      Object.assign(defaults, { scenario: '', turns: 6, marks: 5 })
    } else if (type === 'grammar') {
      Object.assign(defaults, { sentence: '', instruction: '', answer: '', marks: 1 })
    } else if (type === 'math') {
      Object.assign(defaults, { question: '', equations: [], answer: '', marks: 5 })
    } else if (type === 'finance') {
      Object.assign(defaults, { question: '', formula: '', values: {}, marks: 5 })
    } else if (type === 'diagram_question') {
      Object.assign(defaults, { diagram_ref: '', labels: [], question: '', marks: 5 })
    } else if (type === 'arabic') {
      Object.assign(defaults, { subtype: 'ayat', arabic_text: '', source: '', instruction: 'অনুবাদ করো:', bangla_translation: '', marks: 5 })
    } else if (type === 'hifz') {
      Object.assign(defaults, { prompt: '', surah_name: '', arabic_text: '', zero_hallucination: true, verify_against: 'quran_corpus', marks: 5 })
    } else if (type === 'hadith') {
      Object.assign(defaults, { arabic_text: '', source: '', bangla_text: '', instruction: 'অনুবাদ ও ব্যাখ্যা করো:', marks: 5 })
    } else if (type === 'ebtedayi') {
      Object.assign(defaults, { masala_number: 1, arabic_block: '', bangla_block: '', instruction: 'অনুবাদ ও মাসআলা বিশ্লেষণ করো:', marks: 5 })
    } else if (type === 'poem') {
      Object.assign(defaults, { lines: [], author: '', instruction: 'কবিতাংশটির মূলভাব লিখুন:', marks: 5 })
    } else if (type === 'passage') {
      Object.assign(defaults, { passage: '', questions: [{ no: 1, text: '', marks: 2 }] })
    } else if (type === 'true_false') {
      Object.assign(defaults, { statements: [{ text: '', answer: true }], marks: 5 })
    } else {
      Object.assign(defaults, { question: '', marks: 1 })
    }

    addQuestion(defaults)
    setShowAddMenu(false)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)
    reorderQuestions(arrayMove(questions, oldIndex, newIndex))
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('scan') === 'true') {
      setShowMagicScan(true)
      const newUrl = location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [location.search, location.pathname])

  const handleManualSave = async () => {
    const state = usePaperStore.getState()
    if (!state.currentPaper?.exam_title?.trim()) {
      toast.error('⚠️ পরীক্ষার নাম দিন — Paper Setup থেকে ফিল করুন')
      return
    }
    await saveToBackend()
    if (!usePaperStore.getState().isDirty) {
      toast.success('সেভ হয়েছে!')
    }
  }

  // Helper: convert class number to Bengali display format
  const toBengaliClass = (num) => {
    const map = { 6: '৬ম', 7: '৭ম', 8: '৮ম', 9: '৯ম', 10: '১০ম' }
    return map[num] || (num ? `${num}ম` : '')
  }

  // Helper: convert English subject key to Bengali display name
  const toBengaliSubject = (key) => {
    const map = {
      bangla: 'বাংলা', english: 'ইংরেজি', math: 'গণিত', science: 'বিজ্ঞান',
      accounting: 'হিসাববিজ্ঞান', physics: 'পদার্থবিজ্ঞান', chemistry: 'রসায়ন',
      biology: 'জীববিজ্ঞান', ict: 'তথ্য ও যোগাযোগ প্রযুক্তি',
      bgs: 'বাংলাদেশ ও বিশ্বপরিচয়', religion: 'ধর্ম', islam: 'ইসলাম',
    }
    return map[key?.toLowerCase()] || key || ''
  }

  const handleQuickPrompt = async () => {
    if (!quickPrompt.trim() || quickLoading) return
    setQuickLoading(true)
    setQuickProgress({ step: 'parsing', message: 'প্রম্পট বিশ্লেষণ করা হচ্ছে...' })
    try {
      const { data } = await api.post('/book/smart-prompt', { prompt: quickPrompt.trim() }, { timeout: 60_000 })
      
      // Filter out empty questions
      const validQuestions = (data.questions || []).filter(q => {
        const hasContent = q.type === 'MCQ' ? q.question?.trim() :
                          q.type === 'CQ' ? (q.question?.trim() || q.stimulus?.trim()) :
                          q.question?.trim()
        return hasContent
      })
      
      window.dispatchEvent(new CustomEvent('credits-changed'))
      
      if (validQuestions.length === 0) {
        toast.error('প্রশ্ন তৈরি করতে ব্যর্থ। AI rate limit পার হয়ে গেছে। ১-২ মিনিট পর আবার চেষ্টা করুন।')
      } else {
        validQuestions.forEach(q => addQuestion(q))
        const dbCount = data.dbCount || 0
        const aiCount = data.aiCount || 0
        if (aiCount > 0) {
          toast.success(`📚 ${dbCount}টি + 🤖 ${aiCount}টি = ${data.count}টি প্রশ্ন যোগ হয়েছে`)
        } else {
          toast.success(`${validQuestions.length}টি প্রশ্ন যোগ হয়েছে`)
        }

        // Auto-fill paper setup from parsed prompt data
        if (data.parsed) {
          const updates = {}
          if (data.parsed.class && !currentPaper?.class_name?.trim()) {
            updates.class_name = toBengaliClass(data.parsed.class)
          }
          if (data.parsed.subject && !currentPaper?.subject?.trim()) {
            updates.subject = toBengaliSubject(data.parsed.subject)
          }
          if (Object.keys(updates).length > 0) {
            updatePaper(updates)
          }
        }

        setQuickPrompt('')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'প্রশ্ন তৈরি করতে ব্যর্থ')
    } finally {
      setQuickLoading(false)
      setQuickProgress(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
      </div>
    )
  }

  const totalMarks = getTotalMarks()
  const targetMarks = currentPaper?.total_marks || 0
  const marksMatch = targetMarks === 0 || totalMarks === targetMarks

  return (
    <>
      {/* ── Full-screen Loading Overlay for Smart Prompt ────────────────────── */}
      <AnimatePresence>
        {quickLoading && quickProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <Spinner size={48} color="#7c3aed" />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
                {quickProgress.message}
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                দয়া করে অপেক্ষা করুন, প্রশ্ন তৈরি হচ্ছে...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* ── Top Bar (Desktop Only) /*─────────────────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between mb-5">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>ড্যাশবোর্ড</span>
          </button>
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {id ? 'সম্পাদনা' : 'নতুন পেপার'}
          </h1>
          <span style={{ fontSize: 10, fontWeight: 700, color: isDirty ? '#3b82f6' : '#10b981' }}>
            {isDirty ? (saving ? '• সেভ হচ্ছে' : '• পরিবর্তন আছে') : '• সব সেভ আছে'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <CreditBalance compact showTopUp />
          <button onClick={handleManualSave} disabled={!isDirty || saving} className="btn-press" style={{
            padding: '8px 12px', background: isDirty ? '#2563eb' : '#f1f5f9', color: isDirty ? '#fff' : '#cbd5e1',
            borderRadius: 12, fontSize: 11, fontWeight: 900, border: 'none', boxShadow: isDirty ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
          }}>সেভ</button>
        </div>
      </div>


      {/* ── Main Content ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PaperSetupForm />

        {/* Floating/Fixed Summary Bar */}
        {(questions.length > 0 || currentPaper?.id) && (
          <div style={{
            background: '#fff', padding: '6px 10px', borderRadius: 100,
            border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'nowrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: marksMatch ? '#ecfdf5' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={marksMatch ? '#10b981' : '#f59e0b'} strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={marksMatch ? "M4.5 12.75l6 6 9-13.5" : "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"} />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap' }}>
                {totalMarks}/{targetMarks || '—'} নম্বর
              </span>
              <span className="lg:hidden" style={{ fontSize: 9, fontWeight: 700, color: isDirty ? '#3b82f6' : '#10b981', flexShrink: 0 }}>
                {isDirty ? (saving ? 'সেভ…' : '• Unsaved') : '✓'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {currentPaper?.id && (
                <>
                  <button onClick={() => navigate(`/papers/${currentPaper.id}/preview`)} className="btn-press" style={{ padding: '4px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontSize: 9, fontWeight: 800, border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>PDF Link</button>
                  <button onClick={() => setShowPublishModal(true)} className="btn-press" style={{ padding: '4px 8px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '8px', fontSize: 9, fontWeight: 800, border: '1px solid #ddd6fe', whiteSpace: 'nowrap' }}>Publish</button>
                </>
              )}
              <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>{questions.length} প্রশ্ন</span>
            </div>
          </div>
        )}

        {/* Section mode toggle — small chip; disabled mode just filters
            section dividers from view, data is preserved. */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: '8px 14px',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📑</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>সেকশন মোড</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>
                {currentPaper?.section_mode
                  ? 'বিভাগ অনুযায়ী প্রশ্ন নম্বরিং রিসেট হবে'
                  : 'সব প্রশ্ন এক ধারাবাহিকতায় থাকবে'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updatePaper({ section_mode: !currentPaper?.section_mode })}
            className="btn-press"
            style={{
              position: 'relative',
              width: 44,
              height: 24,
              borderRadius: 999,
              border: 'none',
              background: currentPaper?.section_mode ? '#10b981' : '#e2e8f0',
              transition: 'background 0.2s',
              cursor: 'pointer',
            }}
            aria-label="সেকশন মোড টগল"
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: currentPaper?.section_mode ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>

        {/* DnD Questions — section dividers hidden when section mode off */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={(currentPaper?.section_mode
              ? questions
              : questions.filter((q) => q?.type !== 'section')
            ).map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 sm:gap-3.5">
              <AnimatePresence>
                {(() => {
                  const sectionMode = !!currentPaper?.section_mode
                  const visible = sectionMode
                    ? questions
                    : questions.filter((q) => q?.type !== 'section')
                  const numbers = computeQuestionNumbers(visible, sectionMode)
                  const numberingStyle = currentPaper?.print_settings?.questionNumbering || 'en'
                  const questionDirection = currentPaper?.print_settings?.questionDirection || 'ltr'
                  return visible.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                    >
                      <SortableQuestion
                        question={q}
                        index={i}
                        displayNumber={formatQuestionNumber(numbers[i], numberingStyle)}
                        questionDirection={questionDirection}
                      />
                    </motion.div>
                  ))
                })()}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>

        {questions.length === 0 && (
          <div style={{ padding: '32px 20px', background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9' }}>
            {/* Smart Prompt Hero */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>কী প্রশ্ন চান? লিখে বলুন</h3>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>বাংলা বা ইংরেজিতে লিখুন — AI বুঝে নেবে</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickPrompt()}
                placeholder="যেমন: ক্লাস ৯ গণিত ২য় অধ্যায় থেকে ১০টা MCQ দাও"
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0',
                  fontSize: 13, fontWeight: 500, outline: 'none', background: '#f8fafc',
                }}
              />
              <button
                onClick={handleQuickPrompt}
                disabled={!quickPrompt.trim() || quickLoading}
                className="btn-press"
                style={{
                  padding: '12px 20px', borderRadius: 14, border: 'none',
                  background: quickPrompt.trim() ? '#7c3aed' : '#e2e8f0',
                  color: quickPrompt.trim() ? '#fff' : '#94a3b8',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: quickPrompt.trim() ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {quickLoading ? <Spinner size={14} color="#fff" /> : 'বানাও ✨'}
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: '#cbd5e1', margin: 0 }}>
                💡 উদাহরণ: "class 8 science chapter 3 theke 5ta creative question"
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#cbd5e1' }}>অন্য উপায়</span>
              <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                onClick={() => { setShowMagicScan(true) }}
                className="btn-press"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 8px', borderRadius: 16, background: '#eff6ff', border: '1px solid #bfdbfe', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 22 }}>📷</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af' }}>ছবি স্ক্যান</span>
              </button>
              <button
                onClick={() => { setShowBookGenerate(true) }}
                className="btn-press"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 8px', borderRadius: 16, background: '#ecfdf5', border: '1px solid #a7f3d0', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 22 }}>📚</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46' }}>বই থেকে</span>
              </button>
              <button
                onClick={() => { setShowAddMenu(true) }}
                className="btn-press"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 8px', borderRadius: 16, background: '#fefce8', border: '1px solid #fde68a', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 22 }}>✏️</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#854d0e' }}>নিজে লিখুন</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Question FAB ───────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 100, right: 20, zIndex: 45 }}>
        <button
          onClick={() => setShowAddMenu(true)}
          className="btn-press"
          style={{
            width: 46, height: 46, borderRadius: 14, background: '#2563eb',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 14px rgba(37,99,235,0.3)', border: 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* ── Save FAB (Mobile Only) ─────────────────────────── */}
      <button
        onClick={handleManualSave}
        disabled={!isDirty || saving}
        className="btn-press lg:hidden"
        style={{
          position: 'fixed', bottom: 156, right: 20, zIndex: 45,
          padding: '8px 16px', borderRadius: 999,
          background: saving ? '#94a3b8' : (isDirty ? '#10b981' : '#cbd5e1'),
          color: '#fff', border: 'none', fontSize: 12, fontWeight: 800,
          boxShadow: isDirty ? '0 6px 14px rgba(16,185,129,0.3)' : '0 3px 8px rgba(0,0,0,0.08)',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
      >
        {saving ? 'সেভ হচ্ছে…' : 'সেভ'}
      </button>

      <Modal isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} title="প্রশ্ন যোগ করুন">
        <div className="grid grid-cols-1 gap-2 sm:gap-2.5 py-1.5 sm:py-2.5">
          <button
            onClick={() => { setShowAddMenu(false); setShowMagicScan(true); }}
            className="btn-press w-full flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-left"
            style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: '1px solid #bfdbfe',
            }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-blue-900 m-0">AI ম্যাজিক স্ক্যান</p>
              <p className="text-[10px] sm:text-[11px] text-blue-400 m-0 truncate">ছবি থেকে অটো প্রশ্ন তৈরি</p>
            </div>
          </button>

          <button
            onClick={() => { setShowAddMenu(false); setShowBookGenerate(true); }}
            className="btn-press w-full flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-left"
            style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}
          >
            <span className="text-base sm:text-xl">📚</span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold m-0" style={{ color: '#065f46' }}>বই থেকে</p>
              <p className="text-[10px] sm:text-[11px] m-0" style={{ color: '#059669' }}>বই অনুযায়ী প্রশ্ন তৈরি</p>
            </div>
          </button>

          <div className="h-px bg-slate-100 my-0.5 sm:my-1" />

          <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase pl-1">ম্যানুয়ালি যোগ করুন</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 pb-2">
            {currentPaper?.section_mode && (
              <button
                onClick={() => handleAddQuestion('section')}
                className="btn-press flex flex-col items-center justify-center py-1.5 px-1 sm:py-3 sm:px-1.5 gap-0.5 sm:gap-1.5 rounded-lg sm:rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #334155)',
                  border: '1px solid #334155',
                  color: '#fff',
                }}
              >
                <span className="text-[13px] sm:text-lg leading-none">📑</span>
                <span className="text-[10px] sm:text-[9px] font-bold leading-tight" style={{ color: '#fbbf24' }}>বিভাগ</span>
              </button>
            )}
            {PRIMARY_TYPES.map(qt => (
              <button
                key={qt.type}
                onClick={() => handleAddQuestion(qt.type)}
                className="btn-press flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${qt.from}, ${qt.to})`,
                    boxShadow: `0 4px 14px ${qt.shadow}`,
                  }}
                >
                  <span className="material-symbols-outlined text-white text-xl sm:text-3xl leading-none">{qt.icon}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-tight text-center">
                  {qt.label}
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowMoreTypes(!showMoreTypes)}
              className="btn-press flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: showMoreTypes ? 'linear-gradient(145deg, #94a3b8, #64748b)' : 'linear-gradient(145deg, #38bdf8, #0284c7)',
                  boxShadow: showMoreTypes ? '0 4px 14px rgba(100,116,139,0.25)' : '0 4px 14px rgba(14,165,233,0.25)',
                }}
              >
                <span className="material-symbols-outlined text-white text-xl sm:text-3xl leading-none">{showMoreTypes ? 'expand_less' : 'more_horiz'}</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-tight text-center">
                {showMoreTypes ? 'কম' : 'আরও'}
              </span>
            </button>
            {showMoreTypes && MORE_TYPES.map(qt => (
              <button
                key={qt.type}
                onClick={() => handleAddQuestion(qt.type)}
                className="btn-press flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${qt.from}, ${qt.to})`,
                    boxShadow: `0 4px 14px ${qt.shadow}`,
                  }}
                >
                  <span className="material-symbols-outlined text-white text-xl sm:text-3xl leading-none">{qt.icon}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-tight text-center">
                  {qt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modals */}
      {showMagicScan && <MagicScanModal onClose={() => setShowMagicScan(false)} />}
      {showBookGenerate && <BookGenerateModal onClose={() => setShowBookGenerate(false)} />}
      {showPublishModal && <ExamPublishModal paperId={id} onClose={() => setShowPublishModal(false)} />}
    </>
  )
}
