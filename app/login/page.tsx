"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/auth/LoginModal"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) return

    setIsLoading(true)

    try {
      // Use NextAuth with redirect: false to handle routing manually
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // IMPORTANT: Prevent auto-redirect
      })

      if (!res?.ok) {
        console.error("Login failed")
        return
      }

      // Get session to determine role
      const session = await getSession()
      const role = session?.user?.role

      // Redirect based on role
      if (role === "ADMIN") {
        router.replace("/dashboard/admin")
      } else if (role === "OWNER") {
        router.replace("/dashboard/owner")
      } else if (role === "STAFF") {
        router.replace("/dashboard/staff")
      } else {
        router.replace("/dashboard/users")
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <LoginModal 
        open={true} 
        onClose={() => {}} 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        handleLogin={handleLogin}
      />
    </div>
  )
}
