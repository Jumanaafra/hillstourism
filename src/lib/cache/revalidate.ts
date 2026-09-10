import { revalidatePath } from 'next/cache'

/**
 * Performs targeted Next.js cache revalidation for updated content.
 * Prevents invalidating the entire site unnecessarily.
 */
export function triggerTargetedRevalidation(
  entityType: 'package' | 'hotel' | 'vehicle' | 'gallery' | 'content' | 'settings' | 'social' | 'seo',
  slugOrId?: string
) {
  try {
    revalidatePath('/')

    switch (entityType) {
      case 'package':
        revalidatePath('/packages')
        if (slugOrId) revalidatePath(`/packages/${slugOrId}`)
        break
      case 'hotel':
        revalidatePath('/stays')
        revalidatePath('/')
        if (slugOrId) revalidatePath(`/hotels/${slugOrId}`)
        break
      case 'vehicle':
        revalidatePath('/vehicles')
        break
      case 'gallery':
        revalidatePath('/gallery')
        break
      case 'content':
        revalidatePath('/experiences')
        revalidatePath('/about')
        break
      case 'settings':
      case 'social':
        revalidatePath('/')
        break
      case 'seo':
        revalidatePath('/')
        if (slugOrId) {
          const path = slugOrId.startsWith('/') ? slugOrId : `/${slugOrId}`
          revalidatePath(path)
        }
        break
    }
  } catch (err) {
    // Non-fatal if invoked in non-request contexts or tests
    console.warn('[Cache Revalidation] Revalidation notice:', err)
  }
}
