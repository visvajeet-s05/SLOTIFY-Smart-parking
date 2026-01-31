export function predictDemand({
  historicalBookings,
  hour,
  dayOfWeek,
}: {
  historicalBookings: number[]
  hour: number
  dayOfWeek: number
}) {
  const base = historicalBookings.reduce((a, b) => a + b, 0) / historicalBookings.length

  const hourMultiplier =
    hour >= 8 && hour <= 11 ? 1.4 :
    hour >= 17 && hour <= 20 ? 1.6 :
    1

  const dayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1

  return Math.min(base * hourMultiplier * dayMultiplier, 1)
}