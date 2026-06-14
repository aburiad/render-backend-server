const sharp = require('sharp')

/**
 * Image Preprocessor for OCR Optimization
 * 
 * Applies image processing techniques to improve OCR accuracy:
 * 1. Grayscale conversion (reduces noise)
 * 2. Normalization (enhances contrast)
 * 3. Sharpening (improves text edge detection)
 * 4. Median filter (removes noise)
 * 5. Thresholding (creates high-contrast black & white)
 * 6. Resize optimization (optimal size for AI vision models)
 * 7. JPEG compression (reduces size while maintaining quality)
 */
class ImagePreprocessor {
  constructor() {
    // Default max dimension (longest side) — Gemini vision bills by 768×768
    // tiles, so 1024px = 1-2 tiles = 258-516 tokens. Callers should override
    // via opts.maxDim per question-type (see aiService.scanImage). The old
    // 2000px default produced 6+ tiles = 1548+ tokens per scan.
    this.maxWidth = 1024
    this.quality = 90 // JPEG quality percentage
  }

  /**
   * Apply a dimension cap to both sides using `fit: inside` so aspect ratio
   * is preserved and the image is never enlarged. Returns the same Sharp
   * instance for chaining.
   */
  _capDimensions(image, metadata, maxDim) {
    if (!maxDim) return image
    if (metadata.width > maxDim || metadata.height > maxDim) {
      return image.resize({
        width: maxDim,
        height: maxDim,
        fit: 'inside',
        withoutEnlargement: true,
        kernel: 'lanczos3', // best for text
      })
    }
    return image
  }

  /**
   * Main processing pipeline
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @param {Object} [opts]
   * @param {boolean} [opts.preserveColor=false] — skip grayscale (for accounting tables,
   *   red-ink corrections, colored stamps, where color carries signal).
   * @returns {Promise<string>} - Processed base64 image
   */
  async process(base64Image, opts = {}) {
    try {
      // Step 1: Remove data URL prefix if present and decode base64 to buffer
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')

      // Step 2: Create Sharp instance
      let image = sharp(buffer)

      // Step 3: Get metadata for processing decisions
      const metadata = await image.metadata()

      // Step 4: Apply processing pipeline
      image = await this.applyProcessingPipeline(image, metadata, opts)

      // Step 5: Dimension cap — both sides, preserving aspect ratio.
      // `opts.maxDim` lets the caller pick the token-cost tier per
      // question type (e.g. 768 for tracing, 1024 default, 1280 for CQ).
      const maxDim = opts.maxDim || this.maxWidth
      image = this._capDimensions(image, metadata, maxDim)

      // Step 6: Convert to JPEG with compression
      image = image.jpeg({ quality: this.quality })

      // Step 7: Get processed buffer
      const processedBuffer = await image.toBuffer()

      // Step 8: Return as base64
      return processedBuffer.toString('base64')
    } catch (error) {
      console.error('[ImagePreprocessor] Error processing image:', error.message)
      // Return original if processing fails
      return base64Image
    }
  }

  /**
   * Apply the full processing pipeline.
   *
   * IMPORTANT: We deliberately do NOT apply `threshold()` or `median()` here.
   * Modern vision LLMs (Gemini, Llama-Vision, Pixtral) are trained on natural
   * photos — 1-bit thresholding erases Bangla matras (ি, ী, ু), thin math
   * symbols (fraction bars, subscripts), light table borders, and pencil
   * marks → wrong/mismatched OCR. `median` also blurs out fine glyph
   * features. Keep enhancement gentle: grayscale + normalize + light sharpen.
   *
   * @param {Sharp} image - Sharp instance
   * @param {Object} metadata - Image metadata
   * @param {Object} [opts]
   * @param {boolean} [opts.preserveColor=false] — keep RGB (skip grayscale)
   * @returns {Sharp} - Processed Sharp instance
   */
  async applyProcessingPipeline(image, metadata, opts = {}) {
    if (!opts.preserveColor) {
      image = image.grayscale()
    }
    image = image.normalize()
    image = image.sharpen({ sigma: 1, flat: 0.5, jagged: 2 })
    return image
  }

  /**
   * Light processing for already good quality images
   * Use when you want minimal changes
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @returns {Promise<string>} - Lightly processed base64 image
   */
  async lightProcess(base64Image, opts = {}) {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')
      let image = sharp(buffer)
      const metadata = await image.metadata()

      // Only grayscale (optional) and normalize. No threshold — see process().
      if (!opts.preserveColor) image = image.grayscale()
      image = image.normalize()

      const maxDim = opts.maxDim || this.maxWidth
      image = this._capDimensions(image, metadata, maxDim)

      image = image.jpeg({ quality: this.quality })
      const processedBuffer = await image.toBuffer()
      return processedBuffer.toString('base64')
    } catch (error) {
      console.error('[ImagePreprocessor] Error in light processing:', error.message)
      return base64Image
    }
  }

  /**
   * Aggressive processing for low-quality images
   * Use when image is blurry, noisy, or low contrast
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @returns {Promise<string>} - Aggressively processed base64 image
   */
  async aggressiveProcess(base64Image, opts = {}) {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')
      let image = sharp(buffer)
      const metadata = await image.metadata()

      // Gentle pipeline — no threshold/median (those destroy Bangla matras
      // and thin math glyphs). Stronger sharpen + linear contrast boost is
      // safe and reversible.
      if (!opts.preserveColor) image = image.grayscale()
      image = image.normalize()
      image = image.sharpen({ sigma: 1.5, flat: 0.8, jagged: 3 })
      // Linear contrast stretch (multiply 1.1, offset -10) — boosts faint
      // text without crushing it to black/white.
      image = image.linear(1.1, -10)

      // Dimension cap. For very small inputs we still upscale (interpolation
      // gives the model more pixels for thin Bangla matras), but cap at
      // maxDim so we never explode the token budget — old code upscaled to
      // 1600px (9 tiles ≈ 2322 tokens) which defeated the point of
      // aggressive-mode being for low-quality inputs.
      const maxDim = opts.maxDim || this.maxWidth
      if (metadata.width < 800 && metadata.width < maxDim) {
        image = image.resize({
          width: maxDim,
          height: maxDim,
          fit: 'inside',
          kernel: 'lanczos3',
        })
      } else {
        image = this._capDimensions(image, metadata, maxDim)
      }

      image = image.jpeg({ quality: this.quality })
      const processedBuffer = await image.toBuffer()
      return processedBuffer.toString('base64')
    } catch (error) {
      console.error('[ImagePreprocessor] Error in aggressive processing:', error.message)
      return base64Image
    }
  }

  /**
   * Get image metadata
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @returns {Promise<Object>} - Image metadata
   */
  async getMetadata(base64Image) {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')
      const metadata = await sharp(buffer).metadata()
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
        aspectRatio: metadata.width / metadata.height,
        density: metadata.density
      }
    } catch (error) {
      console.error('[ImagePreprocessor] Error getting metadata:', error.message)
      return null
    }
  }
}

module.exports = new ImagePreprocessor()