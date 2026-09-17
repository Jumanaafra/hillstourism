import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Enquiry from '@/components/Enquiry'
import LazyHillGuide from '@/components/LazyHillGuide'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaShieldAlt, FaClock } from 'react-icons/fa'

export const revalidate = 3600

const defaultMeta: Metadata = {
  title: 'Contact Us — Plan Your Mountain Getaway | Hills Tourism',
  description:
    'Get in touch with our hill travel specialists. Request custom itineraries, enquire about luxury cottage stays, or book mountain journeys across Munnar, Coorg, Ooty, and the Himalayas.',
  alternates: {
    canonical: getCanonicalUrl('/contact'),
  },
  openGraph: {
    title: 'Contact Us — Plan Your Mountain Getaway | Hills Tourism',
    description:
      'Connect with dedicated local hill experts to craft your personalized mountain itinerary.',
    url: getCanonicalUrl('/contact'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/contact', defaultMeta)
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--hill-navy-deep)', minHeight: '100vh', paddingTop: 'clamp(70px, 10vw, 90px)' }}>
        
        {/* Contact Hero Header */}
        <section style={{
          position: 'relative',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem)',
          maxWidth: 'var(--container-w)',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p className="eyebrow" style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.75rem', letterSpacing: '0.15em' }}>
            We're Here For You
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Let’s Plan Your <br className="hidden sm:inline" />
            <span style={{ color: 'var(--hill-blue-bright)' }}>Hill Country Story</span>
          </h1>
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.65,
          }}>
            Whether you are dreaming of misty tea estates, serene forest chalets, or panoramic high-altitude drives, our local travel curators are at your service.
          </p>

          {/* Quick Contact Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            margin: '0 auto',
          }}>
            <a
              href="https://wa.me/919999000000?text=Hi!%20I'd%20like%20to%20plan%20a%20hill%20trip%20with%20Hillstourism."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                fontSize: '0.82rem',
              }}
            >
              <FaWhatsapp size={16} /> Chat on WhatsApp
            </a>
            <a
              href="tel:+919999000000"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                fontSize: '0.82rem',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <FaPhoneAlt size={14} style={{ color: 'var(--hill-blue-bright)' }} /> +91 99990 00000
            </a>
          </div>
        </section>

        {/* The Main Enquiry Form Component */}
        <Enquiry id="contact-form" />

        {/* Trust Badges */}
        <section style={{
          maxWidth: 'var(--container-w)',
          margin: '0 auto',
          padding: '2rem clamp(1.25rem, 5vw, 4rem) 4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '8px',
              background: 'rgba(8,120,255,0.15)', color: 'var(--hill-blue-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FaClock size={20} />
            </div>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Prompt Response
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                Our travel experts respond within 2 to 4 hours with tailored itinerary options.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '8px',
              background: 'rgba(8,120,255,0.15)', color: 'var(--hill-blue-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FaShieldAlt size={20} />
            </div>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Verified Stays & Fleets
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                100% physically vetted mountain homestays, private chauffeurs, and luxury resorts.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '8px',
              background: 'rgba(8,120,255,0.15)', color: 'var(--hill-blue-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FaMapMarkerAlt size={20} />
            </div>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Local Hill Concierge
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                Round-the-clock on-trip assistance from departure to safe return home.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer id="footer" />
      <LazyHillGuide />
    </>
  )
}
