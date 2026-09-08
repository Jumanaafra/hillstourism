export interface MediaItem {
  url: string
  alt?: string
  type?: 'image' | 'video'
  caption?: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  locations?: string[]
  activities?: string[]
  meals?: string[]
  accommodation?: string
  travelInfo?: string
  images?: string[]
  highlights?: string[] // Backwards compatibility with early models
}

// Backwards compatibility alias
export type ItineraryItem = ItineraryDay

export interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
}

export interface Package {
  id: string
  name: string
  slug: string
  destination: string
  categoryId?: string
  category?: string
  tag?: string
  duration?: string
  nights?: number | string
  price?: string
  priceNote?: string
  shortDescription?: string
  description?: string
  itinerary?: ItineraryDay[]
  highlights?: string[]
  inclusions?: string[]
  exclusions?: string[]
  importantInformation?: string[]
  hotelIds?: string[]
  vehicleIds?: string[]
  media?: MediaItem[]
  image?: string
  coverImage?: string
  gallery?: string[]
  active: boolean
  seo?: SEOData
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Hotel {
  id: string
  name: string
  normalizedName: string
  slug: string
  location?: string
  category: 'Normal' | 'Premium' | '5 Star' | string
  rating?: number
  pricePerNight?: string
  description?: string
  amenities: string[]
  media?: MediaItem[]
  image?: string
  active: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Vehicle {
  id: string
  name: string
  numberPlate: string
  normalizedNumberPlate: string
  type: string
  model?: string
  capacity: number
  luggage?: string
  driverAvailable: boolean
  localRoutes: boolean
  flexiblePickup: boolean
  idealFor?: string
  priceNote?: string
  features: string[]
  description?: string
  media?: MediaItem[]
  image?: string
  active: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Category {
  id: string
  title: string
  slug?: string
  subtitle?: string
  description?: string
  image?: string
  badge?: string
  color?: string
  order?: number
  active: boolean
}

export interface Experience {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  duration: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | string
  location: string
  icon: string
  highlights: string[]
  active?: boolean
}

export interface Testimonial {
  id: string
  name: string
  trip: string
  location: string
  rating: number
  review: string
  avatar: string
  initials: string
  active?: boolean
}

export interface EnquiryCustomer {
  name: string
  phone: string
  email?: string
}

export interface EnquiryEntitySnapshot {
  id: string
  nameSnapshot?: string
  numberPlateSnapshot?: string
}

export interface EnquiryTravel {
  date?: string
  groupSize?: number
  tripType?: string
}

export interface EnquiryIntegrations {
  emailStatus?: 'pending' | 'sent' | 'failed'
  sheetsStatus?: 'pending' | 'synced' | 'failed'
  emailError?: string
  sheetsError?: string
}

export type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'closed' | 'spam'

export interface Enquiry {
  id: string
  customer: EnquiryCustomer
  package?: EnquiryEntitySnapshot
  hotel?: EnquiryEntitySnapshot
  vehicle?: EnquiryEntitySnapshot
  travel: EnquiryTravel
  message?: string
  source?: string
  status: EnquiryStatus
  integrations: EnquiryIntegrations
  createdAt: string | Date
  updatedAt: string | Date
}

export interface ChatKnowledge {
  id: string
  title: string
  category: 'company' | 'package' | 'hotel' | 'vehicle' | 'policy' | 'faq' | 'general'
  content: string
  keywords: string[]
  active: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface AdminUser {
  uid: string
  email: string
  displayName?: string
  role: 'admin' | 'super_admin' | 'content_manager'
  active: boolean
  createdAt: string | Date
}

export interface SiteSettings {
  siteName: string
  tagline: string
  contactPhone: string
  contactEmail: string
  whatsappNumber: string
  address: string
  operationalHours: string
  totalTravelersMetric: string
  routesCountMetric: string
  averageRatingMetric: string
}
