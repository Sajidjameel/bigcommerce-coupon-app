"use client"

import type { Rule, InclusionRule, ExclusionRule } from "@/types/rule-types"
import { MinusCircle, PlusCircle } from "lucide-react"
import { ProductInclusionRule } from "../product-inclusion-rule"
import { ProductExclusionRule } from "../product-exclusion-rule"

interface FixedPriceRewardProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

export function FixedPriceReward({ rule, onConfigChange }: FixedPriceRewardProps) {
  const quantity = rule?.config?.quantity ?? 1
  const price = rule?.config?.price ?? 0
  const applyTo = rule?.config?.applyTo ?? "Least expensive"
  const includeOnSale = rule?.config?.includeOnSale ?? false
  const includeConditionProducts = rule?.config?.includeConditionProducts ?? false
  const rewardInclusionRule = rule?.config?.rewardInclusionRule
  const rewardExclusionRules = rule?.config?.rewardExclusionRules ?? []

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : Math.max(1, quantity - 1)
    onConfigChange("quantity", newQuantity)
  }

  const handleRewardInclusionRuleChange = (updatedRule: InclusionRule) => {
    onConfigChange("rewardInclusionRule", updatedRule)
  }

  const handleRewardExclusionRulesChange = (updatedRules: ExclusionRule[]) => {
    onConfigChange("rewardExclusionRules", updatedRules)
  }

  return (
    <div className="space-y-4">
      {/* Price and Quantity */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        <span className="text-sm">Set the sub-total price to</span>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">£</span>
          <input
            type="number"
            className="border border-gray-300 rounded pl-8 pr-3 py-2 text-sm w-32"
            value={price}
            onChange={(e) => onConfigChange("price", parseFloat(e.target.value))}
          />
        </div>
        <span className="text-sm">for</span>
        <div className="flex items-center border border-gray-300 rounded">
          <button
            type="button"
            onClick={() => handleQuantityChange(false)}
            disabled={quantity <= 1}
            className={`px-2 py-1 ${
              quantity <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MinusCircle className={`cursor-pointer w-4 h-4 ${quantity <= 1 ? "text-gray-300" : "text-blue-600"}`} />
          </button>
          <input
            type="text"
            className="w-8 text-center border-0 focus:ring-0"
            value={quantity}
            readOnly
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(true)}
            className="px-2 py-1 text-gray-500 hover:text-gray-700"
          >
            <PlusCircle className="cursor-pointer w-4 h-4 text-blue-600" />
          </button>
        </div>
        <span className="text-sm">products</span>
      </div>

      {/* Apply To */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        <span className="text-sm">Applied to the</span>
        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-40"
            value={applyTo}
            onChange={(e) => onConfigChange("applyTo", e.target.value)}
          >
            <option value="Least expensive">Least expensive</option>
            <option value="Most expensive">Most expensive</option>
            <option value="All qualifying">All qualifying</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <span className="text-sm">products in the cart</span>
      </div>

      {/* Include Options */}
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="include-sale"
            checked={includeOnSale}
            onChange={(e) => onConfigChange("includeOnSale", e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="include-sale" className="text-sm">
            Including products already on sale
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="include-condition"
            checked={includeConditionProducts}
            onChange={(e) => onConfigChange("includeConditionProducts", e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="include-condition" className="text-sm">
            Including products that satisfy the condition
          </label>
        </div>
      </div>

      {/* Product Inclusion Rule for Reward */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        <span className="text-sm">Including products</span>
      </div>
      {rewardInclusionRule && (
        <ProductInclusionRule rule={rewardInclusionRule} onRuleChange={handleRewardInclusionRuleChange} />
      )}

      {/* Product Exclusion Rules for Reward */}
      <ProductExclusionRule
        rules={rewardExclusionRules}
        onRulesChange={handleRewardExclusionRulesChange}
      />
    </div>
  )
}
