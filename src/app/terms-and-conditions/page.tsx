import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LazyHillGuide from '@/components/LazyHillGuide'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'

const defaultMeta: Metadata = {
  title: 'Terms & Conditions — Hills Tourism',
  description:
    'Review the terms of service and enquiry guidelines for exploring and planning mountain journeys with Hills Tourism.',
  alternates: {
    canonical: getCanonicalUrl('/terms-and-conditions'),
  },
  openGraph: {
    title: 'Terms & Conditions — Hills Tourism',
    description:
      'Clear, transparent terms governing enquiry submissions and custom itinerary planning with Hills Tourism.',
    url: getCanonicalUrl('/terms-and-conditions'),
    siteName: 'Hills Tourism',
    type: 'website',
  },
}

export const revalidate = 3600 // ISR: CDN-cached; regenerates hourly or on admin mutation

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/terms-and-conditions', defaultMeta)
}

export default function TermsAndConditionsPage() {
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
              Legal & Service Guidelines
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
              Terms & Conditions
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
              Last updated: {lastUpdated} · Please read carefully before submitting an enquiry
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
                1. Acceptance of Terms
              </h2>
              <p style={{ color: '#475569' }}>
                By accessing, browsing, or submitting an enquiry on the Hills Tourism website
                (<a href="https://hillstourism.com" style={{ color: 'var(--hill-blue-bright)' }}>hillstourism.com</a>),
                you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms,
                you should not use this website.
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
                2. Enquiry-Based Service Model
              </h2>
              <p style={{ color: '#475569', marginBottom: '0.75rem' }}>
                Hills Tourism operates exclusively on an <strong>enquiry-led planning model</strong>:
              </p>
              <ul style={{ paddingLeft: '1.5rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <strong>No Automatic Bookings:</strong> Submitting a form on this website does not constitute a confirmed reservation, ticket issuance, or binding contract.
                </li>
                <li>
                  <strong>No Online Financial Transactions:</strong> This website does not process credit cards, bank transfers, or payments. All travel arrangements are finalized directly through human consultation with our trip specialists.
                </li>
                <li>
                  <strong>Indicative Estimates:</strong> All prices, durations, day itineraries, hotel categories, and vehicle options displayed on the website are indicative representations to assist in your vacation planning and are subject to seasonal availability and mutual confirmation.
                </li>
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
                3. User Responsibilities & Acceptable Use
              </h2>
              <p style={{ color: '#475569', marginBottom: '0.75rem' }}>
                When submitting enquiries or interacting with our services, you agree to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Provide genuine and accurate contact information (phone number, travel dates, and passenger details).</li>
                <li>Refrain from submitting automated, duplicate, malicious, or spam enquiries.</li>
                <li>Use the HillGuide chat assistant respectfully and solely for mountain travel planning purposes.</li>
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
                4. Intellectual Property
              </h2>
              <p style={{ color: '#475569' }}>
                All website text, custom brand styling, logos, graphics, visual layout, and editorial trip itineraries
                are the intellectual property of Hills Tourism. Photography and imagery are curated or hosted via Cloudinary
                under appropriate rights. You may not reproduce, republish, or scrape content without prior written permission.
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
                5. Limitation of Liability
              </h2>
              <p style={{ color: '#475569' }}>
                While Hills Tourism strives for 100% accuracy in descriptions and local advice, website information is
                provided on an &quot;as is&quot; basis. Hill weather, road conditions, park opening seasons, and local regulations
                are inherently variable in mountainous terrains. Formal travel terms, cancellation policies, and liability
                guidelines are provided in customized trip agreements prior to trip execution.
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
                6. Contact & Inquiries
              </h2>
              <p style={{ color: '#475569' }}>
                For inquiries regarding these Terms & Conditions, please contact us:
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
                <p><strong>Hills Tourism Support & Operations</strong></p>
                <p>Email: <a href="mailto:hello@hillstourism.com" style={{ color: 'var(--hill-blue-bright)' }}>hello@hillstourism.com</a></p>
                <p>Phone / WhatsApp: +91 99990 00000</p>
                <p>Operating Hours: 9:00 AM – 9:00 PM IST (7 Days a week)</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer id="footer" />
      <LazyHillGuide />
    </>
  )
}
