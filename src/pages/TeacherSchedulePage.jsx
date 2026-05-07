import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { buildTeacherSchedule } from '@/utils/teacherSchedule'
import TeacherScheduleTemplate from '@/components/routine/TeacherScheduleTemplate'

export default function TeacherSchedulePage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const paperRef = useRef(null)

  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [font, setFont] = useState('Noto Serif Bengali')

  const teacherName = decodeURIComponent(name || '')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get('/routines')
      .then(({ data }) => { if (!cancelled) setRoutines(data.routines || []) })
      .catch(() => {
        if (!cancelled) {
          toast.error('রুটিন লোড করতে ব্যর্থ')
          navigate('/routines/teachers')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [navigate])

  const schedule = useMemo(
    () => (loading ? null : buildTeacherSchedule(routines, teacherName)),
    [loading, routines, teacherName],
  )

  // Pick the first non-empty school name from contributing routines
  const schoolName = useMemo(() => {
    if (!routines || !schedule) return ''
    const contributing = routines.filter((r) =>
      (r.subjects || []).some(
        (s) => (s.teacher || '').trim().toLowerCase() === teacherName.trim().toLowerCase(),
      ),
    )
    return contributing.find((r) => r.school_name)?.school_name || ''
  }, [routines, schedule, teacherName])

  async function handleDownload() {
    if (!paperRef.current || downloading || !schedule) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      if (document.fonts) {
        await Promise.all([
          document.fonts.load(`400 16px "${font}"`),
          document.fonts.load(`700 16px "${font}"`),
          document.fonts.load(`400 16px "Hind Siliguri"`),
        ])
        await document.fonts.ready
      }
      const filename = `${teacherName}_রুটিন.pdf`.replace(/[\\/:*?"<>|]/g, '_')
      // Horizontal margins are baked into the paperRef wrapper as inline
      // padding (`padding: '0 12mm'`); jsPDF margin must be 0 horizontal,
      // otherwise the two stack and shift content right → cut off.
      await html2pdf()
        .set({
          margin: [12, 0, 12, 0],
          filename,
          image: { type: 'png' },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: paperRef.current.offsetWidth,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
          pagebreak: { mode: ['css'] },
        })
        .from(paperRef.current)
        .save()
    } catch (err) {
      console.error('[TeacherSchedule] download failed:', err)
      toast.error('PDF তৈরি করতে সমস্যা হয়েছে')
    } finally {
      setDownloading(false)
    }
  }

  function handlePrint() {
    if (!paperRef.current) return

    // Clone into print-host wrapper at body root.
    const clone = paperRef.current.cloneNode(true)
    const host = document.createElement('div')
    host.className = 'print-host'
    host.appendChild(clone)
    document.body.appendChild(host)
    document.body.classList.add('is-printing')

    // Teacher schedule is always landscape; 5mm horizontal margin matches
    // the paperRef padding so the 287mm-wide template fills the page.
    const style = document.createElement('style')
    style.media = 'print'
    style.textContent = `@page { size: A4 landscape; margin: 12mm 5mm; }`
    document.head.appendChild(style)

    const originalTitle = document.title
    document.title = `${teacherName} রুটিন`

    const cleanup = () => {
      document.body.classList.remove('is-printing')
      host.remove()
      style.remove()
      document.title = originalTitle
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup, { once: true })

    setTimeout(() => window.print(), 80)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-3">
          <Link to="/routines/teachers" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900 truncate" style={{ maxWidth: 240 }}>
              {teacherName}
            </h1>
            <p className="text-[11px] text-gray-400">
              {loading
                ? 'লোড হচ্ছে...'
                : schedule
                ? `${schedule.totalSlots} ক্লাস/সপ্তাহ • ${schedule.classCount} শ্রেণি${schedule.conflicts > 0 ? ` • ⚠ ${schedule.conflicts} দ্বন্দ্ব` : ''}`
                : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="text-xs px-2 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none"
          >
            <option value="Noto Serif Bengali">Noto Serif Bengali</option>
            <option value="Hind Siliguri">Hind Siliguri</option>
          </select>
          <button
            onClick={handleDownload}
            disabled={!schedule || downloading || schedule?.totalSlots === 0}
            className="px-4 h-9 flex items-center gap-1.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-40 btn-press shadow-lg shadow-blue-600/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? '...' : 'PDF'}
          </button>
          <button
            onClick={handlePrint}
            disabled={!schedule || schedule?.totalSlots === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200"
            title="প্রিন্ট"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.061 48.061 0 0110.5 0m-10.5 0V4.875c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125 1.125v3.034" />
            </svg>
          </button>
        </div>
      </div>

      {schedule?.conflicts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-3 text-[11px] text-red-800 no-print">
          ⚠ <strong>সময়ের দ্বন্দ্ব:</strong> {schedule.teacher} একই সময়ে একাধিক ক্লাসে assigned —
          ক্লাস রুটিন check করুন।
        </div>
      )}

      <div
        className="rounded-2xl no-print-bg routine-preview-scroll"
        style={{
          background: '#e5e7eb',
          padding: 16,
          minHeight: '60vh',
          overflowX: 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
          </div>
        ) : schedule?.totalSlots === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
            <div style={{ fontSize: 48 }}>👨‍🏫</div>
            <p className="text-base font-bold text-gray-700">{teacherName}-এর কোনো ক্লাস নেই</p>
            <p className="text-sm text-gray-500">
              এই teacher-এর নাম কোনো ক্লাস রুটিন-এর subject palette-এ পাওয়া যায়নি
            </p>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', justifyContent: 'center', minWidth: '100%' }}>
            <div className="paper-sheet-shadow" style={{ flexShrink: 0, padding: '12mm 0', margin: '0 auto' }}>
              <div
                ref={paperRef}
                style={{
                  width: '297mm',
                  // Tighter 5mm horizontal padding so the wide teacher grid
                  // (often 6+ days × many time slots) gets more breathing room
                  // on landscape A4. Template inner width is 287mm to match.
                  padding: '0 5mm',
                  boxSizing: 'border-box',
                  background: '#fff',
                }}
              >
                <TeacherScheduleTemplate schedule={schedule} schoolName={schoolName} font={font} />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
