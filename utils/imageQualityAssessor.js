const sharp = require('sharp')

/**
 * Image Quality Assessor for OCR
 * 
 * Evaluates image quality to determine if it's suitable for OCR:
 * - Resolution check (minimum 800px width)
 * - File size check (minimum 50KB)
 * - Aspect ratio check (avoid extreme ratios)
 * - Noise detection (via standard deviation)
 * - Blur detection (via Laplacian variance)
 * - Contrast assessment
 */
class ImageQualityAssessor {
  constructor() {
    // Loosened for cropped-question workflow. Teachers routinely crop a single
    // MCQ (~600×350 px, ~25 KB) which the old gate rejected with cascading
    // penalties. The model handles small crops fine; we only flag genuine
    // problems (microscopic / completely unreadable).
    this.minWidth = 400
    this.minFileSizeKB = 10
    this.maxFileSizeMB = 5
    this.minAspectRatio = 0.25
    this.maxAspectRatio = 4.0
  }

  /**
   * Main assessment function
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @returns {Promise<Object>} - Quality assessment result
   */
  async assess(base64Image) {
    try {
      // Remove data URL prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(cleanBase64, 'base64')
      const metadata = await sharp(buffer).metadata()
      
      let score = 100
      const issues = []
      const warnings = []

      // Check 1: Resolution
      const resolutionCheck = this.checkResolution(metadata)
      score -= resolutionCheck.penalty
      if (resolutionCheck.issue) issues.push(resolutionCheck.issue)
      if (resolutionCheck.warning) warnings.push(resolutionCheck.warning)

      // Check 2: File size
      const sizeCheck = this.checkFileSize(buffer.length)
      score -= sizeCheck.penalty
      if (sizeCheck.issue) issues.push(sizeCheck.issue)
      if (sizeCheck.warning) warnings.push(sizeCheck.warning)

      // Check 3: Aspect ratio
      const ratioCheck = this.checkAspectRatio(metadata)
      score -= ratioCheck.penalty
      if (ratioCheck.issue) issues.push(ratioCheck.issue)
      if (ratioCheck.warning) warnings.push(ratioCheck.warning)

      // Check 4: Noise level
      const noiseCheck = await this.checkNoise(buffer)
      score -= noiseCheck.penalty
      if (noiseCheck.issue) issues.push(noiseCheck.issue)
      if (noiseCheck.warning) warnings.push(noiseCheck.warning)

      // Check 5: Blur detection
      const blurCheck = await this.checkBlur(buffer)
      score -= blurCheck.penalty
      if (blurCheck.issue) issues.push(blurCheck.issue)
      if (blurCheck.warning) warnings.push(blurCheck.warning)

      // Check 6: Contrast
      const contrastCheck = await this.checkContrast(buffer)
      score -= contrastCheck.penalty
      if (contrastCheck.issue) issues.push(contrastCheck.issue)
      if (contrastCheck.warning) warnings.push(contrastCheck.warning)

      // Ensure score is between 0-100
      score = Math.max(0, Math.min(100, score))

      // Determine quality rating
      const quality = this.getQualityRating(score)

      // `isUsable` is now ADVISORY only — see aiService.scanImage. We send
      // the image to the model regardless and let the model decide. Lowered
      // cutoff to 40 so the rating still reflects "very poor" cases for logs.
      return {
        score,
        quality,
        isUsable: score >= 40,
        needsPreprocessing: score < 80,
        issues,
        warnings,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          sizeKB: Math.round(buffer.length / 1024),
          aspectRatio: metadata.width / metadata.height,
          density: metadata.density
        },
        recommendations: this.getRecommendations(score, issues)
      }
    } catch (error) {
      console.error('[ImageQualityAssessor] Error assessing image:', error.message)
      return {
        score: 50,
        quality: 'POOR',
        isUsable: false,
        needsPreprocessing: true,
        issues: [{ type: 'ERROR', msg: 'Failed to assess image quality' }],
        warnings: [],
        metadata: null,
        recommendations: ['Image could not be assessed. Try a different image.']
      }
    }
  }

  /**
   * Check image resolution
   * @param {Object} metadata - Sharp metadata
   * @returns {Object} - Check result
   */
  checkResolution(metadata) {
    const { width } = metadata

    if (width < this.minWidth) {
      return {
        penalty: 15,
        issue: { type: 'RESOLUTION', severity: 'MEDIUM', msg: `Resolution low (${width}px < ${this.minWidth}px)` }
      }
    }

    if (width < 600) {
      return {
        penalty: 5,
        warning: { type: 'RESOLUTION', severity: 'LOW', msg: `Resolution could be higher (${width}px)` }
      }
    }

    if (width > 4000) {
      return {
        penalty: 5,
        warning: { type: 'RESOLUTION', severity: 'LOW', msg: 'Very high resolution, will be resized' }
      }
    }

    return { penalty: 0 }
  }

  /**
   * Check file size
   * @param {number} byteSize - Image size in bytes
   * @returns {Object} - Check result
   */
  checkFileSize(byteSize) {
    const sizeKB = byteSize / 1024
    const sizeMB = sizeKB / 1024

    if (sizeKB < this.minFileSizeKB) {
      return {
        penalty: 10,
        warning: { type: 'SIZE', severity: 'LOW', msg: `Image very small (${Math.round(sizeKB)}KB < ${this.minFileSizeKB}KB)` }
      }
    }

    if (sizeMB > this.maxFileSizeMB) {
      return {
        penalty: 5,
        warning: { type: 'SIZE', severity: 'LOW', msg: `Large image (${sizeMB.toFixed(2)}MB), will be compressed` }
      }
    }

    return { penalty: 0 }
  }

  /**
   * Check aspect ratio
   * @param {Object} metadata - Sharp metadata
   * @returns {Object} - Check result
   */
  checkAspectRatio(metadata) {
    const ratio = metadata.width / metadata.height

    if (ratio < this.minAspectRatio || ratio > this.maxAspectRatio) {
      return {
        penalty: 5,
        warning: { type: 'ASPECT_RATIO', severity: 'LOW', msg: `Unusual aspect ratio (${ratio.toFixed(2)})` }
      }
    }

    return { penalty: 0 }
  }

  /**
   * Check noise level (simplified version)
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<Object>} - Check result
   */
  async checkNoise(buffer) {
    try {
      // Convert to grayscale and calculate standard deviation
      const { data, info } = await sharp(buffer)
        .grayscale()
        .resize(100, 100) // Downsample for performance
        .raw()
        .toBuffer({ resolveWithObject: true })

      // Calculate standard deviation
      const mean = data.reduce((a, b) => a + b, 0) / data.length
      const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length
      const stdDev = Math.sqrt(variance)

      // High standard deviation = high noise
      if (stdDev > 80) {
        return {
          penalty: 10,
          warning: { type: 'NOISE', severity: 'MEDIUM', msg: 'Image may be noisy' }
        }
      }

      return { penalty: 0 }
    } catch (error) {
      console.error('[ImageQualityAssessor] Noise check error:', error.message)
      return { penalty: 0 }
    }
  }

  /**
   * Check blur level using true Laplacian variance.
   *
   * The previous implementation (`sharpen → stdev`) was wrong: for clean
   * printed text on white background (the IDEAL OCR input) the resulting
   * variance is naturally low because there's little texture, leading to
   * a false "blurry" verdict on the clearest scans.
   *
   * Laplacian variance is the standard reference (Pech-Pacheco et al. 2000):
   *   1. Convert to grayscale.
   *   2. Convolve with the 3×3 Laplacian kernel [[0,1,0],[1,-4,1],[0,1,0]].
   *   3. Compute variance of the convolved pixels — high variance = sharp
   *      edges = focused; low variance = washed-out = blurry.
   *
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<Object>} - Check result (soft warnings only — never
   *   rejects an image on blur alone)
   */
  async checkBlur(buffer) {
    try {
      const targetSize = 256
      const { data, info } = await sharp(buffer)
        .grayscale()
        .resize(targetSize, targetSize, { fit: 'inside' })
        .convolve({
          width: 3,
          height: 3,
          kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
        })
        .raw()
        .toBuffer({ resolveWithObject: true })

      const n = data.length
      let sum = 0
      for (let i = 0; i < n; i++) sum += data[i]
      const mean = sum / n
      let varSum = 0
      for (let i = 0; i < n; i++) {
        const d = data[i] - mean
        varSum += d * d
      }
      const variance = varSum / n

      // Variance scale: clean text scans typically score >100; phone-camera
      // shots in good light 50-100; mildly blurry 20-50; very blurry <20.
      // Penalties are soft — blur alone never disqualifies an image.
      if (variance < 15) {
        return {
          penalty: 10,
          warning: { type: 'BLUR', severity: 'MEDIUM', msg: `Image may be blurry (Laplacian var ${variance.toFixed(1)})` }
        }
      }
      if (variance < 30) {
        return {
          penalty: 5,
          warning: { type: 'BLUR', severity: 'LOW', msg: `Image slightly soft (Laplacian var ${variance.toFixed(1)})` }
        }
      }
      return { penalty: 0 }
    } catch (error) {
      console.error('[ImageQualityAssessor] Blur check error:', error.message)
      return { penalty: 0 }
    }
  }

  /**
   * Check contrast level
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<Object>} - Check result
   */
  async checkContrast(buffer) {
    try {
      const { data, info } = await sharp(buffer)
        .grayscale()
        .resize(100, 100)
        .raw()
        .toBuffer({ resolveWithObject: info })

      // Calculate min, max, and range
      const min = Math.min(...data)
      const max = Math.max(...data)
      const range = max - min

      // Low range = low contrast. Soft penalty only — `normalize()` in the
      // preprocessor stretches range to near-full before the model sees it.
      if (range < 100) {
        return {
          penalty: 10,
          warning: { type: 'CONTRAST', severity: 'MEDIUM', msg: 'Low contrast detected — will be normalized' }
        }
      }
      if (range < 150) {
        return {
          penalty: 5,
          warning: { type: 'CONTRAST', severity: 'LOW', msg: 'Moderate contrast' }
        }
      }
      return { penalty: 0 }
    } catch (error) {
      console.error('[ImageQualityAssessor] Contrast check error:', error.message)
      return { penalty: 0 }
    }
  }

  /**
   * Get quality rating based on score
   * @param {number} score - Quality score (0-100)
   * @returns {string} - Quality rating
   */
  getQualityRating(score) {
    if (score >= 95) return 'EXCELLENT'
    if (score >= 90) return 'GOOD'
    if (score >= 80) return 'ACCEPTABLE'
    if (score >= 60) return 'POOR'
    return 'UNUSABLE'
  }

  /**
   * Get recommendations based on quality and issues
   * @param {number} score - Quality score
   * @param {Array} issues - Detected issues
   * @returns {Array<string>} - Recommendations
   */
  getRecommendations(score, issues) {
    const recommendations = []

    if (score < 60) {
      recommendations.push('Image quality is too low. Please use a clearer, higher-resolution image.')
    } else if (score < 80) {
      recommendations.push('Image quality is moderate. Image preprocessing will be applied to improve OCR.')
    }

    // Specific recommendations based on issues
    issues.forEach(issue => {
      switch (issue.type) {
        case 'RESOLUTION':
          recommendations.push('Use a higher resolution image (at least 1000px wide).')
          break
        case 'SIZE':
          recommendations.push('Ensure the image file is not too compressed or too small.')
          break
        case 'BLUR':
          recommendations.push('Ensure the image is in focus when capturing.')
          break
        case 'CONTRAST':
          recommendations.push('Ensure good lighting and contrast when capturing the image.')
          break
        case 'ASPECT_RATIO':
          recommendations.push('Try capturing the image from a better angle or distance.')
          break
      }
    })

    return recommendations
  }
}

module.exports = new ImageQualityAssessor()