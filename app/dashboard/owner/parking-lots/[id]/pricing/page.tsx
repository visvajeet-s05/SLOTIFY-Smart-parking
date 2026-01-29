"use client"

import { Plus, Trash2, Percent } from "lucide-react"
import { useState } from "react"

type PricingRule = {
  id: number
  label: string
  rate: number
  unit: "HOURLY" | "DAILY"
  vehicle: "CAR" | "BIKE" | "EV"
}

export default function OwnerPricingPage() {
  const [baseRate, setBaseRate] = useState(50)
  const [rules, setRules] = useState<PricingRule[]>([
    { id: 1, label: "EV Discount", rate: 40, unit: "HOURLY", vehicle: "EV" },
    { id: 2, label: "Bike Rate", rate: 20, unit: "HOURLY", vehicle: "BIKE" },
  ])

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now(),
        label: "New Rule",
        rate: baseRate,
        unit: "HOURLY",
        vehicle: "CAR",
      },
    ])
  }

  const updateRule = (id: number, key: keyof PricingRule, value: any) => {
    setRules(
      rules.map(rule =>
        rule.id === id ? { ...rule, [key]: value } : rule
      )
    )
  }

  const removeRule = (id: number) => {
    setRules(rules.filter(rule => rule.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Pricing Management</h1>
        <p className="text-sm text-gray-400">
          Configure base and vehicle-based pricing
        </p>
      </div>

      {/* Base Pricing */}
      <div className="admin-card">
        <h3 className="font-medium mb-2">Base Pricing</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Hourly Rate</span>
          <input
            type="number"
            value={baseRate}
            onChange={e => setBaseRate(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-32"
          />
          <span className="text-sm text-gray-400">₹ / hour</span>
        </div>
      </div>

      {/* Vehicle Pricing Rules */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
          <h3 className="font-medium">Vehicle Pricing Rules</h3>
          <button
            onClick={addRule}
            className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded"
          >
            <Plus size={14} />
            Add Rule
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Rate</th>
              <th className="px-4 py-3 text-left">Unit</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rules.map(rule => (
              <tr key={rule.id} className="border-t border-gray-800">
                <td className="px-4 py-3">
                  <input
                    value={rule.label}
                    onChange={e => updateRule(rule.id, "label", e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  />
                </td>

                <td className="px-4 py-3">
                  <select
                    value={rule.vehicle}
                    onChange={e => updateRule(rule.id, "vehicle", e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike</option>
                    <option value="EV">EV</option>
                  </select>
                </td>

                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={rule.rate}
                    onChange={e => updateRule(rule.id, "rate", Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-24"
                  />
                </td>

                <td className="px-4 py-3">
                  <select
                    value={rule.unit}
                    onChange={e => updateRule(rule.id, "unit", e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="HOURLY">Hourly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Pricing (Preview) */}
      <div className="admin-card flex items-center gap-3">
        <Percent className="text-purple-400" />
        <div>
          <h4 className="font-medium">Dynamic Pricing (Coming Soon)</h4>
          <p className="text-xs text-gray-400">
            AI-based demand pricing will auto-adjust rates
          </p>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm">
          Save Pricing
        </button>
      </div>
    </div>
  )
}
