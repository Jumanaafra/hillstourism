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
 */

export async function generateItineraryPDF(data: ItineraryPdfData): Promise<void> {
  // Pre-load page templates and content images concurrently.
  // Files in /public are referenced by browser-root paths, not Windows disk paths.
  const [
    frontTemplateBase64,
    secondTemplateBase64,
    logoBase64,
    stayImgBase64,
    vehicleImgBase64,
    ...dayImagesBase64
  ] = await Promise.all([
    fetchImageAsBase64('/itinerary/front-page-template.png'),
    fetchImageAsBase64('/itinerary/second-page-template.png'),
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
  const pageWidth = doc.internal.pageSize.getWidth() // 210mm
  const pageHeight = doc.internal.pageSize.getHeight() // 297mm
  const margin = 12
  const contentWidth = pageWidth - margin * 2 // 186mm
  let y = margin
  const renderPageTemplate = (templateBase64: string | null) => {
    if (!templateBase64) return
    try {
      doc.addImage(templateBase64, 'PNG', 0, 0, pageWidth, pageHeight)
    } catch {}
  }
  const renderContinuationTemplate = () => renderPageTemplate(secondTemplateBase64)
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
  // Page break checker helper
  const checkAddPage = (neededHeight: number = 15) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage()
      renderContinuationTemplate()
      y = margin
      renderMiniHeader()
    }
  }
  // Mini Header for Page 2+. The current second-page template already contains
  // the blue mountain divider near the top, so keep all dynamic header content above it.
  const renderMiniHeader = () => {
    const headerTop = 3
    if (logoBase64) {
      try {
        const logoW = 24
        const logoH = 15
        doc.addImage(logoBase64, 'PNG', (pageWidth - logoW) / 2, headerTop, logoW, logoH)
      } catch {}
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(11, 37, 69)
    doc.text('TRAVEL ITINERARY', pageWidth / 2, 21.5, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(data.packageName || 'Package Itinerary', pageWidth / 2, 26.5, { align: 'center' })
    // Start content immediately below the template's top divider.
    y = 38
  }
  // Footer on all pages helper
  const renderFooters = () => {
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const footerY = pageHeight - 10
      // The PNG templates already contain the mountain footer ornament.
      // Draw the old ornament only if the related template could not be loaded.
      const hasPageTemplate = i === 1 ? !!frontTemplateBase64 : !!secondTemplateBase64
      if (!hasPageTemplate) {
        doc.setDrawColor(11, 37, 69)
        doc.setLineWidth(0.4)
        doc.line(pageWidth / 2 - 25, footerY - 4, pageWidth / 2 - 8, footerY - 4)
        doc.line(pageWidth / 2 + 8, footerY - 4, pageWidth / 2 + 25, footerY - 4)
        doc.setFillColor(11, 37, 69)
        doc.triangle(
          pageWidth / 2 - 4, footerY - 3,
          pageWidth / 2, footerY - 7,
          pageWidth / 2 + 4, footerY - 3,
          'F',
        )
      }
      // Do not show the thank-you footer copy on the front page.
      if (i > 1) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(11, 37, 69)
        doc.text('Thank you for choosing Hillstourism', pageWidth / 2, footerY + 0.5, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(100, 116, 139)
        doc.text('EXPLORE  •  DISCOVER  •  CREATE MEMORIES', pageWidth / 2, footerY + 4, { align: 'center' })
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY + 4, { align: 'right' })
    }
  }
  // ==========================================
  // PAGE 1: HEADER & LOGO
  // ==========================================
  // Full-page front visual template. Dynamic itinerary content is drawn over it.
  // The current template contains the mountain artwork and centered mountain divider.
  renderPageTemplate(frontTemplateBase64)
  // Keep the logo/title block in the clear space above the template's mountain divider.
  y = 3.5
  if (logoBase64) {
    try {
      const logoW = 30
      const logoH = 19
      doc.addImage(logoBase64, 'PNG', (pageWidth - logoW) / 2, y, logoW, logoH)
    } catch {}
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(8, 120, 255)
  doc.text('TRAVEL ITINERARY', pageWidth / 2, 25, { align: 'center' })
  // Main Package Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(11, 37, 69)
  doc.text(data.packageName || 'Travel Itinerary', pageWidth / 2, 33.5, { align: 'center' })
  // Tagline / Subtitle
  const taglineText = data.tagline?.trim() || 'TEA GARDENS  |  MISTY MOUNTAINS  |  SCENIC BEAUTY'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  doc.setTextColor(100, 116, 139)
  doc.text(taglineText.toUpperCase(), pageWidth / 2, 39, { align: 'center' })
  // The mountain illustration occupies the upper part of the page.
  // Start the dynamic summary cards below the artwork so nothing overlaps it.
  y = 73
  // ==========================================
  // 4 BADGES STRIP
  // ==========================================
  const badgeGap = 3
  const badgeW = (contentWidth - badgeGap * 3) / 4 // ~44mm each
  const badgeH = 14
  const badgeY = y
  const badges = [
    { label: 'DURATION', val: data.duration || 'N/A' },
    { label: 'DESTINATION', val: data.destination || 'N/A' },
    { label: 'TRAVELERS', val: data.travelersText || `${data.adultsCount || 2} Adults` },
    { label: 'TRAVEL DATES', val: data.travelDatesText || 'Flexible' },
  ]
  badges.forEach((b, idx) => {
    const bx = margin + idx * (badgeW + badgeGap)
    // Rounded rectangle card fill & border
    doc.setFillColor(248, 250, 252) // #F8FAFC
    doc.setDrawColor(226, 232, 240) // #E2E8F0
    doc.setLineWidth(0.3)
    doc.roundedRect(bx, badgeY, badgeW, badgeH, 2, 2, 'FD')
    // Label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(100, 116, 139)
    doc.text(b.label, bx + badgeW / 2, badgeY + 4.5, { align: 'center' })
    // Value
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(11, 37, 69)
    const splitVal = doc.splitTextToSize(b.val, badgeW - 2)
    doc.text(splitVal[0] || '', bx + badgeW / 2, badgeY + 9.5, { align: 'center' })
  })
  y = badgeY + badgeH + 8
  // ==========================================
  // DAY WISE ITINERARY SECTION
  // ==========================================
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text('DAY WISE ITINERARY', margin, y)
  y += 3.5
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6
  const timelineLineX = margin + 28 // ~40mm
  const dayRightX = margin + 34     // ~46mm
  const dayRightW = pageWidth - margin - dayRightX // ~122mm
  if (!data.days || data.days.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(148, 163, 184)
    doc.text('No itinerary days specified.', margin, y)
    y += 8
  } else {
    const frontPageDayLimit = 4
    data.days.forEach((dayItem, dIdx) => {
      // Keep up to four itinerary days on the front page using a compact version of the same layout.
      const isFrontPageDay = dIdx < frontPageDayLimit && doc.getNumberOfPages() === 1
      const descLines = dayItem.description ? doc.splitTextToSize(dayItem.description, dayRightW - 4) : []
      const schedCount = dayItem.schedule?.length || 0
      const dayImgBase64 = dayImagesBase64[dIdx]
      const scheduleStep = isFrontPageDay ? 3.6 : 4.5
      let schedBoxH = schedCount * scheduleStep + (dayImgBase64 ? 3 : 0)
      if (dayImgBase64 && schedBoxH < (isFrontPageDay ? 18 : 22)) schedBoxH = isFrontPageDay ? 18 : 22
      if (schedBoxH > 0) schedBoxH += isFrontPageDay ? 2.5 : 4
      const neededH = 9 + descLines.length * (isFrontPageDay ? 3.2 : 4) + schedBoxH + 5
      if (!isFrontPageDay) checkAddPage(neededH)
      const startY = y
      // Left Column: Day Pill & Date
      if (darkTheme) doc.setFillColor(5, 18, 43)
      else doc.setFillColor(11, 37, 69)
      doc.roundedRect(margin, y, 22, 7, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(`Day ${dayItem.day || dIdx + 1}`, margin + 11, y + 4.8, { align: 'center' })
      const dayLabel = `Day ${dayItem.day || dIdx + 1}`
      const normalizedDayLabel = dayLabel.trim().toLowerCase()
      const safeDateStr = dayItem.dateStr?.trim().toLowerCase() === normalizedDayLabel
        ? ''
        : dayItem.dateStr
      const safeDayOfWeek = dayItem.dayOfWeek?.trim().toLowerCase() === normalizedDayLabel
        ? ''
        : dayItem.dayOfWeek
      if (safeDateStr || safeDayOfWeek) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6.5)
        doc.setTextColor(71, 85, 105)
        if (safeDateStr) {
          doc.text(safeDateStr, margin + 11, y + 10.5, { align: 'center' })
        }
        if (safeDayOfWeek) {
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(148, 163, 184)
          doc.text(safeDayOfWeek, margin + 11, y + 13.5, { align: 'center' })
        }
      }
      // Vertical timeline node dot
      doc.setFillColor(...accent)
      doc.circle(timelineLineX, y + 3.5, 1.8, 'F')
      // Right Column: Title & Description
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(isFrontPageDay ? 9 : 10)
      doc.setTextColor(11, 37, 69)
      doc.text(dayItem.title || `Day ${dayItem.day || dIdx + 1}`, dayRightX, y + 4.5)
      let currentRightY = y + (isFrontPageDay ? 7.5 : 8.5)
      if (descLines.length > 0) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(isFrontPageDay ? 7 : 8)
        doc.setTextColor(71, 85, 105)
        descLines.forEach((line: string) => {
          doc.text(line, dayRightX, currentRightY)
          currentRightY += isFrontPageDay ? 3.1 : 3.8
        })
        currentRightY += isFrontPageDay ? 0.8 : 1.5
      }
      // Schedule Box (if items exist or image exists)
      if (schedCount > 0 || dayImgBase64) {
        const boxY = currentRightY
        const imgW = dayImgBase64 ? 30 : 0
        const textW = dayImgBase64 ? dayRightW - imgW - 6 : dayRightW - 6
        doc.setFillColor(248, 250, 252) // #F8FAFC
        doc.setDrawColor(226, 232, 240) // #E2E8F0
        doc.setLineWidth(0.3)
        doc.roundedRect(dayRightX, boxY, dayRightW, schedBoxH, 2, 2, 'FD')
        let itemY = boxY + (isFrontPageDay ? 3.8 : 4.5)
        if (dayItem.schedule) {
          dayItem.schedule.forEach((sch) => {
            if (!sch.activity && !sch.time) return
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(isFrontPageDay ? 6.5 : 7)
            doc.setTextColor(8, 120, 255)
            if (sch.time) {
              doc.text(sch.time, dayRightX + 4, itemY)
            }
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(isFrontPageDay ? 6.8 : 7.5)
            doc.setTextColor(30, 41, 59)
            const timeOffset = sch.time ? 22 : 4
            const actLines = doc.splitTextToSize(sch.activity, textW - timeOffset)
            doc.text(actLines[0] || '', dayRightX + 4 + timeOffset, itemY)
            itemY += scheduleStep
          })
        }
        // Draw day thumbnail image inside box if available
        if (dayImgBase64) {
          try {
            const imgX = dayRightX + dayRightW - imgW - 2
            const imgH = schedBoxH - 4
            doc.addImage(dayImgBase64, 'JPEG', imgX, boxY + 2, imgW, imgH)
          } catch {}
        }
        currentRightY = boxY + schedBoxH + (isFrontPageDay ? 2.5 : 4)
      }
      const dayEndHeight = Math.max(isFrontPageDay ? 13 : 16, currentRightY - startY)
      // Draw timeline connector line downwards
      if (dIdx < data.days.length - 1) {
        doc.setDrawColor(203, 213, 225)
        doc.setLineWidth(0.4)
        doc.line(timelineLineX, startY + 5.5, timelineLineX, startY + dayEndHeight + 2)
      }
      y = startY + dayEndHeight + (isFrontPageDay ? 2.5 : 4)
    })
  }
  // ==========================================
  // PAGE 2 (OR CONTINUATION): PACKAGE DETAILS, STAYS, VEHICLES & COST
  // ==========================================
  // Force a clean page break for Package Details section if we are on Page 1 or running low on space
  if (y > pageHeight - margin - 80 || doc.getNumberOfPages() === 1) {
    doc.addPage()
    renderContinuationTemplate()
    y = margin
    renderMiniHeader()
  }
  // ------------------------------------------
  // SUMMARY GRID (PACKAGE DETAILS)
  // ------------------------------------------
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text('PACKAGE DETAILS', margin, y)
  y += 3.5
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5
  const sumBoxY = y
  const sumBoxH = 22
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, sumBoxY, contentWidth, sumBoxH, 2, 2, 'FD')
  const col1X = margin + 4
  const col2X = margin + 50
  const col3X = margin + 100
  const col4X = margin + 145
  const renderSumRow = (rY: number, k1: string, v1: string, k2: string, v2: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(k1, col1X, rY)
    doc.text(k2, col3X, rY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(11, 37, 69)
    doc.text(v1 || 'N/A', col2X, rY)
    doc.text(v2 || 'N/A', col4X, rY)
  }
  renderSumRow(sumBoxY + 5, 'Package Name :', data.packageName, 'Travelers :', data.travelersText)
  renderSumRow(sumBoxY + 10, 'Destination :', data.destination, 'Category :', data.category || 'Family')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text('Duration :', col1X, sumBoxY + 15)
  doc.text('Price :', col3X, sumBoxY + 15)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(11, 37, 69)
  doc.text(data.duration || 'N/A', col2X, sumBoxY + 15)
  drawRsAmount(col4X, sumBoxY + 15, data.pricePerPerson, '12,999', 7.5, [11, 37, 69])
  renderSumRow(sumBoxY + 19.5, 'Travel Dates :', data.travelDatesText, 'Price Note :', data.priceNote || 'per person')
  y = sumBoxY + sumBoxH + 7
  // ------------------------------------------
  // STAY DETAILS SECTION
  // ------------------------------------------
  checkAddPage(30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text('STAY DETAILS', margin, y)
  y += 4
  const stayBoxY = y
  const stayBoxH = 22
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, stayBoxY, contentWidth, stayBoxH, 2, 2, 'FD')
  let stayTextX = margin + 4
  if (stayImgBase64) {
    try {
      doc.addImage(stayImgBase64, 'JPEG', margin + 3, stayBoxY + 3, 26, 16)
      stayTextX = margin + 33
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
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text(stayData.name, stayTextX, stayBoxY + 6)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(245, 158, 11) // Amber star rating
  const ratingStr = stayData.rating ? `★ ${stayData.rating} (${stayData.reviewsCount || 128} reviews)` : '★ 4.6 (128 reviews)'
  doc.text(ratingStr, stayTextX, stayBoxY + 10.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(`Location: ${stayData.location || data.destination}`, stayTextX, stayBoxY + 14.5)
  doc.text(`${stayData.nights || 3} Nights  •  ${stayData.roomType || 'Standard Room'}`, stayTextX, stayBoxY + 18.5)
  y = stayBoxY + stayBoxH + 6
  // ------------------------------------------
  // VEHICLE DETAILS SECTION
  // ------------------------------------------
  checkAddPage(28)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text('VEHICLE DETAILS', margin, y)
  y += 4
  const vehBoxY = y
  const vehBoxH = 20
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, vehBoxY, contentWidth, vehBoxH, 2, 2, 'FD')
  let vehTextX = margin + 4
  if (vehicleImgBase64) {
    try {
      doc.addImage(vehicleImgBase64, 'JPEG', margin + 3, vehBoxY + 3, 26, 14)
      vehTextX = margin + 33
    } catch {}
  }
  const vehData = data.vehicle || {
    name: 'Innova Crysta',
    capacity: '6+1 Seats',
    isAc: true,
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text(vehData.name, vehTextX, vehBoxY + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  const acText = vehData.isAc !== false ? '• AC' : '• Non-AC'
  doc.text(`Capacity: ${vehData.capacity || '6+1 Seats'}  ${acText}`, vehTextX, vehBoxY + 13)
  y = vehBoxY + vehBoxH + 7
  // ------------------------------------------
  // INCLUSIONS & EXCLUSIONS (SIDE BY SIDE CARDS)
  // ------------------------------------------
  checkAddPage(35)
  const incWidth = (contentWidth - 6) / 2 // ~90mm each
  const incX = margin
  const excX = margin + incWidth + 6
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
  const boxHeight = Math.max(incList.length, excList.length) * 4.5 + 10
  // Inclusions Box (Green tint)
  doc.setFillColor(236, 253, 245) // #ECFDF5
  doc.setDrawColor(167, 243, 208) // #A7F3D0
  doc.roundedRect(incX, y, incWidth, boxHeight, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(5, 150, 105) // Green
  doc.text('INCLUSIONS', incX + 4, y + 6)
  let incY = y + 11
  incList.forEach((inc) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(30, 41, 59)
    doc.circle(incX + 4.5, incY - 0.8, 0.65, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(30, 41, 59)
    const lines = doc.splitTextToSize(inc, incWidth - 12)
    doc.text(lines[0] || '', incX + 9, incY)
    incY += 4.5
  })
  // Exclusions Box (Red tint)
  doc.setFillColor(254, 242, 242) // #FEF2F2
  doc.setDrawColor(254, 202, 202) // #FECACA
  doc.roundedRect(excX, y, incWidth, boxHeight, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(220, 38, 38) // Red
  doc.text('EXCLUSIONS', excX + 4, y + 6)
  let excY = y + 11
  excList.forEach((exc) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(30, 41, 59)
    doc.circle(excX + 4.5, excY - 0.8, 0.65, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(30, 41, 59)
    const lines = doc.splitTextToSize(exc, incWidth - 12)
    doc.text(lines[0] || '', excX + 9, excY)
    excY += 4.5
  })
  y += boxHeight + 7
  // ------------------------------------------
  // ESTIMATED COST SECTION
  // ------------------------------------------
  checkAddPage(28)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(11, 37, 69)
  doc.text('ESTIMATED COST', margin, y)
  y += 4
  const costBoxY = y
  const costBoxH = 22
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, costBoxY, contentWidth, costBoxH, 2, 2, 'FD')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text('Package Cost (per person)', margin + 4, costBoxY + 5.5)
  doc.text('Total Travelers', margin + 4, costBoxY + 10.5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(11, 37, 69)
  drawRsAmount(margin + 55, costBoxY + 5.5, data.pricePerPerson, '12,999', 8, [11, 37, 69], ': ')
  const totalTravelersCount = (data.adultsCount || 0) + (data.childrenCount || 0) || 1
  doc.text(`:  ${totalTravelersCount} (${data.travelersText || '2 Adults, 1 Child'})`, margin + 55, costBoxY + 10.5)
  // Highlighted Total Cost Row
  doc.setFillColor(239, 246, 255) // #EFF6FF
  doc.setDrawColor(191, 219, 254) // #BFDBFE
  doc.roundedRect(margin + 2, costBoxY + 13.5, contentWidth - 4, 7, 1.5, 1.5, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(29, 78, 216) // Blue
  doc.text('Estimated Total Cost', margin + 6, costBoxY + 18)
  drawRsAmount(margin + 55, costBoxY + 18, data.estimatedTotalCost, '38,997', 9, [29, 78, 216], ': ')
  y = costBoxY + costBoxH + 6
  // Render footers across all pages
  renderFooters()
  // Generate clean filename
  const rawSlug = data.packageSlug || data.packageName || 'travel-itinerary'
  const safeFilename = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'travel-itinerary'
  doc.save(`${safeFilename}-travel-itinerary.pdf`)
}
