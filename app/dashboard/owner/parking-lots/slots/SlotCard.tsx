"use client";

export default function SlotCard({ slot }: any) {
  const color =
    slot.status === "AVAILABLE" ? "border-green-500 bg-green-500/10"
    : slot.status === "OCCUPIED" ? "border-red-500 bg-red-500/10"
    : slot.status === "RESERVED" ? "border-yellow-500 bg-yellow-500/10"
    : "border-gray-600 bg-gray-700/30";

  const toggle = async () => {
    await fetch("/api/owner/slots/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotNumber: slot.slotNumber,
        status:
          slot.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE",
      }),
    });
  };

  return (
    <button
      onClick={toggle}
      className={`relative h-[90px] rounded-xl border ${color}
        flex flex-col items-center justify-center
        hover:scale-[1.03] transition`}
    >
      <span className="text-white font-semibold">
        P-{String(slot.slotNumber).padStart(3, "0")}
      </span>
      <span className="text-xs text-gray-400">
        {slot.status}
      </span>

      <span className="absolute top-1 right-2 text-[10px] text-cyan-400">
        AI {slot.confidence}%
      </span>
    </button>
  );
}
