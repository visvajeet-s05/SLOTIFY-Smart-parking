"use client"

import { useSession } from "next-auth/react"
import OwnerCameraView from "@/components/dashboard/OwnerCameraView"

export default function OwnerCameraPage() {
  const { data: session } = useSession()
  const parkingLotId = session?.user?.parkingLotId

  if (!parkingLotId) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return <OwnerCameraView parkingLotId={parkingLotId} />
}
