import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import { seedVehicles } from './seed'
import { normalizeNumberPlate } from '../normalization/vehicle'
import type { Vehicle } from '../../types/domain'

let memoryVehicles: Vehicle[] = [...seedVehicles]
let lastFirestoreSync = 0
const SYNC_INTERVAL = 15000 // 15s TTL

export async function getVehicles(onlyActive = true): Promise<Vehicle[]> {
  const now = Date.now()
  const db = getFirestoreDB()

  if (db && now - lastFirestoreSync >= SYNC_INTERVAL) {
    try {
      let query: FirebaseFirestore.Query = db.collection('vehicles')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'vehicles.get')
      memoryVehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle))
      lastFirestoreSync = now
    } catch (err) {
      console.error('[Vehicles Repo] Firestore fetch failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return onlyActive ? memoryVehicles.filter(v => v.active) : [...memoryVehicles]
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('vehicles').doc(id).get(), 15000, `vehicles.getById:${id}`)
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Vehicle
      }
      return null
    } catch (err) {
      console.error(`[Vehicles Repo] Firestore getById failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return memoryVehicles.find(v => v.id === id) || null
}

export async function findVehicleByNormalizedPlate(normalizedPlate: string, excludeId?: string): Promise<Vehicle | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await withFirestoreTimeout(
        db.collection('vehicles')
          .where('normalizedNumberPlate', '==', normalizedPlate)
          .limit(1)
          .get(),
        15000,
        'vehicles.lookupPlate'
      )

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        if (!excludeId || doc.id !== excludeId) {
          return { id: doc.id, ...doc.data() } as Vehicle
        }
      }
      return null
    } catch (err) {
      console.error('[Vehicles Repo] Firestore normalized plate lookup failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const found = memoryVehicles.find(v => v.normalizedNumberPlate === normalizedPlate && (!excludeId || v.id !== excludeId))
  return found || null
}

export async function createVehicle(data: Omit<Vehicle, 'id' | 'normalizedNumberPlate' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Vehicle> {
  const normalizedNumberPlate = normalizeNumberPlate(data.numberPlate)
  if (!normalizedNumberPlate) {
    throw new Error('Vehicle number plate is required')
  }

  // Server-side uniqueness check
  const existing = await findVehicleByNormalizedPlate(normalizedNumberPlate)
  if (existing) {
    throw new Error(`A vehicle with the number plate "${data.numberPlate}" already exists in the fleet.`)
  }

  const newVehicle: Vehicle = {
    ...data,
    id: data.id || `vehicle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    normalizedNumberPlate,
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('vehicles').doc(newVehicle.id).set(newVehicle), 15000, 'vehicles.create')
    } catch (err) {
      console.error('[Vehicles Repo] Firestore save failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryVehicles.unshift(newVehicle)
  lastFirestoreSync = 0
  return newVehicle
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
  const current = await getVehicleById(id)
  if (!current) {
    throw new Error(`Vehicle with ID ${id} not found`)
  }

  let normalizedNumberPlate = current.normalizedNumberPlate
  if (data.numberPlate && data.numberPlate !== current.numberPlate) {
    normalizedNumberPlate = normalizeNumberPlate(data.numberPlate)
    const existing = await findVehicleByNormalizedPlate(normalizedNumberPlate, id)
    if (existing) {
      throw new Error(`Cannot update: another vehicle with number plate "${data.numberPlate}" already exists.`)
    }
  }

  const updated: Vehicle = {
    ...current,
    ...data,
    normalizedNumberPlate,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('vehicles').doc(id).set(updated, { merge: true }), 15000, `vehicles.update:${id}`)
    } catch (err) {
      console.error(`[Vehicles Repo] Firestore update failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryVehicles.findIndex(v => v.id === id)
  if (idx !== -1) {
    memoryVehicles[idx] = updated
  }
  lastFirestoreSync = 0

  return updated
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('vehicles').doc(id).delete(), 15000, `vehicles.delete:${id}`)
    } catch (err) {
      console.error(`[Vehicles Repo] Firestore delete failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryVehicles = memoryVehicles.filter(v => v.id !== id)
  lastFirestoreSync = 0
  return true
}

export function _resetMemoryVehicles(seed = seedVehicles) {
  memoryVehicles = [...seed]
  lastFirestoreSync = 0
}

