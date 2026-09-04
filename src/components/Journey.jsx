import React, { useRef, useEffect } from 'react'

export default function Journey({ id }) {
  const sectionRef = useRef(null)

  // Scroll reveal
  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal, .reveal-left') || []
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.15 }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Multi-layer parallax
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleScroll = () => {
      const rect  = section.getBoundingClientRect()
      const vh    = window.innerHeight
      const prog  = Math.max(0, Math.min(1, 1 - rect.top / vh))
      const bg    = section.querySelector('.parallax-bg')
      const mid   = section.querySelector('.parallax-mid')
      const fore  = section.querySelector('.parallax-fore')
      if (bg)   bg.style.transform   = `translateY(${prog * 60}px)`
      if (mid)  mid.style.transform  = `translateY(${prog * 30}px)`
      if (fore) fore.style.transform = `translateY(${prog * 15}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Journey introduction"
      style={{
        background: 'var(--hill-white)',
        overflow:   'hidden',
        position:   'relative',
      }}
    >
      {/* ── Background mist layer ── */}
      <div
        className="parallax-bg"
        style={{
          position:        'absolute',
          inset:           '-60px 0',
          backgroundImage: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=75&auto=format)`,
          backgroundSize:  'cover',
          backgroundPosition: 'center 30%',
          opacity:         0.07,
          pointerEvents:   'none',
          willChange:      'transform',
        }}
        aria-hidden="true"
      />

      <div
        style={{
          maxWidth: 'var(--container-w)',
          margin:   '0 auto',
          padding:  'clamp(3.5rem, 6vw, 5.5rem) clamp(1.25rem, 5vw, 5rem)',
          display:  'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:      'clamp(2rem, 5vw, 6rem)',
          alignItems: 'center',
          position: 'relative',
          zIndex:   1,
        }}
      >
        {/* ── Left — Editorial text ── */}
        <div className="parallax-mid" style={{ willChange: 'transform' }}>
          <div className="reveal" style={{ transitionDelay: '0.05s' }}>
            <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>
              The Journey Begins
            </p>
          </div>

          <div className="reveal" style={{ transitionDelay: '0.12s' }}>
            <h2
              className="heading-xl"
              style={{
                color:        'var(--hill-navy)',
                marginBottom: '1.5rem',
                lineHeight:   1.05,
              }}
            >
              The hills are{' '}
              <span style={{
                color: 'var(--hill-blue-bright)',
                fontStyle: 'italic',
              }}>
                calling.
              </span>
            </h2>
          </div>

          <div className="reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="divider-blue" style={{ marginBottom: '1.5rem' }} />
            <p
              className="body-lg"
              style={{
                color:        'var(--hill-muted)',
                maxWidth:     '480px',
                marginBottom: '1.25rem',
                lineHeight:   1.8,
              }}
            >
              There is a silence in the mountains that you cannot find
              anywhere else. A quality of light that changes everything.
              A morning mist that makes the world feel new.
            </p>
            <p
              className="body-lg"
              style={{
                color:        'var(--hill-text-mid)',
                maxWidth:     '480px',
                marginBottom: '2.5rem',
                lineHeight:   1.8,
                fontWeight:   500,
              }}
            >
              Hillstourism takes you there — with people who know
              every road, every valley, every hidden viewpoint.
            </p>
          </div>

          <div className="reveal" style={{ transitionDelay: '0.3s', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => document.querySelector('#packages')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Packages
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button
              className="btn-outline"
              onClick={() => document.querySelector('#experiences')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Experiences
            </button>
          </div>

          {/* ── Micro-stats row ── */}
          <div className="reveal" style={{
            transitionDelay: '0.38s',
            marginTop:       '3rem',
            display:         'flex',
            gap:             '2.5rem',
            flexWrap:        'wrap',
          }}>
            {[
              { num: '2,500+', label: 'Happy Travelers' },
              { num: '120+',   label: 'Curated Routes' },
              { num: '4.9',    label: 'Avg Rating' },
            ].map(item => (
              <div key={item.label}>
                <p style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     '1.6rem',
                  fontWeight:   700,
                  color:        'var(--hill-navy)',
                  letterSpacing: '-0.03em',
                  lineHeight:   1,
                  marginBottom: '0.25rem',
                }}>
                  {item.num}
                </p>
                <p style={{
                  fontSize:   '0.75rem',
                  fontWeight: 500,
                  color:      'var(--hill-muted)',
                  letterSpacing: '0.04em',
                }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Layered mountain image ── */}
        <div
          className="parallax-fore reveal"
          style={{
            willChange:     'transform',
            transitionDelay: '0.08s',
            position:       'relative',
          }}
        >
          {/* Main image */}
          <div style={{
            borderRadius:   '16px',
            overflow:       'hidden',
            aspectRatio:    '3/4',
            boxShadow:      '0 40px 100px rgba(0,16,64,0.18)',
            position:       'relative',
          }}>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format"
              alt="Mountain landscape — misty hills at dawn"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Subtle navy overlay at bottom */}
            <div style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(to top, rgba(0,9,31,0.4) 0%, transparent 60%)',
            }} />
            {/* Label badge */}
            <div style={{
              position:     'absolute',
              bottom:       '1.5rem',
              left:         '1.5rem',
              background:   'rgba(0,9,31,0.85)',
              backdropFilter: 'blur(12px)',
              borderRadius: '100px',
              padding:      '0.5rem 1.25rem',
              border:       '1px solid rgba(255,255,255,0.12)',
            }}>
              <p style={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 600 }}>
                🏔️ &nbsp;Hill Country, India
              </p>
            </div>
          </div>

          {/* Floating experience card */}
          <div style={{
            position:   'absolute',
            top:        '-1.5rem',
            right:      '-1.5rem',
            background: '#ffffff',
            borderRadius: '12px',
            padding:    '1.25rem',
            boxShadow:  '0 16px 48px rgba(0,16,64,0.14)',
            border:     '1px solid var(--hill-border)',
            width:      '160px',
          }}>
            <div style={{
              width:        '40px',
              height:       '40px',
              borderRadius: '10px',
              background:   'var(--hill-blue-glow)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              fontSize:     '1.2rem',
            }}>
              🧭
            </div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--hill-navy)', marginBottom: '0.2rem' }}>
              Local Experts
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--hill-muted)', lineHeight: 1.4 }}>
              Guided by people who call the hills home
            </p>
          </div>

          {/* Floating rating card */}
          <div style={{
            position:   'absolute',
            bottom:     '3rem',
            left:       '-2rem',
            background: 'var(--hill-navy)',
            borderRadius: '12px',
            padding:    '1rem 1.25rem',
            boxShadow:  '0 16px 48px rgba(0,16,64,0.3)',
            display:    'flex',
            alignItems: 'center',
            gap:        '0.75rem',
          }}>
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>4.9</p>
              <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: '#F59E0B', fontSize: '0.65rem' }}>★</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                Traveler<br/>Rating
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 900px) {
          #journey > div > div {
            grid-template-columns: 1fr !important;
          }
          #journey > div > div > div:last-child {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}
