"use client"

import { useEffect, useRef, useState } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Role } from "@/lib/auth/roles"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  email?: string
  setEmail?: (email: string) => void
  password?: string
  setPassword?: (password: string) => void
  isLoading?: boolean
  handleLogin?: () => Promise<void>
  onShowRegister?: () => void
}

export default function LoginModal({
  open,
  onClose,
  email: propsEmail,
  setEmail: propsSetEmail,
  password: propsPassword,
  setPassword: propsSetPassword,
  isLoading: propsIsLoading,
  handleLogin: propsHandleLogin,
  onShowRegister
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
  const { update } = useSession()

  const email = propsEmail ?? localEmail
  const setEmail = propsSetEmail ?? setLocalEmail
  const password = propsPassword ?? localPassword
  const setPassword = propsSetPassword ?? setLocalPassword
  const isLoading = propsIsLoading ?? localIsLoading

  useEffect(() => {
    if (open) {
      setTimeout(() => emailRef.current?.focus(), 200)
    }
  }, [open])

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
      await update()
      const session = await getSession()
      const role = session?.user?.role
      onClose()
      toast.success("Identity Verified")
      if (role === Role.ADMIN) router.push("/dashboard/admin")
      else if (role === Role.OWNER) router.push("/dashboard/owner")
      else router.push("/dashboard")
    } catch (error) {
      setError(true)
    } finally {
      setLocalIsLoading(false)
    }
  }

  const handleLogin = propsHandleLogin ?? defaultHandleLogin

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[440px] bg-[#0c0c0e]/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-white/30 hover:text-white transition-all h-10 w-10 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 flex items-center justify-center z-20"
            >
              <X size={18} />
            </button>

            <div className="px-8 pb-10 pt-12">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-white tracking-tight mb-3">Welcome</h2>
                <div className="flex items-center justify-center gap-3 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span className="h-px w-8 bg-gray-800" />
                  Slotify Identity Portal
                  <span className="h-px w-8 bg-gray-800" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    System Identifier
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      ref={emailRef}
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl bg-white/[0.03] border border-white/10 pl-11 pr-4 py-4 text-white placeholder-gray-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Authorization Key
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
                      className="w-full rounded-2xl bg-white/[0.03] border border-white/10 pl-11 pr-11 py-4 text-white placeholder-gray-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {capsOn && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-amber-500 text-[10px] font-bold px-1">
                    <AlertCircle size={12} /> Caps Lock is Active
                  </motion.div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-bold p-4 rounded-2xl flex items-center gap-2">
                    <AlertCircle size={14} /> Identity could not be verified.
                  </motion.div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full h-[64px] rounded-2xl font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_24px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-lg">Initialize Access</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between mt-6 px-1">
                    <button
                      onClick={() => {
                        onClose()
                        onShowRegister?.()
                      }}
                      className="text-[10px] font-bold text-gray-500 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                      Register Here
                    </button>
                    <button className="text-[10px] font-bold text-gray-500 hover:text-primary uppercase tracking-widest transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]">
                    <span className="bg-[#0c0c0e] px-4 text-gray-600">Secure Cloud Sync</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="w-full flex items-center justify-center gap-3 h-[60px] rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sync Identity with Google Account
                </button>
              </div>

              <div className="mt-10 flex items-center justify-center gap-6 text-[8px] text-gray-700 font-bold uppercase tracking-widest opacity-50">
                <span>Priority Privacy</span>
                <div className="h-1 w-1 bg-gray-800 rounded-full" />
                <span>Global Terms</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
