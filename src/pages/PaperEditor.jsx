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

import api from '@/services/api'
import usePaperStore from '@/store/paperStore'
import usePaperListStore from '@/store/paperListStore'

import ExamPublishModal from '@/components/paper/ExamPublishModal'
import FullPaperTemplatesModal from '@/components/paper/FullPaperTemplatesModal'
import PaperSetupForm from '@/components/paper/PaperSetupForm'
import BoardQuestionModal from '@/components/questions/BoardQuestionModal'
import BookGenerateModal from '@/components/questions/BookGenerateModal'
import MagicScanModal from '@/components/questions/MagicScanModal'
import PrebuiltVaultModal from '@/components/questions/PrebuiltVaultModal'
import PrimaryTemplatesModal from '@/components/questions/PrimaryTemplatesModal'
import QuestionWrapper from '@/components/questions/QuestionWrapper'
import CreditBalance from '@/components/shared/CreditBalance'
import Modal from '@/components/shared/Modal'

import AccountingEditor from '@/components/questions/AccountingEditor'
import BroadEditor from '@/components/questions/BroadEditor'
import ColumnMatchingEditor from '@/components/questions/ColumnMatchingEditor'
import CqEditor from '@/components/questions/CqEditor'
import FillBlankEditor from '@/components/questions/FillBlankEditor'
import GenericEditor from '@/components/questions/GenericEditor'
import MatchingEditor from '@/components/questions/MatchingEditor'
import McqEditor from '@/components/questions/McqEditor'
import ParentPassageEditor from '@/components/questions/ParentPassageEditor'
import { PrimaryTypePreview } from '@/components/questions/PrimaryTypePreview'
import RearrangingEditor from '@/components/questions/RearrangingEditor'
import SectionDivider from '@/components/questions/SectionDivider'
import ShortEditor from '@/components/questions/ShortEditor'
import StandardTextEditor from '@/components/questions/StandardTextEditor'
import TableEditor from '@/components/questions/TableEditor'
import TranslationEditor from '@/components/questions/TranslationEditor'
import VisualGridEditor from '@/components/questions/VisualGridEditor'
import {
  computeQuestionNumbers,
  defaultSectionTitle,
  formatQuestionNumber,
} from '@/utils/sectionNumbering'

const QUESTION_TYPES = [
  { type: 'MCQ', label: 'MCQ', icon: 'list_alt', from: '#4c1d95', to: '#5b21b6', shadow: 'rgba(76,29,149,0.25)' },
  { type: 'CQ', label: 'সৃজনশীল', icon: 'edit_note', from: '#5b21b6', to: '#6d28d9', shadow: 'rgba(91,33,182,0.25)' },
  { type: 'accounting', label: 'হিসাববিজ্ঞান', icon: 'account_balance_wallet', from: '#92400e', to: '#b45309', shadow: 'rgba(146,64,14,0.25)' },
  { type: 'short', label: 'সংক্ষিপ্ত', icon: 'short_text', from: '#065f46', to: '#047857', shadow: 'rgba(6,95,70,0.25)' },
  { type: 'broad', label: 'রচনামূলক', icon: 'article', from: '#0e7490', to: '#155e75', shadow: 'rgba(14,116,144,0.25)' },
  { type: 'fill_blank', label: 'শূন্যস্থান', icon: 'horizontal_rule', from: '#be185d', to: '#9d174d', shadow: 'rgba(190,24,93,0.25)' },
  { type: 'matching', label: 'মিলকরণ', icon: 'join_inner', from: '#b91c1c', to: '#991b1b', shadow: 'rgba(185,28,28,0.25)' },
  { type: 'rearranging', label: 'পুনর্বিন্যাস', icon: 'low_priority', from: '#115e59', to: '#0f766e', shadow: 'rgba(17,94,89,0.25)' },
  { type: 'translation', label: 'অনুবাদ', icon: 'translate', from: '#4338ca', to: '#3730a3', shadow: 'rgba(67,56,202,0.25)' },
  { type: 'table', label: 'টেবিল', icon: 'table_chart', from: '#475569', to: '#334155', shadow: 'rgba(71,85,105,0.25)' },
  { type: 'short_question', label: 'সংক্ষিপ্ত প্রশ্ন', icon: 'qr_code_scanner', from: '#0369a1', to: '#075985', shadow: 'rgba(3,105,161,0.25)' },
  { type: 'one_word', label: 'এক কথায়', icon: 'chat_bubble', from: '#7c3aed', to: '#6d28d9', shadow: 'rgba(124,58,237,0.25)' },
  { type: 'essay', label: 'প্রবন্ধ', icon: 'history_edu', from: '#be123c', to: '#9f1239', shadow: 'rgba(190,18,60,0.25)' },
  { type: 'paragraph', label: 'অনুচ্ছেদ', icon: 'format_align_left', from: '#15803d', to: '#166534', shadow: 'rgba(21,128,61,0.25)' },
  { type: 'letter', label: 'চিঠি', icon: 'mail', from: '#1d4ed8', to: '#1e40af', shadow: 'rgba(29,78,216,0.25)' },
  { type: 'dialogue', label: 'কথোপকথন', icon: 'forum', from: '#6d28d9', to: '#5b21b6', shadow: 'rgba(109,40,217,0.25)' },
  { type: 'grammar', label: 'ব্যাকরণ', icon: 'spellcheck', from: '#a21caf', to: '#86198f', shadow: 'rgba(162,28,175,0.25)' },
  { type: 'math', label: 'গণিত', icon: 'calculate', from: '#c2410c', to: '#9a3412', shadow: 'rgba(194,65,12,0.25)' },
  { type: 'finance', label: 'ফিন্যান্স', icon: 'payments', from: '#0369a1', to: '#0c4a6e', shadow: 'rgba(3,105,161,0.25)' },
  { type: 'diagram_question', label: 'চিত্রভিত্তিক', icon: 'image', from: '#4d7c0f', to: '#3f6212', shadow: 'rgba(77,124,15,0.25)' },
  { type: 'arabic', label: 'আরবি', icon: 'auto_stories', from: '#0f766e', to: '#115e59', shadow: 'rgba(15,118,110,0.25)' },
  { type: 'hifz', label: 'হিফজ', icon: 'menu_book', from: '#166534', to: '#14532d', shadow: 'rgba(22,101,52,0.25)' },
  { type: 'hadith', label: 'হাদীস', icon: 'book_4', from: '#a16207', to: '#854d0e', shadow: 'rgba(161,98,7,0.25)' },
  { type: 'ebtedayi', label: 'মাসআলা', icon: 'quiz', from: '#1d4ed8', to: '#1e3a8a', shadow: 'rgba(29,78,216,0.25)' },
  { type: 'poem', label: 'মূলভাব', icon: 'auto_awesome', from: '#7c3aed', to: '#6b21a8', shadow: 'rgba(124,58,237,0.25)' },
  { type: 'passage', label: 'প্যাসেজ', icon: 'chrome_reader_mode', from: '#0e7490', to: '#164e63', shadow: 'rgba(14,116,144,0.25)' },
  { type: 'true_false', label: 'সত্য/মিথ্যা', icon: 'check_circle', from: '#166534', to: '#14532d', shadow: 'rgba(22,101,52,0.25)' },
  // New Primary Education Types (Nursery - Class 5)
  { type: 'parent_passage', label: 'প্যাসেজভিত্তিক', icon: 'menu_book', from: '#16a34a', to: '#15803d', shadow: 'rgba(22,163,74,0.25)' },
  { type: 'column_matching', label: 'মিলকরণ ২কলাম', icon: 'view_column', from: '#db2777', to: '#be185d', shadow: 'rgba(219,39,119,0.25)' },
  { type: 'visual_grid', label: 'ছবি তুলনা', icon: 'grid_on', from: '#d97706', to: '#b45309', shadow: 'rgba(217,119,6,0.25)' },
  { type: 'standard_text', label: 'শূন্যস্থান', icon: 'text_fields', from: '#0891b2', to: '#0e7490', shadow: 'rgba(8,145,178,0.25)' },
]

