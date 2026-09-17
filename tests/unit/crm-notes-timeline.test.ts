import { describe, it, expect, beforeEach } from 'vitest'
import {
  createEnquiry,
  getEnquiryById,
  addEnquiryNote,
  updateEnquiryNote,
  deleteEnquiryNote,
  addEnquiryTimelineEvent,
  updateEnquiryStatus,
  _resetMemoryEnquiries,
} from '../../src/lib/repositories/enquiries.repo'
import {
  createAuditLog,
  getAuditLogs,
  _resetMemoryAuditLogs,
} from '../../src/lib/repositories/audit.repo'
import type { EnquiryStatus } from '../../src/types/domain'

describe('CRM Internal Notes Management', () => {
  beforeEach(() => {
    _resetMemoryEnquiries()
    _resetMemoryAuditLogs()
  })

  it('adds, updates, and deletes internal notes on an enquiry', async () => {
    const enq = await createEnquiry({
      customer: { name: 'Vikram Joshi', phone: '9988776655' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    // 1. Add Note
    const { note } = await addEnquiryNote(enq.id, {
      content: 'Customer requested extra bed for toddler.',
      author: 'Arun Sharma',
    })
    expect(note).toBeDefined()
    expect(note.id).toMatch(/^NOTE-/)
    expect(note.content).toBe('Customer requested extra bed for toddler.')
    expect(note.author).toBe('Arun Sharma')

    // Verify stored on enquiry
    let updated = await getEnquiryById(enq.id)
    expect(updated?.notes?.length).toBe(1)
    expect(updated?.notes?.[0].id).toBe(note.id)

    // 2. Update Note
    const { note: updatedNote } = await updateEnquiryNote(
      enq.id,
      note.id,
      'Customer requested extra bed for toddler (free of charge agreed).'
    )
    expect(updatedNote).toBeDefined()
    expect(updatedNote.content).toBe('Customer requested extra bed for toddler (free of charge agreed).')
    expect(updatedNote.updatedAt).toBeDefined()

    updated = await getEnquiryById(enq.id)
    expect(updated?.notes?.[0].content).toContain('free of charge agreed')

    // 3. Delete Note
    const afterDelete = await deleteEnquiryNote(enq.id, note.id)
    expect(afterDelete.notes?.length).toBe(0)

    updated = await getEnquiryById(enq.id)
    expect(updated?.notes?.length).toBe(0)
  })
})

describe('CRM Enquiry Timeline & Status Workflow', () => {
  beforeEach(() => {
    _resetMemoryEnquiries()
    _resetMemoryAuditLogs()
  })

  it('records chronological timeline events for status changes, emails, and syncs', async () => {
    const enq = await createEnquiry({
      customer: { name: 'Deepa Nair', phone: '9845123456' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    // Initial created event was recorded
    let updated = await getEnquiryById(enq.id)
    expect(updated?.timeline?.length).toBeGreaterThanOrEqual(1)
    expect(updated?.timeline?.[0].type).toBe('created')

    // Add status change event
    await addEnquiryTimelineEvent(enq.id, {
      type: 'status_change',
      title: 'Status: Contacted',
      description: 'Customer contacted via WhatsApp. Tour brochure shared.',
      author: 'support@hillstourism.com',
    })

    // Add sheets synced event
    await addEnquiryTimelineEvent(enq.id, {
      type: 'sheets_synced',
      title: 'Google Sheets Synced',
      description: 'Row #54 updated.',
      author: 'support@hillstourism.com',
    })

    updated = await getEnquiryById(enq.id)
    expect(updated?.timeline?.length).toBe(3)
    const types = updated?.timeline?.map(t => t.type)
    expect(types).toContain('created')
    expect(types).toContain('status_change')
    expect(types).toContain('sheets_synced')
  })

  it('supports full CRM 9-status lifecycle pipeline', async () => {
    const enq = await createEnquiry({
      customer: { name: 'Manish Gupta', phone: '9711223344' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    const pipelineStatuses: EnquiryStatus[] = [
      'contacted',
      'quotation_sent',
      'confirmed',
      'payment_pending',
      'booked',
      'completed',
      'cancelled',
      'spam',
    ]

    for (const st of pipelineStatuses) {
      const updated = await updateEnquiryStatus(enq.id, st)
      expect(updated?.status).toBe(st)
    }
  })
})

describe('CRM Administrative Audit Trail', () => {
  beforeEach(() => {
    _resetMemoryAuditLogs()
  })

  it('records and queries administrative audit log entries', async () => {
    await createAuditLog({
      action: 'status_update',
      adminEmail: 'superadmin@hillstourism.com',
      enquiryId: 'ENQ-101',
      details: 'Status changed from new to quotation_sent',
      metadata: { from: 'new', to: 'quotation_sent' },
    })

    await createAuditLog({
      action: 'email_sent',
      adminEmail: 'superadmin@hillstourism.com',
      enquiryId: 'ENQ-101',
      details: 'Sent email: Quotation for Munnar Tour',
      metadata: { template: 'quotation', subject: 'Your Munnar Quote' },
    })

    const logs = await getAuditLogs({ limit: 10 })
    expect(logs.length).toBe(2)
    expect(logs[0].action).toBe('email_sent') // newest first
    expect(logs[1].action).toBe('status_update')
    expect(logs[0].adminEmail).toBe('superadmin@hillstourism.com')
  })
})
