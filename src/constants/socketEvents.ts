// Mirrors src/modules/realtime/realtime.events.ts (only the events the mobile app uses)
export const SOCKET_EVENTS = {
  // Driver → Server
  DRIVER_LOCATION_UPDATE: "driver:location:update",

  // Server → Passenger
  DRIVER_LOCATION: "server:driver_location",
} as const;