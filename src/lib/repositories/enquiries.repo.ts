import { getFirestoreDB } from '../firebase/admin'
import type { Enquiry, EnquiryStatus } from '../../types/domain'

let memoryEnquiries: Enquiry[] = []

export async function createEnquiry(data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Enquiry> {
  const newEnquiry: Enquiry = {
    ...data,
    id: `ENQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: data.status || 'new',
    integrations: {
      emailStatus: data.integrations?.emailStatus || 'pending',
      sheetsStatus: data.integrations?.sheetsStatus || 'pending',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('enquiries').doc(newEnquiry.id).set(newEnquiry)
    } catch (err) {
      console.warn('[Enquiries Repo] Firestore save failed, saving to memory:', err)
    }
  }

  memoryEnquiries.unshift(newEnquiry)
  return newEnquiry
}

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await db.collection('enquiries').doc(id).get()
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Enquiry
      }
    } catch (err) {
      console.warn(`[Enquiries Repo] Firestore getById failed for ${id}:`, err)
    }
  }
  return memoryEnquiries.find(e => e.id === id) || null
}

export async function getEnquiries(filters?: {
  status?: EnquiryStatus
  search?: string
  limit?: number
}): Promise<Enquiry[]> {
  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('enquiries').orderBy('createdAt', 'desc')
      if (filters?.status) {
        query = query.where('status', '==', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      const snapshot = await query.get()
      if (!snapshot.empty) {
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry))
        if (filters?.search) {
          const q = filters.search.toLowerCase()
          results = results.filter(e =>
            e.customer.name.toLowerCase().includes(q) ||
            e.customer.phone.includes(q) ||
            (e.customer.email && e.customer.email.toLowerCase().includes(q))
          )
        }
        return results
      }
    } catch (err) {
      console.warn('[Enquiries Repo] Firestore query failed, falling back to memory:', err)
    }
  }

  let list = [...memoryEnquiries]
  if (filters?.status) {
    list = list.filter(e => e.status === filters.status)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(e =>
      e.customer.name.toLowerCase().includes(q) ||
      e.customer.phone.includes(q) ||
      (e.customer.email && e.customer.email.toLowerCase().includes(q))
    )
  }
  if (filters?.limit) {
    list = list.slice(0, filters.limit)
  }
  return list
}

export async function updateEnquiry(id: string, data: Partial<Enquiry>): Promise<Enquiry> {
  const current = await getEnquiryById(id)
  if (!current) {
    throw new Error(`Enquiry with ID ${id} not found`)
  }

  const updated: Enquiry = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      await db.collection('enquiries').doc(id).set(updated, { merge: true })
    } catch (err) {
      console.warn(`[Enquiries Repo] Firestore update failed for ${id}:`, err)
    }
  }

  const idx = memoryEnquiries.findIndex(e => e.id === id)
  if (idx !== -1) {
    memoryEnquiries[idx] = updated
  }

  return updated
}

export async function updateEnquiryIntegrations(
  id: string,
  integrations: Partial<Enquiry['integrations']>
): Promise<Enquiry> {
  const current = await getEnquiryById(id)
  if (!current) {
    throw new Error(`Enquiry with ID ${id} not found`)
  }

  const updatedIntegrations = {
    ...current.integrations,
    ...integrations,
  }

  return updateEnquiry(id, { integrations: updatedIntegrations })
}

/**
 * Idempotency / duplicate check for recent submissions with the same phone and customer name.
 */
export async function isRecentDuplicateEnquiry(phone: string, name: string, windowSeconds = 60): Promise<boolean> {
  const threshold = new Date(Date.now() - windowSeconds * 1000).toISOString()
  const recent = memoryEnquiries.find(e =>
    e.customer.phone === phone &&
    e.customer.name.toLowerCase() === name.toLowerCase() &&
    e.createdAt >= threshold
  )
  return !!recent
}

export function _resetMemoryEnquiries() {
  memoryEnquiries = []
}
