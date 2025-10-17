import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import mime from "mime"
import { default as DocumentModel } from "@/models/document"

async function connectDB() {
  await import("@/lib/db").then((m: any) => m.connectToDB?.() || m.connectDB?.() || m.default?.())
}

export async function POST(req: Request) {
  await connectDB()
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const ownerId = form.get("ownerId") as string | null
    const businessId = form.get("businessId") as string | null
    const projectId = form.get("projectId") as string | null
    const tag = (form.get("tag") as string | null) || "general"

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
    const buffer = Buffer.from(await file.arrayBuffer())

    const ext = mime.getExtension(file.type) || "bin"
    const safeName = (file.name || `file.${ext}`).replace(/[^a-zA-Z0-9._-]/g, "_")
    const id = crypto.randomUUID()
    const filename = `${id}_${safeName}`

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })
    const target = path.join(uploadDir, filename)
    await fs.writeFile(target, buffer)

    const urlPath = `/uploads/${filename}`
    const kindFromTag = (tag || "general").toUpperCase()
    const allowedKinds = new Set(["KYC", "BUSINESS", "PROJECT", "INVESTMENT"])
    const kind = allowedKinds.has(kindFromTag) ? kindFromTag : "PROJECT"

    const doc = await (DocumentModel as any).create({
      ownerUser: ownerId || null,
      business: businessId || null,
      project: projectId || null,
      kind,
      url: urlPath,
      publicId: null,
      filename: safeName,
      mimeType: file.type,
      size: buffer.length,
      tags: tag ? [tag] : [],
      uploadedBy: ownerId || null,
    })

    return NextResponse.json({ ok: true, document: doc, path: urlPath })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 })
  }
}
