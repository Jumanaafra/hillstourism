import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHotels } from '@/lib/repositories/hotels.repo'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import Enquiry from '@/components/Enquiry'

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

  return {
    title: `${hotel.name} — ${hotel.location || 'Curated Mountain Stay'} — Hills Tourism`,
    description: hotel.description || `Experience ${hotel.name} in ${hotel.location}. Curated authentic mountain stays with Hills Tourism.`,
    alternates: {
      canonical: `/hotels/${params.slug}`,
    },
    openGraph: {
      title: `${hotel.name} (${hotel.location})`,
      description: hotel.description,
      images: hotel.image ? [{ url: hotel.image }] : undefined,
    },
  }
}

export default async function HotelDetailPage({ params }: Props) {
  const hotels = await getHotels(false)
  const hotel = hotels.find(h => h.slug === params.slug || h.id === params.slug)
  if (!hotel) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
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
    priceRange: hotel.pricePerNight,
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
              backgroundImage: `url(${hotel.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.25,
            }} />
          )}

          <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>
              {hotel.category} Stay · ★ {hotel.rating}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.75rem' }}>
              {hotel.name}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--hill-blue-soft)', marginBottom: '1.5rem', fontWeight: 500 }}>
              📍 {hotel.location}
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
                  fontSize: '0.9rem',
                }}>
                  🏡 {a}
                </div>
              ))}
            </div>
          </section>
        )}

        <Enquiry id="contact" />
      </main>

      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
