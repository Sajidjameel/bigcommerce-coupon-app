"use client"

import { useState } from "react"
import type { Rule } from "@/types/rule-types"
import { CONDITION_OPTIONS, REWARD_OPTIONS, FREQUENCY_OPTIONS } from "@/types/rule-types"

// Import condition components
import { BuysProductsCondition } from "./condition-sections/buys-products-condition"
import { ReachesSubtotalCondition } from "./condition-sections/reaches-subtotal-condition"
import { NoConditionsCondition } from "./condition-sections/no-conditions--condition"

// Import reward components
import { GiftCartReward } from "./reward-sections/gift-cart-reward"
import { FreeShippingReward } from "./reward-sections/free-shipping-reward"
import { DiscountProductsReward } from "./reward-sections/discount-products-reward"
import { DiscountSubtotalReward } from "./reward-sections/discount-subtotal-reward"
import { FixedPriceReward } from "./reward-sections/fixed-price-reward"

// Import validation functions
import { validateRule, validateShippingZones } from "@/components/rule-editors/rule-validation"
import { useCouponContext } from "../Context/CouponContext"

interface CustomRuleEditorProps {
  rule: Rule
  onRuleChange: (rule: Rule) => void
  onSave: () => void
  onCancel: () => void
  onSwitchRule: () => void
}

