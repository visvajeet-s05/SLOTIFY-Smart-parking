
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "demo@example.com"
    const password = await hash("password123", 12)

    // 1. Create/Update User
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: "Visvajeet Example",
            password,
            role: "CUSTOMER",
            phone: "+91 98765 43210",
            walletBalance: 2500.50,
            preferredCurrency: "INR",
        },
    })

    console.log({ user })

    // 2. Clear existing vehicles/fastags for this user to avoid unique constraint errors on re-run
    // We need to delete Fastags first because they depend on Vehicles (but actually Fastag depends on Vehicle ID... wait, let's delete Fastag first)
    await prisma.fastag.deleteMany({
        where: { userId: user.id },
    })
    await prisma.vehicle.deleteMany({
        where: { userId: user.id },
    })

    // 3. Create Vehicles
    const vehicle1 = await prisma.vehicle.create({
        data: {
            userId: user.id,
            licensePlate: "KA-05-MJ-1234",
            make: "Tesla",
            model: "Model 3",
            color: "Red",
            isActive: true,

        },
    })

    const vehicle2 = await prisma.vehicle.create({
        data: {
            userId: user.id,
            licensePlate: "KA-01-AB-9999",
            make: "BMW",
            model: "X5",
            color: "Black",
            isActive: true,
        },
    })

    console.log({ vehicle1, vehicle2 })

    // 4. Create Fastags
    const fastag1 = await prisma.fastag.create({
        data: {
            tagId: "NETC-FASTAG-123456789",
            userId: user.id,
            vehicleId: vehicle1.id,
            balance: 550.00,
            status: "ACTIVE",
            walletId: "WALLET-USER-001"
        },
    })

    // Maybe a second fastag for the second car
    const fastag2 = await prisma.fastag.create({
        data: {
            tagId: "NETC-FASTAG-987654321",
            userId: user.id,
            vehicleId: vehicle2.id,
            balance: 120.00,
            status: "LOW_BALANCE",
            walletId: "WALLET-USER-001"
        },
    })

    console.log({ fastag1, fastag2 })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
