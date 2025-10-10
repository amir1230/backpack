import { config } from '../../../server/config.js';

export interface GeoNamesCityData {
  name: string;
  lat: string;
  lng: string;
  countryCode: string;
  countryName: string;
  population?: number;
  timezone?: {
    timeZoneId: string;
  };
}

async function fetchWithLogging(url: string, endpoint: string): Promise<Response> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const latencyMs = Date.now() - startTime;
    
    console.log(JSON.stringify({
      provider: 'geonames',
      endpoint,
      latencyMs,
      status: response.status,
      url
    }));
    
    return response;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error(JSON.stringify({
      provider: 'geonames',
      endpoint,
      latencyMs,
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }));
    throw error;
  }
}

export async function searchCity(params: {
  q?: string;
  lat?: number;
  lng?: number;
  countryCode?: string;
}): Promise<GeoNamesCityData | null> {
  if (!config.geo.geoNamesUsername) {
    console.warn('GeoNames username not configured');
    return null;
  }

  let url: string;
  let endpoint: string;

  if (params.lat !== undefined && params.lng !== undefined) {
    url = `${config.geo.geoNamesBaseUrl}/findNearbyPlaceNameJSON?lat=${params.lat}&lng=${params.lng}&username=${config.geo.geoNamesUsername}`;
    endpoint = '/findNearbyPlaceName';
  } else if (params.q) {
    const countryParam = params.countryCode ? `&country=${params.countryCode}` : '';
    url = `${config.geo.geoNamesBaseUrl}/searchJSON?q=${encodeURIComponent(params.q)}${countryParam}&maxRows=1&username=${config.geo.geoNamesUsername}`;
    endpoint = '/search';
  } else {
    return null;
  }

  const response = await fetchWithLogging(url, endpoint);
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  const geoname = data.geonames?.[0];
  
  if (!geoname) {
    return null;
  }

  return {
    name: geoname.name,
    lat: geoname.lat,
    lng: geoname.lng,
    countryCode: geoname.countryCode,
    countryName: geoname.countryName,
    population: geoname.population,
    timezone: geoname.timezone,
  };
}
