import { initSocket } from '@/lib/socket'

export async function GET(req: Request) {
  // @ts-ignore
  const res = req.socket?.server
  initSocket(res)
  return new Response("Socket initialized")
}
