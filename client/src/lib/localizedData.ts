import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from './supabase.js';

// Types for localized data
export interface LocalizedPlace {
  id: number;
  locationId: string;
  name: string;
  nameLocalized: string;
  lat?: number;
  lon?: number;
  city?: string;
  country: string;
  rating?: number;
  numReviews?: number;
  priceLevel?: string;
  category?: string;
  categoryLocalized?: string;
  // Entity-specific fields
  cuisine?: string[];
  cuisineLocalized?: string[];
  amenities?: string[];
  attractionTypes?: string[];
}

// Unified localized data fetcher
export async function getLocalized(entity: 'destinations' | 'accommodations' | 'attractions' | 'restaurants', locale: string = 'en'): Promise<LocalizedPlace[]> {
  try {
    // Map entity to RPC function name
    const rpcFunction = `get_${entity}_localized`;
    
    const { data, error } = await supabase.rpc(rpcFunction, { p_locale: locale });
    
    if (error) {
      console.error(`Error fetching localized ${entity}:`, error);
      // Fallback to direct table query if RPC fails
      return await getLocalizedFallback(entity, locale);
    }
    
    return data?.map((item: any) => ({
      id: item.id,
      locationId: item.location_id,
      name: item.name,
      nameLocalized: item.name_localized || item.name,
      lat: item.lat ? parseFloat(item.lat) : undefined,
      lon: item.lon ? parseFloat(item.lon) : undefined,
      city: item.city,
      country: item.country,
      rating: item.rating ? parseFloat(item.rating) : undefined,
      numReviews: item.num_reviews,
      priceLevel: item.price_level,
      category: item.category,
      categoryLocalized: item.category_localized || item.category,
      cuisine: item.cuisine,
      cuisineLocalized: item.cuisine_localized || item.cuisine,
      amenities: item.amenities,
      attractionTypes: item.attraction_types,
    })) || [];
  } catch (error) {
    console.error(`Error in getLocalized for ${entity}:`, error);
    return await getLocalizedFallback(entity, locale);
  }
}

// Fallback function for when RPC functions are not available
async function getLocalizedFallback(entity: 'destinations' | 'accommodations' | 'attractions' | 'restaurants', locale: string): Promise<LocalizedPlace[]> {
  try {
    const { data, error } = await supabase.from(entity).select('*').order('name');
    
    if (error) {
      console.error(`Fallback error for ${entity}:`, error);
      return [];
    }
    
    return data?.map((item: any) => ({
      id: item.id,
      locationId: item.location_id || item.locationId,
      name: item.name,
      nameLocalized: localizeText(item.name, locale),
      lat: item.lat ? parseFloat(item.lat) : undefined,
      lon: item.lon ? parseFloat(item.lon) : undefined,
      city: item.city,
      country: item.country,
      rating: item.rating ? parseFloat(item.rating) : undefined,
      numReviews: item.num_reviews || item.numReviews,
      priceLevel: item.price_level || item.priceLevel,
      category: item.category,
      categoryLocalized: localizeCategory(item.category, locale),
      cuisine: item.cuisine,
      cuisineLocalized: localizeCuisine(item.cuisine, locale),
      amenities: item.amenities,
      attractionTypes: item.attraction_types || item.attractionTypes,
    })) || [];
  } catch (error) {
    console.error(`Fallback error for ${entity}:`, error);
    return [];
  }
}

// Helper functions for client-side localization
function localizeText(text: string, locale: string): string {
  // For now, return original text since we don't have translation data
  // This could be extended to use a translation service or mapping
  return text;
}

function localizeCategory(category: string, locale: string): string {
  if (locale !== 'he') return category;
  
  const categoryMap: Record<string, string> = {
    'hotel': 'מלון',
    'bed_and_breakfast': 'בית הארחה',
    'hostel': 'הוסטל',
    'apartment': 'דירה',
    'resort': 'אתר נופש',
    'restaurant': 'מסעדה',
    'cafe': 'בית קפה',
    'bar': 'בר',
    'fast_food': 'מזון מהיר',
    'food_truck': 'משאית אוכל',
    'attraction': 'אטרקציה',
    'museum': 'מוזיאון',
    'park': 'פארק',
    'landmark': 'נקודת ציון',
    'beach': 'חוף',
    'shopping': 'קניות',
    'entertainment': 'בידור',
  };
  
  return categoryMap[category] || category;
}

function localizeCuisine(cuisines: string[] | undefined, locale: string): string[] | undefined {
  if (!cuisines || locale !== 'he') return cuisines;
  
  const cuisineMap: Record<string, string> = {
    'italian': 'איטלקית',
    'mexican': 'מקסיקנית',
    'chinese': 'סינית',
    'japanese': 'יפנית',
    'indian': 'הודית',
    'thai': 'תאילנדית',
    'french': 'צרפתית',
    'american': 'אמריקנית',
    'mediterranean': 'ים תיכונית',
    'seafood': 'פירות ים',
    'vegetarian': 'צמחונית',
    'vegan': 'טבעונית',
    'bbq': 'ברביקיו',
    'pizza': 'פיצה',
    'sushi': 'סושי',
  };
  
  return cuisines.map(cuisine => cuisineMap[cuisine.toLowerCase()] || cuisine);
}

// Custom hooks for localized data with automatic refetch on language change
export function useLocalizedDestinations() {
  const { i18n } = useTranslation();
  
  return useQuery({
    queryKey: ['destinations', 'localized', i18n.language],
    queryFn: () => getLocalized('destinations', i18n.language),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLocalizedAccommodations() {
  const { i18n } = useTranslation();
  
  return useQuery({
    queryKey: ['accommodations', 'localized', i18n.language],
    queryFn: () => getLocalized('accommodations', i18n.language),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLocalizedAttractions() {
  const { i18n } = useTranslation();
  
  return useQuery({
    queryKey: ['attractions', 'localized', i18n.language],
    queryFn: () => getLocalized('attractions', i18n.language),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLocalizedRestaurants() {
  const { i18n } = useTranslation();
  
  return useQuery({
    queryKey: ['restaurants', 'localized', i18n.language],
    queryFn: () => getLocalized('restaurants', i18n.language),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper function to invalidate all localized queries on language change
export function invalidateLocalizedQueries(queryClient: any) {
  queryClient.invalidateQueries({ queryKey: ['destinations', 'localized'] });
  queryClient.invalidateQueries({ queryKey: ['accommodations', 'localized'] });
  queryClient.invalidateQueries({ queryKey: ['attractions', 'localized'] });
  queryClient.invalidateQueries({ queryKey: ['restaurants', 'localized'] });
}