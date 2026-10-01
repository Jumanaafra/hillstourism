/** A package may advertise multiple options; staff must pick one before quoting. */
export function parsePerPersonPrice(value: string): number | null {
  const text = value.trim()
  if (!text || text.includes('/')) return null
  const amounts = [...text.matchAll(/(?:₹|Rs\.?\s*)\s*([\d,]+(?:\.\d{1,2})?)/gi)]
  if (amounts.length > 1) return null
  const raw = amounts[0]?.[1] || text.match(/^([\d,]+(?:\.\d{1,2})?)(?:\s|$)/)?.[1]
  if (!raw) return null
  const parsed = Number(raw.replace(/,/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}
