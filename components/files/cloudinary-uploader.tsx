"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Signed = {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
}

export default function CloudinaryUploader({
  folder = "documents",
  onUploaded,
}: { folder?: string; onUploaded?: (payload: any) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = useCallback(async () => {
    if (!file) return
    setLoading(true)
    try {
      const sigRes = await fetch(`/api/cloudinary/sign?folder=${encodeURIComponent(folder)}`).then(
        (r) => r.json() as Promise<Signed>,
      )
      const data = new FormData()
      data.append("file", file)
      data.append("api_key", sigRes.apiKey)
      data.append("timestamp", String(sigRes.timestamp))
      data.append("signature", sigRes.signature)
      data.append("folder", sigRes.folder)
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloudName}/auto/upload`, {
        method: "POST",
        body: data,
      }).then((r) => r.json())
      onUploaded?.(uploadRes)
    } finally {
      setLoading(false)
      setFile(null)
    }
  }, [file, folder, onUploaded])

  return (
    <div className="grid gap-2">
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  )
}
