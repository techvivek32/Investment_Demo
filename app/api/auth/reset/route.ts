import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    await connectDB()
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    })
    if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    user.passwordHash = await hash(password, 10)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 })
  }
}
