import React, { useRef } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function FinalCTA() {
  const sectionRef = useRef(null)
  useScrollReveal(sectionRef)

  return (
    <section
      ref={sectionRef}
      aria-label="Plan your trip"
      style={{
        position:   'relative',
        overflow:   'hidden',
        minHeight:  'clamp(420px, 60vh, 680px)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background image */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format) center/cover no-repeat',
        zIndex:     0,
        transform:  'scale(1.05)',
        filter:     'brightness(0.35)',
      }} aria-hidden="true" />

      {/* Gold tint overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, rgba(8,15,8,0.6) 70%)',
      }} aria-hidden="true" />

      {/* Content */}
      <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'clamp(2rem,5vw,4rem) clamp(1.25rem,5vw,3rem)', maxWidth:'800px', margin:'0 auto' }}>
        <p className="eyebrow reveal" style={{ marginBottom:'1.2rem' }}>
          Begin Your Journey
        </p>

        <h2
          className="reveal"
          style={{
            fontFamily:   'Playfair Display, serif',
            fontSize:     'clamp(2.5rem,6vw,5.5rem)',
            fontWeight:   500,
            color:        '#f5f0e8',
            lineHeight:   1.08,
            marginBottom: '1.25rem',
            letterSpacing:'-0.02em',
          }}
        >
          Your next story{' '}
          <br />
          <em style={{ color:'#c9a84c', fontStyle:'italic' }}>starts here.</em>
        </h2>

        <p
          className="reveal"
          style={{
            fontFamily:   'Crimson Text, serif',
            fontStyle:    'italic',
            fontSize:     'clamp(1.1rem,2vw,1.35rem)',
            color:        'rgba(245,240,232,0.72)',
            marginBottom: '2.5rem',
            lineHeight:   1.65,
            transitionDelay:'0.1s',
          }}
        >
          Let us craft a journey worthy of the life you're building.
          <br />
          Every peak, every moment — designed around you.
        </p>

        <div
          className="reveal"
          style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', transitionDelay:'0.2s' }}
        >
          <a
            href="#contact"
            className="btn-primary"
            style={{ fontSize:'0.82rem', padding:'1rem 2.2rem' }}
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#contact')?.scrollIntoView({ behavior:'smooth' })
            }}
          >
            Plan My Trip
          </a>
          <a
            href={`https://wa.me/919999000000?text=Hi! I'm interested in planning a trip with HillsTourism.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ fontSize:'0.82rem', padding:'1rem 2.2rem' }}
            aria-label="Chat with us on WhatsApp"
          >
            💬 Talk to Us
          </a>
        </div>

        {/* Trust line */}
        <p
          className="reveal"
          style={{
            marginTop:     '2rem',
            fontSize:      '0.72rem',
            color:         'rgba(245,240,232,0.35)',
            fontFamily:    'Inter,sans-serif',
            letterSpacing: '0.15em',
            transitionDelay:'0.3s',
          }}
        >
          NO HIDDEN FEES · FULLY CUSTOMISABLE · EXPERT LOCAL GUIDES
        </p>
      </div>
    </section>
  )
}
