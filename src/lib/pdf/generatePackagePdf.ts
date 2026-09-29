import { jsPDF } from 'jspdf'
import type { Package, Hotel, Vehicle } from '@/types/domain'

/**
 * Generates and downloads a clean, professional, selectable-text PDF
 * containing all available package details from the current form state.
 */
export function generatePackagePDF(
  pkg: Package,
  hotels: Hotel[] = [],
  vehicles: Vehicle[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // Helper to check page break and add a new page if needed
  const checkAddPage = (neededHeight: number = 10) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage()
      y = margin
      renderHeaderBar()
    }
  }

  // Mini header for page > 1
  const renderHeaderBar = () => {
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('HILLS TOURISM — PACKAGE SPECIFICATION SHEET', margin, y)
    y += 4
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
  }

  // Draw Header Banner for Page 1
  doc.setFillColor(0, 16, 64) // #001040 navy
  doc.rect(margin, y, contentWidth, 24, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('PACKAGE DETAILS', margin + 6, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225)
  const pkgName = pkg.name || 'Untitled Package'
  const pkgSub = `${pkg.destination || 'Destination N/A'} | ${pkg.duration || 'Duration N/A'} | ${pkg.price || 'Price N/A'}`
  doc.text(`${pkgName} — ${pkgSub}`, margin + 6, y + 18)

  y += 30

  // Helper for Section Headings
  const renderSectionHeader = (title: string) => {
    checkAddPage(14)
    doc.setFillColor(241, 245, 249) // light slate
    doc.rect(margin, y, contentWidth, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42) // dark slate
    doc.text(title.toUpperCase(), margin + 3, y + 5)
    y += 10
  }

  // Helper for Key-Value Pairs
  const renderKeyValue = (key: string, value: string | undefined | null) => {
    const safeVal = value && value.trim() ? value.trim() : 'N/A'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    
    // Split key & value lines if needed
    const wrappedValueLines = doc.splitTextToSize(safeVal, contentWidth - 50)
    const lineCount = wrappedValueLines.length
    const needed = Math.max(6, lineCount * 4.5 + 2)
    checkAddPage(needed)

    doc.text(`${key}:`, margin + 2, y + 4)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(wrappedValueLines, margin + 50, y + 4)
    
    y += Math.max(6, lineCount * 4.5 + 2)
  }

  // Helper for Multiline Paragraph Sections (Descriptions, Lists)
  const renderTextBlock = (label: string, text: string | undefined | null) => {
    const safeText = text && text.trim() ? text.trim() : 'N/A'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)

    checkAddPage(8)
    doc.text(`${label}:`, margin + 2, y + 4)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    const lines = doc.splitTextToSize(safeText, contentWidth - 4)

    for (const line of lines) {
      checkAddPage(5)
      doc.text(line, margin + 4, y)
      y += 4.5
    }
    y += 3
  }

  // Helper for Bullet Point Lists
  const renderBulletList = (title: string, items: string[] | undefined | null, colorHex = '#1E293B') => {
    renderSectionHeader(title)
    if (!items || items.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.text('None specified (N/A)', margin + 4, y)
      y += 6
      return
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)

    for (const item of items) {
      if (!item || !item.trim()) continue
      const bulletText = `•  ${item.trim()}`
      const lines = doc.splitTextToSize(bulletText, contentWidth - 8)
      for (const line of lines) {
        checkAddPage(5)
        doc.text(line, margin + 4, y)
        y += 4.5
      }
    }
    y += 4
  }

  // 1. BASIC INFORMATION
  renderSectionHeader('1. Basic Information')
  renderKeyValue('Package Name', pkg.name)
  renderKeyValue('Slug', pkg.slug)
  renderKeyValue('Destination', pkg.destination)
  renderKeyValue('Category', pkg.category)
  renderKeyValue('Duration Display', pkg.duration)
  renderKeyValue('Number of Nights', pkg.nights !== undefined && pkg.nights !== null ? String(pkg.nights) : undefined)
  renderKeyValue('Price Display', pkg.price)
  renderKeyValue('Price Note', pkg.priceNote)
  renderKeyValue('Experience Tag', pkg.tag)
  renderKeyValue('Public Status', pkg.active !== false ? 'Publicly Active (Visible on site)' : 'Hidden / Inactive')
  renderKeyValue('Cover Image URL', pkg.coverImage || pkg.image)
  
  const galleryStr = (pkg.gallery || []).filter(Boolean).join(', ')
  renderKeyValue('Gallery Images', galleryStr || undefined)

  y += 2
  renderTextBlock('Short Description (Hero & Cards)', pkg.shortDescription)
  renderTextBlock('Full Narrative Description', pkg.description)

  // 2. HIGHLIGHTS
  if (pkg.highlights && pkg.highlights.length > 0) {
    renderBulletList('2. Highlights', pkg.highlights)
  }

  // 3. ITINERARY
  renderSectionHeader('3. Day-Wise Itinerary')
  const itinerary = pkg.itinerary || []
  if (itinerary.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(148, 163, 184)
    doc.text('No itinerary days configured.', margin + 4, y)
    y += 8
  } else {
    itinerary.forEach((dayItem, idx) => {
      checkAddPage(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(8, 120, 255) // bright blue
      doc.text(`Day ${dayItem.day || idx + 1}: ${dayItem.title || 'Untitled Day'}`, margin + 2, y)
      y += 5.5

      if (dayItem.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(30, 41, 59)
        const descLines = doc.splitTextToSize(dayItem.description, contentWidth - 8)
        for (const line of descLines) {
          checkAddPage(5)
          doc.text(line, margin + 6, y)
          y += 4.5
        }
      }

      if (dayItem.locations && dayItem.locations.length > 0) {
        renderKeyValue('   Locations / Route', dayItem.locations.join(', '))
      }
      if (dayItem.activities && dayItem.activities.length > 0) {
        renderKeyValue('   Activities', dayItem.activities.join(', '))
      }
      if (dayItem.meals && dayItem.meals.length > 0) {
        renderKeyValue('   Meals Included', dayItem.meals.join(', '))
      }
      if (dayItem.accommodation) {
        renderKeyValue('   Stay / Hotel', dayItem.accommodation)
      }
      if (dayItem.travelInfo) {
        renderKeyValue('   Travel Info', dayItem.travelInfo)
      }
      if (dayItem.images && dayItem.images.length > 0) {
        renderKeyValue('   Day Image URLs', dayItem.images.join(', '))
      }

      y += 2
      // Light separator line between days
      checkAddPage(4)
      doc.setDrawColor(241, 245, 249)
      doc.line(margin + 4, y, pageWidth - margin - 4, y)
      y += 4
    })
  }

  // 4. INCLUSIONS
  renderBulletList('4. Inclusions', pkg.inclusions)

  // 5. EXCLUSIONS
  renderBulletList('5. Exclusions', pkg.exclusions)

  // 6. IMPORTANT INFORMATION
  if (pkg.importantInformation && pkg.importantInformation.length > 0) {
    renderBulletList('6. Important Information & Guidelines', pkg.importantInformation)
  }

  // 7. CONNECTED HOTELS & VEHICLES
  renderSectionHeader('7. Connected Hotels & Fleet Vehicles')
  
  const selectedHotels = (pkg.hotelIds || [])
    .map(id => hotels.find(h => h.id === id))
    .filter(Boolean) as Hotel[]
  
  const hotelList = selectedHotels.length > 0
    ? selectedHotels.map(h => `${h.name} (${h.location || h.category || 'Hotel'})`)
    : []
  
  renderBulletList('Connected Stays / Hotels', hotelList.length > 0 ? hotelList : null)

  const selectedVehicles = (pkg.vehicleIds || [])
    .map(id => vehicles.find(v => v.id === id))
    .filter(Boolean) as Vehicle[]
  
  const vehicleList = selectedVehicles.length > 0
    ? selectedVehicles.map(v => `${v.name} (${v.type} - ${v.capacity} seats)`)
    : []

  renderBulletList('Connected Fleet Vehicles', vehicleList.length > 0 ? vehicleList : null)

  // 8. SEO & SOCIAL METADATA
  if (pkg.seo?.title || pkg.seo?.description) {
    renderSectionHeader('8. SEO & Social Metadata')
    renderKeyValue('Meta Title', pkg.seo?.title)
    renderKeyValue('Meta Description', pkg.seo?.description)
  }

  // Add Page Numbers and Footer to all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Generated by Hills Tourism Admin • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    )
  }

  // Normalize filename safely
  const rawSlug = pkg.slug || pkg.name || 'package'
  const safeFilename = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'package-details'

  doc.save(`${safeFilename}-package-details.pdf`)
}
