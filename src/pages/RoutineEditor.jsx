import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/services/api'
import useRoutineStore, {
  buildEmptyRoutine,
  buildDemoPrimary,
  buildDemoSecondary,
} from '@/store/routineStore'
import StimulusImage from '@/components/shared/StimulusImage'
import SubjectPalette from '@/components/routine/SubjectPalette'
import RoutineGrid from '@/components/routine/RoutineGrid'
import Loader from '@/components/shared/Loader'

export default function RoutineEditor() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const routine = useRoutineStore((s) => s.currentRoutine)
  const isDirty = useRoutineStore((s) => s.isDirty)
  const setRoutine = useRoutineStore((s) => s.setRoutine)
  const updateRoutine = useRoutineStore((s) => s.updateRoutine)
  const markClean = useRoutineStore((s) => s.markClean)
  const clearRoutine = useRoutineStore((s) => s.clearRoutine)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openSection, setOpenSection] = useState('grid')

  useEffect(() => {
    if (id) {
      setLoading(true)
      api
        .get(`/routines/${id}`)
        .then(({ data }) => setRoutine(data.routine))
        .catch(() => {
          toast.error('রুটিন লোড করতে ব্যর্থ')
          navigate('/routines')
        })
        .finally(() => setLoading(false))
    } else if (!routine || routine.id) {
      const tpl = searchParams.get('template')
      if (tpl === 'primary') setRoutine(buildDemoPrimary())
      else if (tpl === 'secondary') setRoutine(buildDemoSecondary())
      else setRoutine(buildEmptyRoutine())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const saveToBackend = useCallback(async () => {
    const state = useRoutineStore.getState()
    if (!state.isDirty || saving) return
    const current = state.currentRoutine
    if (!current) return

    setSaving(true)
    try {
      const payload = { ...current }
      delete payload.id
      delete payload.userId
      delete payload.createdAt
      delete payload.updatedAt
      delete payload.deleted

      if (current.id) {
        const { data } = await api.put(`/routines/${current.id}`, payload)
        setRoutine(data.routine)
      } else {
        const { data } = await api.post('/routines', payload)
        setRoutine(data.routine)
        window.history.replaceState(null, '', `/routines/${data.routine.id}`)
      }
      markClean()
    } catch (err) {
      console.error('Routine save failed:', err.message)
      toast.error('সেভ করতে ব্যর্থ')
    } finally {
      setSaving(false)
    }
  }, [saving, setRoutine, markClean])

  const handleSave = async () => {
    await saveToBackend()
    if (!useRoutineStore.getState().isDirty) toast.success('সেভ হয়েছে!')
  }

  const handlePreview = async () => {
    if (isDirty) await saveToBackend()
    const fresh = useRoutineStore.getState().currentRoutine
    if (fresh?.id) navigate(`/routines/${fresh.id}/preview`)
  }

  if (loading || !routine) {
    return <Loader message="রুটিন লোড হচ্ছে..." />
  }

  const set = (fields) => updateRoutine(fields)

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => { clearRoutine(); navigate('/routines') }}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          রুটিন লিস্ট
        </button>
        <h1 className="text-base font-bold text-gray-900">{id ? 'সম্পাদনা' : 'নতুন রুটিন'}</h1>
        <div className="flex gap-2">
          {routine.id && (
            <button
              onClick={handlePreview}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100"
            >
              প্রিভিউ
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              isDirty
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {saving ? '...' : 'সেভ'}
          </button>
        </div>
      </div>

      <div className="text-[10px] font-semibold mb-3" style={{ color: isDirty ? '#3b82f6' : '#10b981' }}>
        {isDirty ? '• পরিবর্তন আছে' : '• সব সেভ আছে'}
      </div>

      <div className="space-y-3">
        {/* IDENTITY */}
        <Section id="identity" label="শ্রেণি ও পরিচিতি" openId={openSection} setOpenId={setOpenSection}>
          <Field label="রুটিনের শিরোনাম">
            <input
              type="text"
              value={routine.title || ''}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="উদা: ক্লাস রুটিন"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="শ্রেণি">
              <input
                type="text"
                value={routine.class_name || ''}
                onChange={(e) => set({ class_name: e.target.value })}
                placeholder="৬ষ্ঠ শ্রেণি"
                className={inputCls}
              />
            </Field>
            <Field label="শাখা">
              <input
                type="text"
                value={routine.section || ''}
                onChange={(e) => set({ section: e.target.value })}
                placeholder="ক / খ / বিজ্ঞান"
                className={inputCls}
              />
            </Field>
            <Field label="বছর">
              <input
                type="text"
                value={routine.year || ''}
                onChange={(e) => set({ year: e.target.value })}
                placeholder="২০২৫"
                className={inputCls}
              />
            </Field>
            <Field label="কার্যকর তারিখ">
              <input
                type="text"
                value={routine.effective_from || ''}
                onChange={(e) => set({ effective_from: e.target.value })}
                placeholder="১ জানুয়ারি ২০২৫"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* HEADER */}
        <Section id="header" label="স্কুলের তথ্য (হেডার)" openId={openSection} setOpenId={setOpenSection}>
          <Field label="উপরের লাইন">
            <input
              type="text"
              value={routine.header_top_line || ''}
              onChange={(e) => set({ header_top_line: e.target.value })}
              placeholder="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (ঐচ্ছিক)"
              className={inputCls}
            />
          </Field>
          <Field label="লোগো">
            <StimulusImage
              value={routine.header_logo_url}
              onChange={(v) => set({ header_logo_url: v || null })}
              accentColor="#2563eb"
              label="+ লোগো আপলোড"
            />
          </Field>
          <Field label="স্কুলের নাম">
            <input
              type="text"
              value={routine.school_name || ''}
              onChange={(e) => set({ school_name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="সাব-টাইটেল">
            <input
              type="text"
              value={routine.school_subtitle || ''}
              onChange={(e) => set({ school_subtitle: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="ঠিকানা">
            <input
              type="text"
              value={routine.school_address || ''}
              onChange={(e) => set({ school_address: e.target.value })}
              className={inputCls}
            />
          </Field>
        </Section>

        {/* SUBJECT PALETTE */}
        <Section id="subjects" label="Subject Palette (subject + teacher)" openId={openSection} setOpenId={setOpenSection}>
          <SubjectPalette />
        </Section>

        {/* GRID — main UX */}
        <Section id="grid" label="রুটিন গ্রিড" openId={openSection} setOpenId={setOpenSection}>
          <RoutineGrid />
        </Section>

        {/* DISPLAY */}
        <Section id="display" label="প্রদর্শন সেটিংস" openId={openSection} setOpenId={setOpenSection}>
          <Field label="পেপার অরিয়েন্টেশন">
            <div className="flex gap-2">
              {[
                { v: 'landscape', l: 'ল্যান্ডস্কেপ (অনুভূমিক)' },
                { v: 'portrait', l: 'পোর্ট্রেট (উল্লম্ব)' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => set({ orientation: opt.v })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${
                    routine.orientation === opt.v
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={routine.show_period_time !== false}
                onChange={(e) => set({ show_period_time: e.target.checked })}
              />
              পিরিয়ডের সময় দেখাও
            </label>
            <label className="flex items-center gap-2 text-xs mt-1.5">
              <input
                type="checkbox"
                checked={routine.show_teacher_name !== false}
                onChange={(e) => set({ show_teacher_name: e.target.checked })}
              />
              টিচারের নাম দেখাও
            </label>
          </Field>
        </Section>

        {/* FOOTER */}
        <Section id="footer" label="ফুটার ও স্বাক্ষর" openId={openSection} setOpenId={setOpenSection}>
          <Field label="নোট">
            <textarea
              value={routine.footer_note || ''}
              onChange={(e) => set({ footer_note: e.target.value })}
              placeholder="বিশেষ দ্রষ্টব্য (ঐচ্ছিক)"
              rows={2}
              className={textareaCls}
            />
          </Field>
          <Field label="স্বাক্ষরের নাম">
            <input
              type="text"
              value={routine.signature_name || ''}
              onChange={(e) => set({ signature_name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="পদবি">
            <input
              type="text"
              value={routine.signature_title || ''}
              onChange={(e) => set({ signature_title: e.target.value })}
              placeholder="প্রধান শিক্ষক"
              className={inputCls}
            />
          </Field>
        </Section>
      </div>
    </div>
  )
}

function Section({ id, label, openId, setOpenId, children }) {
  const open = openId === id
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-gray-900">{label}</span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5}
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-4">{children}</div>}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      {label && (
        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const textareaCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
