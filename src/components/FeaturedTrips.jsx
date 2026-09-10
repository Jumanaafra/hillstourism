'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cachedFetch } from '../lib/cache/clientCache'
import { getOptimizedImageUrl, generateResponsiveSrcSet } from '../lib/cloudinary/transform'
import { packages } from '../data/packages'
import { FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi'

const FILTERS = ['All', 'Couple', 'Family', 'Friends', 'Honeymoon']

export default function FeaturedTrips({ id, initialPackages }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [pkgList, setPkgList] = useState(
    Array.isArray(initialPackages) && initialPackages.length > 0 ? initialPackages : packages
  )
  const [sectionRevealed, setSectionRevealed] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    // Skip fetch when real data was already provided server-side
    if (Array.isArray(initialPackages) && initialPackages.length > 0) return
    cachedFetch('/api/packages')
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPkgList(data.data)
        }
      })
      .catch(() => {})
  }, [initialPackages])

  const filtered = useMemo(() => {
    if (!activeFilter || activeFilter.toLowerCase().trim() === 'all') {
      return pkgList
    }
    const target = activeFilter.toLowerCase().trim()
    return pkgList.filter(p => (p.category || '').toLowerCase().trim() === target)
  }, [pkgList, activeFilter])

  // Scroll reveal
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
  }, [pkgList, activeFilter])

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
              className={`package-card ${sectionRevealed ? 'visible' : 'reveal'}`}
              style={{ transitionDelay: `${i * 0.07}s` }}
              aria-label={`${pkg.title} — ${pkg.destination}`}
            >
              {/* Image */}
              <Link href={`/packages/${pkg.slug || pkg.id}`} style={{ display: 'block', textDecoration: 'none' }} tabIndex={-1}>
                <div className="package-card-img">
                  <img
                    src={getOptimizedImageUrl(pkg.image, { width: 640, crop: 'fill' })}
                    srcSet={generateResponsiveSrcSet(pkg.image, [360, 480, 640, 768], { crop: 'fill' })}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                    alt={`${pkg.title} — ${pkg.destination}`}
                    width={640}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    onError={e => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=640&q=75&auto=format'
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
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:          '4px',
                  }}>
                    <FiClock style={{ fontSize: '0.7rem' }} />
                    {pkg.duration}
                  </div>
                </div>
              </Link>

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
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '4px',
                  }}>
                    <FiMapPin style={{ fontSize: '0.75rem', flexShrink: 0 }} />
                    {pkg.destination}
                  </p>
                  <h3 className="heading-sm" style={{ color: 'var(--hill-navy)', marginBottom: '0.5rem' }}>
                    <Link href={`/packages/${pkg.slug || pkg.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {pkg.title}
                    </Link>
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
                  <Link
                    href={`/packages/${pkg.slug || pkg.id}`}
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    aria-label={`View journey details for ${pkg.title}`}
                  >
                    View Journey <FiArrowRight style={{ fontSize: '0.8rem' }} />
                  </Link>
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
