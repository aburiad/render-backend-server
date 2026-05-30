/**
 * Process an exam image for AI scanning.
 *
 * @param {HTMLImageElement} imgElement
 * @param {object} completedCrop  — pixel crop from react-image-crop v11
 * @param {object} options
 * @param {number} options.maxDim     — max pixel dimension (auto from questionType if not set)
 * @param {number} options.quality    — JPEG quality 0-1 (default 0.92)
 * @param {string} options.questionType — question type for smart dimension selection
 */

// Type-based max dimension:
//   Simple text types  → 1200px (MCQ, short answer — no complex formulas)
//   Complex types      → 2000px (CQ, math, Arabic — fine detail needed)
//   Default            → 1600px (everything else)
const SIMPLE_TYPES = new Set(['mcq', 'short', 'fill_blank', 'true_false', 'matching', 'rearrange'])
const COMPLEX_TYPES = new Set(['cq', 'math', 'accounting', 'arabic', 'hadith', 'fiqh', 'passage'])

function getMaxDimForType(questionType) {
  if (SIMPLE_TYPES.has(questionType)) return 1200
  if (COMPLEX_TYPES.has(questionType)) return 2000
  return 1600
}

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

  // Step 2: Smart resize — dimension based on question type.
  //   Caller can override with explicit maxDim (e.g. Vercel forces 1200px max).
  const typeDim = getMaxDimForType(options.questionType)
  const maxDim = options.maxDim ? Math.min(options.maxDim, typeDim) : typeDim

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

  // Step 4: Grayscale conversion — reduces file size 30-40% with no OCR quality loss.
  //   Text OCR does not need color information. Grayscale saves tokens on paid tiers.
  //   Exception: accounting tables sometimes use color coding — keep color for those.
  if (options.questionType !== 'accounting') {
    const imageData = ctx.getImageData(0, 0, outW, outH)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      // Standard luminance formula: 0.299R + 0.587G + 0.114B
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      data[i] = gray       // R
      data[i + 1] = gray   // G
      data[i + 2] = gray   // B
      // data[i + 3] = alpha (unchanged)
    }
    ctx.putImageData(imageData, 0, 0)
  }

  // Step 5: Quality — high quality to preserve fine text strokes.
  //   Using JPEG (not WebP) to avoid double-compression artifacts.
  const quality = options.quality || 0.92

  // Step 6: JPEG export
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
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
