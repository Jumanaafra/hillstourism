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
  // Pre-load images concurrently
  const [logoBase64, stayImgBase64, vehicleImgBase64, ...dayImagesBase64] = await Promise.all([
    fetchImageAsBase64('/logo.png'),
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

  // Page break checker helper
  const checkAddPage = (neededHeight: number = 15) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage()
      y = margin
      renderMiniHeader()
    }
  }

  // Mini Header for Page 2+
  const renderMiniHeader = () => {
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', margin, y, 14, 9)
      } catch {}
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(11, 37, 69) // #0B2545
    doc.text('HILLSTOURISM — TRAVEL ITINERARY', margin + (logoBase64 ? 17 : 0), y + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(data.packageName || 'Package Itinerary', pageWidth - margin, y + 5, { align: 'right' })

    y += 10
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
  }

  // Footer on all pages helper
  const renderFooters = () => {
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const footerY = pageHeight - 10

      // Mountain line graphics symbol
      doc.setDrawColor(11, 37, 69)
      doc.setLineWidth(0.4)
      doc.line(pageWidth / 2 - 25, footerY - 4, pageWidth / 2 - 8, footerY - 4)
      doc.line(pageWidth / 2 + 8, footerY - 4, pageWidth / 2 + 25, footerY - 4)
      
      // Triangle mountain peak symbol
      doc.setFillColor(11, 37, 69)
      doc.triangle(
        pageWidth / 2 - 4, footerY - 3,
        pageWidth / 2, footerY - 7,
        pageWidth / 2 + 4, footerY - 3,
        'F'
      )

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(11, 37, 69)
      doc.text('Thank you for choosing Hillstourism', pageWidth / 2, footerY + 0.5, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(100, 116, 139)
      doc.text('EXPLORE  •  DISCOVER  •  CREATE MEMORIES', pageWidth / 2, footerY + 4, { align: 'center' })

      doc.setFontSize(7)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY + 4, { align: 'right' })
    }
  }

  // ==========================================
  // PAGE 1: HEADER & LOGO
  // ==========================================
  if (logoBase64) {
    try {
      const logoW = 24
      const logoH = 15
      doc.addImage(logoBase64, 'PNG', (pageWidth - logoW) / 2, y, logoW, logoH)
      y += logoH + 2
    } catch {
      y += 2
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(11, 37, 69)
  doc.text('HILLSTOURISM', pageWidth / 2, y, { align: 'center' })
  y += 4.5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(8, 120, 255)
  doc.text('TRAVEL ITINERARY', pageWidth / 2, y, { align: 'center' })
  y += 5

  // Decorative mountain line under header
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(pageWidth / 2 - 20, y, pageWidth / 2 + 20, y)
  y += 6

  // Main Package Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(11, 37, 69)
  doc.text(data.packageName || 'Travel Itinerary', pageWidth / 2, y, { align: 'center' })
  y += 5.5

  // Tagline / Subtitle
  const taglineText = data.tagline?.trim() || 'TEA GARDENS  |  MISTY MOUNTAINS  |  SCENIC BEAUTY'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(taglineText.toUpperCase(), pageWidth / 2, y, { align: 'center' })
  y += 7

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
    data.days.forEach((dayItem, dIdx) => {
      // Calculate estimated height for this day box
      const descLines = dayItem.description ? doc.splitTextToSize(dayItem.description, dayRightW - 4) : []
      const schedCount = dayItem.schedule?.length || 0
      const dayImgBase64 = dayImagesBase64[dIdx]

      let schedBoxH = schedCount * 4.5 + (dayImgBase64 ? 4 : 0)
      if (dayImgBase64 && schedBoxH < 22) schedBoxH = 22
      if (schedBoxH > 0) schedBoxH += 4

      const neededH = 10 + descLines.length * 4 + schedBoxH + 6
      checkAddPage(neededH)

      const startY = y

      // Left Column: Day Pill & Date
      doc.setFillColor(11, 37, 69) // Dark navy
      doc.roundedRect(margin, y, 22, 7, 2, 2, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(`Day ${dayItem.day || dIdx + 1}`, margin + 11, y + 4.8, { align: 'center' })

      if (dayItem.dateStr || dayItem.dayOfWeek) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6.5)
        doc.setTextColor(71, 85, 105)
        if (dayItem.dateStr) {
          doc.text(dayItem.dateStr, margin + 11, y + 10.5, { align: 'center' })
        }
        if (dayItem.dayOfWeek) {
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(148, 163, 184)
          doc.text(dayItem.dayOfWeek, margin + 11, y + 13.5, { align: 'center' })
        }
      }

      // Vertical timeline node dot
      doc.setFillColor(8, 120, 255) // bright blue
      doc.circle(timelineLineX, y + 3.5, 1.8, 'F')

      // Right Column: Title & Description
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(11, 37, 69)
      doc.text(dayItem.title || `Day ${dayItem.day || dIdx + 1}`, dayRightX, y + 4.5)

      let currentRightY = y + 8.5

      if (descLines.length > 0) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(71, 85, 105)
        descLines.forEach((line: string) => {
          doc.text(line, dayRightX, currentRightY)
          currentRightY += 3.8
        })
        currentRightY += 1.5
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

        let itemY = boxY + 4.5
        if (dayItem.schedule) {
          dayItem.schedule.forEach((sch) => {
            if (!sch.activity && !sch.time) return
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7)
            doc.setTextColor(8, 120, 255)
            if (sch.time) {
              doc.text(sch.time, dayRightX + 4, itemY)
            }
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7.5)
            doc.setTextColor(30, 41, 59)
            const timeOffset = sch.time ? 22 : 4
            const actLines = doc.splitTextToSize(sch.activity, textW - timeOffset)
            doc.text(actLines[0] || '', dayRightX + 4 + timeOffset, itemY)
            itemY += 4.5
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

        currentRightY = boxY + schedBoxH + 4
      }

      const dayEndHeight = Math.max(16, currentRightY - startY)

      // Draw timeline connector line downwards
      if (dIdx < data.days.length - 1) {
        doc.setDrawColor(203, 213, 225)
        doc.setLineWidth(0.4)
        doc.line(timelineLineX, startY + 5.5, timelineLineX, startY + dayEndHeight + 2)
      }

      y = startY + dayEndHeight + 4
    })
  }

  // ==========================================
  // PAGE 2 (OR CONTINUATION): PACKAGE DETAILS, STAYS, VEHICLES & COST
  // ==========================================
  // Force a clean page break for Package Details section if we are on Page 1 or running low on space
  if (y > pageHeight - margin - 80 || doc.getNumberOfPages() === 1) {
    doc.addPage()
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
  renderSumRow(sumBoxY + 15, 'Duration :', data.duration, 'Price :', data.pricePerPerson)
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
  doc.text('[✓] INCLUSIONS', incX + 4, y + 6)

  let incY = y + 11
  incList.forEach((inc) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(16, 185, 129)
    doc.text('✓', incX + 4, incY)

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
  doc.text('[✕] EXCLUSIONS', excX + 4, y + 6)

  let excY = y + 11
  excList.forEach((exc) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(239, 68, 68)
    doc.text('✕', excX + 4, excY)

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
  doc.text(`:  ${data.pricePerPerson || '₹12,999'}`, margin + 55, costBoxY + 5.5)
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
  doc.text(`:  ${data.estimatedTotalCost || '₹38,997'}`, margin + 55, costBoxY + 18)

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
