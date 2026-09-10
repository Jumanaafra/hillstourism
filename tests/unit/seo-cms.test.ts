import { describe, it, expect } from 'vitest'
import {
  getAllSeoConfigs,
  getSeoByRoute,
  upsertSeoConfig,
  resetSeoToDefault,
  validatePageSEOPayload,
  sanitizeSEOText,
} from '../../src/lib/repositories/seo.repo'
import { resolvePageMetadata } from '../../src/lib/seo/metadataHelper'
import type { Metadata } from 'next'

describe('SEO CMS Repository & Metadata Helper', () => {
  describe('Input Sanitization and Validation', () => {
    it('strips script tags and malicious HTML from SEO text', () => {
      const dirty = '<script>evil()</script>Mountain Tours & Travels <img src="x" onerror="alert(1)"/>'
      const clean = sanitizeSEOText(dirty)
      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('<img')
      expect(clean).toContain('Mountain Tours & Travels')
    })

    it('validates required route field', () => {
      const result = validatePageSEOPayload({
        route: '',
        title: 'Valid Title',
        description: 'Valid Description',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/Route is required/i)
    })

    it('enforces maximum character lengths for title and description', () => {
      const longTitle = 'a'.repeat(100)
      const resTitle = validatePageSEOPayload({
        route: '/about',
        title: longTitle,
        description: 'Short description',
      })
      expect(resTitle.valid).toBe(false)
      expect(resTitle.error).toMatch(/Title exceeds 90 characters/i)

      const longDesc = 'a'.repeat(350)
      const resDesc = validatePageSEOPayload({
        route: '/about',
        title: 'Good Title',
        description: longDesc,
      })
      expect(resDesc.valid).toBe(false)
      expect(resDesc.error).toMatch(/Description exceeds 320 characters/i)
    })

    it('validates canonical URL and OG image format if provided', () => {
      const invalidUrl = validatePageSEOPayload({
        route: '/packages',
        title: 'Packages Title',
        description: 'Packages Description',
        canonicalUrl: 'javascript:alert(1)',
      })
      expect(invalidUrl.valid).toBe(false)

      const validUrl = validatePageSEOPayload({
        route: '/packages',
        title: 'Packages Title',
        description: 'Packages Description',
        canonicalUrl: 'https://hillstourism.com/packages',
      })
      expect(validUrl.valid).toBe(true)
    })
  })

  describe('SEO Configurations CRUD', () => {
    it('provides production seed defaults for all required pages', async () => {
      const allSeo = await getAllSeoConfigs()
      const routes = allSeo.map((s) => s.route)

      expect(routes).toContain('/')
      expect(routes).toContain('/about')
      expect(routes).toContain('/packages')
      expect(routes).toContain('/stays')
      expect(routes).toContain('/vehicles')
      expect(routes).toContain('/experiences')
      expect(routes).toContain('/gallery')
      expect(routes).toContain('/privacy-policy')
      expect(routes).toContain('/terms-and-conditions')
    })

    it('upserts and retrieves custom SEO for a page', async () => {
      const saved = await upsertSeoConfig({
        route: '/about',
        title: 'Custom About Us | Hills Tourism',
        description: 'Curated mountain escapes and eco-luxury journeys across South India.',
        canonicalUrl: 'https://hillstourism.com/about',
        ogTitle: 'Discover Hills Tourism',
        ogDescription: 'Experience pristine hill escapes.',
        robots: 'index, follow',
      })

      expect(saved.title).toBe('Custom About Us | Hills Tourism')

      const retrieved = await getSeoByRoute('/about')
      expect(retrieved?.title).toBe('Custom About Us | Hills Tourism')
      expect(retrieved?.ogTitle).toBe('Discover Hills Tourism')
    })

    it('resets custom SEO back to default when requested', async () => {
      // Modify first
      await upsertSeoConfig({
        route: '/packages',
        title: 'Special Summer Deals on Packages',
        description: 'Book your summer tour packages with Hills Tourism now.',
      })

      // Reset
      const reset = await resetSeoToDefault('/packages')
      expect(reset).toBe(true)

      const afterReset = await getSeoByRoute('/packages')
      expect(afterReset?.title).toBe('Curated Mountain Tour Packages — Hills Tourism')
    })
  })

  describe('Metadata Helper (resolvePageMetadata)', () => {
    const defaultMeta: Metadata = {
      title: 'Default App Title',
      description: 'Default App Description',
      alternates: {
        canonical: 'https://hillstourism.com/test-page',
      },
      openGraph: {
        title: 'Default OG Title',
        description: 'Default OG Description',
        url: 'https://hillstourism.com/test-page',
      },
      robots: {
        index: true,
        follow: true,
      },
    }

    it('returns custom metadata when custom SEO exists', async () => {
      await upsertSeoConfig({
        route: '/test-route',
        title: 'Overridden Page Title',
        description: 'Overridden Page Description',
        canonicalUrl: 'https://hillstourism.com/test-route',
        ogTitle: 'Overridden OG Title',
        robots: 'noindex, nofollow',
      })

      const resolved = await resolvePageMetadata('/test-route', defaultMeta)
      expect(resolved.title).toBe('Overridden Page Title')
      expect(resolved.description).toBe('Overridden Page Description')
      expect(resolved.openGraph?.title).toBe('Overridden OG Title')
      expect(resolved.alternates?.canonical).toBe('https://hillstourism.com/test-route')
      expect(resolved.robots).toEqual({
        index: false,
        follow: false,
      })
    })

    it('falls back to default metadata cleanly when no custom SEO is configured', async () => {
      const resolved = await resolvePageMetadata('/non-existent-seo-route', defaultMeta)
      expect(resolved.title).toBe('Default App Title')
      expect(resolved.description).toBe('Default App Description')
      expect(resolved.openGraph?.title).toBe('Default OG Title')
      expect(resolved.alternates?.canonical).toBe('https://hillstourism.com/test-page')
    })
  })
})
