import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import Vehicles from '@/components/Vehicles'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'
import { getVehicles } from '@/lib/repositories/vehicles.repo'

export const revalidate = 3600 // ISR: CDN-cached; regenerates hourly or on admin mutation

const defaultMeta: Metadata = {
  title: 'Dedicated Hill Fleet & Mountain Chauffeurs — Hills Tourism',
  description:
    'Reliable mountain fleet including Innova Crysta, Fortuner, and Tempo Travelers with experienced local drivers for scenic Western Ghats and Himalayan terrains.',
  alternates: {
    canonical: getCanonicalUrl('/vehicles'),
  },
  openGraph: {
    title: 'Dedicated Hill Fleet & Mountain Chauffeurs — Hills Tourism',
    description:
      'Chauffeur-driven mountain cabs and luxury SUVs optimized for hill station curves, luggage, and family comfort.',
    url: getCanonicalUrl('/vehicles'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/vehicles', defaultMeta)
}

export default async function VehiclesPage() {
  // Fetch vehicles server-side — eliminates client-side /api/vehicles waterfall
  const vehicles = await getVehicles(true).catch(() => [])

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <Vehicles id="vehicles" initialVehicles={vehicles} />
      </main>
      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
