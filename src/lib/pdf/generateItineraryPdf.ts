import { jsPDF } from 'jspdf'

export interface ItineraryPdfScheduleItem {
  time?: string
  activity: string
}

export interface ItineraryPdfDay {
  day: number
  dateStr?: string
  dayOfWeek?: string
  title: string
  description?: string
  schedule?: ItineraryPdfScheduleItem[]
  imageUrl?: string
}

export interface ItineraryPdfStay {
  name: string
  location?: string
  rating?: number | string
  reviewsCount?: number | string
  nights?: string | number
  roomType?: string
  imageUrl?: string
}

export interface ItineraryPdfVehicle {
  name: string
  capacity?: string | number
  isAc?: boolean
  imageUrl?: string
}

export interface ItineraryPdfData {
  packageName: string
  packageSlug?: string
  tagline?: string
  destination: string
  duration: string
  nights?: string | number
  travelersText: string
  travelDatesText: string
  category?: string
  pricePerPerson: string
  priceNote?: string
  adultsCount: number
  childrenCount: number
  estimatedTotalCost: string | number
  customerPhone?: string
  customerEmail?: string
  pickupPoint?: string
  specialRequests?: string
  infantsCount?: number
  payment?: { status: 'pending' | 'partial' | 'full'; advanceAmount?: string; balanceDue?: string; mode?: string; transactionId?: string }
  theme?: { preset: 'sky' | 'dark'; accentColor?: string; backgroundUrl?: string }
  days: ItineraryPdfDay[]
  stay?: ItineraryPdfStay
  vehicle?: ItineraryPdfVehicle
  inclusions: string[]
  exclusions: string[]
  notes?: string
}

/**
 * Fetches an image URL and converts it to a Base64 data URL for jsPDF embedding.
 */
