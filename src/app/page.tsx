'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Critical Above-The-Fold & Layout components
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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HomePage() {
  const [showLoader, setShowLoader] = useState(true)

  // Use isomorphic layout effect to avoid a flash of the loading screen on return visits
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

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

  // GSAP ScrollTrigger refresh on resize
  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        <TripFinder id="trip-finder" />

        {/* 4. Statistics strip */}
        <StatsStrip id="stats-strip" />

        {/* 5. Trip Types — 3D carousel */}
        <TripCategoryCarousel id="journeys" />

        {/* 6. Featured Packages */}
        <FeaturedTrips id="packages" />

        {/* 7. Experiences — editorial layout */}
        <Experiences id="experiences" />

        {/* 8. Gallery — asymmetric masonry */}
        <Gallery id="gallery" />

        {/* 9. Why Hillstourism */}
        <WhyChooseUs id="about" />

        {/* 10. Testimonials */}
        <Testimonials id="testimonials" />

        {/* 11. Stays */}
        <Stays id="stays" />

        {/* 12. Smart Stay Matching */}
        <SmartStayMatcher id="smart-stay" />

        {/* 13. Vehicles */}
        <Vehicles id="vehicles" />

        {/* 14. Trip Enquiry */}
        <Enquiry id="contact" />
      </main>

      {/* Footer */}
      <Footer id="footer" />

      {/* HillGuide grounded chatbot */}
      <HillGuide />
    </>
  )
}
