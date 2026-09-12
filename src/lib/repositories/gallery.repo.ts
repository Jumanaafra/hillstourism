import 'server-only'
import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
  category?: string
  displayOrder: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

// Seed data matching the current hardcoded values in Gallery.jsx
export const seedGalleryPhotos: GalleryPhoto[] = [
  { id: 'g1', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80&auto=format', alt: 'Majestic mountain range at golden hour', category: 'Mountains', displayOrder: 1, active: true },
  { id: 'g2', src: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=700&q=80&auto=format', alt: 'Campfire by the lakeside at dusk', category: 'Experiences', displayOrder: 2, active: true },
  { id: 'g3', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700&q=80&auto=format', alt: 'Sunrise over Himalayan peaks', category: 'Mountains', displayOrder: 3, active: true },
  { id: 'g4', src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=80&auto=format', alt: 'Dense forest trail in Coorg', category: 'Nature', displayOrder: 4, active: true },
  { id: 'g5', src: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=700&q=80&auto=format', alt: 'Golden sunrise over tea gardens', category: 'Nature', displayOrder: 5, active: true },
  { id: 'g6', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80&auto=format', alt: 'Snow-capped mountain peaks of Himachal', category: 'Mountains', displayOrder: 6, active: true },
  { id: 'g7', src: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=700&q=80&auto=format', alt: 'Manali valley panoramic view', category: 'Mountains', displayOrder: 7, active: true },
  { id: 'g8', src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&q=80&auto=format', alt: 'Peaceful mountain lake reflection', category: 'Nature', displayOrder: 8, active: true },
]

let memoryPhotos: GalleryPhoto[] = [...seedGalleryPhotos]

export async function getGalleryPhotos(onlyActive = true): Promise<GalleryPhoto[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('gallery')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'gallery.get')
      const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryPhoto))
      memoryPhotos = [...photos]
      return photos.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    } catch (err) {
      console.error('[Gallery Repo] Firestore fetch failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const photos = onlyActive ? memoryPhotos.filter(p => p.active) : [...memoryPhotos]
  return photos.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
}

export async function getGalleryPhotoById(id: string): Promise<GalleryPhoto | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('gallery').doc(id).get(), 15000, `gallery.getById:${id}`)
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as GalleryPhoto
      }
      return null
    } catch (err) {
      console.error(`[Gallery Repo] Firestore getById failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return memoryPhotos.find(p => p.id === id) || null
}

export async function createGalleryPhoto(data: Omit<GalleryPhoto, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryPhoto> {
  const newPhoto: GalleryPhoto = {
    ...data,
    id: `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('gallery').doc(newPhoto.id).set(newPhoto), 15000, 'gallery.create')
    } catch (err) {
      console.error('[Gallery Repo] Firestore save failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryPhotos.push(newPhoto)
  return newPhoto
}

export async function updateGalleryPhoto(id: string, data: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
  const current = await getGalleryPhotoById(id)
  if (!current) {
    throw new Error(`Gallery photo with ID ${id} not found`)
  }

  const updated: GalleryPhoto = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('gallery').doc(id).set(updated, { merge: true }), 15000, `gallery.update:${id}`)
    } catch (err) {
      console.error(`[Gallery Repo] Firestore update failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryPhotos.findIndex(p => p.id === id)
  if (idx !== -1) {
    memoryPhotos[idx] = updated
  }

  return updated
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('gallery').doc(id).delete(), 15000, `gallery.delete:${id}`)
    } catch (err) {
      console.error(`[Gallery Repo] Firestore delete failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryPhotos = memoryPhotos.filter(p => p.id !== id)
  return true
}

export function _resetMemoryGallery(seed = seedGalleryPhotos) {
  memoryPhotos = [...seed]
}

