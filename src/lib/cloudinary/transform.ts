/**
 * Cloudinary image transformation utilities.
 * Generates optimized, responsive delivery URLs without altering visual styling.
 * Strictly client-safe: no server SDK imports, zero secrets exposed.
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
  const isPublicId =
    !urlOrPublicId.startsWith('http://') &&
    !urlOrPublicId.startsWith('https://') &&
    !urlOrPublicId.startsWith('/')

  if (!isCloudinaryUrl && !isPublicId) {
    return urlOrPublicId
  }

  const transformations: string[] = []

  if (format) transformations.push(`f_${format}`)
  if (quality) transformations.push(`q_${quality}`)
  if (crop) transformations.push(`c_${crop}`)
  if (gravity) transformations.push(`g_${gravity}`)
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)

  const transformString = transformations.join(',')

  if (isCloudinaryUrl) {
    const uploadIdx = urlOrPublicId.indexOf('/upload/')
    if (uploadIdx !== -1) {
      const prefix = urlOrPublicId.substring(0, uploadIdx + 8)
      const rest = urlOrPublicId.substring(uploadIdx + 8)

      // Replace existing transformation segment if present before the version/path
      const firstSlashIdx = rest.indexOf('/')
      if (firstSlashIdx !== -1) {
        const firstSegment = rest.substring(0, firstSlashIdx)
        if (
          firstSegment.includes('f_') ||
          firstSegment.includes('q_') ||
          firstSegment.includes('w_') ||
          firstSegment.includes('c_')
        ) {
          return `${prefix}${transformString}/${rest.substring(firstSlashIdx + 1)}`
        }
      }
      return `${prefix}${transformString}/${rest}`
    }
    return urlOrPublicId
  }

  if (isPublicId) {
    const cloudName =
      (typeof process !== 'undefined' &&
        (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
          process.env.CLOUDINARY_CLOUD_NAME)) ||
      ''
    if (!cloudName) return urlOrPublicId
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${urlOrPublicId}`
  }

  return urlOrPublicId
}

/**
 * Universal image URL optimizer.
 * Supports:
 * - Cloudinary URLs & public IDs (f_auto, q_auto, crop, responsive width, gravity)
 * - Unsplash URLs (auto=format, fit=crop, responsive width, quality)
 * - Transparent fallback for local static assets and other external URLs.
 */
export function getOptimizedImageUrl(
  url: string,
  optionsOrWidth: number | TransformOptions = 600
): string {
  if (!url) return ''
  const options: TransformOptions =
    typeof optionsOrWidth === 'number'
      ? { width: optionsOrWidth }
      : optionsOrWidth

  const {
    width,
    height,
    crop,
    quality = 'auto',
    gravity,
  } = options

  // 1. Cloudinary URL or public ID
  if (
    url.includes('res.cloudinary.com') ||
    (!url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('/'))
  ) {
    return buildOptimizedUrl(url, options)
  }

  // 2. Unsplash URL
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url)
      if (width) u.searchParams.set('w', String(width))
      if (height) u.searchParams.set('h', String(height))
      if (quality) u.searchParams.set('q', quality === 'auto' ? '80' : String(quality))
      u.searchParams.set('auto', 'format')
      if (crop === 'fill') {
        u.searchParams.set('fit', 'crop')
        if (gravity === 'face') u.searchParams.set('crop', 'faces')
      }
      return u.toString()
    } catch {
      return url
    }
  }

  return url
}

/**
 * Generates srcset attributes for responsive images.
 * Universally supports Cloudinary and Unsplash image sources.
 */
export function generateResponsiveSrcSet(
  urlOrPublicId: string,
  widths: number[] = [320, 480, 640, 768, 1024, 1280],
  options: Omit<TransformOptions, 'width'> = {}
): string {
  if (!urlOrPublicId) return ''
  return widths
    .map(w => `${getOptimizedImageUrl(urlOrPublicId, { ...options, width: w })} ${w}w`)
    .join(', ')
}

/**
 * Next.js custom image loader compatible with next/image.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  return getOptimizedImageUrl(src, {
    width,
    quality: quality ? quality : 'auto',
  })
}

