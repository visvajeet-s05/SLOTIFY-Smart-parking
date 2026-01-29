export function isAdmin(role?: string): boolean {
  return role === "ADMIN"
}

export function isCustomer(role?: string): boolean {
  return role === "CUSTOMER"
}
