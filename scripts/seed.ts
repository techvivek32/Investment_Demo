import { hash } from "bcryptjs"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(__dirname, "../.env.local") })

async function seed() {
  const { connectDB } = await import("../lib/db")
  const { User } = await import("../models/user")
  const { Business } = await import("../models/business")
  
  await connectDB()
  
  const adminExists = await User.findOne({ email: "admin@test.com" })
  if (!adminExists) {
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      passwordHash: await hash("Admin123!", 10),
      role: "ADMIN",
      emailVerified: true,
    })
    console.log("✓ Admin user created: admin@test.com / Admin123!")
    
    await Business.create({
      name: "TechNova Ltd",
      description: "Technology startup focused on AI solutions",
      type: "Technology",
      location: "San Francisco, CA",
      createdBy: adminUser._id,
      owner: adminUser._id,
      valuation: 5000000,
    })
    console.log("✓ Sample business created (owned by admin)")
    
    // Create businesses without owner for investment opportunities
    await Business.create({
      name: "GreenTech Solutions",
      description: "Renewable energy and sustainability company",
      type: "Energy",
      location: "Austin, TX",
      createdBy: adminUser._id,
      valuation: 3000000,
    })
    
    await Business.create({
      name: "HealthCare Plus",
      description: "Digital healthcare platform",
      type: "Healthcare",
      location: "Boston, MA",
      createdBy: adminUser._id,
      valuation: 4500000,
    })
    console.log("✓ Investment opportunity businesses created")
  } else {
    console.log("Admin user already exists")
  }
  

  
  const invExists = await User.findOne({ email: "investor@test.com" })
  if (!invExists) {
    await User.create({
      name: "Investor User",
      email: "investor@test.com",
      passwordHash: await hash("Investor123!", 10),
      role: "INVESTOR",
      emailVerified: true,
    })
    console.log("✓ Investor created: investor@test.com / Investor123!")
  }
  
  console.log("\n✓ Database seeded successfully!")
  process.exit(0)
}

seed().catch((e) => {
  console.error("Seed failed:", e)
  process.exit(1)
})
