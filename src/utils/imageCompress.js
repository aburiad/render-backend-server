/**
 * Client-side image compression for AI scan uploads.
 *
 * Why:
 *   - Vercel serverless functions cap request body at ~4.5MB on Hobby tier;
 *     un-compressed phone camera shots can easily exceed that and fail.
 *   - Smaller payload = faster upload on BD mobile connections.
 *   - Smaller image = fewer vision tokens charged by Gemini = lower cost
 *     (without hurting OCR quality — 1600px wide is plenty for handwriting).
 *   - Less bandwidth eaten from Vercel's 100GB/month free quota.
 *
 * Strategy: scale longest side to `maxDimension` (default 1280px) and
 * re-encode as JPEG at `quality` (default 0.75).
 * We compress ALL images to ensure consistency and lower token usage for OCR.
 */

const DEFAULTS = {
  maxDimension: 1280,
  quality: 0.75,
  outputType: 'image/jpeg',
}

/**
 * Compress a File / Blob and return a JPEG data URL.
 *
 * @param {File|Blob} fileOrBlob
 * @param {object} [opts]
 * @returns {Promise<string>} data URL (image/jpeg;base64,...)
 */
export async function compressImageToDataUrl(fileOrBlob, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts }

  const dataUrl = await blobToDataUrl(fileOrBlob)
  return resizeDataUrl(dataUrl, cfg)
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function resizeDataUrl(dataUrl, cfg) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width: w0, height: h0 } = img
      const longest = Math.max(w0, h0)
      const scale = longest > cfg.maxDimension ? cfg.maxDimension / longest : 1
      const w = Math.round(w0 * scale)
      const h = Math.round(h0 * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      
      // Fill with white background first, so transparent PNGs don't become black in JPEG
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)

      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)

      // toDataURL is synchronous and may throw on tainted canvas — but our
      // source is a same-origin data URL so it's safe.
      try {
        const out = canvas.toDataURL(cfg.outputType, cfg.quality)
        resolve(out)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Could not decode image'))
    img.src = dataUrl
  })
}

/**
 * Quick helper: roughly estimate the bytes encoded in a data URL.
 * Useful for UX: warn user if the image is huge.
 */
export function approximateDataUrlBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 0
  const commaIdx = dataUrl.indexOf(',')
  const b64 = dataUrl.slice(commaIdx + 1)
  // base64 expands by ~4/3, so original ≈ length * 0.75
  return Math.round(b64.length * 0.75)
}
