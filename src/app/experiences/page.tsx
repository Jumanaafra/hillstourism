import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import Experiences from '@/components/Experiences'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'

const defaultMeta: Metadata = {
  title: 'Mountain Experiences & Guided Activities — Hills Tourism',
  description:
    'From early dawn tea walks and heritage steam trains to high ridge treks and spice tastings. Discover bespoke mountain activities crafted by local experts.',
  alternates: {
    canonical: getCanonicalUrl('/experiences'),
  },
  openGraph: {
    title: 'Mountain Experiences & Guided Activities — Hills Tourism',
    description:
      'Immersive hill station activities and guided adventures across South and North India.',
    url: getCanonicalUrl('/experiences'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export const revalidate = 3600 // ISR: CDN-cached; regenerates hourly or on admin mutation

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/experiences', defaultMeta)
}

export default function ExperiencesPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <Experiences id="experiences" />
      </main>
      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
