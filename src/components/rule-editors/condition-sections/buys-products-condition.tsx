"use client"

import type { Rule, RuleModel } from "@/types/rule-types"
import { REACHING_TYPE_OPTIONS } from "@/types/rule-types"
import { MinusCircle, PlusCircle } from "lucide-react"
import { ProductInclusionRule } from "../product-inclusion-rule"
import { ProductExclusionRule } from "../product-exclusion-rule"

interface BuysProductsConditionProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

export function BuysProductsCondition({ rule, onConfigChange }: BuysProductsConditionProps) {
  const handleReachingTypeChange = (type: string) => {
    onConfigChange("reachingType", type)
  }

  const handleReachingQuantityChange = (increment: boolean) => {
    const current = typeof rule.config?.reachingQuantity === "number" ? rule.config.reachingQuantity : 1
    const newQuantity = increment ? current + 1 : Math.max(1, current - 1)
    onConfigChange("reachingQuantity", newQuantity)
  }

  const handleInclusionRuleChange = (updatedRule: RuleModel) => {
    onConfigChange("inclusionRule", updatedRule)
  }

  const handleExclusionRulesChange = (updatedRules: RuleModel[]) => {
    onConfigChange("exclusionRules", updatedRules)
  }

  const reachingType = rule.config?.reachingType ?? "quantity"
  const reachingQuantity = rule.config?.reachingQuantity ?? 1
  const reachingValue = rule.config?.reachingValue ?? 0

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm">Reaching a</span>
        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
            value={reachingType}
            onChange={(e) => handleReachingTypeChange(e.target.value)}
          >
            {REACHING_TYPE_OPTIONS.map((option) => (
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

        {reachingType === "quantity" && (
          <>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                type="button"
                onClick={() => handleReachingQuantityChange(false)}
                disabled={reachingQuantity <= 1}
                className={`px-2 py-1 ${
                  reachingQuantity <= 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MinusCircle
                  className={`w-4 h-4 ${reachingQuantity <= 1 ? "text-gray-300" : "text-blue-600"}`}
                />
              </button>
              <input
                type="text"
                className="w-8 text-center border-0 focus:ring-0"
                value={reachingQuantity}
                readOnly
              />
              <button
                type="button"
                onClick={() => handleReachingQuantityChange(true)}
                className="px-2 py-1 text-gray-500 hover:text-gray-700"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            <span className="text-sm">products</span>
          </>
        )}

        {reachingType === "total_value" && (
          <>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">£</span>
              <input
                type="number"
                className="border border-gray-300 rounded pl-8 pr-3 py-2 text-sm w-32"
                value={reachingValue}
                onChange={(e) => onConfigChange("reachingValue", Number(e.target.value))}
              />
            </div>
            <span className="text-sm">spent on products</span>
          </>
        )}
      </div>

      {/* Product Inclusion Rule */}
      {rule.config?.inclusionRule && (
        <ProductInclusionRule rule={rule.config.inclusionRule} onRuleChange={handleInclusionRuleChange} />
      )}

      {/* Product Exclusion Rules */}
      <ProductExclusionRule
        rules={rule.config?.exclusionRules || []}
        onRulesChange={handleExclusionRulesChange}
      />
    </>
  )
}
