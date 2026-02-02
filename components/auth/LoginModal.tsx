"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store token, role, and email in localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", data.role)
        localStorage.setItem("email", email)

        // Close modal first
        onClose()

        // Redirect to appropriate dashboard
        router.replace(data.redirect)
      } else {
        // Show error message (you can add a toast here)
        console.error("Login failed:", data.message)
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[101] flex items-center justify-center px-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            relative w-full max-w-md rounded-2xl
            bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]
            p-8 shadow-2xl border border-white/10
          "
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-sm text-gray-300 mt-1">
              Sign in to manage your parking dashboard
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-300 mb-1 block">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="owner@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-lg bg-white/10 pl-10 pr-3 py-2.5
                  text-white placeholder-gray-400
                  outline-none border border-white/10
                  focus:border-purple-500
                "
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-sm text-gray-300 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full rounded-lg bg-white/10 pl-10 pr-10 py-2.5
                  text-white placeholder-gray-400
                  outline-none border border-white/10
                  focus:border-purple-500
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="mb-6 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-purple-500"
              />
              Remember me
            </label>
            <button className="text-purple-400 hover:underline">
              Forgot password?
            </button>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="
              w-full rounded-lg py-2.5 font-semibold text-white
              bg-gradient-to-r from-purple-600 to-indigo-600
              hover:from-purple-700 hover:to-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-gray-400">
            Access is provided by the administrator
          </p>
        </div>
      </motion.div>
    </>
  )
}