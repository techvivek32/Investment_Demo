import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "INVESTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (session.user as any).id
    const investments = await Investment.find({ investor: userId })
      .populate("business", "name type location")
      .sort({ investedAt: -1 })
      .lean()

    return NextResponse.json(investments)
  } catch (e: any) {
    console.error("[investor/investments GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch investments" }, { status: 500 })
  }
}
