import React, { useRef, useEffect, useState } from 'react'

const STATS = [
  { value: 2500, suffix: '+', label: 'Happy Travelers', icon: '🧳' },
  { value: 120,  suffix: '+', label: 'Curated Routes',  icon: '🗺️' },
  { value: 4.9,  suffix: '/5', label: 'Traveler Rating', icon: '⭐', isDecimal: true },
  { value: 100,  suffix: '%', label: 'Hill Focused',    icon: '🏔️' },
]

function useCountUp(target, duration, start) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    const steps    = 60
    const interval = duration / steps
    const increment = target / steps
    let current  = 0
    let step     = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(target, increment * step)
      setCount(parseFloat(current.toFixed(target % 1 !== 0 ? 1 : 0)))
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [start, target, duration])

  return count
}

function StatItem({ stat, isVisible }) {
  const count = useCountUp(stat.value, 1800, isVisible)
  const display = stat.isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      textAlign:      'center',
      padding:        'clamp(1.5rem,3vw,2.5rem)',
      borderRight:    '1px solid rgba(255,255,255,0.08)',
      flex:           '1',
      minWidth:       '180px',
    }}>
      <span style={{ fontSize: '2rem', marginBottom: '0.75rem' }} aria-hidden="true">{stat.icon}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span
          className="number-stat"
          style={{ color: '#ffffff' }}
          aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
        >
          {display}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize:   '1.4rem',
          fontWeight: 700,
          color:      'var(--hill-blue-bright)',
        }}>
          {stat.suffix}
        </span>
      </div>
      <p style={{
        fontSize:      '0.8rem',
        fontWeight:    500,
        color:         'rgba(255,255,255,0.5)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginTop:     '0.5rem',
      }}>
        {stat.label}
      </p>
    </div>
  )
}

export default function StatsStrip({ id }) {
  const sectionRef  = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Hillstourism statistics"
      style={{
        background: 'var(--hill-navy)',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position:     'absolute',
        top:          '50%',
        left:         '50%',
        transform:    'translate(-50%,-50%)',
        width:        '600px',
        height:       '300px',
        background:   'radial-gradient(ellipse, rgba(8,120,255,0.12), transparent 70%)',
        pointerEvents: 'none',
      }} aria-hidden="true" />

      <div style={{
        maxWidth: 'var(--container-w)',
        margin:   '0 auto',
        display:  'flex',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex:   1,
      }}>
        {STATS.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} isVisible={visible} />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #stats-strip > div > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
          #stats-strip > div > div:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  )
}
