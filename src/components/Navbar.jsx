import React, { useState, useEffect, useRef } from 'react'

const NAV_LINKS = [
  { label: 'Home',        href: '#home' },
  { label: 'Packages',    href: '#packages' },
  { label: 'Experiences', href: '#experiences' },
  { label: 'Stays',       href: '#stays' },
  { label: 'Vehicles',    href: '#vehicles' },
  { label: 'Gallery',     href: '#gallery' },
  { label: 'About',       href: '#about' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)

  /* Scroll listener */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
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
          padding:        scrolled
            ? 'clamp(0.6rem,1.5vw,0.85rem) clamp(1.25rem,4vw,3rem)'
            : 'clamp(0.85rem,2vw,1.15rem) clamp(1.25rem,4vw,3rem)',
          maxWidth:       '1600px',
          margin:         '0 auto',
          width:          '100%',
          transition:     'padding 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}>
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('#home') }}
            aria-label="Hillstourism — go to home"
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <img
              src="/logo.png"
              alt="Hillstourism"
              style={{
                height:    'clamp(34px, 4vw, 48px)',
                width:     'auto',
                objectFit: 'contain',
                filter:    'brightness(1.05)',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                const s = document.createElement('span')
                s.style.cssText = 'font-family:"Sora",sans-serif;font-size:1.2rem;color:#ffffff;font-weight:700;letter-spacing:-0.02em;'
                s.textContent = 'HILLSTOURISM'
                e.target.parentNode.appendChild(s)
              }}
            />
          </a>

          {/* Desktop nav links */}
          <ul
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        'clamp(1rem, 2vw, 2rem)',
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

          {/* CTA + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            {/* Desktop CTA */}
            <a
              href="#contact"
              className="btn-primary desktop-cta"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
              style={{ padding: '0.6rem 1.35rem', fontSize: '0.72rem' }}
            >
              Plan My Trip
            </a>

            {/* WhatsApp icon link */}
            <a
              href="https://wa.me/919999000000?text=Hi! I'd like to plan a hill trip."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact on WhatsApp"
              className="desktop-cta"
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          '36px',
                height:         '36px',
                borderRadius:   '50%',
                background:     'rgba(255,255,255,0.1)',
                border:         '1px solid rgba(255,255,255,0.18)',
                color:          '#ffffff',
                transition:     'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
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
                  display:      'block',
                  width:        '22px',
                  height:       '1.5px',
                  background:   '#ffffff',
                  borderRadius: '1px',
                  transition:   'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
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

        {/* Responsive rules */}
        <style>{`
          @media (max-width: 1024px) {
            .desktop-nav { display: none !important; }
            .desktop-cta { display: none !important; }
            .hamburger-btn { display: flex !important; }
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
          {/* Decorative accent */}
          <div style={{
            position:    'absolute',
            top:         '50%', left: '50%',
            transform:   'translate(-50%,-50%)',
            width:       '500px', height: '500px',
            borderRadius: '50%',
            background:  'radial-gradient(ellipse, rgba(8,120,255,0.06), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            style={{
              position:   'absolute',
              top:        '1.5rem',
              right:      'clamp(1.25rem,4vw,3rem)',
              background: 'transparent',
              border:     '1px solid rgba(255,255,255,0.15)',
              color:      'rgba(255,255,255,0.7)',
              width:      '40px',
              height:     '40px',
              borderRadius: '50%',
              fontSize:   '1.4rem',
              cursor:     'pointer',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              padding:    0,
              transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
          >
            ×
          </button>

          <nav>
            <ul style={{ listStyle: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {[...NAV_LINKS, { label: 'Contact', href: '#contact' }].map((link, i) => (
                <li key={link.href} style={{
                  opacity:    menuOpen ? 1 : 0,
                  transform:  menuOpen ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 0.055}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.055}s`,
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
            marginTop:  '2.5rem',
            opacity:    menuOpen ? 1 : 0,
            transform:  menuOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease 0.45s, transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s',
            display:    'flex',
            gap:        '1rem',
            flexWrap:   'wrap',
            justifyContent: 'center',
          }}>
            <a
              href="#contact"
              className="btn-primary"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
            >
              Plan My Trip
            </a>
            <a
              href="https://wa.me/919999000000?text=Hi! I'd like to plan a hill trip."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </>
  )
}
