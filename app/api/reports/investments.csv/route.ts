import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })
    await connectDB()
    const role = (session.user as any).role
    const query: any = role === "INVESTOR" ? { investor: (session.user as any).id } : {}
    const items = await Investment.find(query).populate("business investor").lean()
    const header = ["InvestmentID", "InvestorEmail", "Business", "Amount", "Currency", "OwnershipPercent", "InvestedAt"]
    const lines = [header.join(",")]
    for (const it of items) {
      lines.push(
        [
          it._id,
          (it.investor as any)?.email || "",
          (it.business as any)?.name || "",
          it.amount,
          it.currency,
          it.ownershipPercent,
          new Date(it.investedAt).toISOString(),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
    }
    const csv = lines.join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="investments.csv"',
      },
    })
  } catch (e: any) {
    return new NextResponse("Failed to export", { status: 500 })
  }
}
