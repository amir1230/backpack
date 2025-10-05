export type BaseEntity = {
  id: string;
  name?: string | null;
  address?: string | null;
  addressString?: string | null;
  city?: string | null;
  country?: string | null;
  lat?: number | null;
  lon?: number | null;
};

export type DestinationMini = {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
};

export function parseCityCountryFromAddress(address?: string | null): { city?: string; country?: string } {
  if (!address) return {};
  // Simple split "City, Region, Country" (handles most cases)
  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return {};
  const country = parts[parts.length - 1];
  const city = parts.length >= 2 ? parts[parts.length - 2] : undefined;
  return { city, country };
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad((b.lat - a.lat));
  const dLon = toRad((b.lon - a.lon));
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestDestinationNameCountry(
  e: BaseEntity,
  dests: DestinationMini[],
  maxKm = 80
): { city?: string; country?: string } {
  if (e.lat == null || e.lon == null || dests.length === 0) return {};
  let best: { d: number; city?: string | null; name?: string | null; country?: string | null } = { d: 1e12 };
  for (const d of dests) {
    if (d.lat == null || d.lon == null) continue;
    const dist = haversineKm({ lat: e.lat, lon: e.lon }, { lat: d.lat, lon: d.lon });
    if (dist < best.d) best = { d: dist, city: d.city ?? undefined, name: d.name ?? undefined, country: d.country ?? undefined };
  }
  if (best.d <= maxKm) return { city: best.city || best.name || undefined, country: best.country || undefined };
  return {};
}

/** Return {city,country} by priority: direct fields → address → nearby destination */
export function resolveCityCountry(
  e: BaseEntity,
  nearby?: { destinations: DestinationMini[] }
): { city?: string; country?: string } {
  // 1) If explicit fields exist in table - use them
  if (e.country || e.city) return { city: e.city || undefined, country: e.country || undefined };
  // 2) Try to parse from address
  const fromAddr = parseCityCountryFromAddress(e.address || e.addressString);
  if (fromAddr.city || fromAddr.country) return fromAddr;
  // 3) Fall back to "nearby destination" by lat/lon
  if (nearby?.destinations?.length) {
    return nearestDestinationNameCountry(e, nearby.destinations);
  }
  return {};
}