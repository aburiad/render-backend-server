import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'
import usePaperStore from '@/store/paperStore'
import {
  vaultToPaperQuestion,
  VAULT_INDEX,
  VAULT_CLASSES,
  VAULT_TYPES,
} from '@/utils/vaultConverter'
import { renderGeoGebraToImage } from '@/utils/geogebraRenderer'

export default function PrebuiltVaultModal({ onClose }) {
  const addQuestion = usePaperStore((s) => s.addQuestion)
  // Track which question IDs are currently rendering (to disable their add button)
  const renderingRef = useRef(new Set())

  // Filters
  const [classNum, setClassNum] = useState(6)
  const [subject] = useState('math')
  const [chapterId, setChapterId] = useState(null)
  const [qType, setQType] = useState(null) // null = all

  // Questions state
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [addedIds, setAddedIds] = useState(new Set())
  const [renderingId, setRenderingId] = useState(null) // question id currently rendering

  // Cart (selected questions to add at once)
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Get chapters for selected class
  const chapters = VAULT_INDEX[classNum]?.[subject] || []

  // Reset chapter when class changes
  useEffect(() => {
    setChapterId(null)
    setQuestions([])
    setSelectedIds(new Set())
    setAddedIds(new Set())
  }, [classNum])

  // Fetch questions when chapter selected
  const fetchQuestions = useCallback(async () => {
    if (!chapterId) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (qType) params.set('type', qType)
      const { data } = await api.get(
        `/vault/questions/${classNum}/${subject}/${chapterId}?${params}`
      )
      setQuestions(data.questions || [])
      setAddedIds(new Set())
      setSelectedIds(new Set())
    } catch (err) {
      toast.error('ভল্ট থেকে প্রশ্ন লোড করতে ব্যর্থ')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [classNum, subject, chapterId, qType])

  useEffect(() => {
    if (chapterId) fetchQuestions()
  }, [chapterId, fetchQuestions])

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Add single question — auto-renders GeoGebra shape if ggb_commands present
  const handleAddOne = async (vq) => {
    if (renderingRef.current.has(vq.id)) return   // already rendering, ignore double-click

    // DEBUG — remove after fix
    console.log('[VaultAdd] vq.type:', vq.type, '| ggb_commands:', vq.ggb_commands)

    const pq = vaultToPaperQuestion(vq)

    // Auto-render geometry shape if commands exist and no image yet
    if (vq.ggb_commands && !pq.stimulus_image) {
      renderingRef.current.add(vq.id)
      // Force re-render to show the spinner on this card
      setRenderingId(vq.id)

      const toastId = toast.loading('জ্যামিতিক চিত্র তৈরি হচ্ছে...', { duration: 20000 })

      try {
        const imageUrl = await renderGeoGebraToImage(vq.ggb_commands)
        if (imageUrl) {
          pq.stimulus_image = imageUrl
          toast.success('চিত্র তৈরি হয়েছে!', { id: toastId })
        } else {
          toast.error('চিত্র তৈরি ব্যর্থ — ইন্টারনেট সংযোগ চেক করুন', { id: toastId })
        }
      } catch {
        toast.error('চিত্র তৈরি ব্যর্থ হয়েছে', { id: toastId })
      } finally {
        renderingRef.current.delete(vq.id)
        setRenderingId(null)
      }
    }

    addQuestion(pq)
    setAddedIds((prev) => new Set(prev).add(vq.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(vq.id)
      return next
    })
    if (!vq.ggb_commands) toast.success('প্রশ্ন যোগ হয়েছে!')
  }

  // Add all selected
  const handleAddSelected = () => {
    const toAdd = questions.filter((q) => selectedIds.has(q.id) && !addedIds.has(q.id))
    if (toAdd.length === 0) {
      toast.error('কোনো প্রশ্ন সিলেক্ট করা হয়নি')
      return
    }
    toAdd.forEach((vq) => {
      const pq = vaultToPaperQuestion(vq)
      addQuestion(pq)
    })
    setAddedIds((prev) => {
      const next = new Set(prev)
      toAdd.forEach((q) => next.add(q.id))
      return next
    })
    setSelectedIds(new Set())
    toast.success(`${toAdd.length}টি প্রশ্ন যোগ হয়েছে!`)
  }

  // Add all
  const handleAddAll = () => {
    const toAdd = questions.filter((q) => !addedIds.has(q.id))
    if (toAdd.length === 0) {
      toast.error('সব প্রশ্ন আগেই যোগ হয়েছে')
      return
    }
    toAdd.forEach((vq) => {
      const pq = vaultToPaperQuestion(vq)
      addQuestion(pq)
    })
    setAddedIds((prev) => {
      const next = new Set(prev)
      toAdd.forEach((q) => next.add(q.id))
      return next
    })
    setSelectedIds(new Set())
    toast.success(`${toAdd.length}টি প্রশ্ন যোগ হয়েছে!`)
  }

  // Type badge colors
  const typeColors = {
    MCQ: { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
    CQ: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    short: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
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
              <span style={{ fontSize: 22 }}>🏦</span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  প্রশ্ন ব্যাংক
                </h3>
                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>
                  ভেরিফাইড প্রশ্ন ব্রাউজ করুন ও যোগ করুন
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

          {/* Filters */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            {/* Class select */}
            <select
              value={classNum}
              onChange={(e) => setClassNum(Number(e.target.value))}
              style={{
                padding: '6px 10px', borderRadius: 10, border: '1px solid #e2e8f0',
                fontSize: 12, fontWeight: 700, background: '#fff', color: '#1e293b',
                cursor: 'pointer', outline: 'none',
              }}
            >
              {VAULT_CLASSES.map((c) => (
                <option key={c} value={c}>শ্রেণি {c}</option>
              ))}
            </select>

            {/* Chapter select */}
            <select
              value={chapterId || ''}
              onChange={(e) => setChapterId(e.target.value || null)}
              style={{
                padding: '6px 10px', borderRadius: 10, border: '1px solid #e2e8f0',
                fontSize: 12, fontWeight: 700, background: '#fff', color: '#1e293b',
                cursor: 'pointer', outline: 'none', flex: 1, minWidth: 140,
              }}
            >
              <option value="">অধ্যায় বাছাই করুন</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.titleBn}
                </option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={qType || ''}
              onChange={(e) => setQType(e.target.value || null)}
              style={{
                padding: '6px 10px', borderRadius: 10, border: '1px solid #e2e8f0',
                fontSize: 12, fontWeight: 700, background: '#fff', color: '#1e293b',
                cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="">সব ধরন</option>
              {VAULT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Questions list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 20px',
              minHeight: 200,
            }}
            className="no-scrollbar"
          >
            {!chapterId && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📂</span>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
                  অধ্যায় বাছাই করুন
                </p>
                <p style={{ fontSize: 11, margin: '4px 0 0' }}>
                  বামের ড্রপডাউন থেকে অধ্যায় সিলেক্ট করুন
                </p>
              </div>
            )}

            {chapterId && loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div
                  style={{
                    width: 32, height: 32, border: '3px solid #e2e8f0',
                    borderTopColor: '#2563eb', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto',
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>লোড হচ্ছে...</p>
              </div>
            )}

            {chapterId && !loading && questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>📭</span>
                <p style={{ fontSize: 12, fontWeight: 700 }}>কোনো প্রশ্ন পাওয়া যায়নি</p>
              </div>
            )}

            {chapterId && !loading && questions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {questions.map((q) => {
                  const isAdded = addedIds.has(q.id)
                  const isSelected = selectedIds.has(q.id)
                  const tc = typeColors[q.type] || typeColors.short

                  return (
                    <div
                      key={q.id}
                      onClick={() => !isAdded && toggleSelect(q.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: `1px solid ${isSelected ? '#2563eb' : isAdded ? '#d1fae5' : '#f1f5f9'}`,
                        background: isAdded ? '#f0fdf4' : isSelected ? '#eff6ff' : '#fff',
                        cursor: isAdded ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        transition: 'all 0.15s',
                        opacity: isAdded ? 0.6 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: `2px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                          background: isSelected ? '#2563eb' : isAdded ? '#d1fae5' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        {(isSelected || isAdded) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Type badge + marks */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 9, fontWeight: 800, padding: '2px 6px',
                              borderRadius: 6, background: tc.bg, color: tc.text,
                              border: `1px solid ${tc.border}`,
                            }}
                          >
                            {q.type === 'MCQ' ? 'MCQ' : q.type === 'CQ' ? 'সৃজনশীল' : 'সংক্ষিপ্ত'}
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                            {q.marks || q.totalMarks || '?'} নম্বর
                          </span>
                        </div>

                        {/* Question preview */}
                        {q.type === 'CQ' ? (
                          <div>
                            {q.stimulus && (
                              <p style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', margin: '0 0 4px', lineHeight: 1.5 }}>
                                <span style={{ color: '#6d28d9', fontWeight: 800 }}>উদ্দীপক: </span>
                                {q.stimulus.length > 150 ? q.stimulus.substring(0, 150) + '…' : q.stimulus}
                              </p>
                            )}
                            {q.parts && Object.entries(q.parts).map(([label, text]) => (
                              <p key={label} style={{ fontSize: 10, fontWeight: 600, color: '#475569', margin: '2px 0', lineHeight: 1.4, paddingLeft: 8 }}>
                                <span style={{ color: '#2563eb', fontWeight: 800 }}>{label}) </span>
                                {typeof text === 'string' ? (text.length > 80 ? text.substring(0, 80) + '…' : text) : ''}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p
                            style={{
                              fontSize: 12, fontWeight: 600, color: '#1e293b',
                              margin: 0, lineHeight: 1.5,
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {(q.question || '').substring(0, 120)}
                          </p>
                        )}

                        {/* MCQ options preview */}
                        {q.type === 'MCQ' && q.options && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            {Object.entries(q.options).map(([k, v]) => (
                              <span
                                key={k}
                                style={{
                                  fontSize: 9, color: '#64748b', background: '#f8fafc',
                                  padding: '1px 5px', borderRadius: 4, border: '1px solid #e2e8f0',
                                }}
                              >
                                {k}) {String(v).substring(0, 20)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add button */}
                      {!isAdded && renderingId !== q.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddOne(q)
                          }}
                          className="btn-press"
                          style={{
                            padding: '4px 10px', borderRadius: 8, border: 'none',
                            background: '#2563eb', color: '#fff', fontSize: 10,
                            fontWeight: 800, cursor: 'pointer', flexShrink: 0,
                            whiteSpace: 'nowrap', marginTop: 2,
                          }}
                        >
                          + যোগ
                        </button>
                      )}
                      {/* Rendering spinner */}
                      {renderingId === q.id && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          flexShrink: 0, marginTop: 2,
                        }}>
                          <div style={{
                            width: 12, height: 12,
                            border: '2px solid #e2e8f0',
                            borderTopColor: '#2563eb',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                          <span style={{ fontSize: 9, color: '#2563eb', fontWeight: 700 }}>
                            চিত্র...
                          </span>
                        </div>
                      )}
                      {isAdded && (
                        <span
                          style={{
                            fontSize: 9, fontWeight: 800, color: '#10b981',
                            flexShrink: 0, marginTop: 4,
                          }}
                        >
                          ✓ যোগ হয়েছে
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          {chapterId && questions.length > 0 && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                background: '#fafafa',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                {selectedIds.size > 0
                  ? `${selectedIds.size}টি সিলেক্টেড`
                  : `${questions.length}টি প্রশ্ন`}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleAddSelected}
                    className="btn-press"
                    style={{
                      padding: '6px 14px', borderRadius: 10, border: 'none',
                      background: '#2563eb', color: '#fff', fontSize: 11,
                      fontWeight: 800, cursor: 'pointer',
                    }}
                  >
                    {selectedIds.size}টি যোগ করুন
                  </button>
                )}
                <button
                  onClick={handleAddAll}
                  className="btn-press"
                  style={{
                    padding: '6px 14px', borderRadius: 10, border: '1px solid #e2e8f0',
                    background: '#fff', color: '#1e293b', fontSize: 11,
                    fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  সব যোগ করুন ({questions.filter((q) => !addedIds.has(q.id)).length})
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}