import { MetadataRoute } from 'next'
import { getPackages } from '@/lib/repositories/packages.repo'
import { getHotels } from '@/lib/repositories/hotels.repo'
import { getSiteUrl } from '@/lib/seo/siteUrl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  const [packages, hotels] = await Promise.all([
    getPackages(true),
    getHotels(true),
  ])

  // Core public indexable static routes (no private, admin, or API paths)
  const staticPaths = [
    '',
    '/packages',
    '/stays',
    '/vehicles',
    '/experiences',
    '/gallery',
    '/about',
    '/privacy-policy',
    '/terms-and-conditions',
  ]

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }))

  // Active public package detail pages
  const packageRoutes: MetadataRoute.Sitemap = packages
    .filter(pkg => pkg.active !== false && (pkg.slug || pkg.id))
    .map(pkg => ({
      url: `${baseUrl}/packages/${pkg.slug || pkg.id}`,
      lastModified: pkg.updatedAt ? new Date(pkg.updatedAt) : new Date(),
    }))

  // Active public hotel detail pages
  const hotelRoutes: MetadataRoute.Sitemap = hotels
    .filter(hotel => hotel.active !== false && (hotel.slug || hotel.id))
    .map(hotel => ({
      url: `${baseUrl}/hotels/${hotel.slug || hotel.id}`,
      lastModified: hotel.updatedAt ? new Date(hotel.updatedAt) : new Date(),
    }))

  return [...staticRoutes, ...packageRoutes, ...hotelRoutes]
}
