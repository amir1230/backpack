import { DatabaseStorage } from '../../storage.js';
import { LocationPhoto, InsertLocationPhoto } from '../../../shared/schema.js';
import { GooglePlacesAdapter } from './adapters/googlePlacesAdapter.js';
import { UnsplashAdapter } from './adapters/unsplashAdapter.js';
import { WikimediaAdapter } from './adapters/wikimediaAdapter.js';
import { PexelsAdapter } from './adapters/pexelsAdapter.js';
import { uploadFile, getFileUrl, ensureBucketExists } from '../../supabase.js';
import { nanoid } from 'nanoid';

interface FallbackOptions {
  entityType: string; // 'destination', 'attraction', 'restaurant', 'accommodation'
  entityId: string; // UUID of the entity
  entityName: string; // Name for search queries
  country?: string; // Country for better search results
  photoReference?: string; // Google Places photo_reference if available
  forceRefresh?: boolean; // Force refresh cache
}

interface FallbackResult {
  url: string;
  source: string;
  attribution?: string;
  cached: boolean;
}

/**
 * MediaOrchestrator manages the three-tier image fallback system:
 * 1. Check database cache first
 * 2. Try Google Places (if photo_reference available)
 * 3. Try Unsplash (with rate limiting)
 * 4. Try Wikimedia Commons (free, unlimited)
 * 5. Fallback to Pexels if all else fails
 * 
 * All successful fetches are cached in location_photos table.
 */
export class MediaOrchestrator {
  private storage: DatabaseStorage;
  private googlePlaces: GooglePlacesAdapter;
  private unsplash: UnsplashAdapter;
  private wikimedia: WikimediaAdapter;
  private pexels: PexelsAdapter;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
    this.googlePlaces = new GooglePlacesAdapter();
    this.unsplash = new UnsplashAdapter();
    this.wikimedia = new WikimediaAdapter();
    this.pexels = new PexelsAdapter();
    
