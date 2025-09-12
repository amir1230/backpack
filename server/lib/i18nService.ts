import { db } from '../db.js';
import { 
  destinations, accommodations, attractions, restaurants,
  destinationsI18n, accommodationsI18n, attractionsI18n, restaurantsI18n,
  type DestinationI18n, type AccommodationI18n, type AttractionI18n, type RestaurantI18n,
  type InsertDestinationI18n, type InsertAccommodationI18n, type InsertAttractionI18n, type InsertRestaurantI18n
} from '../../shared/schema.js';
import { eq, and, sql, ilike, or } from 'drizzle-orm';

export type EntityType = 'destinations' | 'accommodations' | 'attractions' | 'restaurants';
export type Locale = 'en' | 'he';

/**
 * Service for managing i18n translations with admin-level access
 * Uses service-role level permissions for safe database operations
 */
export class I18nService {
  
  /**
   * Get all entities of a specific type with their translations
   */
  static async getEntitiesWithTranslations(entityType: EntityType, locale: Locale, search?: string) {
    try {
      let baseQuery, i18nQuery, baseTable, i18nTable, idColumn;

      switch (entityType) {
        case 'destinations':
          baseTable = destinations;
          i18nTable = destinationsI18n;
          idColumn = 'destinationId';
          break;
        case 'accommodations':
          baseTable = accommodations;
          i18nTable = accommodationsI18n;
          idColumn = 'accommodationId';
          break;
        case 'attractions':
          baseTable = attractions;
          i18nTable = attractionsI18n;
          idColumn = 'attractionId';
          break;
        case 'restaurants':
          baseTable = restaurants;
          i18nTable = restaurantsI18n;
          idColumn = 'restaurantId';
          break;
        default:
          throw new Error(`Invalid entity type: ${entityType}`);
      }

      // Build search condition if provided
      const searchCondition = search 
        ? or(
            ilike(baseTable.name, `%${search}%`),
            ilike(i18nTable.name, `%${search}%`)
          )
        : undefined;

      // Get base entities with their translations
      const results = await db
        .select({
          id: baseTable.id,
          locationId: baseTable.locationId,
          baseName: baseTable.name,
          baseDescription: sql<string>`NULL`.as('baseDescription'), // Most base tables don't have description
          translatedName: i18nTable.name,
          translatedDescription: i18nTable.description,
          locale: i18nTable.locale,
          translationId: i18nTable.id,
          country: sql<string>`${baseTable.country}`.as('country'),
          city: sql<string>`${baseTable.city}`.as('city'),
          rating: sql<number>`${baseTable.rating}`.as('rating'),
        })
        .from(baseTable)
        .leftJoin(i18nTable, and(
          eq(i18nTable[idColumn as keyof typeof i18nTable], baseTable.id),
          eq(i18nTable.locale, locale)
        ))
        .where(searchCondition)
        .orderBy(baseTable.name)
        .limit(100);

      return results;
    } catch (error) {
      console.error(`Error fetching ${entityType} with translations:`, error);
      throw new Error(`Failed to fetch ${entityType}`);
    }
  }

  /**
   * Save or update translation for an entity
   */
  static async saveTranslation(
    entityType: EntityType,
    entityId: number,
    locale: Locale,
    name?: string,
    description?: string
  ) {
    try {
      let i18nTable, idColumn, insertData, updateData;

      switch (entityType) {
        case 'destinations':
          i18nTable = destinationsI18n;
          idColumn = 'destinationId';
          insertData = { destinationId: entityId, locale, name, description } as InsertDestinationI18n;
          updateData = { name, description, updatedAt: new Date() };
          break;
        case 'accommodations':
          i18nTable = accommodationsI18n;
          idColumn = 'accommodationId';
          insertData = { accommodationId: entityId, locale, name, description } as InsertAccommodationI18n;
          updateData = { name, description, updatedAt: new Date() };
          break;
        case 'attractions':
          i18nTable = attractionsI18n;
          idColumn = 'attractionId';
          insertData = { attractionId: entityId, locale, name, description } as InsertAttractionI18n;
          updateData = { name, description, updatedAt: new Date() };
          break;
        case 'restaurants':
          i18nTable = restaurantsI18n;
          idColumn = 'restaurantId';
          insertData = { restaurantId: entityId, locale, name, description } as InsertRestaurantI18n;
          updateData = { name, description, updatedAt: new Date() };
          break;
        default:
          throw new Error(`Invalid entity type: ${entityType}`);
      }

      // Check if translation already exists
      const existing = await db
        .select()
        .from(i18nTable)
        .where(and(
          eq(i18nTable[idColumn as keyof typeof i18nTable], entityId),
          eq(i18nTable.locale, locale)
        ))
        .limit(1);

      let result;
      if (existing.length > 0) {
        // Update existing translation
        result = await db
          .update(i18nTable)
          .set(updateData)
          .where(and(
            eq(i18nTable[idColumn as keyof typeof i18nTable], entityId),
            eq(i18nTable.locale, locale)
          ))
          .returning();
      } else {
        // Insert new translation
        result = await db
          .insert(i18nTable)
          .values(insertData)
          .returning();
      }

      return result[0];
    } catch (error) {
      console.error(`Error saving translation for ${entityType}:`, error);
      throw new Error(`Failed to save translation`);
    }
  }

