import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Business } from "@/models/business"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await connectDB()
    // Admin sees all; business owners see theirs
    const role = (session.user as any).role
    const query = role === "ADMIN" ? {} : { managers: (session.user as any).id }
    const items = await Business.find(query).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch businesses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    await connectDB()
    const biz = await Business.create({
      ...body,
      createdBy: (session.user as any).id,
      managers: body.managers || [],
      // Do NOT set owner - these are other businesses available for investment
    })
    return NextResponse.json(biz, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create business" }, { status: 500 })
  }
}
