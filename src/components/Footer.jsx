'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FaHeart, FaWhatsapp, FaInstagram, FaFacebookF, FaYoutube, FaTwitter, FaChevronDown, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import NewsletterForm from './NewsletterForm'

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Curated Stays', href: '/stays' },
  { label: 'Mountain Fleet', href: '/vehicles' },
  { label: 'Signature Experiences', href: '/experiences' },
  { label: 'Visual Gallery', href: '/gallery' },
  { label: 'Why Hillstourism', href: '/#why-us' },
]

const PACKAGE_LINKS = [
  { label: 'Munnar Mist Escape', href: '/packages' },
  { label: 'Coorg Coffee Trails', href: '/packages' },
  { label: 'Ooty Heritage Highlands', href: '/packages' },
  { label: 'Shimla Serenity Tour', href: '/packages' },
  { label: 'Darjeeling Dawn Vista', href: '/packages' },
  { label: 'Manali Alpine Adventure', href: '/packages' },
  { label: 'Explore All Packages →', href: '/packages' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Refund & Cancellation Policy', href: '/terms-and-conditions#refunds' },
  { label: 'Hill Travel Safety Advisories', href: '/about#safety' },
]

function getSocialIcon(platform) {
  switch (platform?.toLowerCase()) {
    case 'whatsapp':
      return <FaWhatsapp size={16} />
    case 'instagram':
      return <FaInstagram size={16} />
    case 'facebook':
      return <FaFacebookF size={15} />
    case 'youtube':
      return <FaYoutube size={16} />
    case 'twitter':
      return <FaTwitter size={15} />
    default:
      return null
  }
}

const DEFAULT_FOOTER_SOCIALS = [
  { id: 'social-instagram', platform: 'instagram', url: 'https://instagram.com/hillstourism', label: '@hillstourism' },
  { id: 'social-facebook', platform: 'facebook', url: 'https://facebook.com/hillstourism', label: 'facebook.com/hillstourism' },
  { id: 'social-whatsapp', platform: 'whatsapp', url: "https://wa.me/919999000000?text=Hi!%20I'd%20like%20to%20plan%20a%20hill%20trip%20with%20Hillstourism.", label: '+91 99990 00000' },
]

export default function Footer({ id, socialLinks = DEFAULT_FOOTER_SOCIALS, whatsappUrl = "https://wa.me/919999000000?text=Hi!%20I'd%20like%20to%20plan%20a%20hill%20trip%20with%20Hillstourism." }) {
  const activeSocials = Array.isArray(socialLinks) && socialLinks.length > 0 ? socialLinks : DEFAULT_FOOTER_SOCIALS
  const [openSection, setOpenSection] = useState(null)

  const toggleSection = (key) => {
    setOpenSection(prev => prev === key ? null : key)
  }

  return (
    <footer id={id} style={{ background: 'var(--hill-navy-deep)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Main footer area */}
      <div style={{
        maxWidth:            'var(--container-w)',
        margin:              '0 auto',
        padding:             'clamp(2.5rem,5vw,5rem) clamp(1.25rem,5vw,5rem)',
      }}>

        {/* Desktop Layout (hidden on mobile via CSS) */}
        <div className="footer-desktop-grid" style={{
          display:             'grid',
          gridTemplateColumns: 'minmax(220px, 300px) 1fr',
          gap:                 'clamp(2rem,5vw,5rem)',
        }}>

          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Link href="/" aria-label="Hillstourism — go to top" style={{ display: 'inline-block' }}>
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Hillstourism"
                  width={150}
                  height={100}
                  style={{
                    height:      'clamp(36px,5vw,52px)',
                    width:       'auto',
                    aspectRatio: '1536 / 1024',
                    objectFit:   'contain',
                    filter:      'brightness(1.1)',
                  }}
                />
              </picture>
            </Link>

            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: '260px' }}>
              Premium mountain journeys crafted for those who seek more than a destination — a story worth remembering.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {activeSocials.map(s => {
                const icon = getSocialIcon(s.platform)
                if (!icon) return null
                return (
                  <a
                    key={s.id || s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Hillstourism on ${s.platform}`}
                    className="footer-social-btn"
                    style={{
                      width:          '36px', height: '36px',
                      display:        'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius:   '8px',
                      border:         '1px solid rgba(255,255,255,0.12)',
                      background:     'rgba(255,255,255,0.05)',
                      color:          '#ffffff',
                    }}
                  >
                    {icon}
                  </a>
                )
              })}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: 'fit-content', padding: '0.65rem 1.3rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              aria-label="Contact Hillstourism on WhatsApp"
            >
              <FaWhatsapp size={15} />
              WhatsApp Us
            </a>
          </div>

          {/* Link columns */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap:                 'clamp(1.5rem,3vw,2.5rem)',
          }}>
            {/* Company Column */}
            <div>
              <h3 className="footer-col-title">Company</h3>
              <ul className="footer-link-list">
                {COMPANY_LINKS.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Packages Column */}
            <div>
              <h3 className="footer-col-title">Packages</h3>
              <ul className="footer-link-list">
                {PACKAGE_LINKS.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="footer-col-title">Contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <FaMapMarkerAlt style={{ color: 'var(--hill-blue-bright)', marginTop: 3, flexShrink: 0 }} />
                  <span>12 Mountain View Rd, Nilgiri Highlands, India</span>
                </p>
                <a href="tel:+919999000000" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPhoneAlt style={{ color: 'var(--hill-blue-bright)', flexShrink: 0 }} />
                  +91 99990 00000
                </a>
                <a href="mailto:contact@hillstourism.com" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaEnvelope style={{ color: 'var(--hill-blue-bright)', flexShrink: 0 }} />
                  contact@hillstourism.com
                </a>
                <div style={{ marginTop: '0.5rem' }}>
                  <Link href="/contact" className="footer-link" style={{ color: 'var(--hill-blue-bright)', fontWeight: 600 }}>
                    Book or Enquire Online →
                  </Link>
                </div>
              </div>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="footer-col-title">Legal & Trust</h3>
              <ul className="footer-link-list">
                {LEGAL_LINKS.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Collapsible Accordion (displayed only on < 768px) */}
        <div className="footer-mobile-accordion">
          {/* Brand header snippet */}
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <Link href="/" aria-label="Hillstourism — go to top" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Hillstourism"
                  width={140}
                  height={93}
                  style={{ height: '42px', width: 'auto', objectFit: 'contain', filter: 'brightness(1.1)' }}
                />
              </picture>
            </Link>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Curating elevated hill station getaways, luxury cottages, and seamless road journeys across India’s finest ranges.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaWhatsapp size={16} /> WhatsApp Us Directly
            </a>
          </div>

          {/* Accordion Group */}
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            
            {/* 1. Company Accordion */}
            <div className="footer-acc-item">
              <button
                className="footer-acc-trigger"
                onClick={() => toggleSection('company')}
                aria-expanded={openSection === 'company'}
                aria-controls="footer-sec-company"
              >
                <span>Company</span>
                <FaChevronDown className={`footer-acc-chevron ${openSection === 'company' ? 'open' : ''}`} />
              </button>
              <div id="footer-sec-company" className={`footer-acc-content ${openSection === 'company' ? 'open' : ''}`}>
                <ul className="footer-link-list">
                  {COMPANY_LINKS.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="footer-link" style={{ display: 'block', padding: '0.35rem 0' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Packages Accordion */}
            <div className="footer-acc-item">
              <button
                className="footer-acc-trigger"
                onClick={() => toggleSection('packages')}
                aria-expanded={openSection === 'packages'}
                aria-controls="footer-sec-packages"
              >
                <span>Packages & Destinations</span>
                <FaChevronDown className={`footer-acc-chevron ${openSection === 'packages' ? 'open' : ''}`} />
              </button>
              <div id="footer-sec-packages" className={`footer-acc-content ${openSection === 'packages' ? 'open' : ''}`}>
                <ul className="footer-link-list">
                  {PACKAGE_LINKS.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="footer-link" style={{ display: 'block', padding: '0.35rem 0' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Contact Accordion */}
            <div className="footer-acc-item">
              <button
                className="footer-acc-trigger"
                onClick={() => toggleSection('contact')}
                aria-expanded={openSection === 'contact'}
                aria-controls="footer-sec-contact"
              >
                <span>Contact & Assistance</span>
                <FaChevronDown className={`footer-acc-chevron ${openSection === 'contact' ? 'open' : ''}`} />
              </button>
              <div id="footer-sec-contact" className={`footer-acc-content ${openSection === 'contact' ? 'open' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.5rem 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                  <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FaMapMarkerAlt style={{ color: 'var(--hill-blue-bright)', marginTop: 2, flexShrink: 0 }} />
                    <span>12 Mountain View Rd, Nilgiri Highlands, India</span>
                  </p>
                  <a href="tel:+919999000000" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaPhoneAlt style={{ color: 'var(--hill-blue-bright)', flexShrink: 0 }} />
                    +91 99990 00000
                  </a>
                  <a href="mailto:contact@hillstourism.com" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaEnvelope style={{ color: 'var(--hill-blue-bright)', flexShrink: 0 }} />
                    contact@hillstourism.com
                  </a>
                  <Link href="/contact" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.65rem', fontSize: '0.75rem' }}>
                    Open Enquiry Form
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. Social Accordion */}
            <div className="footer-acc-item">
              <button
                className="footer-acc-trigger"
                onClick={() => toggleSection('social')}
                aria-expanded={openSection === 'social'}
                aria-controls="footer-sec-social"
              >
                <span>Social & Community</span>
                <FaChevronDown className={`footer-acc-chevron ${openSection === 'social' ? 'open' : ''}`} />
              </button>
              <div id="footer-sec-social" className={`footer-acc-content ${openSection === 'social' ? 'open' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                  {activeSocials.map(s => {
                    const icon = getSocialIcon(s.platform)
                    return (
                      <a
                        key={s.id || s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-row"
                        style={{
                          display:        'flex',
                          alignItems:     'center',
                          gap:            '12px',
                          color:          '#ffffff',
                          textDecoration: 'none',
                          fontSize:       '0.82rem',
                          padding:        '0.5rem 0.75rem',
                          borderRadius:   '8px',
                          background:     'rgba(255,255,255,0.04)',
                          border:         '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{ color: 'var(--hill-blue-bright)', display: 'flex' }}>{icon}</span>
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{s.platform}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                          {s.label || 'Follow'}
                        </span>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 5. Legal Accordion */}
            <div className="footer-acc-item">
              <button
                className="footer-acc-trigger"
                onClick={() => toggleSection('legal')}
                aria-expanded={openSection === 'legal'}
                aria-controls="footer-sec-legal"
              >
                <span>Legal & Trust</span>
                <FaChevronDown className={`footer-acc-chevron ${openSection === 'legal' ? 'open' : ''}`} />
              </button>
              <div id="footer-sec-legal" className={`footer-acc-content ${openSection === 'legal' ? 'open' : ''}`}>
                <ul className="footer-link-list">
                  {LEGAL_LINKS.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="footer-link" style={{ display: 'block', padding: '0.35rem 0' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Newsletter Strip */}
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
          <div style={{ minWidth: '240px', flex: '1 1 260px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.25rem', fontWeight: 600 }}>
              Stay inspired
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
              Travel ideas, exclusive offers, and hill stories — delivered occasionally.
            </p>
          </div>
          <div style={{ flex: '1 1 300px', maxWidth: '100%' }}>
            <NewsletterForm />
          </div>
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
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} Hillstourism. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Link href="/privacy-policy" className="footer-link" style={{ fontSize: '0.72rem' }}>
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="footer-link" style={{ fontSize: '0.72rem' }}>
            Terms & Conditions
          </Link>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Crafted with <FaHeart style={{ color: '#EF4444' }} /> for the hills
          </span>
        </p>
      </div>

      <style>{`
        .footer-col-title {
          font-family: var(--font-body);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--hill-blue-bright);
          margin-bottom: 1.25rem;
        }
        .footer-link-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 0;
          margin: 0;
        }
        .footer-social-btn {
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .footer-social-btn:hover {
          border-color: rgba(8,120,255,0.5) !important;
          background: rgba(8,120,255,0.12) !important;
        }

        /* Desktop vs Mobile Accordion Visibility */
        @media (min-width: 768px) {
          .footer-mobile-accordion {
            display: none !important;
          }
          .footer-desktop-grid {
            display: grid !important;
          }
        }
        @media (max-width: 767px) {
          .footer-desktop-grid {
            display: none !important;
          }
          .footer-mobile-accordion {
            display: block !important;
          }
        }

        /* Mobile Accordion Styles */
        .footer-acc-item {
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .footer-acc-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 0;
          background: transparent;
          border: none;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          text-align: left;
        }
        .footer-acc-chevron {
          font-size: 0.8rem;
          color: var(--hill-blue-bright);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .footer-acc-chevron.open {
          transform: rotate(180deg);
        }
        .footer-acc-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, padding 0.3s ease;
          opacity: 0;
          padding-bottom: 0;
        }
        .footer-acc-content.open {
          max-height: 500px;
          opacity: 1;
          padding-bottom: 1.25rem;
        }
      `}</style>
    </footer>
  )
}

