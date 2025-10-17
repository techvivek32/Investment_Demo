import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (session.user as any).id
    const investment = await Investment.findOne({ 
      _id: id, 
      investor: userId 
    })
      .populate("business", "name type description location")
      .populate("project", "name status")
      .lean()

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    return NextResponse.json(investment)
  } catch (e: any) {
    console.error("[my-investments/:id GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch investment" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()
    
    const userId = (session.user as any).id
    const investment = await Investment.findOneAndUpdate(
      { _id: id, investor: userId },
      body,
      { new: true }
    )

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    return NextResponse.json(investment)
  } catch (e: any) {
    console.error("[my-investments/:id PUT]", e)
    return NextResponse.json({ error: e.message || "Failed to update investment" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (session.user as any).id
    const investment = await Investment.findOneAndDelete({ _id: id, investor: userId })

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[my-investments/:id DELETE]", e)
    return NextResponse.json({ error: e.message || "Failed to delete investment" }, { status: 500 })
  }
}
