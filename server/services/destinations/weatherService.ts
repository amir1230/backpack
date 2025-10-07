import axios from 'axios';

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

export interface WeatherCurrent {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
}

export interface WeatherForecastDay {
  dt: number;
  tempMin: number;
  tempMax: number;
  pop: number; // probability of precipitation
  description: string;
  icon: string;
  windSpeed: number;
}

export interface WeatherResponse {
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
  meta: {
    units: 'metric' | 'imperial';
    provider: string;
    cacheHit: boolean;
    fetchedAt: number;
  };
}

interface WeatherServiceOptions {
  lang?: string;
  units?: 'metric' | 'imperial';
}

class DestinationsWeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private currentTTL = 10 * 60 * 1000; // 10 minutes
  private forecastTTL = 60 * 60 * 1000; // 60 minutes

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
  }

  private getCacheKey(type: string, lat: number, lng: number, units: string, lang: string): string {
    return `weather:${type}:${lat}:${lng}:${units}:${lang}`;
  }

  private getFromCache(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async getByLatLng(
    lat: number,
    lng: number,
    options: WeatherServiceOptions = {}
  ): Promise<WeatherResponse> {
    const startTime = Date.now();
    const { lang = 'en', units = 'metric' } = options;

    // Check if OpenWeather is enabled
    if (!this.apiKey || process.env.ENABLE_OPENWEATHER !== 'true') {
      throw new Error('OpenWeather API is not enabled');
    }

    const currentKey = this.getCacheKey('current', lat, lng, units, lang);
    const forecastKey = this.getCacheKey('forecast', lat, lng, units, lang);

    // Try cache first
    const cachedCurrent = this.getFromCache(currentKey);
    const cachedForecast = this.getFromCache(forecastKey);

    if (cachedCurrent && cachedForecast) {
      const latency = Date.now() - startTime;
      console.log(`[WeatherService] Cache HIT - lat:${lat}, lng:${lng}, latency:${latency}ms`);
      
      return {
        current: cachedCurrent,
        forecast: cachedForecast,
        meta: {
          units,
          provider: 'openweather',
          cacheHit: true,
          fetchedAt: Date.now()
        }
      };
    }

    // Fetch from API
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/weather`, {
          params: {
            lat,
            lon: lng,
            appid: this.apiKey,
            units,
            lang
          }
        }),
        axios.get(`${this.baseUrl}/forecast`, {
          params: {
            lat,
            lon: lng,
            appid: this.apiKey,
            units,
            lang
          }
        })
      ]);

      const current: WeatherCurrent = {
        temp: Math.round(currentResponse.data.main.temp),
        feelsLike: Math.round(currentResponse.data.main.feels_like),
        description: currentResponse.data.weather[0].description,
        icon: currentResponse.data.weather[0].icon,
        humidity: currentResponse.data.main.humidity,
        windSpeed: currentResponse.data.wind.speed,
        windDeg: currentResponse.data.wind.deg,
        pressure: currentResponse.data.main.pressure,
        visibility: currentResponse.data.visibility,
        sunrise: currentResponse.data.sys.sunrise,
        sunset: currentResponse.data.sys.sunset
      };

      const forecast = this.processForecast(forecastResponse.data);

      // Cache the results
      this.setCache(currentKey, current, this.currentTTL);
      this.setCache(forecastKey, forecast, this.forecastTTL);

      const latency = Date.now() - startTime;
      console.log(`[WeatherService] API call - provider:openweather, endpoint:current+forecast, lat:${lat}, lng:${lng}, latency:${latency}ms, cacheHit:false`);

      return {
        current,
        forecast,
        meta: {
          units,
          provider: 'openweather',
          cacheHit: false,
          fetchedAt: Date.now()
        }
      };
    } catch (error: any) {
      console.error('[WeatherService] API error:', error.message);
      
      if (error.response?.status === 503) {
        throw new Error('Weather service temporarily unavailable');
      }
      
      throw error;
    }
  }

  private processForecast(forecastData: any): WeatherForecastDay[] {
    const dailyData: { [key: string]: any[] } = {};
    
    // Group forecast by date
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Process each day (max 5 days)
    return Object.entries(dailyData).slice(0, 5).map(([date, dayData]) => {
      const temps = dayData.map(d => d.main.temp);
      const pops = dayData.map(d => d.pop || 0);
      const winds = dayData.map(d => d.wind.speed);

      // Use the first entry's data for description and icon
      const firstEntry = dayData[0];

      return {
        dt: firstEntry.dt,
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        pop: Math.round(Math.max(...pops) * 100), // Convert to percentage
        description: firstEntry.weather[0].description,
        icon: firstEntry.weather[0].icon,
        windSpeed: Math.round(winds.reduce((a, b) => a + b, 0) / winds.length)
      };
    });
  }
}

export const weatherService = new DestinationsWeatherService();
