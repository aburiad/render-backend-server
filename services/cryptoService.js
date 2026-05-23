const crypto = require('crypto')

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12 // GCM standard IV length

function getKey() {
  const hex = process.env.API_KEY_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'API_KEY_ENCRYPTION_KEY must be set to a 64-character hex string. ' +
      'Generate with: openssl rand -hex 32',
    )
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns base64-encoded ciphertext, iv, and auth tag — store all three.
 */
function encrypt(plaintext) {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    ciphertext: enc.toString('base64'),
    iv: iv.toString('base64'),
    authTag: tag.toString('base64'),
  }
}

/**
 * Decrypt a record produced by encrypt(). Throws if any field is tampered
 * or the encryption key has changed.
 */
function decrypt({ ciphertext, iv, authTag }) {
  if (!ciphertext || !iv || !authTag) {
    throw new Error('cryptoService.decrypt: missing field')
  }
  const key = getKey()
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))
  const dec = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ])
  return dec.toString('utf8')
}

/** Last-4-chars preview for safe display (e.g. "•••••AB12"). */
function preview(plaintext) {
  const s = String(plaintext)
  if (s.length <= 4) return s
  return '•••••' + s.slice(-4)
}

module.exports = { encrypt, decrypt, preview }
