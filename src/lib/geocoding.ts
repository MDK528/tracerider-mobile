export interface PlaceSuggestion {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const HEADERS = { "User-Agent": "TraceRider/1.0" };

function extractCity(address: Record<string, string> | undefined): string {
  if (!address) return "";
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    ""
  );
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (!query.trim()) return [];

  const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();

  return (data as any[]).map((item) => ({
    address: item.display_name,
    city: extractCity(item.address),
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<PlaceSuggestion | null> {
  const url = `${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`;

  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();

  if (!data || data.error) return null;

  return {
    address: data.display_name,
    city: extractCity(data.address),
    latitude,
    longitude,
  };
}