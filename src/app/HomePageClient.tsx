'use client'

import React, { useState } from 'react'
import type { Package, Hotel, Vehicle, SiteSettings, Category, Experience, Testimonial } from '@/types/domain'
import type { GalleryPhoto } from '@/lib/repositories/gallery.repo'
// Layout & Section components — static imports to preserve full SSR document height
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import LazyHillGuide from '@/components/LazyHillGuide'
import Journey from '@/components/Journey'
import TripFinder from '@/components/TripFinder'
import StatsStrip from '@/components/StatsStrip'
import TripCategoryCarousel from '@/components/TripCategoryCarousel'
import FeaturedTrips from '@/components/FeaturedTrips'
import Experiences from '@/components/Experiences'
import WhyChooseUs from '@/components/WhyChooseUs'
import Gallery from '@/components/Gallery'
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
  initialCategories?: Category[]
  initialExperiences?: Experience[]
  initialTestimonials?: Testimonial[]
}

export default function HomePageClient({
  initialPackages,
  initialHotels,
  initialVehicles,
  initialGalleryPhotos,
  initialSettings,
  initialCategories,
  initialExperiences,
  initialTestimonials,
}: HomePageClientProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    const el = document.getElementById('contact')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Navigation */}
      <Navbar whatsappUrl={initialSettings?.whatsappNumber ? `https://wa.me/${initialSettings.whatsappNumber.replace(/[^0-9]/g, '')}` : undefined} />

      <main id="home" tabIndex={-1}>
        {/* 1. Hero — 100-frame cinematic scroll sequence */}
        <Hero id="home" />

        {/* 2. Journey — parallax destination intro */}
        <Journey id="journey" />

        {/* 3. Trip Finder — interactive package matcher */}
        <TripFinder id="trip-finder" initialPackages={initialPackages} />

        {/* 4. Statistics strip */}
        <StatsStrip id="stats-strip" settings={initialSettings} />

        {/* 5. Trip Types — 3D carousel */}
        <TripCategoryCarousel id="journeys" initialCategories={initialCategories} />

        {/* 6. Featured Packages */}
        <FeaturedTrips id="packages" initialPackages={initialPackages} />

        {/* 7. Experiences — editorial layout */}
        <Experiences id="experiences" initialExperiences={initialExperiences} />

        {/* 8. Gallery — asymmetric masonry */}
        <Gallery id="gallery" initialPhotos={initialGalleryPhotos} />

        {/* 9. Why Hillstourism */}
        <WhyChooseUs id="about" />

        {/* 10. Testimonials */}
        <Testimonials id="testimonials" initialTestimonials={initialTestimonials} />

        {/* 11. Stays */}
        <Stays id="stays" initialHotels={initialHotels} />

        {/* 12. Smart Stay Matching */}
        <SmartStayMatcher id="smart-stay" initialHotels={initialHotels} />

        {/* 13. Vehicles */}
        <Vehicles
          id="vehicles"
          initialVehicles={initialVehicles}
          onSelectVehicle={handleSelectVehicle}
        />

        {/* 14. Trip Enquiry */}
        <Enquiry
          id="contact"
          initialVehicleId={selectedVehicleId}
          initialPackages={initialPackages}
          initialHotels={initialHotels}
          initialVehicles={initialVehicles}
          whatsappNumber={initialSettings?.whatsappNumber}
        />
      </main>

      {/* Footer */}
      <Footer id="footer" settings={initialSettings} />

      {/* HillGuide grounded chatbot */}
      <LazyHillGuide />
    </>
  )
}
