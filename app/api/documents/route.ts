import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Document } from "@/models/document"

export async function GET(req: Request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')
    
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 })
    }

    const documents = await Document.find({ business: businessId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(documents)
  } catch (e: any) {
    console.error("[documents GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch documents" }, { status: 500 })
  }
}