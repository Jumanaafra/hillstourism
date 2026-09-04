import React, { useRef, useState, useEffect } from 'react'

const GALLERY_ITEMS = [
  { id: 'g1', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80&auto=format', alt: 'Majestic mountain range at golden hour' },
  { id: 'g2', src: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=700&q=80&auto=format', alt: 'Campfire by the lakeside at dusk' },
  { id: 'g3', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700&q=80&auto=format', alt: 'Sunrise over Himalayan peaks' },
  { id: 'g4', src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=80&auto=format', alt: 'Dense forest trail in Coorg' },
  { id: 'g5', src: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=700&q=80&auto=format', alt: 'Golden sunrise over tea gardens' },
  { id: 'g6', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80&auto=format', alt: 'Snow-capped mountain peaks of Himachal' },
  { id: 'g7', src: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=700&q=80&auto=format', alt: 'Manali valley panoramic view' },
  { id: 'g8', src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&q=80&auto=format', alt: 'Peaceful mountain lake reflection' },
]

export default function Gallery({ id }) {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const [headerVisible, setHeaderVisible] = useState(false)

  // Scroll reveal for header content
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Scroll reveal for each gallery item
  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll('.gallery-item') || []
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity  = '1'
          e.target.style.transform = 'scale(1) translateY(0)'
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.1 }
    )
    items.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Mountain travel gallery"
      style={{
        background: 'var(--hill-white)',
        padding:    'clamp(3.5rem,7vw,6.5rem) clamp(1.25rem,5vw,5rem)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>

        {/* ── Editorial Gallery Introduction (Left-aligned luxury composition) ── */}
        <div
          ref={headerRef}
          style={{
            maxWidth:     '680px',
            marginBottom: 'clamp(2.25rem, 4vw, 3.5rem)',
            textAlign:    'left',
          }}
        >
          {/* Small Eyebrow: FROM THE HILLS */}
          <div
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '0.55rem',
              marginBottom:  '0.85rem',
              opacity:       headerVisible ? 1 : 0,
              transform:     headerVisible ? 'translateY(0)' : 'translateY(16px)',
              transition:    'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              style={{
                width:        '6px',
                height:       '6px',
                borderRadius: '50%',
                background:   'var(--hill-blue-bright)',
                boxShadow:    '0 0 10px var(--hill-blue-bright)',
                display:      'inline-block',
              }}
            />
            <p
              style={{
                fontFamily:    'var(--font-body)',
                fontSize:      'clamp(11px, 0.8vw, 12.5px)',
                fontWeight:    700,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color:         'var(--hill-blue)',
                margin:        0,
              }}
            >
              FROM THE HILLS
            </p>
          </div>

          {/* Large Main Heading: Postcards from the Hills. */}
          <h2
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(32px, 4vw, 48px)',
              fontWeight:    700,
              lineHeight:    1.12,
              letterSpacing: '-0.025em',
              color:         'var(--hill-navy)',
              margin:        '0 0 1rem 0',
              opacity:       headerVisible ? 1 : 0,
              transform:     headerVisible ? 'translateY(0)' : 'translateY(20px)',
              transition:    'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            Postcards from{' '}
            <span
              style={{
                display:    'inline-block',
                color:      'var(--hill-blue-bright)',
                fontStyle:  'italic',
                fontFamily: 'var(--font-display)',
              }}
            >
              the Hills.
            </span>
          </h2>

          {/* Description */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize:   'clamp(15px, 1.05vw, 17px)',
              lineHeight: 1.65,
              color:      'var(--hill-muted)',
              maxWidth:   '560px',
              margin:     '0 0 1.4rem 0',
              opacity:    headerVisible ? 1 : 0,
              transform:  headerVisible ? 'translateY(0)' : 'translateY(22px)',
              transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
          >
            Moments that stay with you — misty mountains, winding roads, wild forests and quiet escapes captured across the hills.
          </p>

          {/* Primary CTA */}
          <div
            style={{
              opacity:    headerVisible ? 1 : 0,
              transform:  headerVisible ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.28s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.28s',
            }}
          >
            <a
              href="#packages"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '0.45rem',
                fontSize:       '0.88rem',
                fontWeight:     600,
                color:          'var(--hill-blue-bright)',
                textDecoration: 'none',
                letterSpacing:  '0.01em',
                transition:     'gap 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.gap   = '0.75rem'
                e.currentTarget.style.color = 'var(--hill-blue)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.gap   = '0.45rem'
                e.currentTarget.style.color = 'var(--hill-blue-bright)'
              }}
            >
              <span>View Full Gallery</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Asymmetric masonry-style gallery grid (Intact) */}
        <div className="gallery-grid">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className="gallery-item"
              style={{
                opacity:    0,
                transform:  'scale(0.97) translateY(16px)',
                transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
              }}
              aria-label={item.alt}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.parentNode.style.background = 'linear-gradient(135deg, #EEF3F8, #DCEBFF)'
                }}
              />
              <div className="gallery-item-overlay" />

              {/* Hover caption */}
              <div className="gallery-caption" style={{
                position:      'absolute',
                bottom:        0,
                left:          0,
                right:         0,
                padding:       '1rem 1.25rem',
                background:    'linear-gradient(to top, rgba(0,9,31,0.85), transparent)',
                opacity:       0,
                transform:     'translateY(8px)',
                transition:    'opacity 0.35s ease, transform 0.35s ease',
                pointerEvents: 'none',
              }}>
                <p style={{
                  fontSize:   '0.78rem',
                  fontWeight: 500,
                  color:      '#ffffff',
                  lineHeight: 1.4,
                }}>
                  {item.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .gallery-item:hover .gallery-caption {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  )
}
