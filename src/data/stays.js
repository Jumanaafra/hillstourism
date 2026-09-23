// Hillstourism Stays Data
export const stays = [
  {
    id: 'valley-view-homestay',
    name: 'Valley View Homestay',
    location: 'Munnar, Kerala',
    category: 'Normal',
    rating: 4.2,
    pricePerNight: '₹2,800',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80&auto=format',
    amenities: ['Mountain View', 'Home Meals', 'Local Guide', 'Garden'],
    description: 'A warm family homestay surrounded by tea gardens with stunning valley panoramas.',
    rooms: [
      {
        id: 'vv-c01', roomNumber: 'C01', name: 'Valley Cottage', category: 'Normal', capacity: 2, pricePerNight: 2800, status: 'available', layoutOrder: 1, row: 1, column: 1,
        image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format'
        ],
        description: 'Cozy hillside room overlooking Munnar valley gardens.',
        amenities: ['Mountain View', 'Wi-Fi', 'Balcony']
      },
      {
        id: 'vv-c02', roomNumber: 'C02', name: 'Garden Cottage', category: 'Normal', capacity: 2, pricePerNight: 2800, status: 'available', layoutOrder: 2, row: 1, column: 2,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80&auto=format'
        ],
        description: 'Tranquil garden view room with fresh flower trails.',
        amenities: ['Garden View', 'Breakfast Included']
      },
      {
        id: 'vv-c03', roomNumber: 'C03', name: 'Family Suite', category: 'Family', capacity: 4, pricePerNight: 4200, status: 'available', layoutOrder: 3, row: 2, column: 1,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format'
        ],
        description: 'Spacious family cottage accommodating up to 4 guests with living area.',
        amenities: ['Family Lounge', 'Kitchenette', 'Private Deck']
      },
      {
        id: 'vv-c04', roomNumber: 'C04', name: 'Deluxe View Room', category: 'Deluxe', capacity: 2, pricePerNight: 3500, status: 'available', layoutOrder: 4, row: 2, column: 2,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format'
        ],
        description: 'Deluxe room featuring floor-to-ceiling glass windows overlooking misty hills.',
        amenities: ['Panorama Windows', 'King Bed', 'Coffee Maker']
      },
    ]
  },
  {
    id: 'coorg-bungalow',
    name: 'The Coffee Bungalow',
    location: 'Coorg, Karnataka',
    category: 'Premium',
    rating: 4.6,
    pricePerNight: '₹6,500',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format',
    amenities: ['Private Plunge Pool', 'Estate Breakfast', 'Bonfire', 'Spa Access'],
    description: 'A restored colonial planter\'s bungalow set inside a working coffee estate.',
    rooms: [
      {
        id: 'cb-c01', roomNumber: 'C01', name: 'Deluxe Cottage', category: 'Deluxe', capacity: 2, pricePerNight: 4500, status: 'available', layoutOrder: 1, row: 1, column: 1,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format'
        ],
        description: 'Charming planter cottage with direct coffee trail access and plush bedding.',
        amenities: ['Estate Breakfast', 'Wi-Fi', 'Coffee Machine']
      },
      {
        id: 'cb-c02', roomNumber: 'C02', name: 'Premium Cottage', category: 'Premium', capacity: 2, pricePerNight: 5000, status: 'available', layoutOrder: 2, row: 1, column: 2,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format'
        ],
        description: 'Luxury planter cottage featuring private verandah overlooking coffee estate canopy.',
        amenities: ['Private Verandah', 'Estate Breakfast', 'Heritage Tub']
      },
      {
        id: 'cb-c03', roomNumber: 'C03', name: 'Family Cottage', category: 'Family', capacity: 4, pricePerNight: 6500, status: 'available', layoutOrder: 3, row: 2, column: 1,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format'
        ],
        description: 'Generous two-bedroom estate family cottage with open fire pit access.',
        amenities: ['2 Bedrooms', 'Fire Pit Access', 'Estate Breakfast', 'Spa Pass']
      },
      {
        id: 'cb-c04', roomNumber: 'C04', name: 'Deluxe Cottage', category: 'Deluxe', capacity: 2, pricePerNight: 4500, status: 'available', layoutOrder: 4, row: 2, column: 2,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format'
        ],
        description: 'Deluxe hillside cottage nestled next to coffee blossom groves.',
        amenities: ['Plunge Pool Access', 'Estate Breakfast', 'King Bed']
      },
    ]
  },
  {
    id: 'himalayan-boutique',
    name: 'Himalayan Nest Boutique',
    location: 'Shimla, Himachal Pradesh',
    category: 'Premium',
    rating: 4.7,
    pricePerNight: '₹8,200',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format',
    amenities: ['Snow View', 'In-room Fireplace', 'Butler', 'Fine Dining'],
    description: 'A boutique mountain retreat combining colonial elegance with Himalayan warmth.',
    rooms: [
      {
        id: 'hb-c01', roomNumber: 'C01', name: 'Heritage Suite', category: 'Premium', capacity: 2, pricePerNight: 8200, status: 'available', layoutOrder: 1, row: 1, column: 1,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format'
        ],
        description: 'Colonial heritage suite with cedarwood paneling and fireplace.',
        amenities: ['In-room Fireplace', 'Butler', 'Snow View']
      },
      {
        id: 'hb-c02', roomNumber: 'C02', name: 'Snow View Cottage', category: 'Premium', capacity: 2, pricePerNight: 9500, status: 'available', layoutOrder: 2, row: 1, column: 2,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format'
        ],
        description: 'Exclusive cottage facing snow-covered Himalayan ridges.',
        amenities: ['Snow View Verandah', 'Heated Blanket', 'Butler']
      },
      {
        id: 'hb-c03', roomNumber: 'C03', name: 'Fireplace Family Suite', category: 'Family', capacity: 4, pricePerNight: 12000, status: 'available', layoutOrder: 3, row: 2, column: 1,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format'
        ],
        description: 'Double fireplace family cottage designed for warm mountain winters.',
        amenities: ['2 Fireplaces', 'Butler', 'Gourmet Dining']
      },
      {
        id: 'hb-c04', roomNumber: 'C04', name: 'Pine View Deluxe', category: 'Deluxe', capacity: 2, pricePerNight: 7800, status: 'available', layoutOrder: 4, row: 2, column: 2,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format'
        ],
        description: 'Peaceful room surrounded by high-altitude pine canopy.',
        amenities: ['Pine View', 'Heated Bath', 'Wi-Fi']
      },
    ]
  },
  {
    id: 'nilgiri-forest-resort',
    name: 'Nilgiri Forest Escape',
    location: 'Ooty, Tamil Nadu',
    category: 'Normal',
    rating: 4.3,
    pricePerNight: '₹3,500',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format',
    amenities: ['Forest View', 'Trekking', 'Campfire', 'Bird Watching'],
    description: 'Nestled at the edge of a shola forest, perfect for nature lovers and trekkers.',
    rooms: [
      { id: 'nf-c01', roomNumber: 'C01', name: 'Shola Cottage', category: 'Normal', capacity: 2, pricePerNight: 3500, status: 'available', layoutOrder: 1, row: 1, column: 1, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format' },
      { id: 'nf-c02', roomNumber: 'C02', name: 'Forest Edge Room', category: 'Deluxe', capacity: 2, pricePerNight: 4000, status: 'available', layoutOrder: 2, row: 1, column: 2 },
      { id: 'nf-c03', roomNumber: 'C03', name: 'Canopy Family Cottage', category: 'Family', capacity: 4, pricePerNight: 5800, status: 'available', layoutOrder: 3, row: 2, column: 1 },
      { id: 'nf-c04', roomNumber: 'C04', name: 'Log Cabin Cottage', category: 'Special', capacity: 2, pricePerNight: 4800, status: 'available', layoutOrder: 4, row: 2, column: 2 },
    ]
  },
  {
    id: 'darjeeling-manor',
    name: 'The Darjeeling Manor',
    location: 'Darjeeling, West Bengal',
    category: '5 Star',
    rating: 4.9,
    pricePerNight: '₹18,000',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format',
    amenities: ['Kanchenjunga View', 'Luxury Spa', 'Fine Dining', 'Concierge', 'Helipad'],
    description: 'An iconic heritage manor with uninterrupted views of Kanchenjunga — pure luxury.',
    rooms: [
      { id: 'dm-c01', roomNumber: 'C01', name: 'Royal Kanchenjunga Suite', category: 'Special', capacity: 2, pricePerNight: 18000, status: 'available', layoutOrder: 1, row: 1, column: 1, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format' },
      { id: 'dm-c02', roomNumber: 'C02', name: 'Planter\'s Heritage Villa', category: 'Premium', capacity: 2, pricePerNight: 21000, status: 'available', layoutOrder: 2, row: 1, column: 2 },
      { id: 'dm-c03', roomNumber: 'C03', name: 'Manor Grand Family Suite', category: 'Family', capacity: 6, pricePerNight: 28000, status: 'available', layoutOrder: 3, row: 2, column: 1 },
      { id: 'dm-c04', roomNumber: 'C04', name: 'Tea Garden Bungalow Room', category: 'Deluxe', capacity: 2, pricePerNight: 16500, status: 'available', layoutOrder: 4, row: 2, column: 2 },
    ]
  },
  {
    id: 'manali-summit-lodge',
    name: 'Summit Ridge Lodge',
    location: 'Manali, Himachal Pradesh',
    category: '5 Star',
    rating: 4.8,
    pricePerNight: '₹14,500',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format',
    amenities: ['Snow Activities', 'Infinity Pool', 'Ski Access', 'Butler', 'Wine Cellar'],
    description: 'A world-class alpine lodge where luxury meets the raw drama of the Himalayas.',
    rooms: [
      { id: 'ms-c01', roomNumber: 'C01', name: 'Alpine Chalet', category: 'Premium', capacity: 2, pricePerNight: 14500, status: 'available', layoutOrder: 1, row: 1, column: 1, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format' },
      { id: 'ms-c02', roomNumber: 'C02', name: 'Summit View Suite', category: 'Special', capacity: 2, pricePerNight: 16800, status: 'available', layoutOrder: 2, row: 1, column: 2 },
      { id: 'ms-c03', roomNumber: 'C03', name: 'Highland Family Chalet', category: 'Family', capacity: 4, pricePerNight: 22000, status: 'available', layoutOrder: 3, row: 2, column: 1 },
      { id: 'ms-c04', roomNumber: 'C04', name: 'Riverside Lodge Room', category: 'Deluxe', capacity: 2, pricePerNight: 13200, status: 'available', layoutOrder: 4, row: 2, column: 2 },
    ]
  },
]
