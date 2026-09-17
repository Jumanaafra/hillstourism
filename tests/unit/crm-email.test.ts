import { describe, it, expect, beforeEach } from 'vitest'
import {
  interpolateTemplateVariables,
  getEnquiryVariables,
  buildHtmlEmailBody,
  sendCrmEmail,
  CRM_EMAIL_TEMPLATES,
} from '../../src/lib/services/crm-email.service'
import {
  createEnquiry,
  _resetMemoryEnquiries,
  getEnquiryById,
} from '../../src/lib/repositories/enquiries.repo'
import { getAuditLogs, _resetMemoryAuditLogs } from '../../src/lib/repositories/audit.repo'
import type { Enquiry } from '../../src/types/domain'

describe('CRM Email Service - Variable Interpolation & Templates', () => {
  const mockEnquiry: Enquiry = {
    id: 'ENQ-2026-TEST',
    createdAt: '2026-09-17T12:00:00.000Z',
    updatedAt: '2026-09-17T12:00:00.000Z',
    customer: {
      name: 'Rohan Deshmukh',
      phone: '+91 9876543210',
      email: 'rohan@example.com',
    },
    package: {
      id: 'munnar-tea-trails',
      nameSnapshot: 'Munnar Misty Tea Trails',
    },
    hotel: {
      id: 'cloud-valley-resort',
      nameSnapshot: 'Cloud Valley Heritage Resort',
    },
    vehicle: {
      id: 'innova-crysta',
      nameSnapshot: 'Toyota Innova Crysta',
      numberPlateSnapshot: 'KL-07-CD-1234',
    },
    travel: {
      date: '2026-11-15',
      groupSize: 4,
      tripType: 'Family Vacation',
    },
    message: 'Please arrange pure vegetarian meals.',
    status: 'new',
    integrations: {
      emailStatus: 'pending',
      sheetsStatus: 'pending',
    },
  }

  it('correctly maps enquiry fields to template variables', () => {
    const vars = getEnquiryVariables(mockEnquiry)
    expect(vars['customer_name']).toBe('Rohan Deshmukh')
    expect(vars['package']).toBe('Munnar Misty Tea Trails')
    expect(vars['hotel']).toBe('Cloud Valley Heritage Resort')
    expect(vars['vehicle']).toBe('Toyota Innova Crysta (KL-07-CD-1234)')
    expect(vars['travel_date']).toBe('2026-11-15')
    expect(vars['guests']).toBe('4')
    expect(vars['enquiry_id']).toBe('ENQ-2026-TEST')
  })

  it('interpolates variables into Booking Confirmation template', () => {
    const template = CRM_EMAIL_TEMPLATES.booking_confirmation
    expect(template).toBeDefined()
    const vars = getEnquiryVariables(mockEnquiry)
    const result = interpolateTemplateVariables(template.defaultMessage, vars)

    expect(result).toContain('Dear Rohan Deshmukh,')
    expect(result).toContain('ENQ-2026-TEST')
    expect(result).toContain('Munnar Misty Tea Trails')
    expect(result).toContain('2026-11-15')
    expect(result).not.toContain('{{customer_name}}')
  })

  it('handles missing or partial fields gracefully with fallbacks', () => {
    const sparseEnquiry: Enquiry = {
      id: 'ENQ-SPARSE',
      createdAt: '2026-09-17T12:00:00.000Z',
      updatedAt: '2026-09-17T12:00:00.000Z',
      customer: {
        name: '',
        phone: '+91 9999999999',
      },
      travel: {
        date: '',
        groupSize: 1,
      },
      status: 'new',
      integrations: {
        emailStatus: 'pending',
        sheetsStatus: 'pending',
      },
    }

    const vars = getEnquiryVariables(sparseEnquiry)
    expect(vars['customer_name']).toBe('Valued Traveler')
    expect(vars['package']).toBe('Curated Mountain Journey')
    expect(vars['hotel']).toBe('Boutique Hill Resort')
    expect(vars['vehicle']).toBe('Dedicated Tour Vehicle')
    expect(vars['travel_date']).toBe('Flexible')
    expect(vars['guests']).toBe('1')

    const template = CRM_EMAIL_TEMPLATES.quotation
    const result = interpolateTemplateVariables(template.defaultMessage, vars)
    expect(result).toContain('Dear Valued Traveler,')
    expect(result).not.toContain('undefined')
  })

  it('builds clean HTML email output with branded header and footer', () => {
    const text = 'Hello Rohan Deshmukh,\n\nYour trip is confirmed!'
    const html = buildHtmlEmailBody(text, 'Booking Confirmation')
    expect(html).toContain('Hills Tourism')
    expect(html).toContain('Hello Rohan Deshmukh,<br/><br/>Your trip is confirmed!')
    expect(html).toContain('Booking Confirmation')
  })
})

