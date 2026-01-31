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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
        setLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      // Redirect based on user role - we need to get user role from session
      // For now, redirect to dashboard, and let middleware handle role-based routing
      router.push("/dashboard")
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

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Test Owner Credentials:</p>
            <p className="text-purple-600 font-medium">Email: owner@gmail.com</p>
            <p className="text-purple-600 font-medium">Password: owner@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
