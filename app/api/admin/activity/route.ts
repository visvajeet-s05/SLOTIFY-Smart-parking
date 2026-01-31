export async function GET() {
  // Mock activity log data
  const activityLog = [
    {
      id: "1",
      action: "User 'john@example.com' booked parking slot A-12",
      actor: "john@example.com",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    {
      id: "2",
      action: "Parking area 'Downtown Complex' status changed to 'limited'",
      actor: "System",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    },
    {
      id: "3",
      action: "Admin 'admin@slotify.com' approved owner registration for 'parking@example.com'",
      actor: "admin@slotify.com",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "4",
      action: "User 'jane@example.com' canceled booking for slot B-05",
      actor: "jane@example.com",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      id: "5",
      action: "Parking area 'Westend Garage' added new staff member",
      actor: "parking@example.com",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
  ]

  return Response.json(activityLog)
}