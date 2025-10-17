"use client"

import { useEffect, useState } from "react"

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [message, setMessage] = useState("Verifying...")

  useEffect(() => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get("token")
    if (!token) {
      setStatus("error")
      setMessage("Missing token")
      return
    }
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed")
        setStatus("ok")
        setMessage("Email verified! You may now sign in.")
      })
      .catch((e) => {
        setStatus("error")
        setMessage(e.message || "Verification failed")
      })
  }, [])

  return (
    <main className="min-h-svh grid place-items-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-balance mb-2">Email Verification</h1>
        <p className={status === "error" ? "text-destructive" : ""}>{message}</p>
      </div>
    </main>
  )
}
