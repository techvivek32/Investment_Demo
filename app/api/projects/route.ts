import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Project } from "@/models/project"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await connectDB()
    
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("business")
    
    const query = businessId ? { business: businessId } : {}
    const items = await Project.find(query).populate("business").sort({ createdAt: -1 }).limit(200)
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch projects" }, { status: 500 })
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
    const proj = await Project.create(body)
    return NextResponse.json(proj, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create project" }, { status: 500 })
  }
}
