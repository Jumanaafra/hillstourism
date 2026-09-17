import type { Package, Hotel, Vehicle, SiteSettings } from '@/types/domain'
import type { GalleryPhoto } from '@/lib/repositories/gallery.repo'
import dynamic from 'next/dynamic'

// Layout & Section components — above-fold or near-fold (static imports)
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import HomeLoadingOverlay from '@/components/HomeLoadingOverlay'
import LazyHillGuide from '@/components/LazyHillGuide'
import Journey from '@/components/Journey'
import TripFinder from '@/components/TripFinder'
import StatsStrip from '@/components/StatsStrip'
import TripCategoryCarousel from '@/components/TripCategoryCarousel'
import FeaturedTrips from '@/components/FeaturedTrips'
import Experiences from '@/components/Experiences'
import WhyChooseUs from '@/components/WhyChooseUs'

// Below-fold sections — lazy-loaded to reduce initial JS payload
const Gallery = dynamic(() => import('@/components/Gallery'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const Stays = dynamic(() => import('@/components/Stays'), { ssr: false })
const Vehicles = dynamic(() => import('@/components/Vehicles'), { ssr: false })
const SmartStayMatcher = dynamic(() => import('@/components/SmartStayMatcher'), { ssr: false })
const Enquiry = dynamic(() => import('@/components/Enquiry'), { ssr: false })

interface HomePageClientProps {
  initialPackages?: Package[]
  initialHotels?: Hotel[]
  initialVehicles?: Vehicle[]
  initialGalleryPhotos?: GalleryPhoto[]
  initialSettings?: SiteSettings
}

export default function HomePageClient({
  initialPackages,
  initialHotels,
  initialVehicles,
  initialGalleryPhotos,
  initialSettings,
}: HomePageClientProps) {
  return (
    <>
      <HomeLoadingOverlay />

      {/* Navigation */}
      <Navbar />

      <main id="home" tabIndex={-1}>
        {/* 1. Hero — 100-frame cinematic scroll sequence */}
        <Hero id="home" />

        {/* 2. Journey — parallax destination intro */}
        <Journey id="journey" />

        {/* 3. Trip Finder — interactive package matcher */}
        <TripFinder id="trip-finder" initialPackages={initialPackages} />

        {/* 4. Statistics strip */}
        <StatsStrip id="stats-strip" />

        {/* 5. Trip Types — 3D carousel */}
        <TripCategoryCarousel id="journeys" />

        {/* 6. Featured Packages */}
        <FeaturedTrips id="packages" initialPackages={initialPackages} />

        {/* 7. Experiences — editorial layout */}
        <Experiences id="experiences" />

        {/* 8. Gallery — asymmetric masonry */}
        <Gallery id="gallery" initialPhotos={initialGalleryPhotos} />

        {/* 9. Why Hillstourism */}
        <WhyChooseUs id="about" />

        {/* 10. Testimonials */}
        <Testimonials id="testimonials" />

        {/* 11. Stays */}
        <Stays id="stays" initialHotels={initialHotels} />

        {/* 12. Smart Stay Matching */}
        <SmartStayMatcher id="smart-stay" initialHotels={initialHotels} />

        {/* 13. Vehicles */}
        <Vehicles id="vehicles" initialVehicles={initialVehicles} />

        {/* 14. Trip Enquiry */}
        <Enquiry
          id="contact"
          initialPackages={initialPackages}
          initialHotels={initialHotels}
          initialVehicles={initialVehicles}
        />
      </main>

      {/* Footer */}
      <Footer id="footer" settings={initialSettings} />

      {/* HillGuide grounded chatbot */}
      <LazyHillGuide />
    </>
  )
}
