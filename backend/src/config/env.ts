export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET!,
  databaseUrl: process.env.DATABASE_URL!,
  stripeSecret: process.env.STRIPE_SECRET!,
  contractAddress: process.env.CONTRACT_ADDRESS!,
  rpcUrl: process.env.RPC_URL!
}

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'STRIPE_SECRET',
  'CONTRACT_ADDRESS',
  'RPC_URL'
]

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})