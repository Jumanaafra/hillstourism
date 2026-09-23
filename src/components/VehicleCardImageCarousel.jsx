'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getOptimizedImageUrl, generateResponsiveSrcSet } from '../lib/cloudinary/transform'

/**
 * Vehicle card image carousel supporting single/multiple images with auto-rotation,
 * manual prev/next navigation, indicator dots, and reduced motion accessibility.
 */
export default function VehicleCardImageCarousel({ vehicle }) {
  // Extract images array, fallback to vehicle.image or default placeholder
  const rawImages = Array.isArray(vehicle?.images) && vehicle.images.length > 0
    ? vehicle.images
    : (vehicle?.image ? [vehicle.image] : [])

  const images = rawImages.length > 0
    ? rawImages
    : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=640&q=75&auto=format']

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef(null)

  const hasMultiple = images.length > 1

  // Autoplay timer setup
  useEffect(() => {
    if (!hasMultiple || isHovered) return

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [hasMultiple, isHovered, images.length])

  const handlePrev = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const currentImg = images[currentIndex] || images[0]

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        aspectRatio: '16/9',
        marginBottom: '1.5rem',
        background: 'var(--hill-surface)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={getOptimizedImageUrl(currentImg, { width: 640, crop: 'fill' })}
        srcSet={generateResponsiveSrcSet(currentImg, [360, 480, 640, 768], { crop: 'fill' })}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        alt={vehicle?.name || 'Vehicle image'}
        width={640}
        height={360}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.4s ease' }}
        className="vehicle-img"
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=640&q=75&auto=format'
        }}
      />

      {/* Multiple images controls overlay */}
      {hasMultiple && (
        <>
          {/* Prev/Next arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photo"
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(0, 9, 31, 0.65)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'opacity 0.2s ease',
              opacity: isHovered ? 1 : 0.7,
            }}
          >
            <FiChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photo"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(0, 9, 31, 0.65)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'opacity 0.2s ease',
              opacity: isHovered ? 1 : 0.7,
            }}
          >
            <FiChevronRight size={16} />
          </button>

          {/* Dots Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '4px',
              zIndex: 2,
            }}
          >
            {images.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                style={{
                  width: idx === currentIndex ? '14px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
