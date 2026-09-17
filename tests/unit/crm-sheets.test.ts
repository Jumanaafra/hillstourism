import { describe, it, expect, beforeEach } from 'vitest'
import {
  syncSingleEnquiryManual,
  batchSyncEnquiries,
} from '../../src/lib/services/sheets.service'
import {
  createEnquiry,
  _resetMemoryEnquiries,
  getEnquiryById,
} from '../../src/lib/repositories/enquiries.repo'
import { getAuditLogs, _resetMemoryAuditLogs } from '../../src/lib/repositories/audit.repo'

describe('CRM Google Sheets Synchronization', () => {
  beforeEach(() => {
    _resetMemoryEnquiries()
    _resetMemoryAuditLogs()
  })

  it('manually syncs a single enquiry, updates status, sets row number and adds timeline event', async () => {
    const enq = await createEnquiry({
      customer: {
        name: 'Anita Verma',
        phone: '+91 9123456789',
        email: 'anita@example.com',
      },
      package: {
        id: 'ooty-heritage',
        nameSnapshot: 'Ooty Heritage Explorer',
      },
      travel: {
        date: '2026-11-20',
        groupSize: 2,
      },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    const syncRes = await syncSingleEnquiryManual(enq.id, 'admin@hillstourism.com')
    expect(syncRes.success).toBe(true)
    expect(syncRes.rowNumber).toBeGreaterThanOrEqual(2)

    // Check updated enquiry in storage
    const updated = await getEnquiryById(enq.id)
    expect(updated).toBeDefined()
    expect(updated?.integrations.sheetsStatus).toBe('synced')
    expect(updated?.integrations.lastSheetSyncAt).toBeDefined()
    expect(updated?.integrations.sheetRow).toBe(syncRes.rowNumber)

    // Check timeline event
    const sheetsTimeline = updated?.timeline?.filter(t => t.type === 'sheets_synced')
    expect(sheetsTimeline?.length).toBe(1)
    expect(sheetsTimeline?.[0].title).toBe('Google Sheet Synced')
    expect(sheetsTimeline?.[0].description).toContain(`Row #${syncRes.rowNumber}`)

    // Check audit log
    const logs = await getAuditLogs()
    const sheetAudit = logs.find(l => l.action === 'sheet_sync')
    expect(sheetAudit).toBeDefined()
    expect(sheetAudit?.adminEmail).toBe('admin@hillstourism.com')
    expect(sheetAudit?.enquiryId).toBe(enq.id)
  })

  it('batch syncs all pending enquiries', async () => {
    // Create 3 enquiries: 2 pending, 1 already synced
    const enq1 = await createEnquiry({
      customer: { name: 'Customer 1', phone: '1111111111' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })
    const enq2 = await createEnquiry({
      customer: { name: 'Customer 2', phone: '2222222222' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })
    const enq3 = await createEnquiry({
      customer: { name: 'Customer 3', phone: '3333333333' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'synced', sheetRow: 10 },
    })

    const batchRes = await batchSyncEnquiries('pending', 'supervisor@hillstourism.com')
    expect(batchRes.total).toBe(2)
    expect(batchRes.synced).toBe(2)
    expect(batchRes.failed).toBe(0)

    // Verify both were synced
    const updated1 = await getEnquiryById(enq1.id)
    const updated2 = await getEnquiryById(enq2.id)
    expect(updated1?.integrations.sheetsStatus).toBe('synced')
    expect(updated2?.integrations.sheetsStatus).toBe('synced')

    // Verify batch audit log
    const logs = await getAuditLogs()
    const batchAudit = logs.find(l => l.action === 'batch_sync')
    expect(batchAudit).toBeDefined()
    expect(batchAudit?.adminEmail).toBe('supervisor@hillstourism.com')
  })

  it('batch syncs only failed enquiries in failed mode', async () => {
    await createEnquiry({
      customer: { name: 'Customer A', phone: '4444444444' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })
    const failedEnq = await createEnquiry({
      customer: { name: 'Customer B', phone: '5555555555' },
      travel: { date: '2026-11-20', groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'failed', sheetsError: 'Timeout' },
    })

    const batchRes = await batchSyncEnquiries('failed', 'support@hillstourism.com')
    expect(batchRes.total).toBe(1)
    expect(batchRes.synced).toBe(1)

    const updated = await getEnquiryById(failedEnq.id)
    expect(updated?.integrations.sheetsStatus).toBe('synced')
  })
})
