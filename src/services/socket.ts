import { io, type Socket } from "socket.io-client";
import { storage } from "./storage";

// Socket.IO is mounted on the root HTTP server, not under /api/v1 —
// derive the bare host from the same env var the REST client uses.
export const SOCKET_URL = (process.env.EXPO_PUBLIC_API_URL as string).replace(/\/api\/v1\/?$/, "");

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    // Called on every (re)connection attempt so an expired token gets refreshed
    auth: async (cb) => {
      const token = await storage.getAccessToken();
      cb({ token });
    },
    transports: ["websocket"],
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}