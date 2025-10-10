import { getByCode, getByName } from '../../../src/integrations/geo/restCountries.js';
import { searchCity } from '../../../src/integrations/geo/geoNames.js';
import { cache } from '../../lib/cache.js';
import { config } from '../../config.js';

export interface GeoBasicsResponse {
  country: {
    name: string;
    code: string;
    flagUrl: string;
    currencies: Array<{ code: string; name: string; symbol: string }>;
    languages: string[];
    timezones: string[];
    callingCode: string;
  };
  city?: {
    name: string;
    lat: number;
    lng: number;
    population?: number;
    timezone?: string;
  };
  meta: {
    provider: string[];
    cacheHit: boolean;
    fetchedAt: string;
  };
}

interface GetBasicsParams {
  countryCode?: string;
  countryName?: string;
  cityName?: string;
  lat?: number;
  lng?: number;
  lang?: 'en' | 'he';
}

function normalizeCityKey(params: GetBasicsParams): string {
  if (params.lat !== undefined && params.lng !== undefined) {
    return `${params.lat.toFixed(4)}:${params.lng.toFixed(4)}`;
  }
  return params.cityName?.toLowerCase().replace(/\s+/g, '-') || '';
}

export async function getBasics(params: GetBasicsParams): Promise<GeoBasicsResponse | null> {
  const lang = params.lang || 'en';
  const providers: string[] = [];
  
  const countryIdentifier = params.countryCode || params.countryName || '';
  const countryCacheKey = `geo:country:${countryIdentifier}:${lang}`;
  
  let cachedCountry = cache.get<GeoBasicsResponse['country']>(countryCacheKey);
  let countryData: GeoBasicsResponse['country'] | null = null;
  
  if (cachedCountry) {
    countryData = cachedCountry;
  } else {
    const restCountryData = params.countryCode 
      ? await getByCode(params.countryCode)
      : params.countryName 
        ? await getByName(params.countryName)
        : null;
    
    if (!restCountryData) {
      return null;
    }

    providers.push('restcountries');

    const currencies = restCountryData.currencies 
      ? Object.entries(restCountryData.currencies).map(([code, curr]) => ({
          code,
          name: curr.name,
          symbol: curr.symbol || code
        }))
      : [];

    const languages = restCountryData.languages 
      ? Object.values(restCountryData.languages)
      : [];

    const callingCode = restCountryData.idd.root && restCountryData.idd.suffixes
      ? `${restCountryData.idd.root}${restCountryData.idd.suffixes[0] || ''}`
      : '';

    countryData = {
      name: restCountryData.name.common,
      code: restCountryData.cca2,
      flagUrl: restCountryData.flags.svg || restCountryData.flags.png,
      currencies,
      languages,
      timezones: restCountryData.timezones,
      callingCode,
    };

    cache.set(countryCacheKey, countryData, 24 * 60 * 60);
  }

  let cityData: GeoBasicsResponse['city'] | undefined;

  if (params.cityName || (params.lat !== undefined && params.lng !== undefined)) {
    const cityIdentifier = normalizeCityKey(params);
    const cityCacheKey = `geo:city:${cityIdentifier}:${lang}`;
    
    const cachedCity = cache.get<GeoBasicsResponse['city']>(cityCacheKey);
    
    if (cachedCity) {
      cityData = cachedCity;
    } else {
      const geoNamesData = await searchCity({
        q: params.cityName,
        lat: params.lat,
        lng: params.lng,
        countryCode: params.countryCode,
      });

      if (geoNamesData) {
        providers.push('geonames');
        cityData = {
          name: geoNamesData.name,
          lat: parseFloat(geoNamesData.lat),
          lng: parseFloat(geoNamesData.lng),
          population: geoNamesData.population,
          timezone: geoNamesData.timezone?.timeZoneId,
        };

        cache.set(cityCacheKey, cityData, 6 * 60 * 60);
      }
    }
  }

  const wasCached = !!cachedCountry && (!cityData || cache.has(`geo:city:${normalizeCityKey(params)}:${lang}`));

  return {
    country: countryData,
    city: cityData,
    meta: {
      provider: providers,
      cacheHit: wasCached,
      fetchedAt: new Date().toISOString(),
    },
  };
}
