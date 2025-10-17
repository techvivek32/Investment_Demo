"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Building2, Trash2 } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminBusinessesPage() {
  const { data, mutate } = useSWR("/api/admin/my-businesses", fetcher)
  const [form, setForm] = useState({ name: "", description: "", location: "" })
  const [loading, setLoading] = useState(false)

  const createBusiness = async () => {
    setLoading(true)
    await fetch("/api/businesses", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } })
    setLoading(false)
    setForm({ name: "", description: "", location: "" })
    mutate()
  }

  const deleteBusiness = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business?")) return
    await fetch(`/api/businesses/${id}`, { method: "DELETE" })
    toast.success("Business deleted")
    mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">All Businesses</h1>
          <p className="text-slate-600 mt-1">Create and manage all businesses on the platform (these are available for investment)</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
          <Plus className="h-4 w-4 mr-2" />
          New Business
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Create Business</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Button onClick={createBusiness} disabled={loading || !form.name} className="bg-gradient-to-r from-blue-500 to-indigo-600">
            {loading ? "Creating..." : "Create Business"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {(data || []).map((b: any) => (
          <Card key={b._id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{b.name}</p>
                  <p className="text-sm text-slate-500">{b.location || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteBusiness(b._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
