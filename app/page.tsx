"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { MapPin, Star, Clock, Shield, ArrowRight, Car, CheckCircle2, Zap, Globe, Menu, X, Smartphone } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/auth/LoginModal"

const MapBackground = dynamic(() => import("@/components/map/background-map"), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black/90 animate-pulse" />,
})

const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Support", href: "#support" },
]

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: MapPin,
      title: "Real-time Availability",
      description: "Find available parking spots instantly with our Al-powered predictive mapping.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Star,
      title: "Premium Spaces",
      description: "Access exclusive, secure parking zones reserved only for Slotify members.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Clock,
      title: "Flexible Bookings",
      description: "Reserve by the minute, hour, or month. Ultimate flexibility for your busy life.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Guaranteed Security",
      description: "24/7 surveillance and secure encrypted digital locks for every parking bay.",
      color: "from-emerald-500 to-teal-500",
    },
  ]

  const stats = [
    { label: "Active Users", value: "50K+" },
    { label: "Parking Bays", value: "12K+" },
    { label: "Cities Covered", value: "25+" },
    { label: "Safe Parkings", value: "1M+" },
  ]

  return (
    <main className="relative min-h-screen w-full bg-mesh selection:bg-primary/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? "py-4 bg-slate-950/60 backdrop-blur-md border-b border-white/10 shadow-lg" : "py-6 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center group cursor-pointer" onClick={() => router.push("/")}>
            <Image
              src="/Logo.png"
              alt="Slotify"
              width={160}
              height={45}
              priority
              className="h-10 w-auto object-contain brightness-110 group-hover:brightness-125 transition-all invert mix-blend-screen"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">
                {link.name}
              </a>
            ))}
            <button
              onClick={() => setShowLogin(true)}
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full glass border-b border-white/10 py-6 px-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a key={link.name} href={link.href} className="text-lg font-medium text-gray-300">{link.name}</a>
              ))}
              <Button onClick={() => setShowLogin(true)} className="w-full bg-primary text-white">Sign In</Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden">
        {/* Background Map with deeper overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div className="absolute inset-0 blur-[4px] scale-105">
            <MapBackground />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/10 to-slate-950/80 backdrop-blur-[0px]" />
          {/* Animated decorative blobs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-soft delay-1000" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <div className="bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] py-16 px-6 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >

              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 whitespace-nowrap drop-shadow-lg">
                <span className="text-white">Smart Parking.</span>{" "}
                <span className="text-gradient-primary">Zero Stress.</span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-100 font-medium max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-md">
                Find, book, and navigate to the perfect parking spot in seconds.
                The most advanced parking ecosystem for modern urban living.
              </p>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowLogin(true)}
                  className="h-16 px-10 text-lg font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/40 group"
                >
                  Find Parking Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section >

      {/* Stats Section */}
      < section className="relative py-24 z-20" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Features Grid */}
      < section id="features" className="py-32 relative overflow-hidden" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
              Everything you need to <span className="text-gradient-primary">Park Smarter.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl">
              We've rebuilt the parking experience from the ground up, focusing on ease of use, security, and global accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 -z-10 blur-xl ${feature.color}`} />
                <div className="glass-card rounded-[2rem] p-8 h-full flex flex-col items-start gap-6 border-white/5 hover:border-white/20 transition-all duration-500">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-snug">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* How It Works - Premium Flow */}
      < section id="how-it-works" className="py-32 bg-white/5 backdrop-blur-3xl relative" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">How it Works</h2>
            <p className="text-lg text-gray-400">Three simple steps to revolutionize your daily commute.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.75rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {[
              {
                title: "Scan & Search",
                desc: "Open the app and instantly see every available spot around your destination.",
                icon: <Zap className="h-6 w-6" />,
              },
              {
                title: "Instant Booking",
                desc: "Secure your bay with one tap. No more driving in circles searching for space.",
                icon: <CheckCircle2 className="h-6 w-6" />,
              },
              {
                title: "Seamless Arrival",
                desc: "Follow the integrated HUD navigation and enter with automated license plate recognition.",
                icon: <Globe className="h-6 w-6" />,
              },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div className="h-24 w-24 rounded-full glass border-2 border-primary/30 flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <div className="text-primary">{step.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wider">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Experience Section */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden border-white/5">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative z-10">
                <span className="text-primary font-bold uppercase tracking-[0.2em] mb-6 block">Mobile Experience</span>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                  Slotify in your <br />
                  <span className="text-gradient-primary">Pocket.</span>
                </h2>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                  Real-time updates, contact-free booking, and digital receipts.
                  Control your entire parking experience from our world-class mobile app.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-4 px-6 py-3 rounded-2xl glass hover:bg-white/5 transition-all cursor-pointer">
                    <Image src="/Logo.png" alt="Apple" width={24} height={24} className="brightness-200 invert mix-blend-screen" />
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-medium text-gray-500">Download on</div>
                      <div className="text-sm font-bold text-white">App Store</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 rounded-2xl glass hover:bg-white/5 transition-all cursor-pointer">
                    <Image src="/Logo.png" alt="Google" width={24} height={24} className="brightness-200 invert mix-blend-screen" />
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-medium text-gray-500">Get it on</div>
                      <div className="text-sm font-bold text-white">Google Play</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/20 rounded-full blur-[100px] -z-10" />
                <motion.div
                  initial={{ y: 50, rotate: -5 }}
                  whileInView={{ y: 0, rotate: 0 }}
                  transition={{ duration: 1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-[3rem] scale-95 group-hover:scale-100 transition-transform duration-700" />
                  <Image
                    src="/Logo.png"
                    alt="App Preview"
                    width={320}
                    height={640}
                    className="relative z-10 rounded-[3rem] border-8 border-gray-950 shadow-2xl object-cover invert mix-blend-screen"
                  />
                  {/* Floating Notification */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -right-16 bottom-1/4 z-20 glass p-4 rounded-2xl border-white/20 shadow-2xl hidden md:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Spot Reserved</div>
                        <div className="text-sm text-white font-medium">Bay A-102 Locked</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative z-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-primary/50 to-transparent" />

        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">
              Ready to <span className="text-gradient-primary">start?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-12">
              Join 50,000+ drivers who have reclaimed their time and peace of mind with the Slotify ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                size="lg"
                onClick={() => setShowLogin(true)}
                className="h-20 px-12 text-xl font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/40"
              >
                Get Started for Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-20 px-12 text-xl font-semibold rounded-2xl glass hover:bg-white/5 transition-all text-white border-white/10"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative pt-32 pb-16 bg-background">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center group cursor-pointer mb-6" onClick={() => router.push("/")}>
                <Image
                  src="/Logo.png"
                  alt="Slotify"
                  width={180}
                  height={50}
                  className="h-12 w-auto object-contain brightness-110 group-hover:brightness-125 transition-all invert mix-blend-screen"
                />
              </div>
              <p className="text-gray-500 leading-relaxed mb-8 max-w-sm">
                Next-generation parking infrastructure for smarter cities and stress-free urban mobility.
              </p>
              <div className="flex gap-4">
                {["X", "IG", "FB", "LI"].map((s) => (
                  <div key={s} className="h-10 w-10 glass rounded-xl flex items-center justify-center font-bold text-xs text-gray-400 hover:text-primary hover:border-primary/50 cursor-pointer transition-all">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "App", "Visions"] },
              { title: "Company", links: ["About", "Teams", "Careers", "News"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Safety"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-600 text-sm">&copy; 2024 Slotify Infrastructure Inc. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <span className="text-gray-600 text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                System Status: Operational
              </span>
              <div className="text-white font-bold tracking-widest text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" /> EN
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)
        }
      />
    </main>
  )
}

