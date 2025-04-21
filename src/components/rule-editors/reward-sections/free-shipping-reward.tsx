"use client"

import type { Rule } from "@/types/rule-types"
import { SHIPPING_ZONE_OPTIONS } from "@/types/rule-types"
import { Search } from "lucide-react"

interface FreeShippingRewardProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

export function FreeShippingReward({ rule, onConfigChange }: FreeShippingRewardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm">Free shipping for customer orders to</span>

        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
            value={rule.config.shippingZoneType || "all"}
            onChange={(e) => onConfigChange("shippingZoneType", e.target.value)}
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

      {rule.config.shippingZoneType === "selected" && (
        <div className="flex items-center gap-2 ml-4">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">Including zones:</span>

          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Click to add zones"
            />
          </div>
        </div>
      )}
    </div>
  )
}
