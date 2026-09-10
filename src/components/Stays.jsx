'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { cachedFetch } from '../lib/cache/clientCache'
import { getOptimizedImageUrl } from '../lib/cloudinary/transform'
import { stays } from '../data/stays'
import { FiStar, FiMapPin, FiArrowRight } from 'react-icons/fi'

const FILTERS = ['All', 'Normal', 'Premium', '5 Star']

export default function Stays({ id }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [stayList, setStayList] = useState(stays)
  const [sectionRevealed, setSectionRevealed] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    cachedFetch('/api/hotels')
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setStayList(data.data)
        }
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (!activeFilter || activeFilter.toLowerCase().trim() === 'all') {
      return stayList
    }
    const target = activeFilter.toLowerCase().trim()
    return stayList.filter(s => (s.category || '').toLowerCase().trim() === target)
  }, [stayList, activeFilter])

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal') || []
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          setSectionRevealed(true)
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.08 }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [stayList, activeFilter])

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
              {f === '5 Star' ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiStar /> 5 Star</span> : f}
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
              className={`stay-card ${sectionRevealed ? 'visible' : 'reveal'}`}
              style={{ transitionDelay: `${i * 0.07}s` }}
              aria-label={`${stay.name} — ${stay.location}`}
            >
              {/* Image */}
              <div className="stay-card-img">
                <img
                  src={getOptimizedImageUrl(stay.image, 600)}
                  alt={stay.name}
                  loading="lazy"
                  decoding="async"
                  onError={e => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=75&auto=format'
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
                  <span style={{ color: '#F59E0B', fontSize: '0.75rem', display: 'flex' }}><FiStar /></span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>{stay.rating}</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiMapPin style={{ fontSize: '0.75rem', flexShrink: 0 }} />
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
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                    aria-label={`View ${stay.name}`}
                  >
                    View Stay <FiArrowRight style={{ fontSize: '0.75rem' }} />
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
