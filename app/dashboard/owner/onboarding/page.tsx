"use client"

import ReviewSubmitStep from "./steps/review-submit"

export default function OwnerOnboardingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Owner Onboarding</h1>
        <p className="text-sm text-gray-400">
          Complete these steps to activate your parking business.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 text-sm">
        <Step active label="Business Details" />
        <Divider />
        <Step label="Verification" />
        <Divider />
        <Step label="Parking Setup" />
        <Divider />
        <Step label="Complete" />
      </div>

      {/* Step Content */}
      <ReviewSubmitStep />
    </div>
  )
}

function Step({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`px-3 py-1 rounded text-xs border ${
        active
          ? "bg-purple-600/20 border-purple-500 text-purple-400"
          : "border-gray-700 text-gray-400"
      }`}
    >
      {label}
    </div>
  )
}

function Divider() {
  return <div className="w-6 h-px bg-gray-700" />
}
