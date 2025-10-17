import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import { Types } from "mongoose"
import bcrypt from "bcryptjs"

// Update investor
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid investor ID" }, { status: 400 })
    }

    const body = await req.json()
    await connectDB()
    
    const updateData: any = { ...body }
    
    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10)
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt)
      delete updateData.password
    }
    
    // Don't allow changing email or role
    delete updateData.email
    delete updateData.role
    
    const investor = await User.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash -emailVerificationToken -passwordResetToken')
    
    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 })
    }
    
    return NextResponse.json(investor)
  } catch (e: any) {
    console.error("[investors/[id] PUT]", e)
    return NextResponse.json(
      { error: e.message || "Failed to update investor" },
      { status: 500 }
    )
  }
}

// Delete investor
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid investor ID" }, { status: 400 })
    }

    await connectDB()
    
    // Prevent deleting own account
    if (params.id === (session.user as any).id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      )
    }
    
    const result = await User.deleteOne({ 
      _id: params.id,
      role: "INVESTOR"
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[investors/[id] DELETE]", e)
    return NextResponse.json(
      { error: e.message || "Failed to delete investor" },
      { status: 500 }
    )
  }
}
