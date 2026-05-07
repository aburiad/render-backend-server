import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { listAllTeachers } from '@/utils/teacherSchedule'
import { SkeletonListItem } from '@/components/shared/SkeletonCard'

export default function TeachersList() {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api
      .get('/routines')
      .then(({ data }) => setRoutines(data.routines || []))
      .catch(() => toast.error('রুটিন লোড করতে ব্যর্থ'))
      .finally(() => setLoading(false))
  }, [])

  const teachers = useMemo(() => listAllTeachers(routines), [routines])
  const filtered = teachers.filter(
    (t) =>
      !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/routines')}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          ক্লাস রুটিন
        </button>
        <h1 className="text-base font-bold text-gray-900">টিচার রুটিন</h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-[11px] text-blue-900">
        💡 ক্লাস রুটিন থেকে সব teacher-এর সাপ্তাহিক schedule **স্বয়ংক্রিয়ভাবে** তৈরি হয়েছে।
        কোনো teacher নাম পরিবর্তন করতে চাইলে সংশ্লিষ্ট ক্লাস রুটিন edit করুন।
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          className="input"
          style={{ paddingLeft: 44 }}
          placeholder="টিচার খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[1, 2, 3, 4].map((i) => <SkeletonListItem key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          {teachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 36,
              }}>
                👨‍🏫
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                কোনো টিচার খুঁজে পাওয়া যায়নি
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: '0 0 24px' }}>
                আগে ক্লাস রুটিন তৈরি করুন। সেখানে subject + teacher input দিলে এখানে স্বয়ংক্রিয়ভাবে আসবে।
              </p>
              <button onClick={() => navigate('/routines')} className="btn btn-primary">
                ক্লাস রুটিন তৈরি করুন
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <p style={{ fontSize: 'var(--text-lg)', margin: '0 0 8px' }}>🔍</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                "{searchQuery}" এর জন্য কোনো ফলাফল নেই
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map((teacher) => (
            <TeacherRow
              key={teacher.name}
              teacher={teacher}
              onClick={() => navigate(`/routines/teachers/${encodeURIComponent(teacher.name)}`)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function TeacherRow({ teacher, onClick }) {
  const initial = teacher.name.charAt(0)
  return (
    <div
      onClick={onClick}
      className="btn-press"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#1e40af', fontWeight: 800, fontSize: 18,
      }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
          margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {teacher.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: '#2563eb', fontWeight: 600 }}>
            {teacher.count} ক্লাস/সপ্তাহ
          </span>
          {teacher.classNames.length > 0 && (
            <>
              <span style={{ color: 'var(--border)', fontSize: 10 }}>·</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {teacher.classNames.slice(0, 3).join(', ')}
                {teacher.classNames.length > 3 && ` +${teacher.classNames.length - 3}`}
              </span>
            </>
          )}
        </div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} style={{ flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  )
}
