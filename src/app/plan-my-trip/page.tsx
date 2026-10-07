import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TripPlannerWizard from '@/components/TripPlannerWizard'
import { getPackages } from '@/lib/repositories/packages.repo'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'

export const revalidate = 3600

const defaultMeta: Metadata = {
  title: 'Plan My Trip — AI Trip Planner by Hills Tourism',
  description: 'Use our interactive trip planner to find the perfect handcrafted mountain itinerary for your next vacation in the Nilgiris, Coorg, Munnar and beyond.',
  alternates: {
    canonical: getCanonicalUrl('/plan-my-trip'),
  },
  openGraph: {
    title: 'Plan My Trip — Hills Tourism',
    description: 'Find the perfect mountain itinerary based on your travel vibe and duration.',
    url: getCanonicalUrl('/plan-my-trip'),
    siteName: 'Hills Tourism',
    type: 'website',
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/plan-my-trip', defaultMeta)
}

export default async function PlanMyTripPage() {
  const packages = await getPackages(true).catch(() => [])

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', background: 'var(--hill-surface)' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '1rem', paddingInline: '1rem' }}>
          <h1 className="heading-xl" style={{ color: 'var(--hill-navy)' }}>Plan Your Escape</h1>
          <p className="body-lg" style={{ color: 'var(--hill-muted)', maxWidth: '600px', margin: '1rem auto 0' }}>
            Answer a few quick questions and let our algorithm curate the perfect mountain journey for you.
          </p>
        </div>
        <TripPlannerWizard packages={packages} />
      </main>
      <Footer id="footer" />
    </>
  )
}
