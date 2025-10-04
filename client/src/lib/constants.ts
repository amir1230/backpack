// Global Countries for destination selection (organized by popularity and region)
export const WORLD_COUNTRIES = [
  // Europe
  "France",
  "Italy",
  "Spain",
  "United Kingdom",
  "Germany",
  "Greece",
  "Portugal",
  "Netherlands",
  "Switzerland",
  "Austria",
  "Czech Republic",
  "Poland",
  "Ireland",
  "Croatia",
  "Iceland",
  "Norway",
  "Sweden",
  "Denmark",
  "Belgium",
  "Hungary",
  
  // Asia
  "Japan",
  "Thailand",
  "China",
  "South Korea",
  "Vietnam",
  "Indonesia",
  "Singapore",
  "Malaysia",
  "Philippines",
  "India",
  "United Arab Emirates",
  "Turkey",
  "Israel",
  "Jordan",
  "Sri Lanka",
  "Cambodia",
  "Nepal",
  "Maldives",
  
  // North America
  "United States",
  "Canada",
  "Mexico",
  "Costa Rica",
  "Panama",
  
  // South America
  "Brazil",
  "Argentina",
  "Peru",
  "Chile",
  "Colombia",
  "Ecuador",
  "Bolivia",
  "Uruguay",
  "Venezuela",
  "Paraguay",
  "Guyana",
  "Suriname",
  
  // Oceania
  "Australia",
  "New Zealand",
  "Fiji",
  
  // Africa
  "South Africa",
  "Morocco",
  "Egypt",
  "Kenya",
  "Tanzania",
  "Tunisia",
  "Mauritius",
  
  // Caribbean
  "Dominican Republic",
  "Jamaica",
  "Cuba",
  "Bahamas"
] as const;

export type WorldCountry = typeof WORLD_COUNTRIES[number];

// Legacy export for backward compatibility - kept as literal tuple for type safety
export const SOUTH_AMERICAN_COUNTRIES = [
  "Brazil",
  "Argentina",
  "Peru",
  "Chile",
  "Colombia",
  "Ecuador",
  "Bolivia",
  "Uruguay",
  "Venezuela",
  "Paraguay",
  "Guyana",
  "Suriname"
] as const;

export type SouthAmericanCountry = typeof SOUTH_AMERICAN_COUNTRIES[number];