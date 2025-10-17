import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import crypto from "crypto"
import { sendMail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    await connectDB()
    const user = await User.findOne({ email })
    // Do not reveal whether a user exists
    if (!user) return NextResponse.json({ ok: true })

    const token = crypto.randomBytes(32).toString("hex")
    user.emailVerificationToken = token
    user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
    await user.save()

    const origin = new URL(req.url).origin
    const link = `${origin}/auth/verify?token=${encodeURIComponent(token)}`
    await sendMail({
      to: email,
      subject: "Verify your email",
      html: `<p>Please verify your email by clicking the link below:</p><p><a href="${link}">${link}</a></p>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to send verification" }, { status: 500 })
  }
}
