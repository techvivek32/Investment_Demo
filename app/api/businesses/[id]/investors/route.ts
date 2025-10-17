import { NextResponse } from "next/server"
import { Types } from "mongoose"

async function connectDB() {
  await import("@/lib/db").then((m: any) => m.connectToDB?.() || m.connectDB?.() || m.default?.())
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const Investment = (await import("@/models/investment")).default as any
  const User = (await import("@/models/user")).default as any
  const businessId = params.id
  const investments = await Investment.find({ business: businessId }).lean()
  const investorIds = [...new Set(investments.map((i: any) => String(i.investor)))].map((id) => new Types.ObjectId(id))
  const investors = await User.find({ _id: { $in: investorIds } }, { password: 0 }).lean()
  return NextResponse.json({ investors })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  try {
    const body = await req.json()
    const { investorId, amount, date, ownershipPct } = body
    if (!investorId || !amount) return NextResponse.json({ error: "Missing investorId or amount" }, { status: 400 })

    const Investment = (await import("@/models/investment")).default as any
    const created = await Investment.create({
      business: params.id,
      investor: investorId,
      amount,
      date: date ? new Date(date) : new Date(),
      ownershipPct: ownershipPct ?? null,
    })
    return NextResponse.json({ ok: true, investment: created })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}