async function fetchImageAsBase64(url: string | undefined): Promise<string | null> {
  if (!url || !url.trim()) return null
  try {
    let targetUrl = url.trim()
    if (targetUrl.startsWith('/') && typeof window !== 'undefined') {
      targetUrl = `${window.location.origin}${targetUrl}`
    }
    const res = await fetch(targetUrl, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result)
        else resolve(null)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Generates and downloads a clean, professional, selectable-text PDF
 * following the reference design of Hillstourism Travel Itinerary.
 *
 * Page Sequence:
 * Page 1: Cover Page (Logo, Title, Badges, Customer details, Day Overview)
 * Pages 2..(N+1): 1 Full Page per Day (Day pill, Title, Description, Big Image, Schedule)
 * Page (N+2): Package Details, Stay, Vehicle, Inclusions, Exclusions, Estimated Cost
 * Page (N+3): Dedicated Closing Page (Thank You, Contact Numbers, hillstourism.com, Travel Guidelines)
 */
export async function generateItineraryPDF(data: ItineraryPdfData, options: { download?: boolean } = {}): Promise<jsPDF> {
  // Pre-load page templates and content images concurrently.
  const [
    frontBgBase64,
    innerBgBase64,
    logoBase64,
    coverBase64,
    stayImgBase64,
    vehicleImgBase64,
    ...dayImagesBase64
  ] = await Promise.all([
    fetchImageAsBase64('/itinerary/front-page-template.jpg'),
    fetchImageAsBase64('/itinerary/inner-page-template.jpg'),
    fetchImageAsBase64('/logo.png'),
    fetchImageAsBase64(data.theme?.backgroundUrl),
    fetchImageAsBase64(data.stay?.imageUrl),
    fetchImageAsBase64(data.vehicle?.imageUrl),
    ...data.days.map((d) => fetchImageAsBase64(d.imageUrl)),
  ])

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()   // 210mm
  const pageHeight = doc.internal.pageSize.getHeight()  // 297mm
  const margin = 14
  const contentWidth = pageWidth - margin * 2            // 182mm
  let y = margin

  const darkTheme = data.theme?.preset === 'dark'
  const accentHex = /^#[0-9a-fA-F]{6}$/.test(data.theme?.accentColor || '') ? data.theme!.accentColor! : (darkTheme ? '#4BAEFF' : '#0B6BCB')
  const accent = [1, 3, 5].map((start) => parseInt(accentHex.slice(start, start + 2), 16)) as [number, number, number]

  // Detect image format from base64 data URL
  const getImageFormat = (base64: string): string => {
    if (base64.startsWith('data:image/png')) return 'PNG'
    return 'JPEG'
  }

  // ─── Background Renderers ───────────────────────────────
  const renderFrontBackground = () => {
    if (frontBgBase64) {
      try {
        const fmt = getImageFormat(frontBgBase64)
        doc.addImage(frontBgBase64, fmt, 0, 0, pageWidth, pageHeight)
      } catch {}
    }
  }

  const renderInnerBackground = () => {
    if (innerBgBase64) {
      try {
        const fmt = getImageFormat(innerBgBase64)
        doc.addImage(innerBgBase64, fmt, 0, 0, pageWidth, pageHeight)
      } catch {}
    }
  }

  // Normalize currency values and render them with a plain Rs. prefix.
  const cleanMoneyAmount = (value: string | number | undefined | null, fallback: string) => {
    const raw = String(value ?? fallback).trim()
    return raw
      .replace(/^₹\s*/, '')
      .replace(/^Rs\.?\s*/i, '')
      .replace(/^INR\s*/i, '')
      .replace(/^¹\s*/, '')
      .trim() || fallback
  }

  const drawRsAmount = (
    x: number,
    textY: number,
    value: string | number | undefined | null,
    fallback: string,
    fontSize: number,
    color: [number, number, number],
    prefix = '',
  ) => {
    const amount = cleanMoneyAmount(value, fallback)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    doc.text(`${prefix}Rs.${amount}`, x, textY)
  }

  const pdfMoney = (value: string | number | undefined) => String(value || 'To be confirmed').replace(/₹\s*/g, 'INR ')

  // ─── Mini Header for inner pages (NO duplicate Hillstourism name) ───
  const renderMiniHeader = () => {
    const headerTop = 4
    if (logoBase64) {
      try {
        // Logo already contains "HILLSTOURISMA" at bottom - do not repeat company name text
        const logoW = 28
        const logoH = 18
        doc.addImage(logoBase64, 'PNG', (pageWidth - logoW) / 2, headerTop, logoW, logoH)
      } catch {}
    }
    // Only print "TRAVEL ITINERARY" - no duplicate brand name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    doc.text('TRAVEL ITINERARY', pageWidth / 2, 25, { align: 'center' })

    // Decorative divider line
    doc.setDrawColor(210, 222, 235)
    doc.setLineWidth(0.4)
    doc.line(margin + 25, 29, pageWidth - margin - 25, 29)

    y = 35
  }

  // Start a new inner page
  const startInnerPage = () => {
    doc.addPage()
    renderInnerBackground()
    y = margin
    renderMiniHeader()
  }

  // Page break checker helper
  const checkAddPage = (neededHeight: number = 15) => {
    if (y + neededHeight > pageHeight - 30) {
      startInnerPage()
    }
  }

  // ─── Footer Renderer ───────────────────────────────────
  const renderFooters = () => {
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const footerY = pageHeight - 12

      if (i > 1) {
        // Decorative divider
        doc.setDrawColor(200, 215, 230)
        doc.setLineWidth(0.3)
        doc.line(margin + 30, footerY - 2, pageWidth - margin - 30, footerY - 2)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(11, 37, 69)
        doc.text('Thank you for choosing Hillstourism', pageWidth / 2, footerY + 2, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(100, 116, 139)
        doc.text('hillstourism.com  •  EXPLORE  •  DISCOVER  •  CREATE MEMORIES', pageWidth / 2, footerY + 5.5, { align: 'center' })
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(130, 140, 155)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY + 5.5, { align: 'right' })
    }
  }

  // ===========================================================================
  // PAGE 1: COVER PAGE
  // ===========================================================================
  renderFrontBackground()

  // Logo (contains embedded "HILLSTOURISMA" text at bottom)
  y = 8
  if (logoBase64) {
    try {
      const logoW = 38
      const logoH = 25
      doc.addImage(logoBase64, 'PNG', (pageWidth - logoW) / 2, y, logoW, logoH)
    } catch {}
  }

  // IMPORTANT: Removed duplicate "HILLSTOURISM" text call!
  // Only render "TRAVEL ITINERARY" subtitle below the logo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...accent)
  doc.text('TRAVEL ITINERARY', pageWidth / 2, 38, { align: 'center' })

  // Main Package Title - BIG and BOLD
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(11, 37, 69)
  const coverTitle = doc.splitTextToSize(data.packageName || 'Travel Itinerary', 170).slice(0, 2)
  doc.text(coverTitle, pageWidth / 2, 49, { align: 'center' })

  // Tagline / Subtitle
  const taglineText = data.tagline?.trim() || `NATURE IMMERSION  |  ${(data.destination || 'SCENIC BEAUTY').toUpperCase()}`
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(100, 116, 139)
  doc.text(taglineText.toUpperCase(), pageWidth / 2, 57, { align: 'center' })

  // ─── 4 BADGES STRIP ────────────────────────────────────
  y = 64
  const badgeGap = 4
  const badgeW = (contentWidth - badgeGap * 3) / 4
  const badgeH = 19
  const badges = [
    { label: 'DURATION', val: data.duration || 'N/A' },
    { label: 'DESTINATION', val: data.destination || 'N/A' },
    { label: 'TRAVELERS', val: data.travelersText || `${data.adultsCount || 2} Adults` },
    { label: 'TRAVEL DATES', val: data.travelDatesText || 'Flexible' },
  ]

  badges.forEach((b, idx) => {
    const bx = margin + idx * (badgeW + badgeGap)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(210, 222, 235)
    doc.setLineWidth(0.4)
    doc.roundedRect(bx, y, badgeW, badgeH, 2.5, 2.5, 'FD')

    // Label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(b.label, bx + badgeW / 2, y + 6.5, { align: 'center' })

    // Value
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(11, 37, 69)
    const splitVal = doc.splitTextToSize(b.val, badgeW - 4)
    doc.text(splitVal[0] || '', bx + badgeW / 2, y + 13.5, { align: 'center' })
  })

  y = y + badgeH + 8

  // ─── Customer Details (if present) ─────────────────────
  const customerLines = [
    data.customerPhone?.trim() ? `Phone: ${data.customerPhone.trim()}` : '',
    data.customerEmail?.trim() ? `Email: ${data.customerEmail.trim()}` : '',
    data.pickupPoint?.trim() ? `Pickup: ${data.pickupPoint.trim()}` : '',
    data.specialRequests?.trim() ? `Special requests: ${data.specialRequests.trim()}` : '',
  ].filter(Boolean)

  if (customerLines.length) {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(210, 222, 235)
    doc.roundedRect(margin, y, contentWidth, customerLines.length * 5.5 + 11, 2.5, 2.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...accent)
    doc.text('CUSTOMER & BOOKING DETAILS', margin + 6, y + 6.5)

    let custY = y + 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    customerLines.forEach((line) => {
      doc.text(line, margin + 6, custY)
      custY += 5
    })
    y = custY + 5
  }

  // ─── Day Overview List on Cover ────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(11, 37, 69)
  doc.text('DAY WISE ITINERARY OVERVIEW', margin, y)
  y += 3
  doc.setDrawColor(210, 222, 235)
  doc.setLineWidth(0.4)
  doc.line(margin, y, margin + 65, y)
  y += 7

  if (data.days && data.days.length > 0) {
    // Keep overview within bounds so it stays above bottom watercolor artwork
    data.days.forEach((dayItem, dIdx) => {
      if (y > 195) return // keep clear of the bottom nature art!

      // Card row for day overview
      const rowH = 11
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(220, 228, 238)
      doc.roundedRect(margin, y - 4, contentWidth, rowH, 2, 2, 'FD')

      // Day pill
      doc.setFillColor(11, 37, 69)
      doc.roundedRect(margin + 3, y - 2.5, 18, 7.5, 1.5, 1.5, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(`Day ${dayItem.day || dIdx + 1}`, margin + 12, y + 2.5, { align: 'center' })

      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(11, 37, 69)
      const dayTitleText = doc.splitTextToSize(dayItem.title || `Day ${dayItem.day || dIdx + 1}`, contentWidth - 40)
      doc.text(dayTitleText[0] || '', margin + 25, y + 2.5)

      // Page indicator on right
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text(`Page ${dIdx + 2} →`, pageWidth - margin - 5, y + 2.5, { align: 'right' })

      y += rowH + 2.5
    })
  }

  // ===========================================================================
  // DAY PAGES: Each day gets its own dedicated full page
  // ===========================================================================
  if (data.days && data.days.length > 0) {
    data.days.forEach((dayItem, dIdx) => {
      // Start a fresh new page for each day
      startInnerPage()

      const dayImgBase64 = dayImagesBase64[dIdx]
      const dayLabel = `DAY ${dayItem.day || dIdx + 1}`
      const normalizedDayLabel = dayLabel.trim().toLowerCase()

      // ─── Day Header Section ───────────────────────────
      // Large Day Badge
      doc.setFillColor(...accent)
      doc.roundedRect(margin, y, 32, 10, 2.5, 2.5, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text(dayLabel, margin + 16, y + 7, { align: 'center' })

      // Date & Day of week
      const safeDateStr = dayItem.dateStr?.trim().toLowerCase() === normalizedDayLabel ? '' : dayItem.dateStr
      const safeDayOfWeek = dayItem.dayOfWeek?.trim().toLowerCase() === normalizedDayLabel ? '' : dayItem.dayOfWeek

      let dateX = margin + 38
      if (safeDateStr) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(71, 85, 105)
        doc.text(safeDateStr, dateX, y + 6.5)
        dateX += doc.getTextWidth(safeDateStr) + 5
      }
      if (safeDayOfWeek) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(148, 163, 184)
        doc.text(`(${safeDayOfWeek})`, dateX, y + 6.5)
      }

      y += 16

      // ─── Day Title ────────────────────────────────────
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(17)
      doc.setTextColor(11, 37, 69)
      const titleLines = doc.splitTextToSize(dayItem.title || dayLabel, contentWidth)
      doc.text(titleLines, margin, y)
      y += titleLines.length * 7.5 + 3

      // Decorative accent line
      doc.setDrawColor(...accent)
      doc.setLineWidth(0.8)
      doc.line(margin, y, margin + 45, y)
      y += 7

      // ─── Day Description ──────────────────────────────
      if (dayItem.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10.5)
        doc.setTextColor(51, 65, 85)
        const descLines = doc.splitTextToSize(dayItem.description, contentWidth)
        doc.text(descLines, margin, y)
        y += descLines.length * 5.2 + 8
      }

      // ─── Day Image (large, full width card) ───────────
      if (dayImgBase64) {
        const imgH = 55  // 55mm tall
        const imgW = contentWidth
        try {
          const fmt = getImageFormat(dayImgBase64)
          doc.addImage(dayImgBase64, fmt, margin, y, imgW, imgH)
          // Clean border around photo
          doc.setDrawColor(210, 222, 235)
          doc.setLineWidth(0.4)
          doc.roundedRect(margin, y, imgW, imgH, 2.5, 2.5, 'S')
        } catch {}
        y += imgH + 10
      }

      // ─── Schedule / Activities ────────────────────────
      if (dayItem.schedule && dayItem.schedule.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(11, 37, 69)
        doc.text("DAY'S SCHEDULE", margin, y)
        y += 3
        doc.setDrawColor(210, 222, 235)
        doc.setLineWidth(0.3)
        doc.line(margin, y, margin + 50, y)
        y += 7

        // Schedule Box
        const schedItemH = 13
        dayItem.schedule.forEach((sch, sIdx) => {
          if (!sch.activity && !sch.time) return

          // Card row for each activity
          doc.setFillColor(255, 255, 255)
          doc.setDrawColor(220, 228, 238)
          doc.roundedRect(margin, y - 3, contentWidth, schedItemH - 1, 2, 2, 'FD')

          // Timeline dot
          doc.setFillColor(...accent)
          doc.circle(margin + 5, y + 3.5, 1.8, 'F')

          // Time badge
          if (sch.time) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...accent)
            doc.text(sch.time, margin + 11, y + 4)
          }

          // Activity text
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(30, 41, 59)
          const actX = sch.time ? margin + 38 : margin + 12
          const actLines = doc.splitTextToSize(sch.activity, contentWidth - (actX - margin) - 4)
          doc.text(actLines[0] || '', actX, y + 4)

          y += schedItemH
        })
      }
    })
  }

  // ===========================================================================
  // DETAILS PAGE: Package Details, Stay, Vehicle, Inclusions, Cost
  // ===========================================================================
  startInnerPage()

  // ─── PACKAGE DETAILS ──────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(11, 37, 69)
  doc.text('PACKAGE DETAILS', margin, y)
  y += 3.5
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.6)
  doc.line(margin, y, margin + 50, y)
  y += 6

  // Details grid box
  const sumBoxY = y
  const sumBoxH = 30
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(210, 222, 235)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, sumBoxY, contentWidth, sumBoxH, 2.5, 2.5, 'FD')

  const col1X = margin + 5
  const col2X = margin + 50
  const col3X = margin + 98
  const col4X = margin + 144

  const renderSumRow = (rY: number, k1: string, v1: string, k2: string, v2: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    doc.text(k1, col1X, rY)
    doc.text(k2, col3X, rY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(11, 37, 69)
    doc.text(v1 || 'N/A', col2X, rY)
    doc.text(v2 || 'N/A', col4X, rY)
  }

  renderSumRow(sumBoxY + 6.5, 'Package Name :', data.packageName, 'Travelers :', data.travelersText)
  renderSumRow(sumBoxY + 13.5, 'Destination :', data.destination, 'Category :', data.category || 'Family')
  renderSumRow(sumBoxY + 20.5, 'Duration :', data.duration || 'N/A', 'Travel Dates :', data.travelDatesText)

  // Price row
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Price :', col3X, sumBoxY + 26.5)
  drawRsAmount(col4X, sumBoxY + 26.5, data.pricePerPerson, '12,999', 9.5, [11, 37, 69])
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Price Note :', col1X, sumBoxY + 26.5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(11, 37, 69)
  doc.text(data.priceNote || 'per person', col2X, sumBoxY + 26.5)

  y = sumBoxY + sumBoxH + 9

  // ─── STAY DETAILS ─────────────────────────────────────
  checkAddPage(40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(11, 37, 69)
  doc.text('STAY DETAILS', margin, y)
  y += 3.5
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.6)
  doc.line(margin, y, margin + 40, y)
  y += 6

  const stayBoxY = y
  const stayBoxH = 28
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(210, 222, 235)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, stayBoxY, contentWidth, stayBoxH, 2.5, 2.5, 'FD')

  let stayTextX = margin + 5
  if (stayImgBase64) {
    try {
      const fmt = getImageFormat(stayImgBase64)
      doc.addImage(stayImgBase64, fmt, margin + 3.5, stayBoxY + 3, 30, 22)
      stayTextX = margin + 38
    } catch {}
  }

  const stayData = data.stay || {
    name: 'The Misty Mountain Resort',
    location: `${data.destination || 'Munnar'}, Kerala`,
    rating: '4.6',
    reviewsCount: '128',
    nights: data.nights || 3,
    roomType: 'Deluxe Room',
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(11, 37, 69)
  doc.text(stayData.name, stayTextX, stayBoxY + 7.5)

  // Rating
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(245, 158, 11)
  const ratingStr = stayData.rating ? `★  ${stayData.rating} (${stayData.reviewsCount || 128} reviews)` : '★  4.6 (128 reviews)'
  doc.text(ratingStr, stayTextX, stayBoxY + 13.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Location: ${stayData.location || data.destination}`, stayTextX, stayBoxY + 19.5)
  doc.text(`${stayData.nights || 3} Nights  •  ${stayData.roomType || 'Standard Room'}`, stayTextX, stayBoxY + 25)

  y = stayBoxY + stayBoxH + 9

  // ─── VEHICLE DETAILS ──────────────────────────────────
  checkAddPage(36)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(11, 37, 69)
  doc.text('VEHICLE DETAILS', margin, y)
  y += 3.5
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.6)
  doc.line(margin, y, margin + 45, y)
  y += 6

  const vehBoxY = y
  const vehBoxH = 24
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(210, 222, 235)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, vehBoxY, contentWidth, vehBoxH, 2.5, 2.5, 'FD')

  let vehTextX = margin + 5
  if (vehicleImgBase64) {
    try {
      const fmt = getImageFormat(vehicleImgBase64)
      doc.addImage(vehicleImgBase64, fmt, margin + 3.5, vehBoxY + 3, 30, 18)
      vehTextX = margin + 38
    } catch {}
  }

  const vehData = data.vehicle || {
    name: 'Innova Crysta',
    capacity: '6+1 Seats',
    isAc: true,
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(11, 37, 69)
  doc.text(vehData.name, vehTextX, vehBoxY + 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(71, 85, 105)
  const acText = vehData.isAc !== false ? '•  AC' : '•  Non-AC'
  doc.text(`Capacity: ${vehData.capacity || '6+1 Seats'}   ${acText}`, vehTextX, vehBoxY + 17)

  y = vehBoxY + vehBoxH + 9

  // ─── INCLUSIONS & EXCLUSIONS ──────────────────────────
  checkAddPage(48)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(11, 37, 69)
  doc.text('INCLUSIONS & EXCLUSIONS', margin, y)
  y += 3.5
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.6)
  doc.line(margin, y, margin + 65, y)
  y += 6

  const incWidth = (contentWidth - 8) / 2
  const incX = margin
  const excX = margin + incWidth + 8

  const defaultInclusions = [
    'Accommodation for specified nights',
    'Daily breakfast & dinner',
    'Private vehicle for the entire trip',
    'All sightseeing as per itinerary',
    'Driver allowance, toll & parking',
  ]
  const defaultExclusions = [
    'Airfare / Train fare',
    'Entry tickets (if any)',
    'Personal expenses & shopping',
    'Adventure activities (optional)',
    'Anything not mentioned in inclusions',
  ]

  const incList = data.inclusions && data.inclusions.length > 0 ? data.inclusions : defaultInclusions
  const excList = data.exclusions && data.exclusions.length > 0 ? data.exclusions : defaultExclusions
  const boxHeight = Math.max(incList.length, excList.length) * 6 + 14

  // Inclusions Box
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(167, 243, 208)
  doc.setLineWidth(0.4)
  doc.roundedRect(incX, y, incWidth, boxHeight, 2.5, 2.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(5, 150, 105)
  doc.text('INCLUSIONS', incX + 5, y + 8)

  let incY = y + 15
  incList.forEach((inc) => {
    doc.setFillColor(5, 150, 105)
    doc.circle(incX + 6.5, incY - 1, 0.9, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    const lines = doc.splitTextToSize(inc, incWidth - 16)
    doc.text(lines[0] || '', incX + 11, incY)
    incY += 6
  })

  // Exclusions Box
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(254, 202, 202)
  doc.setLineWidth(0.4)
  doc.roundedRect(excX, y, incWidth, boxHeight, 2.5, 2.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(220, 38, 38)
  doc.text('EXCLUSIONS', excX + 5, y + 8)

  let excY = y + 15
  excList.forEach((exc) => {
    doc.setFillColor(220, 38, 38)
    doc.circle(excX + 6.5, excY - 1, 0.9, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    const lines = doc.splitTextToSize(exc, incWidth - 16)
    doc.text(lines[0] || '', excX + 11, excY)
    excY += 6
  })

  y += boxHeight + 9

  // ─── ESTIMATED COST ───────────────────────────────────
  checkAddPage(38)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(11, 37, 69)
  doc.text('ESTIMATED COST', margin, y)
  y += 3.5
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.6)
  doc.line(margin, y, margin + 45, y)
  y += 6

  const costBoxY = y
  const costBoxH = 28
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(210, 222, 235)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, costBoxY, contentWidth, costBoxH, 2.5, 2.5, 'FD')

  // Per person
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text('Package Cost (per person)', margin + 6, costBoxY + 7)
  drawRsAmount(margin + 65, costBoxY + 7, data.pricePerPerson, '12,999', 10, [11, 37, 69], ':  ')

  // Travelers
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text('Total Travelers', margin + 6, costBoxY + 14)
  const totalTravelersCount = (data.adultsCount || 0) + (data.childrenCount || 0) || 1
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text(`:  ${totalTravelersCount} (${data.travelersText || '2 Adults, 1 Child'})`, margin + 65, costBoxY + 14)

  // Highlighted Total Cost Row
  doc.setFillColor(239, 246, 255)
  doc.setDrawColor(191, 219, 254)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin + 3, costBoxY + 18.5, contentWidth - 6, 8, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(29, 78, 216)
  doc.text('Estimated Total Cost', margin + 8, costBoxY + 24)
  drawRsAmount(margin + 65, costBoxY + 24, data.estimatedTotalCost, '38,997', 11, [29, 78, 216], ':  ')

  y = costBoxY + costBoxH + 8

  // ─── PAYMENT DETAILS (if any) ─────────────────────────
  if (data.payment && (data.payment.status !== 'pending' || data.payment.advanceAmount || data.payment.balanceDue || data.payment.mode || data.payment.transactionId)) {
    checkAddPage(35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...accent)
    doc.text('PAYMENT DETAILS', margin, y)
    y += 3.5
    doc.setDrawColor(...accent)
    doc.setLineWidth(0.6)
    doc.line(margin, y, margin + 45, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(30, 41, 59)

    const paymentLines = [
      `Status: ${data.payment.status}`,
      data.payment.advanceAmount ? `Advance: ${pdfMoney(data.payment.advanceAmount)}` : '',
      data.payment.balanceDue ? `Balance: ${pdfMoney(data.payment.balanceDue)}` : '',
      data.payment.mode ? `Mode: ${data.payment.mode}` : '',
      data.payment.transactionId ? `Transaction ID: ${data.payment.transactionId}` : '',
    ].filter(Boolean)

    paymentLines.forEach((line) => {
      doc.text(line, margin, y)
      y += 6
    })
  }

  // ===========================================================================
  // DEDICATED CLOSING PAGE: THANK YOU, CONTACTS & hillstourism.com
  // ===========================================================================
  startInnerPage()

  // ─── THANK YOU HEADER ──────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(11, 37, 69)
  doc.text('THANK YOU FOR CHOOSING HILLSTOURISM', pageWidth / 2, y + 4, { align: 'center' })
  y += 11

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(100, 116, 139)
  doc.text('We look forward to creating unforgettable memories with you across the misty hills.', pageWidth / 2, y, { align: 'center' })
  y += 8

  // Decorative divider
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.8)
  doc.line(pageWidth / 2 - 35, y, pageWidth / 2 + 35, y)
  y += 10

  // ─── CARD 1: OFFICIAL CONTACT & WEBSITE ────────────────
  const contactCardH = 38
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(210, 222, 235)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, contentWidth, contactCardH, 3, 3, 'FD')

  // Top header of card
  doc.setFillColor(239, 246, 255)
  doc.roundedRect(margin, y, contentWidth, 8, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...accent)
  doc.text('OFFICIAL CONTACT & ONLINE BOOKING', margin + 6, y + 5.5)

  // Website — prominent as requested
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(11, 37, 69)
  doc.text('Official Website :', margin + 6, y + 16)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...accent)
  doc.text('hillstourism.com', margin + 45, y + 16)

  // Phone / WhatsApp Hotline
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text('Phone / WhatsApp :', margin + 6, y + 23)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text('+91 73589 86704  (24/7 Traveler Support)', margin + 45, y + 23)

  // Email
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text('Customer Email :', margin + 6, y + 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(30, 41, 59)
  doc.text('contact@hillstourism.com', margin + 45, y + 30)

  // Working hours
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('Helpdesk: Monday – Sunday (24 Hours Active)', margin + 45, y + 35)

  y += contactCardH + 10

  // ─── CARD 2: BOOKING SUMMARY (IF CUSTOMER INFO AVAILABLE) ──
  if (data.customerPhone || data.customerEmail || data.pickupPoint || data.specialRequests) {
    const summaryCardH = 34
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(210, 222, 235)
    doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, contentWidth, summaryCardH, 3, 3, 'FD')

    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, y, contentWidth, 8, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(11, 37, 69)
    doc.text('GUEST & TRIP SUMMARY', margin + 6, y + 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(71, 85, 105)
    doc.text('Primary Guest :', margin + 6, y + 15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(11, 37, 69)
    doc.text(data.travelersText || 'Valued Guest', margin + 35, y + 15)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text('Destination :', margin + 105, y + 15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(11, 37, 69)
    doc.text(`${data.destination} (${data.duration})`, margin + 130, y + 15)

    if (data.customerPhone) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text('Guest Phone :', margin + 6, y + 22)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(11, 37, 69)
      doc.text(data.customerPhone, margin + 35, y + 22)
    }

    if (data.pickupPoint) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text('Pickup Point :', margin + 105, y + 22)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(11, 37, 69)
      doc.text(data.pickupPoint, margin + 130, y + 22)
    }

    if (data.specialRequests) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text('Special Notes :', margin + 6, y + 29)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 41, 59)
      doc.text(data.specialRequests, margin + 35, y + 29)
    }

    y += summaryCardH + 10
  }

  // ─── CARD 3: ESSENTIAL TRAVEL GUIDELINES ─────────────────
  const guideCardH = 48
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(210, 222, 235)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, contentWidth, guideCardH, 3, 3, 'FD')

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, y, contentWidth, 8, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(11, 37, 69)
  doc.text('IMPORTANT TRAVEL GUIDELINES', margin + 6, y + 5.5)

  const guidelines = [
    'Original Photo ID: Carry valid Government IDs (Aadhaar / Passport / Voter ID) for all travelers.',
    'Hotel Check-In: Standard check-in is 12:00 PM / 02:00 PM; check-out is 11:00 AM (early check-in subject to availability).',
    'Chauffeur & Vehicle: Dedicated cab driver contact and vehicle registration are shared 12-24 hours prior to travel.',
    'Hill Station Attire: Weather in the hills can turn cool and misty. Light woolens and comfortable walking shoes are advised.',
    '24/7 Helpline: For route assistance, emergency queries, or support, our team is always accessible on WhatsApp & Call.',
  ]

  let gY = y + 14
  guidelines.forEach((g) => {
    doc.setFillColor(...accent)
    doc.circle(margin + 7, gY - 1, 1, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    const gLines = doc.splitTextToSize(g, contentWidth - 18)
    doc.text(gLines[0] || '', margin + 11, gY)
    gY += 6.5
  })

  y += guideCardH + 12

  // ─── BOTTOM BRAND & SOCIAL SIGNATURE ────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...accent)
  doc.text('hillstourism.com', pageWidth / 2, y, { align: 'center' })
  y += 5.5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Instagram: @hillstourism   •   Facebook: facebook.com/hillstourism   •   WhatsApp: +91 73589 86704', pageWidth / 2, y, { align: 'center' })
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(11, 37, 69)
  doc.text('EXPLORE  •  DISCOVER  •  CREATE MEMORIES', pageWidth / 2, y, { align: 'center' })

  // ===========================================================================
  // RENDER FOOTERS ON ALL PAGES
  // ===========================================================================
  renderFooters()

  // Generate clean filename
  const rawSlug = data.packageSlug || data.packageName || 'travel-itinerary'
  const safeFilename = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'travel-itinerary'

  if (options.download !== false) doc.save(`${safeFilename}-travel-itinerary.pdf`)
  return doc
}
