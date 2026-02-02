export function isSessionValid() {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    return false
  }

  const token = localStorage.getItem("token")
  if (!token) return false

  try {
    // Decode JWT token manually (no external dependency)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
