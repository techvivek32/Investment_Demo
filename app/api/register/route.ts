import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body || {}
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 })

    await connectDB()
    const existing = await User.findOne({ email })
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 })

    const passwordHash = await hash(password, 10)
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: ["ADMIN", "BUSINESS_OWNER", "INVESTOR"].includes(role) ? role : "INVESTOR",
      emailVerified: false,
    })
    return NextResponse.json({ id: user._id, email: user.email, role: user.role }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Registration failed" }, { status: 500 })
  }
}
