export default function MapSkeleton() {
  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden bg-gray-900">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_60%)]" />
    </div>
  )
}
