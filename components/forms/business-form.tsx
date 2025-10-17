"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Business = {
  _id?: string
  name?: string
  description?: string
  location?: string
  registrationNumber?: string
  sector?: string
}

export default function BusinessForm({ initial }: { initial?: Business }) {
  const router = useRouter()
  const [state, setState] = useState<Business>({
    name: initial?.name || "",
    description: initial?.description || "",
    location: initial?.location || "",
    registrationNumber: initial?.registrationNumber || "",
    sector: initial?.sector || "",
  })
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    const method = initial?._id ? "PUT" : "POST"
    const url = initial?._id ? `/api/businesses?id=${initial._id}` : "/api/businesses"
    const res = await fetch(url, { method, body: JSON.stringify(state) })
    setLoading(false)
    if (res.ok) {
      router.push("/admin/businesses")
      router.refresh()
    } else {
      const j = await res.json().catch(() => ({}))
      alert(j.error || "Failed")
    }
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-pretty">{initial?._id ? "Edit Business" : "New Business"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sector">Sector</Label>
          <Input
            id="sector"
            value={state.sector}
            onChange={(e) => setState((s) => ({ ...s, sector: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={state.location}
            onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="registrationNumber">Registration #</Label>
          <Input
            id="registrationNumber"
            value={state.registrationNumber}
            onChange={(e) => setState((s) => ({ ...s, registrationNumber: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={state.description}
            onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
          />
        </div>
        <div>
          <Button onClick={onSubmit} disabled={loading}>
            {initial?._id ? "Save Changes" : "Create Business"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
