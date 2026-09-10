import { describe, it, expect } from 'vitest'
import { sortItineraryDays, validateItinerary } from '../../src/lib/validation/itinerary'
import type { ItineraryDay } from '../../src/types/domain'

describe('Itinerary Validation & Sorting Unit Tests', () => {
  describe('sortItineraryDays', () => {
    it('returns empty array when itinerary is undefined or null', () => {
      expect(sortItineraryDays(undefined)).toEqual([])
      expect(sortItineraryDays(null as any)).toEqual([])
    })

    it('returns empty array when passed non-array', () => {
      expect(sortItineraryDays('not an array' as any)).toEqual([])
    })

    it('sorts itinerary days in strict ascending order (Day 1, Day 2, Day 3)', () => {
      const unsorted: ItineraryDay[] = [
        { day: 3, title: 'Day 3 departure', description: 'Head home' },
        { day: 1, title: 'Day 1 arrival', description: 'Arrive at hills' },
        { day: 2, title: 'Day 2 exploration', description: 'Sightseeing and tea gardens' },
      ]

      const sorted = sortItineraryDays(unsorted)
      expect(sorted.map(d => d.day)).toEqual([1, 2, 3])
      expect(sorted[0].title).toBe('Day 1 arrival')
      expect(sorted[1].title).toBe('Day 2 exploration')
      expect(sorted[2].title).toBe('Day 3 departure')
    })

    it('correctly sorts when day numbers are numeric strings', () => {
      const unsorted = [
        { day: '3' as any, title: 'Day 3', description: 'Desc 3' },
        { day: '1' as any, title: 'Day 1', description: 'Desc 1' },
        { day: 2, title: 'Day 2', description: 'Desc 2' },
      ]

      const sorted = sortItineraryDays(unsorted)
      expect(sorted.map(d => Number(d.day))).toEqual([1, 2, 3])
    })

    it('filters out null or invalid entries safely', () => {
      const dirty = [
        { day: 2, title: 'Day 2', description: 'Desc 2' },
        null as any,
        undefined as any,
        { day: 1, title: 'Day 1', description: 'Desc 1' },
      ]

      const sorted = sortItineraryDays(dirty)
      expect(sorted.length).toBe(2)
      expect(sorted[0].day).toBe(1)
      expect(sorted[1].day).toBe(2)
    })
  })

  describe('validateItinerary', () => {
    it('passes when itinerary is undefined or null', () => {
      expect(validateItinerary(undefined)).toEqual({ valid: true })
      expect(validateItinerary(null)).toEqual({ valid: true })
    })

    it('passes for valid complete day-wise itinerary', () => {
      const validItinerary = [
        {
          day: 1,
          title: 'Arrival in Munnar',
          description: 'Scenic hill climb and check-in to mountain resort.',
          locations: ['Cochin', 'Munnar'],
          activities: ['Cheeyappara Waterfalls stop', 'Spice plantation visit'],
          meals: ['Dinner included'],
          accommodation: 'Cloud Valley Resort',
          travelInfo: 'Private AC Innova transfer (130 km / 4 hrs)',
        },
        {
          day: 2,
          title: 'Kolukkumalai Sunrise & Tea Trails',
          description: 'Early morning 4x4 Jeep safari to Kolukkumalai estate.',
          locations: ['Kolukkumalai', 'Top Station'],
          activities: ['Sunrise trek', 'Factory tour & tea tasting'],
          meals: ['Breakfast', 'Lunch'],
        },
      ]

      const result = validateItinerary(validItinerary)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects when itinerary is not an array', () => {
      const result = validateItinerary({ day: 1, title: 'Not an array' })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('must be an array')
    })

    it('rejects when day is less than 1 (e.g. Day 0 or negative)', () => {
      const resultZero = validateItinerary([
        { day: 0, title: 'Day 0', description: 'Pre-trip planning' },
      ])
      expect(resultZero.valid).toBe(false)
      expect(resultZero.error).toContain('Day must be an integer >= 1')

      const resultNegative = validateItinerary([
        { day: -1, title: 'Day -1', description: 'Invalid day' },
      ])
      expect(resultNegative.valid).toBe(false)
      expect(resultNegative.error).toContain('Day must be an integer >= 1')
    })

    it('rejects when day is not an integer (e.g. Day 1.5)', () => {
      const result = validateItinerary([
        { day: 1.5, title: 'Day 1.5', description: 'Half day' },
      ])
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Day must be an integer >= 1')
    })

    it('rejects duplicate day numbers', () => {
      const duplicateDays = [
        { day: 1, title: 'Day 1 first', description: 'First attempt' },
        { day: 1, title: 'Day 1 duplicate', description: 'Duplicate day' },
      ]
      const result = validateItinerary(duplicateDays)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Duplicate day number detected: Day 1')
    })

    it('rejects when day is missing title or has blank title', () => {
      const missingTitle = [
        { day: 1, title: '', description: 'Some description' },
      ]
      const result = validateItinerary(missingTitle)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Day 1 must have a title')
    })

    it('rejects when day is missing description or has blank description', () => {
      const missingDesc = [
        { day: 1, title: 'Valid Title', description: '   ' },
      ]
      const result = validateItinerary(missingDesc)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Day 1 must have a description')
    })

    it('rejects non-array types for array fields (locations, activities, meals, images)', () => {
      const invalidLocations = [
        { day: 1, title: 'Title', description: 'Desc', locations: 'Not an array' as any },
      ]
      const resLocations = validateItinerary(invalidLocations)
      expect(resLocations.valid).toBe(false)
      expect(resLocations.error).toContain('must be an array of strings')

      const invalidActivities = [
        { day: 1, title: 'Title', description: 'Desc', activities: 123 as any },
      ]
      const resActivities = validateItinerary(invalidActivities)
      expect(resActivities.valid).toBe(false)
      expect(resActivities.error).toContain('must be an array of strings')
    })
  })
})
