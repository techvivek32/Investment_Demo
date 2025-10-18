import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "INVESTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findById((session.user as any).id).lean()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user profile without sensitive data
    const profile = {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      kyc: user.kyc || { verified: false }
    }

    return NextResponse.json(profile)
  } catch (e: any) {
    console.error("[investor-profile GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch profile" }, { status: 500 })
  }
}