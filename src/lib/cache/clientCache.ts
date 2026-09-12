/**
 * clientCache.ts
 * In-memory client-side cache and in-flight request deduplicator.
 * Prevents multiple components from simultaneously firing identical HTTP requests
 * on page load (e.g. Navbar & Footer fetching social-links, or TripFinder & FeaturedTrips fetching packages).
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const inFlightPromises = new Map<string, Promise<any>>()

/**
 * Perform a cached and deduplicated GET fetch.
 * @param url The endpoint URL to fetch
 * @param ttlMs Time-to-live in milliseconds (defaults to 60 seconds)
 * @returns The parsed JSON data
 */
export async function cachedFetch<T = any>(url: string, ttlMs: number = 60000): Promise<T> {
  const now = Date.now()

  // 1. Check if valid cached data exists
  const cached = memoryCache.get(url)
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T
  }

  // 2. If an identical request is already in-flight, reuse that exact promise
  if (inFlightPromises.has(url)) {
    return inFlightPromises.get(url) as Promise<T>
  }

  // 3. Initiate request and deduplicate
  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`)
      }
      const json = await res.json()
      memoryCache.set(url, { data: json, timestamp: Date.now() })
      return json as T
    })
    .finally(() => {
      inFlightPromises.delete(url)
    })

  inFlightPromises.set(url, promise)
  return promise
}

/**
 * Manually invalidate client cache for an endpoint or all endpoints.
 */
export function invalidateClientCache(urlPattern?: string) {
  if (!urlPattern) {
    memoryCache.clear()
    return
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(urlPattern)) {
      memoryCache.delete(key)
    }
  }
}