describe('CRM Email Service - Dispatch, History & Audit Logs', () => {
  beforeEach(() => {
    _resetMemoryEnquiries()
    _resetMemoryAuditLogs()
  })

  it('validates email format and rejects invalid recipient emails', async () => {
    const enq = await createEnquiry({
      customer: {
        name: 'Test Customer',
        phone: '+91 9876543210',
        email: 'invalid-email-address',
      },
      travel: {
        date: '2026-11-20',
        groupSize: 2,
      },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    const result = await sendCrmEmail({
      enquiry: enq,
      templateKey: 'custom',
      customTo: 'invalid-email-address',
      subject: 'Test Subject',
      message: 'Hello world',
      adminEmail: 'admin@hillstourism.com',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid recipient email address')
  })

  it('simulates dispatch successfully, updating enquiry email history and timeline', async () => {
    const enq = await createEnquiry({
      customer: {
        name: 'Kavita Menon',
        phone: '+91 9876543210',
        email: 'kavita@example.com',
      },
      package: {
        id: 'wayanad-serenity',
        nameSnapshot: 'Wayanad Serenity Tour',
      },
      travel: {
        date: '2026-11-20',
        groupSize: 2,
      },
      status: 'new',
      integrations: { emailStatus: 'pending', sheetsStatus: 'pending' },
    })

    const result = await sendCrmEmail({
      enquiry: enq,
      templateKey: 'quotation',
      customTo: 'kavita@example.com',
      subject: 'Quotation for Wayanad Serenity Tour',
      message: 'Dear Kavita Menon, here is your quotation.',
      adminEmail: 'ops@hillstourism.com',
    })

    expect(result.success).toBe(true)
    expect(result.emailRecord?.status).toBe('sent')

    // Verify enquiry updated
    const updated = await getEnquiryById(enq.id)
    expect(updated).toBeDefined()
    expect(updated?.integrations.emailStatus).toBe('sent')
    expect(updated?.lastEmailSentAt).toBeDefined()
    expect(updated?.lastEmailSubject).toBe('Quotation for Wayanad Serenity Tour')
    expect(updated?.emailHistory?.length).toBe(1)
    expect(updated?.emailHistory?.[0].to).toBe('kavita@example.com')
    expect(updated?.emailHistory?.[0].status).toBe('sent')

    // Verify timeline event added
    const emailTimeline = updated?.timeline?.filter(t => t.type === 'email_sent')
    expect(emailTimeline?.length).toBe(1)
    expect(emailTimeline?.[0].title).toBe('Email Sent: Quotation for Wayanad Serenity Tour')

    // Verify audit log created
    const logs = await getAuditLogs()
    const emailAudit = logs.find(l => l.action === 'email_sent')
    expect(emailAudit).toBeDefined()
    expect(emailAudit?.adminEmail).toBe('ops@hillstourism.com')
    expect(emailAudit?.enquiryId).toBe(enq.id)
  })
})
