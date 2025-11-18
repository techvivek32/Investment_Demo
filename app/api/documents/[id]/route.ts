import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Document } from "@/models/document"
import fs from "fs/promises"
import path from "path"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    
    const document = await Document.findById(params.id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete physical file
    try {
      const filePath = path.join(process.cwd(), "public", document.url)
      await fs.unlink(filePath)
    } catch (fileError) {
      console.warn("Could not delete physical file:", fileError)
    }

    // Delete database record
    await Document.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[document DELETE]", e)
    return NextResponse.json({ error: e.message || "Failed to delete document" }, { status: 500 })
  }
}