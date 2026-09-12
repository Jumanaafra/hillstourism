import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import {
  seedCategories,
  seedExperiences,
  seedTestimonials,
  seedKnowledge,
  seedSiteSettings,
} from './seed'
import type { Category, Experience, Testimonial, ChatKnowledge, SiteSettings } from '../../types/domain'

let memoryCategories: Category[] = [...seedCategories]
let memoryExperiences: Experience[] = [...seedExperiences]
let memoryTestimonials: Testimonial[] = [...seedTestimonials]
let memoryKnowledge: ChatKnowledge[] = [...seedKnowledge]
let memorySettings: SiteSettings = { ...seedSiteSettings }

export async function getCategories(onlyActive = true): Promise<Category[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('categories')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'categories.get')
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
      memoryCategories = [...categories]
      return categories
    } catch (err) {
      console.error('[Content Repo] Categories fetch error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return onlyActive ? memoryCategories.filter(c => c.active !== false) : [...memoryCategories]
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('categories').doc(id).get(), 15000, `categories.getById:${id}`)
      if (doc.exists) return { id: doc.id, ...doc.data() } as Category
      return null
    } catch (err) {
      console.error(`[Content Repo] Category getById error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return memoryCategories.find(c => c.id === id || c.slug === id) || null
}

export async function createCategory(data: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
  const item: Category = {
    ...data,
    id: data.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    active: data.active !== undefined ? data.active : true,
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('categories').doc(item.id).set(item), 15000, 'categories.create')
    } catch (err) {
      console.error('[Content Repo] Category save error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryCategories.push(item)
  return item
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const existing = await getCategoryById(id)
  if (!existing) throw new Error(`Category ${id} not found`)

  const updated: Category = { ...existing, ...updates }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('categories').doc(id).set(updated, { merge: true }), 15000, `categories.update:${id}`)
    } catch (err) {
      console.error(`[Content Repo] Category update error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryCategories.findIndex(c => c.id === id)
  if (idx !== -1) memoryCategories[idx] = updated

  return updated
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('categories').doc(id).delete(), 15000, `categories.delete:${id}`)
    } catch (err) {
      console.error(`[Content Repo] Category delete error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryCategories = memoryCategories.filter(c => c.id !== id)
  return true
}

export async function getExperiences(onlyActive = false): Promise<Experience[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('experiences')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'experiences.get')
      const exps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience))
      memoryExperiences = [...exps]
      return exps
    } catch (err) {
      console.error('[Content Repo] Experiences fetch error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return onlyActive ? memoryExperiences.filter(e => e.active !== false) : [...memoryExperiences]
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('experiences').doc(id).get(), 15000, `experiences.getById:${id}`)
      if (doc.exists) return { id: doc.id, ...doc.data() } as Experience
      return null
    } catch (err) {
      console.error(`[Content Repo] Experience getById error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return memoryExperiences.find(e => e.id === id) || null
}

export async function createExperience(data: Omit<Experience, 'id'> & { id?: string }): Promise<Experience> {
  const item: Experience = {
    ...data,
    id: data.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    active: data.active !== undefined ? data.active : true,
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('experiences').doc(item.id).set(item), 15000, 'experiences.create')
    } catch (err) {
      console.error('[Content Repo] Experience save error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryExperiences.push(item)
  return item
}

export async function updateExperience(id: string, updates: Partial<Experience>): Promise<Experience> {
  const existing = await getExperienceById(id)
  if (!existing) throw new Error(`Experience ${id} not found`)

  const updated: Experience = { ...existing, ...updates }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('experiences').doc(id).set(updated, { merge: true }), 15000, `experiences.update:${id}`)
    } catch (err) {
      console.error(`[Content Repo] Experience update error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryExperiences.findIndex(e => e.id === id)
  if (idx !== -1) memoryExperiences[idx] = updated

  return updated
}

export async function deleteExperience(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('experiences').doc(id).delete(), 15000, `experiences.delete:${id}`)
    } catch (err) {
      console.error(`[Content Repo] Experience delete error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryExperiences = memoryExperiences.filter(e => e.id !== id)
  return true
}

export async function getTestimonials(onlyActive = false): Promise<Testimonial[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('testimonials')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'testimonials.get')
      const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))
      memoryTestimonials = [...tests]
      return tests
    } catch (err) {
      console.error('[Content Repo] Testimonials fetch error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return onlyActive ? memoryTestimonials.filter(t => t.active !== false) : [...memoryTestimonials]
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('testimonials').doc(id).get(), 15000, `testimonials.getById:${id}`)
      if (doc.exists) return { id: doc.id, ...doc.data() } as Testimonial
      return null
    } catch (err) {
      console.error(`[Content Repo] Testimonial getById error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return memoryTestimonials.find(t => t.id === id) || null
}

export async function createTestimonial(data: Omit<Testimonial, 'id'> & { id?: string }): Promise<Testimonial> {
  const item: Testimonial = {
    ...data,
    id: data.id || `test-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    active: data.active !== undefined ? data.active : true,
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('testimonials').doc(item.id).set(item), 15000, 'testimonials.create')
    } catch (err) {
      console.error('[Content Repo] Testimonial save error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryTestimonials.push(item)
  return item
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  const existing = await getTestimonialById(id)
  if (!existing) throw new Error(`Testimonial ${id} not found`)

  const updated: Testimonial = { ...existing, ...updates }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('testimonials').doc(id).set(updated, { merge: true }), 15000, `testimonials.update:${id}`)
    } catch (err) {
      console.error(`[Content Repo] Testimonial update error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const idx = memoryTestimonials.findIndex(t => t.id === id)
  if (idx !== -1) memoryTestimonials[idx] = updated

  return updated
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('testimonials').doc(id).delete(), 15000, `testimonials.delete:${id}`)
    } catch (err) {
      console.error(`[Content Repo] Testimonial delete error for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryTestimonials = memoryTestimonials.filter(t => t.id !== id)
  return true
}

export async function getChatKnowledge(onlyActive = true): Promise<ChatKnowledge[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('chatKnowledge')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'chatKnowledge.get')
      const knowledges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatKnowledge))
      memoryKnowledge = [...knowledges]
      return knowledges
    } catch (err) {
      console.error('[Content Repo] ChatKnowledge fetch error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return onlyActive ? memoryKnowledge.filter(k => k.active) : [...memoryKnowledge]
}

export async function createChatKnowledge(data: Omit<ChatKnowledge, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatKnowledge> {
  const item: ChatKnowledge = {
    ...data,
    id: `k-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('chatKnowledge').doc(item.id).set(item), 15000, 'chatKnowledge.create')
    } catch (err) {
      console.error('[Content Repo] Save chatKnowledge error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryKnowledge.push(item)
  return item
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('siteSettings').doc('general').get(), 15000, 'siteSettings.get')
      if (doc.exists) {
        const data = doc.data() as SiteSettings
        memorySettings = { ...data }
        return data
      }
    } catch (err) {
      console.error('[Content Repo] SiteSettings fetch error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return { ...memorySettings }
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  memorySettings = { ...memorySettings, ...updates }
  const db = getFirestoreDB()
  if (db) {
    try {
      await withFirestoreTimeout(db.collection('siteSettings').doc('general').set(memorySettings, { merge: true }), 15000, 'siteSettings.update')
    } catch (err) {
      console.error('[Content Repo] Save SiteSettings error:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  return { ...memorySettings }
}

