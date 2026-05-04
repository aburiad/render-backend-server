import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'

import usePaperStore from '@/store/paperStore'
import api from '@/services/api'

import PaperSetupForm from '@/components/paper/PaperSetupForm'
import MagicScanModal from '@/components/questions/MagicScanModal'
import BookGenerateModal from '@/components/questions/BookGenerateModal'
import ImportFromBankModal from '@/components/questions/ImportFromBankModal'
import ExamPublishModal from '@/components/paper/ExamPublishModal'
import QuestionWrapper from '@/components/questions/QuestionWrapper'
import Modal from '@/components/shared/Modal'

import McqEditor from '@/components/questions/McqEditor'
import CqEditor from '@/components/questions/CqEditor'
import ShortEditor from '@/components/questions/ShortEditor'
import BroadEditor from '@/components/questions/BroadEditor'
import FillBlankEditor from '@/components/questions/FillBlankEditor'
import MatchingEditor from '@/components/questions/MatchingEditor'
import RearrangingEditor from '@/components/questions/RearrangingEditor'
import TranslationEditor from '@/components/questions/TranslationEditor'
import TableEditor from '@/components/questions/TableEditor'

const QUESTION_TYPES = [
  { type: 'MCQ', label: 'MCQ', icon: '○' },
  { type: 'CQ', label: 'সৃজনশীল (CQ)', icon: '✎' },
  { type: 'short', label: 'সংক্ষিপ্ত', icon: '—' },
  { type: 'broad', label: 'রচনামূলক', icon: '¶' },
  { type: 'fill_blank', label: 'শূন্যস্থান', icon: '___' },
  { type: 'matching', label: 'মিলকরণ', icon: '⟷' },
  { type: 'rearranging', label: 'পুনর্বিন্যাস', icon: '↕' },
  { type: 'translation', label: 'অনুবাদ', icon: 'অ' },
  { type: 'table', label: 'টেবিল', icon: '▦' },
]

const EDITOR_MAP = {
  MCQ: McqEditor,
  CQ: CqEditor,
  short: ShortEditor,
  broad: BroadEditor,
  fill_blank: FillBlankEditor,
  matching: MatchingEditor,
  rearranging: RearrangingEditor,
  translation: TranslationEditor,
  table: TableEditor,
}

function SortableQuestion({ question, index }) {
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

  const Editor = EDITOR_MAP[question.type]

  if (!Editor) return null

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <QuestionWrapper
        question={question}
        index={index}
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
    if (type === 'MCQ') {
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleManualSave} disabled={!isDirty || saving} className="btn-press" style={{
            padding: '8px 12px', background: isDirty ? '#2563eb' : '#f1f5f9', color: isDirty ? '#fff' : '#cbd5e1',
            borderRadius: 12, fontSize: 11, fontWeight: 900, border: 'none', boxShadow: isDirty ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
          }}>সেভ</button>
        </div>
      </div>

      {/* ── Top Bar (Mobile Only) ─────────────────────────────────────────── */}
      <div className="flex lg:hidden items-center justify-between mb-5">
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
        <div style={{ display: 'flex', gap: 8 }}>
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
            position: 'sticky', top: 10, zIndex: 30,
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
                {totalMarks} / {targetMarks || '—'} Marks
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {currentPaper?.id && (
                <>
                  <button onClick={() => navigate(`/papers/${currentPaper.id}/preview`)} className="btn-press" style={{ padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '10px', fontSize: 11, fontWeight: 800, border: '1px solid #bfdbfe' }}>PDF Link</button>
                  <button onClick={() => setShowPublishModal(true)} className="btn-press" style={{ padding: '6px 12px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '10px', fontSize: 11, fontWeight: 800, border: '1px solid #ddd6fe' }}>Publish</button>
                </>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{questions.length} Qs</span>
            </div>
          </div>
        )}

        {/* DnD Questions */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <AnimatePresence>
                {questions.map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                    <SortableQuestion question={q} index={i} />
                  </motion.div>
                ))}
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
            width: 56, height: 56, borderRadius: 18, background: '#2563eb',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(37,99,235,0.3)', border: 'none'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      <Modal isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} title="প্রশ্ন যোগ করুন">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 10, padding: '10px 0' }}>
          <button onClick={() => { setShowAddMenu(false); setShowMagicScan(true); }} className="btn-press" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px', borderRadius: 16,
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', textAlign: 'left'
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a', margin: 0 }}>AI ম্যাজিক স্ক্যান</p>
              <p style={{ fontSize: 11, color: '#60a5fa', margin: 0 }}>ছবি থেকে অটো প্রশ্ন তৈরি</p>
            </div>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button onClick={() => { setShowAddMenu(false); setShowBankImport(true); }} className="btn-press" style={{
              display: 'flex', flexDirection: 'column', gap: 8, padding: '14px', borderRadius: 16,
              background: '#f5f3ff', border: '1px solid #ddd6fe', textAlign: 'center'
            }}>
              <span style={{ fontSize: 20 }}>🏦</span>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#5b21b6', margin: 0 }}>প্রশ্ন ব্যাংক</p>
            </button>
            <button onClick={() => { setShowAddMenu(false); setShowBookGenerate(true); }} className="btn-press" style={{
              display: 'flex', flexDirection: 'column', gap: 8, padding: '14px', borderRadius: 16,
              background: '#ecfdf5', border: '1px solid #a7f3d0', textAlign: 'center'
            }}>
              <span style={{ fontSize: 20 }}>📚</span>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#065f46', margin: 0 }}>বই থেকে</p>
            </button>
          </div>

          <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

          <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', paddingLeft: 4 }}>ম্যানুয়ালি যোগ করুন</p>
          <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10 }}>
            {QUESTION_TYPES.map(qt => (
              <button key={qt.type} onClick={() => handleAddQuestion(qt.type)} className="btn-press" style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                width: 80, padding: '12px 6px', borderRadius: 14, background: '#fff', border: '1px solid #f1f5f9'
              }}>
                <span style={{ fontSize: 18 }}>{qt.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>{qt.label}</span>
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
