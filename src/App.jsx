import React, { useState, useEffect } from 'react'
import './index.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Layout
import Navbar        from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import Footer        from './components/Footer'
import HillGuide     from './components/HillGuide'

// Sections (in SDD-specified order)
import Hero                from './components/Hero'
import Journey             from './components/Journey'
import TripFinder          from './components/TripFinder'
import StatsStrip          from './components/StatsStrip'
import TripCategoryCarousel from './components/TripCategoryCarousel'
import FeaturedTrips       from './components/FeaturedTrips'
import Experiences         from './components/Experiences'
import Gallery             from './components/Gallery'
import WhyChooseUs         from './components/WhyChooseUs'
import Testimonials        from './components/Testimonials'
import Stays               from './components/Stays'
import SmartStayMatcher    from './components/SmartStayMatcher'
import Vehicles            from './components/Vehicles'
import Enquiry             from './components/Enquiry'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [loading, setLoading] = useState(true)

  // GSAP ScrollTrigger refresh on resize
  useEffect(() => {
    const handleResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />
  }

  return (
    <>
      {/* Fixed navigation */}
      <Navbar />

      <main id="home" tabIndex={-1}>
        {/* ── 1. Hero — 290-frame cinematic scroll sequence ── */}
        <Hero id="home" />

        {/* ── 2. Journey — parallax destination intro ── */}
        <Journey id="journey" />

        {/* ── 3. Trip Finder — interactive package matcher ── */}
        <TripFinder id="trip-finder" />

        {/* ── 4. Statistics strip ── */}
        <StatsStrip id="stats-strip" />

        {/* ── 5. Trip Types — 3D carousel ── */}
        <TripCategoryCarousel id="journeys" />

        {/* ── 6. Featured Packages ── */}
        <FeaturedTrips id="packages" />

        {/* ── 7. Experiences — editorial layout ── */}
        <Experiences id="experiences" />

        {/* ── 8. Gallery — asymmetric masonry ── */}
        <Gallery id="gallery" />

        {/* ── 9. Why Hillstourism ── */}
        <WhyChooseUs id="about" />

        {/* ── 10. Testimonials ── */}
        <Testimonials id="testimonials" />

        {/* ── 11. Stays ── */}
        <Stays id="stays" />

        {/* ── 12. Smart Stay Matching ── */}
        <SmartStayMatcher id="smart-stay" />

        {/* ── 13. Vehicles ── */}
        <Vehicles id="vehicles" />

        {/* ── 14. Trip Enquiry ── */}
        <Enquiry id="contact" />
      </main>

      {/* Footer */}
      <Footer id="footer" />

      {/* HillGuide floating chatbot */}
      <HillGuide />
    </>
  )
}
