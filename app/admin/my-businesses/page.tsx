"use client"

import useSWR from "swr"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Plus, FolderOpen, TrendingUp, Trash2 } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Failed to fetch')
  return r.json()
})

export default function MyBusinessesPage() {
  const { data: businesses, error, isLoading, mutate } = useSWR("/api/admin/my-businesses", fetcher)

  const deleteBusiness = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business?")) return
    await fetch(`/api/admin/my-businesses/${id}`, { method: "DELETE" })
    toast.success("Business deleted")
    mutate()
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-red-600">Error loading businesses</h1>
        <p className="text-slate-600">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">My Businesses</h1>
          <p className="text-slate-600 mt-1">Businesses you own and manage</p>
        </div>
        <Link href="/admin/my-businesses/new">
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            New Business
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses && businesses.length > 0 && businesses.map((business: any) => (
          <Card key={business._id} className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <p className="text-sm text-slate-500">{business.type || "Business"}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 line-clamp-2">{business.description || "No description"}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Valuation</span>
                <span className="font-semibold">${business.valuation?.toLocaleString() || 0}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Projects</span>
                <span className="font-semibold">{business.projectCount || 0}</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/admin/my-businesses/${business._id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </Link>
                <Link href={`/admin/my-businesses/${business._id}/projects`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Projects
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => deleteBusiness(business._id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {businesses && businesses.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">You don't own any businesses yet</p>
            <Link href="/admin/my-businesses/new">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Business
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
