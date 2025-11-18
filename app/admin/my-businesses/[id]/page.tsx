"use client"

import useSWR from "swr"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, FileText, MapPin, Upload, Trash2 } from "lucide-react"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function BusinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: business, mutate } = useSWR(`/api/admin/my-businesses/${params.id}`, fetcher)
  const { data: investments = [] } = useSWR(`/api/investments?business=${params.id}`, fetcher)
  const { data: documents = [], mutate: mutateDocuments } = useSWR(`/api/documents?businessId=${params.id}`, fetcher)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  if (!business) return <div>Loading...</div>

  const currentForm = form || business

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    await fetch(`/api/admin/my-businesses/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentForm)
    })

    mutate()
    setLoading(false)
    setForm(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("businessId", params.id as string)
        fd.append("tag", "business")
        
        await fetch("/api/uploads", { method: "POST", body: fd })
      }
      mutateDocuments()
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" })
      mutateDocuments()
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/my-businesses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{business.name}</h1>
          <p className="text-slate-600 mt-1">Manage business details</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={currentForm.name}
                onChange={(e) => setForm({ ...currentForm, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Industry/Type</Label>
              <Input
                id="type"
                value={currentForm.type || ""}
                onChange={(e) => setForm({ ...currentForm, type: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={currentForm.description || ""}
                onChange={(e) => setForm({ ...currentForm, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={currentForm.location || ""}
                onChange={(e) => setForm({ ...currentForm, location: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mapLink">Map Link</Label>
              <Input
                id="mapLink"
                value={currentForm.mapLink || ""}
                onChange={(e) => setForm({ ...currentForm, mapLink: e.target.value })}
                placeholder="Google Maps URL"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={currentForm.registrationNumber || ""}
                onChange={(e) => setForm({ ...currentForm, registrationNumber: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valuation">Valuation ($)</Label>
              <Input
                id="valuation"
                type="number"
                value={currentForm.valuation || 0}
                onChange={(e) => setForm({ ...currentForm, valuation: parseFloat(e.target.value) })}
              />
            </div>

            {form && (
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {(business.mapLink || business.location) && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden bg-slate-50">
              <iframe
                src={business.mapLink && business.mapLink.includes('embed') 
                  ? business.mapLink 
                  : `https://maps.google.com/maps?q=${encodeURIComponent(business.location || '')}&output=embed`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Business Location Map"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={uploading} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Add Documents'}
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: any) => (
                <div key={doc._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.filename}</p>
                      <p className="text-sm text-gray-500">
                        {(doc.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Document
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No documents uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Investors</CardTitle>
          <p className="text-sm text-muted-foreground">People who have invested in this business</p>
        </CardHeader>
        <CardContent>
          {investments.length > 0 ? (
            <div className="space-y-4">
              {investments.map((investment: any) => (
                <div key={investment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {investment.investor?.name?.charAt(0) || 'I'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{investment.investor?.name || 'Unknown Investor'}</p>
                      <p className="text-sm text-muted-foreground">{investment.investor?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${investment.amount?.toLocaleString() || 0}</p>
                    <p className="text-sm text-muted-foreground">{investment.ownershipPercent || 0}% ownership</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      investment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      investment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No investors yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
