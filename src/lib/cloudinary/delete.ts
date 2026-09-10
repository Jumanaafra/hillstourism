import { cloudinary, isCloudinaryConfigured } from './config'

export interface CloudinaryDeleteResult {
  success: boolean
  result?: string
  error?: string
}

/**
 * Safely deletes an asset from Cloudinary by its publicId.
 * Does not crash if Cloudinary is not configured or asset already removed.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<CloudinaryDeleteResult> {
  if (!publicId || typeof publicId !== 'string' || !publicId.trim()) {
    return { success: false, error: 'Invalid or empty publicId provided.' }
  }

  // If publicId is a URL, try extracting the public_id
  let cleanPublicId = publicId.trim()
  if (cleanPublicId.includes('res.cloudinary.com')) {
    const uploadIdx = cleanPublicId.indexOf('/upload/')
    if (uploadIdx !== -1) {
      const pathAfterUpload = cleanPublicId.substring(uploadIdx + 8)
      // Strip transformation segments and version (e.g. v1234567890/...)
      const segments = pathAfterUpload.split('/')
      const withoutTransform = segments.filter(s => !s.startsWith('f_') && !s.startsWith('w_') && !s.startsWith('q_') && !s.startsWith('c_'))
      const withoutVersion = withoutTransform.filter(s => !/^v\d+$/.test(s))
      // Strip extension
      cleanPublicId = withoutVersion.join('/').replace(/\.[a-zA-Z0-9]+$/, '')
    }
  }

  if (!isCloudinaryConfigured()) {
    console.warn('[Cloudinary Delete] Skipping delete: Cloudinary is not configured.')
    return { success: true, result: 'skipped_not_configured' }
  }

  try {
    const res = await cloudinary.uploader.destroy(cleanPublicId, {
      resource_type: 'image',
      invalidate: true,
    })

    return {
      success: res.result === 'ok' || res.result === 'not found',
      result: res.result,
    }
  } catch (err: any) {
    console.error(`[Cloudinary Delete] Failed to destroy asset "${cleanPublicId}":`, err)
    return {
      success: false,
      error: err?.message || 'Failed to delete asset from Cloudinary.',
    }
  }
}
