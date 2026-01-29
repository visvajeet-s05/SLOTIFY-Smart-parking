const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function createTestOwner() {
  try {
    // Hash the password
    const password = "owner@123"
    const hashedPassword = await bcrypt.hash(password, 10)
    
    console.log("Hashed password:", hashedPassword)
    
    // Create the owner user
    const owner = await prisma.user.create({
      data: {
        id: "test-owner-id-" + Math.random().toString(36).substr(2, 9),
        email: "owner@gmail.com",
        password: hashedPassword,
        role: "OWNER",
        name: "Test Owner",
        ownerprofile: {
          create: {
            id: "test-owner-profile-id-" + Math.random().toString(36).substr(2, 9),
            businessName: "Test Parking Lot",
            phone: "+919876543210",
            status: "APPROVED",
            updatedAt: new Date()
          }
        }
      },
      include: {
        ownerprofile: true
      }
    })
    
    console.log("✅ Test owner created successfully:")
    console.log("Email: owner@gmail.com")
    console.log("Password: owner@123")
    console.log("Role: OWNER")
    console.log("Owner Status: APPROVED")
    console.log("User ID:", owner.id)
    console.log("Owner Profile ID:", owner.ownerprofile.id)
    
  } catch (error) {
    console.error("❌ Error creating test owner:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOwner()