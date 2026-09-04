import React, { useRef, useEffect } from 'react'
import { vehicles } from '../data/vehicles'

export default function Vehicles({ id }) {
  const sectionRef = useRef(null)

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal') || []
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const Feature = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.85rem' }} aria-hidden="true">{icon}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--hill-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  )

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Hillstourism vehicles"
      style={{
        background: 'var(--hill-white)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 'clamp(2.5rem,5vw,4rem)' }}>
          <p className="eyebrow" style={{ marginBottom: '0.85rem' }}>Transportation</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <h2 className="heading-xl" style={{ color: 'var(--hill-navy)' }}>
              Every road,<br />comfortably.
            </h2>
            <p className="body-lg" style={{ color: 'var(--hill-muted)', maxWidth: '360px' }}>
              Hill-experienced drivers, local route knowledge, flexible pickup — your journey starts from the moment you step in.
            </p>
          </div>
        </div>

        {/* Vehicle grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap:                 'clamp(1rem,2vw,1.5rem)',
        }}>
          {vehicles.map((v, i) => (
            <article
              key={v.id}
              className="vehicle-card reveal"
              style={{ transitionDelay: `${i * 0.08}s` }}
              aria-label={`${v.name} — ${v.type}`}
            >
              {/* Vehicle image */}
              <div style={{
                borderRadius: '10px',
                overflow:     'hidden',
                aspectRatio:  '16/9',
                marginBottom: '1.5rem',
                background:   'var(--hill-surface)',
              }}>
                <img
                  src={v.image}
                  alt={v.name}
                  loading="lazy"
                  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentNode.style.background = 'linear-gradient(135deg,#EEF3F8,#DCEBFF)'
                  }}
                />
              </div>

              {/* Type badge */}
              <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>{v.type}</span>

              {/* Name */}
              <h3 className="heading-sm" style={{ color: 'var(--hill-navy)', marginBottom: '0.25rem' }}>
                {v.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright)', fontWeight: 600, marginBottom: '1.25rem' }}>
                {v.idealFor}
              </p>

              {/* Specs */}
              <div style={{
                display:    'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:        '0.6rem',
                padding:    '1rem',
                background: 'var(--hill-surface)',
                borderRadius: '8px',
                marginBottom: '1.25rem',
              }}>
                <Feature icon="👥" label={`${v.capacity} Seats`} />
                <Feature icon="🧳" label={v.luggage} />
                {v.driverAvailable && <Feature icon="🚗" label="Driver Incl." />}
                {v.localRoutes    && <Feature icon="🗺️" label="Hill Routes" />}
                {v.flexiblePickup && <Feature icon="📍" label="Flex Pickup" />}
              </div>

              {/* Features */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {v.features.map(f => (
                  <span key={f} style={{
                    fontSize:     '0.6rem',
                    padding:      '2px 8px',
                    borderRadius: '4px',
                    background:   'var(--hill-surface)',
                    border:       '1px solid var(--hill-border)',
                    color:        'var(--hill-muted)',
                    fontWeight:   500,
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                paddingTop:     '1rem',
                borderTop:      '1px solid var(--hill-border)',
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--hill-navy)' }}>
                  {v.priceNote}
                </p>
                <button
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.1rem', fontSize: '0.7rem' }}
                  onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                  aria-label={`Choose ${v.name}`}
                >
                  Choose
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Note */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: '2.5rem', transitionDelay: '0.3s' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--hill-muted)' }}>
            All vehicles include experienced hill drivers · Flexible pickup & drop · 24/7 support
          </p>
        </div>
      </div>
    </section>
  )
}
