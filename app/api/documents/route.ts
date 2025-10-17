import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Document } from "@/models/document"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await connectDB()
    const url = new URL(req.url)
    const kind = url.searchParams.get("kind")
    const query: any = {}
    if (kind) query.kind = kind
    // investors only see their docs; admins see all; business owners see business docs they manage (kept simple here)
    const role = (session.user as any).role
    if (role === "INVESTOR") {
      query.ownerUser = (session.user as any).id
    }
    const items = await Document.find(query).sort({ createdAt: -1 }).limit(200)
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const doc = await Document.create({
      ...body,
      uploadedBy: (session.user as any).id,
    })
    return NextResponse.json(doc, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 })
  }
}
