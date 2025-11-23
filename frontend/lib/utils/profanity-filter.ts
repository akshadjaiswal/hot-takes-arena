/**
 * Profanity filter utility
 * Detects and filters inappropriate content
 */

// Basic profanity list (expand this in production)
// This list is intentionally minimal for demonstration
const PROFANITY_LIST = [
  // Hate speech indicators
  'n1gg3r', 'n1gger', 'nigg3r', 'nigger',
  'f4gg0t', 'fagg0t', 'f4ggot', 'faggot',
  'k1ke', 'kike',
  'ch1nk', 'chink',
  'sp1c', 'spic',

  // Common slurs and extremely offensive terms
  'cunt', 'c0nt', 'kunt',
  'retard', 'r3tard', 'retarded',

  // Explicit sexual content
  'p0rn', 'porn',
  'xxx',
  'p3nis', 'penis',
  'vag1na', 'vagina',
  'b00bs', 'boobs',

  // Threats of violence
  'k1ll yourself', 'kill yourself',
  'kys',
  'd1e', 'die',

  // You can expand this list with a comprehensive profanity database
]

// Regex patterns for more sophisticated detection
const PROFANITY_PATTERNS = [
  // Excessive special characters (spam indicator)
  /(.)\1{10,}/, // Same character repeated 10+ times

  // Phone numbers (spam indicator)
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,

  // URLs (spam indicator)
  /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi,

  // Email addresses (spam indicator)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
]

/**
 * Check if content contains profanity or inappropriate content
 */
export function containsProfanity(content: string): boolean {
  const normalized = content.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  // Check against profanity list
  for (const word of PROFANITY_LIST) {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalized.includes(cleanWord)) {
      return true
    }
  }

  return false
}

/**
 * Check if content is spam
 */
export function isSpam(content: string): boolean {
  // Check against spam patterns
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      return true
    }
  }

  // Check for excessive caps (>70% uppercase)
  const letters = content.replace(/[^a-zA-Z]/g, '')
  if (letters.length > 0) {
    const upperCount = (content.match(/[A-Z]/g) || []).length
    const capsRatio = upperCount / letters.length
    if (capsRatio > 0.7 && letters.length > 10) {
      return true
    }
  }

  return false
}

/**
 * Filter content for inappropriate content
 * Returns object with validation result and reason
 */
export interface ContentValidationResult {
  isValid: boolean
  reason?: string
}

export function validateContent(content: string): ContentValidationResult {
  // Check length
  if (content.trim().length < 10) {
    return {
      isValid: false,
      reason: 'Content is too short (minimum 10 characters)',
    }
  }

  if (content.length > 280) {
    return {
      isValid: false,
      reason: 'Content is too long (maximum 280 characters)',
    }
  }

  // Check for profanity
  if (containsProfanity(content)) {
    return {
      isValid: false,
      reason: 'Content contains inappropriate language',
    }
  }

  // Check for spam
  if (isSpam(content)) {
    return {
      isValid: false,
      reason: 'Content appears to be spam',
    }
  }

  return { isValid: true }
}

/**
 * Sanitize content by removing potentially dangerous characters
 * (XSS prevention)
 */
export function sanitizeContent(content: string): string {
  return content
    .trim()
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove any script-like patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
}
