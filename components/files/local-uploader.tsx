"use client"

import type React from "react"

import { useState } from "react"

export function LocalUploader({
  ownerId,
  businessId,
  projectId,
  tag = "kyc",
  onUploaded,
}: {
  ownerId?: string
  businessId?: string
  projectId?: string
  tag?: string
  onUploaded?: (d: any) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      if (ownerId) fd.append("ownerId", ownerId)
      if (businessId) fd.append("businessId", businessId)
      if (projectId) fd.append("projectId", projectId)
      if (tag) fd.append("tag", tag)
      const r = await fetch("/api/uploads", { method: "POST", body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Upload failed")
      onUploaded?.(d.document)
      setFile(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
      <button
        type="submit"
        disabled={!file || loading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-primary-foreground"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </form>
  )
}
