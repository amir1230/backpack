import { db } from "./db.js";
import { attractions, attractionsI18n, destinations } from "@shared/schema";
import { eq } from "drizzle-orm";

interface AttractionData {
  name: string;
  description: string;
  nameHe: string;
  descriptionHe: string;
  lat: string;
  lon: string;
  rating: string;
  tags: string[];
}

// Map of destination names to their 3 top attractions
const attractionsData: Record<string, AttractionData[]> = {
  "Amsterdam": [
    {
      name: "Anne Frank House",
      description: "Historic house and museum dedicated to Jewish wartime diarist Anne Frank, showing her secret annex hiding place.",
      nameHe: "בית אנה פרנק",
      descriptionHe: "בית היסטורי ומוזיאון המוקדש ליומני המלחמה של אנה פרנק היהודייה, המציג את מחבואה בנספח הסודי.",
      lat: "52.3752",
      lon: "4.8840",
      rating: "4.7",
      tags: ["museum", "history", "cultural"]
    },
    {
      name: "Van Gogh Museum",
      description: "World's largest collection of Van Gogh's paintings and drawings, featuring over 200 paintings and 500 drawings.",
      nameHe: "מוזיאון ואן גוך",
      descriptionHe: "האוסף הגדול בעולם של ציורי ורישומי ואן גוך, הכולל למעלה מ-200 ציורים ו-500 רישומים.",
      lat: "52.3584",
      lon: "4.8811",
      rating: "4.8",
      tags: ["museum", "art", "cultural"]
    },
    {
      name: "Rijksmuseum",
      description: "Dutch national museum showcasing 800 years of Dutch art and history, including masterpieces by Rembrandt and Vermeer.",
      nameHe: "רייקסמוזיאום",
      descriptionHe: "המוזיאון הלאומי ההולנדי המציג 800 שנות אמנות והיסטוריה הולנדית, כולל יצירות מופת של רמברנדט ורמייר.",
      lat: "52.3600",
      lon: "4.8852",
      rating: "4.8",
      tags: ["museum", "art", "history"]
    }
  ],
  "Paris": [
    {
      name: "Eiffel Tower",
      description: "Iconic 330-meter iron lattice tower offering panoramic views of Paris from multiple observation levels.",
      nameHe: "מגדל אייפל",
      descriptionHe: "מגדל רשת ברזל איקוני בגובה 330 מטר המציע נופים פנורמיים של פריז ממספר רמות תצפית.",
      lat: "48.8584",
      lon: "2.2945",
      rating: "4.7",
      tags: ["landmark", "viewpoint", "iconic"]
    },
    {
      name: "Louvre Museum",
      description: "World's largest art museum housing over 380,000 objects including the Mona Lisa and Venus de Milo.",
      nameHe: "מוזיאון הלובר",
      descriptionHe: "מוזיאון האמנות הגדול בעולם המכיל למעלה מ-380,000 חפצים כולל המונה ליזה וונוס דה מילו.",
      lat: "48.8606",
      lon: "2.3376",
      rating: "4.8",
      tags: ["museum", "art", "cultural"]
    },
    {
      name: "Notre-Dame Cathedral",
      description: "Medieval Catholic cathedral renowned for its Gothic architecture, flying buttresses, and stunning rose windows.",
      nameHe: "קתדרלת נוטרדאם",
      descriptionHe: "קתדרלה קתולית מימי הביניים הידועה לשמצה באדריכלות הגותית, תומכי המעוף וחלונות הוורד המהממים.",
      lat: "48.8530",
      lon: "2.3499",
      rating: "4.7",
      tags: ["church", "history", "architecture"]
    }
  ],
  "London": [
    {
      name: "Tower of London",
      description: "Historic castle and fortress on the Thames housing the Crown Jewels and 1000 years of British history.",
      nameHe: "מצודת לונדון",
      descriptionHe: "טירה והמצודה היסטורית על נהר התמזה המכילה את תכשיטי הכתר ו-1000 שנות היסטוריה בריטית.",
      lat: "51.5081",
      lon: "-0.0759",
      rating: "4.6",
      tags: ["castle", "history", "museum"]
    },
    {
      name: "British Museum",
      description: "World-famous museum showcasing human history, art and culture with 8 million works from all continents.",
      nameHe: "המוזיאון הבריטי",
      descriptionHe: "מוזיאון מפורסם עולמית המציג היסטוריה אנושית, אמנות ותרבות עם 8 מיליון עבודות מכל היבשות.",
      lat: "51.5194",
      lon: "-0.1270",
      rating: "4.7",
      tags: ["museum", "history", "cultural"]
    },
    {
      name: "Buckingham Palace",
      description: "Official London residence of the British monarch, featuring the famous Changing of the Guard ceremony.",
      nameHe: "ארמון בקינגהאם",
      descriptionHe: "מעון לונדון הרשמי של המונרך הבריטי, המציג את טקס החלפת המשמר המפורסם.",
      lat: "51.5014",
      lon: "-0.1419",
      rating: "4.5",
      tags: ["palace", "landmark", "royal"]
    }
  ],
  "Rome": [
    {
      name: "Colosseum",
      description: "Ancient amphitheater and icon of Imperial Rome, once hosting gladiatorial contests and public spectacles for 50,000 spectators.",
      nameHe: "הקולוסיאום",
      descriptionHe: "אמפיתיאטרון עתיק וסמל של רומא הקיסרית, שאירח פעם תחרויות גלדיאטורים ומופעים ציבוריים ל-50,000 צופים.",
      lat: "41.8902",
      lon: "12.4922",
      rating: "4.7",
      tags: ["ancient", "landmark", "history"]
    },
    {
      name: "Vatican Museums",
      description: "Vast collection of art and sculptures accumulated by popes, including Michelangelo's Sistine Chapel ceiling.",
      nameHe: "מוזיאוני הוותיקן",
      descriptionHe: "אוסף עצום של אמנות ופסלים שנאספו על ידי האפיפיורים, כולל תקרת הקפלה הסיסטינית של מיכלאנג'לו.",
      lat: "41.9065",
      lon: "12.4536",
      rating: "4.7",
      tags: ["museum", "art", "religious"]
    },
    {
      name: "Trevi Fountain",
      description: "Baroque masterpiece and Rome's largest fountain, famous for the tradition of tossing coins to ensure return to Rome.",
      nameHe: "מזרקת טרווי",
      descriptionHe: "יצירת מופת בארוקית והמזרקה הגדולה ביותר ברומא, המפורסמת במסורת זריקת מטבעות להבטחת חזרה לרומא.",
      lat: "41.9009",
      lon: "12.4833",
      rating: "4.6",
      tags: ["fountain", "landmark", "baroque"]
    }
  ],
  "Barcelona": [
    {
      name: "Sagrada Familia",
      description: "Gaudí's unfinished basilica masterpiece combining Gothic and Art Nouveau styles, under construction since 1882.",
      nameHe: "סגרדה פמיליה",
      descriptionHe: "יצירת המופת הבסיליקה הבלתי גמורה של גאודי המשלבת סגנונות גותיים וארט נובו, בבנייה מאז 1882.",
      lat: "41.4036",
      lon: "2.1744",
      rating: "4.8",
      tags: ["church", "architecture", "landmark"]
    },
    {
      name: "Park Güell",
      description: "Colorful public park featuring Gaudí's mosaic designs, serpentine benches, and panoramic city views.",
      nameHe: "פארק גואל",
      descriptionHe: "פארק ציבורי צבעוני המציג עיצובי פסיפס של גאודי, ספסלים מפותלים ונופי עיר פנורמיים.",
      lat: "41.4145",
      lon: "2.1527",
      rating: "4.6",
      tags: ["park", "art", "viewpoint"]
    },
    {
      name: "La Rambla",
      description: "Famous tree-lined pedestrian boulevard stretching 1.2km, filled with street performers, cafes, and markets.",
      nameHe: "לה רמבלה",
      descriptionHe: "שדרת הולכי רגל מפורסמת מוצלת עצים באורך 1.2 ק\"מ, מלאה באמני רחוב, בתי קפה ושווקים.",
      lat: "41.3781",
      lon: "2.1770",
      rating: "4.3",
      tags: ["street", "shopping", "entertainment"]
    }
  ],
  "Tokyo": [
    {
      name: "Senso-ji Temple",
      description: "Tokyo's oldest Buddhist temple dating to 645 AD, featuring the iconic Thunder Gate and Nakamise shopping street.",
      nameHe: "מקדש סנסו-ג'י",
      descriptionHe: "המקדש הבודהיסטי העתיק ביותר בטוקיו מ-645 לספירה, המציג את שער הרעם האייקוני ורחוב הקניות נקמיסה.",
      lat: "35.7148",
      lon: "139.7967",
      rating: "4.6",
      tags: ["temple", "cultural", "historic"]
    },
    {
      name: "Tokyo Skytree",
      description: "World's tallest tower at 634 meters offering breathtaking 360-degree views and an aquarium.",
      nameHe: "מגדל טוקיו סקייטרי",
      descriptionHe: "המגדל הגבוה בעולם בגובה 634 מטר המציע נופים עוצרי נשימה של 360 מעלות ואקווריום.",
      lat: "35.7101",
      lon: "139.8107",
      rating: "4.5",
      tags: ["tower", "viewpoint", "modern"]
    },
    {
      name: "Meiji Shrine",
      description: "Serene Shinto shrine surrounded by 170-acre forest, dedicated to Emperor Meiji and Empress Shoken.",
      nameHe: "מקדש מייג'י",
      descriptionHe: "מקדש שינטו שליו המוקף ביער בשטח 170 דונם, מוקדש לקיסר מייג'י ולקיסרית שוקן.",
      lat: "35.6764",
      lon: "139.6993",
      rating: "4.6",
      tags: ["shrine", "cultural", "nature"]
    }
  ],
  "New York": [
    {
      name: "Statue of Liberty",
      description: "Iconic copper statue on Liberty Island symbolizing freedom, gifted by France in 1886.",
      nameHe: "פסל החירות",
      descriptionHe: "פסל נחושת אייקוני באי ליברטי המסמל חירות, מתנה מצרפת ב-1886.",
      lat: "40.6892",
      lon: "-74.0445",
      rating: "4.7",
      tags: ["landmark", "historic", "monument"]
    },
    {
      name: "Central Park",
      description: "843-acre urban park offering lakes, theaters, ice rinks, and an oasis of greenery in Manhattan's heart.",
      nameHe: "סנטרל פארק",
      descriptionHe: "פארק עירוני בשטח 843 דונם המציע אגמים, תיאטראות, משטחי החלקה ונווה מדבר של ירוק בלב מנהטן.",
      lat: "40.7829",
      lon: "-73.9654",
      rating: "4.8",
      tags: ["park", "nature", "recreation"]
    },
    {
      name: "Empire State Building",
      description: "Art Deco skyscraper standing 443 meters tall with observation decks offering stunning Manhattan views.",
      nameHe: "בניין האמפייר סטייט",
      descriptionHe: "גורד שחקים ארט דקו בגובה 443 מטר עם מרפסות תצפית המציעות נופים מדהימים של מנהטן.",
      lat: "40.7484",
      lon: "-73.9857",
      rating: "4.6",
      tags: ["building", "viewpoint", "landmark"]
    }
  ],
  "Dubai": [
    {
      name: "Burj Khalifa",
      description: "World's tallest building at 828 meters with observation decks on floors 124, 125, and 148.",
      nameHe: "בורג' חליפה",
      descriptionHe: "הבניין הגבוה בעולם בגובה 828 מטר עם מרפסות תצפית בקומות 124, 125 ו-148.",
      lat: "25.1972",
      lon: "55.2744",
      rating: "4.7",
      tags: ["building", "viewpoint", "modern"]
    },
    {
      name: "Dubai Mall",
      description: "World's largest shopping mall by total area featuring 1,200 stores, an aquarium, and ice rink.",
      nameHe: "דובאי מול",
      descriptionHe: "הקניון הגדול בעולם לפי שטח כולל עם 1,200 חנויות, אקווריום ומשטח החלקה.",
      lat: "25.1972",
      lon: "55.2796",
      rating: "4.7",
      tags: ["mall", "shopping", "entertainment"]
    },
    {
      name: "Palm Jumeirah",
      description: "Iconic man-made island shaped like a palm tree, home to luxury hotels and residences.",
      nameHe: "פאלם ג'ומיירה",
      descriptionHe: "אי מלאכותי אייקוני בצורת עץ דקל, ביתם של מלונות ומגורים יוקרתיים.",
      lat: "25.1124",
      lon: "55.1390",
      rating: "4.6",
      tags: ["island", "landmark", "luxury"]
    }
  ],
  "Singapore": [
    {
      name: "Gardens by the Bay",
      description: "Futuristic 101-hectare nature park featuring iconic Supertree Grove and climate-controlled conservatories.",
      nameHe: "גנים ליד המפרץ",
      descriptionHe: "פארק טבע עתידני בשטח 101 הקטרים המציג את חורשת העצים העל האייקונית וחממות מבוקרות אקלים.",
      lat: "1.2816",
      lon: "103.8636",
      rating: "4.7",
      tags: ["garden", "modern", "nature"]
    },
    {
      name: "Marina Bay Sands",
      description: "Iconic resort complex with rooftop infinity pool, skypark observation deck, and distinctive ship-like structure.",
      nameHe: "מרינה ביי סנדס",
      descriptionHe: "מתחם נופש אייקוני עם בריכת אינסוף על הגג, מרפסת תצפית בפארק השמיים ומבנה ייחודי דמוי ספינה.",
      lat: "1.2834",
      lon: "103.8607",
      rating: "4.6",
      tags: ["hotel", "landmark", "modern"]
    },
    {
      name: "Sentosa Island",
      description: "Resort island offering beaches, theme parks, golf courses, and attractions like Universal Studios.",
      nameHe: "אי סנטוזה",
      descriptionHe: "אי נופש המציע חופים, פארקי שעשועים, מגרשי גולף ואטרקציות כמו יוניברסל סטודיוס.",
      lat: "1.2494",
      lon: "103.8303",
      rating: "4.5",
      tags: ["island", "entertainment", "beach"]
    }
  ],
  "Sydney": [
    {
      name: "Sydney Opera House",
      description: "Iconic sail-shaped performing arts center and UNESCO World Heritage Site hosting 1,500 performances annually.",
      nameHe: "בית האופרה של סידני",
      descriptionHe: "מרכז אמנויות הבמה האייקוני בצורת מפרש ואתר מורשת עולמית של אונסק\"ו המארח 1,500 הופעות בשנה.",
      lat: "-33.8568",
      lon: "151.2153",
      rating: "4.7",
      tags: ["theater", "landmark", "cultural"]
    },
    {
      name: "Sydney Harbour Bridge",
      description: "Steel arch bridge offering BridgeClimb experiences and connecting the CBD with North Shore.",
      nameHe: "גשר נמל סידני",
      descriptionHe: "גשר קשת פלדה המציע חוויות טיפוס גשר ומחבר את מרכז העסקים לחוף הצפוני.",
      lat: "-33.8523",
      lon: "151.2108",
      rating: "4.7",
      tags: ["bridge", "landmark", "viewpoint"]
    },
    {
      name: "Bondi Beach",
      description: "World-famous crescent-shaped beach offering surfing, coastal walks, and vibrant beach culture.",
      nameHe: "חוף בונדי",
      descriptionHe: "חוף מפורסם עולמית בצורת חצי סהר המציע גלישה, הליכות חוף ותרבות חוף תוססת.",
      lat: "-33.8915",
      lon: "151.2767",
      rating: "4.6",
      tags: ["beach", "surfing", "nature"]
    }
  ],
  "Bangkok": [
    {
      name: "Grand Palace",
      description: "Ornate royal complex built in 1782 featuring the revered Emerald Buddha and stunning Thai architecture.",
      nameHe: "הארמון הגדול",
      descriptionHe: "מתחם מלכותי מעוטר שנבנה ב-1782 המציג את הבודהה האזמרגד המוערך ואדריכלות תאילנדית מדהימה.",
      lat: "13.7500",
      lon: "100.4917",
      rating: "4.6",
      tags: ["palace", "temple", "cultural"]
    },
    {
      name: "Wat Arun",
      description: "Riverside Temple of Dawn featuring an iconic 79-meter spire decorated with colorful porcelain.",
      nameHe: "ואט ארון",
      descriptionHe: "מקדש השחר על הנהר המציג צריח אייקוני בגובה 79 מטר המעוטר בחרסינה צבעונית.",
      lat: "13.7437",
      lon: "100.4889",
      rating: "4.5",
      tags: ["temple", "cultural", "riverside"]
    },
    {
      name: "Chatuchak Weekend Market",
      description: "Massive 35-acre market with over 15,000 stalls selling everything from clothes to antiques and street food.",
      nameHe: "שוק סופ\"ש צ'אטוצ'ק",
      descriptionHe: "שוק ענק בשטח 35 דונם עם למעלה מ-15,000 דוכנים המוכרים הכל מבגדים לעתיקות ואוכל רחוב.",
      lat: "13.7997",
      lon: "100.5500",
      rating: "4.5",
      tags: ["market", "shopping", "food"]
    }
  ]
};

