import { MetadataRoute } from 'next'
import { getPackages } from '@/lib/repositories/packages.repo'
import { getHotels } from '@/lib/repositories/hotels.repo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hillstourism.com'

  const [packages, hotels] = await Promise.all([
    getPackages(true),
    getHotels(true),
  ])

  // Static routes — only real page URLs, no hash fragments
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  // Dynamic package pages
  const packageRoutes: MetadataRoute.Sitemap = packages.map(pkg => ({
    url: `${baseUrl}/packages/${pkg.slug || pkg.id}`,
    lastModified: new Date(pkg.updatedAt || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Dynamic hotel pages
  const hotelRoutes: MetadataRoute.Sitemap = hotels.map(hotel => ({
    url: `${baseUrl}/hotels/${hotel.slug || hotel.id}`,
    lastModified: new Date(hotel.updatedAt || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...packageRoutes, ...hotelRoutes]
}
