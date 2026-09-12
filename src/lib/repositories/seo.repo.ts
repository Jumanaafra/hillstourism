import 'server-only'
import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import type { PageSEO } from '../../types/domain'

export const defaultPageSEOList: PageSEO[] = [
  {
    id: 'home',
    route: '/',
    title: 'Hills Tourism — Premium Mountain Journeys & Curated Hill Escapes',
    description:
      'Discover the hills beyond the ordinary. Handcrafted mountain tours, authentic curated stays, and experienced hill drivers across Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali.',
    canonicalUrl: '/',
    ogTitle: 'Hills Tourism — Discover the Hills Beyond the Ordinary',
    ogDescription:
      'Cinematic journeys through India’s most breathtaking mountains. Curated escapes crafted by local experts who call the hills home.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'about',
    route: '/about',
    title: 'About Hills Tourism — Local Mountain Travel Specialists',
    description:
      'Founded in 2018, Hills Tourism creates authentic mountain escapes. Meet our local hill experts, curated homestay network, and mountain-certified chauffeurs.',
    canonicalUrl: '/about',
    ogTitle: 'About Hills Tourism — Local Mountain Travel Specialists',
    ogDescription:
      'Curated escapes crafted by local experts who call the hills home. Personalized planning for authentic mountain journeys.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'packages',
    route: '/packages',
    title: 'Curated Mountain Tour Packages — Hills Tourism',
    description:
      'Explore handcrafted hill station itineraries across Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali. Tailored for couples, families, and mountain explorers.',
    canonicalUrl: '/packages',
    ogTitle: 'Curated Mountain Tour Packages — Hills Tourism',
    ogDescription:
      'Handcrafted day-by-day itineraries across India’s most breathtaking hill destinations.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stays',
    route: '/stays',
    title: 'Curated Mountain Stays & Homestays — Hills Tourism',
    description:
      'Discover authentic hill cottages, colonial bungalows, and luxury hillside resorts across Munnar, Coorg, Ooty, and Himachal. Vetted for panoramic views and hospitality.',
    canonicalUrl: '/stays',
    ogTitle: 'Curated Mountain Stays & Homestays — Hills Tourism',
    ogDescription:
      'Authentic hill cottages, colonial bungalows, and boutique mountain resorts vetted by local hill experts.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vehicles',
    route: '/vehicles',
    title: 'Dedicated Hill Fleet & Mountain Chauffeurs — Hills Tourism',
    description:
      'Reliable mountain fleet including Innova Crysta, Fortuner, and Tempo Travelers with experienced local drivers for scenic Western Ghats and Himalayan terrains.',
    canonicalUrl: '/vehicles',
    ogTitle: 'Dedicated Hill Fleet & Mountain Chauffeurs — Hills Tourism',
    ogDescription:
      'Chauffeur-driven mountain cabs and luxury SUVs optimized for hill station curves, luggage, and family comfort.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'experiences',
    route: '/experiences',
    title: 'Mountain Experiences & Guided Activities — Hills Tourism',
    description:
      'From early dawn tea walks and heritage steam trains to high ridge treks and spice tastings. Discover bespoke mountain activities crafted by local experts.',
    canonicalUrl: '/experiences',
    ogTitle: 'Mountain Experiences & Guided Activities — Hills Tourism',
    ogDescription:
      'Immersive hill station activities and guided adventures across South and North India.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gallery',
    route: '/gallery',
    title: 'Visual Mountain Stories & Photo Gallery — Hills Tourism',
    description:
      'Browse our curated gallery of rolling tea plantations, mist-covered mountain valleys, colonial stays, and scenic hill moments captured by our travelers.',
    canonicalUrl: '/gallery',
    ogTitle: 'Visual Mountain Stories & Photo Gallery — Hills Tourism',
    ogDescription:
      'Cinematic imagery from Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'privacy-policy',
    route: '/privacy-policy',
    title: 'Privacy Policy — Hills Tourism',
    description:
      'Learn how Hills Tourism collects, uses, and safeguards information submitted through our enquiry-based mountain travel platform.',
    canonicalUrl: '/privacy-policy',
    ogTitle: 'Privacy Policy — Hills Tourism',
    ogDescription:
      'Our commitment to privacy and data protection for all travelers exploring mountain getaways with Hills Tourism.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'terms-and-conditions',
    route: '/terms-and-conditions',
    title: 'Terms & Conditions — Hills Tourism',
    description:
      'Review the terms of service and enquiry guidelines for exploring and planning mountain journeys with Hills Tourism.',
    canonicalUrl: '/terms-and-conditions',
    ogTitle: 'Terms & Conditions — Hills Tourism',
    ogDescription:
      'Clear, transparent terms governing enquiry submissions and custom itinerary planning with Hills Tourism.',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  },
]

let memoryPageSEO: PageSEO[] = [...defaultPageSEOList]

/**
 * Sanitizes string input to prevent executable HTML/JavaScript injection in metadata.
 */
export function sanitizeSEOText(val?: string): string {
  if (!val || typeof val !== 'string') return ''
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
}

/**
 * Validates SEO payload.
 */
