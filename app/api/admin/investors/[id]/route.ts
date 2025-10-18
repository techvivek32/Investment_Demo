import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import { Investment } from "@/models/investment"
import bcrypt from "bcryptjs"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
    
    // Handle file uploads
    const documents: any = {}
    
    console.log('Processing files for update...')
    let docIndex = 0
    
    // Process files sequentially until no more are found
    while (docIndex < 100) { // Safety limit
      const file = formData.get(`document${docIndex}`) as File
      
      if (!file || file.size === 0) {
        docIndex++
        continue
      }
      
      console.log(`Field document${docIndex}:`, `${file.name} (${file.size} bytes)`)
      
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
        console.log(`Saved document${docIndex} to ${filePath}`)
      } catch (error) {
        console.error(`Error saving document${docIndex}:`, error)
      }
      
      docIndex++
    }
    
    console.log('New documents to add:', documents)
    console.log('Total new documents:', Object.keys(documents).length)
    
    await connectDB()
    
    // Get existing investor to preserve existing documents
    const existingInvestor = await User.findById(params.id)
    const existingDocs = existingInvestor?.kyc?.documents || {}
    
    console.log('Existing documents:', existingDocs)
    
    // Find the next available document index
    const existingKeys = Object.keys(existingDocs || {})
    const existingIndices = existingKeys
      .filter(key => key.startsWith('document'))
      .map(key => parseInt(key.replace('document', '')))
      .filter(num => !isNaN(num))
    
    const nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0
    
    // Renumber new documents to start from nextIndex
    const renumberedDocuments: any = {}
    Object.keys(documents).forEach((key, index) => {
      const newKey = `document${nextIndex + index}`
      renumberedDocuments[newKey] = documents[key]
    })
    
    console.log('Renumbered new documents:', renumberedDocuments)
    
    const kyc = {
      verified: kycVerified,
      documents: { ...existingDocs, ...renumberedDocuments }
    }
    
    console.log('Final KYC documents:', kyc.documents)
    console.log('Total documents after merge:', Object.keys(kyc.documents).length)

    const updateData: any = {
      name,
      kyc
    }

    // Only update password if provided
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10)
      updateData.passwordHash = await bcrypt.hash(password, salt)
    }

    const investor = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash -emailVerificationToken -passwordResetToken')

    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 })
    }

    // Update investments if businesses are provided
    if (businesses.length > 0) {
      // Delete existing investments for this investor
      await Investment.deleteMany({ investor: params.id })
      
      // Create new investments
      const investments = businesses.map((business: any) => ({
        investor: params.id,
        business: business.businessId,
        amount: business.amount || 0,
        currentValue: business.amount || 0,
        ownershipPercent: business.percentage || 0,
        status: business.amount > 0 ? "ACTIVE" : "PENDING"
      }))
      
      await Investment.insertMany(investments)
    }

    return NextResponse.json(investor)
  } catch (e: any) {
    console.error("[investor PUT]", e)
    return NextResponse.json(
      { error: e.message || "Failed to update investor" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const investor = await User.findByIdAndDelete(params.id)
    
    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Investor deleted successfully" })
  } catch (e: any) {
    console.error("[investor DELETE]", e)
    return NextResponse.json(
      { error: e.message || "Failed to delete investor" },
      { status: 500 }
    )
  }
}