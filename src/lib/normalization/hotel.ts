/**
 * Normalizes a hotel name for uniqueness checks according to spec.md Section 7.2.
 * Rules:
 * 1. Trim leading and trailing whitespace
 * 2. Convert to lowercase
 * 3. Collapse repeated whitespace into a single space
 * 4. Strip punctuation/symbols consistently so "Hill-View Resort" matches "Hill View Resort"
 */
export function normalizeHotelName(name: string): string {
  if (!name || typeof name !== 'string') return ''
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')         // collapse consecutive whitespace
    .trim()
}
