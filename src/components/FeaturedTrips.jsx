import React, { useRef } from 'react'
import { packages } from '../data/packages'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function FeaturedTrips({ id }) {
  const sectionRef = useRef(null)
  useScrollReveal(sectionRef)

  return (
    <section
      id={id}
      ref={sectionRef}
      className="section-alt section-wrap"
      aria-label="Featured travel packages"
    >
      <div className="section-inner">
        {/* Header */}
        <div className="section-header reveal" style={{ textAlign:'center' }}>
          <p className="eyebrow" style={{ marginBottom:'0.85rem' }}>Curated Packages</p>
          <h2 className="heading-xl" style={{ color:'#f5f0e8', marginBottom:'0.75rem' }}>
            Featured Journeys
          </h2>
          <p className="body-lg" style={{ color:'var(--clr-text-muted)', maxWidth:'520px', margin:'0 auto' }}>
            Handcrafted itineraries that take you to the soul of the hills — without the hassle.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))',
          gap:                 'clamp(1rem,2vw,1.5rem)',
        }}>
          {packages.map((pkg, i) => (
            <article
              key={pkg.id}
              className="package-card reveal"
              style={{ transitionDelay: `${i * 0.08}s` }}
              aria-label={`${pkg.title} — ${pkg.destination}`}
            >
              {/* Image */}
              <div className="package-card-img">
                <img
                  src={pkg.image}
                  alt={`${pkg.title} — ${pkg.destination}`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentNode.style.background = 'linear-gradient(135deg, #0c1a0c 0%, #1e3d1e 100%)'
                  }}
                />
                {/* Tag badge */}
                <div style={{
                  position:   'absolute',
                  top:        '1rem',
                  left:       '1rem',
                  background: 'rgba(8,15,8,0.82)',
                  backdropFilter: 'blur(8px)',
                  border:     '1px solid rgba(201,168,76,0.35)',
                  borderRadius: '20px',
                  padding:    '4px 12px',
                  fontSize:   '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color:      '#c9a84c',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {pkg.tag}
                </div>
                {/* Duration badge */}
                <div style={{
                  position:   'absolute',
                  bottom:     '1rem',
                  right:      '1rem',
                  background: 'rgba(201,168,76,0.92)',
                  borderRadius: '4px',
                  padding:    '4px 10px',
                  fontSize:   '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color:      '#0d0d0d',
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  {pkg.duration}
                </div>
              </div>

              {/* Body */}
              <div className="package-card-body">
                <div>
                  <p style={{ fontSize:'0.68rem', color:'var(--clr-accent)', letterSpacing:'0.14em', fontFamily:'Inter,sans-serif', fontWeight:600, textTransform:'uppercase', marginBottom:'0.3rem' }}>
                    {pkg.destination}
                  </p>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.3rem', fontWeight:500, color:'#f5f0e8', marginBottom:'0.5rem', lineHeight:1.2 }}>
                    {pkg.title}
                  </h3>
                  <p style={{ fontSize:'0.85rem', color:'rgba(245,240,232,0.6)', fontFamily:'Inter,sans-serif', lineHeight:1.6 }}>
                    {pkg.description}
                  </p>
                </div>

                {/* Highlights */}
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                  {pkg.highlights.map(h => (
                    <span key={h} style={{
                      fontSize:   '0.62rem',
                      fontFamily: 'Inter,sans-serif',
                      color:      'rgba(245,240,232,0.5)',
                      background: 'rgba(245,240,232,0.05)',
                      border:     '1px solid rgba(245,240,232,0.1)',
                      borderRadius: '3px',
                      padding:    '2px 8px',
                    }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  flexWrap:       'wrap',
                  gap:            '0.75rem',
                  marginTop:      'auto',
                  paddingTop:     '0.75rem',
                  borderTop:      '1px solid var(--clr-border)',
                }}>
                  <div>
                    <p style={{ fontSize:'0.65rem', color:'var(--clr-text-muted)', fontFamily:'Inter,sans-serif', letterSpacing:'0.08em' }}>Starting from</p>
                    <p style={{ fontFamily:'Playfair Display,serif', fontSize:'1.5rem', fontWeight:600, color:'#c9a84c', lineHeight:1 }}>
                      {pkg.price}
                    </p>
                    <p style={{ fontSize:'0.62rem', color:'var(--clr-text-muted)', fontFamily:'Inter,sans-serif' }}>{pkg.priceNote}</p>
                  </div>
                  <a
                    href="#contact"
                    className="btn-primary"
                    style={{ padding:'0.65rem 1.2rem', fontSize:'0.7rem' }}
                    onClick={(e) => {
                      e.preventDefault()
                      document.querySelector('#contact')?.scrollIntoView({ behavior:'smooth' })
                    }}
                    aria-label={`Enquire about ${pkg.title}`}
                  >
                    Explore Journey
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View all CTA */}
        <div style={{ textAlign:'center', marginTop:'3rem' }} className="reveal">
          <a
            href="#contact"
            className="btn-outline"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#contact')?.scrollIntoView({ behavior:'smooth' })
            }}
          >
            View All Packages →
          </a>
        </div>
      </div>
    </section>
  )
}
