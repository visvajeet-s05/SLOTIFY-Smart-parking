"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-slate-950"
    >
      {children}
    </motion.main>
  )
}
