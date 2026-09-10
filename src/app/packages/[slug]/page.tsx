import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPackageBySlug, getPackages } from '@/lib/repositories/packages.repo'
import { getHotels } from '@/lib/repositories/hotels.repo'
import { getVehicles } from '@/lib/repositories/vehicles.repo'
import type { Hotel, Vehicle } from '@/types/domain'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HillGuide from '@/components/HillGuide'
import PackageItineraryView from '@/components/PackageItineraryView'
import { getSiteUrl, getCanonicalUrl } from '@/lib/seo/siteUrl'

export const revalidate = 3600 // ISR: Revalidate at most once per hour or on-demand via admin actions

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
  if (!pkg || pkg.active === false) {
    return {
      title: 'Package Not Found — Hills Tourism',
      description: 'The requested travel package could not be found.',
    }
  }

  const title = pkg.seo?.title || `${pkg.name} (${pkg.duration || 'Curated Journey'}) | Hills Tourism`
  const description =
    pkg.seo?.description ||
    pkg.shortDescription ||
    pkg.description ||
    `Experience ${pkg.name} in ${pkg.destination}. Handcrafted day-by-day mountain journey with Hills Tourism.`
  const ogImage = pkg.coverImage || pkg.image || pkg.seo?.ogImage

  return {
    title,
    description,
    alternates: {
      canonical: `/packages/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://hillstourism.com/packages/${params.slug}`,
      siteName: 'Hills Tourism',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: pkg.name }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function PackageDetailPage({ params }: Props) {
  const pkg = await getPackageBySlug(params.slug)
  if (!pkg || pkg.active === false) {
    notFound()
  }

  // Fetch active stays and vehicles for package connection
  const [allHotels, allVehicles] = await Promise.all([
    getHotels(true),
    getVehicles(true),
  ])

  // Resolve connected hotels (by explicit IDs or destination match)
  let connectedHotels: Hotel[] = []
  if (pkg.hotelIds && pkg.hotelIds.length > 0) {
    connectedHotels = allHotels.filter(h => pkg.hotelIds!.includes(h.id))
  }
  if (connectedHotels.length === 0) {
    const destWord = pkg.destination.split(',')[0].trim().toLowerCase()
    connectedHotels = allHotels.filter(h => (h.location || '').toLowerCase().includes(destWord)).slice(0, 3)
  }
  if (connectedHotels.length === 0) {
    connectedHotels = allHotels.slice(0, 2)
  }

  // Resolve connected vehicles (by explicit IDs or fleet highlights)
  let connectedVehicles: Vehicle[] = []
  if (pkg.vehicleIds && pkg.vehicleIds.length > 0) {
    connectedVehicles = allVehicles.filter(v => pkg.vehicleIds!.includes(v.id))
  }
  if (connectedVehicles.length === 0) {
    connectedVehicles = allVehicles.slice(0, 2)
  }

  const siteUrl = getSiteUrl()
  const pageCanonical = getCanonicalUrl(`/packages/${params.slug}`)

  // Generate Schema.org TouristTrip + BreadcrumbList structured data
  const touristTripSchema: Record<string, any> = {
    '@type': 'TouristTrip',
    name: pkg.name,
    description: pkg.shortDescription || pkg.description,
    touristType: pkg.category || 'Mountain Tourism',
    provider: {
      '@type': 'TravelAgency',
      name: 'Hills Tourism',
      url: siteUrl,
    },
  }

  if (pkg.price) {
    touristTripSchema.offers = {
      '@type': 'Offer',
      price: pkg.price.replace(/[^0-9]/g, '') || undefined,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    }
  }

  if (pkg.itinerary && pkg.itinerary.length > 0) {
    touristTripSchema.itinerary = pkg.itinerary.map(d => ({
      '@type': 'TouristTrip',
      name: `Day ${d.day}: ${d.title}`,
      description: d.description,
    }))
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
            name: 'Packages',
            item: `${siteUrl}/packages`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: pkg.name,
            item: pageCanonical,
          },
        ],
      },
      touristTripSchema,
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <PackageItineraryView
          pkg={pkg}
          connectedHotels={connectedHotels}
          connectedVehicles={connectedVehicles}
        />
      </main>
      <Footer id="footer" />
      <HillGuide />
    </>
  )
}
