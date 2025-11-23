/**
 * IP hashing utility
 * Hashes IP addresses for privacy-compliant tracking
 * Server-side only
 */

import crypto from 'crypto'

/**
 * Hash an IP address using SHA-256
 * This provides privacy while still allowing rate limiting
 */
export function hashIP(ip: string): string {
  const hash = crypto.createHash('sha256')

  // Add a salt to make rainbow table attacks harder
  // In production, use an environment variable for the salt
  const salt = process.env.IP_HASH_SALT || 'hot-takes-arena-salt-change-in-prod'

  hash.update(salt + ip)
  return hash.digest('hex')
}

/**
 * Extract IP address from Next.js request
 * Handles both direct connections and proxied requests (Vercel)
 */
export function getClientIP(headers: Headers): string {
  // Try to get real IP from various headers (prioritized)
  const forwardedFor = headers.get('x-forwarded-for')
  const realIP = headers.get('x-real-ip')
  const vercelIP = headers.get('x-vercel-forwarded-for')

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (vercelIP) {
    return vercelIP
  }

  // Fallback (shouldn't happen on Vercel)
  return 'unknown'
}
