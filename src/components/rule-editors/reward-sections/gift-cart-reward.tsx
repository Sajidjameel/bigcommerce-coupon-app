"use client"

import type { Rule } from "@/types/rule-types"
import { MinusCircle, PlusCircle, Search } from "lucide-react"

interface GiftCartRewardProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

export function GiftCartReward({ rule, onConfigChange }: GiftCartRewardProps) {
  const giftQuantity = rule?.config?.giftQuantity ?? 1
  const giftProduct = rule?.config?.giftProduct ?? ""

  const handleGiftQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? giftQuantity + 1 : Math.max(1, giftQuantity - 1)
    onConfigChange("giftQuantity", newQuantity)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      <span className="text-sm">Include</span>

      <div className="flex items-center border border-gray-300 rounded">
        <button
          type="button"
          onClick={() => handleGiftQuantityChange(false)}
          disabled={giftQuantity <= 1}
          className={`px-2 py-1 ${
            giftQuantity <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MinusCircle className={` cursor-pointer w-4 h-4 ${giftQuantity <= 1 ? "text-gray-300" : "text-blue-600"}`} />
        </button>
        <input
          type="text"
          className="w-8 text-center border-0 focus:ring-0"
          value={giftQuantity}
          readOnly
        />
        <button
          type="button"
          onClick={() => handleGiftQuantityChange(true)}
          className="px-2 py-1 text-gray-500 hover:text-gray-700"
        >
          <PlusCircle className="cursor-pointer w-4 h-4 text-blue-600" />
        </button>
      </div>

      <div className="relative flex-1 max-w-xs">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Click to add a single product"
          value={giftProduct}
          onChange={(e) => onConfigChange("giftProduct", e.target.value)}
        />
      </div>

      <span className="text-sm">in the customer&apos;s cart for free.</span>
    </div>
  )
}
