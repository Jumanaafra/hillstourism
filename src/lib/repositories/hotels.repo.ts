import { getFirestoreDB } from '../firebase/admin'
import { seedHotels } from './seed'
import { normalizeHotelName } from '../normalization/hotel'
import type { Hotel } from '../../types/domain'

// In-memory store for development/testing when Firestore is offline
let memoryHotels: Hotel[] = [...seedHotels]

export async function getHotels(onlyActive = true): Promise<Hotel[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('hotels')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await query.get()
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hotel))
      }
    } catch (err) {
      console.warn('[Hotels Repo] Firestore fetch failed, falling back to memory store:', err)
    }
  }
  return onlyActive ? memoryHotels.filter(h => h.active) : [...memoryHotels]
}

export async function getHotelById(id: string): Promise<Hotel | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await db.collection('hotels').doc(id).get()
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Hotel
      }
    } catch (err) {
      console.warn(`[Hotels Repo] Firestore getById failed for ${id}:`, err)
    }
  }
  return memoryHotels.find(h => h.id === id) || null
}

/**
 * Checks whether a hotel name identity already exists.
 * Returns the conflicting hotel if found.
 */
export async function findHotelByNormalizedName(normalizedName: string, excludeId?: string): Promise<Hotel | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await db.collection('hotels')
        .where('normalizedName', '==', normalizedName)
        .limit(1)
        .get()

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        if (!excludeId || doc.id !== excludeId) {
          return { id: doc.id, ...doc.data() } as Hotel
        }
      }
    } catch (err) {
      console.warn('[Hotels Repo] Firestore normalized name lookup failed:', err)
    }
  }

  // Memory fallback check
  const found = memoryHotels.find(h => h.normalizedName === normalizedName && (!excludeId || h.id !== excludeId))
  return found || null
}

/**
 * Creates a new hotel with server-side uniqueness enforcement.
 */
export async function createHotel(data: Omit<Hotel, 'id' | 'normalizedName' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Hotel> {
  const normalizedName = normalizeHotelName(data.name)
  if (!normalizedName) {
    throw new Error('Hotel name is required')
  }

  // Uniqueness enforcement (Server-side)
  const existing = await findHotelByNormalizedName(normalizedName)
  if (existing) {
    throw new Error(`A hotel with the name "${data.name}" (or equivalent identity) already exists.`)
  }

  const newHotel: Hotel = {
    ...data,
    id: data.id || `hotel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    normalizedName,
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('hotels').doc(newHotel.id).set(newHotel)
    } catch (err) {
      console.warn('[Hotels Repo] Firestore save failed, saving to memory:', err)
    }
  }

  memoryHotels.unshift(newHotel)
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

  const updated: Hotel = {
    ...current,
    ...data,
    normalizedName,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('hotels').doc(id).set(updated, { merge: true })
    } catch (err) {
      console.warn(`[Hotels Repo] Firestore update failed for ${id}:`, err)
    }
  }

  const idx = memoryHotels.findIndex(h => h.id === id)
  if (idx !== -1) {
    memoryHotels[idx] = updated
  }

  return updated
}

/**
 * Deletes or archives a hotel.
 */
export async function deleteHotel(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('hotels').doc(id).delete()
    } catch (err) {
      console.warn(`[Hotels Repo] Firestore delete failed for ${id}:`, err)
    }
  }

  memoryHotels = memoryHotels.filter(h => h.id !== id)
  return true
}

// Reset memory store for testing purposes
export function _resetMemoryHotels(seed = seedHotels) {
  memoryHotels = [...seed]
}
