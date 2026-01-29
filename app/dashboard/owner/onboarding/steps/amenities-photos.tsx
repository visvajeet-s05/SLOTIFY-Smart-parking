"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Zap,
  Camera,
  Umbrella,
  Cctv,
  Bike,
} from "lucide-react"

const AMENITIES = [
  { id: "security", label: "24/7 Security", icon: ShieldCheck },
  { id: "cctv", label: "CCTV Surveillance", icon: Cctv },
  { id: "covered", label: "Covered Parking", icon: Umbrella },
  { id: "ev", label: "EV Charging", icon: Zap },
  { id: "bike", label: "Two-Wheeler Parking", icon: Bike },
]

export default function AmenitiesPhotosStep() {
  const [selected, setSelected] = useState<string[]>([])
  const [photos, setPhotos] = useState<File[]>([])

  const toggleAmenity = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 5))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Amenities & Photos</h2>
        <p className="text-sm text-gray-400">
          Help customers understand what your parking offers.
        </p>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="text-sm font-medium mb-3">Available Amenities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AMENITIES.map(({ id, label, icon: Icon }) => {
            const active = selected.includes(id)
            return (
              <button
                key={id}
                onClick={() => toggleAmenity(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded border transition text-sm
                  ${
                    active
                      ? "border-purple-500 bg-purple-600/10 text-purple-300"
                      : "border-gray-700 bg-gray-800/40 text-gray-300 hover:border-gray-500"
                  }`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Photos */}
      <div>
        <h3 className="text-sm font-medium mb-2">Parking Photos</h3>
        <p className="text-xs text-gray-400 mb-3">
          Upload up to 5 photos (entrance, layout, signage, lighting).
        </p>

        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handlePhotoUpload(e.target.files)}
          />

          <div className="h-36 border border-dashed border-gray-700 rounded flex flex-col items-center justify-center text-gray-500 hover:border-purple-500 transition">
            <Camera size={24} />
            <span className="text-xs mt-2">Click to upload photos</span>
          </div>
        </label>

        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {photos.map((file, idx) => (
              <div
                key={idx}
                className="h-20 bg-gray-800 border border-gray-700 rounded text-xs flex items-center justify-center text-gray-400"
              >
                {file.name.slice(0, 12)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-900 border border-gray-800 rounded p-4 text-sm text-gray-400">
        Listings with photos and amenities receive up to{" "}
        <span className="text-purple-400 font-medium">2× more bookings</span>.
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="text-sm text-gray-400 hover:underline">
          ← Back
        </button>

        <button className="px-6 py-2 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white">
          Continue →
        </button>
      </div>
    </div>
  )
}