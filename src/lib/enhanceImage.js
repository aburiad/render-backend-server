/**
 * Enhance a cropped diagram image using Canvas API.
 * Whitens the background and sharpens lines for clean print output.
 *
 * @param {string} dataUrl — source image (data URL or blob URL)
 * @param {object} options
 * @param {number} options.brightness — 0-200, default 130 (slightly brighter)
 * @param {number} options.contrast — 0-200, default 150 (stronger contrast)
 * @param {boolean} options.autoWhiten — default true
 * @returns {Promise<string>} — enhanced image as data URL (PNG)
 */
export function enhanceDiagram(dataUrl, options = {}) {
  const {
    brightness = 130,
    contrast = 150,
    autoWhiten = true,
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')

      // Draw original
      ctx.drawImage(img, 0, 0)

      if (autoWhiten) {
        // Apply CSS filter via canvas for brightness + contrast
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
        ctx.drawImage(canvas, 0, 0)
        ctx.filter = 'none'

        // Threshold near-white pixels to pure white + force alpha=255
        // This cleans up grayish backgrounds from book paper and ensures
        // the exported PNG has a solid white background (no transparency).
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const threshold = 200 // pixels lighter than this become white
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2]
          const avg = (r + g + b) / 3
          if (avg > threshold) {
            data[i] = 255
            data[i + 1] = 255
            data[i + 2] = 255
          }
          data[i + 3] = 255 // force fully opaque for solid white background
        }
        ctx.putImageData(imageData, 0, 0)
      }

      // Export as PNG (lossless for diagrams)
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return }
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        },
        'image/png'
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Crop a region from a source image and optionally enhance it.
 *
 * @param {HTMLImageElement} imgEl - the source image element
 * @param {object} cropRect - { x, y, width, height } in display pixels
 * @param {object} options - enhance options
 * @returns {Promise<string>} - enhanced cropped image as data URL
 */
export function cropAndEnhance(imgEl, cropRect, options = {}) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Scale from display to natural dimensions
    const scaleX = imgEl.naturalWidth / imgEl.width
    const scaleY = imgEl.naturalHeight / imgEl.height

    const sx = cropRect.x * scaleX
    const sy = cropRect.y * scaleY
    const sw = cropRect.width * scaleX
    const sh = cropRect.height * scaleY

    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

    if (options.autoWhiten !== false) {
      // Apply brightness + contrast
      const brightness = options.brightness || 130
      const contrast = options.contrast || 150

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'

      // Threshold near-white to pure white + force alpha=255 for solid white bg
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const threshold = options.threshold || 200
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        if (avg > threshold) {
          data[i] = 255
          data[i + 1] = 255
          data[i + 2] = 255
        }
        data[i + 3] = 255 // force fully opaque for solid white background
      }
      ctx.putImageData(imageData, 0, 0)
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Canvas toBlob failed')); return }
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      },
      'image/png'
    )
  })
}