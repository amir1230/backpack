export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  cityHe?: string;
  nameHe?: string;
  countryHe?: string;
}

export const airports: Airport[] = [
  // Israel
  { code: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", cityHe: "תל אביב", nameHe: "נתב\"ג", countryHe: "ישראל" },
  { code: "ETM", name: "Ramon Airport", city: "Eilat", country: "Israel", cityHe: "אילת", nameHe: "שדה רמון", countryHe: "ישראל" },
  
  // Greece
  { code: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece", cityHe: "אתונה", nameHe: "נתב\"ג אתונה", countryHe: "יוון" },
  { code: "SKG", name: "Thessaloniki Airport", city: "Thessaloniki", country: "Greece", cityHe: "סלוניקי", nameHe: "שדה סלוניקי", countryHe: "יוון" },
  { code: "HER", name: "Heraklion Airport", city: "Heraklion", country: "Greece", cityHe: "הרקליון", nameHe: "שדה הרקליון", countryHe: "יוון" },
  
  // Europe - Major Cities
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", cityHe: "לונדון", nameHe: "נמל התעופה הית'רו", countryHe: "בריטניה" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", cityHe: "פריז", nameHe: "שארל דה גול", countryHe: "צרפת" },
  { code: "FCO", name: "Fiumicino Airport", city: "Rome", country: "Italy", cityHe: "רומא", nameHe: "פיומיצ'ינו", countryHe: "איטליה" },
  { code: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain", cityHe: "מדריד", nameHe: "מדריד-בראחאס", countryHe: "ספרד" },
  { code: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "Spain", cityHe: "ברצלונה", nameHe: "אל פראט", countryHe: "ספרד" },
  { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", cityHe: "אמסטרדם", nameHe: "סכיפהול", countryHe: "הולנד" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", cityHe: "פרנקפורט", nameHe: "פרנקפורט", countryHe: "גרמניה" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany", cityHe: "מינכן", nameHe: "מינכן", countryHe: "גרמניה" },
  { code: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", cityHe: "וינה", nameHe: "וינה", countryHe: "אוסטריה" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", cityHe: "ציריך", nameHe: "ציריך", countryHe: "שווייץ" },
  { code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium", cityHe: "בריסל", nameHe: "בריסל", countryHe: "בלגיה" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", cityHe: "קופנהגן", nameHe: "קופנהגן", countryHe: "דנמרק" },
  { code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", cityHe: "שטוקהולם", nameHe: "ארלנדה", countryHe: "שבדיה" },
  { code: "OSL", name: "Oslo Airport", city: "Oslo", country: "Norway", cityHe: "אוסלו", nameHe: "אוסלו", countryHe: "נורווגיה" },
  { code: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland", cityHe: "הלסינקי", nameHe: "ונטה", countryHe: "פינלנד" },
  { code: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", cityHe: "ורשה", nameHe: "שופן", countryHe: "פולין" },
  { code: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic", cityHe: "פראג", nameHe: "פראג", countryHe: "צ'כיה" },
  { code: "BUD", name: "Budapest Ferenc Liszt Airport", city: "Budapest", country: "Hungary", cityHe: "בודפשט", nameHe: "בודפשט", countryHe: "הונגריה" },
  { code: "LIS", name: "Lisbon Portela Airport", city: "Lisbon", country: "Portugal", cityHe: "ליסבון", nameHe: "פורטלה", countryHe: "פורטוגל" },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland", cityHe: "דבלין", nameHe: "דבלין", countryHe: "אירלנד" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", cityHe: "איסטנבול", nameHe: "איסטנבול", countryHe: "טורקיה" },
  
  // USA
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", cityHe: "ניו יורק", nameHe: "ג'ון קנדי", countryHe: "ארה\"ב" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", cityHe: "לוס אנג'לס", nameHe: "לוס אנג'לס", countryHe: "ארה\"ב" },
  { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "USA", cityHe: "שיקגו", nameHe: "או'הייר", countryHe: "ארה\"ב" },
  { code: "MIA", name: "Miami International Airport", city: "Miami", country: "USA", cityHe: "מיאמי", nameHe: "מיאמי", countryHe: "ארה\"ב" },
  { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "USA", cityHe: "סן פרנסיסקו", nameHe: "סן פרנסיסקו", countryHe: "ארה\"ב" },
  { code: "LAS", name: "Las Vegas McCarran International Airport", city: "Las Vegas", country: "USA", cityHe: "לאס וגאס", nameHe: "מקארן", countryHe: "ארה\"ב" },
  { code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "USA", cityHe: "סיאטל", nameHe: "טאקומה", countryHe: "ארה\"ב" },
  { code: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "USA", cityHe: "בוסטון", nameHe: "לוגן", countryHe: "ארה\"ב" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta Airport", city: "Atlanta", country: "USA", cityHe: "אטלנטה", nameHe: "הרטספילד-ג'קסון", countryHe: "ארה\"ב" },
  { code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "USA", cityHe: "דאלאס", nameHe: "דאלאס/פורט וורת'", countryHe: "ארה\"ב" },
  
  // Asia
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", cityHe: "דובאי", nameHe: "דובאי", countryHe: "איחוד האמירויות" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", cityHe: "הונג קונג", nameHe: "הונג קונג", countryHe: "הונג קונג" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", cityHe: "סינגפור", nameHe: "צ'אנגי", countryHe: "סינגפור" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", cityHe: "טוקיו", nameHe: "נאריטה", countryHe: "יפן" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", cityHe: "סיאול", nameHe: "אינצ'ון", countryHe: "דרום קוריאה" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", cityHe: "בנגקוק", nameHe: "סווארנאבהומי", countryHe: "תאילנד" },
  { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India", cityHe: "דלהי", nameHe: "אינדירה גנדי", countryHe: "הודו" },
  { code: "BOM", name: "Chhatrapati Shivaji Airport", city: "Mumbai", country: "India", cityHe: "מומבאי", nameHe: "צ'אטרפטי שיוואג'י", countryHe: "הודו" },
  { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", cityHe: "בייג'ין", nameHe: "בייג'ין", countryHe: "סין" },
  { code: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", cityHe: "שנחאי", nameHe: "פודונג", countryHe: "סין" },
  
  // Australia & New Zealand
  { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", cityHe: "סידני", nameHe: "קינגספורד סמית'", countryHe: "אוסטרליה" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", cityHe: "מלבורן", nameHe: "מלבורן", countryHe: "אוסטרליה" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", cityHe: "אוקלנד", nameHe: "אוקלנד", countryHe: "ניו זילנד" },
  
  // Middle East
  { code: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", cityHe: "קהיר", nameHe: "קהיר", countryHe: "מצרים" },
  { code: "AMM", name: "Queen Alia International Airport", city: "Amman", country: "Jordan", cityHe: "עמאן", nameHe: "המלכה עליה", countryHe: "ירדן" },
  { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", cityHe: "דוחה", nameHe: "חמד", countryHe: "קטאר" },
  { code: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "UAE", cityHe: "אבו דאבי", nameHe: "אבו דאבי", countryHe: "איחוד האמירויות" },
  
  // South America
  { code: "GRU", name: "São Paulo/Guarulhos Airport", city: "São Paulo", country: "Brazil", cityHe: "סאו פאולו", nameHe: "גוארולוס", countryHe: "ברזיל" },
  { code: "EZE", name: "Ministro Pistarini Airport", city: "Buenos Aires", country: "Argentina", cityHe: "בואנוס איירס", nameHe: "פיסטריני", countryHe: "ארגנטינה" },
  { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", cityHe: "בוגוטה", nameHe: "אל דוראדו", countryHe: "קולומביה" },
  { code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", cityHe: "לימה", nameHe: "חורחה צ'אבז", countryHe: "פרו" },
  
  // Canada
  { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", cityHe: "טורונטו", nameHe: "פירסון", countryHe: "קנדה" },
  { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", cityHe: "ונקובר", nameHe: "ונקובר", countryHe: "קנדה" },
  { code: "YUL", name: "Montréal-Pierre Elliott Trudeau Airport", city: "Montreal", country: "Canada", cityHe: "מונטריאול", nameHe: "טרודו", countryHe: "קנדה" },
  
  // Africa
  { code: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "South Africa", cityHe: "יוהנסבורג", nameHe: "טמבו", countryHe: "דרום אפריקה" },
  { code: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", cityHe: "קייפטאון", nameHe: "קייפטאון", countryHe: "דרום אפריקה" },
  { code: "ADD", name: "Addis Ababa Bole Airport", city: "Addis Ababa", country: "Ethiopia", cityHe: "אדיס אבבה", nameHe: "בולה", countryHe: "אתיופיה" },
];
