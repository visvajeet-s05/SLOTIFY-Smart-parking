"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Basic",
      description: "Perfect for occasional parkers",
      price: isAnnual ? 0 : 0,
      features: ["Find parking spots", "Real-time availability", "Basic filtering options", "Pay-as-you-go pricing"],
      notIncluded: ["Priority booking", "Discounted rates", "24/7 customer support", "Booking history"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      description: "For regular commuters and travelers",
      price: isAnnual ? 7200 : 600, // ₹600 per month OR ₹7200 annually
      features: [
        "All Basic features",
        "Priority booking",
        "Discounted rates (up to 15%)",
        "24/7 customer support",
        "Booking history",
        "Multiple vehicle profiles",
      ],
      notIncluded: ["Reserved parking spots", "Monthly parking passes"],
      cta: "Subscribe Now",
      popular: true,
    },
    {
      name: "Business",
      description: "For companies and frequent parkers",
      price: isAnnual ? 19200 : 1600, // ₹1600 per month OR ₹19200 annually
      features: [
        "All Premium features",
        "Reserved parking spots",
        "Monthly parking passes",
        "Team management",
        "Expense reporting",
        "API access",
        "Dedicated account manager",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <div className="pt-16 min-h-screen bg-black">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Choose the plan that works best for you. All plans include access to our platform.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <Label htmlFor="billing-toggle" className={isAnnual ? "text-gray-400" : "text-white"}>
                Monthly
              </Label>
              <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
              <Label htmlFor="billing-toggle" className={isAnnual ? "text-white" : "text-gray-400"}>
                Annually <span className="text-green-400 text-sm">(Save 20%)</span>
              </Label>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-gray-900 rounded-xl p-8 border ${
                  plan.popular ? "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]" : "border-gray-800"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{isAnnual ? "year" : "month"}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <div key={i} className="flex items-center text-gray-500">
                      <X className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
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
                Compare Plans
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">Find the plan that best suits your needs.</p>
            </motion.div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-4 px-6 bg-gray-900">Features</th>
                  <th className="text-center py-4 px-6 bg-gray-900">Basic</th>
                  <th className="text-center py-4 px-6 bg-gray-900 border-x border-gray-800">Premium</th>
                  <th className="text-center py-4 px-6 bg-gray-900">Business</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Find parking spots",
                  "Real-time availability",
                  "Filtering options",
                  "Priority booking",
                  "Discounted rates",
                  "24/7 customer support",
                  "Booking history",
                  "Multiple vehicle profiles",
                  "Reserved parking spots",
                  "Monthly parking passes",
                  "Team management",
                  "Expense reporting",
                  "API access",
                  "Dedicated account manager",
                ].map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                    <td className="py-4 px-6">{feature}</td>
                    <td className="text-center py-4 px-6">
                      {["Find parking spots", "Real-time availability", "Filtering options"].includes(feature) ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-6 border-x border-gray-700">
                      {[
                        "Find parking spots",
                        "Real-time availability",
                        "Filtering options",
                        "Priority booking",
                        "Discounted rates",
                        "24/7 customer support",
                        "Booking history",
                        "Multiple vehicle profiles",
                      ].includes(feature) ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-green-400 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Find answers to common questions about our pricing plans.
              </p>
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Can I switch between plans?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, you'll receive credit towards your next billing cycle.",
              },
              {
                question: "Is there a free trial?",
                answer: "We offer a 7-day free trial for our Premium plan. No credit card required to start your trial.",
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit and debit cards, as well as UPI, NetBanking, and Wallets.",
              },
              {
                question: "Can I cancel my subscription?",
                answer:
                  "Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to your plan until the end of your current billing cycle.",
              },
              {
                question: "Do you offer refunds?",
                answer:
                  "We offer a 30-day money-back guarantee for annual subscriptions. Monthly subscriptions are non-refundable.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
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
            <p>@2026 Smart Parking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
