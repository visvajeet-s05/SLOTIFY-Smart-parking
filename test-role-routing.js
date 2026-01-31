// Test script to verify role-based routing
// This is a simple test to check if the API returns the correct role

const testUsers = [
  {
    email: "admin@gmail.com",
    password: "admin@123",
    expectedRole: "admin",
    expectedRedirect: "/dashboard/admin"
  },
  {
    email: "owner@gmail.com", 
    password: "owner@123",
    expectedRole: "owner",
    expectedRedirect: "/dashboard/owner"
  },
  {
    email: "user@gmail.com",
    password: "user@123", 
    expectedRole: "user",
    expectedRedirect: "/dashboard/users"
  }
]

async function testLogin(email, password) {
  try {
    const response = await fetch("/api/auth/custom-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Test failed:", error)
    return null
  }
}

async function runTests() {
  console.log("🧪 Testing Role-Based Routing...")
  console.log("=" * 50)

  for (const user of testUsers) {
    console.log(`\n👤 Testing ${user.email}...`)
    
    const result = await testLogin(user.email, user.password)
    
    if (result && result.success) {
      console.log(`✅ Login successful`)
      console.log(`📋 Role: ${result.user.role}`)
      console.log(`📍 Expected Redirect: ${user.expectedRedirect}`)
      
      if (result.user.role === user.expectedRole) {
        console.log(`✅ Role matches expected: ${user.expectedRole}`)
      } else {
        console.log(`❌ Role mismatch! Expected: ${user.expectedRole}, Got: ${result.user.role}`)
      }
    } else {
      console.log(`❌ Login failed: ${result?.message || 'Unknown error'}`)
    }
  }

  console.log("\n" + "=" * 50)
  console.log("🏁 Test completed!")
}

// Run the tests
runTests()