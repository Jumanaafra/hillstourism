import React, { useState, useRef, useEffect } from 'react'
import { packages } from '../data/packages'

const DURATIONS = ['1–2 Days', '3–4 Days', '5+ Days']
const BUDGETS   = ['Budget', 'Comfort', 'Premium', 'Luxury']
const TRIP_TYPES = ['Couple', 'Family', 'Friends', 'Adventure', 'Wildlife']

// Deterministic matching logic
function matchPackages({ duration, budget, tripType }) {
  return packages.filter(pkg => {
    let match = true
    if (tripType && tripType !== 'All') {
      const t = tripType.toLowerCase()
      const cat = (pkg.category || '').toLowerCase()
      if (!cat.includes(t) && t !== 'adventure' && t !== 'all') match = false
      if (t === 'adventure' && !cat.includes('friends') && !cat.includes('honeymoon')) match = true
    }
    if (duration) {
      const days = parseInt(pkg.duration)
      if (duration === '1–2 Days' && days > 2) match = false
      if (duration === '3–4 Days' && (days < 3 || days > 4)) match = false
      if (duration === '5+ Days' && days < 5) match = false
    }
    return match
  })
}

export default function TripFinder({ id }) {
  const sectionRef = useRef(null)
  const [duration, setDuration] = useState(null)
  const [budget,   setBudget]   = useState(null)
  const [tripType, setTripType] = useState(null)
  const [results,  setResults]  = useState([])
  const [searched, setSearched] = useState(false)

  // Scroll reveal
  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal') || []
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleFind = () => {
    const matched = matchPackages({ duration, budget, tripType })
    setResults(matched.length > 0 ? matched : packages.slice(0, 3))
    setSearched(true)
    setTimeout(() => {
      document.querySelector('#finder-results')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Trip Finder"
      style={{
        background: 'var(--hill-surface)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,5vw,4rem)' }}>
          <p className="eyebrow" style={{ marginBottom: '0.85rem' }}>Personalised Discovery</p>
          <h2 className="heading-xl" style={{ color: 'var(--hill-navy)', marginBottom: '0.85rem' }}>
            Find Your Perfect<br />Mountain Escape
          </h2>
          <p className="body-lg" style={{ color: 'var(--hill-muted)', maxWidth: '480px', margin: '0 auto' }}>
            Tell us what you're looking for and we'll match you with the right journey.
          </p>
        </div>

        {/* Finder card */}
        <div className="reveal" style={{ transitionDelay: '0.1s' }}>
          <div style={{
            background:   '#ffffff',
            borderRadius: '16px',
            padding:      'clamp(1.5rem,4vw,3rem)',
            boxShadow:    '0 8px 40px rgba(0,16,64,0.08)',
            border:       '1px solid var(--hill-border)',
            maxWidth:     '860px',
            margin:       '0 auto',
          }}>
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap:                 '1.5rem',
              marginBottom:        '2rem',
            }}>

              {/* Duration */}
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hill-navy)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
                  Duration
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(duration === d ? null : d)}
                      className={`filter-tab ${duration === d ? 'active' : ''}`}
                      style={{ textAlign: 'left', borderRadius: '8px' }}
                      aria-pressed={duration === d}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hill-navy)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
                  Budget
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {BUDGETS.map(b => (
                    <button
                      key={b}
                      onClick={() => setBudget(budget === b ? null : b)}
                      className={`filter-tab ${budget === b ? 'active' : ''}`}
                      style={{ textAlign: 'left', borderRadius: '8px' }}
                      aria-pressed={budget === b}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Type */}
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hill-navy)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
                  Trip Type
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {TRIP_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTripType(tripType === t ? null : t)}
                      className={`filter-tab ${tripType === t ? 'active' : ''}`}
                      style={{ textAlign: 'left', borderRadius: '8px' }}
                      aria-pressed={tripType === t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleFind}
              style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
              aria-label="Find matching mountain trips"
            >
              Find My Trip
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div
            id="finder-results"
            style={{
              marginTop: '3rem',
              animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
            }}
            aria-live="polite"
            aria-label={`Found ${results.length} matching packages`}
          >
            <p style={{
              textAlign:    'center',
              marginBottom: '1.5rem',
              fontSize:     '0.85rem',
              color:        'var(--hill-muted)',
            }}>
              {results.length} journey{results.length !== 1 ? 's' : ''} matched your preferences
            </p>
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap:                 '1.25rem',
            }}>
              {results.slice(0, 3).map((pkg, i) => (
                <article
                  key={pkg.id}
                  className="package-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="package-card-img">
                    <img src={pkg.image} alt={`${pkg.title} — ${pkg.destination}`} loading="lazy"
                      onError={e => { e.target.style.display='none'; e.target.parentNode.style.background='linear-gradient(135deg,#001040,#0050C0)' }} />
                    <div style={{ position:'absolute', top:'0.75rem', left:'0.75rem' }}>
                      <span className="badge badge-blue">{pkg.category}</span>
                    </div>
                  </div>
                  <div className="package-card-body">
                    <h3 className="heading-sm" style={{ color: 'var(--hill-navy)' }}>{pkg.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--hill-muted)' }}>{pkg.duration}</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:'0.75rem', borderTop:'1px solid var(--hill-border)' }}>
                      <p style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, color:'var(--hill-navy)', letterSpacing:'-0.02em' }}>{pkg.price}</p>
                      <button className="btn-primary" style={{ padding:'0.55rem 1rem', fontSize:'0.7rem' }}
                        onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior:'smooth' })}>
                        Enquire
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
