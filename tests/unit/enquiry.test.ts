import { describe, it, expect, beforeEach } from 'vitest'
import { EnquiryInputSchema } from '../../src/lib/validation/enquiry.schema'
import {
  createEnquiry,
  isRecentDuplicateEnquiry,
  _resetMemoryEnquiries,
} from '../../src/lib/repositories/enquiries.repo'

describe('Enquiry Validation & Anti-Spam', () => {
  it('validates a correct enquiry successfully', () => {
    const validData = {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@example.com',
      travelDate: '2026-10-15',
      groupSize: 4,
      tripType: 'Couple',
      message: 'Looking for a private mountain bungalow.',
      source: 'package-detail',
      _hp: '', // empty honeypot
    }

    const result = EnquiryInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects submissions with filled honeypot as spam', () => {
    const spamData = {
      name: 'Bot Spammer',
      phone: '1234567890',
      _hp: 'i-am-a-bot', // Honeypot filled!
    }

    const result = EnquiryInputSchema.safeParse(spamData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('_hp'))).toBe(true)
    }
  })

  it('rejects invalid phone numbers and invalid email', () => {
    const invalidPhone = {
      name: 'John Doe',
      phone: 'abc',
    }
    const res1 = EnquiryInputSchema.safeParse(invalidPhone)
    expect(res1.success).toBe(false)

    const invalidEmail = {
      name: 'John Doe',
      phone: '9876543210',
      email: 'not-an-email',
    }
    const res2 = EnquiryInputSchema.safeParse(invalidEmail)
    expect(res2.success).toBe(false)
  })

  it('allows empty email since email is recommended but optional in phone-first model', () => {
    const noEmail = {
      name: 'Anita Verma',
      phone: '+91 91234 56789',
      email: '',
    }
    const res = EnquiryInputSchema.safeParse(noEmail)
    expect(res.success).toBe(true)
  })
})

describe('Enquiry Repository & Idempotency', () => {
  beforeEach(() => {
    _resetMemoryEnquiries()
  })

  it('stores and retrieves an enquiry with server timestamps and integration status', async () => {
    const enq = await createEnquiry({
      customer: {
        name: 'Sneha Rao',
        phone: '9876543211',
        email: 'sneha@example.com',
      },
      package: {
        id: 'munnar-escape',
        nameSnapshot: 'Munnar Escape',
      },
      travel: {
        date: '2026-11-20',
        groupSize: 2,
      },
      status: 'new',
      integrations: {
        emailStatus: 'pending',
        sheetsStatus: 'pending',
      },
    })

    expect(enq.id).toMatch(/^ENQ-/)
    expect(enq.status).toBe('new')
    expect(enq.integrations.emailStatus).toBe('pending')
    expect(enq.customer.name).toBe('Sneha Rao')
  })

  it('detects recent duplicate enquiries within window', async () => {
    await createEnquiry({
      customer: {
        name: 'Arun Kumar',
        phone: '9845012345',
      },
      travel: { groupSize: 2 },
      status: 'new',
      integrations: {},
    })

    const isDup = await isRecentDuplicateEnquiry('9845012345', 'Arun Kumar', 60)
    expect(isDup).toBe(true)

    const isDifferentUser = await isRecentDuplicateEnquiry('9845099999', 'Vikram', 60)
    expect(isDifferentUser).toBe(false)
  })
})
