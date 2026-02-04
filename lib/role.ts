import { Role } from "@/lib/auth/roles"

export function isAdmin(role?: string): boolean {
  return role === Role.ADMIN
}

export function isCustomer(role?: string): boolean {
  return role === Role.CUSTOMER
}
