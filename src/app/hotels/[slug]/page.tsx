import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHotels } from '@/lib/repositories/hotels.repo'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LazyHillGuide from '@/components/LazyHillGuide'
import Enquiry from '@/components/Enquiry'
import { FaStar } from 'react-icons/fa'
import { FiMapPin, FiHome } from 'react-icons/fi'
import { getOptimizedImageUrl } from '@/lib/cloudinary/transform'

import { getSiteUrl, getCanonicalUrl } from '@/lib/seo/siteUrl'

export const revalidate = 3600 // ISR: regenerate at most hourly or on-demand from admin

interface Props {
  params: { slug: string }
}


export async function generateStaticParams() {
  const hotels = await getHotels(true)
  return hotels.map(h => ({
    slug: h.slug || h.id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hotels = await getHotels(false)
  const hotel = hotels.find(h => h.slug === params.slug || h.id === params.slug)
  if (!hotel) return { title: 'Hotel Not Found — Hills Tourism' }

  const pageCanonical = hotel.seo?.canonicalUrl || getCanonicalUrl(`/hotels/${params.slug}`)
  const title = hotel.seo?.title || `${hotel.name} — ${hotel.location || 'Curated Mountain Stay'} — Hills Tourism`
  const description =
    hotel.seo?.description ||
    hotel.description ||
    `Experience ${hotel.name} in ${hotel.location}. Curated authentic mountain stays with Hills Tourism.`
  const image = hotel.seo?.ogImage || hotel.image

  return {
    title,
    description,
    alternates: {
      canonical: pageCanonical,
    },
    openGraph: {
      title,
      description,
      url: pageCanonical,
      siteName: 'Hills Tourism',
      images: image ? [{ url: image }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function HotelDetailPage({ params }: Props) {
  const hotels = await getHotels(false)
  const hotel = hotels.find(h => h.slug === params.slug || h.id === params.slug)
  if (!hotel) {
    notFound()
  }

  const siteUrl = getSiteUrl()
  const pageCanonical = getCanonicalUrl(`/hotels/${params.slug}`)

  const lodgingSchema: Record<string, any> = {
    '@type': 'LodgingBusiness',
    name: hotel.name,
    description: hotel.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.location,
      addressCountry: 'IN',
    },
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.rating || 4.5,
    },
  }

  if (hotel.pricePerNight) {
    lodgingSchema.priceRange = hotel.pricePerNight
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Stays',
            item: `${siteUrl}/stays`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: hotel.name,
            item: pageCanonical,
          },
        ],
      },
      lodgingSchema,
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main style={{ background: 'var(--hill-white)', minHeight: '100vh', paddingTop: '100px' }}>
        <section style={{
          position: 'relative',
          background: 'var(--hill-navy)',
          color: '#ffffff',
          padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 5vw, 5rem)',
          overflow: 'hidden',
        }}>
          {hotel.image && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${getOptimizedImageUrl(hotel.image, { width: 1600, quality: 'auto' })})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.25,
            }} />
          )}

          <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center' }}>
              {hotel.category} Stay <span style={{ margin: '0 6px' }}>·</span> <FaStar style={{ marginRight: 4 }} /> {hotel.rating}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.75rem' }}>
              {hotel.name}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--hill-blue-soft)', marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
              <FiMapPin style={{ marginRight: 6 }} /> {hotel.location}
            </p>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', maxWidth: '640px', lineHeight: 1.6, marginBottom: '2rem' }}>
              {hotel.description}
            </p>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Indicative rate from</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
                {hotel.pricePerNight} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/ night</span>
              </p>
            </div>
          </div>
        </section>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <section style={{ maxWidth: 'var(--container-w)', margin: '3rem auto', padding: '0 clamp(1.25rem, 5vw, 5rem)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--hill-navy)', marginBottom: '1.25rem' }}>
              Curated Amenities
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {hotel.amenities.map(a => (
                <div key={a} style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid var(--hill-border)',
                  color: 'var(--hill-navy)',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  <FiHome style={{ marginRight: 6 }} /> {a}
                </div>
              ))}
            </div>
          </section>
        )}

        <Enquiry id="contact" />
      </main>

      <Footer id="footer" />
      <LazyHillGuide />
    </>
  )
}
