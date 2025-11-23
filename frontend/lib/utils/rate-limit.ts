/**
 * Rate limiting utility
 * In-memory rate limiting for development
 * In production, use Vercel KV or Redis
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (will be reset on server restart)
// In production, replace with Vercel KV or Redis
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number // Maximum number of requests
  windowMs: number // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

// Rate limit configurations
export const RATE_LIMITS = {
  POST_TAKE: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  VOTE: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  REPORT: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const

/**
 * Check if a request is allowed under rate limits
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries (simple cleanup)
  for (const [entryKey, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(entryKey)
    }
  }

  // Get or create entry
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Check if allowed
  const allowed = entry.count < config.maxRequests

  if (allowed) {
    entry.count++
    rateLimitStore.set(key, entry)
  }

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  }
}

/**
 * Get rate limit key for take posting
 */
export function getRateLimitKey(
  action: 'post' | 'vote' | 'report',
  deviceFingerprint: string,
  ipHash: string
): string {
  return `${action}:${deviceFingerprint}:${ipHash}`
}

/**
 * Format rate limit reset time for response headers
 */
export function formatRateLimitReset(resetAt: number): string {
  return Math.ceil((resetAt - Date.now()) / 1000).toString()
}

/**
 * Clear rate limit for testing purposes
 * DO NOT use in production
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Get all rate limit entries (for debugging)
 */
export function getRateLimitStats(): {
  total: number
  active: number
} {
  const now = Date.now()
  const activeEntries = Array.from(rateLimitStore.values()).filter(
    entry => entry.resetAt >= now
  )

  return {
    total: rateLimitStore.size,
    active: activeEntries.length,
  }
}
