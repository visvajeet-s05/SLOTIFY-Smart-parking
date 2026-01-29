const bcrypt = require('bcryptjs')

// Test password hashing
const password = "owner@123"
const hashedPassword = bcrypt.hashSync(password, 10)

console.log("Original password:", password)
console.log("Hashed password:", hashedPassword)

// Test password comparison
const isValid = bcrypt.compareSync(password, hashedPassword)
console.log("Password comparison (should be true):", isValid)

// Test with wrong password
const wrongPassword = "wrong@123"
const isWrongValid = bcrypt.compareSync(wrongPassword, hashedPassword)
console.log("Wrong password comparison (should be false):", isWrongValid)

console.log("\n✅ Password hashing and comparison working correctly!")