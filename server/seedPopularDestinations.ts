import { storage } from './storage.js';
import { MediaOrchestrator } from './integrations/media/mediaOrchestrator.js';
import { db } from './db.js';
import { destinations } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

const popularCities = [
  // Europe
  { name: 'Paris', country: 'France', continent: 'Europe', city: 'Paris', description: 'The City of Light offers iconic landmarks, world-class art, and exquisite cuisine' },
  { name: 'London', country: 'United Kingdom', continent: 'Europe', city: 'London', description: 'Historic capital with royal palaces, museums, and vibrant culture' },
  { name: 'Rome', country: 'Italy', continent: 'Europe', city: 'Rome', description: 'The Eternal City filled with ancient history and Renaissance art' },
  { name: 'Barcelona', country: 'Spain', continent: 'Europe', city: 'Barcelona', description: 'Stunning architecture, beautiful beaches, and vibrant culture' },
  { name: 'Amsterdam', country: 'Netherlands', continent: 'Europe', city: 'Amsterdam', description: 'Artistic heritage, canals, and cycling culture' },
  { name: 'Prague', country: 'Czech Republic', continent: 'Europe', city: 'Prague', description: 'Fairy-tale architecture and rich medieval history' },
  { name: 'Vienna', country: 'Austria', continent: 'Europe', city: 'Vienna', description: 'Imperial palaces, classical music, and elegant coffee houses' },
  { name: 'Athens', country: 'Greece', continent: 'Europe', city: 'Athens', description: 'Cradle of Western civilization and ancient landmarks' },
  { name: 'Lisbon', country: 'Portugal', continent: 'Europe', city: 'Lisbon', description: 'Coastal capital with colorful architecture and historic trams' },
  { name: 'Berlin', country: 'Germany', continent: 'Europe', city: 'Berlin', description: 'Creative hub with rich history and dynamic nightlife' },
  { name: 'Moscow', country: 'Russia', continent: 'Europe', city: 'Moscow', description: 'Red Square, Kremlin, and onion-domed churches' },
  { name: 'Reykjavik', country: 'Iceland', continent: 'Europe', city: 'Reykjavik', description: 'Gateway to natural wonders like Northern Lights and hot springs' },
  { name: 'Santorini', country: 'Greece', continent: 'Europe', city: 'Santorini', description: 'White-washed villages, stunning sunsets, and volcanic beaches' },
  { name: 'Venice', country: 'Italy', continent: 'Europe', city: 'Venice', description: 'Romantic canals, gondolas, and historic architecture' },
  { name: 'Florence', country: 'Italy', continent: 'Europe', city: 'Florence', description: 'Renaissance masterpieces, Duomo, and Tuscan charm' },
  { name: 'Milan', country: 'Italy', continent: 'Europe', city: 'Milan', description: 'Fashion capital with Gothic cathedral and high-end shopping' },
  { name: 'Madrid', country: 'Spain', continent: 'Europe', city: 'Madrid', description: 'Royal capital with world-class museums and vibrant nightlife' },
  { name: 'Seville', country: 'Spain', continent: 'Europe', city: 'Seville', description: 'Flamenco, tapas, and stunning Moorish architecture' },
  { name: 'Munich', country: 'Germany', continent: 'Europe', city: 'Munich', description: 'Bavarian culture, beer gardens, and historic landmarks' },
  { name: 'Edinburgh', country: 'United Kingdom', continent: 'Europe', city: 'Edinburgh', description: 'Medieval Old Town, Edinburgh Castle, and Scottish heritage' },
  { name: 'Dublin', country: 'Ireland', continent: 'Europe', city: 'Dublin', description: 'Friendly pubs, literary history, and Georgian architecture' },
  { name: 'Copenhagen', country: 'Denmark', continent: 'Europe', city: 'Copenhagen', description: 'Danish design, colorful Nyhavn, and cycling culture' },
  { name: 'Stockholm', country: 'Sweden', continent: 'Europe', city: 'Stockholm', description: 'Scandinavian beauty, archipelago islands, and historic Old Town' },
  { name: 'Oslo', country: 'Norway', continent: 'Europe', city: 'Oslo', description: 'Nordic nature, modern architecture, and Viking history' },
  { name: 'Budapest', country: 'Hungary', continent: 'Europe', city: 'Budapest', description: 'Thermal baths, Danube views, and ruin bars' },
  { name: 'Krakow', country: 'Poland', continent: 'Europe', city: 'Krakow', description: 'Medieval square, Jewish quarter, and Polish history' },
  { name: 'Zurich', country: 'Switzerland', continent: 'Europe', city: 'Zurich', description: 'Swiss Alps gateway, pristine lake, and banking hub' },
  { name: 'Brussels', country: 'Belgium', continent: 'Europe', city: 'Brussels', description: 'European capital, Belgian waffles, and Art Nouveau architecture' },

  // Asia
  { name: 'Tokyo', country: 'Japan', continent: 'Asia', city: 'Tokyo', description: 'A fascinating blend of ancient tradition and cutting-edge modernity' },
  { name: 'Dubai', country: 'United Arab Emirates', continent: 'Asia', city: 'Dubai', description: 'Futuristic city with luxury shopping and modern architecture' },
  { name: 'Bangkok', country: 'Thailand', continent: 'Asia', city: 'Bangkok', description: 'Vibrant street life, ornate shrines, and bustling markets' },
  { name: 'Istanbul', country: 'Turkey', continent: 'Asia', city: 'Istanbul', description: 'Where East meets West, rich history and stunning architecture' },
  { name: 'Singapore', country: 'Singapore', continent: 'Asia', city: 'Singapore', description: 'Modern city-state with diverse culture and incredible food' },
  { name: 'Bali', country: 'Indonesia', continent: 'Asia', city: 'Bali', description: 'Tropical paradise with stunning beaches, temples, and rice terraces' },
  { name: 'Mumbai', country: 'India', continent: 'Asia', city: 'Mumbai', description: 'Bollywood, colonial architecture, and bustling markets' },
  { name: 'Seoul', country: 'South Korea', continent: 'Asia', city: 'Seoul', description: 'Modern metropolis with ancient temples and vibrant K-culture' },
  { name: 'Hong Kong', country: 'Hong Kong', continent: 'Asia', city: 'Hong Kong', description: 'Skyscrapers, dim sum, and harbor views' },
  { name: 'Kyoto', country: 'Japan', continent: 'Asia', city: 'Kyoto', description: 'Ancient temples, traditional geishas, and zen gardens' },
  { name: 'Shanghai', country: 'China', continent: 'Asia', city: 'Shanghai', description: 'Modern skyline, historic Bund, and vibrant culture' },
  { name: 'Beijing', country: 'China', continent: 'Asia', city: 'Beijing', description: 'Forbidden City, Great Wall, and Chinese imperial history' },
  { name: 'Hanoi', country: 'Vietnam', continent: 'Asia', city: 'Hanoi', description: 'French colonial charm, street food, and Old Quarter' },
  { name: 'Ho Chi Minh City', country: 'Vietnam', continent: 'Asia', city: 'Ho Chi Minh City', description: 'Vietnamese energy, War museums, and street food scene' },
  { name: 'Kuala Lumpur', country: 'Malaysia', continent: 'Asia', city: 'Kuala Lumpur', description: 'Petronas Towers, diverse culture, and street markets' },
  { name: 'Manila', country: 'Philippines', continent: 'Asia', city: 'Manila', description: 'Spanish heritage, vibrant nightlife, and Filipino warmth' },
  { name: 'Jakarta', country: 'Indonesia', continent: 'Asia', city: 'Jakarta', description: 'Indonesian capital with diverse culture and bustling energy' },
  { name: 'Delhi', country: 'India', continent: 'Asia', city: 'Delhi', description: 'Ancient monuments, Mughal heritage, and colorful bazaars' },
  { name: 'Jaipur', country: 'India', continent: 'Asia', city: 'Jaipur', description: 'Pink City with majestic palaces and vibrant markets' },
  { name: 'Agra', country: 'India', continent: 'Asia', city: 'Agra', description: 'Home of the Taj Mahal and Mughal architecture' },
  { name: 'Tel Aviv', country: 'Israel', continent: 'Asia', city: 'Tel Aviv', description: 'Mediterranean beaches, Bauhaus architecture, and vibrant nightlife' },
  { name: 'Jerusalem', country: 'Israel', continent: 'Asia', city: 'Jerusalem', description: 'Holy city with ancient sites and spiritual significance' },
  { name: 'Colombo', country: 'Sri Lanka', continent: 'Asia', city: 'Colombo', description: 'Colonial heritage, Buddhist temples, and coastal charm' },
  { name: 'Kathmandu', country: 'Nepal', continent: 'Asia', city: 'Kathmandu', description: 'Gateway to Himalayas, ancient temples, and Nepali culture' },
  { name: 'Phuket', country: 'Thailand', continent: 'Asia', city: 'Phuket', description: 'Thailand beaches, island paradise, and water sports' },

  // North America
  { name: 'New York', country: 'United States', continent: 'North America', city: 'New York', description: 'The city that never sleeps, iconic skyline and diverse culture' },
  { name: 'Los Angeles', country: 'United States', continent: 'North America', city: 'Los Angeles', description: 'Entertainment capital, beaches, and diverse neighborhoods' },
  { name: 'Miami', country: 'United States', continent: 'North America', city: 'Miami', description: 'Art Deco architecture, beaches, and Latin culture' },
  { name: 'Mexico City', country: 'Mexico', continent: 'North America', city: 'Mexico City', description: 'Ancient Aztec heritage, museums, and vibrant street life' },
  { name: 'Las Vegas', country: 'United States', continent: 'North America', city: 'Las Vegas', description: 'Entertainment paradise, casinos, and world-class shows' },
  { name: 'San Francisco', country: 'United States', continent: 'North America', city: 'San Francisco', description: 'Golden Gate Bridge, cable cars, and tech innovation' },
  { name: 'Chicago', country: 'United States', continent: 'North America', city: 'Chicago', description: 'Architecture, deep-dish pizza, and lakefront beauty' },
  { name: 'Toronto', country: 'Canada', continent: 'North America', city: 'Toronto', description: 'CN Tower, diverse culture, and cosmopolitan energy' },
  { name: 'Vancouver', country: 'Canada', continent: 'North America', city: 'Vancouver', description: 'Mountain meets ocean, outdoor adventures, and multiculturalism' },
  { name: 'Cancun', country: 'Mexico', continent: 'North America', city: 'Cancun', description: 'Turquoise Caribbean waters, Mayan ruins, and beach resorts' },
  { name: 'Playa del Carmen', country: 'Mexico', continent: 'North America', city: 'Playa del Carmen', description: 'Riviera Maya beaches, cenotes, and laid-back vibes' },
  { name: 'Montreal', country: 'Canada', continent: 'North America', city: 'Montreal', description: 'French charm, festivals, and European atmosphere in North America' },

  // South America
  { name: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', city: 'Rio de Janeiro', description: 'Iconic beaches, Christ the Redeemer, and Carnival celebrations' },
  { name: 'Buenos Aires', country: 'Argentina', continent: 'South America', city: 'Buenos Aires', description: 'Tango, steakhouses, and European-style architecture' },
  { name: 'Lima', country: 'Peru', continent: 'South America', city: 'Lima', description: 'Peruvian cuisine capital, colonial architecture, and coastal cliffs' },
  { name: 'Cusco', country: 'Peru', continent: 'South America', city: 'Cusco', description: 'Gateway to Machu Picchu and Inca heritage' },
  { name: 'Santiago', country: 'Chile', continent: 'South America', city: 'Santiago', description: 'Andes Mountains backdrop, wine valleys, and modern museums' },
  { name: 'Bogota', country: 'Colombia', continent: 'South America', city: 'Bogota', description: 'Colombian capital with colonial charm and vibrant culture' },
  { name: 'Cartagena', country: 'Colombia', continent: 'South America', city: 'Cartagena', description: 'Caribbean coast, walled colonial city, and colorful streets' },
  { name: 'Medellin', country: 'Colombia', continent: 'South America', city: 'Medellin', description: 'City of eternal spring, innovation, and transformation' },
  { name: 'Quito', country: 'Ecuador', continent: 'South America', city: 'Quito', description: 'Andean capital, colonial Old Town, and volcano views' },
  { name: 'La Paz', country: 'Bolivia', continent: 'South America', city: 'La Paz', description: 'Highest capital, cable car network, and indigenous culture' },
  { name: 'Montevideo', country: 'Uruguay', continent: 'South America', city: 'Montevideo', description: 'Laid-back capital, beaches, and South American charm' },
  { name: 'Sao Paulo', country: 'Brazil', continent: 'South America', city: 'Sao Paulo', description: 'Brazil economic powerhouse, art scene, and diverse culture' },

  // Oceania
  { name: 'Sydney', country: 'Australia', continent: 'Oceania', city: 'Sydney', description: 'Opera House, harbor, beaches, and laid-back lifestyle' },
  { name: 'Melbourne', country: 'Australia', continent: 'Oceania', city: 'Melbourne', description: 'Art, coffee culture, and sports capital' },
  { name: 'Auckland', country: 'New Zealand', continent: 'Oceania', city: 'Auckland', description: 'City of sails, volcanoes, and Polynesian culture' },
  { name: 'Brisbane', country: 'Australia', continent: 'Oceania', city: 'Brisbane', description: 'Sunshine, river city, and gateway to Queensland beaches' },
  { name: 'Perth', country: 'Australia', continent: 'Oceania', city: 'Perth', description: 'Isolated beaches, parks, and outdoor lifestyle' },
  { name: 'Wellington', country: 'New Zealand', continent: 'Oceania', city: 'Wellington', description: 'Windy capital, craft beer, and film industry' },
  { name: 'Queenstown', country: 'New Zealand', continent: 'Oceania', city: 'Queenstown', description: 'Adventure capital, stunning lakes, and mountain scenery' },
  { name: 'Fiji', country: 'Fiji', continent: 'Oceania', city: 'Fiji', description: 'Tropical paradise, coral reefs, and friendly culture' },

  // Africa
  { name: 'Cape Town', country: 'South Africa', continent: 'Africa', city: 'Cape Town', description: 'Table Mountain, beaches, and winelands' },
  { name: 'Cairo', country: 'Egypt', continent: 'Africa', city: 'Cairo', description: 'Pyramids, ancient history, and Nile River' },
  { name: 'Marrakech', country: 'Morocco', continent: 'Africa', city: 'Marrakech', description: 'Souks, palaces, and desert gateway' },
  { name: 'Nairobi', country: 'Kenya', continent: 'Africa', city: 'Nairobi', description: 'Safari capital, wildlife, and vibrant culture' },
  { name: 'Johannesburg', country: 'South Africa', continent: 'Africa', city: 'Johannesburg', description: 'Economic hub, history, and urban culture' },
  { name: 'Casablanca', country: 'Morocco', continent: 'Africa', city: 'Casablanca', description: 'Modern Morocco, Hassan II Mosque, and coastal charm' },
  { name: 'Luxor', country: 'Egypt', continent: 'Africa', city: 'Luxor', description: 'Valley of the Kings, temples, and ancient monuments' },
  { name: 'Zanzibar', country: 'Tanzania', continent: 'Africa', city: 'Zanzibar', description: 'Spice islands, beaches, and Stone Town' },
  { name: 'Tunis', country: 'Tunisia', continent: 'Africa', city: 'Tunis', description: 'Medina, Roman ruins, and Mediterranean culture' },
  { name: 'Mauritius', country: 'Mauritius', continent: 'Africa', city: 'Mauritius', description: 'Island paradise, beaches, and diverse culture' },

  // Caribbean
  { name: 'Punta Cana', country: 'Dominican Republic', continent: 'Caribbean', city: 'Punta Cana', description: 'All-inclusive resorts, beaches, and water sports' },
  { name: 'Havana', country: 'Cuba', continent: 'Caribbean', city: 'Havana', description: 'Classic cars, colonial architecture, and vibrant culture' },
  { name: 'Nassau', country: 'Bahamas', continent: 'Caribbean', city: 'Nassau', description: 'Paradise island, crystal waters, and resort life' },
  { name: 'Montego Bay', country: 'Jamaica', continent: 'Caribbean', city: 'Montego Bay', description: 'Reggae, jerk chicken, and tropical beaches' },
  { name: 'San Juan', country: 'Puerto Rico', continent: 'Caribbean', city: 'San Juan', description: 'Old San Juan, forts, and Caribbean culture' },
  { name: 'Santo Domingo', country: 'Dominican Republic', continent: 'Caribbean', city: 'Santo Domingo', description: 'First European settlement in Americas, colonial zone' },
];

async function seedDestinationsWithImages() {
  const mediaOrchestrator = new MediaOrchestrator(storage);
  const results: any = {
    added: 0,
    skipped: 0,
    images_added: 0,
    failed: 0,
    errors: [] as any[]
  };

  console.log(`🌍 Starting to seed ${popularCities.length} popular destinations...\n`);

  for (const city of popularCities) {
    try {
      // Check if destination already exists using direct SQL
      const existing = await db.select().from(destinations).where(
        sql`LOWER(${destinations.name}) = ${city.name.toLowerCase()} AND LOWER(${destinations.country}) = ${city.country.toLowerCase()}`
      );

      if (existing.length > 0) {
        console.log(`⏭️  Skipped: ${city.name}, ${city.country} (already exists)`);
        results.skipped++;
        continue;
      }

      // Create destination in database using direct SQL
      const [newDest] = await db.insert(destinations).values({
        name: city.name,
        country: city.country,
        lat: 0,
        lon: 0,
        source: "manual",
        externalId: `manual_${city.name.toLowerCase().replace(/\s+/g, '_')}_${city.country.toLowerCase().replace(/\s+/g, '_')}`,
      }).returning();

      console.log(`✅ Added destination: ${city.name}, ${city.country} (ID: ${newDest.id})`);
      results.added++;

      // Try to fetch and cache image
      try {
        const imageResult = await mediaOrchestrator.getLocationPhoto({
          entityType: 'destination',
          entityId: newDest.id,
          entityName: city.name,
          country: city.country,
          forceRefresh: false
        });
        
        console.log(`   📸 Image cached from ${imageResult.source}`);
        results.images_added++;
      } catch (imgError: any) {
        console.log(`   ⚠️  Image failed: ${imgError.message}`);
      }

    } catch (error: any) {
      results.failed++;
      results.errors.push({
        destination: `${city.name}, ${city.country}`,
        error: error.message
      });
      console.error(`❌ Failed: ${city.name}, ${city.country} - ${error.message}`);
    }
  }

  console.log('\n🎉 Seeding completed!');
  console.log(`\nResults:`);
  console.log(`  ✅ Added: ${results.added} destinations`);
  console.log(`  📸 Images: ${results.images_added} cached`);
  console.log(`  ⏭️  Skipped: ${results.skipped} (already exist)`);
  console.log(`  ❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    results.errors.forEach((e: any) => console.log(`  - ${e.destination}: ${e.error}`));
  }

  process.exit(0);
}

seedDestinationsWithImages();
