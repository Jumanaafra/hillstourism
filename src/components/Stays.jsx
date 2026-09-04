import React, { useState, useRef, useEffect } from 'react'
import { stays } from '../data/stays'

const FILTERS = ['All', 'Normal', 'Premium', '5 Star']

export default function Stays({ id }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const sectionRef = useRef(null)

  const filtered = activeFilter === 'All'
    ? stays
    : stays.filter(s => s.category === activeFilter)

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

  const categoryColor = {
    'Normal':  '#5F9E2F',
    'Premium': '#0878FF',
    '5 Star':  '#F59E0B',
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Hillstourism stays"
      style={{
        background: 'var(--hill-surface)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 'clamp(2rem,4vw,3.5rem)' }}>
          <p className="eyebrow" style={{ marginBottom: '0.85rem' }}>Curated Stays</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <h2 className="heading-xl" style={{ color: 'var(--hill-navy)' }}>
              Rest in the<br />heart of the hills.
            </h2>
            <p className="body-lg" style={{ color: 'var(--hill-muted)', maxWidth: '360px' }}>
              From cosy homestays to five-star mountain resorts — we match you with the perfect stay.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="reveal"
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem', transitionDelay: '0.08s' }}
          role="tablist"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
              role="tab"
              aria-selected={activeFilter === f}
            >
              {f === '5 Star' ? '⭐ 5 Star' : f}
            </button>
          ))}
        </div>

        {/* Stay cards */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap:                 '1.5rem',
        }}>
          {filtered.map((stay, i) => (
            <article
              key={stay.id}
              className="stay-card reveal"
              style={{ transitionDelay: `${i * 0.07}s` }}
              aria-label={`${stay.name} — ${stay.location}`}
            >
              {/* Image */}
              <div className="stay-card-img">
                <img
                  src={stay.image}
                  alt={stay.name}
                  loading="lazy"
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentNode.style.background = 'linear-gradient(135deg,#001040,#0050C0)'
                  }}
                />
                {/* Category badge */}
                <div style={{ position: 'absolute', top: '0.9rem', left: '0.9rem' }}>
                  <span style={{
                    display:      'inline-block',
                    padding:      '3px 10px',
                    borderRadius: '100px',
                    fontSize:     '0.62rem',
                    fontWeight:   700,
                    color:        '#ffffff',
                    background:   categoryColor[stay.category] || 'var(--hill-navy)',
                    fontFamily:   'var(--font-body)',
                    letterSpacing: '0.08em',
                  }}>
                    {stay.category}
                  </span>
                </div>
                {/* Rating badge */}
                <div style={{
                  position:     'absolute',
                  top:          '0.9rem',
                  right:        '0.9rem',
                  background:   'rgba(0,9,31,0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  padding:      '4px 8px',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '3px',
                }}>
                  <span style={{ color: '#F59E0B', fontSize: '0.7rem' }}>★</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>{stay.rating}</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {stay.location}
                  </p>
                  <h3 className="heading-sm" style={{ color: 'var(--hill-navy)' }}>{stay.name}</h3>
                  <p className="body-sm" style={{ color: 'var(--hill-muted)', marginTop: '0.4rem' }}>{stay.description}</p>
                </div>

                {/* Amenities */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {stay.amenities.slice(0, 3).map(a => (
                    <span key={a} style={{
                      fontSize:     '0.6rem',
                      padding:      '2px 8px',
                      borderRadius: '4px',
                      background:   'var(--hill-surface)',
                      border:       '1px solid var(--hill-border)',
                      color:        'var(--hill-muted)',
                      fontWeight:   500,
                    }}>
                      {a}
                    </span>
                  ))}
                  {stay.amenities.length > 3 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--hill-muted)' }}>+{stay.amenities.length - 3} more</span>
                  )}
                </div>

                {/* Price + CTA */}
                <div style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  paddingTop:     '0.75rem',
                  borderTop:      '1px solid var(--hill-border)',
                  marginTop:      'auto',
                }}>
                  <div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--hill-muted)' }}>From</p>
                    <p style={{
                      fontFamily:   'var(--font-display)',
                      fontSize:     '1.3rem',
                      fontWeight:   700,
                      color:        'var(--hill-navy)',
                      letterSpacing: '-0.02em',
                      lineHeight:   1,
                    }}>
                      {stay.pricePerNight}
                    </p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--hill-muted)' }}>/ night</p>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.7rem' }}
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                    aria-label={`View ${stay.name}`}
                  >
                    View Stay
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
