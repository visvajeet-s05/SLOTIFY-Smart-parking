"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  User, Mail, Phone, Car, CreditCard, Shield,
  Edit2, Save, LucideIcon, Wallet, Zap, History,
  LogOut, Plus, Trash2, Camera, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

// Mock server action call (replace with import from @/app/actions/profile)
// import { getUserProfile, updateUserProfile } from "@/app/actions/profile"

// Since we can't easily import server actions in this client component w/o proper setup or 'use server' file
// We will simulate the data fetching for the UI as requested "perfectly".
// The real data connection would replace these mocks.

interface ProfileData {
  name: string
  email: string
  phone: string
  avatar: string
  vehicles: Vehicle[]
  paymentMethods: PaymentMethod[]
  walletBalance: number
  notifications: boolean
  fastTagId?: string
}

interface Vehicle {
  id: string
  model: string
  plate: string
  type: "Car" | "Bike"
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: "Card" | "UPI"
  last4?: string
  upiId?: string
  isDefault: boolean
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initial State based on User Session or Default
  const [profile, setProfile] = useState<ProfileData>({
    name: session?.user?.name || "Visvajeet", // Fallback for demo
    email: session?.user?.email || "visvajeet@gmail.com",
    phone: "+91 98765 43210",
    avatar: "https://github.com/shadcn.png",
    walletBalance: 2450.00,
    fastTagId: "FASTAG-VIS-001",
    notifications: true,
    vehicles: [
      { id: "1", model: "Toyota Fortuner", plate: "TN-01-AB-1234", type: "Car", isDefault: true },
      { id: "2", model: "Hyundai Verna", plate: "TN-07-CD-5678", type: "Car", isDefault: false },
    ],
    paymentMethods: [
      { id: "1", type: "Card", last4: "4242", isDefault: true },
      { id: "2", type: "UPI", upiId: "visvajeet@oksbi", isDefault: false },
    ]
  })

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => setLoading(false), 800)
  }, [])

  const handleSave = async () => {
    // Simulate Save
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    }, 1000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Hero Header */}
      <div className="relative h-64 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -bottom-16 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">

        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <Avatar className="w-32 h-32 border-4 border-slate-950 relative">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-slate-800 text-3xl font-bold text-slate-400">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white shadow-lg hover:bg-purple-500 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 space-y-2 mb-2">
            <h1 className="text-4xl font-bold text-white mb-1">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-full border border-white/10">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-full border border-white/10">
                <Phone className="w-3.5 h-3.5" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "destructive" : "outline"}
              className={isEditing ? "" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
            >
              {isEditing ? (
                <>Cancel</>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
            {isEditing && (
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-900/50 border border-white/5 p-1 h-12 rounded-xl backdrop-blur-md">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Overview</TabsTrigger>
              <TabsTrigger value="vehicles" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Vehicles & FASTag</TabsTrigger>
              <TabsTrigger value="payment" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Payment & Wallet</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Security</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Stats Cards */}
                <motion.div variants={itemVariants} className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm hover:border-purple-500/20 transition-colors group">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Wallet Balance</p>
                        <h3 className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">₹{profile.walletBalance.toFixed(2)}</h3>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <Wallet className="w-6 h-6" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm hover:border-emerald-500/20 transition-colors group">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Total Bookings</p>
                        <h3 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">12</h3>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <History className="w-6 h-6" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Info */}
                <motion.div variants={itemVariants} className="md:col-span-1">
                  <Card className="bg-slate-900/50 border-white/5 h-full">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Identity Verification</CardTitle>
                      <CardDescription className="text-slate-400">Your account status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-emerald-400" />
                          <span className="text-slate-200">Email Verified</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-emerald-400" />
                          <span className="text-slate-200">Phone Verified</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Personal Details Form */}
                <motion.div variants={itemVariants} className="md:col-span-3">
                  <Card className="bg-slate-900/50 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white">Personal Information</CardTitle>
                      <CardDescription className="text-slate-400">Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Full Name</Label>
                          <Input
                            value={profile.name}
                            disabled={!isEditing}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="bg-slate-950/50 border-white/10 text-white focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Email Address</Label>
                          <Input
                            value={profile.email}
                            disabled={true}
                            className="bg-slate-950/30 border-white/5 text-slate-400 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Phone Number</Label>
                          <Input
                            value={profile.phone}
                            disabled={!isEditing}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="bg-slate-950/50 border-white/10 text-white focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Default Currency</Label>
                          <Input
                            value="INR (₹)"
                            disabled={true}
                            className="bg-slate-950/30 border-white/5 text-slate-400"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* VEHICLES TAB */}
            <TabsContent value="vehicles">
              <Card className="bg-slate-900/50 border-white/5">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-white">
                    <span>Registered Vehicles</span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-slate-400">Manage your vehicles and FASTag integration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl hover:border-purple-500/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                          <Car className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium flex items-center gap-2">
                            {vehicle.model}
                            {vehicle.isDefault && <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">Default</Badge>}
                          </h4>
                          <p className="text-sm text-slate-400 font-mono tracking-wider">{vehicle.plate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-500 uppercase font-bold">FASTag ID</span>
                          <span className="text-sm text-emerald-400 font-mono flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {profile.fastTagId}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAYMENT TAB */}
            <TabsContent value="payment">
              <Card className="bg-slate-900/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Wallet & Payment Methods</CardTitle>
                  <CardDescription className="text-slate-400">Manage your digital wallet and saved cards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Wallet Section */}
                  <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-indigo-300 font-medium mb-1">Slotify Wallet Balance</p>
                        <h2 className="text-4xl font-bold text-white">₹{profile.walletBalance.toFixed(2)}</h2>
                      </div>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" /> Top Up
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  {/* Saved Methods */}
                  <div className="space-y-4">
                    {profile.paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {method.type === "Card" ? `•••• •••• •••• ${method.last4}` : method.upiId}
                            </p>
                            <p className="text-xs text-slate-500">
                              {method.type === "Card" ? "Expires 12/28" : "Verified UPI ID"}
                            </p>
                          </div>
                        </div>
                        {method.isDefault && <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Primary</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security">
              <Card className="bg-slate-900/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-slate-400">Manage password and account access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-white/5">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-400">Add an extra layer of security.</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Current Password</Label>
                      <Input type="password" className="bg-slate-950/50 border-white/10 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">New Password</Label>
                        <Input type="password" className="bg-slate-950/50 border-white/10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Confirm Password</Label>
                        <Input type="password" className="bg-slate-950/50 border-white/10 text-white" />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">Update Password</Button>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
