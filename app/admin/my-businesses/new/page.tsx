"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

export default function NewBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    location: "",
    mapLink: "",
    registrationNumber: "",
    valuation: ""
  })
  const [documents, setDocuments] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const extractEmbedUrl = (url: string): string => {
    if (!url) return ""
    
    const cleanUrl = url.trim()
    
    // If already an embed URL, return as is
    if (cleanUrl.includes('google.com/maps/embed') || cleanUrl.includes('maps/embed/v1')) {
      return cleanUrl
    }
    
    // Extract from iframe HTML
    const iframeMatch = cleanUrl.match(/src=["']([^"']*google\.com\/maps\/embed[^"']*)["']/)
    if (iframeMatch) {
      return iframeMatch[1]
    }
    
    // Convert regular Google Maps URL to embed URL
    if (cleanUrl.includes('google.com/maps') || cleanUrl.includes('maps.google.com')) {
      // Extract coordinates
      const coordMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (coordMatch) {
        const [, lat, lng] = coordMatch
        return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v${Date.now()}`
      }
      
      // Extract place name from URL
      const placeMatch = cleanUrl.match(/\/place\/([^/@?]+)/)
      if (placeMatch) {
        const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
        return `https://www.google.com/maps/embed/v1/place?key=demo&q=${encodeURIComponent(place)}`
      }
      
      // Handle search queries
      const searchMatch = cleanUrl.match(/\/search\/([^/@?]+)/)
      if (searchMatch) {
        const query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '))
        return `https://www.google.com/maps/embed/v1/search?key=demo&q=${encodeURIComponent(query)}`
      }
    }
    
    return cleanUrl
  }

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocuments(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const uploadDocuments = async (businessId: string) => {
    if (documents.length === 0) return
    
    setUploading(true)
    try {
      for (const file of documents) {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("businessId", businessId)
        fd.append("tag", "business")
        
        const res = await fetch("/api/uploads", { method: "POST", body: fd })
        if (!res.ok) {
          console.error(`Failed to upload ${file.name}`)
        }
      }
    } catch (error) {
      console.error("Document upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const res = await fetch("/api/admin/my-businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        valuation: form.valuation ? parseFloat(form.valuation) : 0,
        mapLink: form.mapLink || null
      })
    })

    if (res.ok) {
      const business = await res.json()
      await uploadDocuments(business._id)
      router.push("/admin/my-businesses")
    }
    setLoading(false)
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Create New Business</h1>
          <p className="text-slate-600 mt-1">Add a business you own</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Industry/Type</Label>
              <Input
                id="type"
                placeholder="e.g., Technology, Real Estate, Manufacturing"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, USA"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mapLink">Map Link (Optional)</Label>
              <Input
                id="mapLink"
                placeholder="Paste any Google Maps URL or embed code"
                value={form.mapLink}
                onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                Paste any Google Maps URL, share link, or embed code
              </p>
              
              {form.mapLink && (() => {
                const embedUrl = extractEmbedUrl(form.mapLink)
                return (
                  <div className="mt-2">
                    <Label>Map Preview</Label>
                    <div className="border rounded-md overflow-hidden bg-slate-50">
                      {embedUrl && (embedUrl.includes('google.com/maps/embed') || embedUrl.includes('maps/embed/v1') || embedUrl.includes('google.com/maps')) ? (
                        <iframe
                          src={embedUrl}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Business Location Map"
                        />
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          <p>Unable to create map preview</p>
                          <p className="text-xs mt-1">Please paste a valid Google Maps URL</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valuation">Initial Valuation ($)</Label>
              <Input
                id="valuation"
                type="number"
                min="0"
                step="0.01"
                value={form.valuation}
                onChange={(e) => setForm({ ...form, valuation: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Documents (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-800 underline">
                      Click to upload documents
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileAdd}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload any business documents (unlimited size & quantity)
                  </p>
                </div>
              </div>
              
              {documents.length > 0 && (
                <div className="space-y-2 mt-3">
                  <Label>Selected Documents ({documents.length})</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="truncate">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || uploading || !form.name}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                {loading ? "Creating..." : uploading ? "Uploading..." : "Create Business"}
              </Button>
              <Link href="/admin/my-businesses">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
