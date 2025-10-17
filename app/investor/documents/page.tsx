"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function InvestorDocumentsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const uploadDoc = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/documents", { method: "POST", body: formData })
    setLoading(false)
    if (res.ok) toast.success("Document uploaded")
    else toast.error("Upload failed")
    setFile(null)
  }

  return (
    <main className="p-6 max-w-4xl mx-auto grid gap-6">
      <h1 className="text-2xl font-semibold">Documents & Compliance</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload KYC Documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label>Select File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={uploadDoc} disabled={loading || !file}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
