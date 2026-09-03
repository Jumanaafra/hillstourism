import React, { useRef } from 'react'
import { useFrameSequence } from '../hooks/useFrameSequence'

export default function Hero({ id }) {
  const sectionRef = useRef(null)
  const canvasRef  = useRef(null)

  /* Start frame sequence loop on canvas */
  useFrameSequence(canvasRef, sectionRef, true)

  return (
    <section
      id={id}
      ref={sectionRef}
      className="hero-section"
      aria-label="Hero — HillsTourism cinematic introduction"
    >
      <div className="hero-sticky">
        {/* Canvas — 290 frame cinematic animation */}
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          aria-hidden="true"
          role="img"
          aria-label="Cinematic hill destination animation"
        />

        {/* Ambient gradient overlay */}
        <div className="hero-overlay" aria-hidden="true" />

        {/* Scroll hint indicator */}
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            bottom:        '5%',
            left:          '50%',
            transform:     'translateX(-50%)',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           '8px',
            opacity:       0.7,
            zIndex:        10,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily:    'Inter, sans-serif',
              fontSize:      '0.62rem',
              letterSpacing: '0.25em',
              color:         '#f5f0e8',
              textTransform: 'uppercase',
            }}
          >
            Scroll to explore
          </span>
          <div
            style={{
              width:      '1px',
              height:     '36px',
              background: 'linear-gradient(to bottom, rgba(201,168,76,0.7), transparent)',
              animation:  'scrollPulse 1.8s ease-in-out infinite',
            }}
          />
        </div>

        {/* Hero content overlay — instantly visible with premium typography & CTAs */}
        <div
          className="hero-content"
          style={{
            opacity:    1,
            transform:  'translateX(-50%) translateY(0)',
            animation:  'fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
          }}
        >
          <p
            className="eyebrow"
            style={{ marginBottom: '1.2rem', opacity: 0.95 }}
          >
            EXPLORE · EXPERIENCE · REMEMBER
          </p>

          <h1
            className="heading-hero"
            style={{
              color: '#f5f0e8',
              marginBottom: '1.1rem',
              textShadow: '0 4px 30px rgba(0,0,0,0.6)',
            }}
          >
            Travel Beyond the{' '}
            <em
              style={{
                fontStyle:  'italic',
                color:      '#c9a84c',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              Ordinary
            </em>
          </h1>

          <p
            className="body-lg"
            style={{
              color:        'rgba(245,240,232,0.85)',
              marginBottom: '2.2rem',
              maxWidth:     '560px',
              margin:       '0 auto 2.2rem',
              fontFamily:   'Crimson Text, serif',
              fontSize:     'clamp(1.1rem, 1.8vw, 1.35rem)',
              fontStyle:    'italic',
            }}
          >
            Journeys designed for stories worth remembering.
          </p>

          <div
            style={{
              display:        'flex',
              gap:            '1rem',
              justifyContent: 'center',
              flexWrap:       'wrap',
            }}
          >
            <a
              href="#journeys"
              className="btn-primary"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#journeys')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Explore Journeys
            </a>
            <a
              href="#contact"
              className="btn-outline"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Plan Your Trip
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50%      { opacity: 1;   transform: scaleY(1.15); }
        }
      `}</style>
    </section>
  )
}
