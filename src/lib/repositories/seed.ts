import { packages as rawPackages } from '../../data/packages'
import { stays as rawStays } from '../../data/stays'
import { vehicles as rawVehicles } from '../../data/vehicles'
import { categories as rawCategories } from '../../data/categories'
import { experiences as rawExperiences } from '../../data/experiences'
import { testimonials as rawTestimonials } from '../../data/testimonials'
import { normalizeHotelName } from '../normalization/hotel'
import { normalizeNumberPlate } from '../normalization/vehicle'
import type { Package, Hotel, Vehicle, Category, Experience, Testimonial, ChatKnowledge, SiteSettings } from '../../types/domain'

const packageDetails: Record<string, Partial<Package>> = {
  'ooty-getaway': {
    nights: 2,
    seo: {
      title: "Ooty Tour Packages | 3 Days Itinerary & Sightseeing",
      description: "Book our premium 3 days Ooty tour package. Experience the magic of the Nilgiris, tea estates, Doddabetta peak, and toy train rides with Hills Tourism.",
      keywords: ["Ooty tour package","Ooty sightseeing","Nilgiris trip","Ooty honeymoon package","Ooty 3 days itinerary"]
    },
    shortDescription: `Experience the magic of the Nilgiris with a scenic journey through Ooty\'s famous tea estates, historical train rides, and breathtaking viewpoints.`,
    coverImage: 'https://images.unsplash.com/photo-1596522354195-e84ae3c98731?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees/Activity tickets","Toy Train tickets","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Ooty Lake',
        description: `Arrive in Ooty and check into your premium hill-view resort. In the afternoon, visit the serene Ooty Lake for boating, followed by a stroll through the vibrant Thread Garden and a picturesque sunset view at the local viewpoint.`,
        locations: ["Ooty Lake","Thread Garden"],
        activities: ["Boating","Sightseeing"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Botanical Garden & Peak Sightseeing',
        description: `After breakfast, explore the sprawling Government Botanical Garden, home to rare floral species. Next, drive to Doddabetta Peak, the highest point in the Nilgiris, for a stunning panoramic view. End the day with a visit to a local tea factory.`,
        locations: ["Botanical Garden","Doddabetta Peak","Tea Factory"],
        activities: ["Nature Walk","Tea Tasting"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Pine Forest & Departure',
        description: `Enjoy a morning walk in the dense Pine Forests, offering an eerie yet beautiful atmosphere. Later, visit the cascading Pykara Waterfalls before departing for your onward journey with beautiful memories.`,
        locations: ["Pine Forest","Pykara Waterfalls"],
        activities: ["Photography","Sightseeing"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'kodaikanal': {
    nights: 2,
    seo: {
      title: "Kodaikanal Tour Packages | 3 Days Sightseeing Trip",
      description: "Discover Kodaikanal with our 3-day tour package. Explore misty cliffs, pine forests, star-shaped Kodai lake, and breathtaking viewpoints.",
      keywords: ["Kodaikanal tour package","Kodai trip","Princess of Hill Stations","Kodaikanal itinerary","Kodaikanal sightseeing"]
    },
    shortDescription: `A serene getaway to Kodaikanal featuring misty mountain walks, boating on the star-shaped lake, and exploring dramatic granite cliffs.`,
    coverImage: 'https://images.unsplash.com/photo-1627063234907-882255afb66d?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Boating charges","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Kodai Lake',
        description: `Check into your hilltop resort. Spend the evening walking around the iconic star-shaped Kodaikanal Lake. You can opt for cycling or a peaceful boat ride as the mist rolls in.`,
        locations: ["Kodaikanal Lake"],
        activities: ["Boating","Cycling"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Pillar Rocks & Coaker\'s Walk',
        description: `A full day of sightseeing begins with Coaker\'s Walk, offering spectacular valley views. Visit the mysterious Guna Caves, the majestic Pillar Rocks, and end with the tranquil Bryant Park.`,
        locations: ["Coaker\\'s Walk","Pillar Rocks","Bryant Park"],
        activities: ["Sightseeing","Nature Walk"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Silver Cascade & Departure',
        description: `On your final day, visit the beautiful Silver Cascade Waterfalls. After some local souvenir shopping for homemade chocolates and eucalyptus oil, proceed to your drop point.`,
        locations: ["Silver Cascade"],
        activities: ["Shopping"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'coonoor': {
    nights: 2,
    seo: {
      title: "Coonoor Tour Packages | Heritage Train & Tea Estates",
      description: "Experience the tranquility of Coonoor. Book our 3-day Coonoor package featuring Nilgiri tea estates, toy train rides, and stunning valley views.",
      keywords: ["Coonoor tour package","Coonoor tea estates","Nilgiri Mountain Railway","Sim's Park","Dolphin's Nose"]
    },
    shortDescription: `Discover the tranquil beauty of Coonoor, surrounded by lush tea estates, rolling hills, and stunning viewpoints perfect for a peaceful retreat.`,
    coverImage: 'https://images.unsplash.com/photo-1605540326372-c515a6b0cfa7?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Sim\'s Park',
        description: `Arrive and check in. Visit Sim\'s Park, a unique botanical garden with rare trees and terraced flower beds. Enjoy a quiet evening walking through local tea trails.`,
        locations: ["Sim\\'s Park"],
        activities: ["Nature Walk"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Dolphin\'s Nose & Lamb\'s Rock',
        description: `Drive up to Dolphin\'s Nose for a spectacular view of the Catherine Falls. Next, visit Lamb\'s Rock for panoramic views of the Coimbatore plains. Enjoy a guided tea tasting session.`,
        locations: ["Dolphin\\'s Nose","Lamb\\'s Rock","Tea Estate"],
        activities: ["Sightseeing","Tea Tasting"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Heritage Train Ride & Departure',
        description: `Experience the legendary Nilgiri Mountain Railway (Toy Train) ride from Coonoor to Ooty (optional), followed by departure to your hometown.`,
        locations: ["Nilgiri Mountain Railway"],
        activities: ["Train Ride"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'kotagiri': {
    nights: 2,
    seo: {
      title: "Kotagiri Tour Packages | Quiet Nature Escape",
      description: "Escape to Kotagiri, the quietest hill station in the Nilgiris. Enjoy endless tea plantations, dramatic waterfalls, and a perfect 3-day itinerary.",
      keywords: ["Kotagiri tour package","Kotagiri sightseeing","Kodanad View Point","Catherine Falls","Nilgiris hidden gems"]
    },
    shortDescription: `Escape to the quiet charm of Kotagiri for endless tea gardens, magnificent waterfalls, and a refreshing lack of tourist crowds.`,
    coverImage: 'https://images.unsplash.com/photo-1596792610747-d5d8521a0211?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Tea Plantations',
        description: `Check into your homestay or resort surrounded by tea gardens. Spend the day unwinding and taking a guided walk through the expansive tea estates.`,
        locations: ["Tea Gardens"],
        activities: ["Guided Walk"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Kodanad View Point',
        description: `Drive to Kodanad View Point, offering one of the most breathtaking panoramic views in the Nilgiris. Visit the cascading Catherine Falls and Elk Falls.`,
        locations: ["Kodanad View Point","Catherine Falls"],
        activities: ["Sightseeing","Photography"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Local Village Tour & Departure',
        description: `Explore a local Badaga village to understand the indigenous culture of the Nilgiris. Later, depart for your onward journey.`,
        locations: ["Badaga Village"],
        activities: ["Cultural Tour"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'yercaud': {
    nights: 2,
    seo: {
      title: "Yercaud Tour Packages | Budget Hill Station Trip",
      description: "Visit Yercaud, the Jewel of the South. Book our budget-friendly 3-day Yercaud tour package featuring Emerald Lake, coffee estates, and scenic viewpoints.",
      keywords: ["Yercaud tour package","Shevaroy Hills","Budget hill station Tamil Nadu","Yercaud lake","Yercaud weekend getaway"]
    },
    shortDescription: `Explore the Jewel of the South with budget-friendly stays, expansive coffee plantations, and scenic viewpoints in the Shevaroy Hills.`,
    coverImage: 'https://images.unsplash.com/photo-1627914801103-6f4e138a0f5d?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Boating charges","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Emerald Lake',
        description: `Check in and head to Yercaud Lake (Emerald Lake) for an evening boat ride. Enjoy a walk through the surrounding Deer Park and Anna Park.`,
        locations: ["Yercaud Lake","Deer Park"],
        activities: ["Boating"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Viewpoints & Coffee Estates',
        description: `Visit the famous viewpoints: Lady\'s Seat, Gent\'s Seat, and Pagoda Point. In the afternoon, take a tour of a local coffee estate to see how coffee and spices are grown.`,
        locations: ["Lady\\'s Seat","Pagoda Point","Coffee Estate"],
        activities: ["Sightseeing","Plantation Tour"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Kiliyur Falls & Departure',
        description: `Trek down to the majestic Kiliyur Falls (seasonal). After enjoying the waterfall, proceed with your departure.`,
        locations: ["Kiliyur Falls"],
        activities: ["Trekking"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'yelagiri': {
    nights: 2,
    seo: {
      title: "Yelagiri Tour Packages | Weekend Getaway & Trekking",
      description: "Plan your weekend getaway to Yelagiri. Our 3-day package offers mild trekking, boating in Punganur Lake, and a surprisingly cool climate.",
      keywords: ["Yelagiri tour package","Yelagiri weekend getaway","Swamimalai trek","Punganur lake","Yelagiri sightseeing"]
    },
    shortDescription: `A perfect weekend getaway featuring mild trekking, beautiful nature parks, and peaceful boating in a cluster of tribal villages.`,
    coverImage: 'https://images.unsplash.com/photo-1634676450505-592fdb0b7d3f?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Adventure activities","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Punganur Lake',
        description: `Check into your resort. Head to Punganur Lake for boating, followed by a relaxing evening walk in the beautifully maintained Nature Park.`,
        locations: ["Punganur Lake","Nature Park"],
        activities: ["Boating"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Swamimalai Trek & Waterfalls',
        description: `Embark on a mild morning trek to Swamimalai Hill, the highest point in Yelagiri, offering great views. Later, visit the Jalagamparai Waterfalls (water levels depend on the season).`,
        locations: ["Swamimalai Hill","Jalagamparai Waterfalls"],
        activities: ["Trekking"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Fundera Park & Departure',
        description: `Visit Fundera Park to see exotic birds and animals. Enjoy a peaceful morning before heading back home.`,
        locations: ["Fundera Park"],
        activities: ["Bird Watching"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'valparai': {
    nights: 2,
    seo: {
      title: "Valparai Wildlife Tour Packages | Anaimalai Tiger Reserve",
      description: "Explore Valparai, a pristine hill station in the Anaimalai Tiger Reserve. Book our 3-day wildlife and tea estate tour package.",
      keywords: ["Valparai tour package","Anaimalai Tiger Reserve","Valparai sightseeing","Sholayar Dam","Valparai wildlife"]
    },
    shortDescription: `Journey through 40 hairpin bends to reach this pristine wildlife haven surrounded by tea estates in the Anaimalai Tiger Reserve.`,
    coverImage: 'https://images.unsplash.com/photo-1627914801103-6f4e138a0f5d?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Hairpin Bends & Aliyar Dam',
        description: `Enjoy the thrilling drive up 40 hairpin bends. Stop at Aliyar Dam and Monkey Falls before checking into your tea estate bungalow in Valparai.`,
        locations: ["Aliyar Dam","Monkey Falls"],
        activities: ["Scenic Drive"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Sholayar Dam & Wildlife',
        description: `Visit the massive Sholayar Dam, the second deepest in Asia. Proceed to Nallamudi Viewpoint. Keep an eye out for Lion-Tailed Macaques and Great Hornbills throughout the day.`,
        locations: ["Sholayar Dam","Nallamudi Viewpoint"],
        activities: ["Wildlife Spotting"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Tea Factory & Departure',
        description: `Take a guided tour of a working tea factory. Purchase fresh tea leaves before driving back down to the plains.`,
        locations: ["Tea Factory"],
        activities: ["Factory Tour"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'kolli-hills': {
    nights: 2,
    seo: {
      title: "Kolli Hills Tour Packages | 70 Hairpin Bends Adventure",
      description: "Navigate 70 hairpin bends to Kolli Hills. Discover Agaya Gangai waterfalls and ancient temples in our 3-day offbeat tour package.",
      keywords: ["Kolli Hills tour package","70 hairpin bends","Agaya Gangai waterfalls","Offbeat destinations Tamil Nadu","Kolli Malai"]
    },
    shortDescription: `Navigate 70 thrilling hairpin bends to discover untouched waterfalls, ancient temples, and the raw natural beauty of Kolli Hills.`,
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Kollimalai_milagu_Thottam.JPG/800px-Kollimalai_milagu_Thottam.JPG',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: '70 Hairpin Bends & Arrival',
        description: `Drive up the exhilarating 70 hairpin bends to reach Kolli Hills. Check into your serene resort and spend a relaxing evening enjoying the crisp mountain air.`,
        locations: ["Kolli Hills"],
        activities: ["Scenic Drive"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Agaya Gangai & Seekuparai',
        description: `Trek down 1000 steep steps to the magnificent Agaya Gangai Waterfalls. Later, visit the ancient Arapaleeswarar Temple and enjoy the sunset from Seekuparai Viewpoint.`,
        locations: ["Agaya Gangai Waterfalls","Seekuparai Viewpoint"],
        activities: ["Trekking"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Botanical Garden & Departure',
        description: `Visit the Kolli Hills Botanical Garden and the local market to buy fresh spices and honey. Depart for your onward journey.`,
        locations: ["Botanical Garden"],
        activities: ["Shopping"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'meghamalai': {
    nights: 2,
    seo: {
      title: "Meghamalai Tour Packages | High Wavy Mountains Trip",
      description: "Book a trip to Meghamalai (High Wavy Mountains). Enjoy misty peaks, quiet tea estates, and incredible serenity far away from commercial tourism.",
      keywords: ["Meghamalai tour package","High Wavy Mountains","Megamalai viewpoints","Suruli falls","Hidden hill stations Tamil Nadu"]
    },
    shortDescription: `A true hidden gem offering misty peaks, quiet tea estates, and incredible serenity far away from commercial tourism.`,
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in the Clouds',
        description: `Take the rugged, adventurous route to Meghamalai. Check into your hilltop estate and spend the evening watching the mist roll over the tea gardens.`,
        locations: ["Tea Estates"],
        activities: ["Relaxation"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'High Wavy Dam & Viewpoints',
        description: `Explore the stunning High Wavy Dam and Megamalai Viewpoint. The entire day is dedicated to nature walks and spotting wildlife like elephants and bison in the distance.`,
        locations: ["High Wavy Dam","Megamalai Viewpoint"],
        activities: ["Nature Walk"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Suruli Falls & Departure',
        description: `On your way down, visit the famous Suruli Waterfalls. Enjoy a refreshing dip before heading back to the city.`,
        locations: ["Suruli Falls"],
        activities: ["Sightseeing"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'sirumalai': {
    nights: 2,
    seo: {
      title: "Sirumalai Forest Escape | 3 Days Tour Package",
      description: "Discover the dense forests of Sirumalai. A quiet, budget-friendly destination with 18 hairpin bends and unique flora and fauna.",
      keywords: ["Sirumalai tour package","Sirumalai hills","Dindigul hill station","Sirumalai lake","Budget forest getaway"]
    },
    shortDescription: `A dense, forested hill station known for its extreme tranquility, unique flora, and 18 beautiful hairpin bends.`,
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Sirumalai.jpg/800px-Sirumalai.jpg',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Forest Walk',
        description: `Drive up the 18 hairpin bends to reach Sirumalai. Check into a rustic forest resort. Spend the evening taking a guided walk through the surrounding woods.`,
        locations: ["Sirumalai"],
        activities: ["Forest Walk"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Observation Tower & Lake',
        description: `Visit the Sirumalai Lake for a peaceful morning. Later, trek to the Observation Tower which offers a panoramic view of the Dindigul city and surrounding plains.`,
        locations: ["Sirumalai Lake","Observation Tower"],
        activities: ["Trekking"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Sanjeevani Hills & Departure',
        description: `Visit the mystical Sanjeevani Hills, believed to be a fragment of the mountain carried by Lord Hanuman. Buy the famous Sirumalai bananas before departing.`,
        locations: ["Sanjeevani Hills"],
        activities: ["Sightseeing"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'anaimalai-hills-top-slip': {
    nights: 2,
    seo: {
      title: "Anaimalai Hills & Top Slip Wildlife Safari Tour",
      description: "Experience the Elephant Mountains. Book our 3-day Top Slip package for thrilling jungle safaris in the Indira Gandhi Wildlife Sanctuary.",
      keywords: ["Top Slip tour package","Anaimalai hills","Indira Gandhi Wildlife Sanctuary","Top Slip safari","Parambikulam"]
    },
    shortDescription: `A paradise for wildlife enthusiasts, offering thrilling safaris and dense forest experiences in the Elephant Mountains.`,
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Anaimalai_Hills.jpg/800px-Anaimalai_Hills.jpg',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Safari & Forest Entry tickets","Elephant Camp fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival at Top Slip',
        description: `Arrive at Top Slip and check into the forest guest house. Enjoy an evening walk around the periphery of the jungle, soaking in the wild atmosphere.`,
        locations: ["Top Slip"],
        activities: ["Nature Walk"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Jungle Safari & Parambikulam',
        description: `Take an early morning elephant safari or jeep safari deep into the sanctuary. Spot elephants, deer, and exotic birds. Later, visit the adjacent Parambikulam Tiger Reserve.`,
        locations: ["Indira Gandhi Sanctuary","Parambikulam"],
        activities: ["Jungle Safari"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Medicinal Garden & Departure',
        description: `Visit the medicinal plant interpretation center. Enjoy the serene forest one last time before departing for your onward journey.`,
        locations: ["Medicinal Garden"],
        activities: ["Sightseeing"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'manjolai-hills': {
    nights: 2,
    seo: {
      title: "Manjolai Hills Tour Packages | Unexplored Tea Estates",
      description: "Visit Manjolai, deep inside the Kalakkad Mundanthurai Tiger Reserve. Experience unparalleled serenity and pristine waterfalls in our 3-day tour.",
      keywords: ["Manjolai tour package","Kalakkad Mundanthurai Tiger Reserve","Manjolai tea estates","Kuthiraivetti viewpoint","Manimuthar falls"]
    },
    shortDescription: `Experience unparalleled serenity in this restricted, fiercely protected hill station located deep inside a Tiger Reserve.`,
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Manimuthar_Falls.jpg/800px-Manimuthar_Falls.jpg',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Forest entry fees & permits","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Forest Checkpoint & Arrival',
        description: `Cross the forest checkpoints and enter the pristine Manjolai Hills. Check into a tea estate bungalow. Enjoy the absolute silence of the deep forest.`,
        locations: ["Manjolai Estates"],
        activities: ["Relaxation"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Kuthiraivetti Viewpoint & Waterfalls',
        description: `Drive to the Kuthiraivetti Viewpoint for a breathtaking view of the dense tiger reserve. Visit the beautiful Manimuthar and Kakkachi waterfalls for a refreshing dip.`,
        locations: ["Kuthiraivetti","Manimuthar Falls"],
        activities: ["Sightseeing"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Tea Estate Walk & Departure',
        description: `Take a morning walk through the upper Manjolai tea estates before starting your descent back to the plains.`,
        locations: ["Upper Manjolai"],
        activities: ["Nature Walk"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'jawadhu-hills': {
    nights: 2,
    seo: {
      title: "Jawadhu Hills Tour Packages | Tribal Heritage & Waterfalls",
      description: "Explore the rugged Jawadhu Hills. A 3-day offbeat package featuring tribal heritage, aromatic sandalwood forests, and stunning waterfalls.",
      keywords: ["Jawadhu Hills tour package","Eastern Ghats","Beema falls","Kavalur Observatory","Jawadhu sightseeing"]
    },
    shortDescription: `Explore tribal heritage, aromatic sandalwood forests, and rugged off-beat trails in the beautiful Eastern Ghats.`,
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Beema_Falls_in_Javadi_Hills.jpg/800px-Beema_Falls_in_Javadi_Hills.jpg',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Observatory entry (if applicable)","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Komutteri Lake',
        description: `Arrive at Jawadhu Hills and check into a local guest house. Visit Komutteri Lake for a peaceful evening and a boat ride.`,
        locations: ["Komutteri Lake"],
        activities: ["Boating"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Beema Falls & Observatory',
        description: `Trek to the majestic Beema Falls, known for having water most of the year. In the evening, visit the Kavalur Astronomical Observatory (Vainu Bappu Observatory) for stargazing.`,
        locations: ["Beema Falls","Kavalur Observatory"],
        activities: ["Trekking","Stargazing"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Amirthi Forest & Departure',
        description: `Drive through the Amirthi Zoological Park on your way down, spotting local flora and fauna before departing.`,
        locations: ["Amirthi Forest"],
        activities: ["Wildlife Spotting"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'kalvarayan-hills': {
    nights: 2,
    seo: {
      title: "Kalvarayan Hills Tour Packages | Eastern Ghats Eco-Tourism",
      description: "Discover the Kalvarayan Hills in the Eastern Ghats. Our 3-day tour features seasonal waterfalls, tribal villages, and the expansive Gomukhi Dam.",
      keywords: ["Kalvarayan Hills tour package","Gomukhi Dam","Megam falls","Eastern Ghats tourism","Kalvarayan sightseeing"]
    },
    shortDescription: `Discover an undisturbed natural environment dotted with seasonal waterfalls, tribal villages, and expansive dams.`,
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Gomukhi_Dam.jpg/800px-Gomukhi_Dam.jpg',
    inclusions: ["Hotel Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Gomukhi Dam',
        description: `Check into your accommodation. Head straight to the Gomukhi Dam, a massive reservoir located at the foothills, offering a perfect sunset view.`,
        locations: ["Gomukhi Dam"],
        activities: ["Sightseeing"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Megam & Periyar Falls',
        description: `Embark on a day of waterfall hopping. Visit the majestic Megam Falls and Periyar Falls. The lush green surroundings make it perfect for a picnic.`,
        locations: ["Megam Falls","Periyar Falls"],
        activities: ["Waterfall Hopping"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Tribal Village & Departure',
        description: `Interact with the local Malayali tribes (hill people) to learn about their unique culture and lifestyle before heading back.`,
        locations: ["Tribal Village"],
        activities: ["Cultural Tour"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'pachamalai-hills': {
    nights: 2,
    seo: {
      title: "Pachamalai Hills Tour Packages | Eco-Tourism & Trekking",
      description: "Book an eco-tourism adventure to Pachamalai (Green Mountains). Untouched trails, dense canopies, and indigenous tribal culture await you.",
      keywords: ["Pachamalai Hills tour package","Pachamalai trekking","Eco-tourism Tamil Nadu","Koraiyar falls","Pachamalai eco camp"]
    },
    shortDescription: `An eco-tourism hotspot perfect for trekkers, offering untouched trails, dense canopies, and indigenous tribal culture.`,
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pachamalai_hills.jpg/800px-Pachamalai_hills.jpg',
    inclusions: ["Eco-Resort Accommodation","Daily Breakfast","Private Cab for sightseeing","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Guide fees","Entry fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Eco-Camp Arrival',
        description: `Arrive and check into the government-run Eco-Tourism camp. Take a guided walk through the herbal plant trails to understand the local flora.`,
        locations: ["Eco-Camp"],
        activities: ["Nature Walk"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Koraiyar & Mangalam Falls Trek',
        description: `Set out on an adventurous trek through dense forests to reach Koraiyar Falls and Mangalam Aruvi. Spend the day immersed in nature.`,
        locations: ["Koraiyar Falls","Mangalam Aruvi"],
        activities: ["Trekking"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Mayil Uthu & Departure',
        description: `Visit the Mayil Uthu Falls (Peacock Spring). Purchase organic honey and local produce before departing.`,
        locations: ["Mayil Uthu Falls"],
        activities: ["Shopping"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },
  'kurangani': {
    nights: 2,
    seo: {
      title: "Kurangani Hills Tour Packages | Kolukkumalai Safari & Trekking",
      description: "Experience Kurangani, a rugged paradise for adventurers. Book our 3-day tour featuring Kolukkumalai Jeep safaris and challenging treks.",
      keywords: ["Kurangani tour package","Kolukkumalai jeep safari","World's highest tea estate","Kurangani trekking","Meesapulimala view"]
    },
    shortDescription: `A rugged delight for hardcore adventurers, famous for challenging treks and the highest tea estate in the world.`,
    coverImage: 'https://images.unsplash.com/photo-1582506649855-6b582cd007a8?q=80&w=800&auto=format',
    inclusions: ["Tent/Lodge Accommodation","Daily Breakfast","Jeep Safari/Cab","Driver allowance","Toll & Parking."],
    exclusions: ["Lunch & Dinner","Trekking guide fees","Personal expenses."],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Village Walk',
        description: `Arrive at Kurangani village and check into your basecamp/homestay. Take a leisurely walk through the coffee and cardamom estates.`,
        locations: ["Kurangani Village"],
        activities: ["Estate Walk"],
        meals: ["Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 2,
        title: 'Kolukkumalai Jeep Safari',
        description: `Take a thrilling off-road Jeep safari to Kolukkumalai, the world\'s highest tea estate. Witness a breathtaking sunrise above the clouds and tour the historic tea factory.`,
        locations: ["Kolukkumalai"],
        activities: ["Jeep Safari","Sunrise View"],
        meals: ["Breakfast","Dinner"],
        travelInfo: 'Private Cab'
      },
      {
        day: 3,
        title: 'Meesapulimala View Trek & Departure',
        description: `Embark on a short morning trek towards the foothills of Meesapulimala for spectacular views before descending back to Bodinayakanur for your departure.`,
        locations: ["Meesapulimala Foothills"],
        activities: ["Trekking"],
        meals: ["Breakfast"],
        travelInfo: 'Private Cab'
      }
    ],
  },


  'munnar-escape': {
    nights: 2,
    shortDescription: 'Lose yourself in rolling tea gardens, cool mountain air, and the timeless beauty of Kerala\'s crown jewel.',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80&auto=format',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80&auto=format',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80&auto=format',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80&auto=format',
    ],
    hotelIds: ['valley-view-homestay'],
    vehicleIds: ['innova-crysta', 'swift-dzire'],
    inclusions: [
      '2 Nights accommodation in a boutique valley-view resort',
      'Daily breakfast and authentic chef-curated mountain dinner',
      'Dedicated private AC sedan with experienced mountain chauffeur',
      'Guided walk through heritage Lockhart tea plantation',
      'Eravikulam National Park safari entry coordination',
      'All toll gates, parking charges, and driver allowances',
    ],
    exclusions: [
      'Airfare or train tickets to / from Kochi',
      'Lunches and personal beverage expenses',
      'Speed-boating tickets at Mattupetty and optional zip-lining',
      'Anything not explicitly mentioned under inclusions',
    ],
    importantInformation: [
      'Carry warm fleece jackets as evening and early morning temperatures drop significantly.',
      'Original photo identification is mandatory for all travelers at hotel check-in and park safari gates.',
      'Complimentary pickup is provided from Cochin International Airport (COK) or Aluva Railway Station.',
      'Kolukkumalai jeep safaris are weather-dependent and organized upon early morning request.',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Journey to the Mist-Covered Hills',
        description: 'Begin your scenic ascent from Kochi up the Western Ghats highway. Stop to photograph the roaring Cheeyappara and Valara waterfalls amidst verdant spice plantations. Arrive in Munnar, check into your panoramic hillside resort, and enjoy an evening orientation walk around Munnar town market.',
        locations: ['Kochi', 'Cheeyappara Waterfalls', 'Munnar Valley'],
        activities: ['Scenic Western Ghats mountain drive', 'Cheeyappara waterfall photography stop', 'Resort check-in with cardamom welcome tea', 'Evening spice and artisan chocolate market walk'],
        meals: ['Dinner'],
        accommodation: 'Valley View Hillside Resort',
        travelInfo: 'Private AC transfer (~130 km / 4 hours from Kochi)',
        images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80&auto=format'],
      },
      {
        day: 2,
        title: 'Eravikulam Wildlife Safari & Mattupetty Waters',
        description: 'Set out on an early morning safari into Eravikulam National Park, home to the endangered Nilgiri Tahr against the majestic backdrop of Anamudi peak. Afterwards, visit Mattupetty Dam, enjoy boating on the reservoir, shout into Echo Point, and take a guided walk through Lockhart Tea Factory.',
        locations: ['Eravikulam National Park', 'Mattupetty Dam', 'Echo Point', 'Tea Factory'],
        activities: ['Nilgiri Tahr wildlife spotting safari', 'Mattupetty Dam lakeside speed-boating', 'Acoustic echoes at Echo Point', 'Tea processing tour & leaf grading masterclass'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Valley View Hillside Resort',
        travelInfo: 'Full-day private vehicle sightseeing (~50 km local circuit)',
        images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80&auto=format'],
      },
      {
        day: 3,
        title: 'Top Station Cloud Panorama & Return Journey',
        description: 'Wake up early to witness a breathtaking sunrise above the clouds at Top Station overlooking the neighboring Tamil Nadu plains. Explore Pothamedu Viewpoint for final panoramic photographs before descending back to Kochi with lasting highland memories.',
        locations: ['Top Station', 'Pothamedu Viewpoint', 'Kochi Airport'],
        activities: ['Sunrise above the clouds at Top Station', 'Panoramic valley viewpoint photoshoot', 'Fresh spices and high-grown tea shopping', 'Return drop-off transfer to Kochi'],
        meals: ['Breakfast'],
        travelInfo: 'Return descent transfer to Kochi (~130 km / 4 hours)',
      },
    ],
  },
  'coorg-trails': {
    nights: 3,
    shortDescription: 'Step into the Scotland of India — emerald coffee estates, ancient abbeys, and cascading waterfalls await.',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80&auto=format',
    gallery: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80&auto=format',
      'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&q=80&auto=format',
    ],
    hotelIds: ['coorg-bungalow'],
    vehicleIds: ['innova-crysta', 'fortuner'],
    inclusions: [
      '3 Nights accommodation in a heritage coffee plantation estate',
      'Daily estate breakfast and traditional Kodava dinner spread',
      'Private chauffeur-driven cab for all sightseeing & transfers',
      'Guided coffee and black pepper bean-to-cup plantation tour',
      'Dubare Elephant Camp interaction ticket assistance',
      'Toll charges, state permits, parking fees, and driver charges',
    ],
    exclusions: [
      'Travel tickets to/from Bangalore or Mangalore',
      'Lunches, personal snacks, and beverages',
      'Elephant bathing or feeding tokens at Dubare',
      'Entry tickets at private adventure parks or monuments',
    ],
    importantInformation: [
      'Dubare Elephant Camp activities are conducted between 9:00 AM and 11:00 AM; morning departure is mandatory.',
      'Modest attire covering knees and shoulders is required at Namdroling Golden Temple.',
      'Best connected via Mangalore Airport (IXE) or Bangalore Kempegowda Airport (BLR).',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Kodagu & Abbey Falls Cascade',
        description: 'Arrive in the picturesque hills of Coorg. Check into your heritage planter\'s bungalow nestled in a working coffee estate. Later in the afternoon, take a nature walk down to Abbey Falls, roaring through lush hanging vines and nutmeg trees.',
        locations: ['Madikeri', 'Abbey Falls'],
        activities: ['Scenic Western Ghats foothills drive', 'Plantation check-in & freshly brewed estate coffee', 'Nature trail to Abbey Falls', 'Evening outdoor campfire with Kodava culinary delicacies'],
        meals: ['Dinner'],
        accommodation: 'The Coffee Bungalow Heritage Estate',
        travelInfo: 'Private transfer (~240 km from Bangalore or ~140 km from Mangalore)',
        images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80&auto=format'],
      },
      {
        day: 2,
        title: 'Dubare Elephant Sanctuary & Tibetan Heritage',
        description: 'Cross the sacred River Cauvery on a boat to reach the Dubare Elephant Camp. Witness the gentle giants being bathed and fed. Later, head to Bylakuppe to discover the Namdroling Monastery (Golden Temple), filled with Tibetan murals and serene chanting monks.',
        locations: ['Dubare Elephant Camp', 'Cauvery Nisargadhama', 'Bylakuppe Golden Temple'],
        activities: ['Dubare Elephant Camp visit & river crossing', 'Bamboo canopy walk at Nisargadhama island', 'Namdroling Tibetan monastery exploration', 'Tibetan flea market shopping & momos tasting'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'The Coffee Bungalow Heritage Estate',
        travelInfo: 'Private vehicle day tour (~80 km round-trip)',
        images: ['https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&q=80&auto=format'],
      },
      {
        day: 3,
        title: 'Plantation Discovery, Madikeri Fort & Sunset Vista',
        description: 'Spend your morning learning how Arabica and Robusta beans are cultivated, harvested, and roasted on an expert-led plantation walk. Visit the historic 17th-century Madikeri Fort and conclude your evening watching a dramatic sunset from the historic Raja\'s Seat.',
        locations: ['Estate Plantation', 'Madikeri Fort', 'Raja\'s Seat'],
        activities: ['Interactive coffee & spice trail with estate botanist', 'Historic Madikeri Fort & museum walk', 'Sunset views with fountain show at Raja\'s Seat'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'The Coffee Bungalow Heritage Estate',
        travelInfo: 'Local Madikeri circuit transfers',
      },
      {
        day: 4,
        title: 'Talacauvery Sacred Heights & Farewell',
        description: 'Drive up to Talacauvery at the summit of Brahmagiri Hills, the holy origin point of the Cauvery River. Take in sweeping views before commencing your return transfer.',
        locations: ['Bhagamandala', 'Talacauvery', 'Return Journey'],
        activities: ['Sacred shrine visit at Brahmagiri heights', 'Pure Coorg blossom honey & homemade wine tasting', 'Return drop-off transfer to airport or railway station'],
        meals: ['Breakfast'],
        travelInfo: 'Return cab transfer to Bangalore / Mangalore',
      },
    ],
  },
  'ooty-highlands': {
    nights: 2,
    shortDescription: 'Breathe in the crisp air of the Nilgiris as you journey through eucalyptus groves and vintage hill railways.',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80&auto=format',
    hotelIds: ['nilgiri-forest-resort'],
    vehicleIds: ['innova-crysta', 'tempo-traveller'],
    inclusions: [
      '2 Nights stay in a charming Nilgiri hill resort',
      'Daily breakfast and dinner at the resort restaurant',
      'Dedicated private vehicle for all Nilgiri mountain sightseeing',
      'Guided walk through Government Botanical Gardens',
      'Doddabetta Peak & Tea Factory visit assistance',
      'Driver allowances, parking, and toll fees',
    ],
    exclusions: [
      'Airfare / Train tickets to Coimbatore',
      'Lunches and personal shopping',
      'Optional horse riding, boating, or mountain train tickets',
    ],
    importantInformation: [
      'Nearest airport is Coimbatore International Airport (CJB) ~85 km.',
      'Single-use plastic bottles and plastic carrier bags are strictly prohibited in the Nilgiris.',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Climb the 36 Hairpin Bends & Botanical Exploration',
        description: 'Ascend through the scenic Nilgiri mountain passes into Ooty. Check in and visit the historic 55-acre Botanical Gardens and Ooty Lake.',
        locations: ['Coimbatore', 'Kallar Ghats', 'Ooty Botanical Gardens'],
        activities: ['Scenic ghat road mountain drive', 'Botanical garden exotic flora walk', 'Boating on Ooty Lake', 'Colonial heritage walk'],
        meals: ['Dinner'],
        accommodation: 'Nilgiri Forest Escape',
        travelInfo: 'Private transfer from Coimbatore (~85 km / 3 hours)',
        images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80&auto=format'],
      },
      {
        day: 2,
        title: 'Heritage Toy Train & Doddabetta Cloud Summit',
        description: 'Ride the iconic UNESCO Nilgiri Mountain Railway toy train through pine tunnels to Coonoor. Visit Sim\'s Park, Dolphin\'s Nose, and Doddabetta Peak.',
        locations: ['Coonoor', 'Sim\'s Park', 'Doddabetta Peak'],
        activities: ['Heritage toy train ride', 'Dolphin\'s Nose panoramic gorge view', 'Doddabetta summit telescope view', 'Artisan tea factory & chocolate tasting'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Nilgiri Forest Escape',
        travelInfo: 'Private sightseeing vehicle (~45 km circuit)',
      },
      {
        day: 3,
        title: 'Pykara Pine Forests & Coimbatore Descent',
        description: 'Walk among towering pines at Shooting Point and visit scenic Pykara Lake & Falls before descending back to Coimbatore.',
        locations: ['Pykara Lake', 'Pine Forest', 'Coimbatore'],
        activities: ['Pine forest walk', 'Speed-boating at Pykara', 'Nilgiri eucalyptus essential oil shopping', 'Return drop-off transfer'],
        meals: ['Breakfast'],
        travelInfo: 'Descent transfer to Coimbatore (~85 km)',
      },
    ],
  },
  'shimla-serenity': {
    nights: 4,
    shortDescription: 'Colonial charm meets Himalayan grandeur — a romantic journey through snow-dusted forests and heritage boulevards.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format',
    hotelIds: ['himalayan-boutique'],
    vehicleIds: ['innova-crysta', 'fortuner'],
    inclusions: [
      '4 Nights stay in a boutique Himalayan mountain resort',
      'Daily breakfast and four-course evening dinners',
      'Private luxury vehicle with experienced mountain driver',
      'Heritage Viceregal Lodge and Mall Road walking tour',
      'Excursion to Kufri slopes and nature park',
    ],
    exclusions: ['Airfare to Chandigarh / Delhi', 'Lunches and personal expenses', 'Ski equipment / pony rentals at Kufri'],
    importantInformation: ['Winter trips (Dec-Feb) require heavy woollens and thermal wear.', 'Chandigarh (IXC) is the closest major commercial airport ~120 km.'],
    itinerary: [
      {
        day: 1,
        title: 'Ascent to the Summer Capital of the Raj',
        description: 'Scenic climb from Chandigarh into Himachal Pradesh. Check in and take an evening walk on the iconic Ridge.',
        locations: ['Chandigarh', 'Shimla', 'The Ridge'],
        activities: ['Scenic Himalayan expressway drive', 'Resort check-in with apple cider welcome drink', 'Evening stroll along Mall Road and The Ridge'],
        meals: ['Dinner'],
        accommodation: 'Himalayan Nest Boutique',
      },
      {
        day: 2,
        title: 'Colonial Heritage & Jakhu Hanuman Temple',
        description: 'Explore the stately Viceregal Lodge and take the ropeway up to Jakhu Temple atop Shimla\'s highest point.',
        locations: ['Viceregal Lodge', 'Jakhu Hill', 'Christ Church'],
        activities: ['Viceregal Lodge architectural tour', 'Jakhu ropeway ride and giant Hanuman statue visit', 'Christ Church stained glass viewing'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Himalayan Nest Boutique',
      },
      {
        day: 3,
        title: 'Kufri Highland Slopes & Himalayan Nature Park',
        description: 'Excursion to Kufri for panoramic snow-peak vistas, cedar forest trails, and Himalayan wildlife.',
        locations: ['Kufri', 'Fagu Valley', 'Chini Bungalow'],
        activities: ['Kufri viewpoint adventure', 'Himalayan Monal & leopard spotting at Nature Park', 'Fagu apple orchard walk'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Himalayan Nest Boutique',
      },
      {
        day: 4,
        title: 'Mashobra Tranquility & Craignano Forest Trail',
        description: 'Discover peaceful Mashobra with its dense deodar groves, Craignano nature park, and pristine quietude.',
        locations: ['Mashobra', 'Craignano', 'Naldehra'],
        activities: ['Craignano apple blossom walk', 'Golf course meadow picnic at Naldehra', 'Bonfire evening with live acoustic music'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Himalayan Nest Boutique',
      },
      {
        day: 5,
        title: 'Scenic Himalayan Farewell',
        description: 'Relish a final mountain breakfast with sunrise views before your return transfer to Chandigarh.',
        locations: ['Shimla', 'Chandigarh Airport'],
        activities: ['Himachali handloom and honey shopping', 'Scenic descent drive to Chandigarh'],
        meals: ['Breakfast'],
      },
    ],
  },
  'darjeeling-dawn': {
    nights: 3,
    shortDescription: 'Watch Kanchenjunga glow gold at dawn, sip the world\'s finest tea, and ride the legendary toy train.',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format',
    hotelIds: ['darjeeling-manor'],
    vehicleIds: ['innova-crysta'],
    inclusions: [
      '3 Nights stay in an iconic 5-star heritage manor',
      'Daily gourmet breakfast and chef-crafted dinner',
      'Private vehicle for all sunrise and sightseeing excursions',
      'Tiger Hill sunrise excursion with tea on arrival',
      'Himalayan Mountaineering Institute & Zoo entry pass',
    ],
    exclusions: ['Airfare to Bagdogra (IXB)', 'Lunches and personal gratuities', 'Joy ride toy train tickets'],
    importantInformation: ['Tiger Hill sunrise requires early 4:00 AM departure.', 'Bagdogra (IXB) is ~70 km / 3.5 hours mountain drive.'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in the Queen of the Hills',
        description: 'Scenic climb through tea gardens into Darjeeling. Check into the heritage manor with Kanchenjunga views.',
        locations: ['Bagdogra', 'Kurseong', 'Darjeeling'],
        activities: ['Rohini zigzag mountain climb', 'Heritage manor welcome with Muscatel tea', 'Sunset viewing over Kanchenjunga from private balcony'],
        meals: ['Dinner'],
        accommodation: 'The Darjeeling Manor',
      },
      {
        day: 2,
        title: 'Tiger Hill Golden Dawn & Seven Points Tour',
        description: 'Experience the world-renowned sunrise over Mt. Kanchenjunga. Visit Batasia Loop, Ghoom Monastery, and HMI.',
        locations: ['Tiger Hill', 'Ghoom Monastery', 'Batasia Loop', 'HMI'],
        activities: ['Golden sunrise spectacle over Kanchenjunga', 'Batasia Loop war memorial and toy train spiral', 'Himalayan Mountaineering Institute visit & museum', 'Red Panda spotting at Padmaja Naidu Zoo'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'The Darjeeling Manor',
      },
      {
        day: 3,
        title: 'Happy Valley Tea Estate & Tibetan Self-Help Center',
        description: 'Immerse in the artisan craft of Champagne of Teas at Happy Valley and explore Tibetan handicraft weaving.',
        locations: ['Happy Valley Estate', 'Tibetan Refugee Center', 'Mall Road'],
        activities: ['First flush tea picking & tasting session', 'Handmade Tibetan carpet weaving observation', 'Chowrasta Mall evening stroll with bakeries'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'The Darjeeling Manor',
      },
      {
        day: 4,
        title: 'Farewell Descent to Bagdogra',
        description: 'Final breakfast overlooking the Eastern Himalayas before descending to Bagdogra Airport.',
        locations: ['Darjeeling', 'Mirik Lake', 'Bagdogra'],
        activities: ['Mirik Lake scenic photo stop', 'Finest Darjeeling tea shopping', 'Return airport transfer'],
        meals: ['Breakfast'],
      },
    ],
  },
  'manali-adventure': {
    nights: 5,
    shortDescription: 'From river rafting to snow treks — Manali delivers the ultimate mountain adventure for thrill seekers.',
    coverImage: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80&auto=format',
    hotelIds: ['manali-summit-lodge'],
    vehicleIds: ['fortuner', 'innova-crysta'],
    inclusions: [
      '5 Nights accommodation in a riverside alpine retreat',
      'Daily power-packed breakfast and mountain dinner',
      'Private 4x4 / SUV vehicle for high altitude passes',
      'Solang Valley adventure & Atal Tunnel excursion',
      'Old Manali cafe & heritage temples walk',
    ],
    exclusions: ['Airfare / Volvo tickets', 'Lunches and personal gear rentals', 'Paragliding and adventure sports fees'],
    importantInformation: ['Rohtang Pass permits are subject to NGT guidelines and Tuesday closure.', 'Warm thermals and hiking boots recommended.'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Beas Valley',
        description: 'Arrive in Manali along the roaring Beas River. Check into your pine-surrounded lodge.',
        locations: ['Kullu Valley', 'Manali', 'Beas River'],
        activities: ['Scenic river valley drive', 'Lodge check-in by the river', 'Evening stroll in Old Manali quaint lanes'],
        meals: ['Dinner'],
        accommodation: 'Summit Ridge Lodge',
      },
      {
        day: 2,
        title: 'Solang Valley Thrills & Atal Tunnel to Sissu',
        description: 'Experience Solang Valley and cross the engineering marvel of Atal Tunnel into Lahaul\'s snowy landscape.',
        locations: ['Solang Valley', 'Atal Tunnel', 'Sissu Waterfall'],
        activities: ['Solang adventure viewpoints', 'Atal Tunnel mountain crossing', 'Sissu waterfall & Lahaul valley panorama'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Summit Ridge Lodge',
      },
      {
        day: 3,
        title: 'Hadimba Cedar Shrine & Vashisht Hot Springs',
        description: 'Visit the 500-year-old wooden Hadimba Temple in Dhungri forest and take a dip in natural sulphur springs at Vashisht.',
        locations: ['Hadimba Temple', 'Vashisht Village', 'Jogini Falls'],
        activities: ['Ancient cedar forest meditation', 'Natural hot sulphur spring dip', 'Trek to scenic Jogini Waterfalls'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Summit Ridge Lodge',
      },
      {
        day: 4,
        title: 'Rohtang Snow Point Excursion',
        description: 'Ascend to 13,058 ft Rohtang Pass for breathtaking 360-degree snow-clad Himalayan views.',
        locations: ['Marhi', 'Rohtang Pass'],
        activities: ['High altitude pass ascent', 'Snow point photography and glacier viewpoints', 'Scenic mountain roadside chai stop'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Summit Ridge Lodge',
      },
      {
        day: 5,
        title: 'Naggar Castle & River Rafting Day',
        description: 'Explore the medieval wood-and-stone Naggar Castle and Roerich art gallery, followed by optional white-water rafting in Kullu.',
        locations: ['Naggar Castle', 'Nicholas Roerich Gallery', 'Kullu Rafting Point'],
        activities: ['Naggar heritage castle exploration', 'Russian Himalayan art viewing', 'White-water river rafting thrill on River Beas'],
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Summit Ridge Lodge',
      },
      {
        day: 6,
        title: 'Farewell Descent from the Valley of Gods',
        description: 'Enjoy a peaceful morning breakfast before commencing your journey home.',
        locations: ['Manali', 'Chandigarh / Bhuntar'],
        activities: ['Himalayan woollen shawl & apple jam shopping', 'Return departure transfer'],
        meals: ['Breakfast'],
      },
    ],
  },
}

export const seedPackages: Package[] = rawPackages.map(p => {
  const extra = packageDetails[p.id] || {}
  return {
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
    ...extra,
  }
})

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
  rooms: (s as any).rooms || [],
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
  instagram: 'https://instagram.com/hillstourism',
  facebook: 'https://facebook.com/hillstourism',
}
