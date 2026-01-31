"use client"

import { ChevronDown } from "lucide-react"

export default function ScrollDownArrow() {
  const handleScroll = () => {
    const nextSection = document.getElementById("home-section-2")
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <button
      onClick={handleScroll}
      aria-label="Scroll down"
      className="
        absolute bottom-10 left-1/2 -translate-x-1/2
        flex flex-col items-center gap-2
        text-white/80 hover:text-purple-400
        transition-all duration-300
        animate-bounce
      "
    >
      <span className="text-sm tracking-wide opacity-70">
        Explore
      </span>

      <div className="
        w-12 h-12 rounded-full
        border border-white/20
        flex items-center justify-center
        bg-black/40 backdrop-blur
        hover:border-purple-400 hover:scale-110
        transition-all duration-300
      ">
        <ChevronDown className="w-6 h-6" />
      </div>
    </button>
  )
}
