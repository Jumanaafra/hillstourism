import React from 'react'
import Link from 'next/link'
import { FaHeart, FaWhatsapp, FaInstagram, FaFacebookF, FaYoutube, FaTwitter } from 'react-icons/fa'
import NewsletterForm from './NewsletterForm'

const FOOTER_LINKS = {
  Journeys:    ['Munnar Escape', 'Coorg Trails', 'Ooty Highlands', 'Shimla Serenity', 'Darjeeling Dawn', 'Manali Adventure'],
  Categories:  ['Honeymoon', 'Couple Packages', 'Family Packages', 'Friends Groups', 'Corporate Retreats', 'Custom Trips'],
  Stays:       ['Normal Stays', 'Premium Resorts', '5 Star Hotels', 'Homestays', 'Smart Stay Match'],
  Company:     ['About Us', 'Gallery', 'Testimonials', 'Why Hillstourism', 'Vehicles', 'Careers'],
}

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
  { id: 'social-instagram', platform: 'instagram', url: 'https://instagram.com/hillstourism' },
  { id: 'social-facebook', platform: 'facebook', url: 'https://facebook.com/hillstourism' },
  { id: 'social-whatsapp', platform: 'whatsapp', url: "https://wa.me/919999000000?text=Hi!%20I'd%20like%20to%20plan%20a%20hill%20trip%20with%20Hillstourism." },
]

export default function Footer({ id, socialLinks = DEFAULT_FOOTER_SOCIALS, whatsappUrl = "https://wa.me/919999000000?text=Hi!%20I'd%20like%20to%20plan%20a%20hill%20trip%20with%20Hillstourism." }) {
  const activeSocials = Array.isArray(socialLinks) && socialLinks.length > 0 ? socialLinks : DEFAULT_FOOTER_SOCIALS

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
          <a href="#home" aria-label="Hillstourism — go to top" style={{ display: 'inline-block' }}>
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
          </a>

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
                    <span className="footer-link">
                      {link}
                    </span>
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
          <NewsletterForm />
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
          <Link href="/privacy-policy" className="footer-link" style={{ fontSize: '0.7rem' }}>
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="footer-link" style={{ fontSize: '0.7rem' }}>
            Terms & Conditions
          </Link>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.12)' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>Crafted with <FaHeart style={{ color: '#EF4444' }} /> for the hills</span>
        </p>
      </div>

      <style>{`
        .footer-social-btn {
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .footer-social-btn:hover {
          border-color: rgba(8,120,255,0.5) !important;
          background: rgba(8,120,255,0.12) !important;
        }
      `}</style>
    </footer>
  )
}
