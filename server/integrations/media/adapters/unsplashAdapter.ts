import { MediaAdapter, ImageResult, AttributionInfo, DEFAULT_TTL } from '../types.js';

// Rate limiting tracker (in-memory)
interface RateLimitTracker {
  requests: number[];
  maxRequests: number;
  windowMs: number;
}

export class UnsplashAdapter implements MediaAdapter {
  private accessKey: string;
  private rateLimit: RateLimitTracker;

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    // Unsplash free tier: 50 requests/hour
    this.rateLimit = {
      requests: [],
      maxRequests: 50,
      windowMs: 60 * 60 * 1000, // 1 hour
    };
  }

  isEnabled(): boolean {
    return !!this.accessKey;
  }
  
  private checkRateLimit(): boolean {
    const now = Date.now();
    // Remove requests older than the window
    this.rateLimit.requests = this.rateLimit.requests.filter(
      (timestamp) => now - timestamp < this.rateLimit.windowMs
    );
    
    // Check if we're at the limit
    if (this.rateLimit.requests.length >= this.rateLimit.maxRequests) {
      return false; // Rate limit exceeded
    }
    
    return true;
  }
  
  private trackRequest(): void {
    this.rateLimit.requests.push(Date.now());
  }
  
  getRateLimitStatus(): { remaining: number; total: number; resetAt: Date } {
    this.checkRateLimit(); // Clean old requests
    const remaining = Math.max(0, this.rateLimit.maxRequests - this.rateLimit.requests.length);
    const oldestRequest = this.rateLimit.requests[0];
    const resetAt = oldestRequest 
      ? new Date(oldestRequest + this.rateLimit.windowMs)
      : new Date();
    
    return {
      remaining,
      total: this.rateLimit.maxRequests,
      resetAt,
    };
  }

  async fetchImage(params: { id?: string; query?: string; width?: number }): Promise<ImageResult> {
    if (!this.isEnabled()) {
      throw new Error('Unsplash is not enabled');
    }
    
    // Check rate limit before making request
    if (!this.checkRateLimit()) {
      const status = this.getRateLimitStatus();
      throw new Error(`Unsplash rate limit exceeded. Resets at ${status.resetAt.toISOString()}`);
    }

    let photoUrl: string;
    let attribution: any = {};

    if (params.id) {
      const response = await fetch(`https://api.unsplash.com/photos/${params.id}`, {
        headers: { 'Authorization': `Client-ID ${this.accessKey}` }
      });
      const data = await response.json();
      photoUrl = params.width ? `${data.urls.raw}&w=${params.width}` : data.urls.regular;
      attribution = { user: data.user.name, userUrl: data.user.links.html };
    } else if (params.query) {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(params.query)}&per_page=1`, {
        headers: { 'Authorization': `Client-ID ${this.accessKey}` }
      });
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        throw new Error('No photos found');
      }
      const photo = data.results[0];
      photoUrl = params.width ? `${photo.urls.raw}&w=${params.width}` : photo.urls.regular;
      attribution = { user: photo.user.name, userUrl: photo.user.links.html };
    } else {
      throw new Error('Either id or query must be provided');
    }

    // Track the request after successful API call
    this.trackRequest();
    
    const imageResponse = await fetch(photoUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return {
      buffer,
      contentType,
      ttl: DEFAULT_TTL.long,
    };
  }

  getAttribution(params: { user?: string; userUrl?: string }): AttributionInfo {
    return {
      provider: 'Unsplash',
      attributionText: params.user ? `Photo by ${params.user}` : 'Unsplash',
      attributionUrl: params.userUrl || 'https://unsplash.com',
      license: 'Unsplash License'
    };
  }
}
