"use client"

import { use } from "react"
import OwnerCameraView from "@/components/dashboard/OwnerCameraView"

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function OwnerLotCameraPage({ params }: PageProps) {
    const { id } = use(params)

    if (!id) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        )
    }

    return <OwnerCameraView parkingLotId={id} />
}
