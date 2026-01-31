"use client"

import { motion } from "framer-motion"
import { MapPin, CreditCard, QrCode, Car, Clock, Shield } from "lucide-react"
import Image from "next/image"

export default function HowItWorks() {
  const steps = [
    {
      icon: MapPin,
      title: "Find a Parking Spot",
      description:
        "Use our interactive map to find available parking spots near your destination. Filter by price, distance, and amenities to find the perfect spot.",
      image: "/Step1.png",
    },
    {
      icon: CreditCard,
      title: "Book and Pay",
      description:
        "Select your preferred parking spot, choose your duration, and make a secure payment through our platform. We support multiple payment methods for your convenience.",
      image: "/Step2.png",
    },
    {
      icon: QrCode,
      title: "Get Your QR Code",
      description:
        "After successful payment, you'll receive a unique QR code that serves as your digital parking ticket. Save it to your phone or print it out.",
      image: "/Step3.png",
    },
    {
      icon: Car,
      title: "Park with Ease",
      description:
        "When you arrive at the parking location, scan your QR code at the entrance for seamless access. No need for physical tickets or cash payments.",
      image: "/Step4.png",
    },
  ]

  const features = [
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get real-time updates on parking availability and pricing changes.",
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "All payments are processed through our secure payment gateway.",
    },
    {
      icon: QrCode,
      title: "Contactless Entry",
      description: "Use QR codes for contactless entry and exit from parking areas.",
    },
    {
      icon: Car,
      title: "Vehicle Management",
      description: "Save multiple vehicles for quick and easy booking.",
    },
  ]

  return (
    <div className="pt-16 min-h-screen bg-black">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-6">
              How Slotify Works
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Our platform makes finding and booking parking spots simple, secure, and stress-free.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <span className="text-xl font-semibold">Step {index + 1}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h2>
                  <p className="text-lg text-gray-300 mb-6">{step.description}</p>
                </div>
                <div className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-xl opacity-30 transform scale-105"></div>
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={500}
                    height={300}
                    className="relative z-10 rounded-xl border border-gray-800 shadow-xl w-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-4">
                Key Features
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Slotify offers a range of features to make your parking experience seamless.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
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

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Find answers to common questions about Slotify.
              </p>
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[ 
              {
                question: "How do I find parking spots near my destination?",
                answer:
                  "Simply enter your destination in the search bar, and our platform will show you all available parking spots nearby. You can filter results by price, distance, and amenities.",
              },
              {
                question: "Can I cancel my booking?",
                answer:
                  "Yes, you can cancel your booking up to 30 minutes before your scheduled arrival time for a full refund. Cancellations made after this time may be subject to a cancellation fee.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit and debit cards, digital wallets (Apple Pay, Google Pay), and UPI payments for a seamless booking experience.",
              },
              {
                question: "What if I stay longer than my booked duration?",
                answer:
                  "If you need to extend your parking duration, you can do so through the app. Additional charges will apply based on the hourly rate of the parking spot.",
              },
              {
                question: "Is my payment information secure?",
                answer:
                  "Yes, all payment information is encrypted and processed through our secure payment gateway. We do not store your credit card details on our servers.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-400">
            <p>@2026 Slotify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
