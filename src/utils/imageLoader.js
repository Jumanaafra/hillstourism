/**
 * imageLoader.js
 * Utility for loading images with error handling and progress tracking.
 */

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
 * Frames are named: frame_000_delay-0.1s.gif … frame_099_delay-0.1s.gif
 * Supports Cloudinary CDN delivery when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is present,
 * while strictly maintaining local file fallback.
 * @param {number} index  0-based index (0–99)
 * @returns {string}
 */
export function getFramePath(index) {
  const num = String(index).padStart(3, '0')
  const fileName = `frame_${num}_delay-0.1s.gif`

  const cloudName = typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)
    : ''

  const useCloudinaryHero = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_CLOUDINARY_HERO === 'true'

  if (cloudName && useCloudinaryHero) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/hills-tourism/hero/${fileName}`
  }

  return `/frames/${fileName}`
}

