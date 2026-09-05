import React, { useState, useRef, useEffect, useCallback } from 'react'
import { categories } from '../data/categories'

/* ─── 3D Position Config ─────────────────────────── */
const POS_CONFIG = {
  0:  { rotateY:   0, translateZ:    0, translateX:    0, scale: 1,    opacity: 1,    zIndex: 10 },
  1:  { rotateY: -32, translateZ: -130, translateX:  290, scale: 0.84, opacity: 0.68, zIndex:  7 },
  '-1':{ rotateY:  32, translateZ: -130, translateX: -290, scale: 0.84, opacity: 0.68, zIndex:  7 },
  2:  { rotateY: -52, translateZ: -280, translateX:  510, scale: 0.66, opacity: 0.38, zIndex:  4 },
  '-2':{ rotateY:  52, translateZ: -280, translateX: -510, scale: 0.66, opacity: 0.38, zIndex:  4 },
}
const HIDDEN_CFG = { rotateY: -70, translateZ: -450, translateX: 700, scale: 0.5, opacity: 0, zIndex: 1 }

/* ─── Mobile Config ──────────────────────────────── */
const MOB_CONFIG = {
  0:   { translateX:   0, scale: 1,    opacity: 1,    zIndex: 10 },
  1:   { translateX: 200, scale: 0.85, opacity: 0.6,  zIndex:  7 },
  '-1':{ translateX:-200, scale: 0.85, opacity: 0.6,  zIndex:  7 },
}

const total = categories.length

function getPos(idx, active) {
  let p = ((idx - active) % total + total) % total
  if (p > total / 2) p -= total
  return p
}

function getStyle(pos, isMob) {
  if (isMob) {
    const absP = Math.abs(pos)
    const sign  = pos >= 0 ? 1 : -1
    const base  = MOB_CONFIG[absP] ?? MOB_CONFIG[1]
    const tx    = base.translateX * sign
    return {
      opacity:    base.opacity,
      zIndex:     base.zIndex,
      display:    absP > 1 ? 'none' : 'block',
      transform:  `translateX(calc(-50% + ${tx}px)) scale(${base.scale})`,
      transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1)',
    }
  }
  const absP  = Math.abs(pos)
  const sign  = pos >= 0 ? 1 : -1
  const base  = POS_CONFIG[absP] ?? HIDDEN_CFG
  const rotY  = pos < 0 ? -base.rotateY : base.rotateY
  const tx    = pos < 0 ? -Math.abs(base.translateX) : base.translateX
  return {
    opacity:   base.opacity,
    zIndex:    base.zIndex,
    display:   absP > 2 ? 'none' : 'block',
    transform: `perspective(1400px) translateX(calc(-50% + ${tx}px)) rotateY(${rotY}deg) translateZ(${base.translateZ}px) scale(${base.scale})`,
    transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
  }
}

