// South American Countries for destination selection
export const SOUTH_AMERICAN_COUNTRIES = [
  "Argentina",
  "Bolivia", 
  "Brazil",
  "Chile",
  "Colombia",
  "Ecuador",
  "Guyana",
  "Paraguay",
  "Peru",
  "Suriname",
  "Uruguay",
  "Venezuela"
] as const;

export type SouthAmericanCountry = typeof SOUTH_AMERICAN_COUNTRIES[number];