"use client";

import { useEffect, useState, useRef } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Camera, Grid3X3, Car, TrendingUp, AlertCircle } from "lucide-react";
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider";


// Owner to Parking Lot mapping - 1 owner → 1 parking lot only
const OWNER_PARKING_MAPPING: Record<string, string> = {
  "owner@gmail.com": "CHENNAI_CENTRAL",
  "owner1@gmail.com": "ANNA_NAGAR",
  "owner2@gmail.com": "T_NAGAR",
  "owner3@gmail.com": "VELACHERY",
  "owner4@gmail.com": "OMR",
  "owner5@gmail.com": "ADYAR",
  "owner6@gmail.com": "GUINDY",
  "owner7@gmail.com": "PORUR"
};

const PARKING_LOT_DETAILS: Record<string, { name: string; price: number }> = {
  "CHENNAI_CENTRAL": { name: "Chennai Central Premium Parking", price: 80 },
  "ANNA_NAGAR": { name: "Anna Nagar Parking Complex", price: 60 },
  "T_NAGAR": { name: "T Nagar Shopping District Parking", price: 100 },
  "VELACHERY": { name: "Velachery IT Corridor Parking", price: 50 },
  "OMR": { name: "OMR Tech Park Parking", price: 45 },
  "ADYAR": { name: "Adyar Residential Parking", price: 70 },
  "GUINDY": { name: "Guindy Industrial Parking", price: 40 },
  "PORUR": { name: "Porur Junction Parking", price: 35 }
};


type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED";

type Slot = {
  id: string;
  slotNumber: number;
  status: SlotStatus;
  confidence?: number;
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    disabled: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { ws, isConnected: wsConnected, lastMessage } = useOwnerWS();

  // Fetch lock to prevent duplicate requests
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Get owner's parking lot ID - stable value
  const ownerEmail = session?.user?.email || "";
  const parkingLotId = OWNER_PARKING_MAPPING[ownerEmail];



  // Redirect owner to their specific parking lot
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      return; // Let the layout handle auth redirect
    }

    const ownerEmail = session.user.email;
    const parkingLotId = OWNER_PARKING_MAPPING[ownerEmail];

    if (parkingLotId && !isRedirecting) {
      setIsRedirecting(true);
      // Redirect to owner's specific parking lot slots page
      router.replace(`/dashboard/owner/parking-lots/${parkingLotId}/slots`);
    }
  }, [session, status, router, isRedirecting]);

  // Sync connection state from global WebSocket
  useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  // Fetch initial stats - with lock and stable dependency
  useEffect(() => {
    // Only fetch if we have a valid parkingLotId and haven't fetched yet
    if (!parkingLotId) return;
    if (hasFetchedRef.current) return;
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    hasFetchedRef.current = true;

    // Fetch initial stats for owner's parking lot
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
      .catch((err) => {
        console.error("Failed to fetch stats:", err);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [parkingLotId]); // ONLY depend on parkingLotId, not session

  // Handle WebSocket messages for live updates
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "SLOT_UPDATE") {
      setStats((prev) => {
        const newStats = { ...prev };
        // Decrement old status
        if (lastMessage.oldStatus) {
          newStats[lastMessage.oldStatus.toLowerCase() as keyof typeof stats]--;
        }
        // Increment new status
        const statusKey = lastMessage.status?.toLowerCase() as keyof typeof stats;
        if (statusKey && newStats.hasOwnProperty(statusKey)) {
          newStats[statusKey]++;
        }
        return newStats;
      });
    }
  }, [lastMessage]);



  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-gray-400 mt-1">
              {(() => {
                const ownerEmail = session?.user?.email || "";
                const parkingLotId = OWNER_PARKING_MAPPING[ownerEmail];
                return parkingLotId 
                  ? PARKING_LOT_DETAILS[parkingLotId]?.name || "Your Parking Lot"
                  : "Your Parking Lot";
              })()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-400">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Slots"
            value={stats.total}
            icon={<Grid3X3 className="w-5 h-5" />}
            color="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            label="Available"
            value={stats.available}
            icon={<Car className="w-5 h-5" />}
            color="bg-green-500/20 text-green-400"
          />
          <StatCard
            label="Occupied"
            value={stats.occupied}
            icon={<Car className="w-5 h-5" />}
            color="bg-red-500/20 text-red-400"
          />
          <StatCard
            label="Reserved"
            value={stats.reserved}
            icon={<TrendingUp className="w-5 h-5" />}
            color="bg-yellow-500/20 text-yellow-400"
          />
          <StatCard
            label="Maintenance"
            value={stats.disabled}
            icon={<AlertCircle className="w-5 h-5" />}
            color="bg-gray-500/20 text-gray-400"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/owner/camera">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition">
                  <Camera className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Live Camera</h3>
                  <p className="text-sm text-gray-400">
                    View real-time parking feed
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href={(() => {
            const ownerEmail = session?.user?.email || "";
            const parkingLotId = OWNER_PARKING_MAPPING[ownerEmail];
            return parkingLotId 
              ? `/dashboard/owner/parking-lots/${parkingLotId}/slots`
              : "/dashboard/owner/parking-lots/slots";
          })()}>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition">
                  <Grid3X3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Slot Control</h3>
                  <p className="text-sm text-gray-400">
                    Manage parking slots & AI override
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">AI Detection</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Camera Feed</span>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">WebSocket Server</span>
              <span className={isConnected ? "text-green-400" : "text-red-400"}>
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
