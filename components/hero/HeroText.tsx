"use client"

import { useEffect, useState } from "react"

export default function HeroText() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setHidden(window.scrollY > 120)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={`transition-all duration-500 ${
        hidden ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100"
      }`}
    >
      <h1 className="text-xl md:text-2xl text-gray-300">
        Search and book the perfect parking spot in Tamil Nadu
      </h1>
    </div>
  )
}