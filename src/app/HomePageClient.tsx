import type { Package, Hotel, Vehicle, SiteSettings } from '@/types/domain'
import type { GalleryPhoto } from '@/lib/repositories/gallery.repo'

// Layout & Section components
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
import Gallery from '@/components/Gallery'
import WhyChooseUs from '@/components/WhyChooseUs'
import Testimonials from '@/components/Testimonials'
import Stays from '@/components/Stays'
import Vehicles from '@/components/Vehicles'

import SmartStayMatcher from '@/components/SmartStayMatcher'
import Enquiry from '@/components/Enquiry'

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
