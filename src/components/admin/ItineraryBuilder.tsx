'use client'

import React, { useState, useEffect } from 'react'
import type { Package, Hotel, Vehicle, ItineraryDay } from '@/types/domain'
import { getOptimizedImageUrl } from '@/lib/cloudinary/transform'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { generateItineraryPDF, type ItineraryPdfData, type ItineraryPdfDay } from '@/lib/pdf/generateItineraryPdf'
import { useAdminToast } from '@/components/admin/ToastProvider'
import {
  FiCalendar,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiCopy,
  FiChevronUp,
  FiChevronDown,
  FiDownload,
  FiCheck,
  FiX,
  FiSearch,
  FiMapPin,
  FiClock,
  FiUser,
  FiDollarSign,
  FiRefreshCw,
  FiHome,
  FiTruck,
  FiInfo,
} from 'react-icons/fi'

interface ItineraryBuilderProps {
  packages: Package[]
  hotels: Hotel[]
  vehicles: Vehicle[]
}

interface CustomScheduleItem {
  id: string
  time: string
  activity: string
}

interface CustomDayItem {
  id: string
  day: number
  dateStr: string
  dayOfWeek: string
  title: string
  description: string
  imageUrl: string
  schedule: CustomScheduleItem[]
}

export default function ItineraryBuilder({ packages, hotels, vehicles }: ItineraryBuilderProps) {
  const toast = useAdminToast()

  // Mode: 'select' | 'custom'
  const [mode, setMode] = useState<'select' | 'custom'>('select')
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [packageSearch, setPackageSearch] = useState('')

  // Customized Itinerary State (independent of original package record)
  const [packageName, setPackageName] = useState('')
  const [packageSlug, setPackageSlug] = useState('')
  const [tagline, setTagline] = useState('TEA GARDENS | MISTY MOUNTAINS | SCENIC BEAUTY')
  const [destination, setDestination] = useState('Munnar, Kerala')
  const [duration, setDuration] = useState('4 Days / 3 Nights')
  const [nights, setNights] = useState<number | string>(3)
  const [category, setCategory] = useState('Family')
  const [pricePerPerson, setPricePerPerson] = useState('₹12,999')
  const [priceNote, setPriceNote] = useState('per person')

  // Travelers & Dates
  const [travelerName, setTravelerName] = useState('')
  const [adultsCount, setAdultsCount] = useState(2)
  const [childrenCount, setChildrenCount] = useState(1)
  const [travelDatesText, setTravelDatesText] = useState('12 Dec 2024 - 15 Dec 2024')

  // Days
  const [days, setDays] = useState<CustomDayItem[]>([
    {
      id: 'day-1',
      day: 1,
      dateStr: '12 Dec 2024',
      dayOfWeek: 'Thursday',
      title: 'Arrival in Munnar',
      description: 'Arrive at Munnar, hotel check-in, visit Tea Museum and explore local attractions.',
      imageUrl: '',
      schedule: [
        { id: 's-1', time: '10:00 AM', activity: 'Arrival & Hotel Check-in' },
        { id: 's-2', time: '12:00 PM', activity: 'Tea Museum Visit' },
        { id: 's-3', time: '03:00 PM', activity: 'Local Sightseeing' },
        { id: 's-4', time: '07:00 PM', activity: 'Overnight Stay at Hotel' },
      ],
    },
    {
      id: 'day-2',
      day: 2,
      dateStr: '13 Dec 2024',
      dayOfWeek: 'Friday',
      title: 'Mattupetty, Echo Point & Kundala',
      description: 'Visit Mattupetty Dam, Echo Point, Kundala Lake and tea plantations.',
      imageUrl: '',
      schedule: [
        { id: 's-5', time: '09:00 AM', activity: 'Mattupetty Dam' },
        { id: 's-6', time: '11:00 AM', activity: 'Echo Point' },
        { id: 's-7', time: '01:00 PM', activity: 'Kundala Lake' },
        { id: 's-8', time: '03:00 PM', activity: 'Tea Plantation Visit' },
        { id: 's-9', time: '07:00 PM', activity: 'Overnight Stay at Hotel' },
      ],
    },
    {
      id: 'day-3',
      day: 3,
      dateStr: '14 Dec 2024',
      dayOfWeek: 'Saturday',
      title: 'Eravikulam National Park & Top Station',
      description: 'Explore wildlife, panoramic views and local markets.',
      imageUrl: '',
      schedule: [
        { id: 's-10', time: '08:00 AM', activity: 'Eravikulam National Park' },
        { id: 's-11', time: '01:00 PM', activity: 'Top Station' },
        { id: 's-12', time: '04:00 PM', activity: 'Local Market Visit' },
        { id: 's-13', time: '07:00 PM', activity: 'Overnight Stay at Hotel' },
      ],
    },
    {
      id: 'day-4',
      day: 4,
      dateStr: '15 Dec 2024',
      dayOfWeek: 'Sunday',
      title: 'Departure',
      description: 'Breakfast, checkout, optional shopping and departure.',
      imageUrl: '',
      schedule: [
        { id: 's-14', time: '08:00 AM', activity: 'Breakfast at Hotel' },
        { id: 's-15', time: '10:00 AM', activity: 'Hotel Check-out' },
        { id: 's-16', time: '12:00 PM', activity: 'Shopping (Optional)' },
        { id: 's-17', time: '02:00 PM', activity: 'Departure from Munnar' },
      ],
    },
  ])

  // Stay & Vehicle selection/overrides
  const [selectedHotelId, setSelectedHotelId] = useState('')
  const [customStayName, setCustomStayName] = useState('The Misty Mountain Resort')
  const [customStayLocation, setCustomStayLocation] = useState('Munnar, Kerala')
  const [customStayRating, setCustomStayRating] = useState('4.6')
  const [customStayReviews, setCustomStayReviews] = useState('128')
  const [customStayNights, setCustomStayNights] = useState('3')
  const [customStayRoomType, setCustomStayRoomType] = useState('Deluxe Room')
  const [stayImageUrl, setStayImageUrl] = useState('')

  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [customVehicleName, setCustomVehicleName] = useState('Innova Crysta')
  const [customVehicleCapacity, setCustomVehicleCapacity] = useState('6+1 Seats')
  const [customVehicleAc, setCustomVehicleAc] = useState(true)
  const [vehicleImageUrl, setVehicleImageUrl] = useState('')

  // Inclusions / Exclusions
  const [inclusions, setInclusions] = useState<string[]>([
    'Accommodation for specified nights',
    'Daily breakfast & dinner',
    'Private vehicle for the entire trip',
    'All sightseeing as per itinerary',
    'Driver allowance, toll & parking',
  ])
  const [exclusions, setExclusions] = useState<string[]>([
    'Airfare / Train fare',
    'Entry tickets (if any)',
    'Personal expenses & shopping',
    'Adventure activities (optional)',
    'Anything not mentioned in inclusions',
  ])

  const [newInclusionText, setNewInclusionText] = useState('')
  const [newExclusionText, setNewExclusionText] = useState('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // ── POPULATE FROM EXISTING PACKAGE ──
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackageId(pkg.id)
    setPackageName(pkg.name || '')
    setPackageSlug(pkg.slug || pkg.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '')
    setTagline(pkg.tag ? `${pkg.tag.toUpperCase()} | ${pkg.destination?.toUpperCase() || 'HILL TOUR'}` : 'TEA GARDENS | MISTY MOUNTAINS | SCENIC BEAUTY')
    setDestination(pkg.destination || 'Munnar, Kerala')
    setDuration(pkg.duration || '4 Days / 3 Nights')
    setNights(pkg.nights !== undefined ? pkg.nights : 3)
    setCategory(pkg.category || 'Family')
    setPricePerPerson(pkg.price || '₹12,999')
    setPriceNote(pkg.priceNote || 'per person')

    // Day-wise itinerary
    if (pkg.itinerary && pkg.itinerary.length > 0) {
      const convertedDays: CustomDayItem[] = pkg.itinerary.map((d, i) => {
        const schedule: CustomScheduleItem[] = []
        if (d.activities && d.activities.length > 0) {
          d.activities.forEach((act, actIdx) => {
            schedule.push({
              id: `sched-${i}-${actIdx}`,
              time: `${9 + actIdx * 2}:00 AM`,
              activity: act,
            })
          })
        } else {
          schedule.push({ id: `sched-${i}-0`, time: '10:00 AM', activity: 'Day sightseeing & exploration' })
        }

        return {
          id: `day-${i + 1}`,
          day: d.day || i + 1,
          dateStr: `Day ${d.day || i + 1}`,
          dayOfWeek: '',
          title: d.title || `Day ${i + 1}`,
          description: d.description || '',
          imageUrl: d.images && d.images.length > 0 ? d.images[0] : (pkg.coverImage || pkg.image || ''),
          schedule,
        }
      })
      setDays(convertedDays)
    }

    // Inclusions & Exclusions
    if (pkg.inclusions && pkg.inclusions.length > 0) {
      setInclusions(pkg.inclusions)
    }
    if (pkg.exclusions && pkg.exclusions.length > 0) {
      setExclusions(pkg.exclusions)
    }

    // Connected Stays
    if (pkg.hotelIds && pkg.hotelIds.length > 0) {
      const matchedHotel = hotels.find((h) => h.id === pkg.hotelIds![0])
      if (matchedHotel) {
        setSelectedHotelId(matchedHotel.id)
        setCustomStayName(matchedHotel.name)
        setCustomStayLocation(matchedHotel.location || pkg.destination || '')
        setCustomStayRating(matchedHotel.rating ? String(matchedHotel.rating) : '4.6')
        setStayImageUrl(matchedHotel.image || '')
      }
    }

    // Connected Vehicles
    if (pkg.vehicleIds && pkg.vehicleIds.length > 0) {
      const matchedVeh = vehicles.find((v) => v.id === pkg.vehicleIds![0])
      if (matchedVeh) {
        setSelectedVehicleId(matchedVeh.id)
        setCustomVehicleName(matchedVeh.name)
        setCustomVehicleCapacity(`${matchedVeh.capacity} Seats`)
        setVehicleImageUrl(matchedVeh.image || '')
      }
    }

    toast.success(`Loaded package "${pkg.name}". You can now customize and export PDF.`)
  }

  // Calculate Numeric Total Cost
  const numericPrice = parseInt(pricePerPerson.replace(/[^0-9]/g, ''), 10) || 0
  const totalTravelers = adultsCount + childrenCount
  const estimatedTotalCostVal = numericPrice * totalTravelers
  const formattedTotalCost = estimatedTotalCostVal > 0 ? `₹${estimatedTotalCostVal.toLocaleString('en-IN')}` : '₹38,997'

  // Filter packages list
  const filteredPackages = packages.filter((p) => {
    if (!packageSearch) return true
    const q = packageSearch.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))
  })

  // ── DAYWISE HANDLERS ──
  const handleAddDay = () => {
    const nextDayNum = days.length + 1
    setDays([
      ...days,
      {
        id: `day-${Date.now()}`,
        day: nextDayNum,
        dateStr: `Day ${nextDayNum}`,
        dayOfWeek: '',
        title: `Day ${nextDayNum} Sightseeing`,
        description: 'Explore scenic attractions, local viewpoints and return for evening relaxation.',
        imageUrl: '',
        schedule: [{ id: `sched-${Date.now()}`, time: '09:00 AM', activity: 'Morning Sightseeing Tour' }],
      },
    ])
  }

  const handleUpdateDay = (index: number, field: keyof CustomDayItem, value: any) => {
    const updated = [...days]
    updated[index] = { ...updated[index], [field]: value }
    setDays(updated)
  }

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) {
      toast.error('Itinerary must have at least 1 day.')
      return
    }
    const updated = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }))
    setDays(updated)
  }

  const handleReorderDay = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= days.length) return
    const updated = [...days]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setDays(updated.map((d, i) => ({ ...d, day: i + 1 })))
  }

  const handleDuplicateDay = (index: number) => {
    const source = days[index]
    const duplicated: CustomDayItem = {
      ...source,
      id: `day-${Date.now()}`,
      day: days.length + 1,
      title: `${source.title} (Copy)`,
      schedule: source.schedule.map((s, i) => ({ ...s, id: `sched-${Date.now()}-${i}` })),
    }
    setDays([...days, duplicated])
  }

  // Schedule slot handlers inside a day
  const handleAddScheduleSlot = (dayIndex: number) => {
    const updated = [...days]
    updated[dayIndex].schedule.push({
      id: `sched-${Date.now()}`,
      time: '02:00 PM',
      activity: 'New Activity Spot',
    })
    setDays(updated)
  }

  const handleUpdateScheduleSlot = (dayIndex: number, slotIndex: number, field: 'time' | 'activity', val: string) => {
    const updated = [...days]
    updated[dayIndex].schedule[slotIndex][field] = val
    setDays(updated)
  }

  const handleRemoveScheduleSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...days]
    updated[dayIndex].schedule = updated[dayIndex].schedule.filter((_, i) => i !== slotIndex)
    setDays(updated)
  }

  // ── INCLUSIONS / EXCLUSIONS HANDLERS ──
  const handleAddInclusion = () => {
    if (!newInclusionText.trim()) return
    setInclusions([...inclusions, newInclusionText.trim()])
    setNewInclusionText('')
  }

  const handleAddExclusion = () => {
    if (!newExclusionText.trim()) return
    setExclusions([...exclusions, newExclusionText.trim()])
    setNewExclusionText('')
  }

  // ── PDF GENERATION HANDLER ──
  const handleDownloadPdf = async () => {
    if (!packageName.trim()) {
      toast.error('Itinerary title / package name is required.')
      return
    }

    setIsGeneratingPdf(true)
    const toastId = toast.loading('Generating Travel Itinerary PDF...')
    try {
      const travelersText = travelerName.trim()
        ? `${travelerName.trim()} (${adultsCount} Adults, ${childrenCount} Child)`
        : `${adultsCount} Adults, ${childrenCount} Child`

      const pdfData: ItineraryPdfData = {
        packageName,
        packageSlug: packageSlug || packageName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline,
        destination,
        duration,
        nights,
        travelersText,
        travelDatesText,
        category,
        pricePerPerson,
        priceNote,
        adultsCount,
        childrenCount,
        estimatedTotalCost: formattedTotalCost,
        days: days.map((d) => ({
          day: d.day,
          dateStr: d.dateStr,
          dayOfWeek: d.dayOfWeek,
          title: d.title,
          description: d.description,
          schedule: d.schedule.map((s) => ({ time: s.time, activity: s.activity })),
          imageUrl: d.imageUrl,
        })),
        stay: {
          name: customStayName,
          location: customStayLocation,
          rating: customStayRating,
          reviewsCount: customStayReviews,
          nights: customStayNights,
          roomType: customStayRoomType,
          imageUrl: stayImageUrl,
        },
        vehicle: {
          name: customVehicleName,
          capacity: customVehicleCapacity,
          isAc: customVehicleAc,
          imageUrl: vehicleImageUrl,
        },
        inclusions,
        exclusions,
      }

      await generateItineraryPDF(pdfData)
      toast.dismiss(toastId)
      toast.success('Itinerary PDF downloaded successfully!')
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      toast.dismiss(toastId)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── HEADER BAR ── */}
      <div
        style={{
          background: 'var(--admin-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
            Travel Itinerary Builder
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Build, customize, and export high-resolution travel itineraries as professional PDF documents.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.9rem',
            borderRadius: '8px',
            cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
            opacity: isGeneratingPdf ? 0.7 : 1,
            background: 'var(--hill-blue-bright, #0878FF)',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            boxShadow: '0 4px 14px rgba(8, 120, 255, 0.3)',
          }}
        >
          <FiDownload size={16} />
          {isGeneratingPdf ? 'Generating PDF...' : 'Download Itinerary PDF'}
        </button>
      </div>

      {/* ── MODE SELECTOR (FLOW 1: SELECT EXISTING PACKAGE | FLOW 2: CREATE NEW ITINERARY) ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setMode('select')}
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            background: mode === 'select' ? 'var(--admin-brand, #0878FF)' : 'var(--admin-card)',
            color: mode === 'select' ? '#ffffff' : 'var(--admin-text)',
            border: mode === 'select' ? '1px solid var(--admin-brand)' : '1px solid var(--admin-border)',
            transition: 'all 0.2s ease',
          }}
        >
          <FiPackage size={18} /> Select Existing Package
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('custom')
            setSelectedPackageId(null)
            toast.info('Started clean custom itinerary builder.')
          }}
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            background: mode === 'custom' ? 'var(--admin-brand, #0878FF)' : 'var(--admin-card)',
            color: mode === 'custom' ? '#ffffff' : 'var(--admin-text)',
            border: mode === 'custom' ? '1px solid var(--admin-brand)' : '1px solid var(--admin-border)',
            transition: 'all 0.2s ease',
          }}
        >
          <FiPlus size={18} /> Create New Itinerary (From Scratch)
        </button>
      </div>

      {/* ── PACKAGE SELECTION CARDS LISTING (MODE === 'select') ── */}
      {mode === 'select' && (
        <div
          style={{
            background: 'var(--admin-card)',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Choose a Package to Populate Itinerary
            </h3>
            {selectedPackageId && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(34,197,94,0.15)',
                  color: '#86EFAC',
                  border: '1px solid rgba(34,197,94,0.3)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <FiCheck size={12} /> Package Selected
              </span>
            )}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            <input
              type="text"
              placeholder="Search existing packages by title, destination, category..."
              value={packageSearch}
              onChange={(e) => setPackageSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1px solid var(--admin-input-border)',
                background: 'var(--admin-input-bg)',
                color: 'var(--admin-input-text)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {/* Packages Visual Responsive Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: '1rem',
            }}
          >
            {filteredPackages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id
              const imgRaw = pkg.coverImage || pkg.image
              const optimizedImg = imgRaw ? getOptimizedImageUrl(imgRaw, { width: 500, height: 320, crop: 'fill' }) : '/logo.png'

              return (
                <div
                  key={pkg.id}
                  style={{
                    background: isSelected ? 'var(--admin-surface-alt, rgba(8, 120, 255, 0.08))' : 'var(--admin-bg, rgba(255, 255, 255, 0.03))',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--hill-blue-bright, #0878FF)' : '1px solid var(--admin-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Thumbnail Cover Image */}
                  <div style={{ width: '100%', height: '140px', background: '#000c28', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={optimizedImg}
                      alt={pkg.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: any) => {
                        e.target.src = '/logo.png'
                        e.target.style.objectFit = 'contain'
                        e.target.style.padding = '20px'
                      }}
                    />
                    {pkg.active !== false ? (
                      <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(34, 197, 94, 0.9)', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        ACTIVE
                      </span>
                    ) : (
                      <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(100, 116, 139, 0.9)', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        DRAFT
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--admin-text)' }}>
                        {pkg.name}
                      </h4>
                      <p style={{ color: 'var(--hill-blue-bright, #0878FF)', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiMapPin size={12} /> {pkg.destination}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>
                        <span>⏱ {pkg.duration || `${pkg.nights || 3} Nights`}</span>
                        {pkg.category && <span>• {pkg.category}</span>}
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22C55E', margin: '0 0 10px 0' }}>
                        {pkg.price || '₹12,999'} <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 400 }}>{pkg.priceNote || 'per person'}</span>
                      </p>
                      {pkg.shortDescription && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                          {pkg.shortDescription}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg)}
                      style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: isSelected ? '#22C55E' : 'var(--admin-card-border, rgba(255, 255, 255, 0.1))',
                        color: isSelected ? '#ffffff' : 'var(--admin-text)',
                        border: isSelected ? '1px solid #22C55E' : '1px solid var(--admin-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected ? <><FiCheck size={14} /> Selected Package</> : 'Select Package'}
                    </button>
                  </div>
                </div>
              )
            })}
            {filteredPackages.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                No packages found matching search filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CUSTOMIZATION & EDITING AREA ── */}
      {/* 1. BASIC INFORMATION & TRAVELER DETAILS */}
      <div
        style={{
          background: 'var(--admin-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
          1. Basic Information & Traveler Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Itinerary Title / Package Name *
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. Munnar Escape"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. TEA GARDENS | MISTY MOUNTAINS | SCENIC BEAUTY"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Destination *
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Munnar, Kerala"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Duration Display
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 4 Days / 3 Nights"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Customer / Traveler Name (Optional)
            </label>
            <input
              type="text"
              value={travelerName}
              onChange={(e) => setTravelerName(e.target.value)}
              placeholder="e.g. Mr. John Doe & Family"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Travel Dates
            </label>
            <input
              type="text"
              value={travelDatesText}
              onChange={(e) => setTravelDatesText(e.target.value)}
              placeholder="e.g. 12 Dec 2024 - 15 Dec 2024"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Adults Count
            </label>
            <input
              type="number"
              min={1}
              value={adultsCount}
              onChange={(e) => setAdultsCount(parseInt(e.target.value, 10) || 1)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Children Count
            </label>
            <input
              type="number"
              min={0}
              value={childrenCount}
              onChange={(e) => setChildrenCount(parseInt(e.target.value, 10) || 0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
              Price per Person
            </label>
            <input
              type="text"
              value={pricePerPerson}
              onChange={(e) => setPricePerPerson(e.target.value)}
              placeholder="e.g. ₹12,999"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)' }}
            />
          </div>
        </div>
      </div>

      {/* 2. DAY WISE ITINERARY EDITOR */}
      <div
        style={{
          background: 'var(--admin-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            2. Day-Wise Timeline Editor
          </h3>
          <button
            type="button"
            onClick={handleAddDay}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'var(--hill-blue-bright, #0878FF)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FiPlus size={14} /> Add Day
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {days.map((dayItem, dIdx) => (
            <div
              key={dayItem.id}
              style={{
                background: 'var(--admin-bg, rgba(255, 255, 255, 0.03))',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--admin-border)',
              }}
            >
              {/* Day Header Control Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'var(--admin-brand, #0878FF)',
                    color: '#ffffff',
                  }}
                >
                  Day {dayItem.day}
                </span>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleReorderDay(dIdx, 'up')}
                    disabled={dIdx === 0}
                    title="Move Up"
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: dIdx === 0 ? 'not-allowed' : 'pointer', opacity: dIdx === 0 ? 0.4 : 1 }}
                  >
                    <FiChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorderDay(dIdx, 'down')}
                    disabled={dIdx === days.length - 1}
                    title="Move Down"
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: dIdx === days.length - 1 ? 'not-allowed' : 'pointer', opacity: dIdx === days.length - 1 ? 0.4 : 1 }}
                  >
                    <FiChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateDay(dIdx)}
                    title="Duplicate Day"
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: 'pointer' }}
                  >
                    <FiCopy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(dIdx)}
                    title="Delete Day"
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', cursor: 'pointer' }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Day Title & Date info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Day Title</label>
                  <input
                    type="text"
                    value={dayItem.title}
                    onChange={(e) => handleUpdateDay(dIdx, 'title', e.target.value)}
                    placeholder="e.g. Arrival in Munnar"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Date String (Optional)</label>
                  <input
                    type="text"
                    value={dayItem.dateStr}
                    onChange={(e) => handleUpdateDay(dIdx, 'dateStr', e.target.value)}
                    placeholder="e.g. 12 Dec 2024"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Day of Week (Optional)</label>
                  <input
                    type="text"
                    value={dayItem.dayOfWeek}
                    onChange={(e) => handleUpdateDay(dIdx, 'dayOfWeek', e.target.value)}
                    placeholder="e.g. Thursday"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Day Description */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Day Summary Description</label>
                <textarea
                  rows={2}
                  value={dayItem.description}
                  onChange={(e) => handleUpdateDay(dIdx, 'description', e.target.value)}
                  placeholder="Arrive at Munnar, hotel check-in..."
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Day Image URL */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Day Image URL (Existing Cloudinary/CDN or upload)</label>
                <ImageUploadField
                  value={dayItem.imageUrl}
                  onChange={(url) => handleUpdateDay(dIdx, 'imageUrl', url)}
                  folder="packages"
                  placeholder="Paste existing Cloudinary image URL or upload image"
                />
              </div>

              {/* Schedule Slots List */}
              <div style={{ background: 'var(--admin-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Time Schedule Slots</span>
                  <button
                    type="button"
                    onClick={() => handleAddScheduleSlot(dIdx)}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(8, 120, 255, 0.15)', color: 'var(--admin-brand, #0878FF)', border: '1px solid rgba(8, 120, 255, 0.3)', cursor: 'pointer' }}
                  >
                    + Add Slot
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dayItem.schedule.map((slot, sIdx) => (
                    <div key={slot.id} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={slot.time}
                        onChange={(e) => handleUpdateScheduleSlot(dIdx, sIdx, 'time', e.target.value)}
                        placeholder="10:00 AM"
                        style={{ width: '100px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        value={slot.activity}
                        onChange={(e) => handleUpdateScheduleSlot(dIdx, sIdx, 'activity', e.target.value)}
                        placeholder="Arrival & Hotel Check-in"
                        style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.8rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveScheduleSlot(dIdx, sIdx)}
                        style={{ padding: '4px 6px', borderRadius: '4px', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {dayItem.schedule.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: 0 }}>No schedule slots added yet.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. STAY & VEHICLE DETAILS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
        {/* STAY DETAILS */}
        <div
          style={{
            background: 'var(--admin-card)',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiHome style={{ color: 'var(--admin-brand, #0878FF)' }} /> Stay & Hotel Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {hotels.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Quick Select Existing Hotel</label>
                <select
                  value={selectedHotelId}
                  onChange={(e) => {
                    const hId = e.target.value
                    setSelectedHotelId(hId)
                    const match = hotels.find((h) => h.id === hId)
                    if (match) {
                      setCustomStayName(match.name)
                      setCustomStayLocation(match.location || destination)
                      setCustomStayRating(match.rating ? String(match.rating) : '4.6')
                      setStayImageUrl(match.image || '')
                    }
                  }}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                >
                  <option value="">-- Choose Hotel from System --</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.location || h.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Hotel Name</label>
              <input
                type="text"
                value={customStayName}
                onChange={(e) => setCustomStayName(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Location</label>
                <input
                  type="text"
                  value={customStayLocation}
                  onChange={(e) => setCustomStayLocation(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Rating (e.g. 4.6)</label>
                <input
                  type="text"
                  value={customStayRating}
                  onChange={(e) => setCustomStayRating(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Duration (Nights)</label>
                <input
                  type="text"
                  value={customStayNights}
                  onChange={(e) => setCustomStayNights(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Room Type</label>
                <input
                  type="text"
                  value={customStayRoomType}
                  onChange={(e) => setCustomStayRoomType(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Hotel Image URL</label>
              <ImageUploadField
                value={stayImageUrl}
                onChange={(url) => setStayImageUrl(url)}
                folder="hotels"
                placeholder="Paste hotel image URL or upload image"
              />
            </div>
          </div>
        </div>

        {/* VEHICLE DETAILS */}
        <div
          style={{
            background: 'var(--admin-card)',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiTruck style={{ color: 'var(--admin-brand, #0878FF)' }} /> Vehicle & Transport Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {vehicles.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Quick Select Fleet Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    const vId = e.target.value
                    setSelectedVehicleId(vId)
                    const match = vehicles.find((v) => v.id === vId)
                    if (match) {
                      setCustomVehicleName(match.name)
                      setCustomVehicleCapacity(`${match.capacity} Seats`)
                      setVehicleImageUrl(match.image || '')
                    }
                  }}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                >
                  <option value="">-- Choose Vehicle from System --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type} - {v.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Vehicle Model / Name</label>
              <input
                type="text"
                value={customVehicleName}
                onChange={(e) => setCustomVehicleName(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Capacity Info</label>
                <input
                  type="text"
                  value={customVehicleCapacity}
                  onChange={(e) => setCustomVehicleCapacity(e.target.value)}
                  placeholder="e.g. 6+1 Seats"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Air Conditioning</label>
                <button
                  type="button"
                  onClick={() => setCustomVehicleAc(!customVehicleAc)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--admin-input-border)',
                    background: customVehicleAc ? 'rgba(34,197,94,0.15)' : 'var(--admin-input-bg)',
                    color: customVehicleAc ? '#86EFAC' : 'var(--admin-input-text)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {customVehicleAc ? '✓ Air Conditioned (AC)' : 'Non-AC Vehicle'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>Vehicle Image URL</label>
              <ImageUploadField
                value={vehicleImageUrl}
                onChange={(url) => setVehicleImageUrl(url)}
                folder="vehicles"
                placeholder="Paste vehicle image URL or upload image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. INCLUSIONS & EXCLUSIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
        {/* INCLUSIONS */}
        <div
          style={{
            background: 'var(--admin-card)',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.85rem 0', color: '#22C55E' }}>
            ✓ Package Inclusions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '0.85rem' }}>
            {inclusions.map((inc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.8rem' }}>
                <span>✓ {inc}</span>
                <button
                  type="button"
                  onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                  style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={newInclusionText}
              onChange={(e) => setNewInclusionText(e.target.value)}
              placeholder="e.g. Breakfast & Dinner included"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInclusion(); } }}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.82rem' }}
            />
            <button
              type="button"
              onClick={handleAddInclusion}
              style={{ padding: '6px 12px', borderRadius: '6px', background: '#22C55E', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
        </div>

        {/* EXCLUSIONS */}
        <div
          style={{
            background: 'var(--admin-card)',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.85rem 0', color: '#EF4444' }}>
            ✕ Package Exclusions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '0.85rem' }}>
            {exclusions.map((exc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.8rem' }}>
                <span>✕ {exc}</span>
                <button
                  type="button"
                  onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                  style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={newExclusionText}
              onChange={(e) => setNewExclusionText(e.target.value)}
              placeholder="e.g. Flight or Train tickets"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddExclusion(); } }}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--admin-input-border)', background: 'var(--admin-input-bg)', color: 'var(--admin-input-text)', fontSize: '0.82rem' }}
            />
            <button
              type="button"
              onClick={handleAddExclusion}
              style={{ padding: '6px 12px', borderRadius: '6px', background: '#EF4444', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* 5. ESTIMATED COST SUMMARY CARD */}
      <div
        style={{
          background: 'var(--admin-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiDollarSign style={{ color: 'var(--admin-brand, #0878FF)' }} /> Estimated Cost Summary
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', background: 'var(--admin-bg, rgba(0,0,0,0.2))', padding: '1rem', borderRadius: '8px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Package Cost (per person)</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0' }}>{pricePerPerson || '₹12,999'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Total Travelers</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0' }}>{totalTravelers} ({adultsCount} Adults, {childrenCount} Child)</p>
          </div>
          <div style={{ background: 'rgba(8, 120, 255, 0.12)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(8, 120, 255, 0.3)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--hill-blue-bright, #0878FF)', fontWeight: 700, textTransform: 'uppercase' }}>Estimated Total Cost</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hill-blue-bright, #0878FF)', margin: '2px 0 0 0' }}>{formattedTotalCost}</p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ACTIONS BAR ── */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--admin-card)',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
          <FiInfo size={16} />
          <span>Downloading will generate a professional vector PDF with selectable text. The original package record in the database will NOT be modified.</span>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '0.95rem',
            borderRadius: '8px',
            cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
            opacity: isGeneratingPdf ? 0.7 : 1,
            background: 'var(--hill-blue-bright, #0878FF)',
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            boxShadow: '0 4px 14px rgba(8, 120, 255, 0.35)',
          }}
        >
          <FiDownload size={18} />
          {isGeneratingPdf ? 'Generating PDF...' : 'Download Itinerary PDF'}
        </button>
      </div>
    </div>
  )
}
