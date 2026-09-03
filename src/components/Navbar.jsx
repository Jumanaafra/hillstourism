import React, { useState, useEffect, useRef } from 'react'

const NAV_LINKS = [
  { label: 'Home',        href: '#home' },
  { label: 'Journeys',    href: '#journeys' },
  { label: 'Categories',  href: '#categories' },
  { label: 'Experiences', href: '#experiences' },
  { label: 'Gallery',     href: '#gallery' },
  { label: 'About',       href: '#about' },
  { label: 'Contact',     href: '#contact' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)
  const prevScrollY = useRef(0)

  /* Scroll listener */
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 60)
      prevScrollY.current = window.scrollY
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  /* Prevent body scroll when menu open */
  useEffect(() => {
    if (menuOpen) {
      setMenuMounted(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      const t = setTimeout(() => setMenuMounted(false), 450)
      return () => clearTimeout(t)
    }
  }, [menuOpen])

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleNavClick = (href) => {
    setMenuOpen(false)
    setTimeout(() => {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, menuOpen ? 450 : 0)
  }

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        'clamp(0.75rem,2vw,1rem) clamp(1.25rem,4vw,3rem)',
          maxWidth:       '1600px',
          margin:         '0 auto',
          width:          '100%',
        }}>
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('#home') }}
            aria-label="HillsTourism – go to home"
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <img
              src="/logo.png"
              alt="HillsTourism"
              style={{
                height:    'clamp(36px, 4.5vw, 52px)',
                width:     'auto',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                const s = document.createElement('span')
                s.style.cssText = 'font-family:"Playfair Display",serif;font-size:1.3rem;color:#c9a84c;font-weight:500;letter-spacing:0.04em;'
                s.textContent = 'HILLS TOURISM'
                e.target.parentNode.appendChild(s)
              }}
            />
          </a>

          {/* Desktop nav */}
          <ul
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        'clamp(1.2rem, 2.5vw, 2.2rem)',
              listStyle:  'none',
            }}
            className="desktop-nav"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="nav-link"
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA + hamburger row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            {/* Desktop CTA */}
            <a
              href="#contact"
              className="btn-primary desktop-cta"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.72rem' }}
            >
              Plan Your Trip
            </a>

            {/* Hamburger */}
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              style={{
                display:       'none',
                flexDirection: 'column',
                gap:           '5px',
                padding:       '6px',
                background:    'transparent',
                border:        'none',
                cursor:        'pointer',
              }}
            >
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display:       'block',
                  width:         '24px',
                  height:        '1.5px',
                  background:    '#f5f0e8',
                  borderRadius:  '1px',
                  transition:    'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
                  transform:
                    menuOpen && i === 0 ? 'translateY(6.5px) rotate(45deg)' :
                    menuOpen && i === 1 ? 'scaleX(0)' :
                    menuOpen && i === 2 ? 'translateY(-6.5px) rotate(-45deg)' :
                    'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Inline styles for responsive visibility */}
        <style>{`
          @media (max-width: 1024px) {
            .desktop-nav  { display: none !important; }
            .desktop-cta  { display: none !important; }
            .hamburger-btn{ display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile full-screen menu */}
      {menuMounted && (
        <div
          className={`mobile-menu ${menuOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            style={{
              position:   'absolute',
              top:        '1.5rem',
              right:      'clamp(1.25rem,4vw,3rem)',
              background: 'transparent',
              border:     'none',
              color:      '#f5f0e8',
              fontSize:   '1.8rem',
              cursor:     'pointer',
              lineHeight: 1,
              padding:    '0.5rem',
            }}
          >
            ×
          </button>

          {/* Decorative accent */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '400px', height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.05), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <nav>
            <ul style={{ listStyle: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} style={{
                  opacity:   menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 0.06}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
                }}>
                  <a
                    href={link.href}
                    className="mobile-nav-link"
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div style={{
            marginTop: '3rem',
            opacity:   menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease 0.45s, transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s',
          }}>
            <a
              href="#contact"
              className="btn-primary"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
            >
              Plan Your Trip
            </a>
          </div>
        </div>
      )}
    </>
  )
}
