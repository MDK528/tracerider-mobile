export const Config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.231.1:5000/api/v1",
} as const;

// Note: 10.0.2.2 is Android emulator's localhost alias
// For physical device, use your machine's local IP e.g. 192.168.x.x