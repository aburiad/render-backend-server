export async function processExamImage(imgElement, completedCrop) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Step 1: Crop (completedCrop is percentCrop from react-image-crop)
  const cropX = (completedCrop.x / 100) * imgElement.naturalWidth
  const cropY = (completedCrop.y / 100) * imgElement.naturalHeight
  const cropWidth = (completedCrop.width / 100) * imgElement.naturalWidth
  const cropHeight = (completedCrop.height / 100) * imgElement.naturalHeight

  // Step 2: Max 1000px resize
  const maxDim = 1000
  let outW = cropWidth
  let outH = cropHeight
  if (outW > maxDim || outH > maxDim) {
    const ratio = Math.min(maxDim / outW, maxDim / outH)
    outW = Math.round(outW * ratio)
    outH = Math.round(outH * ratio)
  }

  canvas.width = outW
  canvas.height = outH

  // Step 3: Draw cropped area (White background for transparent images)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)
  ctx.drawImage(imgElement, cropX, cropY, cropWidth, cropHeight, 0, 0, outW, outH)

  // We are removing the Grayscale + Contrast boost because it destroys fine details 
  // in small, low-res images like Arabic text.

  // Adaptive quality: If the cropped image is very small, use higher quality to preserve details.
  const quality = Math.max(outW, outH) < 600 ? 0.95 : 0.70;

  // Step 5: WebP export
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result) // base64 dataURL
        reader.readAsDataURL(blob)
      },
      'image/webp',
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
