import { packages as rawPackages } from '../../data/packages'
import { stays as rawStays } from '../../data/stays'
import { vehicles as rawVehicles } from '../../data/vehicles'
import { categories as rawCategories } from '../../data/categories'
import { experiences as rawExperiences } from '../../data/experiences'
import { testimonials as rawTestimonials } from '../../data/testimonials'
import { normalizeHotelName } from '../normalization/hotel'
import { normalizeNumberPlate } from '../normalization/vehicle'
import type { Package, Hotel, Vehicle, Category, Experience, Testimonial, ChatKnowledge, SiteSettings } from '../../types/domain'

export const seedPackages: Package[] = rawPackages.map(p => ({
  id: p.id,
  name: p.title,
  slug: p.id,
  destination: p.destination,
  duration: p.duration,
  price: p.price,
  priceNote: p.priceNote,
  category: p.category,
  tag: p.tag,
  description: p.description,
  image: p.image,
  highlights: p.highlights,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

export const seedHotels: Hotel[] = rawStays.map(s => ({
  id: s.id,
  name: s.name,
  normalizedName: normalizeHotelName(s.name),
  slug: s.id,
  location: s.location,
  category: s.category,
  rating: s.rating,
  pricePerNight: s.pricePerNight,
  description: s.description,
  amenities: s.amenities,
  image: s.image,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

export const seedVehicles: Vehicle[] = rawVehicles.map((v, idx) => {
  // Give each vehicle an authentic number plate if not present
  const plates: Record<string, string> = {
    'innova-crysta': 'TN 01 AB 1234',
    'tempo-traveller': 'KL 07 CD 5678',
    'swift-dzire': 'KA 04 EF 9012',
    'fortuner': 'TN 43 GH 3456',
  }
  const plate = plates[v.id] || `TN 01 X ${1000 + idx}`
  return {
    id: v.id,
    name: v.name,
    numberPlate: plate,
    normalizedNumberPlate: normalizeNumberPlate(plate),
    type: v.type,
    capacity: v.capacity,
    luggage: v.luggage,
    driverAvailable: v.driverAvailable,
    localRoutes: v.localRoutes,
    flexiblePickup: v.flexiblePickup,
    idealFor: v.idealFor,
    priceNote: v.priceNote,
    features: v.features,
    image: v.image,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
})

export const seedCategories: Category[] = rawCategories.map((c, i) => ({
  id: c.id,
  title: c.title,
  slug: c.id,
  subtitle: c.subtitle,
  description: c.description,
  image: c.image,
  badge: c.badge,
  color: c.color,
  order: i + 1,
  active: true,
}))

export const seedExperiences: Experience[] = rawExperiences.map(e => ({
  id: e.id,
  title: e.title,
  subtitle: e.subtitle,
  description: e.description,
  image: e.image,
  duration: e.duration,
  difficulty: e.difficulty,
  location: e.location,
  icon: e.icon,
  highlights: e.highlights,
  active: true,
}))

export const seedTestimonials: Testimonial[] = rawTestimonials.map(t => ({
  id: t.id,
  name: t.name,
  trip: t.trip,
  location: t.location,
  rating: t.rating,
  review: t.review,
  avatar: t.avatar,
  initials: t.initials,
  active: true,
}))

export const seedKnowledge: ChatKnowledge[] = [
  {
    id: 'k-company',
    title: 'About Hills Tourism',
    category: 'company',
    content: 'Hills Tourism is an enquiry-led premium tourism brand established in 2018. We specialize in custom mountain getaways across Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali. Our team designs personalized itineraries with local expertise, vetted homestays/resorts, and dedicated mountain-experienced drivers.',
    keywords: ['about', 'company', 'history', 'who are you', 'trust', 'local experts'],
    active: true,
  },
  {
    id: 'k-enquiry-process',
    title: 'How Hills Tourism Booking & Enquiry Works',
    category: 'policy',
    content: 'Hills Tourism operates on a personalized enquiry model, NOT instant transactional online booking. Customers submit an enquiry detailing their preferred package, dates, group size, and stay/vehicle options. Our local mountain trip planners reach out within 2 hours with a bespoke itinerary and transparent quote. No upfront payment is taken on the website.',
    keywords: ['booking', 'enquiry', 'payment', 'how to book', 'pricing', 'deposit', 'policy'],
    active: true,
  },
  {
    id: 'k-contact',
    title: 'Hills Tourism Contact & Support',
    category: 'general',
    content: 'You can contact the Hills Tourism team via WhatsApp at +91 99990 00000 or email hello@hillstourism.com. Support hours are 9 AM to 9 PM, 7 days a week. During trips, clients have 24/7 on-call coordinator support.',
    keywords: ['contact', 'phone', 'whatsapp', 'email', 'support', 'help', 'emergency'],
    active: true,
  },
  {
    id: 'k-seasons',
    title: 'Best Times to Visit Hill Stations',
    category: 'faq',
    content: 'Munnar, Ooty, and Coorg are pleasant year-round with lush monsoons (June-Sept) and crisp winter weather (Oct-Feb). Manali and Shimla experience winter snow from December to February, and blooming springs from March to June.',
    keywords: ['best time', 'weather', 'season', 'when to visit', 'snow', 'monsoon'],
    active: true,
  },
]

export const seedSiteSettings: SiteSettings = {
  siteName: 'Hills Tourism',
  tagline: 'Discover the Hills Beyond the Ordinary',
  contactPhone: '+91 99990 00000',
  contactEmail: 'hello@hillstourism.com',
  whatsappNumber: '+919999000000',
  address: 'Hill Country, Nilgiris & Western Ghats, India',
  operationalHours: '9 AM – 9 PM IST (7 Days)',
  totalTravelersMetric: '2,500+',
  routesCountMetric: '120+',
  averageRatingMetric: '4.9',
}
