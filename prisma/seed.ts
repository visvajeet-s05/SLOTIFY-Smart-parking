import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.slotStatusLog.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.parkinglot.deleteMany()
  await prisma.ownerprofile.deleteMany()
  await prisma.user.deleteMany()

  const hash = (p: string) => bcrypt.hashSync(p, 10)

  // Create Admin
  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: "Admin",
      email: "admin@slotify.com",
      password: hash("admin@slotify"),
      role: "ADMIN",
    },
  })

  // Define 8 unique parking lots with different pricing, slot totals, and camera URLs
  const parkings = [
    {
      id: "CHENNAI_CENTRAL",
      name: "Chennai Central Premium Parking",
      ownerEmail: "owner@gmail.com",
      ownerPassword: "owner@123",
      ownerName: "Rajesh Kumar",
      basePrice: 80,
      totalSlots: 120,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Chennai Central Railway Station, Park Town",
      lat: 13.0827,
      lng: 80.2707,
      amenities: ["CCTV", "Security", "EV Charging", "Valet"],
      description: "Premium parking at Chennai Central with 24/7 security"
    },
    {
      id: "ANNA_NAGAR",
      name: "Anna Nagar Metro Parking",
      ownerEmail: "owner1@gmail.com",
      ownerPassword: "owner1@123",
      ownerName: "Priya Sharma",
      basePrice: 60,
      totalSlots: 80,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Anna Nagar Tower Park, 2nd Avenue",
      lat: 13.0850,
      lng: 80.2100,
      amenities: ["CCTV", "Covered", "EV Charging"],
      description: "Metro-connected parking with covered slots"
    },
    {
      id: "T_NAGAR",
      name: "T Nagar Shopping District Parking",
      ownerEmail: "owner2@gmail.com",
      ownerPassword: "owner2@123",
      ownerName: "Karthik Venkat",
      basePrice: 100,
      totalSlots: 90,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Pondy Bazaar, T Nagar",
      lat: 13.0330,
      lng: 80.2330,
      amenities: ["CCTV", "Security", "Valet", "Premium"],
      description: "High-demand shopping district premium parking"
    },
    {
      id: "VELACHERY",
      name: "Velachery IT Corridor Parking",
      ownerEmail: "owner3@gmail.com",
      ownerPassword: "owner3@123",
      ownerName: "Anitha Raj",
      basePrice: 50,
      totalSlots: 100,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Velachery Main Road, Near Phoenix Mall",
      lat: 12.9815,
      lng: 80.2180,
      amenities: ["CCTV", "EV Charging", "Monthly Passes"],
      description: "IT corridor parking with corporate rates"
    },
    {
      id: "OMR",
      name: "OMR Tech Park Parking",
      ownerEmail: "owner4@gmail.com",
      ownerPassword: "owner4@123",
      ownerName: "Suresh Babu",
      basePrice: 45,
      totalSlots: 150,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Rajiv Gandhi Salai, OMR",
      lat: 12.9200,
      lng: 80.2300,
      amenities: ["CCTV", "Covered", "24/7 Access"],
      description: "Tech park parking with night shift support"
    },
    {
      id: "ADYAR",
      name: "Adyar Beachside Parking",
      ownerEmail: "owner5@gmail.com",
      ownerPassword: "owner5@123",
      ownerName: "Lakshmi Narayan",
      basePrice: 70,
      totalSlots: 50,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Adyar Beach Road, Near Elliots Beach",
      lat: 13.0010,
      lng: 80.2600,
      amenities: ["CCTV", "Security", "Beach View"],
      description: "Beachside parking with tourist facilities"
    },
    {
      id: "GUINDY",
      name: "Guindy Industrial Parking",
      ownerEmail: "owner6@gmail.com",
      ownerPassword: "owner6@123",
      ownerName: "Mohammed Ali",
      basePrice: 40,
      totalSlots: 70,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Guindy Industrial Estate, Mount Road",
      lat: 13.0100,
      lng: 80.2100,
      amenities: ["CCTV", "Heavy Vehicle", "Loading Zone"],
      description: "Industrial area parking for trucks and vans"
    },
    {
      id: "PORUR",
      name: "Porur Residential Parking",
      ownerEmail: "owner7@gmail.com",
      ownerPassword: "owner7@123",
      ownerName: "Deepa Chandran",
      basePrice: 35,
      totalSlots: 60,
      cameraUrl: "http://10.245.197.193:8080/video",
      location: "Porur Junction, Mount-Poonamallee Road",
      lat: 13.0350,
      lng: 80.1550,
      amenities: ["CCTV", "Monthly Passes", "Resident Discounts"],
      description: "Residential area parking with community rates"
    }
  ]

  for (const p of parkings) {
    // Create owner user
    const ownerUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: p.name,
        email: p.ownerEmail,
        password: hash(p.ownerPassword),
        role: "OWNER",
      }
    })

    // Create owner profile
    const ownerProfile = await prisma.ownerprofile.create({
      data: {
        id: crypto.randomUUID(),
        userId: ownerUser.id,
        businessName: p.name,
        phone: "+91-98765-43210",
        status: "APPROVED",
        address: `${p.name}, Chennai, Tamil Nadu`,
        updatedAt: new Date(),
      }
    })

    // Create parking lot with cameraUrl and totalSlots
    await prisma.parkinglot.create({
      data: {
        id: p.id,
        name: p.name,
        ownerId: ownerProfile.id,
        address: p.location,
        lat: p.lat,
        lng: p.lng,
        status: "ACTIVE",
        cameraUrl: p.cameraUrl,
        totalSlots: p.totalSlots,
        updatedAt: new Date(),
      }
    })

    // Create pricing rule
    await prisma.pricingrule.create({
      data: {
        id: crypto.randomUUID(),
        parkingLotId: p.id,
        basePrice: p.basePrice,
        hourlyRate: p.basePrice,
        dynamic: p.basePrice > 70,
        currentPrice: p.basePrice,
        lastUpdated: new Date(),
        updatedAt: new Date(),
      }
    })

    // Create slots based on parking lot's totalSlots - 90% REGULAR with scattered EV and DISABLED (NO VIP)
    let slotNumber = 1
    const slotsPerRow = Math.ceil(p.totalSlots / 8) // Distribute across 8 rows (A-H)
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]

    for (const row of rows) {
      for (let i = 0; i < slotsPerRow && slotNumber <= p.totalSlots; i++) {
        // Default: REGULAR (90% of slots)
        let slotType = "REGULAR"
        let slotPrice = p.basePrice

        // Random distribution for special slots (scattered throughout, NOT grouped by row)
        const rand = Math.random()

        // 5% EV slots scattered randomly (only if parking has EV charging)
        if (rand < 0.05 && p.amenities.includes("EV Charging")) {
          slotType = "EV"
          slotPrice = p.basePrice * 1.3
        }
        // 5% Disabled accessible slots scattered randomly
        else if (rand >= 0.05 && rand < 0.10) {
          slotType = "DISABLED"
          slotPrice = p.basePrice * 0.8
        }
        // 90% REGULAR (default) - NO VIP slots

        // Status distribution (realistic mix)
        let status: any = "AVAILABLE"
        const statusRand = Math.random()
        if (statusRand < 0.15) {
          status = "OCCUPIED" // 15% occupied
        } else if (statusRand < 0.25) {
          status = "RESERVED" // 10% reserved
        } else if (statusRand < 0.30) {
          status = "DISABLED" // 5% disabled for maintenance
        }

        // Generate location-based display name: LOCATION_ID-ROW-NUMBER
        const displayName = `${p.id}-${row}-${String(slotNumber).padStart(2, "0")}`

        await prisma.slot.create({
          data: {
            id: `${p.id}-${row}-${slotNumber}`,
            lotId: p.id,
            slotNumber: slotNumber,
            row: row,
            status: status,
            aiConfidence: Math.random() * 0.2 + 0.8,
            updatedBy: "AI",
            price: Math.round(slotPrice),
            slotType: slotType,
            displayName: displayName,
          }
        })
        slotNumber++
      }
    }

    console.log(`  ✓ ${p.name}: ${p.totalSlots} slots, ₹${p.basePrice}/hr base price`)
  }

  // Create Visvajeet customer
  // Create Visvajeet customer
  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: "Visvajeet",
      email: "visvajeet@gmail.com",
      password: hash("visvajeet123"),
      role: "CUSTOMER",
      // @ts-ignore
      // phone: "+91-98765-43210",
      // walletBalance: 2500.00,
      vehicle: {
        create: [
          {
            id: crypto.randomUUID(),
            licensePlate: "TN-01-AB-1234",
            make: "Toyota",
            model: "Fortuner",
            color: "White",
            updatedAt: new Date(),
            // fastTagId: "FASTAG-VIS-001",
            // isActive: true
          },
          {
            id: crypto.randomUUID(),
            licensePlate: "TN-07-CD-5678",
            make: "Hyundai",
            model: "Verna",
            color: "Black",
            updatedAt: new Date(),
            // fastTagId: "FASTAG-VIS-002",
            // isActive: true
          }
        ]
      }
    }
  })

  // Create Manish customer
  // Create Manish customer
  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: "Manish",
      email: "manish@gmail.com",
      password: hash("manish123"),
      role: "CUSTOMER",
      // phone: "+91-98765-12345",
      // walletBalance: 800.50,
      vehicle: {
        create: {
          id: crypto.randomUUID(),
          licensePlate: "TN-02-XY-9012",
          make: "Maruti",
          model: "Swift",
          color: "Red",
          updatedAt: new Date(),
          // fastTagId: "FASTAG-MAN-001",
          // isActive: true
        }
      }
    }
  })

  // Create specific bookings for Visvajeet to populate "My Bookings"
  const visvajeet = await prisma.user.findUnique({ where: { email: "visvajeet@gmail.com" } })

  if (visvajeet) {
    console.log("Creating bookings for Visvajeet...")
    const statuses = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"] as const
    const now = new Date()

    // Create 12 bookings for Visvajeet spread across the 8 lots
    for (let i = 0; i < 12; i++) {
      const lot = parkings[i % parkings.length] // Cycle through lots
      const status = statuses[i % 4] // Cycle through statuses

      // Find a slot in this lot
      const owner = await prisma.user.findFirst({ where: { email: lot.ownerEmail } })

      let startTime = new Date()
      let endTime = new Date()

      if (status === "UPCOMING") {
        startTime = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000) // Future days
        endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
      } else if (status === "ACTIVE") {
        startTime = new Date(now.getTime() - 1 * 60 * 60 * 1000) // Started 1 hour ago
        endTime = new Date(now.getTime() + 1 * 60 * 60 * 1000) // Ends in 1 hour
      } else {
        startTime = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000) // Past days
        endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000)
      }

      if (owner) {
        await prisma.booking.create({
          data: {
            id: crypto.randomUUID(),
            customerId: visvajeet.id,
            ownerId: owner.id,
            parkingLotId: lot.id,
            // We don't strictly need a reserved slot relation for history, but for ACTIVE/UPCOMING it's good.
            // For simplicity in seed, let's leave slotId null or try to find one if needed.
            // Ideally we attach it to a real slot if possible.
            status: status,
            amount: lot.basePrice * 2, // 2 hours approx
            startTime: startTime,
            endTime: endTime,
            vehicleType: "Toyota Fortuner",
          }
        })
      }
    }
  }

  console.log("\n✅ Seed completed successfully!")
  console.log("📊 Created:")
  console.log("   - 1 Admin (admin@slotify.com / admin@slotify)")
  console.log("   - 8 Unique Owners with different parking lots:")
  parkings.forEach(p => {
    console.log(`     • ${p.ownerEmail} / ${p.ownerPassword} → ${p.name}`)
  })
  console.log("   - 2 Customers:")
  console.log("     • visvajeet@gmail.com / visvajeet@123")
  console.log("     • manish@gmail.com / manish@123")
  console.log("   - 8 Parking Lots with UNIQUE pricing and slot totals:")
  parkings.forEach(p => {
    console.log(`     • ${p.name}: ${p.totalSlots} slots, ₹${p.basePrice}/hr, Camera: ${p.cameraUrl}`)
  })
  console.log(`   - ${parkings.reduce((acc, p) => acc + p.totalSlots, 0)} Total Slots (mostly REGULAR with scattered EV, DISABLED)`)
  console.log("   - Realistic statuses (15% occupied, 10% reserved, 5% disabled)")
  console.log("   - 10 Active bookings for demo purposes")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
