"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"

function ResetPasswordContent() {
  const token = useSearchParams().get("token")
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function submit() {
    if (!password || password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      setLoading(false)

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to reset password")
      }
    } catch (error) {
      setLoading(false)
      setError("An error occurred. Please try again.")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-[#0b1220] p-8 rounded-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h2>
          <p className="text-gray-300 mb-6">Your password has been successfully reset. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-[#0b1220] p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl text-white mb-6 text-center">Reset Password</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white outline-none border border-gray-700 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white outline-none border border-gray-700 focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-6 py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <p className="text-center text-gray-400 text-sm mt-4">
          Remember your password?{" "}
          <button
            onClick={() => router.push("/")}
            className="text-purple-400 hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl animate-pulse">Loading reset form...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}