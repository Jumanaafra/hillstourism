import React, { useRef } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const GALLERY_ITEMS = [
  {
    id: 'g1',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format',
    alt: 'Majestic mountain range at golden hour',
  },
  {
    id: 'g2',
    src: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800&q=80&auto=format',
    alt: 'Cozy campfire by the lakeside',
  },
  {
    id: 'g3',
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80&auto=format',
    alt: 'Sunrise over Himalayan peaks',
  },
  {
    id: 'g4',
    src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80&auto=format',
    alt: 'Dense forest trail in Coorg',
  },
  {
    id: 'g5',
    src: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=800&q=80&auto=format',
    alt: 'Golden sunrise over tea gardens',
  },
  {
    id: 'g6',
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&auto=format',
    alt: 'Snow-capped mountain peaks of Himachal',
  },
  {
    id: 'g7',
    src: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80&auto=format',
    alt: 'Manali valley panoramic view',
  },
  {
    id: 'g8',
    src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80&auto=format',
    alt: 'Peaceful mountain lake reflection',
  },
]

export default function Gallery({ id }) {
  const sectionRef = useRef(null)
  useScrollReveal(sectionRef)

  return (
    <section
      id={id}
      ref={sectionRef}
      className="section-dark section-wrap"
      aria-label="Travel gallery"
    >
      <div className="section-inner">
        {/* Header */}
        <div className="section-header reveal" style={{ textAlign:'center' }}>
          <p className="eyebrow" style={{ marginBottom:'0.85rem' }}>Through the Lens</p>
          <h2 className="heading-xl" style={{ color:'#f5f0e8', marginBottom:'0.75rem' }}>
            Moments Captured
          </h2>
          <p className="body-lg" style={{ color:'var(--clr-text-muted)', maxWidth:'480px', margin:'0 auto' }}>
            Every frame tells a story from the hills — these are ours.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="gallery-grid">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className="gallery-item reveal"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentNode.style.background = 'linear-gradient(135deg, #0c1a0c, #2d5c2d)'
                }}
              />
              <div className="gallery-item-overlay" />

              {/* Hover caption */}
              <div style={{
                position:   'absolute',
                bottom:     0,
                left:       0,
                right:      0,
                padding:    '1rem',
                background: 'linear-gradient(to top, rgba(4,13,4,0.9), transparent)',
                opacity:    0,
                transform:  'translateY(8px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                pointerEvents:'none',
              }}
                className="gallery-caption"
              >
                <p style={{
                  fontFamily:  'Inter,sans-serif',
                  fontSize:    '0.75rem',
                  color:       '#f5f0e8',
                  lineHeight:  1.4,
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
