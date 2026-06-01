import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { enhanceDiagram, cropAndEnhance } from '@/lib/enhanceImage'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

/**
 * Reusable image upload with crop + H/W controls.
 * H/W persisted to question data via onHeightChange/onWidthChange
 * so they apply in PaperTemplate (PDF preview) too.
 */
export default function ImageUploadButton({
  value,
  onChange,
  label = '📷 ছবি',
  imageHeight,
  imageWidth,
  onHeightChange,
  onWidthChange,
}) {
  const fileRef = useRef(null)
  const [enhancing, setEnhancing] = useState(false)
  // Internal fallback when external props not provided
  const [imgH, setImgH] = useState(128)
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
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ছবি 10MB এর বেশি হতে পারবে না')
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
    setEnhancing(true)
    try {
      const cropped = await cropAndEnhance(imgRef.current, completedCrop)
      onChange(cropped)
      toast.success('ডায়াগ্রাম ক্রপ হয়েছে!')
    } catch {
      toast.error('ক্রপ করতে সমস্যা হয়েছে')
      try {
        const enhanced = await enhanceDiagram(rawImage)
        onChange(enhanced)
      } catch { onChange(rawImage) }
    } finally {
      setEnhancing(false)
      setRawImage(null)
    }
  }

  const useFullImage = async () => {
    setEnhancing(true)
    try {
      const enhanced = await enhanceDiagram(rawImage)
      onChange(enhanced)
    } catch { onChange(rawImage) }
    finally { setEnhancing(false); setRawImage(null) }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Crop Modal Overlay */}
      {rawImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between">
              <span className="text-sm font-bold">✂️ ছবি ক্রপ করুন</span>
              <button onClick={() => setRawImage(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
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
            <div className="px-4 py-3 flex gap-2 bg-white border-t border-gray-100">
              <button onClick={confirmCrop} disabled={enhancing}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                {enhancing ? 'প্রসেসিং...' : '✅ ক্রপ করুন'}
              </button>
              <button onClick={useFullImage} disabled={enhancing}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50">
                পুরো ছবি ব্যবহার
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview or Upload Button */}
      {value ? (
        <div className="flex flex-col gap-1.5">
          <div className="relative group inline-block">
            <img
              src={value}
              alt="Question diagram"
              style={{
                maxHeight: h,
                maxWidth: w,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                objectFit: 'contain',
                background: '#fff',
              }}
            />
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button"
                onClick={async () => {
                  setEnhancing(true)
                  try {
                    const enhanced = await enhanceDiagram(value)
                    onChange(enhanced)
                    toast.success('ছবি উন্নত করা হয়েছে')
                  } catch { toast.error('ছবি উন্নত করা যায়নি') }
                  finally { setEnhancing(false) }
                }}
                disabled={enhancing}
                className="px-1.5 py-1 bg-white/90 text-blue-600 rounded-lg text-[10px] font-bold shadow-sm hover:bg-blue-50"
                title="আবার উন্নত করুন">
                {enhancing ? '...' : '✨'}
              </button>
              <button type="button"
                onClick={() => { setRawImage(value); setCrop({ unit: '%', width: 90, x: 5, y: 5, height: 90 }); setCompletedCrop(null) }}
                className="px-1.5 py-1 bg-white/90 text-emerald-600 rounded-lg text-[10px] font-bold shadow-sm hover:bg-emerald-50"
                title="✂️ আবার ক্রপ করুন">
                ✂️
              </button>
              <button type="button" onClick={() => onChange(null)}
                className="px-1.5 py-1 bg-white/90 text-red-500 rounded-lg text-[10px] font-bold shadow-sm hover:bg-red-50"
                title="ছবি মুছুন">
                ✕
              </button>
            </div>
          </div>
          {/* Height/Width controls - always visible */}
          <div className="flex items-center gap-3 text-[11px]">
            <label className="flex items-center gap-1 text-gray-500 font-medium">
              উচ্চতা:
              <input type="number" value={h} onChange={(e) => setH(Number(e.target.value) || 128)} min={40} max={600}
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
        <div className="flex gap-1.5">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {label}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  )
}