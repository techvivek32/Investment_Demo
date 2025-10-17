import { NextResponse } from "next/server"
import { connect } from "@/lib/db"
import Investment from "@/models/investment"

export async function GET() {
  await connect()
  const items = await (Investment as any)
    .find({})
    .populate("businessId", "name")
    .populate("userId", "email name")
    .lean()

  const header = ["Business", "Investor Name", "Investor Email", "Amount", "Ownership %", "Date"]
  const rows = items.map((i: any) => [
    i.businessId?.name || "",
    i.userId?.name || "",
    i.userId?.email || "",
    i.amount ?? "",
    i.ownershipPercent ?? "",
    i.createdAt ? new Date(i.createdAt).toISOString() : "",
  ])

  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=investors.csv",
    },
  })
}
