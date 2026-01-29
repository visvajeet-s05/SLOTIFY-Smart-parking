export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    upcoming: "bg-blue-500/20 text-blue-400",
    completed: "bg-gray-500/20 text-gray-300",
    cancelled: "bg-red-500/20 text-red-400",
    flagged: "bg-yellow-500/20 text-yellow-400",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status] ?? "bg-gray-700"}`}>
      {status.toUpperCase()}
    </span>
  )
}
