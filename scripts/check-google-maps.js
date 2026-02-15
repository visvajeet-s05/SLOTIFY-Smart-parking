#!/usr/bin/env node

/**
 * Google Maps Setup Checker
 * Verifies that Google Maps API is properly configured
 */

const fs = require('fs')
const path = require('path')

console.log('\n🗺️  Google Maps Configuration Checker\n')
console.log('='.repeat(50))

// Check .env.local file
const envPath = path.join(process.cwd(), '.env.local')
let apiKey = ''

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const match = envContent.match(/NEXT_PUBLIC_GOOGLE_MAPS_KEY=(.+)/)

    if (match && match[1]) {
        apiKey = match[1].trim()
    }
}

// Check configuration status
const checks = [
    {
        name: '.env.local file exists',
        status: fs.existsSync(envPath),
        fix: 'Create .env.local file in project root',
    },
    {
        name: 'NEXT_PUBLIC_GOOGLE_MAPS_KEY is set',
        status: apiKey.length > 0,
        fix: 'Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local',
    },
    {
        name: 'API key is not placeholder',
        status: apiKey.length > 0 && !apiKey.includes('YOUR_GOOGLE_MAPS_API_KEY_HERE'),
        fix: 'Replace placeholder with actual Google Maps API key',
    },
    {
        name: 'API key format looks valid',
        status: apiKey.startsWith('AIza') || apiKey.length === 0,
        fix: 'Verify API key format (should start with "AIza")',
    },
]

console.log('\n📋 Configuration Status:\n')

let allPassed = true
checks.forEach((check, index) => {
    const icon = check.status ? '✅' : '❌'
    console.log(`${icon} ${check.name}`)

    if (!check.status) {
        console.log(`   💡 Fix: ${check.fix}`)
        allPassed = false
    }
})

console.log('\n' + '='.repeat(50))

if (allPassed) {
    console.log('\n✨ Configuration looks good!')
    console.log('\n📝 Next steps:')
    console.log('   1. Restart your development server (npm run dev)')
    console.log('   2. Test the map in your browser')
    console.log('   3. Check browser console for any errors\n')
} else {
    console.log('\n⚠️  Configuration incomplete')
    console.log('\n📚 Setup Guide: ./SETUP_GOOGLE_MAPS.md')
    console.log('🔗 Get API Key: https://console.cloud.google.com/google/maps-apis\n')
    console.log('📝 Quick Setup:')
    console.log('   1. Go to Google Cloud Console')
    console.log('   2. Create/select a project')
    console.log('   3. Enable Maps JavaScript API')
    console.log('   4. Create API key')
    console.log('   5. Add to .env.local: NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here')
    console.log('   6. Restart dev server\n')
}

// Show current API key status (masked)
if (apiKey.length > 0) {
    const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4)
    console.log(`🔑 Current API Key: ${maskedKey}`)
} else {
    console.log('🔑 No API Key found')
}

console.log('\n' + '='.repeat(50) + '\n')

process.exit(allPassed ? 0 : 1)
