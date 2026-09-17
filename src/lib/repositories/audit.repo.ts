import 'server-only'
import { getFirestoreDB, withFirestoreTimeout, allowMemoryFallback } from '../firebase/admin'
import type { AuditLogEntry } from '../../types/domain'

let memoryAuditLogs: AuditLogEntry[] = []

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

export async function createAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `AUDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
  }

  const db = getFirestoreDB()
  if (db) {
    try {
      const sanitized = sanitizeForFirestore(newEntry)
      await withFirestoreTimeout(
        db.collection('crm_audit_logs').doc(newEntry.id).set(sanitized),
        10000,
        'audit.create'
      )
    } catch (err) {
      console.error('[Audit Repo] Firestore save failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  }

  memoryAuditLogs.unshift(newEntry)
  if (memoryAuditLogs.length > 500) {
    memoryAuditLogs = memoryAuditLogs.slice(0, 500)
  }

  return newEntry
}

export async function getAuditLogs(filters?: {
  limit?: number
  enquiryId?: string
  action?: string
}): Promise<AuditLogEntry[]> {
  const limitCount = filters?.limit || 50

  const db = getFirestoreDB()
  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('crm_audit_logs').orderBy('timestamp', 'desc')
      if (filters?.enquiryId) {
        query = query.where('enquiryId', '==', filters.enquiryId)
      }
      if (filters?.action) {
        query = query.where('action', '==', filters.action)
      }

      const snapshot = await withFirestoreTimeout(
        query.limit(limitCount).get(),
        10000,
        'audit.get'
      )
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry))
      return results
    } catch (err) {
      console.error('[Audit Repo] Firestore query failed:', err)
      if (!allowMemoryFallback()) {
        throw err
      }
    }
  }

  let list = [...memoryAuditLogs]
  if (filters?.enquiryId) {
    list = list.filter(l => l.enquiryId === filters.enquiryId)
  }
  if (filters?.action) {
    list = list.filter(l => l.action === filters.action)
  }
  return list.slice(0, limitCount)
}

export function _resetMemoryAuditLogs() {
  memoryAuditLogs = []
}
