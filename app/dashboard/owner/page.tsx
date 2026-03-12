"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Camera,
  Grid3X3,
  Car,
  TrendingUp,
  AlertCircle,
  LayoutDashboard,
  Clock,
  ChevronRight,
  ShieldCheck,
  Signal,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { OWNER_PARKING_MAPPING, PARKING_LOT_DETAILS } from "@/lib/owner-mapping"

// Mock data for occupancy chart
const MOCK_CHART_DATA = [
  { time: "00:00", occupancy: 20 },
  { time: "04:00", occupancy: 15 },
  { time: "08:00", occupancy: 45 },
  { time: "12:00", occupancy: 85 },
  { time: "16:00", occupancy: 92 },
  { time: "20:00", occupancy: 65 },
  { time: "23:59", occupancy: 30 },
];

type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED";

type Slot = {
  id: string;
  slotNumber: number;
  status: SlotStatus;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    disabled: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isConnected: wsConnected, lastMessage } = useOwnerWS();

  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const ownerEmail = (session?.user?.email || "").toLowerCase();
  const parkingLotId = session?.user?.parkingLotId || OWNER_PARKING_MAPPING[ownerEmail];
  const lotDetails = (parkingLotId && PARKING_LOT_DETAILS[parkingLotId]) || { name: "Your Parking Lot", location: "Unknown Location", price: 0 };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!parkingLotId || hasFetchedRef.current || isFetchingRef.current) return;

    isFetchingRef.current = true;
    hasFetchedRef.current = true;

    fetch(`/api/parking/${parkingLotId}/slots`)
      .then((res) => res.json())
      .then((data) => {
        const slots: Slot[] = data.slots || [];
        setStats({
          total: slots.length,
          available: slots.filter((s) => s.status === "AVAILABLE").length,
          occupied: slots.filter((s) => s.status === "OCCUPIED").length,
          reserved: slots.filter((s) => s.status === "RESERVED").length,
          disabled: slots.filter((s) => s.status === "DISABLED").length,
        });
      })
      .catch((err) => console.error("Failed to fetch stats:", err))
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [parkingLotId]);

  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "SLOT_UPDATE") return;

    setStats((prev) => {
      const newStats = { ...prev };
      if (lastMessage.oldStatus) {
        const oldKey = lastMessage.oldStatus.toLowerCase() as keyof typeof stats;
        if (newStats[oldKey] !== undefined) newStats[oldKey]--;
      }
      const newKey = lastMessage.status?.toLowerCase() as keyof typeof stats;
      if (newKey && newStats[newKey] !== undefined) newStats[newKey]++;
      return newStats;
    });
  }, [lastMessage]);

  const occupancyPercentage = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.occupied + stats.reserved) / stats.total) * 100);
  }, [stats]);

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-6 pt-0 pb-12 space-y-8"
      >

        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-1">
            <div className="h-5"></div>
            <h1 className="text-4xl font-bold tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{session?.user?.name || "Partner"}</span>
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Monitoring <span className="text-gray-200 font-medium">{lotDetails.name}</span> • {lotDetails.location}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Local Time</p>
                <p className="text-lg font-mono font-bold tracking-tight">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-xs font-medium">
                <Signal size={14} />
                {wsConnected ? "System Live" : "Connecting..."}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Primary Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Capacity"
            value={stats.total}
            icon={<Grid3X3 className="text-blue-400" />}
            trend="+0% change"
            color="blue"
          />
          <StatCard
            title="Slots Available"
            value={stats.available}
            icon={<Car className="text-green-400" />}
            trend="Instant Refresh"
            color="green"
          />
          <StatCard
            title="Live Occupancy"
            value={stats.occupied}
            icon={<Activity className="text-red-400" />}
            trend={`${occupancyPercentage}% full`}
            color="red"
          />
          <StatCard
            title="Revenue Trend"
            value={`₹${stats.occupied * (lotDetails.price ?? 0)}`}
            icon={<TrendingUp className="text-purple-400" />}
            trend="Estimated Today"
            color="purple"
          />
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Occupancy Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Occupancy Analytics</h3>
                <p className="text-sm text-gray-400">Real-time usage trends for the last 24 hours</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20">Today</Badge>
                <Badge variant="outline" className="hover:bg-white/5 cursor-pointer">Week</Badge>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    hide
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #ffffff10',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#818cf8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOccupancy)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right: Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-purple-400" size={20} />
                Control Center
              </h3>
              <div className="grid gap-4">
                <ActionCard
                  href="/dashboard/owner/camera"
                  title="Live Surveillance"
                  description="Access 4K AI-powered camera feeds"
                  icon={<Camera />}
                  gradient="from-blue-500/20 to-cyan-500/20"
                />
                <ActionCard
                  href={parkingLotId ? `/dashboard/owner/parking-lots/${parkingLotId}/slots` : "/dashboard/owner/parking-lots/slots"}
                  title="Slot Management"
                  description="Override status and configure limits"
                  icon={<Grid3X3 />}
                  gradient="from-purple-500/20 to-pink-500/20"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Signal className="text-green-400" size={20} />
                System Status
              </h3>
              <div className="space-y-4">
                <StatusRow label="AI Detection" status="active" />
                <StatusRow label="Camera Processing" status="active" />
                <StatusRow label="WebSocket Gateway" status={wsConnected ? "active" : "warning"} />
                <StatusRow label="Database Sync" status="active" />
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 lowercase tracking-widest">
                <span>Last full backup</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colorMap: any = {
    blue: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40",
    green: "border-green-500/20 bg-green-500/5 hover:border-green-500/40",
    red: "border-red-500/20 bg-red-500/5 hover:border-red-500/40",
    purple: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className={`p-6 rounded-3xl border backdrop-blur-sm transition-all duration-300 ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-2xl">
          {icon}
        </div>
        <ArrowUpRight className="text-gray-600" size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 uppercase tracking-wider">
          <Clock size={12} /> {trend}
        </p>
      </div>
    </motion.div>
  );
}

function ActionCard({ href, title, description, icon, gradient }: any) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative p-6 bg-gradient-to-br ${gradient} border border-white/10 rounded-3xl transition-all hover:border-white/20`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h4 className="text-lg font-bold group-hover:text-purple-300 transition-colors uppercase tracking-tight">{title}</h4>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">
          OPEN CONTROLS <ChevronRight size={14} className="ml-1" />
        </div>
      </motion.div>
    </Link>
  );
}

function StatusRow({ label, status }: { label: string, status: 'active' | 'warning' | 'error' }) {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Operational', ghost: 'bg-green-500/10 text-green-400' },
    warning: { color: 'bg-yellow-500', text: 'Issue Detected', ghost: 'bg-yellow-500/10 text-yellow-400' },
    error: { color: 'bg-red-500', text: 'Service Down', ghost: 'bg-red-500/10 text-red-400' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between group">
      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${config.ghost} flex items-center gap-1.5`}>
        <span className={`w-1 h-1 rounded-full ${config.color}`} />
        {config.text}
      </div>
    </div>
  );
}
