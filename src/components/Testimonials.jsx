import React, { useState, useRef, useEffect } from 'react'
import { testimonials } from '../data/testimonials'

function StarRating({ rating }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true" style={{ color: i < rating ? '#F59E0B' : '#D1D5DB' }}>★</span>
      ))}
    </div>
  )
}

export default function Testimonials({ id }) {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const current = testimonials[active]

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
      aria-label="Traveler stories"
      style={{
        background: 'var(--hill-surface)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* Decorative large quote */}
      <div aria-hidden="true" style={{
        position:    'absolute',
        top:         '-1rem',
        left:        '3rem',
        fontSize:    'clamp(10rem,18vw,18rem)',
        lineHeight:  1,
        color:       'rgba(8,120,255,0.05)',
        fontFamily:  'var(--font-display)',
        fontWeight:  800,
        userSelect:  'none',
        pointerEvents: 'none',
        zIndex:      0,
      }}>
        "
      </div>

      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,5vw,4rem)' }}>
          <p className="eyebrow" style={{ marginBottom: '0.85rem' }}>Real Journeys</p>
          <h2 className="heading-xl" style={{ color: 'var(--hill-navy)' }}>
            Stories from the hills.
          </h2>
        </div>

        {/* Featured large testimonial */}
        <div className="reveal" style={{ transitionDelay: '0.08s' }}>
          <div style={{
            maxWidth:     '800px',
            margin:       '0 auto 3rem',
            textAlign:    'center',
            padding:      'clamp(2rem,4vw,3rem)',
            background:   '#ffffff',
            borderRadius: '20px',
            border:       '1px solid var(--hill-border)',
            boxShadow:    '0 16px 60px rgba(0,16,64,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <StarRating rating={current.rating} />
            </div>
            <blockquote style={{
              fontFamily:   'var(--font-display)',
              fontSize:     'clamp(1.05rem,1.8vw,1.3rem)',
              fontStyle:    'italic',
              color:        'var(--hill-text)',
              lineHeight:   1.75,
              marginBottom: '1.75rem',
              fontWeight:   400,
            }}>
              "{current.review}"
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', justifyContent: 'center' }}>
              <div style={{
                width:        '48px', height: '48px', borderRadius: '50%',
                overflow:     'hidden', border: '2px solid var(--hill-border-blue)', flexShrink: 0,
              }}>
                <img
                  src={current.avatar}
                  alt={current.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    e.target.style.display = 'none'
                    const parent = e.target.parentNode
                    parent.style.cssText += ';background:var(--hill-blue-glow);display:flex;align-items:center;justify-content:center;'
                    parent.innerHTML = `<span style="font-size:1rem;font-weight:700;color:var(--hill-blue-bright);">${current.initials}</span>`
                  }}
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--hill-navy)' }}>{current.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--hill-blue-bright)', fontWeight: 600 }}>{current.trip}</p>
                <p style={{ fontSize: '0.68rem', color: 'var(--hill-muted)' }}>{current.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini cards grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap:                 '1rem',
        }}>
          {testimonials.map((t, i) => (
            <article
              key={t.id}
              className={`testimonial-card reveal ${i === active ? 'active-testimonial' : ''}`}
              style={{
                transitionDelay: `${i * 0.07}s`,
                cursor:         'pointer',
                background:     i === active ? '#ffffff' : '#ffffff',
                borderColor:    i === active ? 'var(--hill-blue-bright)' : 'var(--hill-border)',
                boxShadow:      i === active ? '0 8px 32px rgba(8,120,255,0.12)' : 'none',
              }}
              onClick={() => setActive(i)}
              onKeyDown={e => e.key === 'Enter' && setActive(i)}
              tabIndex={0}
              role="button"
              aria-label={`Read ${t.name}'s story about ${t.trip}`}
              aria-pressed={i === active}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  overflow: 'hidden', border: `1.5px solid ${i === active ? 'var(--hill-border-blue)' : 'var(--hill-border)'}`,
                  flexShrink: 0, background: 'var(--hill-surface)',
                }}>
                  <img
                    src={t.avatar} alt={t.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    loading="lazy"
                    onError={e => {
                      e.target.style.display = 'none'
                      const parent = e.target.parentNode
                      parent.style.cssText += ';display:flex;align-items:center;justify-content:center;'
                      parent.innerHTML = `<span style="font-size:0.85rem;font-weight:700;color:var(--hill-blue-bright);">${t.initials}</span>`
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--hill-navy)' }}>{t.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--hill-muted)' }}>{t.location}</p>
                </div>
              </div>
              <StarRating rating={t.rating} />
              <p style={{
                fontSize: '0.82rem', color: 'var(--hill-muted)', lineHeight: 1.55,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                "{t.review}"
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 600, letterSpacing: '0.04em', marginTop: 'auto' }}>
                {t.trip}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
