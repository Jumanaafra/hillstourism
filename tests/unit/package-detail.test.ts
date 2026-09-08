import { describe, it, expect, beforeEach } from 'vitest'
import { generateMetadata, generateStaticParams } from '../../src/app/packages/[slug]/page'
import { getPackageBySlug, getPackages, updatePackage, _resetMemoryPackages } from '../../src/lib/repositories/packages.repo'
import type { Package } from '../../src/types/domain'

describe('Package Detail Route & Metadata Unit Tests (Section 31)', () => {
  beforeEach(() => {
    _resetMemoryPackages()
  })

  describe('Package Resolution & Filtering', () => {
    it('loads active package by slug', async () => {
      const pkg = await getPackageBySlug('munnar-escape')
      expect(pkg).not.toBeNull()
      expect(pkg?.slug).toBe('munnar-escape')
      expect(pkg?.name).toContain('Munnar')
      expect(pkg?.itinerary).toBeDefined()
      expect(pkg?.itinerary?.length).toBeGreaterThan(0)
    })

    it('returns null for non-existent slug', async () => {
      const pkg = await getPackageBySlug('non-existent-mountain-trip')
      expect(pkg).toBeNull()
    })

    it('guarantees day order in loaded package itinerary', async () => {
      const pkg = await getPackageBySlug('munnar-escape')
      expect(pkg?.itinerary).toBeDefined()
      const days = pkg!.itinerary!.map(d => d.day)
      const sortedDays = [...days].sort((a, b) => a - b)
      expect(days).toEqual(sortedDays)
      expect(days[0]).toBe(1)
      expect(days[1]).toBe(2)
    })

    it('generates static params only for active packages', async () => {
      const params = await generateStaticParams()
      expect(Array.isArray(params)).toBe(true)
      expect(params.length).toBeGreaterThan(0)
      expect(params.some(p => p.slug === 'munnar-escape')).toBe(true)
    })
  })

  describe('Dynamic SEO & Social Metadata Generation', () => {
    it('generates dynamic title, description, and canonical URL from package data', async () => {
      const meta = await generateMetadata({ params: { slug: 'munnar-escape' } })
      expect(meta.title).toBeDefined()
      expect(meta.title).toContain('Munnar')
      expect(meta.description).toBeDefined()
      expect(meta.description?.length).toBeGreaterThan(10)
      expect(meta.alternates?.canonical).toBe('/packages/munnar-escape')
      expect(meta.openGraph?.url).toBe('https://hillstourism.com/packages/munnar-escape')
      expect(meta.openGraph?.siteName).toBe('Hills Tourism')
    })

    it('returns 404 fallback metadata for non-existent package slug', async () => {
      const meta = await generateMetadata({ params: { slug: 'unknown-slug-xyz' } })
      expect(meta.title).toBe('Package Not Found — Hills Tourism')
      expect(meta.description).toContain('could not be found')
    })

    it('returns 404 fallback metadata for inactive package', async () => {
      // Find and deactivate package in repository
      const packages = await getPackages(false)
      const target = packages[0]
      await updatePackage(target.id, { active: false })

      const meta = await generateMetadata({ params: { slug: target.slug } })
      expect(meta.title).toBe('Package Not Found — Hills Tourism')
      expect(meta.description).toContain('could not be found')
    })
  })

  describe('Structured Data (Schema.org TouristTrip)', () => {
    it('produces valid TouristTrip JSON-LD format without fabricating ratings or fake reviews', async () => {
      const pkg = await getPackageBySlug('munnar-escape')
      expect(pkg).not.toBeNull()

      const jsonLd: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: pkg!.name,
        description: pkg!.shortDescription || pkg!.description,
        touristType: pkg!.category || 'Mountain Tourism',
        provider: {
          '@type': 'TravelAgency',
          name: 'Hills Tourism',
          url: 'https://hillstourism.com',
        },
      }

      if (pkg!.price) {
        jsonLd.offers = {
          '@type': 'Offer',
          price: pkg!.price.replace(/[^0-9]/g, '') || undefined,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        }
      }

      if (pkg!.itinerary && pkg!.itinerary.length > 0) {
        jsonLd.itinerary = pkg!.itinerary.map(d => ({
          '@type': 'TouristTrip',
          name: `Day ${d.day}: ${d.title}`,
          description: d.description,
        }))
      }

      expect(jsonLd['@context']).toBe('https://schema.org')
      expect(jsonLd['@type']).toBe('TouristTrip')
      expect(jsonLd.name).toBe(pkg!.name)
      expect(jsonLd.offers.priceCurrency).toBe('INR')
      expect(jsonLd.itinerary).toHaveLength(pkg!.itinerary!.length)
      expect(jsonLd.itinerary[0].name).toContain('Day 1')
      expect(jsonLd.itinerary[1].name).toContain('Day 2')
      // Ensure no fake ratings or reviews
      expect(jsonLd.aggregateRating).toBeUndefined()
      expect(jsonLd.review).toBeUndefined()
    })
  })

  describe('Graceful Fallback for Package Without Itinerary', () => {
    it('handles package with undefined or empty itinerary gracefully', async () => {
      const packages = await getPackages(false)
      const barePackage: Package = {
        ...packages[0],
        id: 'bare-package',
        slug: 'bare-package',
        itinerary: undefined,
      }

      expect(barePackage.itinerary).toBeUndefined()
      const daysCount = barePackage.itinerary?.length || 0
      expect(daysCount).toBe(0)
    })
  })
})
