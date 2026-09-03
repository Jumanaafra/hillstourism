import React, { useRef } from 'react'
import { experiences } from '../data/experiences'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Experiences({ id }) {
  const sectionRef = useRef(null)
  useScrollReveal(sectionRef)

  return (
    <section
      id={id}
      ref={sectionRef}
      className="section-dark section-wrap"
      aria-label="Travel experiences"
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1.5rem', marginBottom:'clamp(2rem,5vw,3.5rem)' }}>
          <div className="reveal">
            <p className="eyebrow" style={{ marginBottom:'0.85rem' }}>What Awaits You</p>
            <h2 className="heading-xl" style={{ color:'#f5f0e8' }}>
              Travel{' '}
              <em style={{ fontStyle:'italic', color:'#c9a84c', fontFamily:'Playfair Display,serif' }}>
                Experiences
              </em>
            </h2>
          </div>
          <p className="body-md reveal" style={{ color:'var(--clr-text-muted)', maxWidth:'380px', flexShrink:0 }}>
            Beyond destinations — we craft the moments that become your most treasured memories.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
          gap:                 'clamp(0.75rem,1.5vw,1rem)',
        }}>
          {experiences.map((exp, i) => (
            <article
              key={exp.id}
              className="experience-card reveal"
              style={{
                transitionDelay: `${i * 0.07}s`,
                /* Vary heights for visual rhythm */
                aspectRatio: i % 3 === 0 ? '3/4' : i % 2 === 0 ? '2/3' : '3/4',
              }}
              aria-label={exp.title}
            >
              <img
                src={exp.image}
                alt={exp.title}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentNode.style.background = 'linear-gradient(160deg, #0c1a0c, #1e3d1e)'
                }}
              />
              <div className="experience-card-overlay" />
              <div className="experience-card-content">
                <div style={{
                  width:'40px', height:'40px',
                  background:'rgba(201,168,76,0.15)',
                  borderRadius:'8px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.2rem',
                  marginBottom:'0.6rem',
                  backdropFilter:'blur(8px)',
                }}>
                  {exp.icon}
                </div>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.15rem', fontWeight:500, color:'#f5f0e8', marginBottom:'0.25rem', lineHeight:1.2 }}>
                  {exp.title}
                </h3>
                <p style={{ fontSize:'0.72rem', color:'rgba(245,240,232,0.55)', fontFamily:'Inter,sans-serif', letterSpacing:'0.06em' }}>
                  {exp.subtitle}
                </p>
                <p style={{
                  fontSize:'0.82rem', color:'rgba(245,240,232,0.7)',
                  fontFamily:'Inter,sans-serif', lineHeight:1.55,
                  marginTop:'0.5rem',
                  maxHeight:0, overflow:'hidden',
                  transition:'max-height 0.4s ease',
                  /* JS class toggling not needed — CSS :hover handles reveal */
                }}
                  className="exp-desc"
                >
                  {exp.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .experience-card:hover .exp-desc {
          max-height: 80px !important;
        }
      `}</style>
    </section>
  )
}
