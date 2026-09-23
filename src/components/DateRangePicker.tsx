'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi'

interface DateRangePickerProps {
  checkIn: string
  checkOut: string
  onChange: (checkIn: string, checkOut: string) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function DateRangePicker({ checkIn, checkOut, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectingStep, setSelectingStep] = useState<'checkIn' | 'checkOut'>('checkIn')
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse initial dates or set defaults to current month
  const todayDate = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const initialMonthDate = useMemo(() => {
    if (checkIn) {
      const d = new Date(checkIn)
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1)
    }
    return new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
  }, [checkIn, todayDate])

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialMonthDate)

  // Keep month view synced if checkIn changes externally
  useEffect(() => {
    if (checkIn) {
      const d = new Date(checkIn)
      if (!isNaN(d.getTime())) {
        setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1))
      }
    }
  }, [checkIn])

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculation for Nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const dIn = new Date(checkIn)
    const dOut = new Date(checkOut)
    const diffDays = Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }, [checkIn, checkOut])

  // Format YYYY-MM-DD
  const formatDateString = (d: Date): string => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Format readable label (e.g., "Oct 20, 2026")
  const formatReadableDate = (dateStr: string): string => {
    if (!dateStr) return 'Select Date'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Select Date'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Navigation between months
  const prevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Generate grid days for current month view
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days: Array<{ date: Date; dateStr: string; isCurrentMonth: boolean; isDisabled: boolean }> = []

    // Padding for previous month
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i)
      const dateStr = formatDateString(d)
      days.push({ date: d, dateStr, isCurrentMonth: false, isDisabled: true })
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day)
      d.setHours(0, 0, 0, 0)
      const dateStr = formatDateString(d)
      const isDisabled = d < todayDate
      days.push({ date: d, dateStr, isCurrentMonth: true, isDisabled })
    }

    // Padding for next month
    const totalCells = days.length
    const remaining = 42 - totalCells // 6 rows of 7
    if (remaining > 0 && remaining < 7) {
      for (let day = 1; day <= remaining; day++) {
        const d = new Date(year, month + 1, day)
        const dateStr = formatDateString(d)
        days.push({ date: d, dateStr, isCurrentMonth: false, isDisabled: true })
      }
    }

    return days
  }, [currentMonthDate, todayDate])

  const handleDateClick = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled) return

    if (!checkIn || selectingStep === 'checkIn') {
      onChange(dateStr, '')
      setSelectingStep('checkOut')
    } else if (selectingStep === 'checkOut') {
      if (dateStr <= checkIn) {
        // If clicked date is before/same as checkIn, set new checkIn
        onChange(dateStr, '')
        setSelectingStep('checkOut')
      } else {
        onChange(checkIn, dateStr)
        setSelectingStep('checkIn')
        setIsOpen(false) // Auto close once complete range is picked
      }
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      
      {/* Trigger Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '0.85rem 1.25rem',
          boxShadow: isOpen ? '0 8px 25px rgba(8, 120, 255, 0.15)' : '0 4px 15px rgba(0,0,0,0.04)',
          borderColor: isOpen ? 'var(--hill-blue-bright, #0878FF)' : '#e2e8f0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Left: Check-in */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>
            Check-In
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: checkIn ? '#0f172a' : '#94a3b8' }}>
            {formatReadableDate(checkIn)}
          </span>
        </div>

        {/* Center Divider & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(8, 120, 255, 0.08)', color: 'var(--hill-blue-bright, #0878FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiCalendar style={{ fontSize: '14px' }} />
          </div>
          {nights > 0 && (
            <span style={{
              background: '#0878FF',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '100px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(8, 120, 255, 0.3)'
            }}>
              {nights} {nights === 1 ? 'Night' : 'Nights'}
            </span>
          )}
        </div>

        {/* Right: Check-out */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>
            Check-Out
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: checkOut ? '#0f172a' : '#94a3b8' }}>
            {formatReadableDate(checkOut)}
          </span>
        </div>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(100vw - 2rem, 360px)',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem',
          boxShadow: '0 20px 50px rgba(0, 9, 31, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          zIndex: 100,
          animation: 'popoverIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={prevMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FiChevronLeft />
            </button>

            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FiChevronRight />
            </button>
          </div>

          {/* Days of Week */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
            {DAY_NAMES.map(d => (
              <span key={d} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
            {calendarDays.map(({ date, dateStr, isCurrentMonth, isDisabled }, index) => {
              const isStart = checkIn === dateStr
              const isEnd = checkOut === dateStr
              const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut
              const isToday = formatDateString(todayDate) === dateStr

              let dayBg = 'transparent'
              let dayColor = isCurrentMonth ? '#1e293b' : '#cbd5e1'
              let borderRadius = '50%'
              let fontWeight: number | string = 500

              if (isDisabled) {
                dayColor = '#cbd5e1'
              } else if (isStart || isEnd) {
                dayBg = '#0878FF'
                dayColor = '#ffffff'
                fontWeight = 800
              } else if (isInRange) {
                dayBg = 'rgba(8, 120, 255, 0.18)'
                dayColor = '#00091f'
                borderRadius = '0'
                fontWeight = 600
              }

              return (
                <div
                  key={index}
                  style={{
                    padding: '2px 0',
                    background: isInRange ? 'rgba(8, 120, 255, 0.18)' : 'transparent',
                    borderTopLeftRadius: isStart ? '50%' : '0',
                    borderBottomLeftRadius: isStart ? '50%' : '0',
                    borderTopRightRadius: isEnd ? '50%' : '0',
                    borderBottomRightRadius: isEnd ? '50%' : '0',
                  }}
                >
                  <button
                    type="button"
                    disabled={isDisabled || !isCurrentMonth}
                    onClick={() => handleDateClick(dateStr, isDisabled || !isCurrentMonth)}
                    style={{
                      width: '36px',
                      height: '36px',
                      margin: '0 auto',
                      borderRadius: borderRadius,
                      background: dayBg,
                      color: dayColor,
                      fontSize: '0.85rem',
                      fontWeight: fontWeight,
                      border: isToday && !isStart && !isEnd ? '1.5px solid #0878FF' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isDisabled || !isCurrentMonth ? 'default' : 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: isStart || isEnd ? '0 4px 10px rgba(8, 120, 255, 0.35)' : 'none'
                    }}
                  >
                    {date.getDate()}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Quick Info / Reset */}
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {selectingStep === 'checkIn' || !checkIn ? 'Select Check-in' : !checkOut ? 'Select Check-out' : `${nights} nights selected`}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange('', '')
                setSelectingStep('checkIn')
              }}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popoverIn {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}
