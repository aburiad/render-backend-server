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
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import api from '@/services/api'
import usePaperStore from '@/store/paperStore'

import ExamPublishModal from '@/components/paper/ExamPublishModal'
import PaperSetupForm from '@/components/paper/PaperSetupForm'
import BookGenerateModal from '@/components/questions/BookGenerateModal'
import ImportFromBankModal from '@/components/questions/ImportFromBankModal'
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
  { type: 'MCQ', label: 'MCQ', icon: '○', color: '#3b82f6' },
  { type: 'CQ', label: 'সৃজনশীল (CQ)', icon: '✎', color: '#8b5cf6' },
  { type: 'accounting', label: 'হিসাববিজ্ঞান', icon: '৳', color: '#f59e0b' },
  { type: 'short', label: 'সংক্ষিপ্ত', icon: '—', color: '#10b981' },
  { type: 'broad', label: 'রচনামূলক', icon: '¶', color: '#06b6d4' },
  { type: 'fill_blank', label: 'শূন্যস্থান', icon: '___', color: '#ec4899' },
  { type: 'matching', label: 'মিলকরণ', icon: '⟷', color: '#f97316' },
  { type: 'rearranging', label: 'পুনর্বিন্যাস', icon: '↕', color: '#14b8a6' },
  { type: 'translation', label: 'অনুবাদ', icon: 'অ', color: '#6366f1' },
  { type: 'table', label: 'টেবিল', icon: '▦', color: '#64748b' },
  { type: 'short_question', label: 'সংক্ষিপ্ত প্রশ্ন (Scan)', icon: '✏️', color: '#0ea5e9' },
  { type: 'one_word', label: 'এক কথায় উত্তর', icon: '☝️', color: '#a855f7' },
  { type: 'essay', label: 'প্রবন্ধ/রচনা', icon: '📝', color: '#e11d48' },
  { type: 'paragraph', label: 'অনুচ্ছেদ', icon: '📖', color: '#059669' },
  { type: 'letter', label: 'চিঠি/দরখাস্ত', icon: '✉️', color: '#2563eb' },
  { type: 'dialogue', label: 'কথোপকথন', icon: '💬', color: '#7c3aed' },
  { type: 'grammar', label: 'ব্যাকরণ', icon: '🔤', color: '#db2777' },
  { type: 'math', label: 'গণিত সমাধান', icon: '➕', color: '#ea580c' },
  { type: 'finance', label: 'ফিন্যান্স সমস্যা', icon: '📊', color: '#0891b2' },
  { type: 'diagram_question', label: 'চিত্রভিত্তিক', icon: '🖼️', color: '#65a30d' },
  { type: 'arabic', label: 'আরবি অনুবাদ', icon: '🕌', color: '#0d9488' },
  { type: 'hifz', label: 'হিফজুল কুরআন', icon: '📖', color: '#16a34a' },
  { type: 'hadith', label: 'আল-হাদীস', icon: '📜', color: '#b45309' },
  { type: 'ebtedayi', label: 'এবতেদায়ী মাসআলা', icon: '🕋', color: '#1d4ed8' },
  { type: 'poem', label: 'কবিতা/মূলভাব', icon: '🎭', color: '#9333ea' },
  { type: 'passage', label: 'প্যাসেজভিত্তিক', icon: '📰', color: '#0284c7' },
  { type: 'true_false', label: 'সত্য/মিথ্যা', icon: '✅', color: '#15803d' },
]

