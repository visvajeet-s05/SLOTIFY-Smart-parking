"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (res.ok) {
        setIsDone(true)
        toast.success("Password reset successful!")
        setTimeout(() => router.push("/"), 3000)
      } else {
        const data = await res.json()
        toast.error(data.error || "Reset failed")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <ShieldAlert size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Invalid Link</h2>
        <p className="text-slate-400 mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold">
            Request new link
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {!isDone ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">
              Create a new secure password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-400 ml-1">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-black/40 border-slate-800 text-white pl-12 pr-12 rounded-xl focus:border-cyan-500/50 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-400 ml-1">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 bg-black/40 border-slate-800 text-white pl-12 rounded-xl focus:border-cyan-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg rounded-xl shadow-lg shadow-purple-900/20 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
          >
            <CheckCircle2 size={40} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">Password Updated!</h2>
          <p className="text-slate-400 mb-8">
            Your password has been reset successfully. Redirecting you to login...
          </p>
          <Link href="/">
            <Button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold">
              Login Now
            </Button>
          </Link>
        </div>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
              <p className="text-slate-400 font-medium tracking-wide">Initializing secure session...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  )
}