async function populateAttractions() {
  console.log("🚀 Starting attractions population...");

  try {
    // Get all destinations from database
    const allDestinations = await db.select().from(destinations);
    console.log(`📍 Found ${allDestinations.length} destinations in database`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const destination of allDestinations) {
      const destAttractions = attractionsData[destination.name];

      if (!destAttractions) {
        console.log(`⏭️  Skipping ${destination.name} - no attraction data defined`);
        skippedCount++;
        continue;
      }

      console.log(`\n📍 Processing ${destination.name}...`);

      for (const attr of destAttractions) {
        // Check if attraction already exists
        const existing = await db.select().from(attractions).where(eq(attractions.name, attr.name)).limit(1);

        if (existing.length > 0) {
          console.log(`  ⏭️  ${attr.name} already exists, skipping...`);
          continue;
        }

        // Insert attraction
        const [inserted] = await db.insert(attractions).values({
          destinationId: destination.id,
          name: attr.name,
          description: attr.description,
          lat: attr.lat,
          lon: attr.lon,
          rating: attr.rating,
          tags: attr.tags,
          source: "manual",
          externalId: `manual_${destination.name}_${attr.name}`.toLowerCase().replace(/\s+/g, '_'),
        }).returning();

        console.log(`  ✅ Added: ${attr.name}`);

        // Insert English translation
        await db.insert(attractionsI18n).values({
          attractionId: inserted.id,
          locale: "en",
          name: attr.name,
          description: attr.description,
          nameLc: attr.name.toLowerCase(),
          descriptionLc: attr.description.toLowerCase(),
        });

        // Insert Hebrew translation
        await db.insert(attractionsI18n).values({
          attractionId: inserted.id,
          locale: "he",
          name: attr.nameHe,
          description: attr.descriptionHe,
          nameLc: attr.nameHe,
          descriptionLc: attr.descriptionHe,
        });

        console.log(`  🌐 Added translations (en/he)`);
        addedCount++;
      }
    }

    console.log(`\n✅ Population complete!`);
    console.log(`   Added: ${addedCount} attractions`);
    console.log(`   Skipped: ${skippedCount} destinations (no data)`);
    console.log(`   Total destinations: ${allDestinations.length}`);

  } catch (error) {
    console.error("❌ Error populating attractions:", error);
    throw error;
  }
}

// Run the script
populateAttractions()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
