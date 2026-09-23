'use client'

import React, { useState, useEffect, useMemo } from 'react'
import type { Room } from '@/types/domain'
import { FiX, FiUser, FiCheck, FiChevronLeft, FiChevronRight, FiCoffee, FiShield, FiHome } from 'react-icons/fi'
import { getOptimizedImageUrl } from '@/lib/cloudinary/transform'

interface CottageDetailsModalProps {
  room: Room | null
  stayHeroImage?: string
  isAvailable: boolean
  isSelected: boolean
  computedStatus: string
  unavailableReason?: string
  onClose: () => void
  onToggleSelect: (room: Room) => void
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Deluxe: { bg: 'rgba(8, 120, 255, 0.15)', border: '#0878FF', text: '#0878FF' },
  Premium: { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#a855f7' },
  Family: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#22c55e' },
  Special: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#f59e0b' },
  Normal: { bg: 'rgba(100, 116, 139, 0.15)', border: '#64748b', text: '#64748b' },
}

export default function CottageDetailsModal({
  room,
  stayHeroImage,
  isAvailable,
  isSelected,
  computedStatus,
  unavailableReason,
  onClose,
  onToggleSelect,
}: CottageDetailsModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Determine images array for slideshow (Hooks called before early returns)
  const galleryImages = useMemo(() => {
    if (!room) return []
    if (room.images && room.images.length > 0) return room.images
    if (room.image) return [room.image]
    if (stayHeroImage) return [stayHeroImage]
    return []
  }, [room, stayHeroImage])

  // Automatic 4-second crossfade slideshow timer
  useEffect(() => {
    if (galleryImages.length <= 1) return

    const timer = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % galleryImages.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [galleryImages])

  if (!room) return null

  const catStyle = CATEGORY_COLORS[room.category] || CATEGORY_COLORS.Normal

  const defaultAmenities = [
    'Private Balcony',
    'Garden & Mountain View',
    'Ensuite Luxury Bathroom',
    'Wi-Fi & Coffee Maker',
    '24/7 Hot Water & Housekeeping'
  ]

  const displayAmenities = room.amenities && room.amenities.length > 0 ? room.amenities : defaultAmenities

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 9, 31, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeInModal 0.25s ease'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '580px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
        >
          <FiX style={{ fontSize: '1.1rem' }} />
        </button>

        {/* Slideshow Image Area */}
        <div style={{ position: 'relative', width: '100%', height: '260px', background: '#0f172a', overflow: 'hidden', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
          {galleryImages.length > 0 ? (
            galleryImages.map((imgUrl, idx) => (
              <img
                key={idx}
                src={getOptimizedImageUrl(imgUrl, { width: 900, height: 500, crop: 'fill' })}
                alt={`${room.name} image ${idx + 1}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: idx === activeImageIndex ? 1 : 0,
                  transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            ))
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
              No cottage image available
            </div>
          )}

          {/* Navigation Controls */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => setActiveImageIndex(prev => (prev + 1) % galleryImages.length)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiChevronRight />
              </button>

              {/* Dot Indicators */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px'
              }}>
                {galleryImages.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: idx === activeImageIndex ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '100px',
                      background: idx === activeImageIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Cottage Number Floating Pill */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            background: 'rgba(0, 9, 31, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: '100px',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {room.roomNumber}
          </div>
        </div>

        {/* Content Details */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Header & Category Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '100px',
                background: catStyle.bg,
                border: `1px solid ${catStyle.border}`,
                color: catStyle.text,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'inline-block',
                marginBottom: '6px'
              }}>
                {room.category} Cottage
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#00091f', margin: 0 }}>
                {room.name}
              </h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Rate</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#0878FF', margin: 0 }}>
                ₹{room.pricePerNight.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>/ night</span>
              </p>
            </div>
          </div>

          {/* Guest Capacity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
            <FiUser style={{ color: '#0878FF' }} /> Capacity: {room.capacity} Guests / Extra Cots Supported
          </div>

          {/* Cottage Amenities */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Cottage Amenities & Inclusions
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {displayAmenities.map((amenity, i) => (
                <span key={i} style={{
                  fontSize: '0.78rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FiCheck style={{ color: '#16a34a' }} /> {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Status Alert if unavailable */}
          {!isAvailable && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FiShield /> {unavailableReason || 'This cottage is currently unavailable for the chosen dates.'}
            </div>
          )}

          {/* Modal Footer Action Button */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                onToggleSelect(room)
                onClose()
              }}
              className="btn-primary"
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: !isAvailable ? 0.6 : 1,
                cursor: !isAvailable ? 'not-allowed' : 'pointer'
              }}
            >
              {isSelected ? (
                <>
                  <FiCheck /> Remove from Selection
                </>
              ) : (
                <>
                  Select {room.roomNumber} for Stay
                </>
              )}
            </button>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
