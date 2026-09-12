'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Package, Hotel, Vehicle } from '@/types/domain'
import type { GalleryPhoto } from '@/lib/repositories/gallery.repo'

// Layout & Section components
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
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

// Dynamic code-split components
const LoadingScreen = dynamic(() => import('@/components/LoadingScreen'), { ssr: false })
const HillGuide = dynamic(() => import('@/components/HillGuide'), { ssr: false })
const SmartStayMatcher = dynamic(() => import('@/components/SmartStayMatcher'), { ssr: true })
const Enquiry = dynamic(() => import('@/components/Enquiry'), { ssr: true })

interface HomePageClientProps {
  initialPackages?: Package[]
  initialHotels?: Hotel[]
  initialVehicles?: Vehicle[]
  initialGalleryPhotos?: GalleryPhoto[]
}

export default function HomePageClient({
  initialPackages,
  initialHotels,
  initialVehicles,
  initialGalleryPhotos,
}: HomePageClientProps) {
  const [showLoader, setShowLoader] = useState(true)

  // Use isomorphic layout effect to avoid a flash of the loading screen on return visits
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ht_loaded') === '1') {
      setShowLoader(false)
    }
  }, [])

  const handleLoadComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ht_loaded', '1')
    }
    setShowLoader(false)
  }

  return (
    <>
      {showLoader && <LoadingScreen onComplete={handleLoadComplete} />}

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
      <Footer id="footer" />

      {/* HillGuide grounded chatbot */}
      <HillGuide />
    </>
  )
}
