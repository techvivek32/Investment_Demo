"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ResetPasswordTokenPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  const onSubmit = async () => {
    setMsg(null)
    const res = await fetch("/api/auth/reset", { method: "POST", body: JSON.stringify({ token, password }) })
    if (res.ok) {
      setMsg("Password reset successful. Redirecting to login...")
      setTimeout(() => router.push("/login"), 1500)
    } else setMsg("Failed to reset password")
  }

  return (
    <main className="min-h-svh grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label>New Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button onClick={onSubmit} disabled={!password}>
            Update Password
          </Button>
          {msg ? <p className="text-sm">{msg}</p> : null}
        </CardContent>
      </Card>
    </main>
  )
}
