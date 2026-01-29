export function canScan(role: string) {
  return role === "SCANNER"
}

export function canManage(role: string) {
  return role === "MANAGER" || role === "OWNER"
}