const PRIMARY_20_TYPES = [
  { type: 'primary_passage',           label: 'প্যাসেজ/কবিতা',  icon: 'menu_book',         from: '#065f46', to: '#047857', shadow: 'rgba(6,95,70,0.25)' },
  { type: 'primary_cq',                label: 'সৃজনশীল CQ',     icon: 'psychology',        from: '#047857', to: '#059669', shadow: 'rgba(4,120,87,0.25)' },
  { type: 'primary_science_cq',        label: 'বিজ্ঞান/BGS',    icon: 'science',           from: '#059669', to: '#10b981', shadow: 'rgba(5,150,105,0.25)' },
  { type: 'primary_sentence_matching', label: 'বাক্য মিলকরণ',   icon: 'link',              from: '#9d174d', to: '#be185d', shadow: 'rgba(157,23,77,0.25)' },
  { type: 'primary_3col_matching',     label: '৩-কলাম বোর্ড',   icon: 'view_column',       from: '#be185d', to: '#db2777', shadow: 'rgba(190,24,93,0.25)' },
  { type: 'primary_image_matching',    label: 'ছবি মিলকরণ',     icon: 'image',             from: '#db2777', to: '#ec4899', shadow: 'rgba(219,39,119,0.25)' },
  { type: 'primary_comparison',        label: 'তুলনা বক্স',      icon: 'compare',           from: '#92400e', to: '#b45309', shadow: 'rgba(146,64,14,0.25)' },
  { type: 'primary_picture_grid',      label: 'ছবি গ্রিড',       icon: 'grid_on',           from: '#d97706', to: '#f59e0b', shadow: 'rgba(217,119,6,0.25)' },
  { type: 'primary_geometry',          label: 'জ্যামিতি',         icon: 'pentagon',          from: '#0369a1', to: '#0284c7', shadow: 'rgba(3,105,161,0.25)' },
  { type: 'primary_graph',             label: 'গ্রাফ/ছক',         icon: 'bar_chart',         from: '#0284c7', to: '#0ea5e9', shadow: 'rgba(2,132,199,0.25)' },
  { type: 'primary_inline_box',        label: 'ইনলাইন বক্স',     icon: 'space_bar',         from: '#1d4ed8', to: '#2563eb', shadow: 'rgba(29,78,216,0.25)' },
  { type: 'primary_math_vertical',     label: 'ম্যাথ ভার্টিকাল', icon: 'calculate',         from: '#2563eb', to: '#3b82f6', shadow: 'rgba(37,99,235,0.25)' },
  { type: 'primary_wh_question',       label: 'WH প্রশ্ন',        icon: 'format_underlined', from: '#4338ca', to: '#4f46e5', shadow: 'rgba(67,56,202,0.25)' },
  { type: 'primary_dotted_lines',      label: 'ডট লাইন',          icon: 'more_horiz',        from: '#6d28d9', to: '#7c3aed', shadow: 'rgba(109,40,217,0.25)' },
  { type: 'primary_notebook_ruled',    label: 'রুলড লাইন',        icon: 'border_all',        from: '#7c3aed', to: '#8b5cf6', shadow: 'rgba(124,58,237,0.25)' },
  { type: 'primary_mcq_grid',          label: 'MCQ',               icon: 'list_alt',          from: '#4c1d95', to: '#5b21b6', shadow: 'rgba(76,29,149,0.25)' },
  { type: 'primary_plain_text',        label: 'সাধারণ প্রশ্ন',    icon: 'short_text',        from: '#155e75', to: '#0e7490', shadow: 'rgba(21,94,117,0.25)' },
  // ─── ৩টি নতুন ফিচার (Nursery – Class 3) ───────────────────────────
  { type: 'primary_tracing',           label: 'ট্রেসিং',          icon: 'draw',              from: '#dc2626', to: '#ef4444', shadow: 'rgba(220,38,38,0.25)' },
  { type: 'primary_number_line',       label: 'সংখ্যা রেখা',      icon: 'linear_scale',      from: '#16a34a', to: '#22c55e', shadow: 'rgba(22,163,74,0.25)' },
  { type: 'primary_visual_math',       label: 'ছবি গণিত',         icon: 'emoji_objects',      from: '#ea580c', to: '#f97316', shadow: 'rgba(234,88,12,0.25)' },
]
const PRIMARY_BASE_TYPES = ['parent_passage', 'column_matching', 'visual_grid', 'standard_text']
const MORE_TYPES = QUESTION_TYPES.filter(t => !PRIMARY_BASE_TYPES.includes(t.type))

