import { getFirestoreDB } from '../firebase/admin'
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

export async function getPackages(onlyActive = true): Promise<Package[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('packages')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await query.get()
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => normalizePackage({ id: doc.id, ...doc.data() } as Package))
      }
    } catch (err) {
      console.warn('[Packages Repo] Firestore fetch failed, falling back to memory store:', err)
    }
  }
  return onlyActive
    ? memoryPackages.filter(p => p.active).map(normalizePackage)
    : memoryPackages.map(normalizePackage)
}

export async function getPackageById(id: string): Promise<Package | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await db.collection('packages').doc(id).get()
      if (doc.exists) {
        return normalizePackage({ id: doc.id, ...doc.data() } as Package)
      }
      const snapshot = await db.collection('packages').where('slug', '==', id).limit(1).get()
      if (!snapshot.empty) {
        const d = snapshot.docs[0]
        return normalizePackage({ id: d.id, ...d.data() } as Package)
      }
    } catch (err) {
      console.warn(`[Packages Repo] Firestore getById failed for ${id}:`, err)
    }
  }
  const found = memoryPackages.find(p => p.id === id || p.slug === id)
  return found ? normalizePackage(found) : null
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await db.collection('packages')
        .where('slug', '==', slug)
        .limit(1)
        .get()
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return normalizePackage({ id: doc.id, ...doc.data() } as Package)
      }
    } catch (err) {
      console.warn(`[Packages Repo] Firestore getBySlug failed for ${slug}:`, err)
    }
  }
  const found = memoryPackages.find(p => p.slug === slug || p.id === slug)
  return found ? normalizePackage(found) : null
}

export async function createPackage(data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Package> {
  const newPackage: Package = {
    ...data,
    id: data.id || `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('packages').doc(newPackage.id).set(newPackage)
    } catch (err) {
      console.warn('[Packages Repo] Firestore save failed, saving to memory:', err)
    }
  }

  memoryPackages.unshift(newPackage)
  return newPackage
}

export async function updatePackage(id: string, data: Partial<Package>): Promise<Package> {
  const current = await getPackageById(id)
  if (!current) {
    throw new Error(`Package with ID ${id} not found`)
  }

  const updated: Package = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('packages').doc(id).set(updated, { merge: true })
    } catch (err) {
      console.warn(`[Packages Repo] Firestore update failed for ${id}:`, err)
    }
  }

  const normalized = normalizePackage(updated)
  const idx = memoryPackages.findIndex(p => p.id === id)
  if (idx !== -1) {
    memoryPackages[idx] = normalized
  }

  return normalized
}

export async function deletePackage(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('packages').doc(id).delete()
    } catch (err) {
      console.warn(`[Packages Repo] Firestore delete failed for ${id}:`, err)
    }
  }

  memoryPackages = memoryPackages.filter(p => p.id !== id)
  return true
}

export function _resetMemoryPackages(seed = seedPackages) {
  memoryPackages = seed.map(normalizePackage)
}
