import 'server-only'
import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import type { SocialLink } from '../../types/domain'

export const ALLOWED_SOCIAL_PLATFORMS = ['whatsapp', 'facebook', 'instagram', 'youtube', 'twitter'] as const
export type AllowedSocialPlatform = typeof ALLOWED_SOCIAL_PLATFORMS[number]

export const defaultSocialLinks: SocialLink[] = [
  {
    id: 'social-whatsapp',
    platform: 'whatsapp',
    url: "https://wa.me/919999000000?text=Hi!%20I'd%20like%20to%20plan%20a%20hill%20trip.",
    active: true,
    order: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'social-instagram',
    platform: 'instagram',
    url: 'https://instagram.com/hillstourism',
    active: true,
    order: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'social-facebook',
    platform: 'facebook',
    url: 'https://facebook.com/hillstourism',
    active: true,
    order: 3,
    updatedAt: new Date().toISOString(),
  },
]

let memorySocialLinks: SocialLink[] = [...defaultSocialLinks]

/**
 * Validates a social media URL and platform.
 */
export function validateSocialLinkPayload(data: Partial<SocialLink>): {
  valid: boolean
  error?: string
  sanitized?: Partial<SocialLink>
} {
  if (!data.platform || !ALLOWED_SOCIAL_PLATFORMS.includes(data.platform.toLowerCase() as any)) {
    return {
      valid: false,
      error: `Unsupported platform "${data.platform}". Allowed platforms: ${ALLOWED_SOCIAL_PLATFORMS.join(', ')}`,
    }
  }

  if (!data.url || typeof data.url !== 'string') {
    return { valid: false, error: 'URL is required.' }
  }

  const trimmed = data.url.trim()
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must start with http:// or https://' }
    }
  } catch {
    return { valid: false, error: 'Invalid URL format.' }
  }

  const sanitizedLabel = data.label
    ? data.label.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/[<>]/g, '').trim()
    : undefined

  return {
    valid: true,
    sanitized: {
      ...data,
      platform: data.platform.toLowerCase() as AllowedSocialPlatform,
      url: trimmed,
      label: sanitizedLabel,
    },
  }
}

export const SUPPORTED_PLATFORMS = ALLOWED_SOCIAL_PLATFORMS
export const getAllSocialLinks = () => getSocialLinks(false)
export const getActiveSocialLinks = () => getSocialLinks(true)


/**
 * Retrieves all social links from Firestore or memory.
 */
export async function getSocialLinks(onlyActive = true): Promise<SocialLink[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('social_links')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'social.get')
      const links = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialLink))
      memorySocialLinks = [...links]
      return links.sort((a, b) => (a.order || 0) - (b.order || 0))
    } catch (err) {
      console.error('[Social Repo] Firestore fetch error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const links = onlyActive
    ? memorySocialLinks.filter(s => s.active !== false)
    : [...memorySocialLinks]
  return links.sort((a, b) => (a.order || 0) - (b.order || 0))
}

/**
 * Retrieves a single social link by ID.
 */
export async function getSocialLinkById(id: string): Promise<SocialLink | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('social_links').doc(id).get(), 15000, `social.getById:${id}`)
      if (doc.exists) return { id: doc.id, ...doc.data() } as SocialLink
      return null
    } catch (err) {
      console.error(`[Social Repo] getSocialLinkById error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return memorySocialLinks.find(s => s.id === id) || null
}

/**
 * Creates a new social link.
 */
export async function createSocialLink(data: Omit<SocialLink, 'id'> & { id?: string }): Promise<SocialLink> {
  const validation = validateSocialLinkPayload(data)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const item: SocialLink = {
    ...data,
    platform: data.platform.toLowerCase(),
    url: data.url.trim(),
    id: data.id || `social-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    active: data.active !== undefined ? Boolean(data.active) : true,
    order: typeof data.order === 'number' ? data.order : 99,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('social_links').doc(item.id).set(item), 15000, 'social.create')
    } catch (err) {
      console.error('[Social Repo] Save error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memorySocialLinks.push(item)
  return item
}

/**
 * Updates an existing social link.
 */
export async function updateSocialLink(id: string, updates: Partial<SocialLink>): Promise<SocialLink> {
  const existing = await getSocialLinkById(id)
  if (!existing) {
    throw new Error(`Social link with id ${id} not found.`)
  }

  if (updates.platform || updates.url) {
    const validation = validateSocialLinkPayload({
      platform: updates.platform || existing.platform,
      url: updates.url || existing.url,
    })
    if (!validation.valid) {
      throw new Error(validation.error)
    }
  }

  const updated: SocialLink = {
    ...existing,
    ...updates,
    platform: (updates.platform || existing.platform).toLowerCase(),
    url: (updates.url !== undefined ? updates.url : existing.url).trim(),
    active: updates.active !== undefined ? Boolean(updates.active) : existing.active,
    order: updates.order !== undefined ? Number(updates.order) : existing.order,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('social_links').doc(id).set(updated, { merge: true }), 15000, `social.update:${id}`)
    } catch (err) {
      console.error(`[Social Repo] Update error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memorySocialLinks.findIndex(s => s.id === id)
  if (idx !== -1) memorySocialLinks[idx] = updated

  return updated
}

/**
 * Deletes a social link by ID.
 */
export async function deleteSocialLink(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('social_links').doc(id).delete(), 15000, `social.delete:${id}`)
    } catch (err) {
      console.error(`[Social Repo] Delete error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memorySocialLinks = memorySocialLinks.filter(s => s.id !== id)
  return true
}

/**
 * Resets memory store to default seeds (useful for test isolation).
 */
export function resetMemorySocialLinks(): void {
  memorySocialLinks = [...defaultSocialLinks]
}
