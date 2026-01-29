"use client"

import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"

export default function ConfettiEffect() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [particles, setParticles] = useState(200)

  useEffect(() => {
    const { innerWidth, innerHeight } = window
    setDimensions({
      width: innerWidth,
      height: innerHeight,
    })

    const timer = setTimeout(() => {
      setParticles(0)
    }, 5000)

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timer)
    }
  }, [])

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={particles}
      recycle={false}
      colors={["#a855f7", "#6366f1", "#22c55e", "#3b82f6", "#f97316"]}
    />
  )
}

