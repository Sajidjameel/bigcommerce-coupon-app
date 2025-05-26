"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, X } from "lucide-react"
import type { Rule } from "@/types/rule-types"
import { SHIPPING_ZONE_OPTIONS } from "@/types/rule-types"
import { ZoneSelectionModal } from "@/components/UI/zone-selection"

interface Zone {
  zoneid: number
  name: string
  enabled: boolean
}

interface FreeShippingRewardProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

export function FreeShippingReward({ rule, onConfigChange }: FreeShippingRewardProps) {
  // Force the dropdown to show 'selected' when there are selected zones
  if (rule.config?.selectedZones && rule.config.selectedZones.length > 0) {
    rule.config.shippingZoneType = "selected"
  }
  
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [selectedZones, setSelectedZones] = useState<Zone[]>(rule.config?.selectedZones || [])
  const [zoneType, setZoneType] = useState<"all" | "selected">(rule.config?.shippingZoneType || "all")

  // Sync local state with prop changes when rule is loaded for editing
  useEffect(() => {
    if (rule.config?.selectedZones) {
      setSelectedZones(rule.config.selectedZones)
    }
    if (rule.config?.shippingZoneType) {
      setZoneType(rule.config.shippingZoneType)
    }
  }, [rule.id])

  // Stable callback for zone selection
  const handleZoneSelection = useCallback((zones: Zone[]) => {
    setSelectedZones(zones)
    setShowZoneModal(true)
    
    onConfigChange("selectedZones", zones)
  }, [onConfigChange])

  // Stable callback for removing zones
  const removeZone = useCallback((zoneId: number) => {
    setSelectedZones(prevZones => {
      const newZones = prevZones.filter(zone => zone.zoneid !== zoneId)
      onConfigChange("selectedZones", newZones)
      return newZones
    })
  }, [onConfigChange])

  const handleZoneTypeChange = (value: "all" | "selected") => {
    setZoneType(value)
    
    // Save the shipping zone type to the rule config
    onConfigChange("shippingZoneType", value)
    
    if (value === "all") {
      // Clear selected zones when "all zones" is selected
      onConfigChange("selectedZones", [])
    } else if (value === "selected") {
      // Only open modal if no zones are currently selected
      if (selectedZones.length === 0) {
        setShowZoneModal(true)
      }
      // Keep existing selected zones
      onConfigChange("selectedZones", selectedZones)
    }
  }
 // Stable callback for zone type change
  // const handleZoneTypeChange = useCallback((value: string) => {
  //   onConfigChange("shippingZoneType", value)
  //   if (value === "all") {
  //     // Only update selectedZones if changing to "all"
  //     onConfigChange("selectedZones", [])
  //   } 
  //   // else if (value === "selected") {
  //   //   // If changing to "selected", ensure selectedZones is set
  //   //   onConfigChange("selectedZones", selectedZones)
  //   // }
  // }, [onConfigChange])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm">Free shipping for customer orders to</span>

        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
            value={zoneType}
            onChange={(e) => handleZoneTypeChange(e.target.value as "all" | "selected")}
          >
            {SHIPPING_ZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      { zoneType === "selected" && (
        <div className="flex items-center gap-2 ml-4">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">Including zones:</span>

          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <div
              className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[38px] flex items-center flex-wrap gap-1 cursor-pointer"
              onClick={() => setShowZoneModal(true)}
            >
              {selectedZones.length > 0 ? (
                selectedZones.map((zone) => (
                  <div key={zone.zoneid} className="bg-gray-200 rounded px-2 py-0.5 flex items-center gap-1">
                    <span>{zone.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeZone(zone.zoneid)
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-gray-500">Click to add zones</span>
              )}
            </div>
          </div>
        </div>
      )}

      <ZoneSelectionModal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        onApply={handleZoneSelection}
        initialSelectedZones={selectedZones}
      />
    </div>
  )
} 