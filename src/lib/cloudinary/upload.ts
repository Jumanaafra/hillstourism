import { cloudinary, isCloudinaryConfigured } from './config'
import type { UploadApiResponse } from 'cloudinary'

export type CloudinaryFolder =
  | 'hills-tourism/packages'
  | 'hills-tourism/package-itineraries'
  | 'hills-tourism/hotels'
  | 'hills-tourism/vehicles'
  | 'hills-tourism/gallery'
  | 'hills-tourism/testimonials'
  | 'hills-tourism/destinations'
  | 'hills-tourism/experiences'
  | 'hills-tourism/content'
  | 'hills-tourism/hero'

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  width: number
  height: number
  format: string
  bytes: number
  alt?: string
}

export interface UploadOptions {
  folder?: CloudinaryFolder | string
  publicId?: string
  overwrite?: boolean
  alt?: string
  maxSizeBytes?: number
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

/**
 * Validates image buffer, MIME type, and size before sending to Cloudinary.
 */
export function validateImageFile(
  buffer: Buffer,
  mimeType: string,
  maxSizeBytes: number = DEFAULT_MAX_SIZE
): { valid: boolean; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file provided.' }
  }

  if (buffer.length > maxSizeBytes) {
    const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0)
    return { valid: false, error: `File size exceeds the ${sizeMb}MB limit.` }
  }

  const normalizedMime = mimeType.toLowerCase().trim()
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    return {
      valid: false,
      error: `Unsupported image format (${mimeType}). Supported formats: JPEG, PNG, WebP, GIF, AVIF.`,
    }
  }

  return { valid: true }
}

/**
 * Uploads an image buffer directly to Cloudinary using streaming.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  mimeType: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const {
    folder = 'hills-tourism/content',
    publicId,
    overwrite = false,
    alt = '',
    maxSizeBytes = DEFAULT_MAX_SIZE,
  } = options

  const validation = validateImageFile(buffer, mimeType, maxSizeBytes)
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.')
  }

  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not configured on the server.')
  }

  // Ensure folder has hills-tourism prefix
  const targetFolder = folder.startsWith('hills-tourism')
    ? folder
    : `hills-tourism/${folder.replace(/^\/+/, '')}`

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: targetFolder,
        public_id: publicId,
        overwrite,
        resource_type: 'image',
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed.'))
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          alt,
        })
      }
    )

    uploadStream.end(buffer)
  })
}