// ─── Accounting 8 Presets ─────────────────────────────────────────────
const ACCOUNTING_PRESETS = [
  { type: 'acc_equation',     label: 'হিসাব সমীকরণ',   icon: 'functions',        from: '#92400e', to: '#b45309', shadow: 'rgba(146,64,14,0.25)' },
  { type: 'acc_t_ledger',     label: 'সনাতন খতিয়ান',   icon: 'view_column',      from: '#78350f', to: '#92400e', shadow: 'rgba(120,53,15,0.25)' },
  { type: 'acc_moving_ledger',label: 'চলমান জের খতিয়ান',icon: 'sync_alt',         from: '#a16207', to: '#b45309', shadow: 'rgba(161,98,7,0.25)' },
  { type: 'acc_general_journal',label: 'সাধারণ জাবেদা', icon: 'menu_book',        from: '#854d0e', to: '#a16207', shadow: 'rgba(133,77,14,0.25)' },
  { type: 'acc_special_journal',label: 'বিশেষ জাবেদা',  icon: 'receipt_long',     from: '#b45309', to: '#d97706', shadow: 'rgba(180,83,9,0.25)' },
  { type: 'acc_trial_balance', label: 'রেওয়ামিল',       icon: 'balance',          from: '#d97706', to: '#f59e0b', shadow: 'rgba(217,119,6,0.25)' },
  { type: 'acc_financial_stmt',label: 'আর্থিক বিবরণী',  icon: 'assessment',       from: '#ca8a04', to: '#eab308', shadow: 'rgba(202,138,4,0.25)' },
  { type: 'acc_mcq',          label: 'হিসাব MCQ',        icon: 'quiz',             from: '#92400e', to: '#78350f', shadow: 'rgba(146,64,14,0.25)' },
]

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
  // New Primary Education Types
  parent_passage: ParentPassageEditor,
  column_matching: ColumnMatchingEditor,
  visual_grid: VisualGridEditor,
  standard_text: StandardTextEditor,
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
  const [showVault, setShowVault] = useState(false)
  const [showPrimaryTemplates, setShowPrimaryTemplates] = useState(false)
  const [showFullPaperTemplates, setShowFullPaperTemplates] = useState(false)
  const showPublishModal = usePaperStore((s) => s.publishModalOpen)
  const setShowPublishModal = usePaperStore((s) => s.setPublishModalOpen)
  const [showMoreTypes, setShowMoreTypes] = useState(false)
  const [showBoardQuestions, setShowBoardQuestions] = useState(false)
  const [showAccountingPresets, setShowAccountingPresets] = useState(false)

  const currentPaper = usePaperStore((s) => s.currentPaper)
  const questions = usePaperStore((s) => s.questions)
  const isDirty = usePaperStore((s) => s.isDirty)
  const setPaper = usePaperStore((s) => s.setPaper)
  const updatePaper = usePaperStore((s) => s.updatePaper)
  const addQuestion = usePaperStore((s) => s.addQuestion)
  const reorderQuestions = usePaperStore((s) => s.reorderQuestions)
  const clearPaper = usePaperStore((s) => s.clearPaper)

  // Detect if this is a Primary education paper
  // Check URL path first, then check paper data for persisted level
  const urlIsPrimary = location.pathname.endsWith('/primary') || location.pathname.includes('/new/primary')
  const paperLevel = currentPaper?.metadata?.level || currentPaper?.level
  const isPrimary = paperLevel === 'primary' || urlIsPrimary

  const markClean = usePaperStore((s) => s.markClean)
  const getTotalMarks = usePaperStore((s) => s.getTotalMarks)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    // Check if this is a "new" route (either 'new' or 'new/primary' or 'new/editor')
    const isNewRoute = !id || id === 'new' || id.startsWith('new/')

    if (!isNewRoute) {
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
          metadata: {
            level: urlIsPrimary ? 'primary' : 'higher',
          },
        })
      }
    }
  }, [id])

  async function loadPaper(paperId) {
    const listStore = usePaperListStore.getState()
    const cached = listStore.byId[paperId]
    const fetchedAt = listStore.byIdFetchedAt[paperId]
    const stale = !fetchedAt || Date.now() - fetchedAt > 5 * 60 * 1000

    // Cache-first: render instantly from cache, refresh in background
    // unless the user is editing (isDirty). Skip the background fetch
    // entirely if cache is still fresh.
    if (cached) {
      setPaper(cached)
      setLoading(false)
      if (stale && !usePaperStore.getState().isDirty) {
        listStore.revalidateById(paperId).then(() => {
          const fresh = usePaperListStore.getState().byId[paperId]
          if (fresh && !usePaperStore.getState().isDirty) setPaper(fresh)
        })
      }
      return
    }

    setLoading(true)
    try {
      const paper = await listStore.loadById(paperId)
      setPaper(paper)
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
        usePaperListStore.getState().upsertPaper(data.paper)
      } else {
        const { data } = await api.post('/papers', payload)
        setPaper(data.paper)
        usePaperListStore.getState().upsertPaper(data.paper)
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
      Object.assign(defaults, { stimulus: '', sub_questions: [{ label: 'ক', text: '', marks: 1 }, { label: 'খ', text: '', marks: 2 }, { label: 'গ', text: '', marks: 3 }, { label: 'ঘ', text: '', marks: 4 }] })
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

    // ─── Primary 17 sub-types ───────────────────────────────────────────────
    } else if (type === 'primary_passage') {
      const t = Date.now()
      Object.assign(defaults, {
        type: 'parent_passage',
        instruction: 'নিচের অনুচ্ছেদটি পড়ো এবং প্রশ্নের উত্তর দাও:',
        passage_body: 'বাংলাদেশ একটি সুন্দর দেশ। এখানে অনেক নদী আছে। পদ্মা, মেঘনা ও যমুনা আমাদের প্রধান নদী। আমাদের দেশের মানুষ খুব পরিশ্রমী।',
        sub_questions: [
          { id: `sub_${t}`,   type: 'short', text: 'বাংলাদেশের প্রধান নদীগুলোর নাম কী?', answer: '', marks: 2 },
          { id: `sub_${t+1}`, type: 'short', text: 'আমাদের দেশের মানুষ কেমন?', answer: '', marks: 2 },
          { id: `sub_${t+2}`, type: 'short', text: 'অনুচ্ছেদটির একটি উপযুক্ত শিরোনাম দাও।', answer: '', marks: 2 },
        ],
        marks: 6,
      })
    } else if (type === 'primary_cq') {
      const t = Date.now()
      Object.assign(defaults, {
        type: 'parent_passage',
        instruction: 'নিচের উদ্দীপকটি পড়ো এবং প্রশ্নের উত্তর দাও:',
        passage_body: 'রাহেলা প্রতিদিন সকালে স্কুলে যায়। সে পরিষ্কার পোশাক পরে এবং সময়মতো ক্লাসে বসে। তার শিক্ষক তাকে খুব ভালোবাসেন।',
        sub_questions: [
          { id: `sub_${t}`,   type: 'short', text: 'ক. রাহেলা কখন স্কুলে যায়?', answer: '', marks: 1 },
          { id: `sub_${t+1}`, type: 'short', text: 'খ. রাহেলার শিক্ষক তাকে ভালোবাসেন কেন?', answer: '', marks: 2 },
          { id: `sub_${t+2}`, type: 'short', text: 'গ. তুমি কি রাহেলার মতো নিয়মিত স্কুলে যাও? ব্যাখ্যা করো।', answer: '', marks: 3 },
          { id: `sub_${t+3}`, type: 'short', text: 'ঘ. একজন আদর্শ ছাত্রের বৈশিষ্ট্য কী কী হওয়া উচিত?', answer: '', marks: 4 },
        ],
        marks: 10,
      })
    } else if (type === 'primary_science_cq') {
      const t = Date.now()
      Object.assign(defaults, {
        type: 'parent_passage',
        instruction: 'নিচের দৃশ্যপটটি পড়ো এবং প্রশ্নের উত্তর দাও:',
        passage_body: 'করিম সাহেব তার বাগানে গাছে পানি দিচ্ছেন। তিনি জানেন গাছের বাঁচার জন্য পানি, আলো ও মাটি দরকার। তাই তিনি প্রতিদিন গাছের যত্ন নেন।',
        sub_questions: [
          { id: `sub_${t}`,   type: 'short', text: 'করিম সাহেব কী করছেন?', answer: '', marks: 2 },
          { id: `sub_${t+1}`, type: 'short', text: 'গাছ বাঁচার জন্য কী কী দরকার?', answer: '', marks: 3 },
          { id: `sub_${t+2}`, type: 'short', text: 'গাছের যত্ন নেওয়া কেন গুরুত্বপূর্ণ? তোমার মতামত লেখো।', answer: '', marks: 5 },
        ],
        marks: 10,
      })
    } else if (type === 'primary_sentence_matching') {
      Object.assign(defaults, {
        type: 'column_matching',
        instruction: 'বামপাশের সাথে ডানপাশ মেলাও:',
        pairs: [
          { column_a: 'ঢাকা', column_b: 'বাংলাদেশের রাজধানী' },
          { column_a: 'পদ্মা', column_b: 'একটি বড় নদী' },
          { column_a: 'সূর্য', column_b: 'আলো ও তাপ দেয়' },
          { column_a: 'গরু', column_b: 'একটি গৃহপালিত প্রাণী' },
        ],
        marks: 5,
      })
    } else if (type === 'primary_3col_matching') {
      Object.assign(defaults, {
        type: 'column_matching',
        instruction: 'তিনটি কলাম মিলিয়ে সঠিক বাক্য তৈরি কর:',
        pairs: [
          { column_a: 'He', column_b: 'goes to', column_c: 'school.' },
          { column_a: 'She', column_b: 'likes to', column_c: 'sing.' },
          { column_a: 'They', column_b: 'play', column_c: 'cricket.' },
          { column_a: 'We', column_b: 'eat', column_c: 'rice.' },
        ],
        marks: 5,
      })
    } else if (type === 'primary_image_matching') {
      Object.assign(defaults, {
        type: 'column_matching',
        instruction: 'ছবির সাথে নামটি মেলাও:',
        pairs: [
          { column_a: '[ছবি: আপেল]', column_b: 'আপেল' },
          { column_a: '[ছবি: বই]', column_b: 'বই' },
          { column_a: '[ছবি: কলম]', column_b: 'কলম' },
          { column_a: '[ছবি: ব্যাগ]', column_b: 'ব্যাগ' },
        ],
        marks: 5,
      })
    } else if (type === 'primary_comparison') {
      Object.assign(defaults, {
        type: 'visual_grid',
        instruction: 'তুলনা করো এবং >, <, = বসাও:',
        left_asset: 'apple',
        left_count: 5,
        right_asset: 'banana',
        right_count: 3,
        operator: 'compare',
        marks: 1,
      })
    } else if (type === 'primary_picture_grid') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'ছবি দেখে সংখ্যা বা নাম লেখো:',
        question: '[ছবি: ৩টি আপেল] → ___\n[ছবি: ৫টি বল] → ___\n[ছবি: ২টি বই] → ___',
        space_level: 'short',
        line_style: 'none',
        marks: 3,
      })
    } else if (type === 'primary_geometry') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'নিচের জ্যামিতিক আকৃতির নাম ও সংজ্ঞা লেখো:',
        question: '[জ্যামিতিক চিত্র: ত্রিভুজ] — তিনটি বাহু ও তিনটি কোণবিশিষ্ট বদ্ধ আকৃতিকে ত্রিভুজ বলে।',
        space_level: 'medium',
        line_style: 'none',
        marks: 3,
      })
    } else if (type === 'primary_graph') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'নিচের গ্রাফটি দেখো এবং প্রশ্নের উত্তর দাও:',
        question: '[গ্রাফ/ছক এখানে থাকবে]\nকোন মাসে বৃষ্টিপাত সবচেয়ে বেশি হয়েছে?',
        space_level: 'none',
        line_style: 'none',
        marks: 5,
      })
    } else if (type === 'primary_inline_box') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'শূন্যস্থান পূরণ করো:',
        question: 'অ ___ ই ___ উ ___ এ ___\n___ + ___ = ১০\nক ___ গ ___ ঙ',
        space_level: 'none',
        line_style: 'none',
        marks: 5,
      })
    } else if (type === 'primary_math_vertical') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'যোগ করো:',
        question: '  ৫৩\n+ ২৮\n────',
        space_level: 'medium',
        line_style: 'none',
        marks: 2,
      })
    } else if (type === 'primary_wh_question') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'আন্ডারলাইন করা শব্দটির জায়গায় প্রশ্নবোধক বাক্য তৈরি করো:',
        question: '[underline]রাহেলা[/underline] প্রতিদিন স্কুলে যায়।',
        space_level: 'short',
        line_style: 'none',
        marks: 2,
      })
    } else if (type === 'primary_dotted_lines') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'নিচের প্রশ্নের উত্তর দাও:',
        question: 'তোমার প্রিয় ঋতু কোনটি এবং কেন?',
        space_level: 'medium',
        line_style: 'dotted',
        marks: 2,
      })
    } else if (type === 'primary_notebook_ruled') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'সুন্দর করে লেখো:',
        question: 'আমার দেশের নাম বাংলাদেশ।\nএটি একটি সুন্দর দেশ।',
        space_level: 'long',
        line_style: 'ruled',
        marks: 5,
      })
    } else if (type === 'primary_mcq_grid') {
      Object.assign(defaults, {
        type: 'MCQ',
        question: 'বাংলাদেশের রাজধানীর নাম কী?',
        option_a: 'চট্টগ্রাম',
        option_b: 'ঢাকা',
        option_c: 'রাজশাহী',
        option_d: 'সিলেট',
        correct_answer: 'খ',
        marks: 1,
      })
    } else if (type === 'primary_plain_text') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'নিচের প্রশ্নের উত্তর লেখো:',
        question: 'তোমার নাম কী?',
        space_level: 'short',
        line_style: 'none',
        marks: 2,
      })
    // ─── ৩টি নতুন ফিচার (Nursery – Class 3) ───────────────────────────
    } else if (type === 'primary_tracing') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'নিচের অক্ষর/সংখ্যাগুলো ডটের ওপর দিয়ে আঁকো:',
        question: 'tracing',
        tracing_type: 'letter',
        tracing_chars: ['অ', 'আ', 'ই'],
        space_level: 'none',
        line_style: 'none',
        marks: 3,
      })
    } else if (type === 'primary_number_line') {
      Object.assign(defaults, {
        type: 'standard_text',
        instruction: 'সংখ্যা রেখায় সঠিক স্থানে সংখ্যা বসাও:',
        question: 'number_line',
        nl_start: 0,
        nl_end: 10,
        nl_jumps: [3, 5, 7],
        nl_question: '৩, ৫ এবং ৭ এর স্থানে সংখ্যা লেখো।',
        space_level: 'none',
        line_style: 'none',
        marks: 3,
      })
    // ─── Accounting 8 Presets ──────────────────────────────────────────
    } else if (type === 'acc_equation') {
      Object.assign(defaults, {
        type: 'accounting', preset: 'equation',
        description: 'নিচের লেনদেনগুলোর ভিত্তিতে হিসাব সমীকরণ ছক তৈরি করো ($A = L + E$):',
        title_lines: ['হিসাব সমীকরণ', 'জানুয়ারি ২০২৩'],
        headers: ['তারিখ', 'সম্পদ', '', 'দায়', 'মালিকানা', 'মন্তব্য'],
        alignments: ['left', 'right', 'right', 'right', 'right', 'left'],
        rows: [
          ['০১.০১.২০২৩', 'নগদ ৫০,০০০', '', '', 'মালিকানা স্বত্ব ৫০,০০০', 'মালিক থেকে প্রাপ্ত'],
          ['০৫.০১.২০২৩', 'আসবাবপত্র ১০,০০০', '', '', 'মালিকানা স্বত্ব ১০,০০০', 'আসবাবপত্র ক্রয়'],
          ['১০.০১.২০২৩', 'নগদ ২০,০০০', '', 'পাওনাদার ২০,০০০', '', 'ঋণ গ্রহণ'],
        ],
        show_total: false, total_row: [], notes_label: 'সমন্বয়', notes: '১. সমাপনী মজুদ পণ্য ৮,০০০ টাকা। ২. দেনাদারের ১,০০০ টাকা আদায়যোগ্য নয়।',
        sub_questions: [
          { label: 'ক', text: 'হিসাব সমীকরণ ছক তৈরি করো।', marks: 4 },
          { label: 'খ', text: 'মোট সম্পদের পরিমাণ নির্ণয় করো।', marks: 2 },
        ],
      })
    } else if (type === 'acc_t_ledger') {
      Object.assign(defaults, {
        type: 'accounting', preset: 't_ledger',
        description: 'জানুয়ারি ২০২৩ মাসের নগদান হিসাবের সনাতন খতিয়ান তৈরি করো:',
        title_lines: ['নগদান হিসাব (সনাতন ছক)'],
        headers: ['ডেবিট তারিখ', 'ডেবিট বিবরণ', 'ডেবিট টাকা', 'ক্রেডিট তারিখ', 'ক্রেডিট বিবরণ', 'ক্রেডিট টাকা'],
        alignments: ['left', 'left', 'right', 'left', 'left', 'right'],
        rows: [
          ['০১.০১', 'মালিক থেকে প্রাপ্ত', '৫০,০০০', '০৩.০১', 'আসবাবপত্র ক্রয়', '১০,০০০'],
          ['১০.০১', 'পাওনাদার হতে পণ্য', '২০,০০০', '০৫.০১', 'বেতন', '৫,০০০'],
          ['', '', '', '১২.০১', 'মজুরি', '৩,০০০'],
        ],
        show_total: false, total_row: [], notes_label: '', notes: '',
        sub_questions: [],
      })
    } else if (type === 'acc_moving_ledger') {
      Object.assign(defaults, {
        type: 'accounting', preset: 'moving_ledger',
        description: 'জানুয়ারি ২০২৩ মাসের নগদান হিসাবের চলমান জের খতিয়ান তৈরি করো:',
        title_lines: ['নগদান হিসাব (চলমান জের)'],
        headers: ['তারিখ', 'বিবরণ', 'জা.পৃ.', 'ডেবিট', 'ক্রেডিট', 'জের(ডে)', 'জের(ক্রে)'],
        alignments: ['left', 'left', 'center', 'right', 'right', 'right', 'right'],
        rows: [
          ['০১.০১.২৩', 'মালিক থেকে প্রাপ্ত', 'জ-১', '৫০,০০০', '', '৫০,০০০', ''],
          ['০৩.০১.২৩', 'আসবাবপত্র ক্রয়', 'জ-২', '১০,০০০', '', '৪০,০০০', ''],
          ['০৫.০১.২৩', 'পণ্য ক্রয় (নগদ)', 'জ-৩', '', '৮,০০০', '', '৩২,০০০'],
        ],
        show_total: false, total_row: [], notes_label: '', notes: '',
        sub_questions: [],
      })
    } else if (type === 'acc_general_journal') {
      Object.assign(defaults, {
        type: 'accounting', preset: 'general_journal',
        description: 'নিচের লেনদেনগুলোর সাধারণ জাবেদা লেখো:',
        title_lines: ['সাধারণ জাবেদা', 'জানুয়ারি ২০২৩'],
        headers: ['তারিখ', 'হিসাবের নাম ও ব্যাখ্যা', 'খ.পৃ.', 'ডেবিট টাকা', 'ক্রেডিট টাকা'],
        alignments: ['left', 'left', 'center', 'right', 'right'],
        rows: [
          ['০১.০১.২৩', 'মজুরি হিসাব', 'জ-১', '৫,০০০', ''],
          ['', '   নগদান হিসাব', '', '', '৫,০০০'],
          ['০৫.০১.২৩', 'ক্রয় হিসাব', 'জ-২', '২০,০০০', ''],
          ['', '   পাওনাদার হিসাব', '', '', '২০,০০০'],
        ],
        show_total: false, total_row: [], notes_label: '', notes: '',
        sub_questions: [],
      })
    } else if (type === 'acc_special_journal') {
      Object.assign(defaults, {
        type: 'accounting', preset: 'special_journal',
        description: 'জানুয়ারি ২০২৩ মাসের ক্রয় জাবেদা তৈরি করো:',
        title_lines: ['ক্রয় জাবেদা', 'জানুয়ারি ২০২৩'],
        headers: ['তারিখ', 'ক্রেডিট হিসাব', 'চালান নং', 'শর্ত', 'সূত্র', 'টাকা'],
        alignments: ['left', 'left', 'center', 'center', 'center', 'right'],
        rows: [
          ['০১.০১.২৩', 'রহিম এন্ড কোং', '১০১', '২/১০ ন/৩০', 'জ-১', '২৫,০০০'],
          ['০৩.০১.২৩', 'করিম ট্রেডার্স', '১০২', '২/১৫ ন/৪৫', 'জ-২', '১৫,০০০'],
          ['০৫.০১.২৩', 'আলম সাপ্লায়ার্স', '১০৩', 'নগদ', 'জ-৩', '১০,০০০'],
        ],
        show_total: false, total_row: [], notes_label: '', notes: '',
        sub_questions: [],
      })
    } else if (type === 'acc_trial_balance') {
      Object.assign(defaults, {
        type: 'accounting', preset: 'trial_balance',
        description: 'নিচের রেওয়ামিলটি থেকে প্রশ্নের উত্তর দাও:',
        title_lines: ['রেওয়ামিল', '৩১ ডিসেম্বর ২০২২'],
        headers: ['ক্রমিক নং', 'হিসাবের নাম', 'ডেবিট (টাকা)', 'ক্রেডিট (টাকা)'],
        alignments: ['center', 'left', 'right', 'right'],
        rows: [
          ['১', 'নগদ', '৫০,০০০', ''],
          ['২', 'পাওনাদার', '', '২০,০০০'],
          ['৩', 'ক্রয়', '৩০,০০০', ''],
          ['৪', 'বিক্রয়', '', '৮০,০০০'],
          ['৫', 'বেতন', '২০,০০০', ''],
        ],
        show_total: true, total_row: ['মোট', '', '১,০০,০০০', '১,০০,০০০'],
        notes_label: '', notes: '',
        sub_questions: [],
      })
    } else if (type === 'acc_financial_stmt') {
      Object.assign(defaults, {
        type: 'accounting', preset: 'financial_stmt',
        description: 'প্রদত্ত তথ্য থেকে আয়-ব্যয় হিসাব তৈরি করো:',
        title_lines: ['আয়-ব্যয় হিসাব', '৩১ ডিসেম্বর ২০২২'],
        headers: ['বিবরণ', 'টাকা (ইনার)', 'টাকা (মিডল)', 'টাকা (আউটার)'],
        alignments: ['left', 'right', 'right', 'right'],
        rows: [
          ['ক্রয়', '৩০,০০০', '', '৩০,০০০'],
          ['ক্রয় ফেরত', '', '২,০০০', '২৮,০০০'],
          ['মজুদ পণ্য (সমাপনী)', '', '', '৩৫,০০০'],
          ['বিক্রয়', '৮০,০০০', '', '৮০,০০০'],
        ],
        show_total: false, total_row: [], notes_label: '', notes: '',
        sub_questions: [],
      })
    } else if (type === 'acc_mcq') {
      Object.assign(defaults, {
        type: 'MCQ', preset: 'accounting_mcq',
        question: '২০২৩ সালের ১ জানুয়ারি একটি ব্যবসার সম্পদ ২,০০,০০০ টাকা এবং দায় ৫০,০০০ টাকা হলে মালিকানা স্বত্ব কত?\n(i) সম্পদ = ২,০০,০০০ টাকা\n(ii) দায় = ৫০,০০০ টাকা',
        option_a: '১,৫০,০০০ টাকা',
        option_b: '২,৫০,০০০ টাকা',
        option_c: '১,০০,০০০ টাকা',
        option_d: '৩,৫০,০০০ টাকা',
        correct_answer: 'ক', marks: 1,
      })
    } else if (type === 'primary_visual_math') {
      Object.assign(defaults, {
        type: 'visual_grid',
        instruction: 'ছবি দেখে যোগ করো:',
        left_asset: 'apple',
        left_count: 3,
        right_asset: 'apple',
        right_count: 2,
        operator: '+',
        math_question: 'মোট আপেল কতটি?',
        marks: 2,
      })
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
        {questions.length > 0 && <PaperSetupForm />}

        {/* Summary Bar — desktop only (mobile header shows this info) */}
        {(questions.length > 0 || currentPaper?.id) && (
          <div className="hidden lg:flex" style={{
            background: '#fff', padding: '6px 10px', borderRadius: 100,
            border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: marksMatch ? '#ecfdf5' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={marksMatch ? '#10b981' : '#f59e0b'} strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={marksMatch ? 'M4.5 12.75l6 6 9-13.5' : 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'} />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap' }}>
                {totalMarks}/{targetMarks || '—'} নম্বর
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: isDirty ? '#3b82f6' : '#10b981', flexShrink: 0 }}>
                {isDirty ? (saving ? 'সেভ…' : '• Unsaved') : '✓'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {currentPaper?.id && (
                <>
                  <button
                    onClick={() => navigate(`/papers/${currentPaper.id}/preview`)}
                    className="btn-press"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontSize: 9, fontWeight: 800, border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Live Preview
                  </button>
                  <button onClick={() => setShowPublishModal(true)} className="btn-press" style={{ padding: '4px 8px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '8px', fontSize: 9, fontWeight: 800, border: '1px solid #ddd6fe', whiteSpace: 'nowrap' }}>Publish</button>
                </>
              )}
              <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>{questions.length} প্রশ্ন</span>
            </div>
          </div>
        )}

        {/* Section mode — higher level only, after questions exist */}
        {!isPrimary && questions.length > 0 && (
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
        )}

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
          <div style={{
            padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 20px)',
            background: '#fff',
            borderRadius: 'clamp(14px, 3.5vw, 20px)',
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(12px, 3vw, 16px)' }}>
              <div style={{
                width: 'clamp(40px, 10vw, 48px)',
                height: 'clamp(40px, 10vw, 48px)',
                margin: '0 auto clamp(8px, 2vw, 12px)',
                borderRadius: 'clamp(10px, 2.5vw, 14px)',
                background: isPrimary
                  ? 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'
                  : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPrimary ? '0 2px 8px rgba(219,39,119,0.08)' : '0 2px 8px rgba(37,99,235,0.08)'
              }}>
                {isPrimary ? (
                  <span style={{ fontSize: 'clamp(20px, 5vw, 26px)' }}>🧸</span>
                ) : (
                  <svg width="clamp(18px, 4.5vw, 24px)" height="clamp(18px, 4.5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke={isPrimary ? '#db2777' : '#2563eb'} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </div>
              <h3 style={{
                fontSize: 'clamp(13px, 3.2vw, 15px)',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 clamp(4px, 1vw, 6px)',
                letterSpacing: '-0.01em'
              }}>{isPrimary ? 'প্রাথমিক প্রশ্ন তৈরি করুন' : 'প্রশ্ন তৈরি করুন'}</h3>
              <p style={{
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                color: '#94a3b8',
                margin: 0,
                fontWeight: 500
              }}>{isPrimary ? 'নিচে যেকোনো প্রশ্নের ধরন বেছে নিন' : 'নিচের যেকোনো উপায় বেছে নিন'}</p>
            </div>

            {/* Primary Question Types - shown directly on screen */}
            {isPrimary ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'clamp(6px, 1.5vw, 10px)'
              }}>
                {/* Full Paper Templates Button - FIRST POSITION */}
                <button
                  onClick={() => { setShowFullPaperTemplates(true) }}
                  className="btn-press"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    borderRadius: 14,
                    background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #fbbf24',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(217,119,6,0.15)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(234,179,8,0.3)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(217,119,6,0.15)' }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(234,179,8,0.4)' }}>
                    <span style={{ fontSize: 22 }}>📄</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#a16207', textAlign: 'center', lineHeight: 1.3 }}>পূর্ণ পেপার</span>
                </button>

                {/* Magic Scan Button - SECOND POSITION */}
                <button
                  onClick={() => { setShowMagicScan(true) }}
                  className="btn-press"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    borderRadius: 14,
                    background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '2px solid #93c5fd',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(37,99,235,0.1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(37,99,235,0.1)' }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>
                    <span style={{ fontSize: 22 }}>📷</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textAlign: 'center', lineHeight: 1.3 }}>ছবি স্ক্যান</span>
                </button>

                {PRIMARY_20_TYPES.map(qt => (
                  <button
                    key={qt.type}
                    onClick={() => handleAddQuestion(qt.type)}
                    className="btn-press"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0,
                      padding: 0,
                      borderRadius: 14,
                      background: '#fff',
                      border: '1.5px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${qt.shadow}` }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}
                  >
                    {/* Preview area */}
                    <div style={{ width: '100%', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 4px 4px' }}>
                      <PrimaryTypePreview id={qt.type} width={72} height={42} />
                    </div>
                    {/* Label + icon row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px 6px', width: '100%' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, background: `linear-gradient(135deg, ${qt.from}, ${qt.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 11, color: '#fff' }}>{qt.icon}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', lineHeight: 1.3, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
            /* Higher Level - AI-powered options — 3 top, 2 bottom centered */
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'clamp(6px, 1.5vw, 10px)',
              maxWidth: 480,
              margin: '0 auto',
            }}>
              <button
                onClick={() => { setShowMagicScan(true) }}
                className="btn-press"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)',
                  padding: 'clamp(10px, 2.5vw, 14px) clamp(6px, 1.5vw, 8px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #bfdbfe', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(37,99,235,0.05)',
                  position: 'relative', overflow: 'hidden',
                  flex: '1 1 28%', minWidth: 120,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(37,99,235,0.05)'
                }}
              >
                <div style={{
                  width: 'clamp(28px, 7vw, 36px)', height: 'clamp(28px, 7vw, 36px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
                }}>
                  <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>📷</span>
                </div>
                <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: '#1e40af', textAlign: 'center', lineHeight: 1.3 }}>ছবি স্ক্যান</span>
              </button>

              <button
                onClick={() => { setShowBookGenerate(true) }}
                className="btn-press"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)',
                  padding: 'clamp(10px, 2.5vw, 14px) clamp(6px, 1.5vw, 8px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  background: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1px solid #a7f3d0', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(5,150,105,0.05)',
                  position: 'relative', overflow: 'hidden',
                  flex: '1 1 28%', minWidth: 120,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(5,150,105,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(5,150,105,0.05)'
                }}
              >
                <div style={{
                  width: 'clamp(28px, 7vw, 36px)', height: 'clamp(28px, 7vw, 36px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.2)'
                }}>
                  <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>📚</span>
                </div>
                <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: '#065f46', textAlign: 'center', lineHeight: 1.3 }}>বই থেকে</span>
              </button>

              <button
                onClick={() => { setShowVault(true) }}
                className="btn-press"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)',
                  padding: 'clamp(10px, 2.5vw, 14px) clamp(6px, 1.5vw, 8px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  background: 'linear-gradient(145deg, #faf5ff 0%, #f3e8ff 100%)',
                  border: '1px solid #d8b4fe', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(124,58,237,0.05)',
                  position: 'relative', overflow: 'hidden',
                  flex: '1 1 28%', minWidth: 120,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(124,58,237,0.05)'
                }}
              >
                <div style={{
                  width: 'clamp(28px, 7vw, 36px)', height: 'clamp(28px, 7vw, 36px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.2)'
                }}>
                  <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>🏦</span>
                </div>
                <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: '#7c3aed', textAlign: 'center', lineHeight: 1.3 }}>প্রশ্ন ব্যাংক</span>
              </button>

              <button
                onClick={() => { setShowAddMenu(true) }}
                className="btn-press"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)',
                  padding: 'clamp(10px, 2.5vw, 14px) clamp(6px, 1.5vw, 8px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  background: 'linear-gradient(145deg, #fefce8 0%, #fef3c7 100%)',
                  border: '1px solid #fde68a', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(161,98,7,0.05)',
                  position: 'relative', overflow: 'hidden',
                  flex: '1 1 28%', minWidth: 120,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(161,98,7,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(161,98,7,0.05)'
                }}
              >
                <div style={{
                  width: 'clamp(28px, 7vw, 36px)', height: 'clamp(28px, 7vw, 36px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(161,98,7,0.2)'
                }}>
                  <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>✏️</span>
                </div>
                <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: '#854d0e', textAlign: 'center', lineHeight: 1.3 }}>নিজে লিখুন</span>
              </button>

              {/* 🚀 5th Button — Board Questions */}
              <button
                onClick={() => { setShowBoardQuestions(true) }}
                className="btn-press"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)',
                  padding: 'clamp(10px, 2.5vw, 14px) clamp(6px, 1.5vw, 8px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #93c5fd', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(30,64,175,0.05)',
                  position: 'relative', overflow: 'hidden',
                  flex: '1 1 28%', minWidth: 120,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,64,175,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(30,64,175,0.05)'
                }}
              >
                <div style={{
                  width: 'clamp(28px, 7vw, 36px)',
                  height: 'clamp(28px, 7vw, 36px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(30,64,175,0.25)'
                }}>
                  <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>📋</span>
                </div>
                <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: '#1e3a8a', textAlign: 'center', lineHeight: 1.3 }}>বোর্ড প্রশ্ন</span>
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Question FAB ───────────────────────────────── */}
      {questions.length > 0 && (
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
      )}

      {/* ── Save FAB (Mobile Only) ─────────────────────────── */}
      {questions.length > 0 && (
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
      )}

      <Modal isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} title="প্রশ্ন যোগ করুন">
        <div className="grid grid-cols-1 gap-2 sm:gap-2.5 py-1.5 sm:py-2.5">

          {/* AI-powered buttons - Image Scan only for Primary, all options for Higher */}
          <div className="grid grid-cols-1 gap-2 sm:gap-2.5 mb-3">
            {!isPrimary && (
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                <button
                  onClick={() => { setShowAddMenu(false); setShowMagicScan(true) }}
                  className="btn-press flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1px solid #bfdbfe',
                    boxShadow: '0 1px 2px rgba(37,99,235,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(37,99,235,0.05)'
                  }}
                >
                  <div style={{
                    width: 'clamp(36px, 9vw, 44px)',
                    height: 'clamp(36px, 9vw, 44px)',
                    borderRadius: 'clamp(10px, 2.5vw, 12px)',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
                  }}>
                    <span style={{ fontSize: 'clamp(18px, 4.5vw, 22px)' }}>📷</span>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-[11px] font-bold text-blue-700">ছবি স্ক্যান</div>
                    <div className="text-[8px] sm:text-[9px] font-medium text-blue-400">AI স্ক্যান</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowAddMenu(false); setShowBookGenerate(true) }}
                  className="btn-press flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)',
                    border: '1px solid #a7f3d0',
                    boxShadow: '0 1px 2px rgba(5,150,105,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(5,150,105,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(5,150,105,0.05)'
                  }}
                >
                  <div style={{
                    width: 'clamp(36px, 9vw, 44px)',
                    height: 'clamp(36px, 9vw, 44px)',
                    borderRadius: 'clamp(10px, 2.5vw, 12px)',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(5,150,105,0.2)'
                  }}>
                    <span style={{ fontSize: 'clamp(18px, 4.5vw, 22px)' }}>📚</span>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-[11px] font-bold text-emerald-700">বই থেকে</div>
                    <div className="text-[8px] sm:text-[9px] font-medium text-emerald-400">অধ্যায়</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowAddMenu(false); setShowVault(true) }}
                  className="btn-press flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(145deg, #faf5ff 0%, #f3e8ff 100%)',
                    border: '1px solid #d8b4fe',
                    boxShadow: '0 1px 2px rgba(124,58,237,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(124,58,237,0.05)'
                  }}
                >
                  <div style={{
                    width: 'clamp(36px, 9vw, 44px)',
                    height: 'clamp(36px, 9vw, 44px)',
                    borderRadius: 'clamp(10px, 2.5vw, 12px)',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.2)'
                  }}>
                    <span style={{ fontSize: 'clamp(18px, 4.5vw, 22px)' }}>🏦</span>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-[11px] font-bold text-purple-700">প্রশ্ন ব্যাংক</div>
                    <div className="text-[8px] sm:text-[9px] font-medium text-purple-400">ভল্ট</div>
                  </div>
                </button>
              </div>
            )}
            {isPrimary && (
              <button
                onClick={() => { setShowAddMenu(false); setShowMagicScan(true) }}
                className="btn-press flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-200 w-full"
                style={{
                  background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #bfdbfe',
                  boxShadow: '0 1px 2px rgba(37,99,235,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(37,99,235,0.05)'
                }}
              >
                <div style={{
                  width: 'clamp(40px, 10vw, 48px)',
                  height: 'clamp(40px, 10vw, 48px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
                }}>
                  <span style={{ fontSize: 'clamp(20px, 5vw, 26px)' }}>📷</span>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-base font-bold text-blue-700">ছবি স্ক্যান</div>
                  <div className="text-xs sm:text-sm font-medium text-blue-400">AI দিয়ে প্রশ্ন তৈরি করুন</div>
                </div>
              </button>
            )}
          </div>

          {/* ── Accounting Presets Section ─────────────────────── */}
          {!isPrimary && (
            <div style={{ marginBottom: 4 }}>
              <button
                onClick={() => setShowAccountingPresets(!showAccountingPresets)}
                className="btn-press w-full"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 12,
                  background: showAccountingPresets ? 'linear-gradient(145deg, #92400e, #b45309)' : 'linear-gradient(145deg, #fffbeb, #fef3c7)',
                  border: showAccountingPresets ? 'none' : '1px solid #fde68a',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: showAccountingPresets ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #92400e, #b45309)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: showAccountingPresets ? '#fff' : '#fff' }}>account_balance_wallet</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: showAccountingPresets ? '#fff' : '#92400e' }}>হিসাববিজ্ঞান প্রিসেট</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: showAccountingPresets ? 'rgba(255,255,255,0.7)' : '#b45309' }}>৮টি রেডিমেড ছক</div>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: showAccountingPresets ? '#fff' : '#b45309' }}>
                  {showAccountingPresets ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {showAccountingPresets && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6, marginTop: 6,
                }}>
                  {ACCOUNTING_PRESETS.map(ap => (
                    <button
                      key={ap.type}
                      onClick={() => handleAddQuestion(ap.type)}
                      className="btn-press flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
                    >
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(145deg, ${ap.from}, ${ap.to})`,
                          boxShadow: `0 3px 10px ${ap.shadow}`,
                        }}
                      >
                        <span className="material-symbols-outlined text-white text-sm sm:text-lg leading-none">{ap.icon}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-tight text-center">
                        {ap.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase pl-1">ম্যানুয়ালি যোগ করুন</p>
          <div className={`grid gap-1.5 sm:gap-2 pb-2 ${isPrimary ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-4 sm:grid-cols-5'}`}>
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
            {(isPrimary ? PRIMARY_20_TYPES : QUESTION_TYPES.slice(0, 4)).map(qt => {
              if (isPrimary) {
                return (
                  <button
                    key={qt.type}
                    onClick={() => handleAddQuestion(qt.type)}
                    className="btn-press active:scale-90 transition-transform duration-150"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: 0, borderRadius: 12, background: '#fff', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                  >
                    <div style={{ width: '100%', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 2px 3px' }}>
                      <PrimaryTypePreview id={qt.type} width={60} height={36} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px 4px', width: '100%' }}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, background: `linear-gradient(135deg, ${qt.from}, ${qt.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 9, color: '#fff' }}>{qt.icon}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#374151', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qt.label}</span>
                    </div>
                  </button>
                )
              }
              return (
              <button
                key={qt.type}
                onClick={() => handleAddQuestion(qt.type)}
                className="btn-press flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${qt.from}, ${qt.to})`,
                    boxShadow: `0 4px 14px ${qt.shadow}`,
                  }}
                >
                  <span className="material-symbols-outlined text-white text-lg sm:text-2xl leading-none">{qt.icon}</span>
                </div>
                <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 leading-tight text-center">
                  {qt.label}
                </span>
              </button>
              )
            })}
            {!isPrimary && (
              <button
                onClick={() => setShowMoreTypes(!showMoreTypes)}
                className="btn-press flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: showMoreTypes ? 'linear-gradient(145deg, #94a3b8, #64748b)' : 'linear-gradient(145deg, #38bdf8, #0284c7)',
                    boxShadow: showMoreTypes ? '0 4px 14px rgba(100,116,139,0.25)' : '0 4px 14px rgba(14,165,233,0.25)',
                  }}
                >
                  <span className="material-symbols-outlined text-white text-lg sm:text-2xl leading-none">{showMoreTypes ? 'expand_less' : 'more_horiz'}</span>
                </div>
                <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 leading-tight text-center">
                  {showMoreTypes ? 'কম' : 'আরও'}
                </span>
              </button>
            )}
            {!isPrimary && showMoreTypes && MORE_TYPES.map(qt => (
              <button
                key={qt.type}
                onClick={() => handleAddQuestion(qt.type)}
                className="btn-press flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${qt.from}, ${qt.to})`,
                    boxShadow: `0 4px 14px ${qt.shadow}`,
                  }}
                >
                  <span className="material-symbols-outlined text-white text-lg sm:text-2xl leading-none">{qt.icon}</span>
                </div>
                <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 leading-tight text-center">
                  {qt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modals */}
      {showMagicScan && <MagicScanModal isPrimary={isPrimary} onClose={() => setShowMagicScan(false)} />}
      {showBookGenerate && <BookGenerateModal onClose={() => setShowBookGenerate(false)} />}
      {showVault && <PrebuiltVaultModal onClose={() => setShowVault(false)} />}
      {showBoardQuestions && <BoardQuestionModal onClose={() => setShowBoardQuestions(false)} />}
      {showPrimaryTemplates && <PrimaryTemplatesModal onClose={() => setShowPrimaryTemplates(false)} />}
      {showFullPaperTemplates && <FullPaperTemplatesModal onClose={() => setShowFullPaperTemplates(false)} />}
      {showPublishModal && <ExamPublishModal paperId={id} onClose={() => setShowPublishModal(false)} />}
    </>
  )
}
