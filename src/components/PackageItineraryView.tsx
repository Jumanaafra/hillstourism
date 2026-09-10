'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Package, Hotel, Vehicle, ItineraryDay } from '@/types/domain'
import Enquiry from '@/components/Enquiry'
import { FiClock, FiStar, FiMap, FiMapPin, FiInfo, FiUsers, FiCheck, FiX, FiArrowRight, FiPlus } from 'react-icons/fi'
import { FaStar, FaCarSide } from 'react-icons/fa'
import { MdRestaurant, MdHotel } from 'react-icons/md'

interface PackageItineraryViewProps {
  pkg: Package
  connectedHotels?: Hotel[]
  connectedVehicles?: Vehicle[]
}

export default function PackageItineraryView({
  pkg,
  connectedHotels = [],
  connectedVehicles = [],
}: PackageItineraryViewProps) {
  // Sort itinerary strictly by day number (1, 2, 3...)
  const sortedItinerary = useMemo<ItineraryDay[]>(() => {
    if (!pkg.itinerary || !Array.isArray(pkg.itinerary)) return []
    return [...pkg.itinerary].sort((a, b) => {
      const dayA = typeof a.day === 'number' ? a.day : Number(a.day) || 0
      const dayB = typeof b.day === 'number' ? b.day : Number(b.day) || 0
      return dayA - dayB
    })
  }, [pkg.itinerary])

  // Track expanded days (all expanded by default for scanability, can be toggled)
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    sortedItinerary.forEach(d => {
      initial[d.day] = true
    })
    return initial
  })

  // Selected hotel and vehicle for enquiry attachment
  const [selectedHotelId, setSelectedHotelId] = useState<string>('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')

  const toggleDay = (dayNum: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }))
  }

  const toggleAllDays = (expand: boolean) => {
    const next: Record<number, boolean> = {}
    sortedItinerary.forEach(d => {
      next[d.day] = expand
    })
    setExpandedDays(next)
  }

  const scrollToEnquiry = () => {
    const target = document.getElementById('enquiry-section') || document.getElementById('contact')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSelectHotel = (hotelId: string) => {
    setSelectedHotelId(prev => (prev === hotelId ? '' : hotelId))
    scrollToEnquiry()
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(prev => (prev === vehicleId ? '' : vehicleId))
    scrollToEnquiry()
  }

  const heroImage = pkg.coverImage || pkg.image

  return (
    <div style={{ background: 'var(--hill-white)', minHeight: '100vh' }}>
      {/* ── SECTION 1: PACKAGE HERO ── */}
      <section
        style={{
          position: 'relative',
          background: 'var(--hill-navy-deep)',
          color: '#ffffff',
          padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 5rem)',
          overflow: 'hidden',
        }}
        aria-label="Package Hero"
      >
        {heroImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
              filter: 'brightness(0.65)',
            }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0, 9, 31, 0.4) 0%, rgba(0, 9, 31, 0.95) 100%)',
          }}
        />

        <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <Link href="/#packages" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Packages</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ color: 'var(--hill-blue-bright)', fontWeight: 600 }}>{pkg.name}</span>
          </nav>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span
              style={{
                background: 'rgba(8, 120, 255, 0.2)',
                border: '1px solid rgba(8, 120, 255, 0.4)',
                color: 'var(--hill-blue-bright)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {pkg.destination}
            </span>
            {pkg.category && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {pkg.category}
              </span>
            )}
            {pkg.duration && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiClock /> {pkg.duration}</span>
              </span>
            )}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              color: '#ffffff',
              maxWidth: '900px',
            }}
          >
            {pkg.name}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: '750px',
              lineHeight: 1.65,
              marginBottom: '2.5rem',
            }}
          >
            {pkg.shortDescription || pkg.description}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: '1.75rem',
            }}
          >
            {pkg.price && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Starting from</span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {pkg.price}
                </span>
                {pkg.priceNote && (
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>/ {pkg.priceNote}</span>
                )}
              </div>
            )}

            <button
              onClick={scrollToEnquiry}
              className="btn-primary"
              style={{
                padding: '0.9rem 2.25rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(8, 120, 255, 0.4)',
                cursor: 'pointer',
              }}
              aria-label="Enquire about this journey"
            >
              Send Enquiry <FiArrowRight style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TRIP OVERVIEW METRICS ── */}
      <section
        style={{
          maxWidth: 'var(--container-w)',
          margin: '-2.5rem auto 3.5rem',
          padding: '0 clamp(1.25rem, 5vw, 5rem)',
          position: 'relative',
          zIndex: 3,
        }}
        aria-label="Trip Overview"
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--hill-border)',
            boxShadow: '0 12px 36px rgba(0, 16, 64, 0.08)',
            padding: '1.75rem clamp(1.25rem, 3vw, 2.5rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {pkg.duration && (
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--hill-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Duration</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--hill-navy)', marginTop: '4px' }}>{pkg.duration}</p>
            </div>
          )}

          {pkg.nights !== undefined && (
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--hill-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Nights</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--hill-navy)', marginTop: '4px' }}>{pkg.nights} {Number(pkg.nights) === 1 ? 'Night' : 'Nights'}</p>
            </div>
          )}

          {pkg.destination && (
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--hill-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Destination</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--hill-navy)', marginTop: '4px' }}>{pkg.destination}</p>
            </div>
          )}

          {pkg.category && (
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--hill-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Trip Category</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--hill-navy)', marginTop: '4px' }}>{pkg.category}</p>
            </div>
          )}

          {pkg.tag && (
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--hill-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Experience Style</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--hill-blue)', marginTop: '4px' }}>{pkg.tag}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 3: JOURNEY HIGHLIGHTS ── */}
      {pkg.highlights && pkg.highlights.length > 0 && (
        <section
          style={{
            maxWidth: 'var(--container-w)',
            margin: '0 auto 4rem',
            padding: '0 clamp(1.25rem, 5vw, 5rem)',
          }}
          aria-label="Journey Highlights"
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <p className="eyebrow" style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.35rem' }}>Curated Highlights</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--hill-navy)', fontWeight: 700 }}>
              What Makes This Journey Special
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {pkg.highlights.map(h => (
              <div
                key={h}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'var(--hill-surface)',
                  border: '1px solid var(--hill-border)',
                  color: 'var(--hill-navy)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: 'var(--hill-blue-bright)', display: 'flex', alignItems: 'center' }}><FiStar /></span>
                {h}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 4: DAY-WISE ITINERARY ── */}
      <section
        id="itinerary-section"
        style={{
          maxWidth: 'var(--container-w)',
          margin: '0 auto 5rem',
          padding: '0 clamp(1.25rem, 5vw, 5rem)',
        }}
        aria-label="Day-wise Itinerary"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.35rem' }}>Detailed Schedule</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)', color: 'var(--hill-navy)', fontWeight: 700 }}>
              Day-by-Day Itinerary
            </h2>
          </div>

          {sortedItinerary.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => toggleAllDays(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--hill-border)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  color: 'var(--hill-navy)',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Expand All
              </button>
              <button
                onClick={() => toggleAllDays(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--hill-border)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  color: 'var(--hill-muted)',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* Itinerary Container */}
        {sortedItinerary.length === 0 ? (
          /* Graceful Fallback for packages without detailed itinerary */
          <div
            style={{
              padding: '3rem 2rem',
              borderRadius: '16px',
              background: 'var(--hill-surface)',
              border: '1px dashed var(--hill-border)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--hill-navy)' }}><FiMap /></span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--hill-navy)', marginBottom: '0.5rem' }}>
              Customized Day-by-Day Itinerary
            </h3>
            <p style={{ color: 'var(--hill-muted)', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Our mountain travel specialists tailor the exact daily sequence, stops, and activities to your travel season, group dynamics, and preferences.
            </p>
            <button onClick={scrollToEnquiry} className="btn-primary" style={{ padding: '0.75rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Request Custom Day Plan <FiArrowRight />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sortedItinerary.map((dayItem, index) => {
              const isExpanded = !!expandedDays[dayItem.day]
              const dayPill = String(dayItem.day).padStart(2, '0')

              return (
                <article
                  key={`day-${dayItem.day}-${index}`}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: isExpanded ? '1px solid var(--hill-border-blue)' : '1px solid var(--hill-border)',
                    boxShadow: isExpanded ? '0 8px 28px rgba(8, 120, 255, 0.06)' : '0 2px 8px rgba(0, 16, 64, 0.03)',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                  }}
                  aria-labelledby={`day-heading-${dayItem.day}`}
                >
                  {/* Day Card Header (Clickable Accordion) */}
                  <button
                    onClick={() => toggleDay(dayItem.day)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '1.5rem clamp(1rem, 3vw, 2rem)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      cursor: 'pointer',
                      gap: '1rem',
                    }}
                    aria-expanded={isExpanded}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1.5rem)', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: 'var(--hill-navy)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          letterSpacing: '0.06em',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          display: 'inline-block',
                        }}
                      >
                        DAY {dayPill}
                      </span>

                      <div>
                        <h3
                          id={`day-heading-${dayItem.day}`}
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
                            fontWeight: 700,
                            color: 'var(--hill-navy)',
                            margin: 0,
                          }}
                        >
                          {dayItem.title}
                        </h3>

                        {dayItem.locations && dayItem.locations.length > 0 && (
                          <p
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--hill-blue-bright)',
                              fontWeight: 600,
                              marginTop: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <FiMapPin style={{ marginRight: 4, flexShrink: 0 }} />
                            <span>
                              {dayItem.locations.map((loc, lIdx) => (
                                <span key={loc} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                  {lIdx > 0 && <FiArrowRight style={{ margin: '0 4px', fontSize: '0.65rem', opacity: 0.7 }} />}
                                  {loc}
                                </span>
                              ))}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '1.25rem',
                        color: 'var(--hill-muted)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </button>

                  {/* Day Details Body */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 clamp(1rem, 3vw, 2rem) 1.75rem',
                        borderTop: '1px solid var(--hill-border)',
                        paddingTop: '1.5rem',
                      }}
                    >
                      {/* Description */}
                      <p
                        style={{
                          fontSize: '0.98rem',
                          color: 'var(--hill-text-mid)',
                          lineHeight: 1.7,
                          marginBottom: '1.5rem',
                        }}
                      >
                        {dayItem.description}
                      </p>

                      {/* Activities List */}
                      {dayItem.activities && dayItem.activities.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4
                            style={{
                              fontSize: '0.8rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              fontWeight: 700,
                              color: 'var(--hill-navy)',
                              marginBottom: '0.75rem',
                            }}
                          >
                            Key Activities
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
                            {dayItem.activities.map((act, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  fontSize: '0.88rem',
                                  color: 'var(--hill-text)',
                                  background: 'var(--hill-surface)',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                }}
                              >
                                <span style={{ color: 'var(--hill-blue-bright)', fontWeight: 700, flexShrink: 0 }}>•</span>
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Day Metadata Chips (Meals, Stay, Travel) */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          marginBottom: dayItem.images && dayItem.images.length > 0 ? '1.5rem' : '0',
                        }}
                      >
                        {dayItem.meals && dayItem.meals.length > 0 && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#F0FDF4',
                              border: '1px solid #BBF7D0',
                              color: '#166534',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center' }}><MdRestaurant style={{ marginRight: 4 }} /> Meals:</span>
                            <span>{dayItem.meals.join(', ')}</span>
                          </div>
                        )}

                        {dayItem.accommodation && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              color: '#1E40AF',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center' }}><MdHotel style={{ marginRight: 4 }} /> Stay:</span>
                            <span>{dayItem.accommodation}</span>
                          </div>
                        )}

                        {dayItem.travelInfo && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#F8FAFC',
                              border: '1px solid var(--hill-border)',
                              color: 'var(--hill-muted)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center' }}><FaCarSide style={{ marginRight: 4 }} /> Travel:</span>
                            <span>{dayItem.travelInfo}</span>
                          </div>
                        )}
                      </div>

                      {/* Day Images (if present) */}
                      {dayItem.images && dayItem.images.length > 0 && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                              gap: '0.75rem',
                            }}
                          >
                            {dayItem.images.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                style={{
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  aspectRatio: '16/9',
                                  background: 'var(--hill-surface)',
                                }}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Day ${dayItem.day} — ${dayItem.title}`}
                                  loading="lazy"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={e => {
                                    ;(e.target as HTMLElement).style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ── PHOTO GALLERY ── */}
      {pkg.gallery && pkg.gallery.length > 0 && (
        <section
          style={{
            maxWidth: 'var(--container-w)',
            margin: '0 auto 4.5rem',
            padding: '0 clamp(1.25rem, 5vw, 5rem)',
          }}
          aria-label="Package Photo Gallery"
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="eyebrow" style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.35rem' }}>Visual Journey</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--hill-navy)', fontWeight: 700 }}>
              Package Gallery
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {pkg.gallery.map((media: any, idx: number) => {
              const url = typeof media === 'string' ? media : media.url || media.src
              if (!url) return null
              return (
                <div
                  key={media.id || idx}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '200px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    background: 'var(--hill-surface)',
                  }}
                >
                  <img
                    src={url}
                    alt={media.caption || `${pkg.name} photo ${idx + 1}`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── SECTION 5 & 6: INCLUSIONS & EXCLUSIONS ── */}
      {((pkg.inclusions && pkg.inclusions.length > 0) || (pkg.exclusions && pkg.exclusions.length > 0)) && (
        <section
          style={{
            maxWidth: 'var(--container-w)',
            margin: '0 auto 5rem',
            padding: '0 clamp(1.25rem, 5vw, 5rem)',
          }}
          aria-label="Inclusions and Exclusions"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '2rem',
            }}
          >
            {/* Inclusions Card */}
            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #BBF7D0',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.2rem', color: '#16A34A', display: 'flex', alignItems: 'center' }}><FiCheck /></span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--hill-navy)' }}>
                    What&apos;s Included
                  </h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {pkg.inclusions.map((inc, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '0.92rem',
                        color: 'var(--hill-text)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '1rem', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center' }}><FiCheck /></span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusions Card */}
            {pkg.exclusions && pkg.exclusions.length > 0 && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #FECACA',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.2rem', color: '#DC2626', display: 'flex', alignItems: 'center' }}><FiX /></span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--hill-navy)' }}>
                    What&apos;s Not Included
                  </h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {pkg.exclusions.map((exc, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '0.92rem',
                        color: 'var(--hill-muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center' }}><FiX /></span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION 7: IMPORTANT INFORMATION ── */}
      {pkg.importantInformation && pkg.importantInformation.length > 0 && (
        <section
          style={{
            maxWidth: 'var(--container-w)',
            margin: '0 auto 5rem',
            padding: '0 clamp(1.25rem, 5vw, 5rem)',
          }}
          aria-label="Important Information"
        >
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}><FiInfo /></span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#92400E' }}>
                Important Travel Notes & Guidelines
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pkg.importantInformation.map((info, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.9rem',
                    color: '#78350F',
                    lineHeight: 1.55,
                  }}
                >
                  <span style={{ color: '#D97706', fontWeight: 700 }}>•</span>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── SECTION 8: CONNECTED HOTELS & FLEET VEHICLES ── */}
      {(connectedHotels.length > 0 || connectedVehicles.length > 0) && (
        <section
          style={{
            background: 'var(--hill-surface)',
            padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 5rem)',
            marginBottom: '4rem',
            borderTop: '1px solid var(--hill-border)',
            borderBottom: '1px solid var(--hill-border)',
          }}
          aria-label="Associated Stays and Fleet"
        >
          <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
              <p className="eyebrow" style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.35rem' }}>Curated Options</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--hill-navy)', fontWeight: 700, marginBottom: '0.75rem' }}>
                Customize Your Stay & Transport
              </h2>
              <p style={{ color: 'var(--hill-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Select your preferred mountain resort or vehicle to attach them directly to your enquiry.
              </p>
            </div>

            {/* Stays Grid */}
            {connectedHotels.length > 0 && (
              <div style={{ marginBottom: connectedVehicles.length > 0 ? '3rem' : '0' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--hill-navy)', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Recommended Stays for this Route
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
                  {connectedHotels.map(hotel => {
                    const isSelected = selectedHotelId === hotel.id
                    return (
                      <div
                        key={hotel.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--hill-blue-bright)' : '1px solid var(--hill-border)',
                          overflow: 'hidden',
                          boxShadow: isSelected ? '0 8px 24px rgba(8, 120, 255, 0.15)' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {hotel.image && (
                          <div style={{ height: '140px', overflow: 'hidden' }}>
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => {
                                ;(e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase' }}>
                              {hotel.category}
                            </span>
                            {hotel.rating && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaStar /> {hotel.rating}
                              </span>
                            )}
                          </div>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--hill-navy)', marginBottom: '4px' }}>
                            {hotel.name}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--hill-muted)', marginBottom: '0.75rem' }}>
                            {hotel.location}
                          </p>
                          {hotel.pricePerNight && (
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--hill-navy)', marginBottom: '1rem', marginTop: 'auto' }}>
                              {hotel.pricePerNight} <span style={{ fontSize: '0.7rem', color: 'var(--hill-muted)', fontWeight: 400 }}>/ night</span>
                            </p>
                          )}
                          <button
                            onClick={() => handleSelectHotel(hotel.id)}
                            className={isSelected ? 'btn-primary' : 'btn-outline'}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
                          >
                            {isSelected ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <FiCheck /> Selected with Package
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <FiPlus /> Select for Enquiry
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Vehicles Grid */}
            {connectedVehicles.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--hill-navy)', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Available Fleet Options
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
                  {connectedVehicles.map(veh => {
                    const isSelected = selectedVehicleId === veh.id
                    return (
                      <div
                        key={veh.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--hill-blue-bright)' : '1px solid var(--hill-border)',
                          overflow: 'hidden',
                          boxShadow: isSelected ? '0 8px 24px rgba(8, 120, 255, 0.15)' : 'none',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase' }}>
                            {veh.type}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--hill-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiUsers /> {veh.capacity} Seats
                          </span>
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--hill-navy)', marginBottom: '4px' }}>
                          {veh.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--hill-muted)', marginBottom: '1rem', marginTop: 'auto' }}>
                          Mountain-experienced chauffeur included · {veh.luggage || 'Ample luggage space'}
                        </p>
                        <button
                          onClick={() => handleSelectVehicle(veh.id)}
                          className={isSelected ? 'btn-primary' : 'btn-outline'}
                          style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
                        >
                          {isSelected ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <FiCheck /> Selected Vehicle
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <FiPlus /> Select for Enquiry
                            </span>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION 9: ENQUIRY CTA & FORM ── */}
      <div id="enquiry-section">
        <Enquiry
          id="contact"
          initialPackageId={pkg.id}
          initialHotelId={selectedHotelId}
          initialVehicleId={selectedVehicleId}
          packageLocked={true}
        />
      </div>
    </div>
  )
}
