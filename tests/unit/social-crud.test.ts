import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAllSocialLinks,
  getActiveSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  validateSocialLinkPayload,
  SUPPORTED_PLATFORMS,
} from '../../src/lib/repositories/social.repo'

describe('Social Links Repository & Validation', () => {
  describe('Payload Validation', () => {
    it('accepts valid WhatsApp, Facebook, Instagram links', () => {
      const wa = validateSocialLinkPayload({
        platform: 'whatsapp',
        url: 'https://wa.me/919442000000',
        active: true,
        order: 1,
      })
      expect(wa.valid).toBe(true)

      const fb = validateSocialLinkPayload({
        platform: 'facebook',
        url: 'https://facebook.com/hillstourism',
        active: true,
      })
      expect(fb.valid).toBe(true)

      const ig = validateSocialLinkPayload({
        platform: 'instagram',
        url: 'https://instagram.com/hillstourism',
        active: true,
      })
      expect(ig.valid).toBe(true)
    })

    it('rejects unsupported platforms', () => {
      const result = validateSocialLinkPayload({
        platform: 'tiktok' as any,
        url: 'https://tiktok.com/@hillstourism',
      })
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/Unsupported platform/i)
    })

    it('rejects invalid or non-HTTP/HTTPS URLs', () => {
      const result1 = validateSocialLinkPayload({
        platform: 'whatsapp',
        url: 'javascript:alert(1)',
      })
      expect(result1.valid).toBe(false)

      const result2 = validateSocialLinkPayload({
        platform: 'facebook',
        url: 'not-a-valid-url',
      })
      expect(result2.valid).toBe(false)
    })

    it('sanitizes label and platform input', () => {
      const result = validateSocialLinkPayload({
        platform: 'instagram',
        url: 'https://instagram.com/hillstourism',
        label: '<script>alert("hack")</script>Instagram Page',
      })
      expect(result.valid).toBe(true)
      expect(result.sanitized?.label).not.toContain('<script>')
    })
  })

  describe('CRUD Operations', () => {
    it('creates, retrieves, updates, and deletes a social link', async () => {
      // 1. Create
      const created = await createSocialLink({
        platform: 'youtube',
        url: 'https://youtube.com/@hillstourism',
        active: true,
        order: 10,
        label: 'Official YouTube Channel',
      })

      expect(created.id).toBeDefined()
      expect(created.platform).toBe('youtube')
      expect(created.url).toBe('https://youtube.com/@hillstourism')

      // 2. Read by ID
      const fetched = await getSocialLinkById(created.id)
      expect(fetched).toBeDefined()
      expect(fetched?.platform).toBe('youtube')

      // 3. Update
      const updated = await updateSocialLink(created.id, {
        url: 'https://youtube.com/@hillstourism_official',
        active: false,
      })
      expect(updated?.url).toBe('https://youtube.com/@hillstourism_official')
      expect(updated?.active).toBe(false)

      // 4. Verify Active filtering excludes inactive link
      const activeList = await getActiveSocialLinks()
      const inActiveList = activeList.find((l) => l.id === created.id)
      expect(inActiveList).toBeUndefined()

      // 5. Delete
      const deleted = await deleteSocialLink(created.id)
      expect(deleted).toBe(true)

      const afterDelete = await getSocialLinkById(created.id)
      expect(afterDelete).toBeNull()
    })

    it('returns seed social links containing whatsapp, facebook, and instagram', async () => {
      const links = await getAllSocialLinks()
      const platforms = links.map((l) => l.platform)

      expect(platforms).toContain('whatsapp')
      expect(platforms).toContain('facebook')
      expect(platforms).toContain('instagram')
    })
  })
})
