import 'server-only'
import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import { seedHotels } from './seed'
import { normalizeHotelName } from '../normalization/hotel'
import type { Hotel } from '../../types/domain'

// In-memory store for development/testing when Firestore is offline
let memoryHotels: Hotel[] = [...seedHotels]
let lastFirestoreSync = 0
const SYNC_INTERVAL = 15000 // 15s TTL

export async function getHotels(onlyActive = true): Promise<Hotel[]> {
  const now = Date.now()
  const db = getFirestoreDB()

  if (db && now - lastFirestoreSync >= SYNC_INTERVAL) {
    try {
      let query: FirebaseFirestore.Query = db.collection('hotels')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'getHotels')
      memoryHotels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hotel))
      lastFirestoreSync = now
    } catch (err) {
      console.error('[Hotels Repo] Firestore fetch failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return onlyActive ? memoryHotels.filter(h => h.active) : [...memoryHotels]
}

export async function getHotelById(id: string): Promise<Hotel | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('hotels').doc(id).get(), 15000, `getHotelById:${id}`)
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Hotel
      }
      // Also check slug
      const slugSnap = await withFirestoreTimeout(
        db.collection('hotels').where('slug', '==', id).limit(1).get(),
        15000,
        `getHotelById:slug:${id}`
      )
      if (!slugSnap.empty) {
        const d = slugSnap.docs[0]
        return { id: d.id, ...d.data() } as Hotel
      }
      return null
    } catch (err) {
      console.error(`[Hotels Repo] Firestore getById failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return memoryHotels.find(h => h.id === id || h.slug === id) || null
}

/**
 * Checks whether a hotel name identity already exists.
 * Returns the conflicting hotel if found.
 */
export async function findHotelByNormalizedName(normalizedName: string, excludeId?: string): Promise<Hotel | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await withFirestoreTimeout(
        db.collection('hotels')
          .where('normalizedName', '==', normalizedName)
          .limit(1)
          .get(),
        15000,
        `findHotelByNormalizedName:${normalizedName}`
      )

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        if (!excludeId || doc.id !== excludeId) {
          return { id: doc.id, ...doc.data() } as Hotel
        }
      }
      return null
    } catch (err) {
      console.error('[Hotels Repo] Firestore normalized name lookup failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  // Memory fallback check
  const found = memoryHotels.find(h => h.normalizedName === normalizedName && (!excludeId || h.id !== excludeId))
  return found || null
}

/**
 * Checks whether a hotel slug already exists.
 * Returns the conflicting hotel if found.
 * Pass excludeId to allow a hotel to be updated without conflicting with itself.
 */
export async function findHotelBySlug(slug: string, excludeId?: string): Promise<Hotel | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await withFirestoreTimeout(
        db.collection('hotels').where('slug', '==', slug).limit(1).get(),
        15000,
        `findHotelBySlug:${slug}`
      )
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        if (!excludeId || doc.id !== excludeId) {
          return { id: doc.id, ...doc.data() } as Hotel
        }
      }
      return null
    } catch (err) {
      console.error('[Hotels Repo] Firestore slug uniqueness check failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  // Memory fallback check
  const found = memoryHotels.find(h => h.slug === slug && (!excludeId || h.id !== excludeId))
  return found || null
}

/**
 * Creates a new hotel with server-side uniqueness enforcement.
 */
export async function createHotel(data: Omit<Hotel, 'id' | 'normalizedName' | 'createdAt' | 'updatedAt' | 'slug'> & { id?: string; slug?: string }): Promise<Hotel> {
  const normalizedName = normalizeHotelName(data.name)
  if (!normalizedName) {
    throw new Error('Hotel name is required')
  }

  // Uniqueness: name (existing)
  const existingByName = await findHotelByNormalizedName(normalizedName)
  if (existingByName) {
    throw new Error(`A hotel with the name "${data.name}" (or equivalent identity) already exists.`)
  }

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // Uniqueness: slug (new)
  const existingBySlug = await findHotelBySlug(slug)
  if (existingBySlug) {
    throw new Error(`A hotel with the slug "${slug}" already exists. Please use a unique slug.`)
  }

  const newHotel: Hotel = {
    ...data,
    id: data.id || `hotel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug,
    normalizedName,
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('hotels').doc(newHotel.id).set(newHotel), 15000, 'hotels.create')
    } catch (err) {
      console.error('[Hotels Repo] Firestore save failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryHotels.unshift(newHotel)
  lastFirestoreSync = 0
  return newHotel
}

/**
 * Updates a hotel with server-side uniqueness enforcement.
 */
export async function updateHotel(id: string, data: Partial<Hotel>): Promise<Hotel> {
  const current = await getHotelById(id)
  if (!current) {
    throw new Error(`Hotel with ID ${id} not found`)
  }

  let normalizedName = current.normalizedName
  if (data.name && data.name !== current.name) {
    normalizedName = normalizeHotelName(data.name)
    const existing = await findHotelByNormalizedName(normalizedName, id)
    if (existing) {
      throw new Error(`Cannot rename hotel: another hotel with name "${data.name}" already exists.`)
    }
  }

  // If slug is being changed, enforce slug uniqueness excluding this hotel's own ID
  if (data.slug && data.slug !== current.slug) {
    const slugConflict = await findHotelBySlug(data.slug, id)
    if (slugConflict) {
      throw new Error(`A hotel with the slug "${data.slug}" already exists. Please use a unique slug.`)
    }
  }

  const updated: Hotel = {
    ...current,
    ...data,
    normalizedName,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('hotels').doc(id).set(updated, { merge: true }), 15000, `hotels.update:${id}`)
    } catch (err) {
      console.error(`[Hotels Repo] Firestore update failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryHotels.findIndex(h => h.id === id)
  if (idx !== -1) {
    memoryHotels[idx] = updated
  }
  lastFirestoreSync = 0

  return updated
}

/**
 * Deletes or archives a hotel.
 */
export async function deleteHotel(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('hotels').doc(id).delete(), 15000, `hotels.delete:${id}`)
    } catch (err) {
      console.error(`[Hotels Repo] Firestore delete failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryHotels = memoryHotels.filter(h => h.id !== id)
  lastFirestoreSync = 0
  return true
}

// Reset memory store for testing purposes
export function _resetMemoryHotels(seed = seedHotels) {
  memoryHotels = [...seed]
  lastFirestoreSync = 0
}

