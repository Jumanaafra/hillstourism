import React, { useRef, useEffect } from 'react'

const PILLARS = [
  {
    num:   '01',
    title: 'Local Expertise',
    body:  'We know every road, every season, every hidden viewpoint. Our team has been guiding travelers through these hills for years. This isn\'t knowledge from a guidebook — it\'s lived experience.',
    icon:  '🗺️',
  },
  {
    num:   '02',
    title: 'Nature First',
    body:  'Every journey is designed around the landscape. We don\'t bring the mountains to you — we take you to the mountains. No crowds, no rush, no compromise on the natural experience.',
    icon:  '🌿',
  },
  {
    num:   '03',
    title: 'Local Partners',
    body:  'We work exclusively with trusted local homestays, guides, and experience hosts. Every rupee stays in the community. Every meal is cooked by a local family.',
    icon:  '🤝',
  },
  {
    num:   '04',
    title: 'Human Support',
    body:  'A real person is reachable before, during, and after your trip. Not a chatbot, not a call center. Someone who knows your itinerary, your preferences, and how to help.',
    icon:  '📞',
  },
]

export default function WhyChooseUs({ id }) {
  const sectionRef = useRef(null)

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal, .reveal-left') || []
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
      aria-label="Why Hillstourism"
      style={{
        background: 'var(--hill-navy)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* Decorative background glow */}
      <div style={{
        position:     'absolute',
        top:          '-100px',
        right:        '-100px',
        width:        '500px',
        height:       '500px',
        borderRadius: '50%',
        background:   'radial-gradient(ellipse, rgba(8,120,255,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} aria-hidden="true" />
      <div style={{
        position:     'absolute',
        bottom:       '-80px',
        left:         '-80px',
        width:        '400px',
        height:       '400px',
        borderRadius: '50%',
        background:   'radial-gradient(ellipse, rgba(95,158,47,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} aria-hidden="true" />

      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 'clamp(3rem,6vw,5rem)', maxWidth: '640px' }}>
          <p className="eyebrow-light" style={{ marginBottom: '1rem' }}>Our Promise</p>
          <h2 className="heading-xl" style={{ color: '#ffffff', marginBottom: '1rem' }}>
            Travel the hills<br />like a local.
          </h2>
          <div className="divider-blue" />
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.55)', marginTop: '1rem', maxWidth: '480px' }}>
            Four principles that define every journey we create.
          </p>
        </div>

        {/* Pillars grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap:                 'clamp(1.5rem,3vw,2.5rem)',
        }}>
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.num}
              className="reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div style={{
                padding:      '2.5rem',
                borderRadius: '12px',
                border:       '1px solid rgba(255,255,255,0.07)',
                background:   'rgba(255,255,255,0.03)',
                height:       '100%',
                display:      'flex',
                flexDirection: 'column',
                gap:          '1.25rem',
                transition:   'border-color 0.3s ease, background 0.3s ease',
                cursor:       'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(8,120,255,0.25)'
                e.currentTarget.style.background  = 'rgba(8,120,255,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.background  = 'rgba(255,255,255,0.03)'
              }}
              >
                {/* Number + icon row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <span className="why-number">{pillar.num}</span>
                  <span style={{ fontSize: '1.75rem' }} aria-hidden="true">{pillar.icon}</span>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

                {/* Title */}
                <h3 style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     '1.15rem',
                  fontWeight:   700,
                  color:        '#ffffff',
                  letterSpacing: '-0.015em',
                }}>
                  {pillar.title}
                </h3>

                {/* Body */}
                <p style={{
                  fontSize:   '0.875rem',
                  color:      'rgba(255,255,255,0.5)',
                  lineHeight: 1.75,
                  flex:       1,
                }}>
                  {pillar.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="reveal" style={{
          marginTop:      'clamp(3rem,5vw,4rem)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '1rem',
          flexWrap:       'wrap',
          transitionDelay: '0.4s',
        }}>
          <button
            className="btn-primary"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Your Journey
          </button>
          <button
            className="btn-outline-white"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Chat with HillGuide
          </button>
        </div>
      </div>
    </section>
  )
}
