export function canScan(role: string) {
  return role === "SCANNER"
}

import { Role } from "@/lib/auth/roles"

export function canManage(role: string) {
  return role === "MANAGER" || role === Role.OWNER
}
