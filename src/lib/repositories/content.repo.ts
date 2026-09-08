import { getFirestoreDB } from '../firebase/admin'
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

export async function getCategories(): Promise<Category[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await db.collection('categories').where('active', '==', true).get()
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
      }
    } catch (err) {
      console.warn('[Content Repo] Categories fetch error:', err)
    }
  }
  return memoryCategories.filter(c => c.active)
}

export async function getExperiences(): Promise<Experience[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await db.collection('experiences').get()
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience))
      }
    } catch (err) {
      console.warn('[Content Repo] Experiences fetch error:', err)
    }
  }
  return memoryExperiences
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const snapshot = await db.collection('testimonials').get()
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))
      }
    } catch (err) {
      console.warn('[Content Repo] Testimonials fetch error:', err)
    }
  }
  return memoryTestimonials
}

export async function getChatKnowledge(onlyActive = true): Promise<ChatKnowledge[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('chatKnowledge')
      if (onlyActive) {
        query = query.where('active', '==', true)
      }
      const snapshot = await query.get()
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatKnowledge))
      }
    } catch (err) {
      console.warn('[Content Repo] ChatKnowledge fetch error:', err)
    }
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
      await db.collection('chatKnowledge').doc(item.id).set(item)
    } catch (err) {
      console.warn('[Content Repo] Save chatKnowledge error:', err)
    }
  }

  memoryKnowledge.push(item)
  return item
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await db.collection('siteSettings').doc('general').get()
      if (doc.exists) {
        return doc.data() as SiteSettings
      }
    } catch (err) {
      console.warn('[Content Repo] SiteSettings fetch error:', err)
    }
  }
  return { ...memorySettings }
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  memorySettings = { ...memorySettings, ...updates }
  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('siteSettings').doc('general').set(memorySettings, { merge: true })
    } catch (err) {
      console.warn('[Content Repo] Save SiteSettings error:', err)
    }
  }
  return { ...memorySettings }
}
