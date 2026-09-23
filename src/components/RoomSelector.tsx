'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import type { Hotel, Room } from '@/types/domain'
import { FiCalendar, FiCheck, FiInfo, FiUser, FiArrowRight, FiAlertCircle, FiChevronLeft, FiChevronRight, FiEye, FiArrowLeft, FiX } from 'react-icons/fi'
import DateRangePicker from '@/components/DateRangePicker'
import CottageDetailsModal from '@/components/CottageDetailsModal'
import Enquiry from '@/components/Enquiry'
import { useRouter } from 'next/navigation'

interface Props {
  hotel: Hotel
  onRoomsSelected?: (selectionData: {
    checkIn: string
    checkOut: string
    nights: number
    selectedRooms: Room[]
    estimatedAmount: number
  }) => void
}

const CATEGORY_STYLING: Record<string, { border: string; bg: string; badgeBg: string; text: string }> = {
  Deluxe: { border: '#0878FF', bg: 'rgba(8, 120, 255, 0.04)', badgeBg: 'rgba(8, 120, 255, 0.12)', text: '#0878FF' },
  Premium: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.04)', badgeBg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7' },
  Family: { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.04)', badgeBg: 'rgba(34, 197, 94, 0.12)', text: '#16a34a' },
  Special: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.04)', badgeBg: 'rgba(245, 158, 11, 0.12)', text: '#d97706' },
  Normal: { border: '#64748b', bg: 'rgba(100, 116, 139, 0.04)', badgeBg: 'rgba(100, 116, 139, 0.12)', text: '#475569' },
}

