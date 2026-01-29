"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react"

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Invalid email or password")
      }
      // AuthProvider will handle the redirect based on role
      onClose() // Close modal on success
    } catch {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white/95 shadow-2xl animate-fadeIn">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your parking dashboard
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleLogin}
          className="px-8 pb-8 space-y-5"
        >
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="owner@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-600/30 outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-600/30 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded border-gray-300" />
              Remember me
            </label>
            <a href="#" className="text-purple-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 py-2.5 text-white font-medium shadow-lg hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500">
            Access is provided by the administrator
          </p>
        </form>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
