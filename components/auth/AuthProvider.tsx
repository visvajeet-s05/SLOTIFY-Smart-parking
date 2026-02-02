"use client"

import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (token && role) {
      setUser({ role })
    }
  }, [])

  const logout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)