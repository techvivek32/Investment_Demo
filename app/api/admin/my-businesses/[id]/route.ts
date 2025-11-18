import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Business } from "@/models/business"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (session.user as any).id
    const business = await Business.findOne({ 
      _id: id, 
      $or: [{ owner: userId }, { createdBy: userId }]
    }).lean()

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: business._id.toString(),
      name: business.name,
      description: business.description,
      type: business.type,
      location: business.location,
      mapLink: business.mapLink,
      registrationNumber: business.registrationNumber,
      valuation: business.valuation,
      createdAt: business.createdAt
    })
  } catch (e: any) {
    console.error("[my-businesses/:id GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch business" }, { status: 500 })
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
    const business = await Business.findOneAndUpdate(
      { _id: id, $or: [{ owner: userId }, { createdBy: userId }] },
      body,
      { new: true }
    )

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    console.log("[my-businesses/:id PUT] Updated:", business._id)
    return NextResponse.json(business)
  } catch (e: any) {
    console.error("[my-businesses/:id PUT]", e)
    return NextResponse.json({ error: e.message || "Failed to update business" }, { status: 500 })
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
    const business = await Business.findOneAndDelete({ 
      _id: id, 
      $or: [{ owner: userId }, { createdBy: userId }] 
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[my-businesses/:id DELETE]", e)
    return NextResponse.json({ error: e.message || "Failed to delete business" }, { status: 500 })
  }
}
