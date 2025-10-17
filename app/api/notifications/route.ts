import { NextResponse } from "next/server"
import { connect } from "@/lib/db"
import Notification from "@/models/notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-helpers"

export async function GET() {
  try {
    await connect()
    const session = await getServerSession(authOptions as any)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const items = await (Notification as any).find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(50)
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await connect()
    const session = await getServerSession(authOptions as any)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { ids } = await req.json()
    if (!Array.isArray(ids)) return NextResponse.json({ error: "ids[] required" }, { status: 400 })
    await (Notification as any).updateMany({ _id: { $in: ids }, userId: session.user.id }, { $set: { read: true } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
