import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

export class GooglePlacesAdapter implements MediaAdapter {
  private apiKey: string;
  private attributionsCache: Map<string, string[]> = new Map();

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  isEnabled(): boolean {
    return !!this.apiKey;
  }

  async fetchImage(params: { ref?: string; query?: string; maxwidth?: number; maxheight?: number }): Promise<ImageResult> {
    if (!this.isEnabled()) {
      throw new Error('Google Places Photos is not enabled');
    }

    const { ref, query, maxwidth = 1200, maxheight } = params;
    
    let photoReference = ref;
    
    // If query is provided, search for the place first
    if (query && !ref) {
      photoReference = await this.searchPlacePhoto(query);
      if (!photoReference) {
        throw new Error(`No photo found for place: ${query}`);
      }
    }
    
    if (!photoReference) {
      throw new Error('Either ref or query must be provided');
    }

    const urlParams = new URLSearchParams({
      photo_reference: photoReference,
      key: this.apiKey,
      ...(maxwidth && { maxwidth: maxwidth.toString() }),
      ...(maxheight && { maxheight: maxheight.toString() }),
    });

    const url = `https://maps.googleapis.com/maps/api/place/photo?${urlParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return {
      buffer,
      contentType,
      ttl: DEFAULT_TTL.long, // Cache longer for query-based searches
    };
  }
  
  private async searchPlacePhoto(query: string): Promise<string | null> {
    try {
      // Use Find Place API to get place_id
      const searchParams = new URLSearchParams({
        input: query,
        inputtype: 'textquery',
        fields: 'photos,place_id,name',
        key: this.apiKey,
      });
      
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${searchParams}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.status === 'OK' && searchData.candidates && searchData.candidates.length > 0) {
        const place = searchData.candidates[0];
        if (place.photos && place.photos.length > 0) {
          return place.photos[0].photo_reference;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error searching place photo:', error);
      return null;
    }
  }

  getAttribution(params: { ref: string; htmlAttributions?: string[] }): AttributionInfo {
    const { ref, htmlAttributions } = params;
    
    let attributionText = 'Google';
    let attributionUrl = '';

    if (htmlAttributions && htmlAttributions.length > 0) {
      const firstAttr = htmlAttributions[0];
      const urlMatch = firstAttr.match(/href="([^"]+)"/);
      const textMatch = firstAttr.match(/>([^<]+)</);
      
      if (textMatch) attributionText = textMatch[1];
      if (urlMatch) attributionUrl = urlMatch[1];
    }

    return {
      provider: 'Google Places',
      attributionText,
      attributionUrl,
      license: 'Google Maps Platform Terms'
    };
  }

  setHtmlAttributions(ref: string, attributions: string[]): void {
    this.attributionsCache.set(ref, attributions);
  }

  getHtmlAttributions(ref: string): string[] | undefined {
    return this.attributionsCache.get(ref);
  }
}
