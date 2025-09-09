// server/itineraryService.ts - Data access layer for trip planning

import { eq, and, asc, desc } from 'drizzle-orm';
import { db } from './db.js';
import { itineraries, itineraryItems } from '@shared/schema.js';
import type { 
  Itinerary, 
  InsertItinerary, 
  ItineraryItem, 
  InsertItineraryItem 
} from '@shared/schema.js';
import { safeDbOperation } from './db-error-handler.js';

export interface TripSuggestion {
  destination: string;
  country: string;
  description: string;
  bestTimeToVisit: string;
  estimatedBudget: {
    low: number;
    high: number;
  };
  highlights: string[];
  travelStyle: string[];
  duration: string;
  realPlaces?: RealPlace[];
}

interface RealPlace {
  title: string;
  link?: string;
  source?: "Google" | "GetYourGuide" | "TripAdvisor";
  placeId?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
}

export interface SavedTripWithItems extends Itinerary {
  items: ItineraryItem[];
  itemCount: number;
  dayCount: number;
}

export class ItineraryService {
  // Get all saved trips for a user
  async getUserItineraries(userId: string): Promise<{ data: SavedTripWithItems[] | null; error: any }> {
    return await safeDbOperation(async () => {
      const trips = await db
        .select()
        .from(itineraries)
        .where(eq(itineraries.userId, userId))
        .orderBy(desc(itineraries.updatedAt));

      // Get item counts for each trip
      const tripsWithCounts = await Promise.all(
        trips.map(async (trip) => {
          const items = await db
            .select()
            .from(itineraryItems)
            .where(eq(itineraryItems.itineraryId, trip.id))
            .orderBy(asc(itineraryItems.dayIndex), asc(itineraryItems.position));
          
          const dayCount = Math.max(...items.map(item => item.dayIndex), 0);
          
          return {
            ...trip,
            items,
            itemCount: items.length,
            dayCount
          };
        })
      );

      return tripsWithCounts;
    }, 'get-user-itineraries');
  }

  // Get a single itinerary with all its items
  async getItineraryById(itineraryId: string, userId: string): Promise<{ data: SavedTripWithItems | null; error: any }> {
    return await safeDbOperation(async () => {
      const [trip] = await db
        .select()
        .from(itineraries)
        .where(and(eq(itineraries.id, itineraryId), eq(itineraries.userId, userId)));

      if (!trip) return null;

      const items = await db
        .select()
        .from(itineraryItems)
        .where(eq(itineraryItems.itineraryId, itineraryId))
        .orderBy(asc(itineraryItems.dayIndex), asc(itineraryItems.position));

      const dayCount = Math.max(...items.map(item => item.dayIndex), 0);

      return {
        ...trip,
        items,
        itemCount: items.length,
        dayCount
      };
    }, 'get-itinerary-by-id');
  }

  // Save a suggested trip as a new itinerary
  async saveTrip(userId: string, suggestion: TripSuggestion): Promise<{ data: SavedTripWithItems | null; error: any }> {
    return await safeDbOperation(async () => {
      // Create the main itinerary
      const [newTrip] = await db
        .insert(itineraries)
        .values({
          userId,
          title: `${suggestion.destination}, ${suggestion.country}`,
          source: 'suggested',
          sourceRef: `suggestion_${Date.now()}`, // Simple unique ref
          planJson: suggestion // Store original suggestion for reference
        })
        .returning();

      // Convert suggestion to itinerary items
      const items: InsertItineraryItem[] = [];
      let dayIndex = 1;
      let position = 0;

      // Extract activities from highlights and real places
      if (suggestion.highlights?.length > 0) {
        suggestion.highlights.forEach((highlight, idx) => {
          items.push({
            itineraryId: newTrip.id,
            dayIndex: Math.floor(idx / 3) + 1, // 3 items per day roughly
            position: idx % 3,
            itemType: 'attraction',
            title: highlight,
            source: 'suggested',
            sourceRef: `highlight_${idx}`
          });
        });
      }

      // Add real places if available
      if (suggestion.realPlaces?.length > 0) {
        suggestion.realPlaces.forEach((place, idx) => {
          const type = this.inferItemType(place);
          items.push({
            itineraryId: newTrip.id,
            dayIndex: Math.floor((items.length + idx) / 3) + 1,
            position: (items.length + idx) % 3,
            itemType: type,
            title: place.title,
            refId: place.placeId,
            source: 'suggested',
            sourceRef: `real_place_${idx}`
          });
        });
      }

      // Insert all items
      let insertedItems: ItineraryItem[] = [];
      if (items.length > 0) {
        insertedItems = await db
          .insert(itineraryItems)
          .values(items)
          .returning();
      }

      return {
        ...newTrip,
        items: insertedItems,
        itemCount: insertedItems.length,
        dayCount: Math.max(...insertedItems.map(item => item.dayIndex), 0)
      };
    }, 'save-trip');
  }

