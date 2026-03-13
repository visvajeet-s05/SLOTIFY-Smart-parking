"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { signIn, getSession, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Role } from "@/lib/auth/roles"

import Logo from "@/components/ui/Logo"

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
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Centered Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden" onClick={onClose}>
            <div className="w-full max-w-5xl flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-4xl bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden grid md:grid-cols-2 min-h-[420px]"
                onClick={(e) => e.stopPropagation()}
              >

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 text-white/40 hover:text-white transition-all h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center z-50 md:text-gray-400 md:hover:text-black md:hover:bg-gray-200"
                >
                  <X size={20} />
                </button>

                {/* Left Panel - Visuals */}
                <div className="relative hidden md:flex flex-col justify-between p-8 overflow-hidden bg-slate-900/50">
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="https://images.unsplash.com/photo-1590674899505-1c5c41951f89?q=80&w=2074&auto=format&fit=crop"
                      alt=""
                      fill
                      className="object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 to-purple-900/60 mix-blend-multiply" />
                  </div>

                  <div className="relative z-10">
                    <Logo size="default" className="opacity-90 grayscale brightness-200" />
                  </div>

                  <div className="relative z-10 mt-auto">
                    <h2 className="text-2xl font-black text-white leading-tight mb-3">
                      Smart Cities<br />
                      Start With<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Smart Parking.</span>
                    </h2>
                    <p className="text-blue-100/80 text-xs font-medium leading-relaxed max-w-xs">
                      Streamline operations with Slotify&apos;s real-time AI analytics and automated access control.
                    </p>
                    <button className="mt-6 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md transition-all border border-white/20 flex items-center gap-2 group">
                      Explore Features
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="flex flex-col justify-center p-6 bg-transparent relative">
                  <div className="mb-4">
                    <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center mb-3 text-primary">
                      <Lock size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Log In/ Sign In</h3>
                    <p className="text-gray-500 text-xs">Enter your credentials to access your account.</p>
                  </div>

                  <div className="space-y-3">
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                      <input
                        ref={emailRef}
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 text-white placeholder-gray-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-xs"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 text-white placeholder-gray-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          onClose()
                          onShowRegister?.()
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-primary transition-colors"
                      >
                        Create Account
                      </button>
                      <button 
                        onClick={() => {
                          onClose()
                          router.push("/forgot-password")
                        }}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Error & Caps Lock */}
                    {capsOn && <div className="text-amber-500 text-xs flex items-center gap-2"><AlertCircle size={12} /> Caps Lock is on</div>}
                    {error && <div className="text-red-500 text-xs flex items-center gap-2"><AlertCircle size={12} /> Login failed</div>}

                    {/* Actions */}
                    <button
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
                      {!isLoading && <ArrowRight size={14} />}
                    </button>

                    <div className="relative py-3 flex items-center justify-center">
                      <span className="text-[10px] text-gray-600 font-medium bg-[#0c0c0e] px-2 z-10">Or continue with</span>
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    </div>

                    <button
                      onClick={() => signIn("google")}
                      className="w-full h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                      Google Account
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
