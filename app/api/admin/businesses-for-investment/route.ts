import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Business } from "@/models/business"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (session.user as any).id
    
    // Get businesses NOT owned by this admin (owner field is null or doesn't exist)
    const businesses = await Business.find({ 
      $or: [
        { owner: { $exists: false } },
        { owner: null },
        { $and: [{ owner: { $exists: true } }, { owner: { $ne: userId } }] }
      ]
    }).select("name type location").lean()

    return NextResponse.json(businesses)
  } catch (e: any) {
    console.error("[businesses-for-investment GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch businesses" }, { status: 500 })
  }
}
