const EARTH_RADIUS_KM = 6371;
const BASE_FARE = 30;
const PER_KM_RATE = 5;

interface Coords {
  latitude: number;
  longitude: number;
}

export function calculateDistanceKm(from: Coords, to: Coords): number {
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export interface FareEstimate {
  distanceKm: number;
  fareRupees: number;
}

// Mirrors calculateFare() in bookings.service.ts (base ₹30 + ₹5/km).
// This is an estimate only — actual fareAmount comes from createBooking() response.
export function estimateFare(pickup: Coords, drop: Coords): FareEstimate {
  const distanceKm = calculateDistanceKm(pickup, drop);
  const fareRupees = Math.round(BASE_FARE + PER_KM_RATE * distanceKm);
  return { distanceKm, fareRupees };
}