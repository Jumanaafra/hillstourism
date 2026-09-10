import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import TripCategoryCarousel from '@/components/TripCategoryCarousel'
import FeaturedTrips from '@/components/FeaturedTrips'
import TripFinder from '@/components/TripFinder'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'

const defaultMeta: Metadata = {
  title: 'Curated Mountain Tour Packages — Hills Tourism',
  description:
    'Explore handcrafted hill station itineraries across Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali. Tailored for couples, families, and mountain explorers.',
  alternates: {
    canonical: getCanonicalUrl('/packages'),
  },
  openGraph: {
    title: 'Curated Mountain Tour Packages — Hills Tourism',
    description:
      'Handcrafted day-by-day itineraries across India’s most breathtaking hill destinations.',
    url: getCanonicalUrl('/packages'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/packages', defaultMeta)
}

export default function PackagesPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <TripCategoryCarousel id="journeys" />
        <FeaturedTrips id="packages" />
        <TripFinder id="trip-finder" />
      </main>
      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
