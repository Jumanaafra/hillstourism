/**
 * In-memory sliding window rate limiter for Next.js Route Handlers.
 * Suitable for single-instance or edge node protection.
 */

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up expired entries every 5 minutes without keeping Node.js event loop alive
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter(ts => now - ts < 3600000)
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    })
  }, 300000)

  if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref()
  }
}

export interface RateLimitOptions {
  intervalMs: number // e.g. 60000 (1 minute)
  maxRequests: number // e.g. 5 requests per minute
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60000, maxRequests: 5 }
): { allowed: boolean; remaining: number; resetTimeMs: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier) || { timestamps: [] }

  const validTimestamps = record.timestamps.filter(ts => now - ts < options.intervalMs)

  if (validTimestamps.length >= options.maxRequests) {
    const oldest = validTimestamps[0]
    const resetTimeMs = options.intervalMs - (now - oldest)
    return {
      allowed: false,
      remaining: 0,
      resetTimeMs: Math.max(0, resetTimeMs),
    }
  }

  validTimestamps.push(now)
  rateLimitStore.set(identifier, { timestamps: validTimestamps })

  return {
    allowed: true,
    remaining: options.maxRequests - validTimestamps.length,
    resetTimeMs: options.intervalMs,
  }
}
