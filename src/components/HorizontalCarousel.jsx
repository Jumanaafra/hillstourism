'use client'

import React, { useRef, useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/**
 * Reusable Horizontal Carousel component.
 * Supports smooth scroll, responsive card sizing, touch swipe,
 * and circular arrow navigation matching the reference design.
 *
 * @param {object} props
 * @param {any[]} props.items - Array of items to render
 * @param {(item: any, index: number) => React.ReactNode} props.renderItem - Item renderer
 * @param {string} [props.ariaLabel] - Section/track label for accessibility
 * @param {React.ReactNode} [props.headerExtra] - Optional extra controls for section header
 */
export default function HorizontalCarousel({ items = [], renderItem, ariaLabel = 'Carousel track' }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll, { passive: true })
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [items])

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (!items || items.length === 0) return null

  return (
    <div className="horizontal-carousel-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Carousel Track */}
      <div
        ref={scrollRef}
        className="horizontal-carousel-track"
        aria-label={ariaLabel}
        tabIndex={0}
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          width: '100%',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id || item.slug || index}
            className="horizontal-carousel-item"
            style={{
              flex: '0 0 auto',
              scrollSnapAlign: 'start',
              boxSizing: 'border-box',
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Circular Navigation Arrow Buttons */}
      <div
        className="horizontal-carousel-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => scrollByAmount('left')}
          disabled={!canScrollLeft}
          aria-label="Previous items"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--hill-border, rgba(0, 16, 64, 0.15))',
            background: '#ffffff',
            color: canScrollLeft ? 'var(--hill-navy, #001040)' : 'var(--hill-muted-lt, #94A3B8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canScrollLeft ? 'pointer' : 'default',
            opacity: canScrollLeft ? 1 : 0.4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (canScrollLeft) {
              e.currentTarget.style.borderColor = 'var(--hill-blue-bright, #0878FF)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--hill-border, rgba(0, 16, 64, 0.15))'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <FiChevronLeft style={{ fontSize: '1.3rem' }} />
        </button>

        <button
          type="button"
          onClick={() => scrollByAmount('right')}
          disabled={!canScrollRight}
          aria-label="Next items"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--hill-border, rgba(0, 16, 64, 0.15))',
            background: '#ffffff',
            color: canScrollRight ? 'var(--hill-navy, #001040)' : 'var(--hill-muted-lt, #94A3B8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canScrollRight ? 'pointer' : 'default',
            opacity: canScrollRight ? 1 : 0.4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (canScrollRight) {
              e.currentTarget.style.borderColor = 'var(--hill-blue-bright, #0878FF)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--hill-border, rgba(0, 16, 64, 0.15))'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <FiChevronRight style={{ fontSize: '1.3rem' }} />
        </button>
      </div>

      <style>{`
        .horizontal-carousel-track::-webkit-scrollbar {
          display: none;
        }
        .horizontal-carousel-item {
          width: calc((100% - 3 * 1rem) / 4);
          min-width: 250px;
        }
        @media (max-width: 1023px) {
          .horizontal-carousel-item {
            width: calc((100% - 1rem) / 2);
            min-width: 240px;
          }
        }
        @media (max-width: 640px) {
          .horizontal-carousel-item {
            width: clamp(260px, 84vw, 320px) !important;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  )
}
