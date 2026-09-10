import { getChatKnowledge, getSiteSettings } from '../repositories/content.repo'
import { getPackages } from '../repositories/packages.repo'
import { getHotels } from '../repositories/hotels.repo'
import { getVehicles } from '../repositories/vehicles.repo'

export interface GroundedContext {
  knowledgeSnippets: string[]
  relevantPackages: string[]
  relevantHotels: string[]
  relevantVehicles: string[]
  companyInfo: string
}

/**
 * Lightweight keyword and metadata retrieval from Firestore / memory repositories.
 * Matches user query against active knowledge, packages, hotels, and vehicles.
 */
export async function retrieveGroundedContext(userMessage: string): Promise<GroundedContext> {
  const query = userMessage.toLowerCase()
  const tokens = query.split(/\s+/).filter(t => t.length > 2)

  const [settings, knowledge, packages, hotels, vehicles] = await Promise.all([
    getSiteSettings(),
    getChatKnowledge(true),
    getPackages(true),
    getHotels(true),
    getVehicles(true),
  ])

  // 1. Company Information
  const companyInfo = `
Company Name: ${settings.siteName}
Tagline: ${settings.tagline}
Contact Phone: ${settings.contactPhone}
WhatsApp: ${settings.whatsappNumber}
Contact Email: ${settings.contactEmail}
Operating Hours: ${settings.operationalHours}
Core Model: Enquiry-led curated tourism. We provide customized itineraries, local guides, and private vehicle tours. We DO NOT take direct transactional bookings or credit card payments on the website.
  `.trim()

  // 2. Filter Chat Knowledge by keyword matches
  const matchedKnowledge = knowledge.filter(k => {
    const titleMatch = query.includes(k.title.toLowerCase()) || k.title.toLowerCase().includes(query)
    const keywordMatch = k.keywords.some(kw => query.includes(kw.toLowerCase()) || tokens.includes(kw.toLowerCase()))
    const contentMatch = tokens.some(t => k.content.toLowerCase().includes(t))
    return titleMatch || keywordMatch || contentMatch
  })

  const knowledgeSnippets = matchedKnowledge.map(k => `[${k.title}]: ${k.content}`)

  // 3. Relevant Packages
  const isPackageGeneralQuery = query.includes('package') || query.includes('tour') || query.includes('trip')
  const matchedPackages = packages.filter(p => {
    const nameMatch = query.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(query)
    const destMatch = query.includes(p.destination.toLowerCase()) || p.destination.toLowerCase().includes(query)
    const catMatch = p.category ? query.includes(p.category.toLowerCase()) : false
    const tokenMatch = tokens.some(t => p.name.toLowerCase().includes(t) || p.destination.toLowerCase().includes(t))
    return nameMatch || destMatch || catMatch || tokenMatch || isPackageGeneralQuery
  }).slice(0, 4)

  const relevantPackages = matchedPackages.map(p =>
    `Package: ${p.name} (${p.destination}) | Duration: ${p.duration} | Base Price: ${p.price || 'Contact for quote'} | Category: ${p.category} | Highlights: ${(p.highlights || []).join(', ')}`
  )

  // 4. Relevant Hotels
  const isStayGeneralQuery = query.includes('hotel') || query.includes('stay') || query.includes('resort') || query.includes('homestay')
  const matchedHotels = hotels.filter(h => {
    const nameMatch = query.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(query)
    const locMatch = h.location ? query.includes(h.location.toLowerCase()) || h.location.toLowerCase().includes(query) : false
    const catMatch = query.includes(h.category.toLowerCase()) || h.category.toLowerCase().includes(query)
    const tokenMatch = tokens.some(t => h.name.toLowerCase().includes(t) || (h.location || '').toLowerCase().includes(t))
    return nameMatch || locMatch || catMatch || tokenMatch || isStayGeneralQuery
  }).slice(0, 4)

  const relevantHotels = matchedHotels.map(h =>
    `Hotel/Stay: ${h.name} (${h.location}) | Category: ${h.category} | Indicative Rate: ${h.pricePerNight || 'Varies by season'} | Amenities: ${h.amenities.slice(0, 4).join(', ')}`
  )

  // 5. Relevant Vehicles
  const isVehicleGeneralQuery = query.includes('vehicle') || query.includes('car') || query.includes('fleet') || query.includes('cab') || query.includes('driver')
  const matchedVehicles = vehicles.filter(v => {
    const nameMatch = query.includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(query)
    const typeMatch = query.includes(v.type.toLowerCase()) || v.type.toLowerCase().includes(query)
    const tokenMatch = tokens.some(t => v.name.toLowerCase().includes(t) || v.type.toLowerCase().includes(t))
    return nameMatch || typeMatch || tokenMatch || isVehicleGeneralQuery
  }).slice(0, 3)

  const relevantVehicles = matchedVehicles.map(v =>
    `Vehicle: ${v.name} (${v.type}) | Capacity: ${v.capacity} Passengers | Features: ${v.features.join(', ')} | Driver Included: ${v.driverAvailable ? 'Yes' : 'No'}`
  )

  return {
    companyInfo,
    knowledgeSnippets,
    relevantPackages,
    relevantHotels,
    relevantVehicles,
  }
}
