import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateItineraryPDF, type ItineraryPdfData } from '../../src/lib/pdf/generateItineraryPdf'

const itinerary: ItineraryPdfData = {
  packageName: 'Edited Munnar Escape',
  destination: 'Munnar, Kerala',
  duration: '2 Days / 1 Night',
  travelersText: 'Test Traveler (2 Adults, 0 Children)',
  travelDatesText: '10 Oct 2026 - 11 Oct 2026',
  pricePerPerson: '₹4,567',
  adultsCount: 2,
  childrenCount: 0,
  estimatedTotalCost: '₹9,134',
  customerPhone: '9999912345',
  pickupPoint: 'Cochin Airport',
  specialRequests: 'Vegetarian meals',
  payment: { status: 'partial', advanceAmount: '₹1,000', balanceDue: '₹8,134' },
  theme: { preset: 'dark', accentColor: '#4BAEFF' },
  days: [{ day: 1, title: 'Edited day title', description: 'Edited day description', schedule: [{ time: '09:00 AM', activity: 'Tea Museum' }] }],
  inclusions: ['Breakfast'],
  exclusions: ['Tickets'],
}

afterEach(() => vi.restoreAllMocks())

describe('itinerary PDF export', () => {
  it('exports edited details and a theme cover rather than the original package data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('No browser images in unit test')))
    const pdf = await generateItineraryPDF(itinerary, { download: false })

    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(2)
    const output = pdf.output()
    expect(output).toContain('Edited Munnar Escape')
    expect(output).toContain('Edited day title')
    expect(output).toContain('INR 4,567')
    expect(output).toContain('Cochin Airport')
    expect(output).toContain('Vegetarian meals')
    expect(output).toContain('PAYMENT DETAILS')
    vi.unstubAllGlobals()
  })
})
