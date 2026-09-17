import 'server-only'
import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import type { Enquiry, EnquiryStatus, EnquiryNote, EnquiryTimelineEvent } from '../../types/domain'

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
  const createdAt = new Date().toISOString()
  const newEnquiry: Enquiry = {
    ...data,
    id: `ENQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: data.status || 'new',
    integrations: {
      emailStatus: data.integrations?.emailStatus || 'pending',
      sheetsStatus: data.integrations?.sheetsStatus || 'pending',
    },
    timeline: data.timeline || [
      {
        id: `TLE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'created',
        title: 'Enquiry Received',
        description: `Customer submitted enquiry for ${data.package?.nameSnapshot || 'custom tour'}`,
        timestamp: createdAt,
      },
    ],
    notes: data.notes || [],
    createdAt,
    updatedAt: createdAt,
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

  const db = getFirestoreDB()
  if (db) {
    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      }
      for (const [key, val] of Object.entries(integrations)) {
        if (val !== undefined) {
          updateData[`integrations.${key}`] = val
        }
      }
      await withFirestoreTimeout(
        db.collection('enquiries').doc(id).update(updateData),
        15000,
        `enquiries.updateIntegrations:${id}`
      )
    } catch (err) {
      console.error(`[Enquiries Repo] Firestore updateIntegrations failed for ${id}:`, err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  } else if (!db && !allowMemoryFallback()) {
    throw new Error('Database is required in production but Firestore is not configured.')
  }

  const updated: Enquiry = {
    ...current,
    integrations: updatedIntegrations,
    updatedAt: new Date().toISOString(),
  }

  const idx = memoryEnquiries.findIndex(e => e.id === id)
  if (idx !== -1) {
    memoryEnquiries[idx] = updated
  }

  return updated
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<Enquiry> {
  return await updateEnquiry(id, { status })
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

/**
 * Adds an internal admin note to an enquiry.
 */
export async function addEnquiryNote(
  enquiryId: string,
  noteData: Omit<EnquiryNote, 'id' | 'createdAt'>
): Promise<{ enquiry: Enquiry; note: EnquiryNote }> {
  const enquiry = await getEnquiryById(enquiryId)
  if (!enquiry) {
    throw new Error(`Enquiry ${enquiryId} not found`)
  }

  const newNote: EnquiryNote = {
    id: `NOTE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    content: noteData.content.trim(),
    author: noteData.author || 'Admin',
    createdAt: new Date().toISOString(),
  }

  const timelineEvent: EnquiryTimelineEvent = {
    id: `TLE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'note_added',
    title: `Internal Note Added`,
    description: newNote.content.slice(0, 100) + (newNote.content.length > 100 ? '...' : ''),
    timestamp: newNote.createdAt,
    author: newNote.author,
  }

  const updatedNotes = [...(enquiry.notes || []), newNote]
  const updatedTimeline = [...(enquiry.timeline || []), timelineEvent]

  const updated = await updateEnquiry(enquiryId, {
    notes: updatedNotes,
    timeline: updatedTimeline,
  })

  return { enquiry: updated, note: newNote }
}

/**
 * Updates an internal admin note.
 */
export async function updateEnquiryNote(
  enquiryId: string,
  noteId: string,
  content: string
): Promise<{ enquiry: Enquiry; note: EnquiryNote }> {
  const enquiry = await getEnquiryById(enquiryId)
  if (!enquiry) {
    throw new Error(`Enquiry ${enquiryId} not found`)
  }

  const notes = enquiry.notes || []
  const noteIndex = notes.findIndex(n => n.id === noteId)
  if (noteIndex === -1) {
    throw new Error(`Note ${noteId} not found on enquiry ${enquiryId}`)
  }

  const updatedNote: EnquiryNote = {
    ...notes[noteIndex],
    content: content.trim(),
    updatedAt: new Date().toISOString(),
  }

  const updatedNotes = [...notes]
  updatedNotes[noteIndex] = updatedNote

  const updated = await updateEnquiry(enquiryId, {
    notes: updatedNotes,
  })

  return { enquiry: updated, note: updatedNote }
}

/**
 * Deletes an internal admin note.
 */
export async function deleteEnquiryNote(
  enquiryId: string,
  noteId: string
): Promise<Enquiry> {
  const enquiry = await getEnquiryById(enquiryId)
  if (!enquiry) {
    throw new Error(`Enquiry ${enquiryId} not found`)
  }

  const updatedNotes = (enquiry.notes || []).filter(n => n.id !== noteId)
  return await updateEnquiry(enquiryId, {
    notes: updatedNotes,
  })
}

/**
 * Appends a timeline event to an enquiry.
 */
export async function addEnquiryTimelineEvent(
  enquiryId: string,
  event: Omit<EnquiryTimelineEvent, 'id' | 'timestamp'>
): Promise<Enquiry> {
  const enquiry = await getEnquiryById(enquiryId)
  if (!enquiry) {
    throw new Error(`Enquiry ${enquiryId} not found`)
  }

  const newEvent: EnquiryTimelineEvent = {
    ...event,
    id: `TLE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
  }

  const updatedTimeline = [...(enquiry.timeline || []), newEvent]
  return await updateEnquiry(enquiryId, {
    timeline: updatedTimeline,
  })
}

