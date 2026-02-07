"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function AuthRedirect() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log("AUTH REDIRECT CHECK:", status, session)
  }, [status, session])

  return null
}
