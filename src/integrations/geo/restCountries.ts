import { config } from '../../../server/config.js';

export interface RestCountryData {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  cca2: string;
  cca3: string;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  timezones: string[];
  idd: {
    root?: string;
    suffixes?: string[];
  };
  flags: {
    svg: string;
    png: string;
  };
}

async function fetchWithLogging(url: string, endpoint: string): Promise<Response> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const latencyMs = Date.now() - startTime;
    
    console.log(JSON.stringify({
      provider: 'restcountries',
      endpoint,
      latencyMs,
      status: response.status,
      url
    }));
    
    return response;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error(JSON.stringify({
      provider: 'restcountries',
      endpoint,
      latencyMs,
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }));
    throw error;
  }
}

export async function getByCode(code: string): Promise<RestCountryData | null> {
  const url = `${config.geo.restCountriesBaseUrl}/alpha/${code}`;
  const response = await fetchWithLogging(url, `/alpha/${code}`);
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function getByName(name: string): Promise<RestCountryData | null> {
  const url = `${config.geo.restCountriesBaseUrl}/name/${encodeURIComponent(name)}?fullText=true`;
  const response = await fetchWithLogging(url, `/name/${name}`);
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}
