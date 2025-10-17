import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"

// Create a new investor
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, kyc } = await req.json()
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new investor
    const investor = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: "INVESTOR",
      emailVerified: true,
      kyc: kyc || { verified: false }
    })

    // Don't send back sensitive data
    const { passwordHash, ...result } = investor.toObject()
    
    return NextResponse.json(result, { status: 201 })
  } catch (e: any) {
    console.error("[investors POST]", e)
    return NextResponse.json(
      { error: e.message || "Failed to create investor" },
      { status: 500 }
    )
  }
}

// Get all investors
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const investors = await User.find({ role: "INVESTOR" })
      .select('-passwordHash -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json(investors)
  } catch (e: any) {
    console.error("[investors GET]", e)
    return NextResponse.json(
      { error: e.message || "Failed to fetch investors" },
      { status: 500 }
    )
  }
}
