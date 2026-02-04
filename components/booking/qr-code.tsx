"use client"

import { useEffect, useRef } from "react"
import QRCodeLib from "qrcode"

interface QRCodeProps {
  value: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
  bgColor?: string
  fgColor?: string
}

export default function QRCode({
  value,
  size = 200,
  level = "M",
  bgColor = "#ffffff",
  fgColor = "#000000",
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          errorCorrectionLevel: level,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        },
        (error: unknown) => {
          if (error) console.error(error)
        },
      )
    }
  }, [value, size, level, bgColor, fgColor])

  return <canvas ref={canvasRef} />
}
