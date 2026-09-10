import type { ItineraryDay } from '@/types/domain'

/**
 * Guarantees that itinerary days are strictly sorted in ascending order by day number (Day 1, Day 2, Day 3...)
 * Handles null/undefined gracefully.
 */
export function sortItineraryDays(itinerary?: ItineraryDay[]): ItineraryDay[] {
  if (!itinerary || !Array.isArray(itinerary)) return []
  return [...itinerary]
    .filter(day => day && typeof day === 'object')
    .sort((a, b) => {
      const dayA = typeof a.day === 'number' ? a.day : Number(a.day) || 0
      const dayB = typeof b.day === 'number' ? b.day : Number(b.day) || 0
      return dayA - dayB
    })
}

export interface ItineraryValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates itinerary data structure, day constraints, and field requirements.
 * Rejects:
 * - Non-array itinerary
 * - Day numbers < 1 or non-integers
 * - Duplicate day numbers (e.g. Day 1 and Day 1)
 * - Missing or empty title
 * - Missing or empty description
 */
export function validateItinerary(itinerary: unknown): ItineraryValidationResult {
  if (itinerary === undefined || itinerary === null) {
    return { valid: true }
  }

  if (!Array.isArray(itinerary)) {
    return { valid: false, error: 'Itinerary must be an array of day objects.' }
  }

  const seenDays = new Set<number>()

  for (let i = 0; i < itinerary.length; i++) {
    const item = (itinerary as any)[i]
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Itinerary item at index ${i} is invalid.` }
    }

    const dayNum = Number(item.day)
    if (isNaN(dayNum) || !Number.isInteger(dayNum) || dayNum < 1) {
      return { valid: false, error: `Invalid day number: "${item.day}". Day must be an integer >= 1.` }
    }

    if (seenDays.has(dayNum)) {
      return { valid: false, error: `Duplicate day number detected: Day ${dayNum}. Each day must have a unique number.` }
    }
    seenDays.add(dayNum)

    if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
      return { valid: false, error: `Day ${dayNum} must have a title.` }
    }

    if (!item.description || typeof item.description !== 'string' || !item.description.trim()) {
      return { valid: false, error: `Day ${dayNum} must have a description.` }
    }

    // Validate array fields if present
    const arrayFields = ['locations', 'activities', 'meals', 'images', 'highlights']
    for (const field of arrayFields) {
      if (item[field] !== undefined && item[field] !== null && !Array.isArray(item[field])) {
        return { valid: false, error: `Day ${dayNum} field "${field}" must be an array of strings.` }
      }
    }
  }

  return { valid: true }
}
