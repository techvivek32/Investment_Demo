import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN" && role !== "BUSINESS_OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const payload = await req.json()
    await connectDB()
    const updated = await Investment.findByIdAndUpdate(params.id, payload, { new: true })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 })
  }
}
