"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Battery, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";

interface ParkingSlot {
  id: number;
  slotNumber: number;
  label: string;
  status: "available" | "occupied" | "reserved" | "disabled";
  type?: "standard" | "compact" | "large" | "handicap" | "ev";
  price?: number;
}

interface MobileSlotViewProps {
  slots: ParkingSlot[];
  availableSlots: number;
  totalSlots: number;
  isConnected: boolean;
  batteryLevel: number | null;
  onSlotClick: (slot: ParkingSlot) => void;
  selectedSlot: ParkingSlot | null;
}

export default function MobileSlotView({
  slots,
  availableSlots,
  totalSlots,
  isConnected,
  batteryLevel,
  onSlotClick,
  selectedSlot,
}: MobileSlotViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const slotsPerPage = 16; // 4x4 grid for mobile
  const totalPages = Math.ceil(slots.length / slotsPerPage);

  const getCurrentPageSlots = () => {
    const start = currentPage * slotsPerPage;
    return slots.slice(start, start + slotsPerPage);
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 border-green-400";
      case "occupied":
        return "bg-red-500 border-red-400";
      case "reserved":
        return "bg-yellow-500 border-yellow-400";
      case "ev":
        return "bg-blue-500 border-blue-400";
      default:
        return "bg-gray-500 border-gray-400";
    }
  };

  const getSlotIcon = (type?: string) => {
    switch (type) {
      case "ev":
        return <Battery className="w-4 h-4 text-white" />;
      case "handicap":
        return <span className="text-white text-xs">♿</span>;
      default:
        return <Car className="w-4 h-4 text-white" />;
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">Select a Slot</h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            {batteryLevel !== null && (
              <div className="flex items-center gap-1">
                <Battery 
                  className={`w-5 h-5 ${
                    batteryLevel < 20 ? "text-red-400" : "text-green-400"
                  }`} 
                />
                <span className="text-xs">{Math.round(batteryLevel)}%</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {availableSlots} of {totalSlots} available
          </span>
          <span className="text-cyan-400">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
      </div>

      {/* Mobile Slot Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {getCurrentPageSlots().map((slot) => (
              <motion.button
                key={slot.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSlotClick(slot)}
                disabled={slot.status !== "available"}
                className={`
                  relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center
                  ${getSlotColor(slot.status)}
                  ${slot.status === "available" ? "active:scale-95" : "opacity-50"}
                  ${selectedSlot?.id === slot.id ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""}
                `}
              >
                <span className="text-white font-bold text-sm">
                  {slot.slotNumber}
                </span>
                <div className="mt-1">
                  {getSlotIcon(slot.type)}
                </div>
                {slot.status === "available" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-300 rounded-full animate-pulse" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`
              flex items-center gap-1 px-4 py-2 rounded-lg transition
              ${currentPage === 0 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-cyan-600 text-white active:bg-cyan-700"}
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            Prev
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`
                  w-2 h-2 rounded-full transition
                  ${i === currentPage ? "bg-cyan-400 w-4" : "bg-gray-600"}
                `}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`
              flex items-center gap-1 px-4 py-2 rounded-lg transition
              ${currentPage === totalPages - 1 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-cyan-600 text-white active:bg-cyan-700"}
            `}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-900 border-t border-gray-800 p-3">
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-300">Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-300">Reserved</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-300">EV</span>
          </div>
        </div>
      </div>
    </div>
  );
}
