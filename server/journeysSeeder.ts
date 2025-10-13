import { storage } from './storage';
import type { InsertJourney } from '@shared/schema';

export const sampleJourneys: InsertJourney[] = [
  {
    title: "Classic Japan Circuit",
    description: "Discover the perfect blend of ancient traditions and modern innovation across Japan's most iconic cities",
    destinations: [
      {
        name: "Tokyo",
        country: "Japan",
        nights: 4,
        transport: { type: "flight", cost: 450, duration: "Start point" }
      },
      {
        name: "Kyoto",
        country: "Japan",
        nights: 3,
        transport: { type: "bullet_train", cost: 140, duration: "2h 15m" }
      },
      {
        name: "Osaka",
        country: "Japan",
        nights: 2,
        transport: { type: "train", cost: 15, duration: "30m" }
      }
    ],
    totalNights: 9,
    priceMin: "1800",
    priceMax: "3200",
    season: ["spring", "fall", "year-round"],
    tags: ["culture", "food", "nightlife", "nature"],
    audienceTags: ["couple", "solo", "friends", "12+"],
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    images: [
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9"
    ],
    dailyItinerary: {
      "0": [
        { day: 1, activities: ["Senso-ji Temple", "Shibuya Crossing", "Tokyo Tower evening view"], duration: "8 hours", estimatedCost: 60 },
        { day: 2, activities: ["Tsukiji Outer Market", "Imperial Palace Gardens", "Harajuku & Omotesando"], duration: "8 hours", estimatedCost: 80 },
        { day: 3, activities: ["teamLab Borderless", "Odaiba waterfront", "Akihabara electronics district"], duration: "8 hours", estimatedCost: 70 },
        { day: 4, activities: ["Meiji Shrine", "Yoyogi Park", "Shinjuku nightlife"], duration: "7 hours", estimatedCost: 90 }
      ],
      "1": [
        { day: 5, activities: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji Golden Pavilion"], duration: "9 hours", estimatedCost: 50 },
        { day: 6, activities: ["Kiyomizu-dera Temple", "Gion geisha district", "Pontocho alley dining"], duration: "8 hours", estimatedCost: 100 },
        { day: 7, activities: ["Nijo Castle", "Philosopher's Path", "Traditional tea ceremony"], duration: "7 hours", estimatedCost: 80 }
      ],
      "2": [
        { day: 8, activities: ["Osaka Castle", "Dotonbori street food", "Kuromon Market"], duration: "8 hours", estimatedCost: 70 },
        { day: 9, activities: ["Universal Studios Japan", "Evening canal cruise"], duration: "10 hours", estimatedCost: 120 }
      ]
    },
    costsBreakdown: {
      transport: { min: 605, max: 805 },
      activities: { min: 500, max: 800 },
      lodging: { min: 700, max: 1600 }
    }
  },
  {
    title: "European Capital Tour",
    description: "Experience the art, culture, and history of three magnificent European capitals in one unforgettable journey",
    destinations: [
      {
        name: "Paris",
        country: "France",
        nights: 4,
        transport: { type: "flight", cost: 350, duration: "Start point" }
      },
      {
        name: "Amsterdam",
        country: "Netherlands",
        nights: 3,
        transport: { type: "train", cost: 95, duration: "3h 20m" }
      },
      {
        name: "Berlin",
        country: "Germany",
        nights: 3,
        transport: { type: "train", cost: 80, duration: "6h 30m" }
      }
    ],
    totalNights: 10,
    priceMin: "2200",
    priceMax: "4000",
    season: ["spring", "summer", "fall"],
    tags: ["culture", "food", "nightlife", "art"],
    audienceTags: ["couple", "friends", "solo", "12+"],
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    images: [
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
      "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f"
    ],
    dailyItinerary: {
      "0": [
        { day: 1, activities: ["Eiffel Tower", "Seine River cruise", "Champs-Élysées walk"], duration: "8 hours", estimatedCost: 80 },
        { day: 2, activities: ["Louvre Museum", "Notre-Dame area", "Latin Quarter"], duration: "9 hours", estimatedCost: 70 },
        { day: 3, activities: ["Versailles Palace day trip", "Palace gardens"], duration: "8 hours", estimatedCost: 100 },
        { day: 4, activities: ["Montmartre & Sacré-Cœur", "Moulin Rouge area", "Le Marais district"], duration: "8 hours", estimatedCost: 90 }
      ],
      "1": [
        { day: 5, activities: ["Canal cruise", "Anne Frank House", "Jordaan neighborhood"], duration: "8 hours", estimatedCost: 70 },
        { day: 6, activities: ["Van Gogh Museum", "Rijksmuseum", "Vondelpark"], duration: "8 hours", estimatedCost: 60 },
        { day: 7, activities: ["Bike tour", "De Wallen district", "Evening canal walk"], duration: "7 hours", estimatedCost: 50 }
      ],
      "2": [
        { day: 8, activities: ["Brandenburg Gate", "Reichstag building", "Holocaust Memorial"], duration: "8 hours", estimatedCost: 40 },
        { day: 9, activities: ["Museum Island", "East Side Gallery", "Checkpoint Charlie"], duration: "8 hours", estimatedCost: 50 },
        { day: 10, activities: ["Charlottenburg Palace", "KaDeWe shopping", "Berlin nightlife"], duration: "8 hours", estimatedCost: 80 }
      ]
    },
    costsBreakdown: {
      transport: { min: 525, max: 725 },
      activities: { min: 600, max: 900 },
      lodging: { min: 1075, max: 2375 }
    }
  },
  {
    title: "Southeast Asia Adventure",
    description: "From bustling Bangkok to serene temples and paradise beaches - the ultimate Thai experience",
    destinations: [
      {
        name: "Bangkok",
        country: "Thailand",
        nights: 3,
        transport: { type: "flight", cost: 800, duration: "Start point" }
      },
      {
        name: "Chiang Mai",
        country: "Thailand",
        nights: 4,
        transport: { type: "flight", cost: 60, duration: "1h 20m" }
      },
      {
        name: "Phuket",
        country: "Thailand",
        nights: 4,
        transport: { type: "flight", cost: 70, duration: "2h" }
      }
    ],
    totalNights: 11,
    priceMin: "1400",
    priceMax: "2800",
    season: ["winter", "spring", "year-round"],
    tags: ["adventure", "nature", "food", "nightlife"],
    audienceTags: ["solo", "couple", "friends", "group", "12+"],
    heroImage: "https://images.unsplash.com/photo-1508009603885-50cf7c579365",
    images: [
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1"
    ],
    dailyItinerary: {
      "0": [
        { day: 1, activities: ["Grand Palace", "Wat Pho temple", "Khao San Road"], duration: "8 hours", estimatedCost: 40 },
        { day: 2, activities: ["Floating markets", "Wat Arun", "Rooftop bar evening"], duration: "9 hours", estimatedCost: 60 },
        { day: 3, activities: ["Chatuchak Market", "Jim Thompson House", "Thai cooking class"], duration: "8 hours", estimatedCost: 80 }
      ],
      "1": [
        { day: 4, activities: ["Doi Suthep temple", "Old City temples tour", "Night bazaar"], duration: "9 hours", estimatedCost: 50 },
        { day: 5, activities: ["Elephant sanctuary visit", "Organic farm lunch"], duration: "8 hours", estimatedCost: 100 },
        { day: 6, activities: ["Doi Inthanon National Park", "Hill tribe villages"], duration: "10 hours", estimatedCost: 70 },
        { day: 7, activities: ["Thai massage course", "Art galleries", "Riverside dining"], duration: "7 hours", estimatedCost: 90 }
      ],
      "2": [
        { day: 8, activities: ["Phi Phi Islands day tour", "Snorkeling"], duration: "9 hours", estimatedCost: 120 },
        { day: 9, activities: ["Patong Beach", "Big Buddha", "Sunset viewpoint"], duration: "8 hours", estimatedCost: 60 },
        { day: 10, activities: ["Phang Nga Bay kayaking", "James Bond Island"], duration: "9 hours", estimatedCost: 110 },
        { day: 11, activities: ["Beach relaxation", "Old Phuket Town", "Bangla Road nightlife"], duration: "8 hours", estimatedCost: 70 }
      ]
    },
    costsBreakdown: {
      transport: { min: 930, max: 1100 },
      activities: { min: 450, max: 750 },
      lodging: { min: 420, max: 950 }
    }
  },
  {
    title: "Mediterranean Dream",
    description: "Sun-soaked coastlines, world-class cuisine, and timeless culture across three Mediterranean gems",
    destinations: [
      {
        name: "Barcelona",
        country: "Spain",
        nights: 4,
        transport: { type: "flight", cost: 400, duration: "Start point" }
      },
      {
        name: "Nice",
        country: "France",
        nights: 3,
        transport: { type: "train", cost: 85, duration: "7h" }
      },
      {
        name: "Rome",
        country: "Italy",
        nights: 4,
        transport: { type: "flight", cost: 120, duration: "1h 30m" }
      }
    ],
    totalNights: 11,
    priceMin: "2400",
    priceMax: "4500",
    season: ["spring", "summer", "fall"],
    tags: ["culture", "food", "nature", "art"],
    audienceTags: ["couple", "family", "friends", "12+"],
    heroImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded",
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5"
    ],
    dailyItinerary: {
      "0": [
        { day: 1, activities: ["Sagrada Família", "Park Güell", "Gothic Quarter"], duration: "9 hours", estimatedCost: 80 },
        { day: 2, activities: ["La Rambla", "Boqueria Market", "Barcelona beach"], duration: "8 hours", estimatedCost: 70 },
        { day: 3, activities: ["Montjuïc hill", "Magic Fountain", "Tapas tour"], duration: "8 hours", estimatedCost: 100 },
        { day: 4, activities: ["Casa Batlló", "Passeig de Gràcia", "Barceloneta"], duration: "8 hours", estimatedCost: 90 }
      ],
      "1": [
        { day: 5, activities: ["Promenade des Anglais", "Old Town Nice", "Castle Hill"], duration: "8 hours", estimatedCost: 60 },
        { day: 6, activities: ["Monaco day trip", "Monte Carlo Casino", "Eze village"], duration: "10 hours", estimatedCost: 120 },
        { day: 7, activities: ["Cours Saleya market", "Matisse Museum", "Beach time"], duration: "7 hours", estimatedCost: 70 }
      ],
      "2": [
        { day: 8, activities: ["Colosseum", "Roman Forum", "Palatine Hill"], duration: "9 hours", estimatedCost: 80 },
        { day: 9, activities: ["Vatican Museums", "Sistine Chapel", "St. Peter's Basilica"], duration: "9 hours", estimatedCost: 70 },
        { day: 10, activities: ["Trevi Fountain", "Spanish Steps", "Pantheon"], duration: "8 hours", estimatedCost: 60 },
        { day: 11, activities: ["Trastevere neighborhood", "Villa Borghese", "Roman dining"], duration: "8 hours", estimatedCost: 90 }
      ]
    },
    costsBreakdown: {
      transport: { min: 605, max: 805 },
      activities: { min: 800, max: 1200 },
      lodging: { min: 995, max: 2495 }
    }
  },
  {
    title: "Japan Extended Discovery",
    description: "An immersive journey through Japan's most iconic cities, from Tokyo's neon lights to Hiroshima's powerful history",
    destinations: [
      {
        name: "Tokyo",
        country: "Japan",
        nights: 5,
        transport: { type: "flight", cost: 500, duration: "Start point" }
      },
      {
        name: "Kyoto",
        country: "Japan",
        nights: 4,
        transport: { type: "bullet_train", cost: 140, duration: "2h 15m" }
      },
      {
        name: "Osaka",
        country: "Japan",
        nights: 4,
        transport: { type: "train", cost: 15, duration: "30m" }
      },
      {
        name: "Hiroshima",
        country: "Japan",
        nights: 3,
        transport: { type: "bullet_train", cost: 95, duration: "1h 20m" }
      }
    ],
    totalNights: 16,
    priceMin: "1200",
    priceMax: "2000",
    season: ["spring", "fall", "year-round"],
    tags: ["culture", "food", "nature", "adventure"],
    audienceTags: ["couple", "solo", "friends", "12+"],
    rating: 4.9,
    popularity: 234,
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186"
    ],
    dailyItinerary: {
      "0": [
        { day: 1, activities: ["Senso-ji Temple", "Shibuya Crossing", "Tokyo Skytree"], duration: "8 hours", estimatedCost: 60 },
        { day: 2, activities: ["Meiji Shrine", "Harajuku shopping", "Shinjuku nightlife"], duration: "9 hours", estimatedCost: 80 },
        { day: 3, activities: ["Tsukiji Outer Market", "Imperial Palace", "Ginza shopping"], duration: "8 hours", estimatedCost: 100 },
        { day: 4, activities: ["teamLab Borderless", "Odaiba", "Rainbow Bridge"], duration: "8 hours", estimatedCost: 70 },
        { day: 5, activities: ["Akihabara", "Ueno Park", "Ameya-Yokocho Market"], duration: "7 hours", estimatedCost: 60 }
      ],
      "1": [
        { day: 6, activities: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Monkey Park"], duration: "9 hours", estimatedCost: 50 },
        { day: 7, activities: ["Kinkaku-ji Temple", "Ryoan-ji Temple", "Nijo Castle"], duration: "8 hours", estimatedCost: 60 },
        { day: 8, activities: ["Gion district", "Yasaka Shrine", "Traditional tea ceremony"], duration: "8 hours", estimatedCost: 90 },
        { day: 9, activities: ["Philosopher's Path", "Kiyomizu-dera", "Pontocho dining"], duration: "8 hours", estimatedCost: 100 }
      ],
      "2": [
        { day: 10, activities: ["Osaka Castle", "Dotonbori", "Street food tour"], duration: "9 hours", estimatedCost: 80 },
        { day: 11, activities: ["Kuromon Market", "Shinsekai district", "Tsutenkaku Tower"], duration: "8 hours", estimatedCost: 70 },
        { day: 12, activities: ["Universal Studios Japan full day"], duration: "10 hours", estimatedCost: 120 },
        { day: 13, activities: ["Sumiyoshi Taisha Shrine", "Namba shopping", "Osaka nightlife"], duration: "8 hours", estimatedCost: 90 }
      ],
      "3": [
        { day: 14, activities: ["Peace Memorial Park", "Atomic Bomb Dome", "Peace Memorial Museum"], duration: "7 hours", estimatedCost: 40 },
        { day: 15, activities: ["Miyajima Island", "Itsukushima Shrine", "Mount Misen hike"], duration: "10 hours", estimatedCost: 80 },
        { day: 16, activities: ["Hiroshima Castle", "Shukkeien Garden", "Okonomiyaki dining"], duration: "7 hours", estimatedCost: 60 }
      ]
    },
    costsBreakdown: {
      transport: { min: 750, max: 950 },
      activities: { min: 900, max: 1400 },
      lodging: { min: 800, max: 1800 }
    }
  },
  {
    title: "Grand European Journey",
    description: "Discover four of Europe's most captivating cities in one spectacular journey through art, culture, and cuisine",
    destinations: [
      {
        name: "Paris",
        country: "France",
        nights: 6,
        transport: { type: "flight", cost: 400, duration: "Start point" }
      },
      {
        name: "Rome",
        country: "Italy",
        nights: 6,
        transport: { type: "flight", cost: 120, duration: "2h" }
      },
      {
        name: "Barcelona",
        country: "Spain",
        nights: 6,
        transport: { type: "flight", cost: 100, duration: "2h" }
      },
      {
        name: "Amsterdam",
        country: "Netherlands",
        nights: 6,
        transport: { type: "flight", cost: 130, duration: "2h 15m" }
      }
    ],
    totalNights: 24,
    priceMin: "800",
    priceMax: "1500",
    season: ["spring", "summer", "fall"],
    tags: ["culture", "art", "food", "nightlife"],
    audienceTags: ["couple", "friends", "family", "9+"],
    rating: 4.8,
    popularity: 189,
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    images: [
      "https://images.unsplash.com/photo-1549144511-f099e773c147",
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9"
    ],
    dailyItinerary: {
      "0": [
        { day: 1, activities: ["Eiffel Tower", "Trocadéro Gardens", "Seine River cruise"], duration: "8 hours", estimatedCost: 80 },
        { day: 2, activities: ["Louvre Museum", "Tuileries Garden", "Place Vendôme"], duration: "9 hours", estimatedCost: 70 },
        { day: 3, activities: ["Notre-Dame area", "Latin Quarter", "Panthéon"], duration: "8 hours", estimatedCost: 60 },
        { day: 4, activities: ["Versailles Palace day trip"], duration: "10 hours", estimatedCost: 100 },
        { day: 5, activities: ["Montmartre", "Sacré-Cœur", "Moulin Rouge area"], duration: "8 hours", estimatedCost: 90 },
        { day: 6, activities: ["Champs-Élysées", "Arc de Triomphe", "Le Marais"], duration: "8 hours", estimatedCost: 80 }
      ],
      "1": [
        { day: 7, activities: ["Colosseum", "Roman Forum", "Palatine Hill"], duration: "9 hours", estimatedCost: 80 },
        { day: 8, activities: ["Vatican Museums", "Sistine Chapel", "St. Peter's Basilica"], duration: "9 hours", estimatedCost: 70 },
        { day: 9, activities: ["Trevi Fountain", "Spanish Steps", "Pantheon"], duration: "8 hours", estimatedCost: 60 },
        { day: 10, activities: ["Trastevere", "Villa Borghese", "Piazza Navona"], duration: "8 hours", estimatedCost: 90 },
        { day: 11, activities: ["Borghese Gallery", "Appian Way", "Catacombs"], duration: "8 hours", estimatedCost: 70 },
        { day: 12, activities: ["Campo de' Fiori market", "Jewish Ghetto", "Roman dining"], duration: "7 hours", estimatedCost: 80 }
      ],
      "2": [
        { day: 13, activities: ["Sagrada Família", "Park Güell", "Gothic Quarter"], duration: "9 hours", estimatedCost: 80 },
        { day: 14, activities: ["La Rambla", "Boqueria Market", "Barceloneta Beach"], duration: "8 hours", estimatedCost: 70 },
        { day: 15, activities: ["Casa Batlló", "Casa Milà", "Passeig de Gràcia"], duration: "8 hours", estimatedCost: 90 },
        { day: 16, activities: ["Montjuïc", "Magic Fountain", "Olympic Stadium"], duration: "8 hours", estimatedCost: 60 },
        { day: 17, activities: ["Camp Nou Stadium", "FC Barcelona Museum", "Tapas tour"], duration: "8 hours", estimatedCost: 100 },
        { day: 18, activities: ["Bunkers del Carmel", "El Born district", "Picasso Museum"], duration: "8 hours", estimatedCost: 80 }
      ],
      "3": [
        { day: 19, activities: ["Canal cruise", "Anne Frank House", "Jordaan"], duration: "8 hours", estimatedCost: 70 },
        { day: 20, activities: ["Van Gogh Museum", "Rijksmuseum", "Museumplein"], duration: "8 hours", estimatedCost: 60 },
        { day: 21, activities: ["Bike tour", "Vondelpark", "Nine Streets shopping"], duration: "7 hours", estimatedCost: 50 },
        { day: 22, activities: ["Zaanse Schans windmills", "Dutch countryside"], duration: "9 hours", estimatedCost: 80 },
        { day: 23, activities: ["Albert Cuyp Market", "Heineken Experience", "De Pijp"], duration: "8 hours", estimatedCost: 70 },
        { day: 24, activities: ["A'DAM Lookout", "NDSM Wharf", "Canal-side dining"], duration: "8 hours", estimatedCost: 90 }
      ]
    },
    costsBreakdown: {
      transport: { min: 750, max: 950 },
      activities: { min: 1200, max: 1800 },
      lodging: { min: 1400, max: 2800 }
    }
  },
  {
    title: "Southeast Asia Multi-Country",
    description: "An epic adventure across four Southeast Asian gems, from Thai temples to Balinese beaches and Singapore's skyline",
    destinations: [
      {
        name: "Bangkok",
        country: "Thailand",
        nights: 8,
        transport: { type: "flight", cost: 600, duration: "Start point" }
      },
      {
        name: "Chiang Mai",
        country: "Thailand",
        nights: 9,
        transport: { type: "flight", cost: 80, duration: "1h 20m" }
      },
      {
        name: "Bali",
        country: "Indonesia",
        nights: 10,
        transport: { type: "flight", cost: 180, duration: "4h 30m" }
      },
      {
        name: "Singapore",
        country: "Singapore",
        nights: 8,
        transport: { type: "flight", cost: 150, duration: "2h 30m" }
      }
    ],
    totalNights: 35,
    priceMin: "1500",
    priceMax: "2800",
    season: ["winter", "spring", "year-round"],
    tags: ["adventure", "nature", "culture", "food"],
    audienceTags: ["solo", "friends", "couple", "5+"],
    rating: 4.7,
    popularity: 156,
    heroImage: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
    images: [
      "https://images.unsplash.com/photo-1528181304800-259b08848526",
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
    ],
    dailyItinerary: {
      "0": [
        { day: 1, activities: ["Grand Palace", "Wat Pho", "Wat Arun"], duration: "8 hours", estimatedCost: 50 },
        { day: 2, activities: ["Chatuchak Market", "Jim Thompson House", "Khao San Road"], duration: "9 hours", estimatedCost: 60 },
        { day: 3, activities: ["Floating markets", "Ayutthaya day trip"], duration: "10 hours", estimatedCost: 80 },
        { day: 4, activities: ["Chinatown", "Pak Khlong Talat flower market", "Rooftop bar"], duration: "8 hours", estimatedCost: 70 },
        { day: 5, activities: ["Thai cooking class", "MBK shopping", "Siam area"], duration: "8 hours", estimatedCost: 90 },
        { day: 6, activities: ["Lumpini Park", "Terminal 21", "Asiatique riverfront"], duration: "8 hours", estimatedCost: 60 },
        { day: 7, activities: ["Damnoen Saduak floating market", "Railway market"], duration: "9 hours", estimatedCost: 70 },
        { day: 8, activities: ["Erawan Museum", "Ancient City", "Night market"], duration: "8 hours", estimatedCost: 80 }
      ],
      "1": [
        { day: 9, activities: ["Doi Suthep Temple", "Old City temples", "Night Bazaar"], duration: "9 hours", estimatedCost: 50 },
        { day: 10, activities: ["Elephant sanctuary", "Waterfall visit"], duration: "10 hours", estimatedCost: 100 },
        { day: 11, activities: ["Thai cooking class", "Local markets", "Massage course"], duration: "8 hours", estimatedCost: 80 },
        { day: 12, activities: ["Doi Inthanon National Park", "Hill tribe villages"], duration: "10 hours", estimatedCost: 90 },
        { day: 13, activities: ["White Temple day trip (Chiang Rai)", "Blue Temple"], duration: "12 hours", estimatedCost: 120 },
        { day: 14, activities: ["Sticky Waterfall", "Bua Thong", "Hot springs"], duration: "9 hours", estimatedCost: 70 },
        { day: 15, activities: ["Sunday Walking Street", "Art galleries", "Cafe hopping"], duration: "8 hours", estimatedCost: 60 },
        { day: 16, activities: ["Zip-lining adventure", "Mae Ping River cruise"], duration: "9 hours", estimatedCost: 110 },
        { day: 17, activities: ["Nimman Road", "Maya shopping", "Rooftop bars"], duration: "8 hours", estimatedCost: 80 }
      ],
      "2": [
        { day: 18, activities: ["Ubud Monkey Forest", "Tegallalang Rice Terraces", "Ubud Palace"], duration: "9 hours", estimatedCost: 60 },
        { day: 19, activities: ["Mount Batur sunrise trek", "Hot springs"], duration: "10 hours", estimatedCost: 100 },
        { day: 20, activities: ["Tirta Empul Temple", "Gunung Kawi", "Coffee plantation"], duration: "8 hours", estimatedCost: 70 },
        { day: 21, activities: ["Beach day in Seminyak", "Tanah Lot sunset"], duration: "8 hours", estimatedCost: 80 },
        { day: 22, activities: ["Uluwatu Temple", "Kecak dance", "Jimbaran seafood"], duration: "9 hours", estimatedCost: 90 },
        { day: 23, activities: ["Snorkeling Nusa Penida", "Kelingking Beach"], duration: "10 hours", estimatedCost: 120 },
        { day: 24, activities: ["Surfing lesson", "Beach clubs", "Shopping"], duration: "8 hours", estimatedCost: 100 },
        { day: 25, activities: ["Sacred Monkey Forest Sanctuary", "Ubud Art Market", "Traditional dance"], duration: "8 hours", estimatedCost: 70 },
        { day: 26, activities: ["Waterbom Bali", "Kuta Beach", "Sunset drinks"], duration: "8 hours", estimatedCost: 80 },
        { day: 27, activities: ["Spa day", "Yoga class", "Healthy cafes"], duration: "7 hours", estimatedCost: 90 }
      ],
      "3": [
        { day: 28, activities: ["Marina Bay Sands", "Gardens by the Bay", "Supertree Grove"], duration: "8 hours", estimatedCost: 80 },
        { day: 29, activities: ["Chinatown", "Little India", "Arab Street"], duration: "9 hours", estimatedCost: 60 },
        { day: 30, activities: ["Universal Studios Singapore"], duration: "10 hours", estimatedCost: 120 },
        { day: 31, activities: ["Sentosa Island", "Beaches", "S.E.A. Aquarium"], duration: "9 hours", estimatedCost: 100 },
        { day: 32, activities: ["Orchard Road shopping", "ION Sky", "Rooftop bars"], duration: "8 hours", estimatedCost: 90 },
        { day: 33, activities: ["Singapore Zoo", "Night Safari"], duration: "10 hours", estimatedCost: 110 },
        { day: 34, activities: ["Clarke Quay", "Singapore River cruise", "Hawker centers"], duration: "8 hours", estimatedCost: 70 },
        { day: 35, activities: ["Haji Lane", "Kampong Glam", "Raffles Hotel"], duration: "7 hours", estimatedCost: 80 }
      ]
    },
    costsBreakdown: {
      transport: { min: 1010, max: 1210 },
      activities: { min: 2100, max: 3200 },
      lodging: { min: 1800, max: 3500 }
    }
  }
];

export async function seedJourneys() {
  console.log('🌍 Starting journeys seeding...');
  
  try {
    let createdCount = 0;
    for (const journeyData of sampleJourneys) {
      try {
        const existingJourney = await storage.getJourneys({ limit: 100 });
        const exists = existingJourney.find(j => j.title === journeyData.title);
        
        if (!exists) {
          await storage.createJourney(journeyData);
          console.log(`✅ Created journey: ${journeyData.title}`);
          createdCount++;
        } else {
          console.log(`⏭️  Journey already exists: ${journeyData.title}`);
        }
      } catch (error) {
        console.error(`❌ Error creating journey ${journeyData.title}:`, error);
      }
    }
    
    console.log(`🎉 Journeys seeding completed! Created ${createdCount} new journeys.`);
    return { success: true, created: createdCount };
  } catch (error) {
    console.error('❌ Error seeding journeys:', error);
    return { success: false, error };
  }
}
