import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

const MAX_WIDTH = 1200
const JPEG_QUALITY = 0.85
const MAX_FILE_BYTES = 8 * 1024 * 1024

async function fileToResizedDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read-fail'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('decode-fail'))
      img.onload = () => {
        const ratio = Math.min(MAX_WIDTH / img.width, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        // jpeg keeps payload size predictable; png-with-transparency loses
        // little here because the print background is always white anyway.
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function StimulusImage({ value, onChange, accentColor = '#7c3aed', label = '+ ছবি যোগ করুন (উদ্দীপক)' }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('শুধুমাত্র ছবি (jpg/png) আপলোড করা যাবে')
      e.target.value = ''
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error('ছবির সাইজ ৮ MB-এর কম হতে হবে')
      e.target.value = ''
      return
    }
    setBusy(true)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      onChange(dataUrl)
    } catch {
      toast.error('ছবি প্রসেস করতে সমস্যা হয়েছে')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="mt-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />

      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={value}
            alt="উদ্দীপক ছবি"
            style={{
              maxWidth: 240,
              maxHeight: 180,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              objectFit: 'contain',
              background: '#fff',
            }}
          />
          <div style={{ position: 'absolute', top: -8, right: -8, display: 'flex', gap: 4 }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              title="ছবি বদলান"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#fff', border: '1px solid #e5e7eb',
                color: accentColor, fontSize: 12, fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                cursor: busy ? 'wait' : 'pointer',
              }}
            >
              ↻
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              title="ছবি মুছুন"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline disabled:opacity-50"
          style={{ color: accentColor }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {busy ? 'প্রসেস হচ্ছে...' : label}
        </button>
      )}
    </div>
  )
}
