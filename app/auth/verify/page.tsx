"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifyPage() {
  const sp = useSearchParams()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = sp.get("token")
    if (!token) return
    setStatus("loading")
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
      method: "GET",
    })
      .then(async (r) => {
        const d = await r.json()
        if (r.ok) {
          setStatus("success")
          setMessage("Email verified! You can close this tab.")
        } else {
          setStatus("error")
          setMessage(d.error || "Verification failed")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Verification failed")
      })
  }, [sp])

  return (
    <main className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
      {status === "loading" && <p>Verifying...</p>}
      {status === "success" && <p className="text-green-600">{message}</p>}
      {status === "error" && <p className="text-red-600">{message}</p>}
      {status === "idle" && <p>Open this page from the verification link in your email.</p>}
    </main>
  )
}
