import React, { useRef } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const TRUST_ITEMS = [
  {
    icon:  '🗺️',
    title: 'Curated Journeys',
    desc:  'Every itinerary is thoughtfully designed by local experts who know the hills intimately — no generic packages.',
  },
  {
    icon:  '🏔️',
    title: 'Local Expertise',
    desc:  'Deep roots in the hill regions mean insider access to trails, stays, and experiences you won\'t find elsewhere.',
  },
  {
    icon:  '💰',
    title: 'Transparent Pricing',
    desc:  'No hidden charges, no surprises. What you see is what you pay — with clear breakdowns for every package.',
  },
  {
    icon:  '🛡️',
    title: 'Safe Travel',
    desc:  'Safety-first protocols, vetted accommodations, and local emergency support ensure worry-free journeys.',
  },
  {
    icon:  '✨',
    title: 'Personalized Experiences',
    desc:  'Tell us your story and we\'ll design a trip around it — your preferences, pace, and perfect moments.',
  },
  {
    icon:  '📞',
    title: '24/7 Support',
    desc:  'From planning to your final day back home, our team is always reachable — day, night, or mountain peak.',
  },
]

export default function WhyChooseUs({ id }) {
  const sectionRef = useRef(null)
  useScrollReveal(sectionRef)

  return (
    <section
      id={id}
      ref={sectionRef}
      className="section-light section-wrap"
      aria-label="Why choose HillsTourism"
    >
      <div className="section-inner">
        {/* Header */}
        <div className="section-header" style={{ textAlign:'center' }}>
          <p className="reveal eyebrow" style={{ color:'var(--clr-accent)', marginBottom:'0.85rem' }}>Our Promise</p>
          <h2 className="reveal heading-xl" style={{ color:'var(--clr-text-dark)', marginBottom:'0.75rem' }}>
            Why Travel with{' '}
            <span style={{ color:'var(--clr-accent)' }}>HillsTourism</span>
          </h2>
          <p className="reveal body-lg" style={{ color:'#5a5a5a', maxWidth:'520px', margin:'0 auto' }}>
            Six reasons our travellers come back — and bring their favourite people along.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap:                 'clamp(1rem,2vw,1.5rem)',
        }}>
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className="reveal"
              style={{
                transitionDelay: `${i * 0.08}s`,
                padding:         '2rem',
                borderRadius:    '12px',
                border:          '1px solid rgba(201,168,76,0.2)',
                background:      'rgba(255,255,255,0.7)',
                backdropFilter:  'blur(8px)',
                transition:      'border-color 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'
                e.currentTarget.style.transform   = 'translateY(-5px)'
                e.currentTarget.style.boxShadow   = '0 16px 48px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'
                e.currentTarget.style.transform   = 'translateY(0)'
                e.currentTarget.style.boxShadow   = 'none'
              }}
            >
              <div style={{
                width:          '52px',
                height:         '52px',
                borderRadius:   '10px',
                background:     'rgba(201,168,76,0.12)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '1.5rem',
                marginBottom:   '1.25rem',
                border:         '1px solid rgba(201,168,76,0.25)',
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontFamily:   'Playfair Display,serif',
                fontSize:     '1.15rem',
                fontWeight:   500,
                color:        '#0d0d0d',
                marginBottom: '0.6rem',
                lineHeight:   1.25,
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize:   '0.875rem',
                color:      '#5a5a5a',
                fontFamily: 'Inter,sans-serif',
                lineHeight: 1.65,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="reveal" style={{
          marginTop:   'clamp(3rem,6vw,5rem)',
          display:     'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap:         '1rem',
          padding:     'clamp(1.5rem,3vw,2.5rem)',
          background:  'linear-gradient(135deg, #080f08 0%, #0c1a0c 100%)',
          borderRadius:'16px',
          border:      '1px solid rgba(201,168,76,0.2)',
        }}>
          {[
            { number:'2,400+',  label:'Happy Travellers' },
            { number:'48+',     label:'Curated Routes' },
            { number:'12+',     label:'Hill Destinations' },
            { number:'4.9★',    label:'Average Rating' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign:'center', padding:'1rem 0' }}>
              <p style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:600, color:'#c9a84c', lineHeight:1 }}>
                {stat.number}
              </p>
              <p style={{ fontSize:'0.75rem', color:'rgba(245,240,232,0.5)', fontFamily:'Inter,sans-serif', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:'0.4rem' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
