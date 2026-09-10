/**
 * Normalizes vehicle number plates for uniqueness checks according to spec.md Section 8.
 * Rules:
 * 1. Convert to uppercase
 * 2. Strip all spaces, dashes, dots, and non-alphanumeric characters
 * Example:
 * 'TN 01 AB 1234' -> 'TN01AB1234'
 * 'tn01ab1234'    -> 'TN01AB1234'
 * 'TN-01-AB-1234' -> 'TN01AB1234'
 */
export function normalizeNumberPlate(plate: string): string {
  if (!plate || typeof plate !== 'string') return ''
  return plate
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '')
}
