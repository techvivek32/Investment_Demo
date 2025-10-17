import { NextResponse } from "next/server"
import { connect } from "@/lib/db"
import Business from "@/models/business"
import Investment from "@/models/investment"

export async function GET() {
  try {
    await connect()
    const [totals] = await (Investment as any).aggregate([
      { $group: { _id: null, totalCapital: { $sum: "$amount" }, count: { $sum: 1 } } },
    ])
    const businesses = await (Business as any).find({}, { name: 1, sector: 1 }).lean()
    const perBusiness = await (Investment as any).aggregate([
      { $group: { _id: "$businessId", invested: { $sum: "$amount" }, count: { $sum: 1 } } },
    ])
    const perfOverTime = await (Investment as any).aggregate([
      { $project: { month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, amount: "$amount" } },
      { $group: { _id: "$month", value: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ])

    return NextResponse.json({
      totalCapital: totals?.totalCapital || 0,
      totalInvestments: totals?.count || 0,
      businesses,
      perBusiness,
      perfOverTime,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
