"use client"

import type { Rule } from "@/types/rule-types"

interface ReachesSubtotalConditionProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

export function ReachesSubtotalCondition({ rule, onConfigChange }: ReachesSubtotalConditionProps) {
  const minimumSpend = rule.config?.minimumSpend ?? 0

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      <span className="text-sm">Spending at least</span>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">£</span>
        <input
          type="number"
          className=" border border-gray-300 rounded pl-8 pr-3 py-2 text-sm w-32"
          value={minimumSpend}
          onChange={(e) => onConfigChange("minimumSpend", Number(e.target.value))}
        />
      </div>
      <span className="text-sm">on the order</span>
    </div>
  )
}
