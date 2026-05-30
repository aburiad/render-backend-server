/**
 * Process an exam image for AI scanning.
 *
 * @param {HTMLImageElement} imgElement
 * @param {object} completedCrop  — pixel crop from react-image-crop v11
 * @param {object} options
 * @param {number} options.maxDim  — max pixel dimension (default 1200 for Vercel, 2000 for Render)
 * @param {number} options.quality — JPEG quality 0-1 (default 0.92 for Vercel, 0.95 for Render)
 */
export async function processExamImage(imgElement, completedCrop, options = {}) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Step 1: Crop
  // react-image-crop v11 onComplete gives pixel crop directly.
  // But the crop box is drawn on the *displayed* image (scaled by CSS),
  // so we must scale pixel values back to the natural image dimensions.
  const displayW = imgElement.width   // CSS-rendered width
  const displayH = imgElement.height  // CSS-rendered height
  const scaleX = imgElement.naturalWidth / displayW
  const scaleY = imgElement.naturalHeight / displayH

  const cropX = completedCrop.x * scaleX
  const cropY = completedCrop.y * scaleY
  const cropWidth = completedCrop.width * scaleX
  const cropHeight = completedCrop.height * scaleY

  // Step 2: Resize — caller controls maxDim based on active backend.
  //   Vercel (10s limit) → 1200px: enough for most text, keeps response fast.
  //   Render (no limit)  → 2000px: preserves fine Bengali/Arabic/formula detail.
  //   No resize if image is already smaller than maxDim.
  const maxDim = options.maxDim || 1200
  let outW = cropWidth
  let outH = cropHeight
  if (outW > maxDim || outH > maxDim) {
    const ratio = Math.min(maxDim / outW, maxDim / outH)
    outW = Math.round(outW * ratio)
    outH = Math.round(outH * ratio)
  }

  canvas.width = outW
  canvas.height = outH

  // Step 3: Draw cropped area (white background for transparent images)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)
  ctx.drawImage(imgElement, cropX, cropY, cropWidth, cropHeight, 0, 0, outW, outH)

  // Step 4: Quality — high quality to preserve fine text strokes.
  //   Using JPEG (not WebP) to avoid double-compression artifacts:
  //   Original JPEG → WebP re-encodes twice, blurring fine Bangla strokes.
  //   JPEG → JPEG at high quality preserves text sharpness much better.
  const quality = options.quality || 0.92

  // Step 5: JPEG export — keeps original format, avoids WebP double-compression
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result) // base64 dataURL
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      quality
    )
  })
}

export function detectBlur(imgElement) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = imgElement.naturalWidth
  canvas.height = imgElement.naturalHeight
  ctx.drawImage(imgElement, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Laplacian variance — blur measure
  let sum = 0, sumSq = 0, count = 0
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    sum += gray
    sumSq += gray * gray
    count++
  }
  const mean = sum / count
  const variance = sumSq / count - mean * mean

  // variance < 100 = likely blurry
  return variance < 100
}
