import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (session.user as any).id
    console.log("[my-investments GET] User ID:", userId)
    
    const investments = await Investment.find({ investor: userId })
      .populate("business", "name type")
      .sort({ investedAt: -1 })
      .lean()
    
    console.log("[my-investments GET] Found investments:", investments.length)
    return NextResponse.json(investments)
  } catch (e: any) {
    console.error("[my-investments GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch investments" }, { status: 500 })
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
    
    const investment = await Investment.create({
      ...body,
      investor: (session.user as any).id,
      currentValue: body.amount
    })

    console.log("[my-investments POST] Created:", investment._id)
    return NextResponse.json(investment, { status: 201 })
  } catch (e: any) {
    console.error("[my-investments POST]", e)
    return NextResponse.json({ error: e.message || "Failed to create investment" }, { status: 500 })
  }
}
