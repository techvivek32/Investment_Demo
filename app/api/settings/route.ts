import { NextResponse } from "next/server"
import { Setting } from "@/models/setting"

async function connectDB() {
  await import("@/lib/db").then((m: any) => m.connectToDB?.() || m.connectDB?.() || m.default?.())
}

export async function GET(req: Request) {
  await connectDB()
  const url = new URL(req.url)
  const keys = url.searchParams.get("keys")?.split(",") || []
  const docs = await Setting.find({ key: { $in: keys } }).lean()
  const out: Record<string, any> = {}
  for (const d of docs) out[d.key] = d.value
  return NextResponse.json(out)
}

export async function POST(req: Request) {
  await connectDB()
  const { updates } = await req.json()
  if (!updates || typeof updates !== "object") return NextResponse.json({ error: "Invalid updates" }, { status: 400 })
  const ops = Object.entries(updates).map(([key, value]) =>
    Setting.updateOne({ key }, { $set: { value } }, { upsert: true }),
  )
  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
