"use client"

import type { Rule, RuleModel } from "@/types/rule-types"
import {
  DISCOUNT_TYPE_OPTIONS,
  DISCOUNT_FROM_OPTIONS,
  APPLIED_ON_OPTIONS,
  APPLIED_TARGET_OPTIONS,
} from "@/types/rule-types"
import { MinusCircle, PlusCircle } from "lucide-react"
import { ProductInclusionRule } from "../product-inclusion-rule"
import { ProductExclusionRule } from "../product-exclusion-rule"
import { useState, useCallback } from "react"

interface DiscountProductsRewardProps {
  rule: Rule
  onConfigChange: (field: string, value: string | number | boolean | object) => void
}

export function DiscountProductsReward({ rule, onConfigChange }: DiscountProductsRewardProps) {
  const [discountType, setDiscountType] = useState<string>(rule.config.discountType || "percentage")

  const handleDiscountTypeChange = useCallback((type: string) => {
    setDiscountType(type)
    onConfigChange("discountType", type)
  }, [onConfigChange])

  const handleAppliedQuantityChange = useCallback((increment: boolean) => {
    const currentQuantity = rule.config.appliedQuantity ?? 0
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1)
    onConfigChange("appliedQuantity", newQuantity)
  }, [rule.config.appliedQuantity, onConfigChange])

  const handleRewardInclusionRuleChange = useCallback((updatedRule: RuleModel) => {
    onConfigChange("rewardInclusionRule", updatedRule)
  }, [onConfigChange])

  const handleRewardExclusionRulesChange = useCallback((updatedRules: RuleModel[]) => {
    onConfigChange("rewardExclusionRules", updatedRules)
  }, [onConfigChange])

  return (
    <div className="space-y-4">
      {/* Discount Type and Value */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm">By a</span>
        <div className="relative">
          <select
            className="cursor-pointer appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
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
              className=" border border-gray-300 rounded px-3 py-2 text-sm w-16 text-right  no-spinner"
              value={rule.config.discountValue ?? 10}
              onChange={(e) => onConfigChange("discountValue", Number(e.target.value))}
            />
            <span className="ml-1 text-sm">%</span>
          </div>
        ) : (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">£</span>
            <input
             
              className="border border-gray-300 rounded pl-8 pr-3 py-2 text-sm w-24"
              value={rule.config.discountValue ?? 10}
              onChange={(e) => onConfigChange("discountValue", Number(e.target.value))}
            /> 
          </div>
        )}

        <span className="text-sm">from</span>

        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-64"
            value={rule.config.discountFrom || "each_product"}
            onChange={(e) => onConfigChange("discountFrom", e.target.value)}
          >
            {DISCOUNT_FROM_OPTIONS.map((option) => (
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

      {/* Applied On */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm">Applied on</span>
        <div className="relative">
          <select
            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
            value={rule.config.appliedOn || "all"}
            onChange={(e) => onConfigChange("appliedOn", e.target.value)}
          >
            {APPLIED_ON_OPTIONS.map((option) => (
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

        {rule.config.appliedOn === "up_to" && (
          <>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                type="button"
                onClick={() => handleAppliedQuantityChange(false)}
                disabled={(rule.config.appliedQuantity ?? 1) <= 1}
                className={`px-2 py-1 ${
                  (rule.config.appliedQuantity ?? 1) <= 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MinusCircle
                  className={`w-4 h-4 ${(rule.config.appliedQuantity ?? 1) <= 1 ? "text-gray-300" : "text-blue-600"}`}
                />
              </button>
              <input
                type="text"
                className="w-8 text-center border-0 focus:ring-0"
                value={rule.config.appliedQuantity ?? 1}
                readOnly
              />
              <button
                type="button"
                onClick={() => handleAppliedQuantityChange(true)}
                className="px-2 py-1 text-gray-500 hover:text-gray-700"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <span className="text-sm">Of the</span>
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-40"
                value={rule.config.appliedTarget || "least_expensive"}
                onChange={(e) => onConfigChange("appliedTarget", e.target.value)}
              >
                {APPLIED_TARGET_OPTIONS.map((option) => (
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
            <span className="text-sm">products in the cart</span>
          </>
        )}

        {rule.config.appliedOn === "all" && <span className="text-sm">products</span>}
      </div>

      {/* Include Options */}
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="include-sale"
            checked={!!rule.config.includeOnSale}
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
            checked={!!rule.config.includeConditionProducts}
            onChange={(e) => onConfigChange("includeConditionProducts", e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="include-condition" className="text-sm">
            Including products that satisfy the condition
          </label>
        </div>
      </div>

      {/* Product Inclusion Rule for Reward */}
      {rule.config.rewardInclusionRule && (
        <>
          {/* <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Including products</span>
          </div> */}
          <ProductInclusionRule
            rule={rule.config.rewardInclusionRule}
            onRuleChange={handleRewardInclusionRuleChange}
          />
        </>
      )}

      {/* Product Exclusion Rules for Reward */}
      <ProductExclusionRule
        rules={rule.config.rewardExclusionRules ?? []}
        onRulesChange={handleRewardExclusionRulesChange}
      />
    </div>
  )
}
