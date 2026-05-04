import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import toast from 'react-hot-toast'

/* ─── Animation variants ─────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

/* ─── Sub-Components ─────────────────────────────────────── */
function ExamCard({ exam, onSelect, onCopy }) {
  const isLive = exam.status === 'active'
  const qCount = exam.questions?.length || 0

  return (
    <motion.div variants={item}>
      <div className="card" style={{ padding: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0
          }}>
            📋
          </div>
          <span style={{
            fontSize: 10, fontWeight: 800, px: 10, py: 4,
            borderRadius: 100, border: '1px solid',
            background: isLive ? '#f0fdf4' : '#f8fafc',
            color: isLive ? '#16a34a' : '#64748b',
            borderColor: isLive ? '#dcfce7' : '#e2e8f0',
            padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.02em'
          }}>
            {isLive ? '• লাইভ' : 'বন্ধ'}
          </span>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 4px', lineHeight: 1.3 }}>
          {exam.title}
        </h3>
        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: '0 0 16px' }}>
          {exam.institution || 'প্রতিষ্ঠান উল্লেখ নেই'}
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, background: '#f8fafc', padding: '8px 12px', borderRadius: 12 }}>
            <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase' }}>সময়</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>{exam.duration} মি.</p>
          </div>
          <div style={{ flex: 1, background: '#f8fafc', padding: '8px 12px', borderRadius: 12 }}>
            <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase' }}>প্রশ্ন</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>{qCount} টি</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onSelect(exam)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, height: 44, borderRadius: 12, fontSize: 13, fontWeight: 700 }}
          >
            ফলাফল দেখুন
          </button>
          <button
            onClick={() => onCopy(exam.id)}
            style={{
              width: 44, height: 44, borderRadius: 12, border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', background: '#fff'
            }}
            title="লিঙ্ক কপি করুন"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function StudentResultCard({ submission, idx }) {
  return (
    <motion.div variants={item}>
      <div style={{
        background: '#fff', padding: '16px', borderRadius: 16,
        display: 'flex', alignItems: 'center', gap: 14,
        border: '1px solid #f1f5f9', marginBottom: 12,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: '#f1f5f9', color: '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15, flexShrink: 0
        }}>
          {submission.studentRoll || idx + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            {submission.studentName}
          </p>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
            {new Date(submission.submittedAt).toLocaleString('bn-BD', {
              hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
            })}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            display: 'inline-block', padding: '6px 12px',
            background: '#eff6ff', color: '#2563eb',
            borderRadius: 10, fontWeight: 900, fontSize: 14
          }}>
            {submission.score}/{submission.totalPossible}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Results() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exam')
      setExams(data.exams || [])
    } catch (err) {
      toast.error('পরীক্ষা তালিকা লোড করতে ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam)
    setLoadingSubmissions(true)
    try {
      const { data } = await api.get(`/exam/${exam.id}/results`)
      setSubmissions(data.results || [])
    } catch (err) {
      toast.error('রেজাল্ট লোড করতে ব্যর্থ হয়েছে')
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const copyExamLink = (id) => {
    const link = `${window.location.origin}/exam/${id}`
    navigator.clipboard.writeText(link)
    toast.success('লিঙ্ক কপি করা হয়েছে!')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 180, borderRadius: 20 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      <AnimatePresence mode="wait">
        {!selectedExam ? (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>ফলাফল</h1>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>আপনার পাবলিশ করা সকল পরীক্ষা</p>
              </div>
              <div style={{ background: '#f0f9ff', padding: '6px 14px', borderRadius: 100, border: '1px solid #e0f2fe' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0369a1' }}>
                  মোট: {exams.length}
                </span>
              </div>
            </motion.div>

            {exams.length === 0 ? (
              <motion.div variants={item} style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>কোনো পাবলিশ করা পরীক্ষা নেই</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>নতুন পরীক্ষা শুরু করতে প্রশ্ন এডিটর ব্যবহার করুন</p>
              </motion.div>
            ) : (
              exams.map(exam => (
                <ExamCard 
                  key={exam.id} 
                  exam={exam} 
                  onSelect={handleSelectExam} 
                  onCopy={copyExamLink} 
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="details"
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button
                onClick={() => setSelectedExam(null)}
                className="btn-press"
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#fff', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1e293b'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                  {selectedExam.title}
                </h1>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>স্টুডেন্ট রেজাল্ট লিস্ট</p>
              </div>
            </motion.div>

            {loadingSubmissions ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton" style={{ height: 72, borderRadius: 16 }} />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <motion.div variants={item} style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>এখনো কেউ পরীক্ষা দেয়নি</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 20px' }}>লিঙ্কটি স্টুডেন্টদের সাথে শেয়ার করুন</p>
                <button
                   onClick={() => copyExamLink(selectedExam.id)}
                   className="btn btn-outline btn-sm"
                >
                  লিঙ্ক কপি করুন
                </button>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {submissions.map((sub, i) => (
                  <StudentResultCard key={sub.id} idx={i} submission={sub} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