  // Merge suggested trip into existing itinerary
  async mergeTrip(userId: string, existingTripId: string, suggestion: TripSuggestion): Promise<{ data: SavedTripWithItems | null; error: any }> {
    return await safeDbOperation(async () => {
      // Verify ownership
      const [existingTrip] = await db
        .select()
        .from(itineraries)
        .where(and(eq(itineraries.id, existingTripId), eq(itineraries.userId, userId)));

      if (!existingTrip) {
        throw new Error('Trip not found or access denied');
      }

      // Get existing items to find max day and position
      const existingItems = await db
        .select()
        .from(itineraryItems)
        .where(eq(itineraryItems.itineraryId, existingTripId));

      const maxDay = Math.max(...existingItems.map(item => item.dayIndex), 0);
      
      // Prepare new items starting from next day
      const items: InsertItineraryItem[] = [];
      let startDay = maxDay + 1;

      // Add highlights
      if (suggestion.highlights?.length > 0) {
        suggestion.highlights.forEach((highlight, idx) => {
          items.push({
            itineraryId: existingTripId,
            dayIndex: startDay + Math.floor(idx / 3),
            position: idx % 3,
            itemType: 'attraction',
            title: highlight,
            source: 'merged',
            sourceRef: `merged_${Date.now()}_highlight_${idx}`
          });
        });
      }

      // Add real places
      if (suggestion.realPlaces?.length > 0) {
        suggestion.realPlaces.forEach((place, idx) => {
          const type = this.inferItemType(place);
          items.push({
            itineraryId: existingTripId,
            dayIndex: startDay + Math.floor((items.length + idx) / 3),
            position: (items.length + idx) % 3,
            itemType: type,
            title: place.title,
            refId: place.placeId,
            source: 'merged',
            sourceRef: `merged_${Date.now()}_place_${idx}`
          });
        });
      }

      // Insert new items
      if (items.length > 0) {
        await db.insert(itineraryItems).values(items);
      }

      // Return updated trip
      return await this.getItineraryById(existingTripId, userId);
    }, 'merge-trip');
  }

  // Update itinerary item (position, day, time, notes)
  async updateItineraryItem(userId: string, itemId: string, updates: Partial<ItineraryItem>): Promise<{ data: ItineraryItem | null; error: any }> {
    return await safeDbOperation(async () => {
      // Verify ownership through itinerary
      const [existingItem] = await db
        .select({ 
          item: itineraryItems,
          itinerary: itineraries
        })
        .from(itineraryItems)
        .innerJoin(itineraries, eq(itineraryItems.itineraryId, itineraries.id))
        .where(and(
          eq(itineraryItems.id, itemId),
          eq(itineraries.userId, userId)
        ));

      if (!existingItem) {
        throw new Error('Item not found or access denied');
      }

      const [updatedItem] = await db
        .update(itineraryItems)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(itineraryItems.id, itemId))
        .returning();

      return updatedItem;
    }, 'update-itinerary-item');
  }

  // Delete itinerary item
  async deleteItineraryItem(userId: string, itemId: string): Promise<{ data: boolean; error: any }> {
    return await safeDbOperation(async () => {
      // Verify ownership through itinerary
      const [existingItem] = await db
        .select({ 
          item: itineraryItems,
          itinerary: itineraries
        })
        .from(itineraryItems)
        .innerJoin(itineraries, eq(itineraryItems.itineraryId, itineraries.id))
        .where(and(
          eq(itineraryItems.id, itemId),
          eq(itineraries.userId, userId)
        ));

      if (!existingItem) {
        throw new Error('Item not found or access denied');
      }

      await db.delete(itineraryItems).where(eq(itineraryItems.id, itemId));
      return true;
    }, 'delete-itinerary-item');
  }

  // Rename itinerary
  async renameItinerary(userId: string, itineraryId: string, newTitle: string): Promise<{ data: Itinerary | null; error: any }> {
    return await safeDbOperation(async () => {
      const [updatedTrip] = await db
        .update(itineraries)
        .set({ 
          title: newTitle,
          updatedAt: new Date()
        })
        .where(and(eq(itineraries.id, itineraryId), eq(itineraries.userId, userId)))
        .returning();

      if (!updatedTrip) {
        throw new Error('Trip not found or access denied');
      }

      return updatedTrip;
    }, 'rename-itinerary');
  }

  // Delete itinerary
  async deleteItinerary(userId: string, itineraryId: string): Promise<{ data: boolean; error: any }> {
    return await safeDbOperation(async () => {
      const result = await db
        .delete(itineraries)
        .where(and(eq(itineraries.id, itineraryId), eq(itineraries.userId, userId)))
        .returning();

      return result.length > 0;
    }, 'delete-itinerary');
  }

  // Helper to infer item type from real place data
  private inferItemType(place: RealPlace): 'attraction' | 'restaurant' | 'accommodation' | 'transport' | 'other' {
    const title = place.title.toLowerCase();
    
    if (title.includes('hotel') || title.includes('hostel') || title.includes('resort') || title.includes('lodge')) {
      return 'accommodation';
    }
    if (title.includes('restaurant') || title.includes('cafe') || title.includes('bar') || title.includes('food')) {
      return 'restaurant';
    }
    if (title.includes('airport') || title.includes('bus') || title.includes('train') || title.includes('transport')) {
      return 'transport';
    }
    
    return 'attraction'; // Default for museums, parks, landmarks, etc.
  }
}

export const itineraryService = new ItineraryService();