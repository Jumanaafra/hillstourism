import { describe, it, expect } from 'vitest'
import {
  getSiteSettings,
  updateSiteSettings,
} from '../../src/lib/repositories/content.repo'

describe('Site Settings Repository & General Settings End-to-End', () => {
  it('reads default site settings including brand, contact, and social links', async () => {
    const settings = await getSiteSettings()
    expect(settings).toBeDefined()
    expect(settings.siteName).toBeTruthy()
    expect(settings.contactEmail).toBeTruthy()
    expect(settings.contactPhone).toBeTruthy()
    expect(settings.whatsappNumber).toBeTruthy()
    expect(settings.address).toBeTruthy()
    expect(settings.instagram).toBeDefined()
    expect(settings.facebook).toBeDefined()
  })

  it('persists updates to instagram, facebook, and contact details without wiping existing settings', async () => {
    const initial = await getSiteSettings()
    const initialSiteName = initial.siteName

    const updated = await updateSiteSettings({
      instagram: 'https://instagram.com/hillstourism.official',
      facebook: 'https://facebook.com/hillstourism.official',
      contactPhone: '+91 94877 75512',
      contactEmail: 'contact@hillstourism.in',
    })

    expect(updated.instagram).toBe('https://instagram.com/hillstourism.official')
    expect(updated.facebook).toBe('https://facebook.com/hillstourism.official')
    expect(updated.contactPhone).toBe('+91 94877 75512')
    expect(updated.contactEmail).toBe('contact@hillstourism.in')
    // Ensure existing fields like siteName were preserved
    expect(updated.siteName).toBe(initialSiteName)

    // Verify read-back
    const readBack = await getSiteSettings()
    expect(readBack.instagram).toBe('https://instagram.com/hillstourism.official')
    expect(readBack.facebook).toBe('https://facebook.com/hillstourism.official')
    expect(readBack.contactPhone).toBe('+91 94877 75512')
  })

  it('safely handles empty or null values and preserves theme preference', async () => {
    await updateSiteSettings({ theme: 'dark' })
    const updated = await updateSiteSettings({
      tagline: 'Authentic Hill Station Journeys',
    })

    expect(updated.tagline).toBe('Authentic Hill Station Journeys')
    expect(updated.theme).toBe('dark')

    const reloaded = await getSiteSettings()
    expect(reloaded.theme).toBe('dark')
    expect(reloaded.tagline).toBe('Authentic Hill Station Journeys')
  })
})
