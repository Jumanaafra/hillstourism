import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createEnquiry,
  getEnquiryById,
  updateEnquiryIntegrations,
  _resetMemoryEnquiries,
} from '../../src/lib/repositories/enquiries.repo'
import * as emailService from '../../src/lib/services/email.service'
import * as sheetsService from '../../src/lib/services/sheets.service'

describe('Enquiry Integration Failure Resilience (spec.md Section 11, 21, 23, 57)', () => {
  beforeEach(() => {
    _resetMemoryEnquiries()
    vi.restoreAllMocks()
  })

  it('preserves enquiry in database and marks emailStatus=failed when email provider fails', async () => {
    // Simulate email provider failure
    vi.spyOn(emailService, 'sendEnquiryEmails').mockResolvedValue({
      internal: { success: false, error: 'Provider network timeout 503' },
      customer: { success: false, error: 'Provider network timeout 503' },
    })

    // 1. Create enquiry
    const enquiry = await createEnquiry({
      customer: {
        name: 'Vipin Das',
        phone: '9876543299',
        email: 'vipin@example.com',
      },
      travel: { date: '2026-12-01', groupSize: 3 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    expect(enquiry.id).toBeDefined()

    // 2. Trigger email
    const emailResult = await emailService.sendEnquiryEmails(enquiry)
    expect(emailResult.internal.success).toBe(false)

    // 3. Update integration status safely
    const updated = await updateEnquiryIntegrations(enquiry.id, {
      emailStatus: 'failed',
      emailError: emailResult.internal.error,
    })

    // 4. Verify enquiry still exists and is preserved with failed status
    const retrieved = await getEnquiryById(enquiry.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.customer.name).toBe('Vipin Das')
    expect(retrieved?.integrations.emailStatus).toBe('failed')
    expect(retrieved?.integrations.emailError).toContain('503')
  })

  it('preserves enquiry in database and marks sheetsStatus=failed when Google Sheets API fails', async () => {
    // Simulate Google Sheets API failure
    vi.spyOn(sheetsService, 'syncEnquiryToGoogleSheets').mockResolvedValue({
      success: false,
      error: 'Google Sheets 403: The caller does not have permission',
    })

    const enquiry = await createEnquiry({
      customer: {
        name: 'Meera Nair',
        phone: '9876543288',
      },
      travel: { groupSize: 2 },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    const sheetResult = await sheetsService.syncEnquiryToGoogleSheets(enquiry)
    expect(sheetResult.success).toBe(false)

    await updateEnquiryIntegrations(enquiry.id, {
      sheetsStatus: 'failed',
      sheetsError: sheetResult.error,
    })

    const retrieved = await getEnquiryById(enquiry.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.integrations.sheetsStatus).toBe('failed')
    expect(retrieved?.integrations.sheetsError).toContain('permission')
  })
})
