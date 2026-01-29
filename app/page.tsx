"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Star, Clock, Shield, ArrowRight, Car } from "lucide-react"
import LoginModal from "@/components/auth/login-modal"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    setIsLoaded(true)
    
    // Redirect if already logged in
    if (session?.user) {
      const role = session.user.role
      if (role === "OWNER") {
        router.push("/dashboard/owner")
      } else if (role === "ADMIN") {
        router.push("/dashboard/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [session, router])

  const features = [
    {
      icon: MapPin,
      title: "Real-time Availability",
      description: "Find available parking spots in real-time with our interactive map.",
    },
    {
      icon: Star,
      title: "Easy Booking",
      description: "Book parking spots with just a few clicks and secure your space.",
    },
    {
      icon: Clock,
      title: "Time-based Pricing",
      description: "Pay only for the time you need with our flexible pricing options.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Make secure payments through our trusted payment gateway.",
    },
  ]

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/images/Slotify_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center justify-center h-full px-4 pt-16"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
              Smart Parking
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Find and book parking spots in real-time with our interactive platform. Get access to thousands of parking
              spaces with just a few clicks.
            </p>
            <Button
              onClick={() => setShowLogin(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 rounded-lg text-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all duration-300"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-4">
              Why Choose Smart Parking?
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our platform offers a seamless parking experience with real-time updates and secure bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Finding and booking a parking spot has never been easier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Find a Spot",
                description: "Search for parking spots near your destination using our interactive map.",
                image: "/Step1.png",
              },
              {
                step: "02",
                title: "Book & Pay",
                description: "Select your preferred spot, choose your duration, and make a secure payment.",
                image: "/Step2.png",
              },
              {
                step: "03",
                title: "Park with Ease",
                description: "Use the generated QR code for seamless entry and exit from the parking area.",
                image: "/Step3.png",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -top-10 left-0 text-6xl font-bold text-purple-600/20">{item.step}</div>
                <div className="pt-8 border-t border-purple-600/30">
                  <div className="mb-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={250}
                      className="rounded-lg w-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-4">
                Experience Smart Parking on Your Mobile
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Download our mobile app for a seamless parking experience on the go. Find, book, and pay for parking
                spots right from your smartphone.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time parking availability",
                  "QR code for contactless entry",
                  "Booking history and receipts",
                  "Notifications and reminders",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  Download for iOS
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  Download for Android
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-[300px]">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[40px] blur-xl opacity-30 transform scale-105"></div>
                <Image
                  src="/placeholder.svg?height=600&width=300"
                  alt="Mobile App Preview"
                  width={300}
                  height={600}
                  className="relative z-10 rounded-[30px] border-8 border-gray-800 shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-6">
              Ready to Transform Your Parking Experience?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of users who have simplified their parking experience with Smart Parking.
            </p>
            <Button
              onClick={() => setShowLogin(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 rounded-lg text-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all duration-300"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Car className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">Smart Parking</span>
              </div>
              <p className="text-gray-400 mb-4">
                Find and book parking spots in real-time with our interactive platform.
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-white">
                    <span className="sr-only">{social}</span>
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Blog", "Press"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {["Help Center", "Partners", "Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>1234, Murugan Main Road</li>
                <li>Koyambedu, Chennai</li>
                <li>info@smartparking.com</li>
                <li>+91 1234567890</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Smart Parking. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </main>
  )
}