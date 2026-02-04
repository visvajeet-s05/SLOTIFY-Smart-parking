import { prisma } from "@/lib/prisma"

export type PricingInput = {
  parkingLotId: string
  userId?: string
  durationHours: number
  vehicleType?: string
}

export type PricingResult = {
  parkingLotId: string
  durationHours: number
  basePrice: number
  hourlyRate: number
  subtotal: number
  total: number
  currency: string
  pricingRuleId?: string
}

export const pricingEngine = {
  async calculatePrice(input: PricingInput): Promise<PricingResult> {
    const durationHours = Math.max(1, Number.isFinite(input.durationHours) ? input.durationHours : 1)

    const pricingRule = await prisma.pricingrule.findFirst({
      where: { parkingLotId: input.parkingLotId },
      orderBy: { createdAt: "desc" },
    })

    const basePrice = pricingRule?.basePrice ?? 20
    const hourlyRate = pricingRule?.hourlyRate ?? basePrice
    const subtotal = basePrice + Math.max(0, durationHours - 1) * hourlyRate

    return {
      parkingLotId: input.parkingLotId,
      durationHours,
      basePrice,
      hourlyRate,
      subtotal,
      total: subtotal,
      currency: "USD",
      pricingRuleId: pricingRule?.id,
    }
  },
}
