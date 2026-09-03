import React, { useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import TripCategoryCarousel from './components/TripCategoryCarousel'
import FeaturedTrips  from './components/FeaturedTrips'
import Experiences    from './components/Experiences'
import Testimonials   from './components/Testimonials'
import Gallery        from './components/Gallery'
import WhyChooseUs    from './components/WhyChooseUs'
import FinalCTA       from './components/FinalCTA'
import Footer         from './components/Footer'

export default function App() {
  const [loadingDone, setLoadingDone] = useState(false)

  return (
    <>
      {!loadingDone && (
        <LoadingScreen onComplete={() => setLoadingDone(true)} />
      )}

      <div
        style={{
          opacity:        loadingDone ? 1 : 0,
          transition:     'opacity 0.7s ease',
          pointerEvents:  loadingDone ? 'all' : 'none',
          visibility:     loadingDone ? 'visible' : 'hidden',
        }}
      >
        <Navbar />

        <main>
          <Hero         id="home" />
          <TripCategoryCarousel id="categories" />
          <FeaturedTrips  id="journeys" />
          <Experiences    id="experiences" />
          <Testimonials   id="stories" />
          <Gallery        id="gallery" />
          <WhyChooseUs    id="about" />
          <FinalCTA />
        </main>

        <Footer id="contact" />
      </div>
    </>
  )
}