    // Ensure location-photos bucket exists
    ensureBucketExists('location-photos').catch(err => 
      console.error('Failed to ensure location-photos bucket:', err)
    );
  }

  /**
   * Upload image buffer to Supabase Storage and return public URL
   */
  private async uploadImageToStorage(
    buffer: Buffer,
    contentType: string,
    source: string,
    entityType: string,
    entityId: string
  ): Promise<string> {
    // Generate unique filename
    const extension = contentType.split('/')[1] || 'jpg';
    const fileName = `${entityType}/${entityId}/${source}-${nanoid()}.${extension}`;
    
    // Upload to Supabase Storage
    await uploadFile('location-photos', fileName, buffer, contentType);
    
    // Get public URL
    const publicUrl = await getFileUrl('location-photos', fileName);
    
    return publicUrl;
  }

  /**
   * Get a photo for a location with intelligent fallback
   */
  async getLocationPhoto(options: FallbackOptions): Promise<FallbackResult> {
    const { entityType, entityId, entityName, country, photoReference, forceRefresh } = options;

    // Step 1: Check cache unless force refresh
    if (!forceRefresh) {
      const cachedPhoto = await this.storage.getPrimaryLocationPhoto(entityType, entityId);
      if (cachedPhoto && cachedPhoto.cachedUrl) {
        return {
          url: cachedPhoto.cachedUrl,
          source: cachedPhoto.source,
          attribution: cachedPhoto.attribution || undefined,
          cached: true,
        };
      }
    }

    // Step 2: Try Google Places if photo_reference provided
    if (photoReference && this.googlePlaces.isEnabled()) {
      try {
        const result = await this.fetchFromGooglePlaces(photoReference, entityType, entityId, entityName);
        if (result) return result;
      } catch (error) {
        console.warn('Google Places fetch failed:', error);
      }
    }

    // Step 3: Try Unsplash (rate-limited)
    if (this.unsplash.isEnabled()) {
      try {
        const result = await this.fetchFromUnsplash(entityName, country, entityType, entityId);
        if (result) return result;
      } catch (error) {
        console.warn('Unsplash fetch failed:', error);
      }
    }

    // Step 4: Try Wikimedia Commons (free, unlimited)
    if (this.wikimedia.isEnabled()) {
      try {
        const result = await this.fetchFromWikimedia(entityName, country, entityType, entityId);
        if (result) return result;
      } catch (error) {
        console.warn('Wikimedia fetch failed:', error);
      }
    }

    // Step 5: Final fallback to Pexels
    if (this.pexels.isEnabled()) {
      try {
        const result = await this.fetchFromPexels(entityName, entityType, entityId);
        if (result) return result;
      } catch (error) {
        console.warn('Pexels fetch failed:', error);
      }
    }

    throw new Error(`No image source available for ${entityName}`);
  }

  private async fetchFromGooglePlaces(
    photoReference: string,
    entityType: string,
    entityId: string,
    entityName: string
  ): Promise<FallbackResult | null> {
    // Use GooglePlacesAdapter
    const imageResult = await this.googlePlaces.fetchImage({ ref: photoReference, maxwidth: 1920 });
    
    // Upload buffer to Supabase Storage
    const publicUrl = await this.uploadImageToStorage(
      imageResult.buffer,
      imageResult.contentType,
      'googleplaces',
      entityType,
      entityId
    );
    
    // Get attribution info
    const attribution = this.googlePlaces.getAttribution({});
    
    // Cache in database with Supabase Storage URL
    await this.cachePhoto({
      entityType,
      entityId,
      url: publicUrl,
      source: 'googleplaces',
      externalId: photoReference,
      sourceRef: photoReference,
      cachedUrl: publicUrl,
      attribution: attribution.attributionText || 'Google Places',
      isPrimary: true,
    });

    return {
      url: publicUrl,
      source: 'googleplaces',
      attribution: attribution.attributionText || 'Google Places',
      cached: false,
    };
  }

  private async fetchFromUnsplash(
    query: string,
    country: string | undefined,
    entityType: string,
    entityId: string
  ): Promise<FallbackResult | null> {
    // Build search query with country for better results
    const searchQuery = country ? `${query} ${country}` : query;
    
    // Use UnsplashAdapter which handles rate limiting
    const imageResult = await this.unsplash.fetchImage({ query: searchQuery, width: 1920 });
    
    // Upload buffer to Supabase Storage
    const publicUrl = await this.uploadImageToStorage(
      imageResult.buffer,
      imageResult.contentType,
      'unsplash',
      entityType,
      entityId
    );
    
    // Get attribution info
    const attribution = this.unsplash.getAttribution({});
    
    // Cache in database with Supabase Storage URL
    await this.cachePhoto({
      entityType,
      entityId,
      url: publicUrl,
      source: 'unsplash',
      externalId: nanoid(),
      sourceRef: searchQuery,
      cachedUrl: publicUrl,
      attribution: attribution.attributionText || 'Unsplash',
      isPrimary: true,
    });

    return {
      url: publicUrl,
      source: 'unsplash',
      attribution: attribution.attributionText || 'Unsplash',
      cached: false,
    };
  }

  private async fetchFromWikimedia(
    query: string,
    country: string | undefined,
    entityType: string,
    entityId: string
  ): Promise<FallbackResult | null> {
    const searchQuery = country ? `${query} ${country}` : query;
    
    // Use WikimediaAdapter
    const imageResult = await this.wikimedia.fetchImage({ query: searchQuery, width: 1920 });
    
    // Upload buffer to Supabase Storage
    const publicUrl = await this.uploadImageToStorage(
      imageResult.buffer,
      imageResult.contentType,
      'wikimedia',
      entityType,
      entityId
    );
    
    // Get attribution info
    const attribution = this.wikimedia.getAttribution({});
    
    // Cache in database with Supabase Storage URL
    await this.cachePhoto({
      entityType,
      entityId,
      url: publicUrl,
      source: 'wikimedia',
      externalId: nanoid(),
      sourceRef: searchQuery,
      cachedUrl: publicUrl,
      attribution: attribution.attributionText || 'Wikimedia Commons',
      license: attribution.license || 'Various CC licenses',
      isPrimary: true,
    });

    return {
      url: publicUrl,
      source: 'wikimedia',
      attribution: attribution.attributionText || 'Wikimedia Commons',
      cached: false,
    };
  }

  private async fetchFromPexels(
    query: string,
    entityType: string,
    entityId: string
  ): Promise<FallbackResult | null> {
    // Use PexelsAdapter
    const imageResult = await this.pexels.fetchImage({ query, size: 'large' });
    
    // Upload buffer to Supabase Storage
    const publicUrl = await this.uploadImageToStorage(
      imageResult.buffer,
      imageResult.contentType,
      'pexels',
      entityType,
      entityId
    );
    
    // Get attribution info
    const attribution = this.pexels.getAttribution({});
    
    // Cache in database with Supabase Storage URL
    await this.cachePhoto({
      entityType,
      entityId,
      url: publicUrl,
      source: 'pexels',
      externalId: nanoid(),
      sourceRef: query,
      cachedUrl: publicUrl,
      attribution: attribution.attributionText || 'Pexels',
      isPrimary: true,
    });

    return {
      url: publicUrl,
      source: 'pexels',
      attribution: attribution.attributionText || 'Pexels',
      cached: false,
    };
  }

  private async cachePhoto(photo: InsertLocationPhoto): Promise<void> {
    try {
      await this.storage.upsertLocationPhoto(photo);
    } catch (error) {
      console.error('Failed to cache photo:', error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  /**
   * Get rate limit status for Unsplash
   */
  getUnsplashRateLimit() {
    return this.unsplash.getRateLimitStatus();
  }
}
