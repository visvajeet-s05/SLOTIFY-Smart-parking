"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/custom-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Invalid credentials")
        setLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      // Redirect based on user role
      const userRole = data.user.role.toLowerCase()
      switch (userRole) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "owner":
          router.push("/dashboard/owner")
          break
        case "customer":
        case "user":
          router.push("/dashboard")
          break
        default:
          router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center px-6">
      <div className="relative">
        {/* Soft purple glow */}
        <div className="absolute -inset-1 rounded-2xl bg-purple-600/20 blur-2xl opacity-60" />

        {/* Actual card */}
        <div className="relative z-10 rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl p-8 w-[420px]">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Smart Parking</h1>
            <p className="text-gray-600 mt-2">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 space-y-4">
            <div>
              <p className="font-semibold text-gray-800 mb-2">Admin Test Credentials:</p>
              <div className="space-y-1">
                <p className="text-purple-600 font-medium">Visvajeet: visvajeet@gmail.com / visvajeet@123</p>
                <p className="text-purple-600 font-medium">Manish: manish@gmail.com / manish@123</p>
                <p className="text-sm text-gray-500">→ Redirects to: /dashboard/admin</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Owner Test Credentials:</p>
              <div className="space-y-1">
                <p className="text-purple-600 font-medium">Chennai Central Parking: owner@gmail.com / owner@123</p>
                <p className="text-purple-600 font-medium">Anna Nagar Tower Parking: owner1@gmail.com / owner1@123</p>
                <p className="text-sm text-gray-500">→ Redirects to: /dashboard/owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
