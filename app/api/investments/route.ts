import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"
import { Business } from "@/models/business"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await connectDB()
    const role = (session.user as any).role
    const query: any = {}
    if (role === "INVESTOR") query.investor = (session.user as any).id
    const items = await Investment.find(query).populate("business").sort({ createdAt: -1 }).limit(200)
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch investments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN" && role !== "BUSINESS_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await req.json()
    await connectDB()
    
    // Ensure the business exists and is not created automatically
    const business = await Business.findById(body.business).lean()
    if (!business) {
      return NextResponse.json({ 
        error: "Business not found. Please create the business first before making an investment." 
      }, { status: 404 })
    }
    
    // Create the investment with a reference to the existing business
    const inv = await Investment.create({
      business: body.business,  // Use the existing business ID
      amount: body.amount,
      investor: (session.user as any).id,
      currentValue: body.amount, // Initial value is same as investment amount
      // Copy other relevant fields from body, excluding business creation data
      ...(body.project && { project: body.project }),
      ...(body.notes && { notes: body.notes }),
      // Add other investment-specific fields here
    })
    
    return NextResponse.json(inv, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create investment" }, { status: 500 })
  }
}
