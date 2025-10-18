import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import { Investment } from "@/models/investment"
import bcrypt from "bcryptjs"

// Create a new investor
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const kycVerified = formData.get('kyc.verified') === 'true'
    const businessesData = formData.get('businesses') as string
    const businesses = businessesData ? JSON.parse(businessesData) : []
    
    console.log('Received form data:', { name, email, password: password ? '***' : 'empty', kycVerified })
    
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password })
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }
    
    // Handle file uploads
    const documents: any = {}
    
    console.log('=== PROCESSING FILES ===')
    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('document')) {
        console.log(`${key}: ${value instanceof File ? `${value.name} (${value.size} bytes)` : value}`)
      }
    }
    
    let docIndex = 0
    
    // Process files sequentially until no more are found
    while (docIndex < 100) { // Safety limit
      const file = formData.get(`document${docIndex}`) as File
      
      if (!file || file.size === 0) {
        docIndex++
        continue
      }
      
      console.log(`Processing document${docIndex}: ${file.name} (${file.size} bytes)`)
      
      try {
        const fileName = `${Date.now()}-document${docIndex}-${file.name}`
        const filePath = `uploads/${fileName}`
        
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const fs = require('fs')
        const path = require('path')
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        
        fs.writeFileSync(path.join(uploadDir, fileName), buffer)
        documents[`document${docIndex}`] = filePath
        console.log(`✓ Saved document${docIndex} to ${filePath}`)
      } catch (error) {
        console.error(`✗ Error saving document${docIndex}:`, error)
      }
      
      docIndex++
    }
    
    console.log('=== FINAL DOCUMENTS OBJECT ===')
    console.log(JSON.stringify(documents, null, 2))
    console.log(`Total documents processed: ${Object.keys(documents).length}`)
    
    const kyc = {
      verified: kycVerified,
      documents
    }
    
    console.log('KYC object:', kyc)


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
      kyc
    })
    
    console.log('=== INVESTOR CREATED ===')
    console.log('Investor KYC documents saved:', JSON.stringify(investor.kyc.documents, null, 2))
    console.log('Total documents in DB:', Object.keys(investor.kyc.documents || {}).length)

    // Create initial investments for selected businesses
    if (businesses.length > 0) {
      const investments = businesses.map((business: any) => ({
        investor: investor._id,
        business: business.businessId,
        amount: business.amount || 0,
        currentValue: business.amount || 0,
        ownershipPercent: business.percentage || 0,
        status: business.amount > 0 ? "ACTIVE" : "PENDING"
      }))
      
      await Investment.insertMany(investments)
    }

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
    
    // Ensure all investors have proper documents structure
    const investorsWithDocs = investors.map(investor => ({
      ...investor,
      kyc: {
        verified: investor.kyc?.verified || false,
        documents: investor.kyc?.documents || {}
      }
    }))
    
    return NextResponse.json(investorsWithDocs)
  } catch (e: any) {
    console.error("[investors GET]", e)
    return NextResponse.json(
      { error: e.message || "Failed to fetch investors" },
      { status: 500 }
    )
  }
}
