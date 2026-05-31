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
    this.maxWidth = 2000 // Optimal width for OCR
    this.quality = 90 // JPEG quality percentage
  }

  /**
   * Main processing pipeline
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @returns {Promise<string>} - Processed base64 image
   */
  async process(base64Image) {
    try {
      // Step 1: Remove data URL prefix if present and decode base64 to buffer
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')

      // Step 2: Create Sharp instance
      let image = sharp(buffer)

      // Step 3: Get metadata for processing decisions
      const metadata = await image.metadata()

      // Step 4: Apply processing pipeline
      image = await this.applyProcessingPipeline(image, metadata)

      // Step 5: Resize if needed
      if (metadata.width > this.maxWidth) {
        image = image.resize(this.maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: 'lanczos3' // Best for text
        })
      }

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
   * Apply the full processing pipeline
   * @param {Sharp} image - Sharp instance
   * @param {Object} metadata - Image metadata
   * @returns {Sharp} - Processed Sharp instance
   */
  async applyProcessingPipeline(image, metadata) {
    // Step 1: Grayscale (reduces color noise)
    image = image.grayscale()

    // Step 2: Normalize (enhances contrast automatically)
    image = image.normalize()

    // Step 3: Sharpen text edges (improves character recognition)
    image = image.sharpen({
      sigma: 1, // Gaussian blur radius
      flat: 0.5, // Sharpening for flat areas
      jagged: 2 // Sharpening for jagged edges (text)
    })

    // Step 4: Median filter (removes salt & pepper noise)
    image = image.median(1)

    // Step 5: Threshold for high-contrast black & white
    // This is critical for OCR - makes text stand out
    image = image.threshold(128)

    return image
  }

  /**
   * Light processing for already good quality images
   * Use when you want minimal changes
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @returns {Promise<string>} - Lightly processed base64 image
   */
  async lightProcess(base64Image) {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')
      let image = sharp(buffer)
      const metadata = await image.metadata()

      // Only grayscale and normalize
      image = image.grayscale().normalize()

      // Resize if too large
      if (metadata.width > this.maxWidth) {
        image = image.resize(this.maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }

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
  async aggressiveProcess(base64Image) {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')
      let image = sharp(buffer)
      const metadata = await image.metadata()

      // Full pipeline with stronger parameters
      image = image.grayscale()
      
      // Stronger normalization
      image = image.normalize()
      
      // Aggressive sharpening
      image = image.sharpen({
        sigma: 1.5,
        flat: 0.8,
        jagged: 3
      })
      
      // Stronger median filter
      image = image.median(2)
      
      // Adaptive threshold (better for varying contrast)
      image = image.threshold(120)
      
      // Upscale small images (interpolation)
      if (metadata.width < 800) {
        image = image.resize(1600, null, {
          fit: 'inside',
          kernel: 'lanczos3'
        })
      } else if (metadata.width > this.maxWidth) {
        image = image.resize(this.maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
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