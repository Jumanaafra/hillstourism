import React, { useRef, useState } from 'react'
import { testimonials } from '../data/testimonials'
import { useScrollReveal } from '../hooks/useScrollReveal'

function StarRating({ rating }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">{i < rating ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

export default function Testimonials({ id }) {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  useScrollReveal(sectionRef)

  const current = testimonials[active]

  return (
    <section
      id={id}
      ref={sectionRef}
      className="section-alt section-wrap"
      aria-label="Traveler stories"
      style={{ position:'relative', overflow:'hidden' }}
    >
      {/* Background quotation mark */}
      <div aria-hidden="true" style={{
        position:  'absolute',
        top:       '-2rem',
        left:      '3rem',
        fontSize:  'clamp(12rem,20vw,22rem)',
        lineHeight:1,
        color:     'rgba(201,168,76,0.04)',
        fontFamily:'Playfair Display,serif',
        fontWeight:700,
        userSelect:'none',
        pointerEvents:'none',
        zIndex:0,
      }}>
        "
      </div>

      <div className="section-inner" style={{ position:'relative', zIndex:1 }}>
        {/* Header */}
        <div className="section-header reveal" style={{ textAlign:'center' }}>
          <p className="eyebrow" style={{ marginBottom:'0.85rem' }}>Real Journeys</p>
          <h2 className="heading-xl" style={{ color:'#f5f0e8' }}>
            Traveler Stories
          </h2>
        </div>

        {/* Featured quote */}
        <div className="reveal" style={{
          maxWidth:       '760px',
          margin:         '0 auto 3rem',
          textAlign:      'center',
          padding:        '2.5rem',
          background:     'rgba(12,26,12,0.5)',
          borderRadius:   '16px',
          border:         '1px solid var(--clr-border)',
          position:       'relative',
        }}>
          <div style={{ marginBottom:'1.25rem', display:'flex', justifyContent:'center' }}>
            <StarRating rating={current.rating} />
          </div>
          <blockquote style={{
            fontFamily:  'Crimson Text, serif',
            fontSize:    'clamp(1.1rem,2vw,1.4rem)',
            fontStyle:   'italic',
            color:       '#f5f0e8',
            lineHeight:  1.7,
            marginBottom:'1.75rem',
          }}>
            "{current.review}"
          </blockquote>
          <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', justifyContent:'center' }}>
            <div style={{
              width:'48px', height:'48px', borderRadius:'50%',
              overflow:'hidden', border:'2px solid rgba(201,168,76,0.4)',
              flexShrink:0,
            }}>
              <img
                src={current.avatar}
                alt={current.name}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentNode.style.background = '#1e3d1e'
                  e.target.parentNode.innerHTML = `<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-size:1rem;color:#c9a84c;font-weight:600;">${current.initials}</span>`
                }}
              />
            </div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontFamily:'Inter,sans-serif', fontSize:'0.9rem', fontWeight:600, color:'#f5f0e8' }}>{current.name}</p>
              <p style={{ fontFamily:'Inter,sans-serif', fontSize:'0.72rem', color:'var(--clr-accent)', letterSpacing:'0.06em' }}>{current.trip}</p>
              <p style={{ fontFamily:'Inter,sans-serif', fontSize:'0.7rem', color:'var(--clr-text-muted)' }}>{current.location}</p>
            </div>
          </div>
        </div>

        {/* All cards mini-grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap:                 'clamp(0.75rem,2vw,1.25rem)',
        }}>
          {testimonials.map((t, i) => (
            <article
              key={t.id}
              className={`testimonial-card reveal ${i === active ? 'active-testimonial' : ''}`}
              style={{
                transitionDelay: `${i * 0.07}s`,
                cursor:          'pointer',
                borderColor:     i === active ? 'rgba(201,168,76,0.45)' : undefined,
              }}
              onClick={() => setActive(i)}
              onKeyDown={(e) => e.key === 'Enter' && setActive(i)}
              tabIndex={0}
              role="button"
              aria-label={`Read ${t.name}'s story about ${t.trip}`}
              aria-pressed={i === active}
            >
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                <div style={{
                  width:'40px', height:'40px', borderRadius:'50%',
                  overflow:'hidden', border:'1px solid rgba(201,168,76,0.3)',
                  flexShrink:0,
                }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentNode.style.cssText += ';background:#1e3d1e;display:flex;align-items:center;justify-content:center;'
                      e.target.parentNode.innerHTML = `<span style="font-family:Inter,sans-serif;font-size:0.85rem;color:#c9a84c;font-weight:600;">${t.initials}</span>`
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize:'0.82rem', fontWeight:600, color:'#f5f0e8', fontFamily:'Inter,sans-serif' }}>{t.name}</p>
                  <p style={{ fontSize:'0.65rem', color:'var(--clr-accent)', fontFamily:'Inter,sans-serif', letterSpacing:'0.05em' }}>{t.location}</p>
                </div>
              </div>
              <StarRating rating={t.rating} />
              <p style={{ fontSize:'0.82rem', color:'rgba(245,240,232,0.6)', fontFamily:'Inter,sans-serif', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                "{t.review}"
              </p>
              <p style={{ fontSize:'0.65rem', color:'var(--clr-text-muted)', fontFamily:'Inter,sans-serif', letterSpacing:'0.05em', marginTop:'auto' }}>
                {t.trip}
              </p>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .active-testimonial {
          border-color: rgba(201,168,76,0.5) !important;
          background: rgba(20,38,20,0.7) !important;
        }
      `}</style>
    </section>
  )
}
