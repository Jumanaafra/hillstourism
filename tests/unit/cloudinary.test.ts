import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validateImageFile } from '../../src/lib/cloudinary/upload'
import { buildOptimizedUrl, generateResponsiveSrcSet } from '../../src/lib/cloudinary/transform'
import { isCloudinaryConfigured } from '../../src/lib/cloudinary/config'

describe('Cloudinary Validation Module', () => {
  it('rejects empty buffers', () => {
    const empty = Buffer.alloc(0)
    const res = validateImageFile(empty, 'image/jpeg')
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Empty file')
  })

  it('rejects files that exceed size limit', () => {
    // Limit is 1MB for test
    const fakeBuffer = Buffer.alloc(2 * 1024 * 1024)
    const res = validateImageFile(fakeBuffer, 'image/png', 1 * 1024 * 1024)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('File size exceeds')
  })

  it('accepts allowed image mime types', () => {
    const fakeBuffer = Buffer.from('fake image content')
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
      'IMAGE/JPEG', // case insensitive
    ]

    for (const mime of allowedTypes) {
      const res = validateImageFile(fakeBuffer, mime)
      expect(res.valid).toBe(true)
    }
  })

  it('rejects unsupported file formats', () => {
    const fakeBuffer = Buffer.from('fake content')
    const disallowedTypes = [
      'image/svg+xml',
      'application/pdf',
      'text/plain',
      'video/mp4',
    ]

    for (const mime of disallowedTypes) {
      const res = validateImageFile(fakeBuffer, mime)
      expect(res.valid).toBe(false)
      expect(res.error).toContain('Unsupported image format')
    }
  })
})

describe('Cloudinary Transformation Engine', () => {
  it('returns empty string for empty inputs', () => {
    expect(buildOptimizedUrl('')).toBe('')
    expect(generateResponsiveSrcSet('')).toBe('')
  })

  it('gracefully passes through non-Cloudinary URLs as-is', () => {
    const localUrl = '/frames/frame_001.gif'
    const extUrl = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957'

    expect(buildOptimizedUrl(localUrl)).toBe(localUrl)
    expect(buildOptimizedUrl(extUrl)).toBe(extUrl)
  })

  it('injects auto-optimization parameters into Cloudinary URLs', () => {
    const cldUrl = 'https://res.cloudinary.com/demo/image/upload/v12345/hills-tourism/packages/darjeeling.jpg'
    const transformed = buildOptimizedUrl(cldUrl, { width: 800, quality: 'auto', crop: 'fill' })

    expect(transformed).toContain('/upload/f_auto,q_auto,c_fill,w_800/')
    expect(transformed).toContain('hills-tourism/packages/darjeeling.jpg')
  })

  it('updates transformations without duplicating on existing Cloudinary URLs', () => {
    const cldWithTransform = 'https://res.cloudinary.com/demo/image/upload/w_400,c_scale/v12345/sample.jpg'
    const updated = buildOptimizedUrl(cldWithTransform, { width: 1200 })

    expect(updated).toContain('/upload/f_auto,q_auto,c_fill,w_1200/')
    expect(updated).toContain('sample.jpg')
  })

  it('builds full URL from publicId when cloud name is present', () => {
    const origEnv = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'hillstourism'

    try {
      const url = buildOptimizedUrl('hills-tourism/hotels/mayfair', { width: 600 })
      expect(url).toBe('https://res.cloudinary.com/hillstourism/image/upload/f_auto,q_auto,c_fill,w_600/hills-tourism/hotels/mayfair')
    } finally {
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = origEnv
    }
  })

  it('generates responsive srcset with multiple widths', () => {
    const cldUrl = 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    const srcset = generateResponsiveSrcSet(cldUrl, [400, 800])

    expect(srcset).toContain('w_400')
    expect(srcset).toContain('400w')
    expect(srcset).toContain('w_800')
    expect(srcset).toContain('800w')
  })
})

describe('Cloudinary Configuration Checker', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns false when credentials are missing', () => {
    delete process.env.CLOUDINARY_CLOUD_NAME
    delete process.env.CLOUDINARY_API_KEY
    delete process.env.CLOUDINARY_API_SECRET
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    expect(isCloudinaryConfigured()).toBe(false)
  })

  it('returns true when all required credentials are provided', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud'
    process.env.CLOUDINARY_API_KEY = 'test_key'
    process.env.CLOUDINARY_API_SECRET = 'test_secret'

    expect(isCloudinaryConfigured()).toBe(true)
  })
})
