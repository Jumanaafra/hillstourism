import React, { useState } from 'react'

const FOOTER_LINKS = {
  Journeys:    ['Munnar Escape', 'Coorg Trails', 'Ooty Highlands', 'Shimla Serenity', 'Darjeeling Dawn', 'Manali Adventure'],
  Categories:  ['Honeymoon', 'Couple Packages', 'Family Packages', 'Friends & Groups', 'College Trips', 'Corporate Retreats'],
  Company:     ['About Us', 'Gallery', 'Testimonials', 'Why Choose Us', 'Blog', 'Careers'],
  Legal:       ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'],
}

const SOCIAL_LINKS = [
  { name:'Instagram', href:'#', icon:'📸' },
  { name:'Facebook',  href:'#', icon:'📘' },
  { name:'YouTube',   href:'#', icon:'▶️' },
  { name:'Twitter',   href:'#', icon:'🐦' },
]

export default function Footer({ id }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer id={id} style={{ background:'#040d04', borderTop:'1px solid rgba(201,168,76,0.12)' }}>
      {/* Main footer */}
      <div style={{
        maxWidth: '1400px',
        margin:   '0 auto',
        padding:  'clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)',
        display:  'grid',
        gridTemplateColumns: 'minmax(200px, 280px) 1fr',
        gap:      'clamp(2rem,5vw,4rem)',
      }}>
        {/* Brand column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          {/* Logo */}
          <a href="#home" aria-label="HillsTourism — go to top" style={{ display:'inline-block' }}>
            <img
              src="/logo.png"
              alt="HillsTourism"
              style={{ height:'clamp(36px,5vw,52px)', width:'auto', objectFit:'contain', filter:'brightness(0.95)' }}
              onError={(e) => {
                e.target.style.display = 'none'
                const s = document.createElement('span')
                s.style.cssText = 'font-family:"Playfair Display",serif;font-size:1.2rem;color:#c9a84c;font-weight:500;'
                s.textContent = 'HILLS TOURISM'
                e.target.parentNode.appendChild(s)
              }}
            />
          </a>

          <p style={{ fontSize:'0.875rem', color:'rgba(245,240,232,0.5)', fontFamily:'Inter,sans-serif', lineHeight:1.7, maxWidth:'240px' }}>
            Premium hill journeys crafted for those who seek more than a destination — a story worth remembering.
          </p>

          {/* Social */}
          <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.name}
                href={s.href}
                aria-label={`Follow HillsTourism on ${s.name}`}
                style={{
                  width:          '36px', height:'36px',
                  display:        'flex', alignItems:'center', justifyContent:'center',
                  borderRadius:   '8px',
                  border:         '1px solid rgba(201,168,76,0.2)',
                  background:     'rgba(201,168,76,0.05)',
                  fontSize:       '1rem',
                  textDecoration: 'none',
                  transition:     'border-color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'
                  e.currentTarget.style.background  = 'rgba(201,168,76,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'
                  e.currentTarget.style.background  = 'rgba(201,168,76,0.05)'
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/919999000000?text=Hi! I'd like to plan a trip with HillsTourism."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width:'fit-content', padding:'0.65rem 1.3rem', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.4rem' }}
            aria-label="Contact HillsTourism on WhatsApp"
          >
            <span>💬</span> WhatsApp Us
          </a>
        </div>

        {/* Link columns */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap:                 'clamp(1.5rem,3vw,2.5rem)',
        }}>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 style={{
                fontFamily:   'Inter,sans-serif',
                fontSize:     '0.65rem',
                fontWeight:   700,
                letterSpacing:'0.2em',
                textTransform:'uppercase',
                color:        '#c9a84c',
                marginBottom: '1.25rem',
              }}>
                {heading}
              </h3>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter bar */}
      <div style={{
        borderTop:   '1px solid rgba(201,168,76,0.1)',
        borderBottom:'1px solid rgba(201,168,76,0.1)',
        padding:     'clamp(1.5rem,3vw,2rem) clamp(1.25rem,4vw,3rem)',
      }}>
        <div style={{
          maxWidth:       '1400px',
          margin:         '0 auto',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            '1.5rem',
        }}>
          <div>
            <p style={{ fontFamily:'Playfair Display,serif', fontSize:'1.1rem', color:'#f5f0e8', marginBottom:'0.25rem' }}>
              Stay inspired
            </p>
            <p style={{ fontSize:'0.8rem', color:'rgba(245,240,232,0.45)', fontFamily:'Inter,sans-serif' }}>
              Travel ideas, exclusive offers, and hill stories — delivered occasionally.
            </p>
          </div>
          {subscribed ? (
            <p style={{ color:'#c9a84c', fontFamily:'Inter,sans-serif', fontSize:'0.85rem', fontStyle:'italic' }}>
              ✓ You're on the list. Adventures ahead!
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                aria-label="Email address for newsletter"
                style={{
                  padding:      '0.7rem 1rem',
                  background:   'rgba(255,255,255,0.05)',
                  border:       '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '3px',
                  color:        '#f5f0e8',
                  fontFamily:   'Inter,sans-serif',
                  fontSize:     '0.85rem',
                  outline:      'none',
                  minWidth:     '220px',
                  transition:   'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                onBlur={(e)  => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
              />
              <button type="submit" className="btn-primary" style={{ padding:'0.7rem 1.4rem', fontSize:'0.75rem' }}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth:       '1400px',
        margin:         '0 auto',
        padding:        '1.25rem clamp(1.25rem,4vw,3rem)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexWrap:       'wrap',
        gap:            '1rem',
      }}>
        <p style={{ fontSize:'0.72rem', color:'rgba(245,240,232,0.25)', fontFamily:'Inter,sans-serif' }}>
          © {new Date().getFullYear()} HillsTourism. All rights reserved.
        </p>
        <div style={{ display:'flex', gap:'1.5rem' }}>
          {['Privacy Policy', 'Terms of Service'].map(item => (
            <a
              key={item}
              href="#"
              className="footer-link"
              style={{ fontSize:'0.7rem' }}
              onClick={(e) => e.preventDefault()}
            >
              {item}
            </a>
          ))}
        </div>
        <p style={{ fontSize:'0.7rem', color:'rgba(245,240,232,0.15)', fontFamily:'Inter,sans-serif' }}>
          Crafted with ♥ for the hills
        </p>
      </div>
    </footer>
  )
}
