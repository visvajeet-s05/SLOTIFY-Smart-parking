"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    licensePlate: "",
    vehicleModel: "",
    paymentMethod: "card",
    avatar: "",
  })
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState({ old: "", pw: "", confirm: "" })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userProfile")
      if (raw) setProfile(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target as any
    setProfile((p) => ({ ...p, [name]: value }))
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setProfile((p) => ({ ...p, avatar: String(reader.result) }))
    }
    reader.readAsDataURL(file)
  }

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
    localStorage.setItem("userProfile", JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function handleReset() {
    localStorage.removeItem("userProfile")
    setProfile({ name: "", email: "", phone: "", licensePlate: "", vehicleModel: "", paymentMethod: "card", avatar: "" })
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (passwords.pw !== passwords.confirm) {
      alert("New passwords do not match")
      return
    }
    // Placeholder: integrate with backend to change password
    alert("Password updated (demo)")
    setPasswords({ old: "", pw: "", confirm: "" })
    setShowPassword(false)
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-medium text-white">
                {profile.name ? profile.name.split(" ").map(s=>s[0]).slice(0,2).join("") : "UP"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-lg font-semibold">Your Profile</h1>
            <p className="text-sm text-gray-400">Manage personal info, vehicles and payment methods.</p>
          </div>

          <div className="text-right">
            <Link href="/dashboard/bookings" className="text-xs text-gray-300 hover:underline">My Bookings</Link>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 gap-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">Full name</span>
              <input name="name" value={profile.name} onChange={handleChange} className="mt-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">Email</span>
              <input name="email" type="email" value={profile.email} onChange={handleChange} className="mt-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">Phone</span>
              <input name="phone" value={profile.phone} onChange={handleChange} className="mt-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">License Plate</span>
              <input name="licensePlate" value={profile.licensePlate} onChange={handleChange} className="mt-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">Vehicle</span>
              <input name="vehicleModel" value={profile.vehicleModel} onChange={handleChange} className="mt-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <label className="flex flex-col col-span-2">
              <span className="text-xs text-gray-400">Avatar</span>
              <input type="file" accept="image/*" onChange={handleAvatar} className="mt-1 text-xs text-gray-300" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">Payment</span>
              <select name="paymentMethod" value={profile.paymentMethod} onChange={handleChange} className="mt-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm">
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded">Save</button>
            <button type="button" onClick={handleReset} className="text-sm px-3 py-1 bg-gray-800 border border-gray-700 rounded">Reset</button>
            <div className="flex-1 text-right text-xs text-green-400">{saved ? "Saved" : ""}</div>
          </div>
        </form>

        <div className="mt-4 border-t border-gray-800 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Security</h3>
            <button onClick={() => setShowPassword((s) => !s)} className="text-xs text-gray-300">{showPassword ? "Hide" : "Change"}</button>
          </div>

          {showPassword && (
            <form onSubmit={handlePasswordChange} className="mt-3 grid grid-cols-1 gap-2">
              <input placeholder="Current password" type="password" value={passwords.old} onChange={(e)=>setPasswords(p=>({...p,old:e.target.value}))} className="rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="New password" type="password" value={passwords.pw} onChange={(e)=>setPasswords(p=>({...p,pw:e.target.value}))} className="rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
                <input placeholder="Confirm" type="password" value={passwords.confirm} onChange={(e)=>setPasswords(p=>({...p,confirm:e.target.value}))} className="rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm" />
              </div>
              <div className="flex gap-2">
                <button className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded">Update password</button>
                <button type="button" onClick={()=>{setShowPassword(false); setPasswords({old:'',pw:'',confirm:''})}} className="text-sm px-3 py-1 bg-gray-800 border border-gray-700 rounded">Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-4 border-t border-gray-800 pt-3 text-sm">
          <h3 className="text-sm font-medium">Quick Summary</h3>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="bg-gray-800/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Total Bookings</div>
              <div className="font-semibold">—</div>
            </div>
            <div className="bg-gray-800/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Upcoming</div>
              <div className="font-semibold text-blue-300">—</div>
            </div>
            <div className="bg-gray-800/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Active</div>
              <div className="font-semibold text-green-300">—</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400">View full history in <Link href="/dashboard/bookings" className="text-gray-200 hover:underline">Bookings</Link>.</div>
        </div>
      </div>
    </main>
  )
}
