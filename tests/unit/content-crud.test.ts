import { describe, it, expect } from 'vitest'
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSiteSettings,
  updateSiteSettings,
} from '../../src/lib/repositories/content.repo'

describe('Content Repository CRUD', () => {
  describe('Category Management', () => {
    it('creates, reads, updates, and deletes a category', async () => {
      const created = await createCategory({
        title: 'Test Adventure',
        slug: 'test-adventure',
        subtitle: 'High altitude treks',
        description: 'Thrilling hill trekking tours',
        image: 'https://res.cloudinary.com/demo/image/upload/trek.jpg',
        badge: 'Trending',
        color: '#0ea5e9',
        order: 99,
        active: true,
      })

      expect(created.id).toBeDefined()
      expect(created.slug).toBe('test-adventure')

      // Read by ID
      const fetched = await getCategoryById(created.id)
      expect(fetched).not.toBeNull()
      expect(fetched?.title).toBe('Test Adventure')

      // Update
      const updated = await updateCategory(created.id, { title: 'Updated Trekking' })
      expect(updated.title).toBe('Updated Trekking')

      // Read all categories
      const all = await getCategories(false)
      expect(all.some(c => c.id === created.id)).toBe(true)

      // Delete
      const deleted = await deleteCategory(created.id)
      expect(deleted).toBe(true)

      const afterDelete = await getCategoryById(created.id)
      expect(afterDelete).toBeNull()
    })
  })

  describe('Experience Management', () => {
    it('creates, reads, updates, and deletes an experience', async () => {
      const created = await createExperience({
        title: 'Toy Train Heritage Ride',
        subtitle: 'Historic Steam Journey',
        description: 'Historic train experience through the misty hills.',
        image: 'https://res.cloudinary.com/demo/image/upload/toytrain.jpg',
        duration: '3 hours',
        difficulty: 'Easy',
        location: 'Darjeeling, WB',
        icon: 'train',
        highlights: ['Scenic Himalayan loop', 'Century-old steam engine'],
        active: true,
      })

      expect(created.id).toBeDefined()
      expect(created.title).toBe('Toy Train Heritage Ride')

      // Read by ID
      const fetched = await getExperienceById(created.id)
      expect(fetched).not.toBeNull()
      expect(fetched?.title).toBe('Toy Train Heritage Ride')

      // Update
      const updated = await updateExperience(created.id, { subtitle: 'Updated Steam Journey' })
      expect(updated.subtitle).toBe('Updated Steam Journey')

      // Delete
      const deleted = await deleteExperience(created.id)
      expect(deleted).toBe(true)

      const afterDelete = await getExperienceById(created.id)
      expect(afterDelete).toBeNull()
    })
  })

  describe('Testimonial Management', () => {
    it('creates, reads, updates, and deletes a testimonial', async () => {
      const created = await createTestimonial({
        name: 'Anita Roy',
        trip: 'Munnar 3D/2N Escape',
        location: 'Kolkata, India',
        avatar: 'https://res.cloudinary.com/demo/image/upload/anita.jpg',
        initials: 'AR',
        rating: 5,
        review: 'Unforgettable holiday organized with care.',
        active: true,
      })

      expect(created.id).toBeDefined()
      expect(created.name).toBe('Anita Roy')

      // Read by ID
      const fetched = await getTestimonialById(created.id)
      expect(fetched).not.toBeNull()
      expect(fetched?.rating).toBe(5)

      // Update
      const updated = await updateTestimonial(created.id, { review: 'Updated review content.' })
      expect(updated.review).toBe('Updated review content.')

      // Delete
      const deleted = await deleteTestimonial(created.id)
      expect(deleted).toBe(true)

      const afterDelete = await getTestimonialById(created.id)
      expect(afterDelete).toBeNull()
    })
  })

  describe('Site Settings Management', () => {
    it('reads and updates site settings', async () => {
      const current = await getSiteSettings()
      expect(current).toBeDefined()

      const updated = await updateSiteSettings({
        siteName: 'Hills Tourism & Travel Club',
        contactPhone: '+91 99999 88888',
      })

      expect(updated.siteName).toBe('Hills Tourism & Travel Club')
      expect(updated.contactPhone).toBe('+91 99999 88888')
    })
  })
})
