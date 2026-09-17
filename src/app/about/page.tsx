import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LazyHillGuide from '@/components/LazyHillGuide'
import WhyChooseUs from '@/components/WhyChooseUs'
import Testimonials from '@/components/Testimonials'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'
import { getSiteSettings, getTestimonials } from '@/lib/repositories/content.repo'

const defaultMeta: Metadata = {
  title: 'About Hills Tourism — Local Mountain Travel Specialists',
  description:
    'Founded in 2018, Hills Tourism creates authentic mountain escapes. Meet our local hill experts, curated homestay network, and mountain-certified chauffeurs.',
  alternates: {
    canonical: getCanonicalUrl('/about'),
  },
  openGraph: {
    title: 'About Hills Tourism — Local Mountain Travel Specialists',
    description:
      'Curated escapes crafted by local experts who call the hills home. Personalized planning for authentic mountain journeys.',
    url: getCanonicalUrl('/about'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export const revalidate = 3600 // ISR: CDN-cached; regenerates hourly or on admin mutation

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/about', defaultMeta)
}

export default async function AboutPage() {
  const [settings, testimonials] = await Promise.all([getSiteSettings(), getTestimonials(true)])
  return (
    <>
      <Navbar whatsappUrl={settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : undefined} />
      <main style={{ paddingTop: '80px' }}>
        <WhyChooseUs id="about" />
        <Testimonials id="testimonials" initialTestimonials={testimonials} />
      </main>
      <Footer id="footer" settings={settings} />
      <LazyHillGuide />
    </>
  )
}
