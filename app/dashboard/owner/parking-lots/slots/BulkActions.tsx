"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Wrench, Grid3X3, Columns, LayoutGrid } from "lucide-react";

type BulkActionType = "all" | "row" | "zone";

interface BulkActionsProps {
  lotSlug: string;
  totalSlots?: number;
  slotsPerRow?: number;
  onActionComplete?: () => void;
}

export default function BulkActions({ 
  lotSlug,
  totalSlots = 40, 
  slotsPerRow = 8,
  onActionComplete 
}: BulkActionsProps) {

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: BulkActionType;
    status: string;
    row?: string;
    zone?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate number of rows
  const numRows = Math.ceil(totalSlots / slotsPerRow);
  const rowLabels = Array.from({ length: numRows }, (_, i) => 
    String.fromCharCode(65 + i)
  ); // A, B, C, D, E...

  const zones = [
    { id: "entry", name: "Entry Zone", slots: "A1-A4" },
    { id: "center", name: "Center Zone", slots: "B1-D8" },
    { id: "exit", name: "Exit Zone", slots: "E1-E8" },
  ];

  const initiateAction = (type: BulkActionType, status: string, row?: string, zone?: string) => {
    setPendingAction({ type, status, row, zone });
    setShowConfirm(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    setIsLoading(true);
    
    try {
      const body: any = { 
        lotSlug,
        type: pendingAction.type,
        status: pendingAction.status 
      };
      
      if (pendingAction.type === "row" && pendingAction.row) {
        body.row = pendingAction.row;
        body.slotsPerRow = slotsPerRow;
      } else if (pendingAction.type === "zone" && pendingAction.zone) {
        body.zone = pendingAction.zone;
      }


      const response = await fetch("/api/owner/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Bulk action completed:", result);
        onActionComplete?.();
      } else {
        console.error("❌ Bulk action failed");
      }
    } catch (error) {
      console.error("Error executing bulk action:", error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setPendingAction(null);
    }
  };

  const getActionDescription = () => {
    if (!pendingAction) return "";
    
    const statusText = pendingAction.status === "AVAILABLE" ? "Open" :
                      pendingAction.status === "OCCUPIED" ? "Close" :
                      "Set Maintenance for";
    
    if (pendingAction.type === "all") {
      return `${statusText} ALL slots`;
    } else if (pendingAction.type === "row" && pendingAction.row) {
      return `${statusText} Row ${pendingAction.row} (slots ${pendingAction.row}1-${pendingAction.row}${slotsPerRow})`;
    } else if (pendingAction.type === "zone" && pendingAction.zone) {
      const zone = zones.find(z => z.id === pendingAction.zone);
      return `${statusText} ${zone?.name} (${zone?.slots})`;
    }
    
    return "";
  };

  const getActionColor = () => {
    if (!pendingAction) return "bg-gray-600";
    
    switch (pendingAction.status) {
      case "AVAILABLE": return "bg-green-600";
      case "OCCUPIED": return "bg-red-600";
      case "DISABLED": return "bg-gray-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* All Slots Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <LayoutGrid size={16} />
          All Slots:
        </span>
        <button
          onClick={() => initiateAction("all", "AVAILABLE")}
          className="px-3 py-1.5 bg-green-600/80 hover:bg-green-600 text-white rounded text-sm transition flex items-center gap-1"
        >
          <CheckCircle size={14} />
          Open All
        </button>
        <button
          onClick={() => initiateAction("all", "OCCUPIED")}
          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded text-sm transition flex items-center gap-1"
        >
          <XCircle size={14} />
          Close All
        </button>
        <button
          onClick={() => initiateAction("all", "DISABLED")}
          className="px-3 py-1.5 bg-gray-600/80 hover:bg-gray-600 text-white rounded text-sm transition flex items-center gap-1"
        >
          <Wrench size={14} />
          Maintenance
        </button>
      </div>

      {/* Row Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Columns size={16} />
          By Row:
        </span>
        {rowLabels.map((row) => (
          <div key={row} className="flex items-center gap-1">
            <button
              onClick={() => initiateAction("row", "AVAILABLE", row)}
              className="px-2 py-1 bg-green-600/60 hover:bg-green-600 text-white rounded text-xs transition"
              title={`Open Row ${row}`}
            >
              {row}↗
            </button>
            <button
              onClick={() => initiateAction("row", "OCCUPIED", row)}
              className="px-2 py-1 bg-red-600/60 hover:bg-red-600 text-white rounded text-xs transition"
              title={`Close Row ${row}`}
            >
              {row}✕
            </button>
          </div>
        ))}
      </div>

      {/* Zone Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Grid3X3 size={16} />
          By Zone:
        </span>
        {zones.map((zone) => (
          <div key={zone.id} className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{zone.name}:</span>
            <button
              onClick={() => initiateAction("zone", "AVAILABLE", undefined, zone.id)}
              className="px-2 py-1 bg-green-600/60 hover:bg-green-600 text-white rounded text-xs transition"
            >
              Open
            </button>
            <button
              onClick={() => initiateAction("zone", "OCCUPIED", undefined, zone.id)}
              className="px-2 py-1 bg-red-600/60 hover:bg-red-600 text-white rounded text-xs transition"
            >
              Close
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold">Confirm Bulk Action</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to <strong>{getActionDescription()}</strong>?
              This will affect multiple slots immediately.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 ${getActionColor()} hover:opacity-90 text-white rounded transition flex items-center gap-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