export default function TripCategoryCarousel({ id }) {
  const [active,  setActive]  = useState(0)
  const [isMob,   setIsMob]   = useState(window.innerWidth < 768)
  const dragRef   = useRef({ dragging: false, startX: 0, moved: 0 })
  const containerRef = useRef(null)

  /* Responsive check */
  useEffect(() => {
    const handler = () => setIsMob(window.innerWidth < 768)
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])

  /* Navigation */
  const go = useCallback((dir) => {
    setActive(prev => (prev + dir + total) % total)
  }, [])

  /* Keyboard */
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current) return
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go])

  /* ─── Drag / Swipe ───────────────────────────────── */
  const onDragStart = (clientX) => {
    dragRef.current = { dragging: true, startX: clientX, moved: 0 }
  }
  const onDragMove = (clientX) => {
    if (!dragRef.current.dragging) return
    dragRef.current.moved = clientX - dragRef.current.startX
  }
  const onDragEnd = () => {
    if (!dragRef.current.dragging) return
    const { moved } = dragRef.current
    dragRef.current.dragging = false
    if (Math.abs(moved) > 50) go(moved < 0 ? 1 : -1)
  }

  return (
    <section id={id} className="section-deep section-wrap" aria-label="Trip categories"
      style={{ paddingTop: 'clamp(2.5rem, 4vw, 3.5rem)' }}>
      <div className="section-inner">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center' }}>
          <p className="eyebrow-light" style={{ marginBottom: '0.85rem' }}>Our Journeys</p>
          <h2 className="heading-xl" style={{ color: '#ffffff', marginBottom: '0.75rem' }}>
            Travel for Every Chapter
          </h2>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '520px', margin: '0 auto' }}>
            From romantic escapes to corporate retreats — explore packages tailored to your story.
          </p>
        </div>

        {/* Carousel wrapper */}
        <div
          ref={containerRef}
          className="carousel-track"
          tabIndex={0}
          aria-label="3D category carousel. Use arrow keys or drag to navigate."
          role="region"
          /* Mouse events */
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseMove={(e) => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          /* Touch events */
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
          style={{ marginBottom: '2.5rem' }}
        >
          {categories.map((cat, i) => {
            const pos   = getPos(i, active)
            const style = getStyle(pos, isMob)
            return (
              <div
                key={cat.id}
                className="carousel-card-wrapper"
                style={{
                  ...style,
                  position:        'absolute',
                  top:             '50%',
                  left:            '50%',
                  marginTop:       `calc(-${isMob ? 175 : 220}px)`,
                  transformStyle:  'preserve-3d',
                  willChange:      'transform, opacity',
                }}
                onClick={() => pos !== 0 && go(pos > 0 ? 1 : -1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pos !== 0) go(pos > 0 ? 1 : -1)
                }}
                role={pos !== 0 ? 'button' : undefined}
                tabIndex={pos !== 0 ? 0 : undefined}
                aria-label={pos !== 0 ? `View ${cat.title}` : `${cat.title} (active)`}
              >
                <div
                  className="carousel-card"
                  style={{
                    width:  isMob ? '220px' : undefined,
                    height: isMob ? '320px' : undefined,
                    cursor: pos === 0 ? 'default' : 'pointer',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    style={{ width:'100%', height:'100%', objectFit:'cover', userSelect:'none', WebkitUserDrag:'none', pointerEvents:'none' }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentNode.style.background = `linear-gradient(135deg, #0c1a0c, #1e3d1e)`
                    }}
                  />

                  {/* Card info */}
                  <div className="carousel-card-info">
                    {pos === 0 && (
                      <span style={{
                        display:    'inline-block',
                        background: 'rgba(8,120,255,0.2)',
                        border:     '1px solid rgba(8,120,255,0.4)',
                        color:      '#4AA8FF',
                        fontSize:   '0.62rem',
                        letterSpacing: '0.15em',
                        padding:    '3px 10px',
                        borderRadius: '20px',
                        marginBottom: '0.6rem',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                      }}>
                        {cat.badge}
                      </span>
                    )}
                    <h3 style={{
                      fontFamily:  'var(--font-display)',
                      fontSize:    pos === 0 ? '1.45rem' : '1.1rem',
                      fontWeight:  700,
                      color:       '#ffffff',
                      marginBottom: pos === 0 ? '0.4rem' : 0,
                      lineHeight:  1.2,
                      letterSpacing: '-0.02em',
                    }}>
                      {cat.title}
                    </h3>
                    {pos === 0 && (
                      <>
                        <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.6)', fontFamily:'var(--font-body)', marginBottom:'0.9rem', lineHeight:1.55 }}>
                          {cat.description}
                        </p>
                        <button
                          className="btn-primary"
                          style={{ padding:'0.6rem 1.3rem', fontSize:'0.7rem' }}
                          onClick={() => document.querySelector('#packages')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          Explore →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Arrow controls */}
        <div style={{ display:'flex', justifyContent:'center', gap:'1rem', alignItems:'center' }}>
          <button
            className="btn-outline-white"
            onClick={() => go(-1)}
            aria-label="Previous category"
            style={{ padding:'0.7rem 1.2rem', fontSize:'1rem' }}
          >
            ←
          </button>

          {/* Dots */}
          <div style={{ display:'flex', gap:'8px' }} role="tablist" aria-label="Category indicators">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setActive(i)}
                aria-label={`Go to ${cat.title}`}
                aria-selected={i === active}
                role="tab"
                style={{
                  width:      i === active ? '28px' : '8px',
                  height:     '8px',
                  borderRadius: '4px',
                  background: i === active ? 'var(--hill-blue-bright)' : 'rgba(255,255,255,0.2)',
                  border:     'none',
                  cursor:     'pointer',
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  padding:    0,
                }}
              />
            ))}
          </div>

          <button
            className="btn-outline-white"
            onClick={() => go(1)}
            aria-label="Next category"
            style={{ padding:'0.7rem 1.2rem', fontSize:'1rem' }}
          >
            →
          </button>
        </div>

        {/* Category subtitle */}
        <p style={{
          textAlign:  'center',
          marginTop:  '1.5rem',
          fontFamily: 'var(--font-display)',
          fontStyle:  'italic',
          fontSize:   '1.05rem',
          color:      'rgba(255,255,255,0.4)',
          letterSpacing: '-0.01em',
        }}>
          {categories[active].subtitle}
        </p>
      </div>
    </section>
  )
}
