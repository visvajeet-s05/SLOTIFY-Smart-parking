const axios = require('axios');

async function testLoginRedirects() {
  const baseUrl = 'http://localhost:3000';
  
  const testUsers = [
    {
      name: 'Visvajeet (Customer)',
      email: 'visvajeet@gmail.com',
      password: 'visvajeet@123',
      expectedRole: 'CUSTOMER',
      expectedRedirect: '/dashboard'
    },
    {
      name: 'Manish (Customer)',
      email: 'manish@gmail.com',
      password: 'manish@123',
      expectedRole: 'CUSTOMER',
      expectedRedirect: '/dashboard'
    },
    {
      name: 'Chennai Central Parking (Owner)',
      email: 'owner@gmail.com',
      password: 'owner@123',
      expectedRole: 'OWNER',
      expectedRedirect: '/dashboard/owner'
    },
    {
      name: 'Anna Nagar Tower Parking (Owner)',
      email: 'owner1@gmail.com',
      password: 'owner1@123',
      expectedRole: 'OWNER',
      expectedRedirect: '/dashboard/owner'
    }
  ];

  console.log('Testing login redirects...\n');

  for (const user of testUsers) {
    try {
      console.log(`Testing ${user.name}...`);
      
      const response = await axios.post(`${baseUrl}/api/auth/custom-login`, {
        email: user.email,
        password: user.password
      });

      if (response.data.success) {
        const userData = response.data.user;
        console.log(`  ✅ Login successful`);
        console.log(`  📧 Email: ${userData.email}`);
        console.log(`  👤 Role: ${userData.role}`);
        console.log(`  🎯 Expected Role: ${user.expectedRole}`);
        console.log(`  🎯 Expected Redirect: ${user.expectedRedirect}`);
        
        if (userData.role === user.expectedRole) {
          console.log(`  ✅ Role matches expected`);
        } else {
          console.log(`  ❌ Role mismatch! Expected: ${user.expectedRole}, Got: ${userData.role}`);
        }
      } else {
        console.log(`  ❌ Login failed: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`  ❌ Error testing ${user.name}:`, error.message);
    }
    console.log('');
  }
}

testLoginRedirects();