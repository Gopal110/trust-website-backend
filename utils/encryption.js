const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-characters-length-12345';
const ALGORITHM = 'aes-256-cbc';

// Ensure key is exactly 32 bytes for aes-256
function getValidKey(key) {
  const hash = crypto.createHash('sha256');
  hash.update(String(key));
  return hash.digest();
}

/**
 * Encrypt sensitive data
 * @param {string} plainText - The text to encrypt
 * @returns {string} - Encrypted data in format: iv:encryptedData
 */
function encrypt(plainText) {
  try {
    const key = getValidKey(ENCRYPTION_KEY);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted data combined
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - The encrypted data in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedData) {
  try {
    const key = getValidKey(ENCRYPTION_KEY);
    const [iv, encrypted] = encryptedData.split(':');
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'hex')
    );
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a hash for sensitive data (one-way encryption)
 * @param {string} data - The data to hash
 * @returns {string} - SHA256 hash
 */
function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Compare plain text with hashed data
 * @param {string} plainText - The plain text to compare
 * @param {string} hashedText - The hashed text
 * @returns {boolean} - True if match
 */
function compareHash(plainText, hashedText) {
  const plainHash = hash(plainText);
  return plainHash === hashedText;
}

/**
 * Generate a random token
 * @param {number} length - Length of token (default: 32)
 * @returns {string} - Random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  compareHash,
  generateToken
};
