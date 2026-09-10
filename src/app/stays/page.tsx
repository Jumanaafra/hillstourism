import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import Stays from '@/components/Stays'
import SmartStayMatcher from '@/components/SmartStayMatcher'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'
import { getHotels } from '@/lib/repositories/hotels.repo'

export const revalidate = 3600 // ISR: CDN-cached; regenerates hourly or on admin mutation

const defaultMeta: Metadata = {
  title: 'Curated Mountain Stays & Homestays — Hills Tourism',
  description:
    'Discover authentic hill cottages, colonial bungalows, and luxury hillside resorts across Munnar, Coorg, Ooty, and Himachal. Vetted for panoramic views and hospitality.',
  alternates: {
    canonical: getCanonicalUrl('/stays'),
  },
  openGraph: {
    title: 'Curated Mountain Stays & Homestays — Hills Tourism',
    description:
      'Authentic hill cottages, colonial bungalows, and boutique mountain resorts vetted by local hill experts.',
    url: getCanonicalUrl('/stays'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/stays', defaultMeta)
}

export default async function StaysPage() {
  // Fetch hotels server-side — eliminates client-side /api/hotels waterfall
  // Both Stays and SmartStayMatcher receive the same data; no duplicate requests
  const hotels = await getHotels(true).catch(() => [])

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <Stays id="stays" initialHotels={hotels} />
        <SmartStayMatcher id="smart-stay" initialHotels={hotels} />
      </main>
      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
