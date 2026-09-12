/**
 * Cloudinary image transformation utilities.
 * Generates optimized, responsive delivery URLs without altering visual styling.
 */

export interface TransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'limit'
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  gravity?: 'auto' | 'center' | 'face'
}

/**
 * Builds an optimized Cloudinary delivery URL.
 * Automatically enables automatic format selection (f_auto) and quality compression (q_auto).
 */
export function buildOptimizedUrl(
  urlOrPublicId: string,
  options: TransformOptions = {}
): string {
  if (!urlOrPublicId) return ''

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity,
  } = options

  // If it's not a Cloudinary asset/URL, return as-is (graceful fallback)
  const isCloudinaryUrl = urlOrPublicId.includes('res.cloudinary.com')
  const isPublicId = !urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://') && !urlOrPublicId.startsWith('/')

  const transformations: string[] = []

  if (format) transformations.push(`f_${format}`)
  if (quality) transformations.push(`q_${quality}`)
  if (crop) transformations.push(`c_${crop}`)
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (gravity) transformations.push(`g_${gravity}`)

  const transformString = transformations.join(',')

  if (isCloudinaryUrl) {
    // Inject transformation string into URL before /upload/
    const uploadIdx = urlOrPublicId.indexOf('/upload/')
    if (uploadIdx !== -1) {
      const prefix = urlOrPublicId.substring(0, uploadIdx + 8)
      const rest = urlOrPublicId.substring(uploadIdx + 8)

      // Avoid duplicate transformations
      if (rest.startsWith('f_') || rest.startsWith('c_') || rest.startsWith('w_') || rest.startsWith('q_')) {
        const nextSlash = rest.indexOf('/')
        if (nextSlash !== -1) {
          return `${prefix}${transformString}/${rest.substring(nextSlash + 1)}`
        }
      }
      return `${prefix}${transformString}/${rest}`
    }
    return urlOrPublicId
  }

  if (isPublicId) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || ''
    if (!cloudName) return urlOrPublicId
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${urlOrPublicId}`
  }

  return urlOrPublicId
}

/**
 * Generates srcset attributes for responsive images.
 */
export function generateResponsiveSrcSet(
  urlOrPublicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string {
  if (!urlOrPublicId) return ''
  return widths
    .map(w => `${buildOptimizedUrl(urlOrPublicId, { width: w })} ${w}w`)
    .join(', ')
}

/**
 * Universal image URL optimizer.
 * Handles Cloudinary transformations (f_auto, q_auto, width scaling)
 * and Unsplash query parameter optimization (auto=format, q=75, w=width).
 */
export function getOptimizedImageUrl(url: string, width: number = 600): string {
  if (!url) return ''
  if (url.includes('res.cloudinary.com')) {
    return buildOptimizedUrl(url, { width, quality: 'auto', format: 'auto' })
  }
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url)
      u.searchParams.set('w', String(width))
      u.searchParams.set('q', '75')
      u.searchParams.set('auto', 'format')
      return u.toString()
    } catch {
      return url
    }
  }
  return url
}
