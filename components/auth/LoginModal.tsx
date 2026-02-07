"use client"

import { useEffect, useRef, useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  email?: string
  setEmail?: (email: string) => void
  password?: string
  setPassword?: (password: string) => void
  isLoading?: boolean
  handleLogin?: () => Promise<void>
}

export default function LoginModal({ 
  open, 
  onClose, 
  email: propsEmail,
  setEmail: propsSetEmail,
  password: propsPassword,
  setPassword: propsSetPassword,
  isLoading: propsIsLoading,
  handleLogin: propsHandleLogin
}: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [capsOn, setCapsOn] = useState(false)
  const [localEmail, setLocalEmail] = useState("")
  const [localPassword, setLocalPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [localIsLoading, setLocalIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  // Use props if provided, otherwise use local state
  const email = propsEmail ?? localEmail
  const setEmail = propsSetEmail ?? setLocalEmail
  const password = propsPassword ?? localPassword
  const setPassword = propsSetPassword ?? setLocalPassword
  const isLoading = propsIsLoading ?? localIsLoading

  // Auto-focus email when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => emailRef.current?.focus(), 200)
    }
  }, [open])

  // ENTER key submit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && open) {
        handleLogin()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, email, password])

const defaultHandleLogin = async () => {
    if (!email || !password) return

    setLocalIsLoading(true)
    setError(false)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        rememberMe: rememberMe ? 'true' : 'false',
        redirect: false,
      })

      if (!res?.ok) {
        setError(true)
        setLocalIsLoading(false)
        return
      }

      // Close modal first
      onClose()

      // Success toast
      toast.success("Login successful")

      // Analytics event
      console.log("LOGIN_SUCCESS", {
        email,
        time: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Login error:", error)
      setError(true)
    } finally {
      setLocalIsLoading(false)
    }
  }

  const handleLogin = propsHandleLogin ?? defaultHandleLogin

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              ref={emailRef}
              onClick={(e) => e.stopPropagation()}
              animate={error ? { x: [-10, 10, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
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
                    ref={emailRef}
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
                    onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
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

              {/* Caps Lock Warning */}
              {capsOn && (
                <p className="text-yellow-400 text-xs mb-4">
                  ⚠️ Caps Lock is ON
                </p>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-sm mb-4">
                  Invalid email or password
                </p>
              )}

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
                <button 
                  onClick={async () => {
                    if (!email) {
                      alert("Please enter your email address first")
                      return
                    }
                    try {
                      const res = await fetch("/api/auth/forgot-password", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email }),
                      })
                      if (res.ok) {
                        alert("Password reset link sent to your email")
                      } else {
                        alert("Failed to send reset link. Please try again.")
                      }
                    } catch (error) {
                      alert("An error occurred. Please try again.")
                    }
                  }}
                  className="text-purple-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Social Login */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-2 text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <button
                    onClick={() => signIn("google")}
                    className="
                      w-full flex items-center justify-center gap-3
                      py-2 px-4 rounded-lg bg-white/10 text-white
                      border border-white/20 hover:bg-white/20
                      transition-colors
                    "
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
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
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Footer */}
              <p className="mt-4 text-center text-xs text-gray-400">
                Access is provided by the administrator
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
