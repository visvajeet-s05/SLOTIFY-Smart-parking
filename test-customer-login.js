const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function testCustomerLogin() {
  try {
    console.log("Testing customer login...")
    
    // Find the customer user
    const customer = await prisma.user.findUnique({
      where: { email: "visvajeet@gmail.com" }
    })
    
    if (!customer) {
      console.log("❌ Customer user not found in database")
      return
    }
    
    console.log("✅ Customer found:", customer.email)
    console.log("Role:", customer.role)
    console.log("Password hash length:", customer.password.length)
    
    // Test password comparison
    const testPassword = "visvajeet"
    const isValid = await bcrypt.compare(testPassword, customer.password)
    
    if (isValid) {
      console.log("✅ Password comparison successful!")
    } else {
      console.log("❌ Password comparison failed!")
      console.log("Stored hash:", customer.password)
    }
    
  } catch (error) {
    console.error("❌ Error testing login:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testCustomerLogin()