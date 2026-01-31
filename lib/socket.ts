import { Server } from "socket.io";

let io: Server | null = null;

export function initSocket(server: any) {
  if (!io) {
    io = new Server(server, {
      path: "/api/socket",
      cors: { origin: "*" },
    });
  }
  return io;
}

export function emitParkingUpdate(data: any) {
  io?.emit("parking:update", data);
}