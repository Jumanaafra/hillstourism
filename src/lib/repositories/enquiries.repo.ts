import 'server-only'
import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import type { Enquiry, EnquiryStatus } from '../../types/domain'

let memoryEnquiries: Enquiry[] = []

/**
 * Recursively strips undefined keys from objects before sending to Firestore.
 * Prevents "Cannot use undefined as a Firestore value" errors.
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value)
      }
    }
    return cleaned as any
  }
  return data
}

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
      const sanitized = sanitizeForFirestore(newEnquiry)
      await withFirestoreTimeout(db.collection('enquiries').doc(newEnquiry.id).set(sanitized), 15000, 'enquiries.create')
    } catch (err) {
      console.error('[Enquiries Repo] Firestore save failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  memoryEnquiries.unshift(newEnquiry)
  return newEnquiry
}

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  const db = getFirestoreDB()
  if (db) {
    try {
      const doc = await withFirestoreTimeout(db.collection('enquiries').doc(id).get(), 15000, `enquiries.getById:${id}`)
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Enquiry
      }
      return null
    } catch (err) {
      console.error(`[Enquiries Repo] Firestore getById failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
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
      // Order by createdAt desc without requiring composite indexes
      const query: FirebaseFirestore.Query = db.collection('enquiries').orderBy('createdAt', 'desc')
      const snapshot = await withFirestoreTimeout(query.get(), 15000, 'enquiries.get')
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry))
      
      // Ensure strict descending sort by timestamp
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      if (filters?.status) {
        results = results.filter(e => e.status === filters.status)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        results = results.filter(e =>
          e.customer?.name?.toLowerCase().includes(q) ||
          e.customer?.phone?.includes(q) ||
          (e.customer?.email && e.customer.email.toLowerCase().includes(q)) ||
          e.id?.toLowerCase().includes(q)
        )
      }
      if (filters?.limit) {
        results = results.slice(0, filters.limit)
      }
      memoryEnquiries = [...results]
      return results
    } catch (err) {
      console.error('[Enquiries Repo] Firestore query failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  let list = [...memoryEnquiries]
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (filters?.status) {
    list = list.filter(e => e.status === filters.status)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(e =>
      e.customer?.name?.toLowerCase().includes(q) ||
      e.customer?.phone?.includes(q) ||
      (e.customer?.email && e.customer.email.toLowerCase().includes(q)) ||
      e.id?.toLowerCase().includes(q)
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
      const sanitized = sanitizeForFirestore(updated)
      await withFirestoreTimeout(db.collection('enquiries').doc(id).set(sanitized, { merge: true }), 15000, `enquiries.update:${id}`)
    } catch (err) {
      console.error(`[Enquiries Repo] Firestore update failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
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

