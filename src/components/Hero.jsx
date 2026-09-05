import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useScrollFrameSequence, TOTAL_FRAMES } from '../hooks/useFrameSequence'

export default function Hero({ id }) {
  const containerRef       = useRef(null)
  const pinRef             = useRef(null)
  const canvasRef          = useRef(null)
  const frameNumberRef     = useRef(null)
  const progressBarRef     = useRef(null)
  const contentRef         = useRef(null)
  const scrollIndicatorRef = useRef(null)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // High-performance progress callback without triggering React re-renders
  // Note: Hero content remains 100% visible and centered from Frame 001 through Frame 099
  const handleProgress = useCallback((frameIndex, progress) => {
    // 1. Update frame counter number (strictly clamped 001 to 099)
    if (frameNumberRef.current) {
      const frameNum = Math.min(99, Math.max(1, Math.round(progress * 98) + 1))
      const display = String(frameNum).padStart(3, '0')
      if (frameNumberRef.current.textContent !== display) {
        frameNumberRef.current.textContent = display
      }
    }

    // 2. Update thin progress bar width
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${(progress * 100).toFixed(1)}%`
    }

    // 3. Scroll indicator fades out once user begins scrolling
    if (scrollIndicatorRef.current) {
      if (progress > 0.05) {
        const fadeOut = Math.max(0, 1 - (progress - 0.05) / 0.10)
        scrollIndicatorRef.current.style.opacity = fadeOut.toFixed(3)
      } else {
        scrollIndicatorRef.current.style.opacity = '1'
      }
    }
  }, [])

  // Wire GSAP ScrollTrigger pinning and frame scrubbing
  useScrollFrameSequence(
    canvasRef,
    containerRef,
    pinRef,
    handleProgress,
    !prefersReducedMotion
  )

  const scrollToJourney = (e) => {
    e?.preventDefault()
    const el = document.querySelector('#journey')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToPlanner = (e) => {
    e?.preventDefault()
    const el = document.querySelector('#trip-finder')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id={id}
      ref={containerRef}
      className="hero-scroll-container"
      aria-label="Hillstourism — Cinematic mountain introduction"
    >
      {/* ── Inner Hero Pin (Locked to Viewport by GSAP) ── */}
      <div ref={pinRef} className="hero-pin">

        {/* Reduced-motion fallback: static mountain landscape */}
        {prefersReducedMotion && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/frames/frame_050_delay-0.1s.gif)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            role="img"
            aria-label="Mountain landscape — Hillstourism"
          />
        )}

        {/* Cinematic Canvas: 290-frame scroll-controlled sequence */}
        {!prefersReducedMotion && (
          <canvas
            ref={canvasRef}
            className="hero-canvas"
            aria-hidden="true"
          />
        )}

        {/* Balanced radial & linear overlays for text contrast while preserving cinematic background */}
        <div className="hero-overlay-top" aria-hidden="true" />
        <div className="hero-overlay-center" aria-hidden="true" />
        <div className="hero-overlay-bottom" aria-hidden="true" />

        {/* ── Truly Centered Hero Content (Persistent Overlay from Frame 001 to Frame 290) ── */}
        <div
          ref={contentRef}
          className="hero-content"
          style={{
            animation: 'heroContentReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
          }}
        >
          {/* Subtle metadata eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              marginBottom: '0.9rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--hill-blue-bright)',
                boxShadow: '0 0 10px var(--hill-blue-bright)',
                display: 'inline-block',
              }}
            />
            <p className="hero-eyebrow">
              Local Hill Experts · Est. 2018
            </p>
          </div>

          {/* Cinematic Editorial Heading */}
          <h1 className="hero-heading">
            Discover the Hills{' '}
            <span style={{ display: 'block', color: 'rgba(255, 255, 255, 0.95)' }}>
              Beyond the
            </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #0878FF 15%, #5CB0FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ordinary.
            </span>
          </h1>

          {/* Refined Supporting Copy */}
          <p className="hero-description">
            Cinematic journeys through India's most breathtaking mountains.
            Curated escapes crafted by people who call the hills home.
          </p>

          {/* Centered Action CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.9rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn-hero-primary"
              onClick={scrollToJourney}
            >
              <span>Explore Journey</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <button
              className="btn-hero-secondary"
              onClick={scrollToPlanner}
            >
              Plan Your Trip
            </button>
          </div>
        </div>

        {/* ── Frame counter — bottom right ── */}
        {!prefersReducedMotion && (
          <div
            className="hero-frame-counter"
            aria-live="polite"
            aria-label="Cinematic sequence frame counter"
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.20em',
                color: 'rgba(255, 255, 255, 0.45)',
                textTransform: 'uppercase',
              }}
            >
              Sequence
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                ref={frameNumberRef}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.92)',
                  letterSpacing: '-0.02em',
                }}
              >
                001
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.72rem' }}>/</span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  color: 'rgba(255, 255, 255, 0.38)',
                }}
              >
                099
              </span>
            </div>

            {/* Micro Progress Track */}
            <div
              style={{
                width: '44px',
                height: '1.5px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '1px',
                overflow: 'hidden',
              }}
            >
              <div
                ref={progressBarRef}
                style={{
                  height: '100%',
                  width: '0%',
                  background: 'var(--hill-blue-bright)',
                  borderRadius: '1px',
                  transition: 'width 0.05s linear',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Scroll indicator — bottom center ── */}
        <div
          ref={scrollIndicatorRef}
          className="hero-scroll-indicator"
          aria-hidden="true"
          style={{
            transition: 'opacity 0.25s ease-out',
            willChange: 'opacity',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.56rem',
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: 'rgba(255, 255, 255, 0.50)',
              textTransform: 'uppercase',
            }}
          >
            Scroll to experience
          </span>
          <div
            style={{
              width: '1.5px',
              height: '32px',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent)',
              animation: 'scrollPulse 1.8s ease-in-out infinite',
            }}
          />
        </div>

      </div>

      {/* Hero-specific animations */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.35; transform: scaleY(0.9); }
          50%       { opacity: 1;    transform: scaleY(1.1); }
        }
        @keyframes heroContentReveal {
          0%   { opacity: 0; transform: translate(-50%, -46%); }
          100% { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </section>
  )
}
