import React, { useState, useRef, useEffect } from 'react'
import { experiences } from '../data/experiences'

export default function Experiences({ id }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [imgKey,    setImgKey]    = useState(0)
  const sectionRef = useRef(null)
  const active     = experiences[activeIdx]

  // Scroll reveal
  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal, .reveal-left') || []
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleSelect = (idx) => {
    if (idx === activeIdx) return
    setImgKey(k => k + 1)
    setActiveIdx(idx)
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Hillstourism experiences"
      style={{
        background: 'var(--hill-navy-deep)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
        overflow:   'hidden',
      }}
    >
      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 'clamp(2.5rem,5vw,4rem)' }}>
          <p className="eyebrow-light" style={{ marginBottom: '0.85rem' }}>Beyond the Trail</p>
          <h2 className="heading-xl" style={{ color: '#ffffff', maxWidth: '540px' }}>
            Experiences that{' '}
            <span style={{ color: 'var(--hill-blue-bright)' }}>stay with you.</span>
          </h2>
        </div>

        {/* Editorial layout: large image + list */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr clamp(280px, 30vw, 420px)',
          gap:                 'clamp(2rem,5vw,5rem)',
          alignItems:          'stretch',
        }}>

          {/* ── Large Active Image ── */}
          <div
            className="reveal"
            style={{ transitionDelay: '0.08s', position: 'relative' }}
          >
            <div style={{
              borderRadius: '16px',
              overflow:     'hidden',
              height:       'clamp(380px, 60vh, 620px)',
              position:     'relative',
            }}>
              <img
                key={imgKey}
                src={active.image}
                alt={active.title}
                loading="lazy"
                style={{
                  width:      '100%',
                  height:     '100%',
                  objectFit:  'cover',
                  animation:  'imgReveal 0.6s cubic-bezier(0.16,1,0.3,1) both',
                }}
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.parentNode.style.background = 'linear-gradient(135deg,#001040,#0050C0)'
                }}
              />
              {/* Overlay */}
              <div style={{
                position:   'absolute',
                inset:      0,
                background: 'linear-gradient(to top, rgba(0,9,31,0.85) 0%, rgba(0,9,31,0.1) 50%, transparent 100%)',
              }} />

              {/* Active info overlay */}
              <div style={{
                position: 'absolute',
                bottom:   '2rem',
                left:     '2rem',
                right:    '2rem',
              }}>
                <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>
                  {active.icon} {active.difficulty}
                </span>
                <h3 style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     'clamp(1.5rem,3vw,2.2rem)',
                  fontWeight:   700,
                  color:        '#ffffff',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                }}>
                  {active.title}
                </h3>
                <p style={{
                  fontSize:   '0.82rem',
                  color:      'rgba(255,255,255,0.65)',
                  marginBottom: '0.5rem',
                }}>
                  📍 {active.location}
                </p>
                <p style={{
                  fontSize: '0.85rem',
                  color:    'rgba(255,255,255,0.78)',
                  maxWidth: '480px',
                  lineHeight: 1.6,
                }}>
                  {active.description}
                </p>

                {/* Highlights */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {active.highlights.map(h => (
                    <span key={h} style={{
                      padding:    '3px 10px',
                      borderRadius: '100px',
                      fontSize:   '0.65rem',
                      fontWeight: 600,
                      color:      'rgba(255,255,255,0.7)',
                      background: 'rgba(255,255,255,0.1)',
                      border:     '1px solid rgba(255,255,255,0.15)',
                    }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Duration badge */}
              <div style={{
                position:     'absolute',
                top:          '1.5rem',
                right:        '1.5rem',
                background:   'rgba(0,9,31,0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: '100px',
                padding:      '0.4rem 1rem',
                border:       '1px solid rgba(255,255,255,0.12)',
              }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ffffff' }}>
                  ⏱ {active.duration}
                </p>
              </div>
            </div>
          </div>

          {/* ── Experience list ── */}
          <div
            className="reveal"
            style={{
              transitionDelay: '0.15s',
              display:         'flex',
              flexDirection:   'column',
              justifyContent:  'center',
              gap:             '0.5rem',
            }}
          >
            <p style={{
              fontSize:     '0.7rem',
              fontWeight:   600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.35)',
              marginBottom: '1rem',
            }}>
              Select an experience
            </p>

            {experiences.map((exp, idx) => (
              <button
                key={exp.id}
                className={`experience-list-item ${idx === activeIdx ? 'active' : ''}`}
                onClick={() => handleSelect(idx)}
                aria-pressed={idx === activeIdx}
                aria-label={`${exp.title} — ${exp.subtitle}`}
                style={{
                  background:   idx === activeIdx ? 'rgba(8,120,255,0.15)' : 'transparent',
                  border:       'none',
                  borderLeft:   `2px solid ${idx === activeIdx ? 'var(--hill-blue-bright)' : 'rgba(255,255,255,0.08)'}`,
                  padding:      '1.25rem 1.5rem',
                  textAlign:    'left',
                  cursor:       'pointer',
                  borderRadius: '0 10px 10px 0',
                  transition:   'all 0.25s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{exp.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontFamily:   'var(--font-display)',
                      fontSize:     '1rem',
                      fontWeight:   600,
                      color:        idx === activeIdx ? '#ffffff' : 'rgba(255,255,255,0.65)',
                      marginBottom: '0.2rem',
                      letterSpacing: '-0.01em',
                      transition:   'color 0.2s ease',
                    }}>
                      {exp.title}
                    </p>
                    <p style={{
                      fontSize:  '0.75rem',
                      color:     idx === activeIdx ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)',
                      transition: 'color 0.2s ease',
                    }}>
                      {exp.subtitle} · {exp.duration}
                    </p>
                  </div>
                  {idx === activeIdx && (
                    <span style={{
                      marginLeft:  'auto',
                      color:       'var(--hill-blue-bright)',
                      fontSize:    '1rem',
                    }}>
                      →
                    </span>
                  )}
                </div>
              </button>
            ))}

            {/* CTA */}
            <div style={{ marginTop: '2rem' }}>
              <button
                className="btn-primary"
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Book This Experience
              </button>
              <button
                className="btn-outline-white"
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
              >
                Ask HillGuide
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes imgReveal {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 900px) {
          #experiences > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
          #experiences > div > div:last-child > div:last-child {
            flex-direction: row !important;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </section>
  )
}
