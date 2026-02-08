'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react'
interface PriceData {
  basePrice: number
  currentPrice: number
  currency: string
  multipliers: {
    demandMultiplier: number
    timeMultiplier: number
    occupancyMultiplier: number
    eventMultiplier: number
  }
  activeEvents: Array<{
    id: string
    name: string
    surgeMultiplier: number
  }>
  lastUpdated: string
  isPeakHour: boolean
}

interface LivePriceDisplayProps {
  parkingLotId: string
  className?: string
}

export function LivePriceDisplay({ parkingLotId, className }: LivePriceDisplayProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPriceData()

    // Update price every 30 seconds
    const interval = setInterval(fetchPriceData, 30000)

    return () => clearInterval(interval)
  }, [parkingLotId])

  const fetchPriceData = async () => {
    try {
      const response = await fetch(`/api/parking/${parkingLotId}/price`)
      if (!response.ok) throw new Error('Failed to fetch price')

      const data = await response.json()
      setPriceData(data)
      setError(null)
    } catch (err) {
      setError('Unable to load current pricing')
      console.error('Price fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !priceData) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-red-600 text-sm">{error || 'Price unavailable'}</div>
        </CardContent>
      </Card>
    )
  }

  const { basePrice, currentPrice, currency, multipliers, activeEvents, isPeakHour } = priceData
  const priceIncrease = ((currentPrice - basePrice) / basePrice) * 100
  const hasSurgePricing = activeEvents.length > 0
  const isHigherPrice = currentPrice > basePrice

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Price Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">/hour</span>
                {isHigherPrice && (
                  <Badge variant="destructive" className="text-xs">
                    +{priceIncrease.toFixed(0)}%
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Base: ${basePrice.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isPeakHour && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Peak Hours
                </Badge>
              )}
              {isHigherPrice ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Surge Pricing Notice */}
      {hasSurgePricing && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-semibold">Surge Pricing Active</div>
              <div className="text-sm">
                {activeEvents.map(event => (
                  <div key={event.id}>
                    {event.name}: {event.surgeMultiplier}x multiplier
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Prices are higher due to increased demand
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Price Factors (Collapsible) */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Price Factors
        </summary>
        <div className="mt-2 space-y-1 pl-4 border-l-2 border-muted">
          <div>Demand: {multipliers.demandMultiplier.toFixed(2)}x</div>
          <div>Time: {multipliers.timeMultiplier.toFixed(2)}x {isPeakHour && '(Peak Hours)'}</div>
          <div>Occupancy: {multipliers.occupancyMultiplier.toFixed(2)}x</div>
          {hasSurgePricing && (
            <div>Events: {multipliers.eventMultiplier.toFixed(2)}x</div>
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Last updated: {new Date(priceData.lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>
      </details>
    </div>
  )
}
