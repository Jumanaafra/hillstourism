/**
 * Production Site URL and SEO Canonical URL helpers.
 * Ensures consistent canonical URLs without hardcoded domains or trailing slashes.
 */

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://hillstourism.com'
  return envUrl.trim().replace(/\/+$/, '')
}

export function getCanonicalUrl(path = ''): string {
  const base = getSiteUrl()
  if (!path || path === '/') return base
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath.replace(/\/+$/, '')}`
}
