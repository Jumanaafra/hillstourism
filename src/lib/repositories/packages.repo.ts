import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import { seedPackages } from './seed'
import type { Package } from '../../types/domain'
import { sortItineraryDays } from '../validation/itinerary'

export { sortItineraryDays }

function normalizePackage(pkg: Package): Package {
  return {
    ...pkg,
    itinerary: pkg.itinerary ? sortItineraryDays(pkg.itinerary) : undefined,
  }
}

let memoryPackages: Package[] = seedPackages.map(normalizePackage)
let lastFirestoreSync = 0
const SYNC_INTERVAL = 15000 // 15s cache TTL

export async function getPackages(onlyActive = true): Promise<Package[]> {
  const now = Date.now()
  const db = getFirestoreDB()

  if (db && now - lastFirestoreSync >= SYNC_INTERVAL) {
    try {
      let query: FirebaseFirestore.Query = db.collection('packages')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'getPackages')
      memoryPackages = snapshot.docs.map(doc => normalizePackage({ id: doc.id, ...doc.data() } as Package))
      lastFirestoreSync = now
    } catch (err) {
      console.error('[Packages Repo] Firestore fetch failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return onlyActive
    ? memoryPackages.filter(p => p.active).map(normalizePackage)
    : memoryPackages.map(normalizePackage)
}

export async function getPackageById(id: string): Promise<Package | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('packages').doc(id).get(), 15000, `getPackageById:${id}`)
      if (doc.exists) {
        return normalizePackage({ id: doc.id, ...doc.data() } as Package)
      }
      const snapshot = await withFirestoreTimeout(
        db.collection('packages').where('slug', '==', id).limit(1).get(),
        15000,
        `getPackageById:slug:${id}`
      )
      if (!snapshot.empty) {
        const d = snapshot.docs[0]
        return normalizePackage({ id: d.id, ...d.data() } as Package)
      }
      return null
    } catch (err) {
      console.error(`[Packages Repo] Firestore getById failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const found = memoryPackages.find(p => p.id === id || p.slug === id)
  return found ? normalizePackage(found) : null
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await withFirestoreTimeout(
        db.collection('packages').where('slug', '==', slug).limit(1).get(),
        15000,
        `getPackageBySlug:${slug}`
      )
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return normalizePackage({ id: doc.id, ...doc.data() } as Package)
      }
      return null
    } catch (err) {
      console.error(`[Packages Repo] Firestore getBySlug failed for ${slug}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const found = memoryPackages.find(p => p.slug === slug || p.id === slug)
  return found ? normalizePackage(found) : null
}

/**
 * Checks whether a package slug already exists.
 * Returns the conflicting package if found.
 * Pass excludeId to allow a package to be updated without conflicting with itself.
 */
export async function findPackageBySlug(slug: string, excludeId?: string): Promise<Package | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await withFirestoreTimeout(
        db.collection('packages').where('slug', '==', slug).limit(1).get(),
        15000,
        `findPackageBySlug:${slug}`
      )
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        if (!excludeId || doc.id !== excludeId) {
          return normalizePackage({ id: doc.id, ...doc.data() } as Package)
        }
      }
      return null
    } catch (err) {
      console.error('[Packages Repo] Firestore slug uniqueness check failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  // Memory fallback check
  const found = memoryPackages.find(p => p.slug === slug && (!excludeId || p.id !== excludeId))
  return found ? normalizePackage(found) : null
}

export async function createPackage(data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Package> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // Server-side slug uniqueness enforcement
  const existing = await findPackageBySlug(slug)
  if (existing) {
    throw new Error(`A package with the slug "${slug}" already exists. Please use a unique slug.`)
  }

  const newPackage: Package = {
    ...data,
    id: data.id || `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug,
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('packages').doc(newPackage.id).set(newPackage), 15000, 'packages.create')
    } catch (err) {
      console.error('[Packages Repo] Firestore save failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryPackages.unshift(newPackage)
  lastFirestoreSync = 0
  return newPackage
}

export async function updatePackage(id: string, data: Partial<Package>): Promise<Package> {
  const current = await getPackageById(id)
  if (!current) {
    throw new Error(`Package with ID ${id} not found`)
  }

  // If slug is being changed, enforce uniqueness excluding this package's own ID
  if (data.slug && data.slug !== current.slug) {
    const conflict = await findPackageBySlug(data.slug, id)
    if (conflict) {
      throw new Error(`A package with the slug "${data.slug}" already exists. Please use a unique slug.`)
    }
  }

  const updated: Package = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('packages').doc(id).set(updated, { merge: true }), 15000, `packages.update:${id}`)
    } catch (err) {
      console.error(`[Packages Repo] Firestore update failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const normalized = normalizePackage(updated)
  const idx = memoryPackages.findIndex(p => p.id === id)
  if (idx !== -1) {
    memoryPackages[idx] = normalized
  }
  lastFirestoreSync = 0

  return normalized
}

export async function deletePackage(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('packages').doc(id).delete(), 15000, `packages.delete:${id}`)
    } catch (err) {
      console.error(`[Packages Repo] Firestore delete failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryPackages = memoryPackages.filter(p => p.id !== id)
  lastFirestoreSync = 0
  return true
}

export function _resetMemoryPackages(seed = seedPackages) {
  memoryPackages = seed.map(normalizePackage)
  lastFirestoreSync = 0
}

