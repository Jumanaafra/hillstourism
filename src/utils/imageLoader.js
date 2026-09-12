/**
 * imageLoader.js
 * Utility for loading images with error handling and progress tracking.
 */

/**
 * Detect WebP support once and cache the result.
 * Uses a tiny synchronous canvas check so getFramePath() can be called synchronously.
 */
let _webpSupported = null
function supportsWebP() {
  if (_webpSupported !== null) return _webpSupported
  if (typeof document === 'undefined') {
    _webpSupported = false
    return false
  }
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    _webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    _webpSupported = false
  }
  return _webpSupported
}

/**
 * Load a single image with a timeout, returning an Image element or null on failure.
 * @param {string} src
 * @param {number} timeoutMs
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadImage(src, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const img = new Image()
    let settled = false

    const settle = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    const timer = setTimeout(() => settle(null), timeoutMs)
    img.onload  = () => settle(img)
    img.onerror = () => settle(null)
    img.src = src
  })
}

/**
 * Load a single image with WebP→GIF fallback.
 * Tries the WebP path first; if it fails, retries with the GIF path.
 * @param {string} webpSrc
 * @param {string} gifFallbackSrc
 * @param {number} timeoutMs
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadImageWithFallback(webpSrc, gifFallbackSrc, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const img = new Image()
    let settled = false
    let triedFallback = false

    const settle = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    const timer = setTimeout(() => settle(null), timeoutMs)

    img.onload = () => settle(img)
    img.onerror = () => {
      if (!triedFallback) {
        triedFallback = true
        img.src = gifFallbackSrc
      } else {
        settle(null)
      }
    }
    img.src = webpSrc
  })
}

/**
 * Load a batch of images in parallel, reporting progress via callback.
 * @param {string[]} srcs
 * @param {(loaded: number, total: number) => void} onProgress
 * @returns {Promise<(HTMLImageElement|null)[]>}
 */
export async function loadImageBatch(srcs, onProgress) {
  let loaded = 0
  const total = srcs.length

  const results = await Promise.all(
    srcs.map((src) =>
      loadImage(src).then((img) => {
        loaded++
        onProgress?.(loaded, total)
        return img
      })
    )
  )
  return results
}

/**
 * Generate the path for a hero frame given its index.
 *
 * Priority:
 *   1. Cloudinary CDN (if NEXT_PUBLIC_USE_CLOUDINARY_HERO=true and cloud name set)
 *   2. Local WebP  (/frames-webp/frame_NNN.webp)  — if browser supports WebP
 *   3. Local GIF   (/frames/frame_NNN_delay-0.1s.gif)  — universal fallback
 *
 * @param {number} index  0-based index (0–99)
 * @returns {string}
 */
export function getFramePath(index) {
  const num = String(index).padStart(3, '0')

  const cloudName = typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)
    : ''

  const useCloudinaryHero = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_CLOUDINARY_HERO === 'true'

  if (cloudName && useCloudinaryHero) {
    const fileName = `frame_${num}_delay-0.1s.gif`
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/hills-tourism/hero/${fileName}`
  }

  // Serve WebP when the browser supports it (all modern browsers do).
  // getFramePath() is called during image preloading in useFrameSequence.js,
  // by which time window/document is always available.
  if (supportsWebP()) {
    return `/frames-webp/frame_${num}.webp`
  }

  // GIF fallback for legacy browsers (IE11, old Safari)
  return `/frames/frame_${num}_delay-0.1s.gif`
}

/**
 * Get both the optimized (WebP) and fallback (GIF) paths for a frame.
 * Used for preloading with fallback capability.
 * @param {number} index
 * @returns {{ primary: string, fallback: string }}
 */
export function getFramePaths(index) {
  const num = String(index).padStart(3, '0')
  return {
    primary:  `/frames-webp/frame_${num}.webp`,
    fallback: `/frames/frame_${num}_delay-0.1s.gif`,
  }
}
