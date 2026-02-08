"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  Building,
  Settings,
  Save,
  CheckCircle2,
  Trash2,
  Lock,
  Smartphone,
  Globe,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export default function OwnerSettingsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/owner/account");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({
            businessName: data.businessName || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch account settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/owner/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({
          title: "Settings Updated",
          description: "Your professional information has been successfully saved.",
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] text-white p-8">
        <div className="max-w-6xl mx-auto space-y-8 pt-12">
          <Skeleton className="h-12 w-64 bg-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Skeleton className="h-48 bg-white/5 md:col-span-1 rounded-2xl" />
            <Skeleton className="h-96 bg-white/5 md:col-span-3 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "Business Profile", icon: <Building size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "security", label: "Security & Access", icon: <Shield size={18} /> },
    { id: "billing", label: "Billing & Plans", icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-6xl mx-auto px-6 pt-8 pb-24"
      >
        <div className="flex flex-col gap-2 mb-10">
          <Badge className="w-fit bg-purple-500/10 text-purple-400 border-purple-500/20 mb-2">Workspace Configuration</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-gray-400">Manage your parking enterprise settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group ${activeTab === tab.id
                    ? "bg-white text-black shadow-xl shadow-white/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span className={`${activeTab === tab.id ? "text-purple-600" : "text-gray-500 group-hover:text-purple-400"}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="tab" className="ml-auto w-1.5 h-1.5 bg-black rounded-full" />}
              </button>
            ))}

            <div className="mt-8 pt-6 border-t border-white/5">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 size={18} />
                Deactivate Workspace
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden pt-4">
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                      <CardDescription>Update your business details and location info.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdateProfile}>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="businessName">Enterprise Name</Label>
                            <Input
                              id="businessName"
                              value={formData.businessName}
                              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                              placeholder="e.g. Phoenix Parking Solutions"
                              className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-purple-500/30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Business Contact</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+91-0000000000"
                              className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Registered Office Address</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              placeholder="123 Alpha Plaza, Cyber City"
                              className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                            />
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-6 py-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                        <Button
                          disabled={isSaving}
                          className="bg-white text-black hover:bg-white/90 rounded-xl px-8 h-11 font-bold shadow-xl shadow-white/5 transition-all hover:translate-y-[-2px]"
                        >
                          {isSaving ? "Saving..." : <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>}
                        </Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden pt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone size={20} className="text-purple-400" />
                        System Alerts
                      </CardTitle>
                      <CardDescription>Configure how you receive critical operational updates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        { title: "New Booking Alert", desc: "Notification when a customer reserves a slot", active: true },
                        { title: "Capacity Warning", desc: "Alert when occupancy reaches 90%", active: true },
                        { title: "AI Anomaly Detection", desc: "Instant alert on visual sensor mismatch", active: false },
                        { title: "Financial Settlements", desc: "Notification when payments are deposited", active: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                          <div>
                            <p className="text-sm font-bold">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.active} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden pt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock size={20} className="text-blue-400" />
                        Access Control
                      </CardTitle>
                      <CardDescription>Manage your workspace credentials and active sessions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Two-Factor Authentication</Label>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Enabled</Badge>
                        </div>
                        <p className="text-xs text-gray-500">Add an extra level of security to your account by requiring more than just a password to log in.</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "billing" && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="relative">
                      <Badge className="absolute top-6 right-6 bg-green-500 text-white border-none">Active</Badge>
                      <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Enterprise <span className="text-purple-400">Pro</span></CardTitle>
                      <CardDescription className="text-gray-300">Annual billing starting March 2026</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pb-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Monthly Cost</p>
                          <p className="text-xl font-bold italic text-white">₹14,999</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Max Lots</p>
                          <p className="text-xl font-bold italic text-white">Unlimited</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
