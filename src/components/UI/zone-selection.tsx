"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"

interface Zone {
  zoneid: number
  name: string
  enabled: boolean
}

interface ZoneSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (selectedZones: Zone[]) => void
  initialSelectedZones?: Zone[]
}

let zonesCache: Zone[] | null = null

export function ZoneSelectionModal({
  isOpen,
  onClose,
  onApply,
  initialSelectedZones = [],
}: ZoneSelectionModalProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZoneIds, setSelectedZoneIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)



  
  const fetchZones = useCallback(async () => {
    if (zonesCache) {
      setZones(zonesCache)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/zones")
      if (!response.ok) throw new Error(`Failed to fetch zones (${response.status})`)

      const data = await response.json()
      const processedZones = data.map((zone: any) => ({
        zoneid: zone.zoneid,
        name: zone.name,
        enabled: zone.enabled,
      }))

      setZones(processedZones)
      zonesCache = processedZones
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleZone = (zoneid: number) => {
    setSelectedZoneIds(prev => {
      const updated = new Set(prev)
      updated.has(zoneid) ? updated.delete(zoneid) : updated.add(zoneid)
      return updated
    })
  }

  const handleApply = () => {
    const selected = zones.filter(zone => selectedZoneIds.has(zone.zoneid))
    onApply(selected)
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      fetchZones()
  
      // Only update selected zones if they're not already set
      setSelectedZoneIds(prev => {
        if (prev.size === 0) {
          return new Set(initialSelectedZones.map(z => z.zoneid))
        }
        return prev
      })
    }
  }, [isOpen, fetchZones])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-md shadow-lg w-[600px] h-[50vh] max-h-[90vh] overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-xl font-medium mb-6">Select Zones</h2>

          {Array.from(selectedZoneIds).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {zones
                .filter(z => selectedZoneIds.has(z.zoneid))
                .map(zone => (
                  <div
                    key={zone.zoneid}
                    className="bg-gray-200 rounded-md px-3 py-1 flex items-center gap-1 text-sm"
                  >
                    {zone.name}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleZone(zone.zoneid)
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}

          <div className="overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="py-4 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-2">Loading zones...</p>
              </div>
            ) : error ? (
              <div className="py-4 text-center text-red-500">{error}</div>
            ) : zones.length === 0 ? (
              <div className="py-4 text-center">No zones found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {zones.map(zone => (
                  <div key={zone.zoneid} className="py-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer border-gray-100 rounded focus:ring-blue-500"
                        checked={selectedZoneIds.has(zone.zoneid)}
                        onChange={() => toggleZone(zone.zoneid)}
                      />
                      <span className="ml-3">{zone.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-blue-600 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
