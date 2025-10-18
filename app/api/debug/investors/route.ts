import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"

export async function GET() {
  try {
    await connectDB()
    
    const investors = await User.find({ role: "INVESTOR" })
      .select('name email kyc')
      .lean()
    
    const debugInfo = investors.map(investor => ({
      name: investor.name,
      email: investor.email,
      kyc: investor.kyc,
      documentsCount: investor.kyc?.documents ? Object.keys(investor.kyc.documents).length : 0,
      documentsKeys: investor.kyc?.documents ? Object.keys(investor.kyc.documents) : []
    }))
    
    return NextResponse.json(debugInfo)
  } catch (e: any) {
    console.error("[debug investors GET]", e)
    return NextResponse.json(
      { error: e.message || "Failed to fetch debug info" },
      { status: 500 }
    )
  }
}