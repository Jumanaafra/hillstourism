import React, { useState, useRef, useEffect } from 'react'
import { packages } from '../data/packages'

const FILTERS = ['All', 'Couple', 'Family', 'Friends', 'Honeymoon']

export default function FeaturedTrips({ id }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const sectionRef = useRef(null)

  const filtered = activeFilter === 'All'
    ? packages
    : packages.filter(p => p.category === activeFilter)

  // Scroll reveal
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

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Curated travel packages"
      style={{
        background: 'var(--hill-white)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 'clamp(2rem,4vw,3.5rem)' }}>
          <p className="eyebrow" style={{ marginBottom: '0.85rem' }}>Curated Packages</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <h2 className="heading-xl" style={{ color: 'var(--hill-navy)' }}>
              Journeys built<br />around you.
            </h2>
            <p className="body-lg" style={{ color: 'var(--hill-muted)', maxWidth: '360px' }}>
              Handcrafted itineraries that take you to the soul of the hills.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div
          className="reveal"
          style={{
            display:      'flex',
            gap:          '0.5rem',
            flexWrap:     'wrap',
            marginBottom: '2.5rem',
            transitionDelay: '0.1s',
          }}
          role="tablist"
          aria-label="Filter packages by category"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
              role="tab"
              aria-selected={activeFilter === f}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Package grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap:                 'clamp(1rem,2vw,1.5rem)',
        }}>
          {filtered.map((pkg, i) => (
            <article
              key={pkg.id}
              className="package-card reveal"
              style={{ transitionDelay: `${i * 0.07}s` }}
              aria-label={`${pkg.title} — ${pkg.destination}`}
            >
              {/* Image */}
              <div className="package-card-img">
                <img
                  src={pkg.image}
                  alt={`${pkg.title} — ${pkg.destination}`}
                  loading="lazy"
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentNode.style.background = 'linear-gradient(135deg, #001040, #0050C0)'
                  }}
                />
                {/* Tag badge */}
                <div style={{
                  position:     'absolute',
                  top:          '0.9rem',
                  left:         '0.9rem',
                }}>
                  <span className="badge badge-navy">{pkg.tag}</span>
                </div>
                {/* Duration */}
                <div style={{
                  position:     'absolute',
                  bottom:       '0.9rem',
                  right:        '0.9rem',
                  background:   'rgba(0,9,31,0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  padding:      '4px 10px',
                  fontSize:     '0.65rem',
                  fontWeight:   700,
                  color:        '#ffffff',
                  fontFamily:   'var(--font-body)',
                  letterSpacing: '0.06em',
                }}>
                  {pkg.duration}
                </div>
              </div>

              {/* Body */}
              <div className="package-card-body">
                <div>
                  <p style={{
                    fontSize:      '0.65rem',
                    color:         'var(--hill-blue-bright)',
                    letterSpacing: '0.14em',
                    fontFamily:    'var(--font-body)',
                    fontWeight:    700,
                    textTransform: 'uppercase',
                    marginBottom:  '0.3rem',
                  }}>
                    {pkg.destination}
                  </p>
                  <h3 className="heading-sm" style={{ color: 'var(--hill-navy)', marginBottom: '0.5rem' }}>
                    {pkg.title}
                  </h3>
                  <p className="body-md" style={{ color: 'var(--hill-muted)', lineHeight: 1.6 }}>
                    {pkg.description}
                  </p>
                </div>

                {/* Highlights */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {pkg.highlights.map(h => (
                    <span key={h} style={{
                      fontSize:     '0.6rem',
                      fontFamily:   'var(--font-body)',
                      color:        'var(--hill-muted)',
                      background:   'var(--hill-surface)',
                      border:       '1px solid var(--hill-border)',
                      borderRadius: '4px',
                      padding:      '2px 8px',
                      fontWeight:   500,
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
                  paddingTop:     '1rem',
                  borderTop:      '1px solid var(--hill-border)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.62rem', color: 'var(--hill-muted)', fontFamily: 'var(--font-body)' }}>Starting from</p>
                    <p style={{
                      fontFamily:   'var(--font-display)',
                      fontSize:     '1.4rem',
                      fontWeight:   700,
                      color:        'var(--hill-navy)',
                      letterSpacing: '-0.03em',
                      lineHeight:   1,
                    }}>
                      {pkg.price}
                    </p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--hill-muted)' }}>{pkg.priceNote}</p>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                    aria-label={`Enquire about ${pkg.title}`}
                  >
                    View Journey →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View all */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem', transitionDelay: '0.3s' }}>
          <button
            className="btn-outline"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request a Custom Package
          </button>
        </div>
      </div>
    </section>
  )
}
