import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'

const defaultMeta: Metadata = {
  title: 'Privacy Policy — Hills Tourism',
  description:
    'Learn how Hills Tourism collects, uses, and safeguards information submitted through our enquiry-based mountain travel platform.',
  alternates: {
    canonical: getCanonicalUrl('/privacy-policy'),
  },
  openGraph: {
    title: 'Privacy Policy — Hills Tourism',
    description:
      'Our commitment to privacy and data protection for all travelers exploring mountain getaways with Hills Tourism.',
    url: getCanonicalUrl('/privacy-policy'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/privacy-policy', defaultMeta)
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 2026'

  return (
    <>
      <Navbar />

      <main style={{ background: 'var(--hill-white)', minHeight: '100vh', paddingTop: '100px' }}>
        {/* Header Hero */}
        <section
          style={{
            background: 'var(--hill-navy)',
            color: '#ffffff',
            padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 5rem)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span
              className="badge badge-blue"
              style={{ marginBottom: '1rem', display: 'inline-block' }}
            >
              Legal & Trust
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: '1rem',
              }}
            >
              Privacy Policy
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
              Last updated: {lastUpdated} · Effective for all visitors and travelers
            </p>
          </div>
        </section>

        {/* Content Body */}
        <section
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1.25rem, 4vw, 2rem)',
            color: 'var(--hill-navy)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.8,
            fontSize: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--hill-navy)',
                  marginBottom: '0.75rem',
                }}
              >
                1. Overview & Service Model
              </h2>
              <p style={{ color: '#475569' }}>
                Hills Tourism operates an enquiry-led mountain travel planning service across India’s premier hill
                stations, including Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali. This Privacy Policy explains
                how we collect, use, store, and protect information when you browse our website, explore curated
                itineraries, or submit a trip enquiry.
              </p>
            </div>

            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--hill-navy)',
                  marginBottom: '0.75rem',
                }}
              >
                2. Information We Collect
              </h2>
              <p style={{ color: '#475569', marginBottom: '0.75rem' }}>
                Because Hills Tourism is an enquiry-based service rather than an automated booking engine, we collect
                only the information necessary to design and coordinate your customized trip:
              </p>
              <ul style={{ paddingLeft: '1.5rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>Contact Information:</strong> Full name, phone number, and optional email address.</li>
                <li><strong>Trip Preferences:</strong> Selected travel package, destination, preferred dates, group size, and special requirements.</li>
                <li><strong>Stay & Fleet Selections:</strong> Preferred hotel category (Normal, Premium, 5-Star) and vehicle type.</li>
                <li><strong>Enquiry Notes:</strong> Specific preferences or questions submitted through our enquiry form.</li>
                <li><strong>Technical Data:</strong> Browser user agent, approximate IP geolocation, and page interactions used solely for site performance and abuse mitigation.</li>
              </ul>
            </div>

            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--hill-navy)',
                  marginBottom: '0.75rem',
                }}
              >
                3. How We Use Your Information
              </h2>
              <ul style={{ paddingLeft: '1.5rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>To review your mountain trip request and contact you via phone or WhatsApp with a tailored itinerary.</li>
                <li>To coordinate verified homestays, boutique resorts, and dedicated mountain chauffeurs for your journey.</li>
                <li>To answer questions submitted through our interactive HillGuide assistant.</li>
                <li>To maintain platform security, prevent fraudulent submissions, and monitor system health.</li>
              </ul>
              <p style={{ color: '#475569', marginTop: '0.75rem' }}>
                We never sell, rent, or trade your personal information with third-party data brokers or marketing networks.
              </p>
            </div>

            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--hill-navy)',
                  marginBottom: '0.75rem',
                }}
              >
                4. Data Storage & Infrastructure Providers
              </h2>
              <p style={{ color: '#475569', marginBottom: '0.75rem' }}>
                We utilize reliable cloud infrastructure to safeguard your information:
              </p>
              <ul style={{ paddingLeft: '1.5rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>Database Storage:</strong> Google Cloud Firestore stores enquiries securely under server-side encryption.</li>
                <li><strong>Media Delivery:</strong> Cloudinary hosts our high-definition photography and mountain media assets.</li>
                <li><strong>Operational Backups:</strong> Automated enquiry logs synced with secure enterprise Google Sheets for team dispatch.</li>
                <li><strong>Communication Services:</strong> Direct WhatsApp Business messaging and transactional SMTP notification services.</li>
                <li><strong>AI Assistant (HillGuide):</strong> Google Gemini API processes real-time travel queries without storing personal conversational histories for public advertising.</li>
              </ul>
            </div>

            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--hill-navy)',
                  marginBottom: '0.75rem',
                }}
              >
                5. Data Retention & Traveler Rights
              </h2>
              <p style={{ color: '#475569' }}>
                Enquiry records are retained for the duration of trip planning and subsequent travel support. You retain
                the right to inspect, update, or request deletion of your submitted contact details at any time by
                contacting our privacy coordinator at <a href="mailto:hello@hillstourism.com" style={{ color: 'var(--hill-blue-bright)' }}>hello@hillstourism.com</a>.
              </p>
            </div>

            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--hill-navy)',
                  marginBottom: '0.75rem',
                }}
              >
                6. Contact Hills Tourism
              </h2>
              <p style={{ color: '#475569' }}>
                If you have questions regarding this Privacy Policy or data handling practices, reach us at:
              </p>
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1.25rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#334155',
                }}
              >
                <p><strong>Hills Tourism Privacy Desk</strong></p>
                <p>Email: <a href="mailto:hello@hillstourism.com" style={{ color: 'var(--hill-blue-bright)' }}>hello@hillstourism.com</a></p>
                <p>Phone / WhatsApp: +91 99990 00000</p>
                <p>Hours: 9:00 AM – 9:00 PM IST (7 Days a week)</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