export function validatePageSEOPayload(data: Partial<PageSEO>): { valid: boolean; error?: string } {
  if (!data.route || typeof data.route !== 'string') {
    return { valid: false, error: 'Route is required (e.g. "/", "/about").' }
  }

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    return { valid: false, error: 'SEO Title is required.' }
  }

  if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
    return { valid: false, error: 'SEO Description is required.' }
  }

  if (data.title.length > 90) {
    return { valid: false, error: 'SEO Title exceeds 90 characters limit.' }
  }

  if (data.description.length > 320) {
    return { valid: false, error: 'SEO Description exceeds 320 characters limit.' }
  }

  if (data.canonicalUrl) {
    const trimmed = data.canonicalUrl.trim()
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
      return { valid: false, error: 'Invalid Canonical URL protocol.' }
    }
    if (!trimmed.startsWith('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { valid: false, error: 'Canonical URL must be a valid relative path or http(s) URL.' }
    }
  }

  if (data.ogImage) {
    const trimmed = data.ogImage.trim()
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
      return { valid: false, error: 'Invalid OG Image URL protocol.' }
    }
  }

  return { valid: true }
}

/**
 * Retrieves all Page SEO entries.
 */
export async function getAllPageSEO(): Promise<PageSEO[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await withFirestoreTimeout(db.collection('seo_pages').get(), 15000, 'getAllPageSEO')
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageSEO))
      // Merge with defaults to ensure all routes exist
      const map = new Map<string, PageSEO>()
      defaultPageSEOList.forEach(def => map.set(def.route, def))
      list.forEach(item => map.set(item.route, item))
      const merged = Array.from(map.values())
      memoryPageSEO = [...merged]
      return merged
    } catch (err) {
      console.error('[SEO Repo] Firestore fetch error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return [...memoryPageSEO]
}

/**
 * Retrieves SEO metadata for a specific route.
 */
export async function getSeoByRoute(route: string): Promise<PageSEO | null> {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await withFirestoreTimeout(
        db.collection('seo_pages').where('route', '==', normalizedRoute).limit(1).get(),
        15000,
        `getSeoByRoute:${normalizedRoute}`
      )
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return { id: doc.id, ...doc.data() } as PageSEO
      }
    } catch (err) {
      console.error(`[SEO Repo] Fetch error for route ${normalizedRoute}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return (
    memoryPageSEO.find(s => s.route === normalizedRoute) ||
    defaultPageSEOList.find(s => s.route === normalizedRoute) ||
    null
  )
}

/**
 * Saves or updates Page SEO configuration.
 */
export async function savePageSEO(data: Partial<PageSEO> & { route: string }): Promise<PageSEO> {
  const normalizedRoute = data.route.startsWith('/') ? data.route : `/${data.route}`
  const defaultEntry = defaultPageSEOList.find(d => d.route === normalizedRoute)

  const validation = validatePageSEOPayload({
    ...data,
    route: normalizedRoute,
    title: data.title || defaultEntry?.title || '',
    description: data.description || defaultEntry?.description || '',
  })

  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const id = data.id || defaultEntry?.id || `seo-${normalizedRoute.replace(/[^a-z0-9]/gi, '_')}`

  const item: PageSEO = {
    id,
    route: normalizedRoute,
    title: sanitizeSEOText(data.title),
    description: sanitizeSEOText(data.description),
    canonicalUrl: data.canonicalUrl ? sanitizeSEOText(data.canonicalUrl) : (defaultEntry?.canonicalUrl || normalizedRoute),
    ogTitle: data.ogTitle ? sanitizeSEOText(data.ogTitle) : sanitizeSEOText(data.title),
    ogDescription: data.ogDescription ? sanitizeSEOText(data.ogDescription) : sanitizeSEOText(data.description),
    ogImage: data.ogImage ? data.ogImage.trim() : defaultEntry?.ogImage,
    robots: data.robots || 'index, follow',
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('seo_pages').doc(item.id).set(item, { merge: true }), 15000, 'seo.save')
    } catch (err) {
      console.error('[SEO Repo] Save error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryPageSEO.findIndex(s => s.route === normalizedRoute || s.id === item.id)
  if (idx !== -1) {
    memoryPageSEO[idx] = item
  } else {
    memoryPageSEO.push(item)
  }

  return item
}

/**
 * Resets a page's SEO back to its application default.
 */
export async function resetPageSEO(routeOrId: string): Promise<PageSEO> {
  const defaultEntry = defaultPageSEOList.find(
    d => d.route === routeOrId || d.id === routeOrId || d.route === `/${routeOrId}`
  )

  if (!defaultEntry) {
    throw new Error(`No default SEO configuration found for "${routeOrId}".`)
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('seo_pages').doc(defaultEntry.id).delete(), 15000, 'seo.reset')
    } catch (err) {
      console.error(`[SEO Repo] Reset error for ${defaultEntry.id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryPageSEO.findIndex(s => s.id === defaultEntry.id || s.route === defaultEntry.route)
  if (idx !== -1) {
    memoryPageSEO[idx] = { ...defaultEntry, updatedAt: new Date().toISOString() }
  }

  return { ...defaultEntry }
}

/**
 * Resets memory store to defaults (useful for test isolation).
 */
export function resetMemorySEO(): void {
  memoryPageSEO = [...defaultPageSEOList]
}

export const getAllSeoConfigs = getAllPageSEO
export const upsertSeoConfig = savePageSEO
export const resetSeoToDefault = async (routeOrId: string): Promise<boolean> => {
  await resetPageSEO(routeOrId)
  return true
}

