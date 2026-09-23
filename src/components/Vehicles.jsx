'use client'

import React, { useState, useEffect } from 'react'
import { getOptimizedImageUrl, generateResponsiveSrcSet } from '../lib/cloudinary/transform'
import { vehicles as defaultVehicles } from '../data/vehicles'
import { FiUsers, FiBriefcase, FiMap, FiMapPin, FiX } from 'react-icons/fi'
import { FaCarSide } from 'react-icons/fa'
import Enquiry from './Enquiry'

/**
 * @param {object} props
 * @param {string} [props.id]
 * @param {any[]} [props.initialVehicles]
 * @param {(vehicleId: string) => void} [props.onSelectVehicle]
 */
export default function Vehicles({ id = '', initialVehicles = [], onSelectVehicle = undefined }) {
  const vehicleList = Array.isArray(initialVehicles) && initialVehicles.length > 0 ? initialVehicles : defaultVehicles
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null)

  useEffect(() => {
    if (selectedVehicleForModal) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedVehicleForModal(null)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selectedVehicleForModal])

  const handleChoose = (e, vehicle) => {
    e.preventDefault()
    if (onSelectVehicle) {
      onSelectVehicle(vehicle.id)
    } else {
      setSelectedVehicleForModal(vehicle)
    }
  }

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
        padding:    'clamp(4rem,8vw,5rem) clamp(1.25rem,5vw,5rem)',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
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

              {/* Badges strip */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span className="badge badge-blue">{v.type}</span>
                <span className="badge badge-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <FiUsers style={{ fontSize: '0.7rem' }} /> {v.capacity} Seats
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--hill-blue-bright)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}>
                  {v.features?.some(f => f.includes('AC')) ? 'AC Included' : 'Non-AC'}
                </span>
                {v.driverAvailable && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: '#16A34A',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                  }}>
                    <FaCarSide style={{ fontSize: '0.65rem' }} /> Chauffeur Incl.
                  </span>
                )}
              </div>

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
                <button
                  onClick={(e) => handleChoose(e, v)}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.1rem', fontSize: '0.7rem', border: 'none', cursor: 'pointer' }}
                  aria-label={`Choose ${v.name}`}
                  type="button"
                >
                  Choose
                </button>
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

      {/* Modal Popup for Vehicles Page */}
      {selectedVehicleForModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0, 9, 31, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setSelectedVehicleForModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Enquire for ${selectedVehicleForModal.name}`}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1500px',
              maxHeight: '100vh',
              overflowY: 'auto',
              borderRadius: '20px',
              background: 'var(--hill-navy-deep)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVehicleForModal(null)}
              aria-label="Close enquiry modal"
              type="button"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                zIndex: 10,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            >
              <FiX style={{ fontSize: '1.2rem' }} />
            </button>

            {/* Render embedded Enquiry component */}
            <Enquiry
              initialVehicleId={selectedVehicleForModal.id}
              initialVehicles={vehicleList}
            />
          </div>
        </div>
      )}

      <style>{`
        .vehicle-card:hover .vehicle-img {
          transform: scale(1.05);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  )
}
