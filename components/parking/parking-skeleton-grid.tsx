import { Skeleton } from "@/components/ui/skeleton"

export function ParkingSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  )
}