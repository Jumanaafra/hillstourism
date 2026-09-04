import React, { useState } from 'react'

const FOOTER_LINKS = {
  Journeys:    ['Munnar Escape', 'Coorg Trails', 'Ooty Highlands', 'Shimla Serenity', 'Darjeeling Dawn', 'Manali Adventure'],
  Categories:  ['Honeymoon', 'Couple Packages', 'Family Packages', 'Friends Groups', 'Corporate Retreats', 'Custom Trips'],
  Stays:       ['Normal Stays', 'Premium Resorts', '5 Star Hotels', 'Homestays', 'Smart Stay Match'],
  Company:     ['About Us', 'Gallery', 'Testimonials', 'Why Hillstourism', 'Vehicles', 'Careers'],
}

const SOCIAL_LINKS = [
  { name: 'Instagram', href: '#', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="white" strokeWidth="1.5"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
  )},
  { name: 'Facebook',  href: '#', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  )},
  { name: 'YouTube',   href: '#', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.5a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
  )},
  { name: 'Twitter',   href: '#', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
  )},
]

export default function Footer({ id }) {
  const [email,      setEmail]      = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer id={id} style={{ background: 'var(--hill-navy-deep)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Main footer grid */}
      <div style={{
        maxWidth:            'var(--container-w)',
        margin:              '0 auto',
        padding:             'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,5rem)',
        display:             'grid',
        gridTemplateColumns: 'minmax(220px, 300px) 1fr',
        gap:                 'clamp(2rem,5vw,5rem)',
      }}>

        {/* Brand column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Logo */}
          <a href="#home" aria-label="Hillstourism — go to top" style={{ display: 'inline-block' }}
            onClick={e => { e.preventDefault(); document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <img
              src="/logo.png"
              alt="Hillstourism"
              style={{ height: 'clamp(36px,5vw,52px)', width: 'auto', objectFit: 'contain', filter: 'brightness(1.1)' }}
              onError={e => {
                e.target.style.display = 'none'
                const s = document.createElement('span')
                s.style.cssText = 'font-family:"Sora",sans-serif;font-size:1.2rem;color:#ffffff;font-weight:700;letter-spacing:-0.02em;'
                s.textContent = 'HILLSTOURISM'
                e.target.parentNode.appendChild(s)
              }}
            />
          </a>

          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: '260px' }}>
            Premium mountain journeys crafted for those who seek more than a destination — a story worth remembering.
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.name}
                href={s.href}
                aria-label={`Follow Hillstourism on ${s.name}`}
                style={{
                  width:          '36px', height: '36px',
                  display:        'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius:   '8px',
                  border:         '1px solid rgba(255,255,255,0.12)',
                  background:     'rgba(255,255,255,0.05)',
                  color:          '#ffffff',
                  transition:     'border-color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(8,120,255,0.5)'
                  e.currentTarget.style.background  = 'rgba(8,120,255,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.05)'
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/919999000000?text=Hi! I'd like to plan a hill trip with Hillstourism."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: 'fit-content', padding: '0.65rem 1.3rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            aria-label="Contact Hillstourism on WhatsApp"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>

        {/* Link columns */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap:                 'clamp(1.5rem,3vw,2.5rem)',
        }}>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '0.65rem',
                fontWeight:    700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color:         'var(--hill-blue-bright)',
                marginBottom:  '1.25rem',
              }}>
                {heading}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="footer-link" onClick={e => e.preventDefault()}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div style={{
        borderTop:    '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding:      'clamp(1.5rem,3vw,2rem) clamp(1.25rem,5vw,5rem)',
      }}>
        <div style={{
          maxWidth:       'var(--container-w)',
          margin:         '0 auto',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            '1.5rem',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.25rem', fontWeight: 600 }}>
              Stay inspired
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
              Travel ideas, exclusive offers, and hill stories — delivered occasionally.
            </p>
          </div>
          {subscribed ? (
            <p style={{ color: 'var(--hill-blue-bright)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              ✓ You're on the list. Adventures ahead!
            </p>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} aria-label="Newsletter signup">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required aria-label="Email address for newsletter"
                style={{
                  padding:      '0.75rem 1rem',
                  background:   'rgba(255,255,255,0.06)',
                  border:       '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color:        '#ffffff',
                  fontSize:     '0.85rem',
                  outline:      'none',
                  minWidth:     '220px',
                  fontFamily:   'var(--font-body)',
                  transition:   'border-color 0.2s ease',
                }}
                onFocus={e  => e.target.style.borderColor = 'var(--hill-blue-bright)'}
                onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.4rem', fontSize: '0.75rem' }}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth:       'var(--container-w)',
        margin:         '0 auto',
        padding:        '1.25rem clamp(1.25rem,5vw,5rem)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexWrap:       'wrap',
        gap:            '1rem',
      }}>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Hillstourism. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service'].map(item => (
            <a key={item} href="#" className="footer-link" style={{ fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>
              {item}
            </a>
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.12)' }}>
          Crafted with ♥ for the hills
        </p>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          footer > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
