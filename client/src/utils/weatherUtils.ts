// Weather API client utilities - uses server-side weather API

export interface WeatherData {
  id: string; // Changed to string to match UUID
  temperature: number;
  tempMin: number;
  tempMax: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
  lastUpdated: string;
}

interface Destination {
  id: string; // Changed to string to match UUID
  name: string;
  lat: number;
  lon: number;
}

class WeatherClient {
  async getWeatherForDestinations(destinations: Destination[]): Promise<Map<string, WeatherData>> {
    const weatherData = new Map<string, WeatherData>();
    
    // Filter destinations with valid coordinates
    const validDestinations = destinations.filter(dest => 
      dest.lat !== undefined && 
      dest.lon !== undefined && 
      !isNaN(dest.lat) && 
      !isNaN(dest.lon)
    );

    if (validDestinations.length === 0) {
      return weatherData;
    }
    
    try {
      // Call our server's batch weather endpoint
      const response = await fetch('/api/weather/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destinations: validDestinations }),
      });
      
      if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert response back to Map
      for (const [id, weather] of Object.entries(data)) {
        weatherData.set(id, weather as WeatherData);
      }
      
    } catch (error) {
      console.warn('Failed to get weather data:', error);
    }
    
    return weatherData;
  }
}

export const weatherClient = new WeatherClient();