export function CustomRuleEditor({ rule, onRuleChange, onSave, onCancel, onSwitchRule }: CustomRuleEditorProps) {
  const {formData, setFormData, addRule} = useCouponContext() 
  const [selectedCondition, setSelectedCondition] = useState(
    CONDITION_OPTIONS.find((option) => option.value === rule.condition) || CONDITION_OPTIONS[0],
  )

  const [selectedReward, setSelectedReward] = useState(
    REWARD_OPTIONS.find((option) => option.value === rule.reward) || REWARD_OPTIONS[0],
  )

  const [validationErrors, setValidationErrors] = useState({
    conditionSelection: "",
    conditionProducts: "",
    conditionExclusionProducts: "",
    rewardSelection: "",
    rewardProducts: "",
    rewardExclusionProducts: "",
  })
  const [showRuleModal, setShowRuleModal] = useState<boolean>(false)

  const handleConditionChange = (value: string) => {
    const condition = CONDITION_OPTIONS.find((option) => option.value === value) || CONDITION_OPTIONS[0]
    setSelectedCondition(condition)
    setValidationErrors((prev) => ({
      ...prev,
      conditionSelection: "",
      conditionProducts: "",
      conditionExclusionProducts: "",
    }))

    const updatedRule = { ...rule, condition: value }

    if (value === "reaches_subtotal") {
      updatedRule.config = { ...updatedRule.config, minimumSpend: updatedRule.config.minimumSpend || 0 }
    } else if (value === "buys_products") {
      updatedRule.config = {
        ...updatedRule.config,
        reachingType: updatedRule.config.reachingType || "quantity",
        reachingQuantity: updatedRule.config.reachingQuantity || 1,
        reachingValue: updatedRule.config.reachingValue || 0,
        inclusionRule: updatedRule.config.inclusionRule || {
          id: `inclusion-${Date.now()}`,
          type: "individual", // Default is "individual" as per the updated code
          value: "",
          selector: "",
          additionalConditions: [],
        },
        exclusionRules: updatedRule.config.exclusionRules || [],
      }
    }

    onRuleChange(updatedRule)
  }

  const handleRewardChange = (value: string) => {
    const reward = REWARD_OPTIONS.find((option) => option.value === value) || REWARD_OPTIONS[0]
    setSelectedReward(reward)
    setValidationErrors((prev) => ({
      ...prev,
      rewardSelection: "",
      rewardProducts: "",
      rewardExclusionProducts: "",
    }))

    const updatedRule = { ...rule, reward: value }

    if (value === "gift_cart") {
      updatedRule.config = {
        ...updatedRule.config,
        giftQuantity: updatedRule.config.giftQuantity || 1,
        giftProduct: updatedRule.config.giftProduct || "",
      }
    } else if (value === "free_shipping") {
      updatedRule.config = {
        ...updatedRule.config,
        shippingZoneType: updatedRule.config.shippingZoneType || "all",
        selectedZones: updatedRule.config.selectedZones || [],
      }
    } else if (value === "discount_products") {
      updatedRule.config = {
        ...updatedRule.config,
        discountType: updatedRule.config.discountType || "percentage",
        discountValue: updatedRule.config.discountValue || 10,
        discountFrom: updatedRule.config.discountFrom || "each_product",
        appliedOn: updatedRule.config.appliedOn || "all",
        appliedQuantity: updatedRule.config.appliedQuantity || 1,
        appliedTarget: updatedRule.config.appliedTarget || "least_expensive",
        includeOnSale: updatedRule.config.includeOnSale !== undefined ? updatedRule.config.includeOnSale : true,
        includeConditionProducts: updatedRule.config.includeConditionProducts || false,
        rewardInclusionRule: updatedRule.config.rewardInclusionRule || {
          id: `reward-inclusion-${Date.now()}`,
          type: "individual", // Default is "individual" as per the updated code
          value: "",
          selector: "",
          additionalConditions: [],
        },
        rewardExclusionRules: updatedRule.config.rewardExclusionRules || [],
      }
    } else if (value === "discount_subtotal") {
      updatedRule.config = {
        ...updatedRule.config,
        discountType: updatedRule.config.discountType || "percentage",
        discountValue: updatedRule.config.discountValue || 10,
      }
    } else if (value === "fixed_price") {
      updatedRule.config = {
        ...updatedRule.config,
        price: updatedRule.config.price || 0,
        quantity: updatedRule.config.quantity || 1,
        applyTo: updatedRule.config.applyTo || "Least expensive",
        includeOnSale: updatedRule.config.includeOnSale !== undefined ? updatedRule.config.includeOnSale : true,
        includeConditionProducts: updatedRule.config.includeConditionProducts || false,
        rewardInclusionRule: updatedRule.config.rewardInclusionRule || {
          id: `reward-inclusion-${Date.now()}`,
          type: "individual", // Default is "individual" as per the updated code
          value: "",
          selector: "",
          additionalConditions: [],
        },
        rewardExclusionRules: updatedRule.config.rewardExclusionRules || [],
      }
    }

    onRuleChange(updatedRule)
  }

  const handleConfigChange = (field: string, value: string | number | boolean | object | null) => {
    onRuleChange({
      ...rule,
      config: {
        ...rule.config,
        [field]: value,
      },
    })

    // Clear relevant validation errors when config changes
    if (field === "inclusionRule") {
      setValidationErrors((prev) => ({ ...prev, conditionProducts: "" }))
    } else if (field === "exclusionRules") {
      setValidationErrors((prev) => ({ ...prev, conditionExclusionProducts: "" }))
    } else if (field === "rewardInclusionRule" || field === "giftProduct") {
      setValidationErrors((prev) => ({ ...prev, rewardProducts: "" }))
    } else if (field === "rewardExclusionRules") {
      setValidationErrors((prev) => ({ ...prev, rewardExclusionProducts: "" }))
    } else if (field === "shippingZoneType" && value === "all") {
      setValidationErrors((prev) => ({ ...prev, rewardProducts: "" }))
    } else if (field === "selectedZones" && Array.isArray(value) && value.length > 0) {
      setValidationErrors((prev) => ({ ...prev, rewardProducts: "" }))
    }
  }

  const handleSave = () => {
    addRule(rule)
    const newErrors = validateRule(rule)
    setValidationErrors(newErrors)

    if (!Object.values(newErrors).some((error) => error !== "")) {
      onSave()
    }
  }

  const renderConditionComponent = () => {
    switch (rule.condition) {
      case "buys_products":
        return <BuysProductsCondition rule={rule} onConfigChange={handleConfigChange} />
      case "reaches_subtotal":
        return <ReachesSubtotalCondition rule={rule} onConfigChange={handleConfigChange} />
      case "no_conditions":
        return <NoConditionsCondition />
      default:
        return null
    }
  }

  const renderRewardComponent = () => {
    switch (rule.reward) {
      case "gift_cart":
        return <GiftCartReward rule={rule} onConfigChange={handleConfigChange} />
      case "free_shipping":
        // Check shipping zones validation
        const shippingError = validateShippingZones(rule)
        if (shippingError) {
          setValidationErrors((prev) => ({
            ...prev,
            rewardProducts: shippingError,
          }))
        }
        return <FreeShippingReward rule={rule} onConfigChange={handleConfigChange} />
      case "discount_products":
        return <DiscountProductsReward rule={rule} onConfigChange={handleConfigChange} />
      case "discount_subtotal":
        return <DiscountSubtotalReward rule={rule} onConfigChange={handleConfigChange} />
      case "fixed_price":
        return <FixedPriceReward rule={rule} onConfigChange={handleConfigChange} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-medium">Rules</h3>
          <button
            type="button"
            onClick={onSwitchRule}
            className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
          >
            Switch rule
          </button>
        </div>

        <div className="space-y-6">
          {/* Condition Section */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-sm">If the customer</div>
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-64"
                value={rule.condition}
                onChange={(e) => handleConditionChange(e.target.value)}
              >
                {/* <option value="">Select condition</option> */}
                {CONDITION_OPTIONS.map((option) => (
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
          {validationErrors.conditionSelection && (
            <p className="text-red-500 text-sm -mt-3 ml-24">{validationErrors.conditionSelection}</p>
          )}

          {/* Condition Details */}
          <div className="pl-6 mb-4 space-y-4">
            {renderConditionComponent()}
            {validationErrors.conditionProducts && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.conditionProducts}</p>
            )}
            {validationErrors.conditionExclusionProducts && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.conditionExclusionProducts}</p>
            )}
          </div>

          {/* Reward Section */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-sm">Then reward</div>
            <div className="relative">
              <select
                className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-64"
                value={rule.reward || ""}
                onChange={(e) => handleRewardChange(e.target.value)}
              >
                {/* <option value="">Select reward</option> */}
                {REWARD_OPTIONS.map((option) => (
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

            {!(selectedReward.value === "free_shipping") && (
              <>
                <div className="relative ml-2">
                  <select
                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
                    value={rule.config.frequency || "once"}
                    onChange={(e) => handleConfigChange("frequency", e.target.value)}
                  >
                    {FREQUENCY_OPTIONS.map((option) => (
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
                <span className="text-sm">per cart</span>
              </>
            )}
          </div>
          {validationErrors.rewardSelection && (
            <p className="text-red-500 text-sm -mt-3 ml-24">{validationErrors.rewardSelection}</p>
          )}

          {/* Reward Details */}
          <div className="pl-6 mb-4 space-y-4">
            {renderRewardComponent()}
            {validationErrors.rewardProducts && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.rewardProducts}</p>
            )}
            {validationErrors.rewardExclusionProducts && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.rewardExclusionProducts}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4 flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
            >
              Back to promotion
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer rounded"
            >
              Add rule to promotion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
