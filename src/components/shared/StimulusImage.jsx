import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { enhanceDiagram, cropAndEnhance } from '@/lib/enhanceImage'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const MAX_FILE_BYTES = 10 * 1024 * 1024

/**
 * Image upload for CQ stimulus with crop + H/W controls.
 * H/W values are persisted to question data via onHeightChange/onWidthChange
 * so they apply in PaperTemplate (PDF preview) too.
 */
export default function StimulusImage({
  value,
  onChange,
  accentColor = '#7c3aed',
  label = '+ ছবি যোগ করুন (উদ্দীপক)',
  imageHeight,
  imageWidth,
  onHeightChange,
  onWidthChange,
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  // Internal fallback when external props not provided
  const [imgH, setImgH] = useState(180)
  const [imgW, setImgW] = useState(240)

  const h = imageHeight ?? imgH
  const w = imageWidth ?? imgW
  const setH = onHeightChange ?? setImgH
  const setW = onWidthChange ?? setImgW

  // Crop state
  const [rawImage, setRawImage] = useState(null)
  const [crop, setCrop] = useState({ unit: '%', width: 90, x: 5, y: 5, height: 90 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('শুধুমাত্র ছবি (jpg/png) আপলোড করা যাবে')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error('ছবির সাইজ ১০ MB-এর কম হতে হবে')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setRawImage(reader.result)
      setCrop({ unit: '%', width: 90, x: 5, y: 5, height: 90 })
      setCompletedCrop(null)
    }
    reader.readAsDataURL(file)
  }

  const confirmCrop = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0) {
      try {
        const enhanced = await enhanceDiagram(rawImage)
        onChange(enhanced)
      } catch { onChange(rawImage) }
      setRawImage(null)
      return
    }
    setBusy(true)
    try {
      const cropped = await cropAndEnhance(imgRef.current, completedCrop)
      onChange(cropped)
      toast.success('ছবি ক্রপ হয়েছে!')
    } catch {
      toast.error('ক্রপ করতে সমস্যা হয়েছে')
      try {
        const enhanced = await enhanceDiagram(rawImage)
        onChange(enhanced)
      } catch { onChange(rawImage) }
    } finally {
      setBusy(false)
      setRawImage(null)
    }
  }

  const useFullImage = async () => {
    setBusy(true)
    try {
      const enhanced = await enhanceDiagram(rawImage)
      onChange(enhanced)
    } catch { onChange(rawImage) }
    finally { setBusy(false); setRawImage(null) }
  }

  return (
    <div className="mt-2">
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />

      {/* Crop Modal */}
      {rawImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-4 py-3 bg-purple-600 text-white flex items-center justify-between">
              <span className="text-sm font-bold">✂️ ছবি ক্রপ করুন</span>
              <button onClick={() => setRawImage(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-auto flex items-center justify-center bg-gray-100">
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
                <img ref={imgRef} src={rawImage} alt="Crop" className="max-h-[50vh] w-auto object-contain" />
              </ReactCrop>
            </div>
            <div className="px-4 py-3 flex gap-2 bg-white border-t">
              <button onClick={confirmCrop} disabled={busy} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50">
                {busy ? 'প্রসেসিং...' : '✅ ক্রপ করুন'}
              </button>
              <button onClick={useFullImage} disabled={busy} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 disabled:opacity-50">
                পুরো ছবি
              </button>
            </div>
          </div>
        </div>
      )}

      {value ? (
        <div className="flex flex-col gap-2">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={value}
              alt="উদ্দীপক ছবি"
              style={{
                maxWidth: w,
                maxHeight: h,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                objectFit: 'contain',
                background: '#fff',
              }}
            />
            <div style={{ position: 'absolute', top: -8, right: -8, display: 'flex', gap: 4 }}>
              <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} title="ছবি বদলান"
                style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', color: accentColor, fontSize: 12, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: busy ? 'wait' : 'pointer' }}>
                ↻
              </button>
              <button type="button" onClick={() => { setRawImage(value); setCrop({ unit: '%', width: 90, x: 5, y: 5, height: 90 }); setCompletedCrop(null) }} title="ক্রপ করুন"
                style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', color: '#10b981', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
                ✂
              </button>
              <button type="button" onClick={() => onChange('')} title="ছবি মুছুন"
                style={{ width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.15)', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          </div>
          {/* Height/Width controls - always visible */}
          <div className="flex items-center gap-3 text-[11px]">
            <label className="flex items-center gap-1 text-gray-500 font-medium">
              উচ্চতা:
              <input type="number" value={h} onChange={(e) => setH(Number(e.target.value) || 180)} min={40} max={600}
                className="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-center text-[11px] bg-white" />
              <span className="text-gray-400">px</span>
            </label>
            <label className="flex items-center gap-1 text-gray-500 font-medium">
              প্রস্থ:
              <input type="number" value={w} onChange={(e) => setW(Number(e.target.value) || 240)} min={40} max={800}
                className="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-center text-[11px] bg-white" />
              <span className="text-gray-400">px</span>
            </label>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline disabled:opacity-50" style={{ color: accentColor }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {busy ? 'প্রসেস হচ্ছে...' : label}
        </button>
      )}
    </div>
  )
}