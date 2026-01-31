export async function GET() {
  return Response.json({
    db: "online",
    websocket: "online",
    usersOnline: 124,
    cpu: "42%",
  })
}