  /**
   * Delete translation for an entity
   */
  static async deleteTranslation(entityType: EntityType, entityId: number, locale: Locale) {
    try {
      let i18nTable, idColumn;

      switch (entityType) {
        case 'destinations':
          i18nTable = destinationsI18n;
          idColumn = 'destinationId';
          break;
        case 'accommodations':
          i18nTable = accommodationsI18n;
          idColumn = 'accommodationId';
          break;
        case 'attractions':
          i18nTable = attractionsI18n;
          idColumn = 'attractionId';
          break;
        case 'restaurants':
          i18nTable = restaurantsI18n;
          idColumn = 'restaurantId';
          break;
        default:
          throw new Error(`Invalid entity type: ${entityType}`);
      }

      const result = await db
        .delete(i18nTable)
        .where(and(
          eq(i18nTable[idColumn as keyof typeof i18nTable], entityId),
          eq(i18nTable.locale, locale)
        ))
        .returning();

      return result[0];
    } catch (error) {
      console.error(`Error deleting translation for ${entityType}:`, error);
      throw new Error(`Failed to delete translation`);
    }
  }

  /**
   * Search across all entities with localized content
   */
  static async searchLocalized(query: string, locale: Locale, entityTypes?: EntityType[]) {
    const searchTypes = entityTypes || ['destinations', 'accommodations', 'attractions', 'restaurants'];
    const results: any[] = [];

    for (const entityType of searchTypes) {
      try {
        const entityResults = await this.getEntitiesWithTranslations(entityType, locale, query);
        results.push(...entityResults.map(item => ({
          ...item,
          entityType,
          matchType: 'name_match' // Could be enhanced to show what matched
        })));
      } catch (error) {
        console.error(`Error searching ${entityType}:`, error);
        // Continue with other entity types
      }
    }

    // Sort by relevance (exact matches first, then partial matches)
    return results
      .sort((a: any, b: any) => {
        const aExact = a.translatedName?.toLowerCase() === query.toLowerCase() || 
                      a.baseName?.toLowerCase() === query.toLowerCase();
        const bExact = b.translatedName?.toLowerCase() === query.toLowerCase() || 
                      b.baseName?.toLowerCase() === query.toLowerCase();
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      })
      .slice(0, 20); // Top 20 results
  }

  /**
   * Get translation statistics
   */
  static async getTranslationStats(locale: Locale) {
    try {
      const stats = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(destinations),
        db.select({ count: sql<number>`count(*)` }).from(destinationsI18n).where(eq(destinationsI18n.locale, locale)),
        db.select({ count: sql<number>`count(*)` }).from(accommodations),
        db.select({ count: sql<number>`count(*)` }).from(accommodationsI18n).where(eq(accommodationsI18n.locale, locale)),
        db.select({ count: sql<number>`count(*)` }).from(attractions),
        db.select({ count: sql<number>`count(*)` }).from(attractionsI18n).where(eq(attractionsI18n.locale, locale)),
        db.select({ count: sql<number>`count(*)` }).from(restaurants),
        db.select({ count: sql<number>`count(*)` }).from(restaurantsI18n).where(eq(restaurantsI18n.locale, locale)),
      ]);

      return {
        destinations: { total: stats[0][0].count, translated: stats[1][0].count },
        accommodations: { total: stats[2][0].count, translated: stats[3][0].count },
        attractions: { total: stats[4][0].count, translated: stats[5][0].count },
        restaurants: { total: stats[6][0].count, translated: stats[7][0].count },
      };
    } catch (error) {
      console.error('Error getting translation stats:', error);
      throw new Error('Failed to get translation statistics');
    }
  }
}