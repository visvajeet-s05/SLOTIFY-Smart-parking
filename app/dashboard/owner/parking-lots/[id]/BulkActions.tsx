"use client"

import { useState } from "react"
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wrench, 
  Grid3X3, 
  Columns, 
  LayoutGrid,
  Loader2
} from "lucide-react"

type BulkActionType = "all" | "row" | "zone"

interface BulkActionsProps {
  lotSlug: string
  totalSlots?: number
  slotsPerRow?: number
  onActionComplete?: () => void
}

export default function BulkActions({ 
  lotSlug,
  totalSlots = 40, 
  slotsPerRow = 8,
  onActionComplete 
}: BulkActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: BulkActionType
    status: string
    row?: string
    zone?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    updatedCount?: number
  } | null>(null)

  // Calculate number of rows
  const numRows = Math.ceil(totalSlots / slotsPerRow)
  const rowLabels = Array.from({ length: numRows }, (_, i) => 
    String.fromCharCode(65 + i)
  ) // A, B, C, D, E...

  const zones = [
    { id: "entry", name: "Entry Zone", slots: "1-8" },
    { id: "center", name: "Center Zone", slots: "9-24" },
    { id: "exit", name: "Exit Zone", slots: "25-32" },
  ]

  const initiateAction = (type: BulkActionType, status: string, row?: string, zone?: string) => {
    setPendingAction({ type, status, row, zone })
    setShowConfirm(true)
    setResult(null)
  }

  const executeAction = async () => {
    if (!pendingAction) return

    setIsLoading(true)
    
    try {
      const body: any = { 
        lotSlug,
        type: pendingAction.type, 
        status: pendingAction.status 
      }
      
      if (pendingAction.type === "row" && pendingAction.row) {
        body.row = pendingAction.row
        body.slotsPerRow = slotsPerRow
      } else if (pendingAction.type === "zone" && pendingAction.zone) {
        body.zone = pendingAction.zone
      }

      const response = await fetch("/api/owner/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          updatedCount: data.updatedCount
        })
        onActionComplete?.()
      } else {
        setResult({
          success: false,
          message: data.error || "Bulk action failed"
        })
      }
    } catch (error) {
      console.error("Error executing bulk action:", error)
      setResult({
        success: false,
        message: "Network error occurred"
      })
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
      setPendingAction(null)
    }
  }

  const getActionDescription = () => {
    if (!pendingAction) return ""
    
    const statusText = pendingAction.status === "AVAILABLE" ? "Open" :
                      pendingAction.status === "OCCUPIED" ? "Close" :
                      "Set Maintenance for"
    
    if (pendingAction.type === "all") {
      return `${statusText} ALL slots`
    } else if (pendingAction.type === "row" && pendingAction.row) {
      return `${statusText} Row ${pendingAction.row} (slots ${pendingAction.row}1-${pendingAction.row}${slotsPerRow})`
    } else if (pendingAction.type === "zone" && pendingAction.zone) {
      const zone = zones.find(z => z.id === pendingAction.zone)
      return `${statusText} ${zone?.name} (${zone?.slots})`
    }
    
    return ""
  }

  const getActionColor = () => {
    if (!pendingAction) return "bg-gray-600"
    
    switch (pendingAction.status) {
      case "AVAILABLE": return "bg-emerald-600"
      case "OCCUPIED": return "bg-red-600"
      case "DISABLED": return "bg-gray-600"
      default: return "bg-gray-600"
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-purple-400" />
          Bulk Actions
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* All Slots Actions */}
        <div>
          <span className="text-sm text-gray-400 flex items-center gap-1 mb-2">
            <LayoutGrid size={16} />
            All Slots:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => initiateAction("all", "AVAILABLE")}
              className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-sm transition flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Open All
            </button>
            <button
              onClick={() => initiateAction("all", "OCCUPIED")}
              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm transition flex items-center gap-1"
            >
              <XCircle size={14} />
              Close All
            </button>
            <button
              onClick={() => initiateAction("all", "DISABLED")}
              className="px-3 py-1.5 bg-gray-600/80 hover:bg-gray-600 text-white rounded-lg text-sm transition flex items-center gap-1"
            >
              <Wrench size={14} />
              Maintenance
            </button>
          </div>
        </div>

        {/* Row Actions */}
        <div>
          <span className="text-sm text-gray-400 flex items-center gap-1 mb-2">
            <Columns size={16} />
            By Row:
          </span>
          <div className="flex flex-wrap gap-2">
            {rowLabels.map((row) => (
              <div key={row} className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium w-4">{row}</span>
                <button
                  onClick={() => initiateAction("row", "AVAILABLE", row)}
                  className="px-2 py-1 bg-emerald-600/60 hover:bg-emerald-600 text-white rounded text-xs transition"
                  title={`Open Row ${row}`}
                >
                  ↗
                </button>
                <button
                  onClick={() => initiateAction("row", "OCCUPIED", row)}
                  className="px-2 py-1 bg-red-600/60 hover:bg-red-600 text-white rounded text-xs transition"
                  title={`Close Row ${row}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Actions */}
        <div>
          <span className="text-sm text-gray-400 flex items-center gap-1 mb-2">
            <Grid3X3 size={16} />
            By Zone:
          </span>
          <div className="space-y-2">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30">
                <div>
                  <span className="text-sm text-gray-300">{zone.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({zone.slots})</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => initiateAction("zone", "AVAILABLE", undefined, zone.id)}
                    className="px-2 py-1 bg-emerald-600/60 hover:bg-emerald-600 text-white rounded text-xs transition"
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
              </div>
            ))}
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div className={`p-3 rounded-lg ${result.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
            <p className={`text-sm ${result.success ? "text-emerald-400" : "text-red-400"}`}>
              {result.success ? "✓" : "✗"} {result.message}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold text-white">Confirm Bulk Action</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to <strong>{getActionDescription()}</strong>?
              This will affect multiple slots immediately.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setPendingAction(null)
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 ${getActionColor()} hover:opacity-90 text-white rounded-lg transition flex items-center gap-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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
  )
}
