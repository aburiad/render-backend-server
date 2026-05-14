import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/services/api'
import useNoticeStore, { EMPTY_NOTICE, DEMO_NOTICE } from '@/store/noticeStore'
import StimulusImage from '@/components/shared/StimulusImage'
import BlockEditor from '@/components/notice/BlockEditor'
import Loader from '@/components/shared/Loader'

const SECTION_LABEL = {
  header: 'হেডার',
  meta: 'তারিখ ও রেফারেন্স',
  title: 'শিরোনাম',
  body: 'মূল লেখা',
  signature: 'স্বাক্ষর',
  copyTo: 'কপি প্রাপ্ত',
  footer: 'ফুটার ব্যানার',
}

export default function NoticeEditor() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const notice = useNoticeStore((s) => s.currentNotice)
  const isDirty = useNoticeStore((s) => s.isDirty)
  const setNotice = useNoticeStore((s) => s.setNotice)
  const updateNotice = useNoticeStore((s) => s.updateNotice)
  const markClean = useNoticeStore((s) => s.markClean)
  const clearNotice = useNoticeStore((s) => s.clearNotice)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openSection, setOpenSection] = useState('header')

  // Load existing OR seed empty/demo
  useEffect(() => {
    if (id) {
      setLoading(true)
      api
        .get(`/notices/${id}`)
        .then(({ data }) => setNotice(data.notice))
        .catch(() => {
          toast.error('নোটিশ লোড করতে ব্যর্থ')
          navigate('/notices')
        })
        .finally(() => setLoading(false))
    } else if (!notice || notice.id) {
      // New notice — pick template based on ?template= query
      const useDemo = searchParams.get('template') === 'demo'
      setNotice({ ...(useDemo ? DEMO_NOTICE : EMPTY_NOTICE) })
    }
    return () => {
      // cleanup happens on save/manual nav
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const saveToBackend = useCallback(async () => {
    const state = useNoticeStore.getState()
    if (!state.isDirty || saving) return
    const current = state.currentNotice
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
        const { data } = await api.put(`/notices/${current.id}`, payload)
        // merge minimal fields, keep current body_blocks order
        setNotice(data.notice)
      } else {
        const { data } = await api.post('/notices', payload)
        setNotice(data.notice)
        window.history.replaceState(null, '', `/notices/${data.notice.id}`)
      }
      markClean()
    } catch (err) {
      console.error('Notice save failed:', err.message)
      toast.error('সেভ করতে ব্যর্থ')
    } finally {
      setSaving(false)
    }
  }, [saving, setNotice, markClean])

  const handleSave = async () => {
    await saveToBackend()
    if (!useNoticeStore.getState().isDirty) {
      toast.success('সেভ হয়েছে!')
    }
  }

  const handlePreview = async () => {
    if (isDirty) await saveToBackend()
    const fresh = useNoticeStore.getState().currentNotice
    if (fresh?.id) navigate(`/notices/${fresh.id}/preview`)
  }

  if (loading || !notice) {
    return <Loader message="নোটিশ লোড হচ্ছে..." />
  }

  const set = (fields) => updateNotice(fields)

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            clearNotice()
            navigate('/notices')
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          নোটিশ লিস্ট
        </button>
        <h1 className="text-base font-bold text-gray-900">{id ? 'সম্পাদনা' : 'নতুন নোটিশ'}</h1>
        <div className="flex gap-2">
          {notice.id && (
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
        {/* HEADER */}
        <Section
          id="header"
          label={SECTION_LABEL.header}
          openId={openSection}
          setOpenId={setOpenSection}
        >
          <Field label="উপরের লাইন (ঐচ্ছিক)">
            <input
              type="text"
              value={notice.header_top_line || ''}
              onChange={(e) => set({ header_top_line: e.target.value })}
              placeholder="উদা: গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
              className={inputCls}
            />
          </Field>

          <Field label="লোগো">
            <StimulusImage
              value={notice.header_logo_url}
              onChange={(v) => set({ header_logo_url: v || null })}
              accentColor="#2563eb"
              label="+ লোগো আপলোড"
            />
          </Field>

          <Field label="প্রতিষ্ঠানের নাম">
            <input
              type="text"
              value={notice.header_org_name || ''}
              onChange={(e) => set({ header_org_name: e.target.value })}
              placeholder="উদা: দিনাজপুর সরকারি বালিকা উচ্চ বিদ্যালয়"
              className={inputCls}
            />
          </Field>

          <Field label="সাব-টাইটেল (কার্যালয় / শাখা)">
            <input
              type="text"
              value={notice.header_subtitle || ''}
              onChange={(e) => set({ header_subtitle: e.target.value })}
              placeholder="উদা: প্রধান শিক্ষকের কার্যালয়"
              className={inputCls}
            />
          </Field>

          <Field label="ঠিকানা / Web / Codes">
            <textarea
              value={notice.header_address || ''}
              onChange={(e) => set({ header_address: e.target.value })}
              placeholder="উদা: www.dgghs.edu.bd, Board Code: 7514"
              rows={2}
              className={textareaCls}
            />
          </Field>

          <Field label="যোগাযোগ (ফোন / মোবাইল / ইমেইল)">
            <textarea
              value={notice.header_contact || ''}
              onChange={(e) => set({ header_contact: e.target.value })}
              placeholder="উদা: টেলিফোন: ০৫৩১-৬৫০২০, মোবাইল: ০১৩০৯-..."
              rows={2}
              className={textareaCls}
            />
          </Field>

          <Field label="অ্যালাইনমেন্ট">
            <div className="flex gap-2">
              {[
                { v: 'left', l: 'বাম' },
                { v: 'center', l: 'মাঝে' },
                { v: 'right', l: 'ডান' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => set({ header_alignment: opt.v })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${
                    notice.header_alignment === opt.v
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* META */}
        <Section
          id="meta"
          label={SECTION_LABEL.meta}
          openId={openSection}
          setOpenId={setOpenSection}
        >
          <Field label="রেফারেন্স নম্বর (ঐচ্ছিক)">
            <input
              type="text"
              value={notice.reference_no || ''}
              onChange={(e) => set({ reference_no: e.target.value })}
              placeholder="উদা: Shyamoli MATS/০১২"
              className={inputCls}
            />
          </Field>
          <Field label="তারিখ">
            <input
              type="text"
              value={notice.notice_date || ''}
              onChange={(e) => set({ notice_date: e.target.value })}
              placeholder="উদা: ২৭/০৫/২০২৫ বা 02/09/2020"
              className={inputCls}
            />
          </Field>
          <Field label="তারিখ লেবেল">
            <input
              type="text"
              value={notice.date_label || ''}
              onChange={(e) => set({ date_label: e.target.value })}
              placeholder="তারিখ / Date"
              className={inputCls}
            />
          </Field>
        </Section>

        {/* TITLE */}
        <Section
          id="title"
          label={SECTION_LABEL.title}
          openId={openSection}
          setOpenId={setOpenSection}
        >
          <Field label="">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notice.show_title !== false}
                onChange={(e) => set({ show_title: e.target.checked })}
              />
              <span className="text-xs text-gray-600">শিরোনাম দেখাও</span>
            </div>
          </Field>
          <Field label="শিরোনাম">
            <input
              type="text"
              value={notice.title || ''}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="উদা: জরুরী নোটিশ / NOTICE"
              className={inputCls}
            />
          </Field>
          <Field label="বিষয় (Subject - ঐচ্ছিক)">
            <input
              type="text"
              value={notice.subject || ''}
              onChange={(e) => set({ subject: e.target.value })}
              placeholder="উদা: IGCSE Registration, Oct/Nov 2020"
              className={inputCls}
            />
          </Field>
        </Section>

        {/* BODY BLOCKS */}
        <Section
          id="body"
          label={SECTION_LABEL.body}
          openId={openSection}
          setOpenId={setOpenSection}
        >
          <BlockEditor />
        </Section>

        {/* SIGNATURE */}
        <Section
          id="signature"
          label={SECTION_LABEL.signature}
          openId={openSection}
          setOpenId={setOpenSection}
        >
          <Field label="স্বাক্ষরের ছবি (ঐচ্ছিক)">
            <StimulusImage
              value={notice.signature_image_url}
              onChange={(v) => set({ signature_image_url: v || null })}
              accentColor="#16a34a"
              label="+ স্বাক্ষর আপলোড"
            />
          </Field>
          <Field label="নাম">
            <input
              type="text"
              value={notice.signature_name || ''}
              onChange={(e) => set({ signature_name: e.target.value })}
              placeholder="উদা: নাজমা ইয়াসমীন"
              className={inputCls}
            />
          </Field>
          <Field label="পদবি">
            <input
              type="text"
              value={notice.signature_title || ''}
              onChange={(e) => set({ signature_title: e.target.value })}
              placeholder="উদা: প্রধান শিক্ষক (ভারপ্রাপ্ত)"
              className={inputCls}
            />
          </Field>
          <Field label="প্রতিষ্ঠান (ঐচ্ছিক)">
            <textarea
              value={notice.signature_org || ''}
              onChange={(e) => set({ signature_org: e.target.value })}
              rows={2}
              className={textareaCls}
            />
          </Field>
          <Field label="অবস্থান">
            <div className="flex gap-2">
              {[
                { v: 'left', l: 'বাম' },
                { v: 'right', l: 'ডান' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => set({ signature_align: opt.v })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${
                    notice.signature_align === opt.v
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* COPY TO */}
        <Section
          id="copyTo"
          label={SECTION_LABEL.copyTo}
          openId={openSection}
          setOpenId={setOpenSection}
        >
          <CopyToEditor
            items={notice.copy_to || []}
            onChange={(items) => set({ copy_to: items })}
          />
        </Section>

        {/* FOOTER */}
        <Section
          id="footer"
          label={SECTION_LABEL.footer}
          openId={openSection}
          setOpenId={setOpenSection}
        >
          <Field label="ফুটার টেক্সট">
            <input
              type="text"
              value={notice.footer_text || ''}
              onChange={(e) => set({ footer_text: e.target.value })}
              placeholder="উদা: দক্ষ ও আদর্শবান মেডিকেল..."
              className={inputCls}
            />
          </Field>
          <Field label="ফুটার রঙ">
            <div className="flex gap-2 flex-wrap">
              {['', '#dc2626', '#0d9488', '#1e40af', '#7c3aed', '#16a34a', '#000000'].map((c) => (
                <button
                  key={c}
                  onClick={() => set({ footer_color: c })}
                  title={c || 'কোনোটি না'}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: c || '#fff',
                    border: notice.footer_color === c ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  }}
                >
                  {!c && <span className="text-[10px] text-gray-400">x</span>}
                </button>
              ))}
            </div>
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
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2.5}
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

function CopyToEditor({ items, onChange }) {
  const list = items.length === 0 ? [''] : items

  const update = (i, v) => {
    const next = [...list]
    next[i] = v
    onChange(next.filter((x, idx) => x || idx === 0))
  }
  const add = () => onChange([...list, ''])
  const remove = (i) => {
    const next = list.filter((_, idx) => idx !== i)
    onChange(next.length === 0 ? [] : next)
  }

  return (
    <div className="space-y-1.5">
      {list.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
          <input
            type="text"
            value={it}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`উদা: Principal / Notice Board`}
            className={inputCls}
          />
          <button
            onClick={() => remove(i)}
            className="text-gray-300 hover:text-red-500"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button onClick={add} className="text-[11px] text-blue-600 font-medium hover:text-blue-700">
        + আরেকটি যোগ করুন
      </button>
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const textareaCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
