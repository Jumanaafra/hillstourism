'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Packages',    href: '/packages' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Stays',       href: '/stays' },
  { label: 'Vehicles',    href: '/vehicles' },
  { label: 'Gallery',     href: '/gallery' },
  { label: 'About',       href: '/about' },
]

export default function Navbar({ whatsappUrl: customWhatsappUrl = '' } = {}) {
  const pathname = usePathname()
  const router = useRouter()

  // On non-home pages there is no dark Hero to overlay, so always use the dark navbar style
  const isHomePage = pathname === '/'
  const [scrolled, setScrolled] = useState(!isHomePage)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)
  const whatsappUrl = customWhatsappUrl || "https://wa.me/919999000000?text=Hi!%20I'd%20like%20to%20plan%20a%20hill%20trip."

  /* Scroll listener — on homepage only toggles; on other pages always stays dark */
  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true)
      return
    }
    setScrolled(window.scrollY > 60)
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [isHomePage])

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

  /* Close on pathname change (back/forward or route change) */
  useEffect(() => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }, [pathname])

  const handleNavClick = (href) => {
    setMenuOpen(false)
    document.body.style.overflow = ''
    // Pure hash anchor (e.g. #contact) → smooth-scroll within current page
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    // Hash anchor on home (e.g. /#contact) from homepage → smooth-scroll
    if (href.startsWith('/#') && pathname === '/') {
      const id = href.slice(1) // becomes #contact
      const el = document.querySelector(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    // All other links → client-side route navigation
    router.push(href)
  }

  // Determine if a nav link is active
  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/#')) return false
    return pathname.startsWith(href)
  }

  const allMobileLinks = [
    ...NAV_LINKS,
    { label: 'Contact', href: '/#contact' },
  ]

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
        style={!isHomePage && !scrolled && !menuOpen ? { background: 'rgba(0,9,31,0.95)', backdropFilter: 'blur(24px)' } : undefined}
      >
        <div
          className="navbar-container"
          style={{
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
          }}
        >
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); handleNavClick('/') }}
            aria-label="Hillstourism — go to home"
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="Hillstourism"
                width={150}
                height={100}
                className="navbar-brand-logo"
                style={{
                  height:      'clamp(34px, 4vw, 48px)',
                  width:       'auto',
                  aspectRatio: '1536 / 1024',
                  objectFit:   'contain',
                  filter:      'brightness(1.05)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  const s = document.createElement('span')
                  s.style.cssText = 'font-family:"Sora",sans-serif;font-size:1.2rem;color:#ffffff;font-weight:700;letter-spacing:-0.02em;'
                  s.textContent = 'HILLSTOURISM'
                  e.target.parentNode.appendChild(s)
                }}
              />
            </picture>
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
                  className={`nav-link${isActive(link.href) ? ' nav-link-active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                  aria-current={isActive(link.href) ? 'page' : undefined}
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
              href="/#contact"
              className="btn-primary desktop-cta"
              onClick={(e) => { e.preventDefault(); handleNavClick('/#contact') }}
              style={{ padding: '0.6rem 1.35rem', fontSize: '0.72rem' }}
            >
              Plan My Trip
            </a>

            {/* WhatsApp icon link */}
            <a
              href={whatsappUrl}
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

            {/* Hamburger Button with fluid 3-bar morph */}
            <button
              className={`hamburger-btn ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              type="button"
            >
              <span className="hamburger-bar top-bar" />
              <span className="hamburger-bar mid-bar" />
              <span className="hamburger-bar bot-bar" />
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

      {/* Mobile fluid navigation overlay */}
      {menuMounted && (
        <div
          className={`mobile-menu ${menuOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Ambient fluid decorative orbs */}
          <div className="mobile-menu-glow-1" aria-hidden="true" />
          <div className="mobile-menu-glow-2" aria-hidden="true" />

          <nav className="mobile-menu-nav" aria-label="Mobile menu links">
            <ul className="mobile-menu-list">
              {allMobileLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <li key={link.href} className="mobile-nav-item">
                    <a
                      href={link.href}
                      className={`mobile-nav-link ${active ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                      aria-current={active ? 'page' : undefined}
                    >
                      {active && (
                        <span className="mobile-nav-pill-dot" aria-hidden="true" />
                      )}
                      <span>{link.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Quick CTA Actions */}
          <div className="mobile-nav-actions">
            <a
              href="/#contact"
              className="btn-primary mobile-cta-btn"
              onClick={(e) => { e.preventDefault(); handleNavClick('/#contact') }}
            >
              Plan My Trip
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white mobile-cta-btn"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </>
  )
}
