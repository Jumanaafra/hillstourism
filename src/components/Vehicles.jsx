import React from 'react'
import { getOptimizedImageUrl, generateResponsiveSrcSet } from '../lib/cloudinary/transform'
import { vehicles } from '../data/vehicles'
import { FiUsers, FiBriefcase, FiMap, FiMapPin } from 'react-icons/fi'
import { FaCarSide } from 'react-icons/fa'

export default function Vehicles({ id, initialVehicles }) {
  const vehicleList = Array.isArray(initialVehicles) && initialVehicles.length > 0 ? initialVehicles : vehicles

  const Feature = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }} aria-hidden="true">{icon}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--hill-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  )

  return (
    <section
      id={id}
      aria-label="Hillstourism vehicles"
      style={{
        background: 'var(--hill-white)',
        padding:    'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,5rem)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal visible" style={{ marginBottom: 'clamp(2.5rem,5vw,4rem)' }}>
          <p className="eyebrow" style={{ marginBottom: '0.85rem' }}>Transportation</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <h2 className="heading-xl" style={{ color: 'var(--hill-navy)' }}>
              Every road,<br />comfortably.
            </h2>
            <p className="body-lg" style={{ color: 'var(--hill-muted)', maxWidth: '360px' }}>
              Hill-experienced drivers, local route knowledge, flexible pickup — your journey starts from the moment you step in.
            </p>
          </div>
        </div>

        {/* Vehicle grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap:                 'clamp(1rem,2vw,1.5rem)',
        }}>
          {vehicleList.map((v, i) => (
            <article
              key={v.id}
              className="vehicle-card reveal visible"
              style={{ transitionDelay: `${i * 0.08}s` }}
              aria-label={`${v.name} — ${v.type}`}
            >
              {/* Vehicle image */}
              <div style={{
                borderRadius: '10px',
                overflow:     'hidden',
                aspectRatio:  '16/9',
                marginBottom: '1.5rem',
                background:   'var(--hill-surface)',
              }}>
                <img
                  src={getOptimizedImageUrl(v.image, { width: 640, crop: 'fill' })}
                  srcSet={generateResponsiveSrcSet(v.image, [360, 480, 640, 768], { crop: 'fill' })}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  alt={v.name}
                  width={640}
                  height={360}
                  loading="lazy"
                  decoding="async"
                  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                  className="vehicle-img"
                />
              </div>

              {/* Type badge */}
              <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>{v.type}</span>

              {/* Name */}
              <h3 className="heading-sm" style={{ color: 'var(--hill-navy)', marginBottom: '0.25rem' }}>
                {v.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright)', fontWeight: 600, marginBottom: '1.25rem' }}>
                {v.idealFor}
              </p>

              {/* Specs */}
              <div style={{
                display:    'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:        '0.6rem',
                padding:    '1rem',
                background: 'var(--hill-surface)',
                borderRadius: '8px',
                marginBottom: '1.25rem',
              }}>
                <Feature icon={<FiUsers />} label={`${v.capacity} Seats`} />
                <Feature icon={<FiBriefcase />} label={v.luggage} />
                {v.driverAvailable && <Feature icon={<FaCarSide />} label="Driver Incl." />}
                {v.localRoutes    && <Feature icon={<FiMap />} label="Hill Routes" />}
                {v.flexiblePickup && <Feature icon={<FiMapPin />} label="Flex Pickup" />}
              </div>

              {/* Features */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {(v.features || []).map(f => (
                  <span key={f} style={{
                    fontSize:     '0.6rem',
                    padding:      '2px 8px',
                    borderRadius: '4px',
                    background:   'var(--hill-surface)',
                    border:       '1px solid var(--hill-border)',
                    color:        'var(--hill-muted)',
                    fontWeight:   500,
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                paddingTop:     '1rem',
                borderTop:      '1px solid var(--hill-border)',
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--hill-navy)' }}>
                  {v.priceNote}
                </p>
                <a
                  href="#contact"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.1rem', fontSize: '0.7rem', display: 'inline-block', textDecoration: 'none' }}
                  aria-label={`Choose ${v.name}`}
                >
                  Choose
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Note */}
        <div className="reveal visible" style={{ textAlign: 'center', marginTop: '2.5rem', transitionDelay: '0.3s' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--hill-muted)' }}>
            All vehicles include experienced hill drivers · Flexible pickup & drop · 24/7 support
          </p>
        </div>
      </div>

      <style>{`
        .vehicle-card:hover .vehicle-img {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  )
}
