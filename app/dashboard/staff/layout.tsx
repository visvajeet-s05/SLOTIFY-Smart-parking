import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Role } from "@/lib/auth/roles"

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session || session.user.role !== Role.STAFF) {
    redirect("/login")
  }
  return <>{children}</>
}