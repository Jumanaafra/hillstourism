import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPackageBySlug, getPackages } from '@/lib/repositories/packages.repo'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import Enquiry from '@/components/Enquiry'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const packages = await getPackages(true)
  return packages.map(p => ({
    slug: p.slug || p.id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = await getPackageBySlug(params.slug)
  if (!pkg) return { title: 'Package Not Found — Hills Tourism' }

  return {
    title: `${pkg.name} — Hills Tourism`,
    description: pkg.description || `Discover ${pkg.name} in ${pkg.destination}. Handcrafted mountain journey by Hills Tourism.`,
    alternates: {
      canonical: `/packages/${params.slug}`,
    },
    openGraph: {
      title: `${pkg.name} (${pkg.destination}) — Hills Tourism`,
      description: pkg.description,
      images: pkg.image ? [{ url: pkg.image }] : undefined,
    },
  }
}

export default async function PackageDetailPage({ params }: Props) {
  const pkg = await getPackageBySlug(params.slug)
  if (!pkg) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.name,
    description: pkg.description,
    touristType: pkg.category,
    provider: {
      '@type': 'TravelAgency',
      name: 'Hills Tourism',
      url: 'https://hillstourism.com',
    },
    offers: {
      '@type': 'Offer',
      price: pkg.price?.replace(/[^0-9]/g, '') || '9999',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main style={{ background: 'var(--hill-white)', minHeight: '100vh', paddingTop: '100px' }}>
        {/* Package Header Hero */}
        <section style={{
          position: 'relative',
          background: 'var(--hill-navy)',
          color: '#ffffff',
          padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 5vw, 5rem)',
          overflow: 'hidden',
        }}>
          {pkg.image && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${pkg.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.25,
              filter: 'brightness(0.7)',
            }} />
          )}

          <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>
              {pkg.category} · {pkg.duration}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem' }}>
              {pkg.name}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '640px', lineHeight: 1.6, marginBottom: '2rem' }}>
              {pkg.description}
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Starting from</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
                {pkg.price}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{pkg.priceNote}</span>
            </div>
          </div>
        </section>

        {/* Highlights */}
        {pkg.highlights && pkg.highlights.length > 0 && (
          <section style={{ maxWidth: 'var(--container-w)', margin: '3rem auto', padding: '0 clamp(1.25rem, 5vw, 5rem)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--hill-navy)', marginBottom: '1.25rem' }}>
              Journey Highlights
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {pkg.highlights.map(h => (
                <div key={h} style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid var(--hill-border)',
                  color: 'var(--hill-navy)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}>
                  ✨ {h}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enquiry Section */}
        <Enquiry id="contact" />
      </main>

      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