export default function RoomSelector({ hotel, onRoomsSelected }: Props) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<string>('')
  const [checkOut, setCheckOut] = useState<string>('')
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])
  const [availabilityData, setAvailabilityData] = useState<Record<string, { computedStatus: string; isAvailable: boolean; unavailableReason?: string }>>({})
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string>('')
  const [selectedRoomForModal, setSelectedRoomForModal] = useState<Room | null>(null)
  const [showEnquiryModal, setShowEnquiryModal] = useState<boolean>(false)

  const rowsContainerRef = useRef<HTMLDivElement>(null)

  // Calculate number of nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const dIn = new Date(checkIn)
    const dOut = new Date(checkOut)
    const diff = Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [checkIn, checkOut])

  // Handle Date Range Picker Changes
  const handleDateChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
    setApiError('')
  }

  // Fetch real-time availability when dates are selected
  useEffect(() => {
    if (!checkIn || !checkOut || nights <= 0) {
      setAvailabilityData({})
      return
    }

    let isMounted = true
    setLoadingAvailability(true)
    setApiError('')

    fetch(`/api/stays/${hotel.id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (data.success && data.data?.rooms) {
          const map: Record<string, { computedStatus: string; isAvailable: boolean; unavailableReason?: string }> = {}
          data.data.rooms.forEach((r: any) => {
            map[r.id] = {
              computedStatus: r.computedStatus,
              isAvailable: r.isAvailable,
              unavailableReason: r.unavailableReason,
            }
          })
          setAvailabilityData(map)
        } else {
          setApiError(data.error?.message || 'Could not verify availability.')
        }
      })
      .catch(() => {
        if (isMounted) setApiError('Network error checking room availability.')
      })
      .finally(() => {
        if (isMounted) setLoadingAvailability(false)
      })

    return () => { isMounted = false }
  }, [hotel.id, checkIn, checkOut, nights])

  const rooms = useMemo(() => {
    const raw = (hotel.rooms || []).filter(r => r.status !== 'hidden')
    return [...raw].sort((a, b) => (a.layoutOrder || 0) - (b.layoutOrder || 0))
  }, [hotel.rooms])

  // Real-time Room Status Counts for Summary Header
  const roomStatusSummary = useMemo(() => {
    let availableCount = 0
    let bookedCount = 0
    let maintenanceCount = 0

    rooms.forEach(r => {
      const computed = availabilityData[r.id]
      if (r.status === 'maintenance') {
        maintenanceCount++
      } else if (computed?.computedStatus === 'booked') {
        bookedCount++
      } else {
        availableCount++
      }
    })

    return {
      total: rooms.length,
      available: availableCount,
      booked: bookedCount,
      maintenance: maintenanceCount
    }
  }, [rooms, availabilityData])

  // Group rooms by Row for property layout
  const rowsMap = useMemo(() => {
    const map = new Map<number, Room[]>()
    rooms.forEach(r => {
      const rowNum = r.row || 1
      if (!map.has(rowNum)) map.set(rowNum, [])
      map.get(rowNum)!.push(r)
    })
    const sortedRowKeys = Array.from(map.keys()).sort((a, b) => a - b)
    return sortedRowKeys.map(k => ({
      rowNum: k,
      rooms: map.get(k)!.sort((a, b) => (a.column || 0) - (b.column || 0))
    }))
  }, [rooms])

  // Selected Room Objects
  const selectedRooms = useMemo(() => {
    return rooms.filter(r => selectedRoomIds.includes(r.id))
  }, [rooms, selectedRoomIds])

  // Category Breakdown Summary
  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {}
    selectedRooms.forEach(r => {
      summary[r.category] = (summary[r.category] || 0) + 1
    })
    return summary
  }, [selectedRooms])

  // Total Estimated Price Calculation: sum(pricePerNight) * nights
  const estimatedAmount = useMemo(() => {
    const perNight = selectedRooms.reduce((acc, r) => acc + (r.pricePerNight || 0), 0)
    return perNight * (nights > 0 ? nights : 1)
  }, [selectedRooms, nights])

  useEffect(() => {
    if (showEnquiryModal) {
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('hillstourism_room_selected', {
          detail: {
            hotelId: hotel.id,
            checkIn,
            checkOut,
            nights,
            roomIds: selectedRoomIds,
            selectedRooms,
            estimatedAmount,
          }
        }))
      }, 50)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowEnquiryModal(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [showEnquiryModal, hotel.id, checkIn, checkOut, nights, selectedRoomIds, selectedRooms, estimatedAmount])

  const toggleRoomSelection = (room: Room, isAvailable: boolean) => {
    if (!isAvailable) return

    if (selectedRoomIds.includes(room.id)) {
      setSelectedRoomIds(prev => prev.filter(id => id !== room.id))
    } else {
      setSelectedRoomIds(prev => [...prev, room.id])
    }
  }

  const handleContinueCTA = () => {
    if (onRoomsSelected) {
      onRoomsSelected({
        checkIn,
        checkOut,
        nights,
        selectedRooms,
        estimatedAmount,
      })
    }

    // Open existing Enquiry form inside Modal popup on the SAME page
    setShowEnquiryModal(true)
    window.dispatchEvent(new CustomEvent('hillstourism_room_selected', {
      detail: {
        hotelId: hotel.id,
        checkIn,
        checkOut,
        nights,
        roomIds: selectedRoomIds,
        selectedRooms,
        estimatedAmount,
      }
    }))
  }

  // Scroll horizontal carousel
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (rowsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      rowsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleBackToStays = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/stays')
    }
  }

  return (
    <section
      id="choose-cottage"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        borderTop: '1px solid var(--hill-border, #e2e8f0)',
        borderBottom: '1px solid var(--hill-border, #e2e8f0)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 5rem)',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: 'var(--container-w, 1200px)', margin: '0 auto' }}>

        {/* Back Button */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={handleBackToStays}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '100px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <FiArrowLeft /> Back to Stays
          </button>
        </div>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--hill-blue-bright, #0878FF)',
            marginBottom: '0.5rem',
            display: 'block'
          }}>
        
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            color: 'var(--hill-navy, #00091f)',
            marginBottom: '0.5rem'
          }}>
            Choose Your Cottage
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--hill-muted, #64748b)', maxWidth: '560px', margin: '0 auto' }}>
            Interactive property map for <strong>{hotel.name}</strong>. Select your stay dates to verify live availability and reserve your preferred cottages.
          </p>
        </div>

        {/* Centered Compact Date Range Picker */}
        <div style={{ marginBottom: '2rem' }}>
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={handleDateChange}
          />
        </div>

        {/* Live Loading / Error Indicators */}
        {loadingAvailability && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#0878FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #0878FF', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            Verifying dates against live reservations...
          </div>
        )}

        {apiError && (
          <div style={{
            maxWidth: '520px',
            margin: '0 auto 1.5rem',
            padding: '0.75rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiAlertCircle /> {apiError}
          </div>
        )}

        {/* Total Room Status Summary Header (Dynamic Counter Bar) */}
        {rooms.length > 0 && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '0.85rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                {roomStatusSummary.total} {roomStatusSummary.total === 1 ? 'Cottage' : 'Cottages'} Total
              </span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                {roomStatusSummary.available} Available
              </span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                {roomStatusSummary.booked} Booked
              </span>
              {roomStatusSummary.maintenance > 0 && (
                <>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} />
                    {roomStatusSummary.maintenance} Maintenance
                  </span>
                </>
              )}
            </div>

            {/* Carousel Arrow Movement Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll left"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll right"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Property Room Layout Cards Container */}
        {rooms.length === 0 ? (
          <div style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '20px',
            border: '2px dashed #cbd5e1',
            margin: '2rem 0'
          }}>
            <FiInfo style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
              Cottages are not configured for this stay yet
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Add cottages for {hotel.name} in the Admin Dashboard.
            </p>
          </div>
        ) : (
          <div
            ref={rowsContainerRef}
            style={{
              overflowX: 'auto',
              paddingBottom: '1rem',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 'min-content' }}>
              {rowsMap.map(({ rowNum, rooms: rowRooms }, rIdx) => (
                <div key={rowNum} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Row Indicator Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      whiteSpace: 'nowrap'
                    }}>
                      ROW {rowNum} · {rIdx === 0 ? 'EAST GARDEN WING' : 'WEST GARDEN WING'}
                    </span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>

                  {/* Cards Grid / Flex Carousel */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: '1.25rem',
                  }}>
                    {rowRooms.map(room => {
                      const computedObj = availabilityData[room.id]
                      const baseStatus = room.status

                      let finalStatus: 'available' | 'selected' | 'booked' | 'maintenance' = 'available'

                      if (baseStatus === 'maintenance') {
                        finalStatus = 'maintenance'
                      } else if (computedObj?.computedStatus === 'booked') {
                        finalStatus = 'booked'
                      } else if (selectedRoomIds.includes(room.id)) {
                        finalStatus = 'selected'
                      } else {
                        finalStatus = 'available'
                      }

                      const isSelectable = finalStatus === 'available' || finalStatus === 'selected'
                      const isSelected = finalStatus === 'selected'

                      const catTheme = CATEGORY_STYLING[room.category] || CATEGORY_STYLING.Normal

                      // Glassmorphism Card Style
                      let cardBg = 'rgba(255, 255, 255, 0.95)'
                      let cardBorder = `1.5px solid ${isSelected ? '#0878FF' : '#e2e8f0'}`
                      let shadow = isSelected ? '0 10px 30px rgba(8, 120, 255, 0.2)' : '0 4px 15px rgba(0, 0, 0, 0.04)'
                      let badgeBg = isSelected ? '#0878FF' : catTheme.badgeBg
                      let badgeText = isSelected ? '#ffffff' : catTheme.text
                      let statusBadgeText = finalStatus.toUpperCase()

                      if (finalStatus === 'booked') {
                        cardBg = 'rgba(254, 242, 242, 0.85)'
                        cardBorder = '1.5px solid #fecaca'
                        badgeBg = 'rgba(239, 68, 68, 0.15)'
                        badgeText = '#dc2626'
                      } else if (finalStatus === 'maintenance') {
                        cardBg = 'rgba(241, 245, 249, 0.85)'
                        cardBorder = '1.5px solid #cbd5e1'
                        badgeBg = 'rgba(100, 116, 139, 0.15)'
                        badgeText = '#64748b'
                      }

                      return (
                        <div
                          key={room.id}
                          style={{
                            minWidth: '240px',
                            maxWidth: '280px',
                            flex: '0 0 auto',
                            background: cardBg,
                            backdropFilter: 'blur(12px)',
                            border: cardBorder,
                            borderRadius: '18px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: shadow,
                            transition: 'all 0.25s ease',
                            position: 'relative',
                            transform: isSelected ? 'translateY(-3px)' : 'none'
                          }}
                        >
                          <div>
                            {/* Card Top Pill Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <span style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.15rem',
                                fontWeight: 800,
                                color: '#00091f',
                                letterSpacing: '0.02em'
                              }}>
                                {room.roomNumber}
                              </span>
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: '100px',
                                background: badgeBg,
                                color: badgeText,
                                letterSpacing: '0.05em'
                              }}>
                                {statusBadgeText}
                              </span>
                            </div>

                            {/* Title & Category Accent */}
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.65rem', color: catTheme.text, fontWeight: 700, textTransform: 'uppercase' }}>
                                {room.category}
                              </span>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                                {room.name}
                              </h4>
                            </div>

                            {/* Capacity Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
                              <FiUser style={{ color: '#0878FF' }} /> {room.capacity} Guests / Cots
                            </div>
                          </div>

                          <div>
                            {/* Price / Night */}
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              color: '#00091f',
                              borderTop: '1px solid #f1f5f9',
                              paddingTop: '0.75rem',
                              marginBottom: '0.75rem',
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '4px'
                            }}>
                              ₹{room.pricePerNight.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748b' }}>/ night</span>
                            </div>

                            {/* Card Action Buttons */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedRoomForModal(room)}
                                style={{
                                  flex: 1,
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FiEye /> Details
                              </button>

                              <button
                                type="button"
                                disabled={!isSelectable}
                                onClick={() => toggleRoomSelection(room, isSelectable)}
                                style={{
                                  flex: 1.5,
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: isSelected ? 'none' : '1px solid #0878FF',
                                  background: isSelected ? '#0056b3' : isSelectable ? '#0878FF' : '#e2e8f0',
                                  color: isSelectable ? '#ffffff' : '#94a3b8',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: isSelectable ? 'pointer' : 'not-allowed',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isSelected ? (
                                  <>
                                    <FiCheck /> Selected
                                  </>
                                ) : isSelectable ? (
                                  'Select'
                                ) : (
                                  'Booked'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection Summary Floating Bar */}
        {selectedRooms.length > 0 && (
          <div style={{
            background: 'var(--hill-navy, #00091f)',
            borderRadius: '20px',
            padding: '1.5rem 2rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 15px 40px rgba(0, 9, 31, 0.25)',
            marginTop: '2.5rem',
            animation: 'fadeInSummary 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright, #0878FF)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                Your Selected Cottages
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {Object.entries(categorySummary).map(([cat, count]) => (
                  <span key={cat} style={{ background: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {cat}: <strong>{count} {count === 1 ? 'cottage' : 'cottages'}</strong>
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '1.25rem' }}>
                <span>Total Cottages: <strong>{selectedRooms.length}</strong></span>
                <span>Stay Duration: <strong>{nights > 0 ? nights : 1} {nights === 1 ? 'night' : 'nights'}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '2px' }}>
                  Estimated Total Stay Amount
                </span>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', lineHeight: 1, margin: 0 }}>
                  ₹{estimatedAmount.toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={handleContinueCTA}
                className="btn-primary"
                style={{
                  padding: '0.9rem 1.85rem',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '12px'
                }}
              >
                Continue with Selected Rooms <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Cottage Details Modal */}
        {selectedRoomForModal && (
          <CottageDetailsModal
            room={selectedRoomForModal}
            stayHeroImage={hotel.image}
            isAvailable={!(availabilityData[selectedRoomForModal.id]?.computedStatus === 'booked' || selectedRoomForModal.status === 'maintenance')}
            isSelected={selectedRoomIds.includes(selectedRoomForModal.id)}
            computedStatus={availabilityData[selectedRoomForModal.id]?.computedStatus || selectedRoomForModal.status}
            unavailableReason={availabilityData[selectedRoomForModal.id]?.unavailableReason}
            onClose={() => setSelectedRoomForModal(null)}
            onToggleSelect={(r) => toggleRoomSelection(r, !(availabilityData[r.id]?.computedStatus === 'booked' || r.status === 'maintenance'))}
          />
        )}

        {/* Modal Popup for Stay Room Selection */}
        {showEnquiryModal && (
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
            onClick={() => setShowEnquiryModal(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Enquire for ${hotel.name}`}
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
                onClick={() => setShowEnquiryModal(false)}
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
                initialHotelId={hotel.id}
                initialHotels={[hotel]}
              />
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInSummary { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  )
}