const PRIMARY_TYPES = QUESTION_TYPES.slice(0, 10)
const MORE_TYPES = QUESTION_TYPES.slice(10)

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
  const [showBankImport, setShowBankImport] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showMoreTypes, setShowMoreTypes] = useState(false)
  const autoSaveTimer = useRef(null)

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
        setPaper({
          institution_name: '',
          exam_title: '',
          session_year: '',
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
    } catch (err) {
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

  const handleImportFromBank = (importedQuestions) => {
    importedQuestions.forEach(q => {
      const { id, _id, ...cleanData } = q
      addQuestion(cleanData)
    })
    toast.success(`${importedQuestions.length} টি প্রশ্ন যোগ করা হয়েছে`)
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
    <div style={{ paddingBottom: 100 }}>
      {/* ── Top Bar (Desktop Only) ─────────────────────────────────────────── */}
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
            background: '#fff', padding: '8px 16px', borderRadius: 100,
            border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: marksMatch ? '#ecfdf5' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={marksMatch ? '#10b981' : '#f59e0b'} strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={marksMatch ? "M4.5 12.75l6 6 9-13.5" : "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"} />
                </svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#1e293b' }}>
                {totalMarks}/{targetMarks || '—'} নম্বর
              </span>
              <span className="lg:hidden" style={{ fontSize: 10, fontWeight: 700, color: isDirty ? '#3b82f6' : '#10b981' }}>
                {isDirty ? (saving ? 'সেভ…' : '• অসেভ') : '✓'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {currentPaper?.id && (
                <>
                  <button onClick={() => navigate(`/papers/${currentPaper.id}/preview`)} className="btn-press" style={{ padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '10px', fontSize: 11, fontWeight: 800, border: '1px solid #bfdbfe' }}>PDF Link</button>
                  <button onClick={() => setShowPublishModal(true)} className="btn-press" style={{ padding: '6px 12px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '10px', fontSize: 11, fontWeight: 800, border: '1px solid #ddd6fe' }}>Publish</button>
                </>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{questions.length} প্রশ্ন</span>
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
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✏️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>এখনো কোনো প্রশ্ন নেই</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>নিচের বাটন থেকে প্রশ্ন যোগ করুন</p>
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

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => { setShowAddMenu(false); setShowBankImport(true); }}
              className="btn-press flex flex-col items-center gap-1 sm:gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-center"
              style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}
            >
              <span className="text-base sm:text-xl">🏦</span>
              <p className="text-[10px] sm:text-[11px] font-extrabold m-0" style={{ color: '#5b21b6' }}>প্রশ্ন ব্যাংক</p>
            </button>
            <button
              onClick={() => { setShowAddMenu(false); setShowBookGenerate(true); }}
              className="btn-press flex flex-col items-center gap-1 sm:gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-center"
              style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}
            >
              <span className="text-base sm:text-xl">📚</span>
              <p className="text-[10px] sm:text-[11px] font-extrabold m-0" style={{ color: '#065f46' }}>বই থেকে</p>
            </button>
          </div>

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
                className="btn-press flex flex-col items-center justify-center py-1.5 px-1 sm:py-3 sm:px-1.5 gap-0.5 sm:gap-1.5 rounded-lg sm:rounded-2xl"
                style={{
                  background: `linear-gradient(145deg, ${qt.color}f2, ${qt.color}cc)`,
                  border: 'none',
                  boxShadow: `0 3px 10px ${qt.color}50`,
                }}
              >
                <span className="text-[13px] sm:text-lg leading-none text-white drop-shadow-sm">{qt.icon}</span>
                <span className="text-[9px] sm:text-[9px] font-bold leading-tight text-center text-white drop-shadow-sm">
                  {qt.label}
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowMoreTypes(!showMoreTypes)}
              className="btn-press flex flex-col items-center justify-center py-1.5 px-1 sm:py-3 sm:px-1.5 gap-0.5 sm:gap-1.5 rounded-lg sm:rounded-2xl"
              style={{
                background: showMoreTypes ? '#f8fafc' : '#f0f9ff',
                border: showMoreTypes ? '1px solid #e2e8f0' : '1px solid #bae6fd',
              }}
            >
              <span className="text-[13px] sm:text-lg leading-none">{showMoreTypes ? '▲' : '⋯'}</span>
              <span className="text-[10px] sm:text-[9px] font-bold leading-tight" style={{ color: showMoreTypes ? '#64748b' : '#0284c7' }}>
                {showMoreTypes ? 'কম' : 'আরও'}
              </span>
            </button>
            {showMoreTypes && MORE_TYPES.map(qt => (
              <button
                key={qt.type}
                onClick={() => handleAddQuestion(qt.type)}
                className="btn-press flex flex-col items-center justify-center py-1.5 px-1 sm:py-3 sm:px-1.5 gap-0.5 sm:gap-1.5 rounded-lg sm:rounded-2xl"
                style={{
                  background: `linear-gradient(145deg, ${qt.color}f2, ${qt.color}cc)`,
                  border: 'none',
                  boxShadow: `0 3px 10px ${qt.color}50`,
                }}
              >
                <span className="text-[13px] sm:text-lg leading-none text-white drop-shadow-sm">{qt.icon}</span>
                <span className="text-[9px] sm:text-[9px] font-bold leading-tight text-center text-white drop-shadow-sm">
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
      <AnimatePresence>
        {showBankImport && <ImportFromBankModal onClose={() => setShowBankImport(false)} onImport={handleImportFromBank} />}
        {showPublishModal && <ExamPublishModal paperId={id} onClose={() => setShowPublishModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
