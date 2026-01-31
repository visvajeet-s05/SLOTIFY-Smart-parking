"use client"

import { motion } from "framer-motion"

export default function AnimatedBackground() {
  return (
    <motion.div
      className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-black"
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: "400% 400%",
      }}
    />
  )
}