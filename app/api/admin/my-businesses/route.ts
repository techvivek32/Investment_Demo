import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Business } from "@/models/business"
import { Project } from "@/models/project"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (session.user as any).id
    const businesses = await Business.find({ 
      owner: userId 
    }).lean()
    
    const businessesWithProjects = await Promise.all(
      businesses.map(async (business) => {
        const projectCount = await Project.countDocuments({ business: business._id })
        return { 
          _id: business._id.toString(),
          name: business.name,
          description: business.description,
          type: business.type,
          location: business.location,
          valuation: business.valuation,
          createdAt: business.createdAt,
          projectCount 
        }
      })
    )

    return NextResponse.json(businessesWithProjects)
  } catch (e: any) {
    console.error("[my-businesses GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch businesses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()
    
    const userId = (session.user as any).id
    const business = await Business.create({
      ...body,
      owner: userId,
      createdBy: userId
    })

    console.log("[my-businesses POST] Created:", business._id)
    return NextResponse.json(business, { status: 201 })
  } catch (e: any) {
    console.error("[my-businesses POST]", e)
    return NextResponse.json({ error: e.message || "Failed to create business" }, { status: 500 })
  }
}
