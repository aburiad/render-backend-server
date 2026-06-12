import { useRef, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { enhanceDiagram, cropAndEnhance } from '@/lib/enhanceImage'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import DiagramButton from '@/components/shared/DiagramButton'
import BookGeometryButton from '@/components/shared/BookGeometryButton'
import ImageAnnotationModal from '@/components/shared/ImageAnnotationModal'

const MAX_FILE_BYTES = 10 * 1024 * 1024

/** Live preview for enhance modal */
function EnhancePreview({ image, brightness, contrast }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    if (!image.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const maxW = 360
      const scale = Math.min(maxW / img.width, 1)
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctx.filter = 'none'
    }
    img.src = image
  }, [image, brightness, contrast])

  return (
    <div className="flex items-center justify-center p-3 bg-gray-100">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
    </div>
  )
}

export default function StimulusImage({
  value,
  onChange,
  accentColor = '#7c3aed',
  label = '+ ছবি যোগ করুন (উদ্দীপক)',
  imageHeight,
  imageWidth,
  onHeightChange,
  onWidthChange,
  showDiagramButton = true,
  showBookGeometry = true,
  imageAlign,
  onAlignChange,
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [imgH, setImgH] = useState(180)
  const [imgW, setImgW] = useState(240)
  const [align, setAlign] = useState('center')

  const h = imageHeight ?? imgH
  const w = imageWidth ?? imgW
  const setH = onHeightChange ?? setImgH
  const setW = onWidthChange ?? setImgW

  const currentAlign = imageAlign ?? align
  const setCurrentAlign = (v) => { setAlign(v); onAlignChange?.(v) }

  // Crop state
  const [rawImage, setRawImage] = useState(null)
  const [annotateImage, setAnnotateImage] = useState(null)
  const [enhanceModal, setEnhanceModal] = useState(null)
  const [crop, setCrop] = useState({ unit: '%', width: 90, x: 5, y: 5, height: 90 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('শুধুমাত্র ছবি (jpg/png) আপলোড করা যাবে'); return }
    if (file.size > MAX_FILE_BYTES) { toast.error('ছবির সাইজ ১০ MB-এর কম হতে হবে'); return }
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
      onChange(rawImage)
      setRawImage(null)
      return
    }
    setBusy(true)
    try {
      const cropped = await cropAndEnhance(imgRef.current, completedCrop, { autoWhiten: false })
      onChange(cropped)
      toast.success('ছবি ক্রপ হয়েছে!')
    } catch {
      toast.error('ক্রপ করতে সমস্যা হয়েছে')
      onChange(rawImage)
    } finally { setBusy(false); setRawImage(null) }
  }

  const useFullImage = () => { onChange(rawImage); setRawImage(null) }

  return (
    <div className="mt-2">
      {/* Annotation Modal */}
      {annotateImage && (
        <ImageAnnotationModal
          imageUrl={annotateImage}
          onSave={(annotated) => { onChange(annotated); setAnnotateImage(null); toast.success('অ্যানোটেশন সংরক্ষিত!') }}
          onClose={() => setAnnotateImage(null)}
        />
      )}

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
              <button onClick={useFullImage} disabled={busy} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200">
                পুরো ছবি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhance Modal */}
      {enhanceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between">
              <span className="text-sm font-bold">✨ ছবি উন্নত করুন</span>
              <button onClick={() => setEnhanceModal(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EnhancePreview image={enhanceModal.image} brightness={enhanceModal.brightness} contrast={enhanceModal.contrast} />
            <div className="px-4 py-3 space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <span className="w-20 text-gray-600 font-medium">উজ্জ্বলতা</span>
                <input type="range" min="50" max="200" value={enhanceModal.brightness}
                  onChange={(e) => setEnhanceModal({ ...enhanceModal, brightness: Number(e.target.value) })} className="flex-1" />
                <span className="w-10 text-right font-mono text-xs text-gray-500">{enhanceModal.brightness}%</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <span className="w-20 text-gray-600 font-medium">কনট্রাস্ট</span>
                <input type="range" min="50" max="200" value={enhanceModal.contrast}
                  onChange={(e) => setEnhanceModal({ ...enhanceModal, contrast: Number(e.target.value) })} className="flex-1" />
                <span className="w-10 text-right font-mono text-xs text-gray-500">{enhanceModal.contrast}%</span>
              </label>
            </div>
            <div className="px-4 py-3 flex gap-2 border-t">
              <button onClick={() => setEnhanceModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200">বাতিল</button>
              <button onClick={async () => {
                setBusy(true)
                try {
                  const enhanced = await enhanceDiagram(enhanceModal.image, { brightness: enhanceModal.brightness, contrast: enhanceModal.contrast })
                  onChange(enhanced)
                  toast.success('ছবি উন্নত হয়েছে!')
                } catch { toast.error('উন্নত করা যায়নি') }
                finally { setBusy(false); setEnhanceModal(null) }
              }} disabled={busy}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                {busy ? 'প্রসেসিং...' : '✅ প্রয়োগ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {value ? (
        <div className="flex flex-col gap-2">
          <div style={{ textAlign: currentAlign }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={value} alt="উদ্দীপক ছবি" style={{ maxWidth: w, maxHeight: h, borderRadius: 12, border: '1px solid #e5e7eb', objectFit: 'contain', background: '#fff' }} />
              <div style={{ position: 'absolute', top: -8, right: -8, display: 'flex', gap: 4 }}>
                <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} title="ছবি বদলান"
                  style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', color: accentColor, fontSize: 12, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: busy ? 'wait' : 'pointer' }}>↻</button>
                <button type="button" onClick={() => { setRawImage(value); setCrop({ unit: '%', width: 90, x: 5, y: 5, height: 90 }); setCompletedCrop(null) }} title="ক্রপ করুন"
                  style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', color: '#10b981', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer' }}>✂</button>
                <button type="button" onClick={() => setAnnotateImage(value)} title="✏️ ছবিতে লিখুন/আঁকুন"
                  style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', color: '#7c3aed', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer' }}>✏</button>
                <button type="button" onClick={() => onChange('')} title="ছবি মুছুন"
                  style={{ width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.15)', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <button type="button" onClick={() => setAnnotateImage(value)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-bold hover:bg-purple-100 border border-purple-200">✏️ আঁকুন</button>
            <button type="button" onClick={() => setEnhanceModal({ image: value, brightness: 100, contrast: 100 })}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold hover:bg-blue-100 border border-blue-200">✨ উন্নত</button>
            <button type="button" onClick={() => { setRawImage(value); setCrop({ unit: '%', width: 90, x: 5, y: 5, height: 90 }); setCompletedCrop(null) }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold hover:bg-emerald-100 border border-emerald-200">✂️ ক্রপ</button>
            <button type="button" onClick={() => onChange('')}
              className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-100 border border-red-200">✕ মুছুন</button>
          </div>
          {/* Alignment + H/W */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-medium">অ্যালাইন:</span>
              {[
                { val: 'left', title: 'বাম' },
                { val: 'center', title: 'মাঝ' },
                { val: 'right', title: 'ডান' },
              ].map(opt => (
                <button key={opt.val} type="button" title={opt.title} onClick={() => setCurrentAlign(opt.val)}
                  style={{ padding: '2px 6px', borderRadius: 5, border: `1.5px solid ${currentAlign === opt.val ? accentColor : '#e2e8f0'}`, background: currentAlign === opt.val ? accentColor : '#fff', color: currentAlign === opt.val ? '#fff' : '#64748b', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
                  {opt.title}
                </button>
              ))}
            </div>
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
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline disabled:opacity-50" style={{ color: accentColor }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {busy ? 'প্রসেস হচ্ছে...' : label}
          </button>
          {showDiagramButton && <DiagramButton onSave={onChange} />}
          {showBookGeometry && <BookGeometryButton onSave={onChange} />}
        </div>
      )}
    </div>
  )
}