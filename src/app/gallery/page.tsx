import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import Gallery from '@/components/Gallery'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'

const defaultMeta: Metadata = {
  title: 'Visual Mountain Stories & Photo Gallery — Hills Tourism',
  description:
    'Browse our curated gallery of rolling tea plantations, mist-covered mountain valleys, colonial stays, and scenic hill moments captured by our travelers.',
  alternates: {
    canonical: getCanonicalUrl('/gallery'),
  },
  openGraph: {
    title: 'Visual Mountain Stories & Photo Gallery — Hills Tourism',
    description:
      'Cinematic imagery from Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali.',
    url: getCanonicalUrl('/gallery'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/gallery', defaultMeta)
}

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <Gallery id="gallery" />
      </main>
      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
