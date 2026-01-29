"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminHeader({ user }: { user: any }) {
  const router = useRouter()
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900 sticky top-16 z-30">
      <div>
        <h2 className="text-lg font-semibold">Welcome back, <span className="text-purple-300">{user?.name || 'Admin'}</span></h2>
        <p className="text-xs text-gray-400">Monitor and manage platform activity</p>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings" className="text-sm text-gray-300 hover:underline">Bookings</Link>
        <Link href="/dashboard/find" className="text-sm text-gray-300 hover:underline">Find</Link>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.svg" alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0) ?? 'A'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
