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
    
    const investments = await Investment.find({ investor: userId }).lean()
    
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const currentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount || 0), 0)
    const totalPnL = investments.reduce((sum, inv) => sum + (inv.realizedPnL || 0) + (inv.unrealizedPnL || 0), 0)
    const avgROI = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    return NextResponse.json({
      totalInvested,
      currentValue,
      totalPnL,
      avgROI,
      count: investments.length
    })
  } catch (e: any) {
    console.error("[my-investments/stats GET]", e)
    return NextResponse.json({ error: e.message || "Failed to fetch stats" }, { status: 500 })
  }
}
