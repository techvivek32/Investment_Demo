"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function ResetPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const token = sp.get("token")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setStatus("loading")
    const r = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const d = await r.json()
    if (r.ok) {
      setStatus("success")
      setMessage("Password updated. Redirecting to login...")
      setTimeout(() => router.push("/login"), 1500)
    } else {
      setStatus("error")
      setMessage(d.error || "Reset failed")
    }
  }

  return (
    <main className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
      {!token && <p className="text-red-600">Invalid reset link.</p>}
      {token && (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            required
            placeholder="New password"
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            {status === "loading" ? "Saving..." : "Update Password"}
          </button>
          {message && <p>{message}</p>}
        </form>
      )}
    </main>
  )
}
