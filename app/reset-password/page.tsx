"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  const onSubmit = async () => {
    setMsg(null)
    const res = await fetch("/api/auth/request-reset", {
      method: "POST",
      body: JSON.stringify({ email, baseUrl: window.location.origin }),
    })
    if (res.ok) setMsg("If an account exists, a reset link has been sent.")
    else setMsg("Failed to send reset link")
  }

  return (
    <main className="min-h-svh grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={onSubmit} disabled={!email}>
            Send reset link
          </Button>
          {msg ? <p className="text-sm">{msg}</p> : null}
        </CardContent>
      </Card>
    </main>
  )
}
