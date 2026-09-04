import React, { useState, useRef, useEffect } from 'react'
import { stays } from '../data/stays'

const BUDGETS  = ['Budget (< ₹4k)', 'Comfort (₹4k–8k)', 'Premium (₹8k+)']
const SIZES    = ['Solo', 'Couple', 'Family (3–5)', 'Group (6+)']
const COMFORTS = ['Basic', 'Comfortable', 'Luxury']

function matchStay({ budget, groupSize, comfort }) {
  let filtered = [...stays]
  if (budget === 'Budget (< ₹4k)')       filtered = stays.filter(s => s.category === 'Normal')
  else if (budget === 'Comfort (₹4k–8k)') filtered = stays.filter(s => s.category === 'Premium')
  else if (budget === 'Premium (₹8k+)')   filtered = stays.filter(s => s.category === '5 Star')
  if (comfort === 'Luxury')              filtered = filtered.filter(s => s.category !== 'Normal')
  if (comfort === 'Basic')               filtered = filtered.filter(s => s.category === 'Normal')
  return filtered[0] || stays[0]
}

export default function SmartStayMatcher({ id }) {
  const [budget,    setBudget]    = useState(null)
  const [groupSize, setGroupSize] = useState(null)
  const [comfort,   setComfort]   = useState(null)
  const [result,    setResult]    = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal') || []
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.15 }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleMatch = () => {
    const matched = matchStay({ budget, groupSize, comfort })
    setResult(matched)
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Smart Stay Matching"
      style={{
        background: 'var(--hill-navy)',
        padding:    'clamp(4rem,8vw,6rem) clamp(1.25rem,5vw,5rem)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="eyebrow-light" style={{ marginBottom: '0.85rem' }}>Smart Matching</p>
          <h2 className="heading-lg" style={{ color: '#ffffff', marginBottom: '0.75rem' }}>
            Not sure where to stay?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem' }}>
            Tell us a few things and we'll find your perfect match.
          </p>
        </div>

        {/* Matcher card */}
        <div className="reveal" style={{ transitionDelay: '0.1s' }}>
          <div style={{
            background:   'rgba(255,255,255,0.04)',
            border:       '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding:      'clamp(1.5rem,4vw,2.5rem)',
          }}>
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap:                 '1.5rem',
              marginBottom:        '2rem',
            }}>

              {/* Budget */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
                  Budget / Night
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {BUDGETS.map(b => (
                    <button
                      key={b}
                      onClick={() => setBudget(budget === b ? null : b)}
                      className={`filter-tab-light ${budget === b ? 'active' : ''}`}
                      style={{ textAlign: 'left' }}
                      aria-pressed={budget === b}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Size */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
                  Group Size
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => setGroupSize(groupSize === s ? null : s)}
                      className={`filter-tab-light ${groupSize === s ? 'active' : ''}`}
                      style={{ textAlign: 'left' }}
                      aria-pressed={groupSize === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comfort Level */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
                  Comfort Level
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {COMFORTS.map(c => (
                    <button
                      key={c}
                      onClick={() => setComfort(comfort === c ? null : c)}
                      className={`filter-tab-light ${comfort === c ? 'active' : ''}`}
                      style={{ textAlign: 'left' }}
                      aria-pressed={comfort === c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleMatch}
              style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
            >
              Match My Stay
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Result card */}
        {result && (
          <div style={{
            marginTop: '2rem',
            animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
          }} aria-live="polite">
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem' }}>
              ✓ We found your perfect match
            </p>
            <div style={{
              background:   '#ffffff',
              borderRadius: '12px',
              overflow:     'hidden',
              display:      'grid',
              gridTemplateColumns: '200px 1fr',
              boxShadow:    '0 20px 60px rgba(0,9,31,0.35)',
            }}>
              <div style={{ position: 'relative', height: '160px' }}>
                <img
                  src={result.image}
                  alt={result.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display='none'; e.target.parentNode.style.background='linear-gradient(135deg,#001040,#0050C0)' }}
                />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {result.location}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--hill-navy)' }}>
                  {result.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--hill-muted)' }}>{result.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--hill-navy)' }}>
                    {result.pricePerNight} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--hill-muted)' }}>/night</span>
                  </p>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.7rem' }}
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          #smart-stay > div > div:last-child > div > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
