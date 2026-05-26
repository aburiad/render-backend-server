import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import Spinner from './Spinner'

/**
 * In-app camera with:
 * - Real-time blur detection (Laplacian variance)
 * - Real-time brightness check
 * - Document framing guide overlay
 * - Auto-enhancement on capture (contrast, sharpness)
 * - Output: compressed WebP ≤ 1000px for minimal tokens
 */
export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)

  const [status, setStatus] = useState('starting') // starting, ready, capturing, processing
  const [blurScore, setBlurScore] = useState(0)
  const [brightness, setBrightness] = useState(0)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')

  // Quality thresholds
  const BLUR_THRESHOLD = 80
  const BRIGHT_MIN = 40
  const BRIGHT_MAX = 220

  // Start camera
  const startCamera = useCallback(async (facing = 'environment') => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Check flash support
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.() || {}
      setHasFlash(!!capabilities.torch)

      setStatus('ready')
    } catch (err) {
      console.error('Camera error:', err)
      toast.error('ক্যামেরা অ্যাক্সেস করতে ব্যর্থ — অনুগ্রহ করে অনুমতি দিন')
      onCancel()
    }
  }, [onCancel])

  // Toggle flash
  const toggleFlash = async () => {
    try {
      const track = streamRef.current?.getVideoTracks()[0]
      if (!track) return
      const capabilities = track.getCapabilities?.() || {}
      if (capabilities.torch) {
        const newState = !flashOn
        await track.applyConstraints({ advanced: [{ torch: newState }] })
        setFlashOn(newState)
      }
    } catch {
      // Flash not supported
    }
  }

  // Switch camera
  const switchCamera = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newFacing)
    setFlashOn(false)
    await startCamera(newFacing)
  }

  // Real-time quality analysis
  const analyzeFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(analyzeFrame)
      return
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    // Small sample for performance (analyze 160x120 area from center)
    const sampleW = 160
    const sampleH = 120
    canvas.width = sampleW
    canvas.height = sampleH

    const sx = (video.videoWidth - sampleW * 2) / 2
    const sy = (video.videoHeight - sampleH * 2) / 2
    ctx.drawImage(video, sx, sy, sampleW * 2, sampleH * 2, 0, 0, sampleW, sampleH)

    const imageData = ctx.getImageData(0, 0, sampleW, sampleH)
    const data = imageData.data

    // Brightness (average luminance)
    let lumSum = 0
    let count = data.length / 4

    // Laplacian variance for blur detection
    let grayArr = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const idx = i * 4
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
      grayArr[i] = gray
      lumSum += gray
    }
    const avgBright = lumSum / count
    setBrightness(Math.round(avgBright))

    // Laplacian on sampled grid
    let lapSum = 0
    let lapSqSum = 0
    let lapCount = 0
    for (let y = 1; y < sampleH - 1; y++) {
      for (let x = 1; x < sampleW - 1; x++) {
        const idx = y * sampleW + x
        const lap =
          grayArr[idx - sampleW] +
          grayArr[idx + sampleW] +
          grayArr[idx - 1] +
          grayArr[idx + 1] -
          4 * grayArr[idx]
        lapSum += lap
        lapSqSum += lap * lap
        lapCount++
      }
    }
    const lapMean = lapSum / lapCount
    const lapVariance = lapSqSum / lapCount - lapMean * lapMean
    setBlurScore(Math.round(lapVariance))

    animFrameRef.current = requestAnimationFrame(analyzeFrame)
  }, [])

  // Start analysis loop
  useEffect(() => {
    startCamera(facingMode)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status === 'ready') {
      animFrameRef.current = requestAnimationFrame(analyzeFrame)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [status, analyzeFrame])

  // Capture photo
  const capture = async () => {
    setStatus('processing')
    const video = videoRef.current
    if (!video) return

    // Stop analysis
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Full resolution capture
    const vw = video.videoWidth
    const vh = video.videoHeight

    // Max 1000px for token efficiency
    const maxDim = 1000
    let outW = vw
    let outH = vh
    if (outW > maxDim || outH > maxDim) {
      const ratio = Math.min(maxDim / outW, maxDim / outH)
      outW = Math.round(outW * ratio)
      outH = Math.round(outH * ratio)
    }

    canvas.width = outW
    canvas.height = outH

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outW, outH)
    ctx.drawImage(video, 0, 0, outW, outH)

    // Enhancement: Auto-contrast for document scans
    const imageData = ctx.getImageData(0, 0, outW, outH)
    const pixels = imageData.data

    // Calculate histogram for auto-contrast
    let minGray = 255
    let maxGray = 0
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
      if (gray < minGray) minGray = gray
      if (gray > maxGray) maxGray = gray
    }

    // Apply auto-contrast (stretch histogram) if image has low contrast
    const contrastRange = maxGray - minGray
    if (contrastRange > 0 && contrastRange < 200) {
      const scale = 255 / contrastRange
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.min(255, Math.max(0, ((pixels[i] - minGray) * scale) | 0))
        pixels[i + 1] = Math.min(255, Math.max(0, ((pixels[i + 1] - minGray) * scale) | 0))
        pixels[i + 2] = Math.min(255, Math.max(0, ((pixels[i + 2] - minGray) * scale) | 0))
      }
      ctx.putImageData(imageData, 0, 0)
    }

    // Unsharp mask (sharpen) for text clarity
    const sharpCanvas = document.createElement('canvas')
    sharpCanvas.width = outW
    sharpCanvas.height = outH
    const sharpCtx = sharpCanvas.getContext('2d')
    sharpCtx.drawImage(canvas, 0, 0)

    // Apply convolution: slight sharpen
    const sharpData = sharpCtx.getImageData(0, 0, outW, outH)
    const srcData = ctx.getImageData(0, 0, outW, outH)
    const sd = sharpData.data
    const sd2 = srcData.data

    // Simple 3x3 sharpen kernel: [0,-1,0,-1,5,-1,0,-1,0]
    for (let y = 1; y < outH - 1; y++) {
      for (let x = 1; x < outW - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * outW + x) * 4 + c
          const top = ((y - 1) * outW + x) * 4 + c
          const bottom = ((y + 1) * outW + x) * 4 + c
          const left = (y * outW + (x - 1)) * 4 + c
          const right = (y * outW + (x + 1)) * 4 + c
          sd[idx] = Math.min(255, Math.max(0, sd2[idx] * 5 - sd2[top] - sd2[bottom] - sd2[left] - sd2[right]))
        }
      }
    }
    sharpCtx.putImageData(sharpData, 0, 0)

    // Export as WebP (smaller than JPEG for text)
    const quality = outW < 600 ? 0.88 : 0.72
    const dataUrl = await new Promise((resolve) => {
      sharpCanvas.toBlob(
        (blob) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        },
        'image/webp',
        quality
      )
    })

    // Stop camera
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())

    onCapture(dataUrl)
  }

  const isBlurry = blurScore < BLUR_THRESHOLD
  const isDark = brightness < BRIGHT_MIN
  const isBright = brightness > BRIGHT_MAX
  const isGood = !isBlurry && !isDark && !isBright

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Hidden analysis canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="flex items-center justify-between p-3 bg-black/80 text-white z-10">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Quality indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isGood ? 'bg-green-400 animate-pulse' : isBlurry ? 'bg-red-400' : 'bg-yellow-400'}`} />
          <span className="text-xs font-bold">
            {isGood ? '✓ ভালো' : isBlurry ? 'ঝাপসা' : isDark ? 'অন্ধকার' : 'খুব উজ্জ্বল'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {hasFlash && (
            <button
              onClick={toggleFlash}
              className={`p-2 rounded-full transition-colors ${flashOn ? 'bg-yellow-500 text-white' : 'hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
          <button onClick={switchCamera} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Camera viewfinder */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Document framing guide - simple corner brackets */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[85%] max-w-lg aspect-[3/4] relative border-2 border-white/20 rounded-xl">
            {/* Corner guides */}
            <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-[3px] border-l-[3px] border-white/80 rounded-tl-xl" />
            <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-[3px] border-r-[3px] border-white/80 rounded-tr-xl" />
            <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-[3px] border-l-[3px] border-white/80 rounded-bl-xl" />
            <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-[3px] border-r-[3px] border-white/80 rounded-br-xl" />
            {/* Center text hint */}
            {status === 'ready' && !isGood && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <p className="text-white text-xs font-bold text-center">
                    {isBlurry ? '📱 ক্যামেরা স্থির করুন' : isDark ? '💡 আলোতে আনুন' : '🔆 আলো কমান'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blur/Brightness meters */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isBlurry ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${isBlurry ? 'bg-red-400' : 'bg-green-400'}`}
              style={{ width: `${Math.min(100, (blurScore / 200) * 100)}%` }}
            />
          </div>
          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark || isBright ? 'bg-yellow-900/30' : 'bg-green-900/30'}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${isDark ? 'bg-yellow-400' : isBright ? 'bg-orange-400' : 'bg-green-400'}`}
              style={{ width: `${Math.min(100, (brightness / 255) * 100)}%` }}
            />
          </div>
        </div>

        {/* Processing overlay */}
        {status === 'processing' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <Spinner size={40} color="#60a5fa" />
            <p className="text-white font-bold mt-3">প্রসেস হচ্ছে...</p>
          </div>
        )}
      </div>

      {/* Bottom capture controls */}
      <div className="p-6 bg-black flex items-center justify-center gap-8">
        {/* Gallery */}
        <label className="p-3 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return
              setStatus('processing')
              const reader = new FileReader()
              reader.onloadend = () => {
                if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
                onCapture(reader.result)
              }
              reader.readAsDataURL(file)
            }}
          />
        </label>

        {/* Capture button */}
        <button
          onClick={capture}
          disabled={status !== 'ready'}
          className={`w-[72px] h-[72px] rounded-full border-4 flex items-center justify-center transition-all ${
            isGood
              ? 'border-white bg-white/20 hover:bg-white/30 active:scale-90'
              : 'border-white/40 bg-white/10 active:scale-90'
          }`}
        >
          <div className={`w-[56px] h-[56px] rounded-full transition-all ${isGood ? 'bg-white' : 'bg-white/50'}`} />
        </button>

        {/* Spacer to balance layout */}
        <div className="w-12" />
      </div>
    </div>
  )
}