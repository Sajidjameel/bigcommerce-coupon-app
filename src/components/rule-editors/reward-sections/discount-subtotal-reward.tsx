"use client"

import type { Rule } from "@/types/rule-types"
import { DISCOUNT_TYPE_OPTIONS } from "@/types/rule-types"
import { useState } from "react"

interface DiscountSubtotalRewardProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

export function DiscountSubtotalReward({ rule, onConfigChange }: DiscountSubtotalRewardProps) {
  const [discountType, setDiscountType] = useState(rule.config.discountType || "percentage")

  const handleDiscountTypeChange = (type:any) => {
    setDiscountType(type )
    onConfigChange("discountType", type)
  }

  return (
    <div className="space-y-4">
      {/* Discount Type and Value */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm">Discounting by a</span>
        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
            value={discountType}
            onChange={(e) => handleDiscountTypeChange(e.target.value)}
          >
            {DISCOUNT_TYPE_OPTIONS.map((option) => (
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

        {discountType === "percentage" ? (
          <div className="flex items-center">
            <input
              type="number"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-16 text-right"
              value={rule.config.discountValue || 10}
              onChange={(e) => onConfigChange("discountValue", Number(e.target.value))}
            />
            <span className="ml-1 text-sm">%</span>
          </div>
        ) : (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">£</span>
            <input
              type="number"
              className="border border-gray-300 rounded pl-8 pr-3 py-2 text-sm w-24"
              value={rule.config.discountValue || 10}
              onChange={(e) => onConfigChange("discountValue", Number(e.target.value))}
            />
          </div>
        )}

        <span className="text-sm">from the order sub-total</span>
      </div>
    </div>
  )
}
