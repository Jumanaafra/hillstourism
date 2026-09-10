import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getSiteUrl, getCanonicalUrl } from '../../src/lib/seo/siteUrl'
import sitemap from '../../src/app/sitemap'
import robots from '../../src/app/robots'

describe('Production Site URL & Canonical Helper', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns default production domain when env is not set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.SITE_URL

    expect(getSiteUrl()).toBe('https://hillstourism.com')
  })

  it('reads configured production domain and removes trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-hills-domain.com///'
    expect(getSiteUrl()).toBe('https://custom-hills-domain.com')
  })

  it('generates canonical URLs correctly', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hillstourism.com'

    expect(getCanonicalUrl('/')).toBe('https://hillstourism.com')
    expect(getCanonicalUrl('')).toBe('https://hillstourism.com')
    expect(getCanonicalUrl('/packages')).toBe('https://hillstourism.com/packages')
    expect(getCanonicalUrl('/packages/munnar-escape/')).toBe('https://hillstourism.com/packages/munnar-escape')
  })
})

describe('Production XML Sitemap Generator', () => {
  it('generates sitemap containing all public static routes and dynamic records', async () => {
    const entries = await sitemap()

    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(10)

    const urls = entries.map(e => e.url)

    // Required public static routes
    expect(urls).toContain('https://hillstourism.com')
    expect(urls).toContain('https://hillstourism.com/packages')
    expect(urls).toContain('https://hillstourism.com/stays')
    expect(urls).toContain('https://hillstourism.com/vehicles')
    expect(urls).toContain('https://hillstourism.com/experiences')
    expect(urls).toContain('https://hillstourism.com/gallery')
    expect(urls).toContain('https://hillstourism.com/about')
    expect(urls).toContain('https://hillstourism.com/privacy-policy')
    expect(urls).toContain('https://hillstourism.com/terms-and-conditions')

    // Must NOT contain admin or API routes
    for (const url of urls) {
      expect(url).not.toContain('/admin')
      expect(url).not.toContain('/api')
    }

    // Dynamic package and hotel detail routes
    expect(urls.some(u => u.includes('/packages/munnar-escape'))).toBe(true)
    expect(urls.some(u => u.includes('/hotels/'))).toBe(true)
  })
})

describe('Production Robots Configuration', () => {
  it('allows public crawling and disallows admin and api paths', () => {
    const config = robots()

    expect(config.sitemap).toBe('https://hillstourism.com/sitemap.xml')

    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    expect(rules.length).toBeGreaterThan(0)

    const mainRule = rules[0]
    expect(mainRule.allow).toBe('/')
    expect(mainRule.disallow).toContain('/admin/')
    expect(mainRule.disallow).toContain('/api/')
    expect(mainRule.disallow).toContain('/private/')
  })
})
