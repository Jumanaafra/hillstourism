/**
 * page.tsx — Homepage route entry (Server Component)
 *
 * Fetches all CMS data in parallel on the server and passes it as props
 * to the client-side HomePageClient. This removes the entire browser-side
 * API waterfall (packages, hotels, vehicles, gallery) on initial page load.
 *
 * Client interactivity (Hero, LoadingScreen, GSAP, filters) lives in HomePageClient.tsx.
 */
import { getPackages } from '@/lib/repositories/packages.repo'
import { getHotels } from '@/lib/repositories/hotels.repo'
import { getVehicles } from '@/lib/repositories/vehicles.repo'
import { getGalleryPhotos } from '@/lib/repositories/gallery.repo'
import HomePageClient from './HomePageClient'

export default async function HomePage() {
  const [packages, hotels, vehicles, galleryPhotos] = await Promise.allSettled([
    getPackages(true),
    getHotels(true),
    getVehicles(true),
    getGalleryPhotos(true),
  ])

  return (
    <HomePageClient
      initialPackages={packages.status === 'fulfilled' ? packages.value : []}
      initialHotels={hotels.status === 'fulfilled' ? hotels.value : []}
      initialVehicles={vehicles.status === 'fulfilled' ? vehicles.value : []}
      initialGalleryPhotos={galleryPhotos.status === 'fulfilled' ? galleryPhotos.value : []}
    />
  )
}
