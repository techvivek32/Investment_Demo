"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewInvestmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    businessLocation: "",
    mapLink: "",
    amount: "",
    instrumentType: "EQUITY",
    ownershipPercent: "",
    notes: ""
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // First create the business
      const bizRes = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.businessName,
          type: form.businessType,
          location: form.businessLocation,
          description: "External investment"
        })
      })
      
      if (bizRes.ok) {
        const business = await bizRes.json()
        
        // Then create the investment
        const res = await fetch("/api/admin/my-investments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business: business._id,
            amount: parseFloat(form.amount),
            instrumentType: form.instrumentType,
            ownershipPercent: form.ownershipPercent ? parseFloat(form.ownershipPercent) : 0,
            mapLink: form.mapLink.trim() || null,
            notes: form.notes
          })
        })

        if (res.ok) {
          toast.success("Investment created successfully!")
          router.push("/admin/my-investments")
        } else {
          const error = await res.json()
          console.error("Investment creation failed:", error)
          toast.error("Failed to create investment: " + (error.error || "Unknown error"))
        }
      } else {
        const error = await bizRes.json()
        console.error("Business creation failed:", error)
        toast.error("Failed to create business: " + (error.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An error occurred while saving the investment")
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/my-investments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Add New Investment</h1>
          <p className="text-slate-600 mt-1">Record your personal investment in an external company</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-3">Business Information</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    required
                    placeholder="Enter the business name"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="businessType">Business Type/Industry</Label>
                  <Input
                    id="businessType"
                    placeholder="e.g., Technology, Real Estate, Healthcare"
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="businessLocation">Business Location</Label>
                  <Input
                    id="businessLocation"
                    placeholder="e.g., New York, USA"
                    value={form.businessLocation}
                    onChange={(e) => setForm({ ...form, businessLocation: e.target.value })}
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
              </div>
            </div>

            <h3 className="font-semibold mb-3">Investment Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="amount">Investment Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instrumentType">Instrument Type *</Label>
              <select
                id="instrumentType"
                value={form.instrumentType}
                onChange={(e) => setForm({ ...form, instrumentType: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                suppressHydrationWarning
              >
                <option value="EQUITY">Equity</option>
                <option value="DEBT">Debt</option>
                <option value="CONVERTIBLE">Convertible</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownershipPercent">Ownership Percentage (%)</Label>
              <Input
                id="ownershipPercent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.ownershipPercent}
                onChange={(e) => setForm({ ...form, ownershipPercent: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !form.businessName || !form.amount}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                {loading ? "Creating..." : "Add Investment"}
              </Button>
              <Link href="/admin/my-investments">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
