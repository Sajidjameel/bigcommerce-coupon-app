"use client"


import { useState } from "react"
import type { Rule } from "@/types/rule-types"
import { RuleList } from "@/components/rule-list"
import { RuleTypeModal } from "@/components/rule-type-modal"
import { getRuleEditor } from "@/components/rule-editors/rule-editor-factory"

export default function Rules() {
  const [rules, setRules] = useState<Rule[]>([])
  const [showRuleModal, setShowRuleModal] = useState<boolean>(false)
  const [showRuleEditor, setShowRuleEditor] = useState<boolean>(false)
  const [currentRule, setCurrentRule] = useState<Rule | null>(null)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [showRewardOptions, setShowRewardOptions] = useState<boolean>(false)
  const [rewardType, setRewardType] = useState<"tiered" | "stacked" | null>(null)

  const handleRuleTypeSelect = (ruleType: string): void => {
    console.log("Creating rule with type:", ruleType)

    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      type: ruleType,
      condition: "",
      reward: "",
      config: {},
    }

    if (ruleType === "custom") {
      newRule.condition = ""
      newRule.reward = ""
      newRule.config = {}
    } else if (ruleType === "bogo") {
      newRule.condition = "buys_products"
      newRule.reward = "gift_cart"
      newRule.config = {
        reachingType: "quantity",
        reachingQuantity: 1,
        inclusionRule: {
          id: `inclusion-${Date.now()}`,
          type: "individual",
          value: "",
          selector: "",
          additionalConditions: [],
        },
        exclusionRules: [],
        frequency: "once",
        giftQuantity: 1,
        giftProduct: "",
      }
    } else if (ruleType === "quantity_percent") {
      newRule.condition = "buys_products"
      newRule.reward = "discount_products"
      newRule.config = {
        reachingType: "quantity",
        reachingQuantity: 1,
        inclusionRule: {
          id: `reward-inclusion-${Date.now()}`,
          type: "individual",
          value: "",
          selector: "",
          additionalConditions: [],
        },
        exclusionRules: [],
        frequency: "once",
        discountType: "percentage",
        discountValue: 10,
        discountFrom: "each_product",
        appliedOn: "up_to",
        appliedQuantity: 1,
        appliedTarget: "least_expensive",
        includeOnSale: true,
        includeConditionProducts: true,
        rewardInclusionRule: {
          id: `reward-inclusion-${Date.now()}`,
          type: "all",
          value: "",
          selector: "",
          additionalConditions: [],
        },
        rewardExclusionRules: [],
      }
    } else if (ruleType === "order_subtotal") {
      newRule.condition = "no_conditions"
      newRule.reward = "discount_subtotal"
      newRule.config = {
        frequency: "once",
        discountType: "percentage",
        discountValue: 10,
      }
    } else if (ruleType === "spend_shipping") {
      newRule.condition = "reaches_subtotal"
      newRule.reward = "free_shipping"
      newRule.config = {
        minimumSpend: 100,
        frequency: "once",
        shippingZoneType: "all",
        selectedZones: [],
      }
    } else if (ruleType === "bundle") {
      newRule.condition = "no_conditions"
      newRule.reward = "fixed_price"
      newRule.config = {
        price: 100,
        quantity: 3,
        applyTo: "Least expensive",
        includeOnSale: true,
        includeConditionProducts: true,
        frequency: "once",
        rewardInclusionRule: {
          id: `reward-inclusion-${Date.now()}`,
          type: "individual",
          value: "",
          selector: "",
          additionalConditions: [],
        },
        rewardExclusionRules: [],
      }
    }

    setCurrentRule(newRule)
    setShowRuleModal(false)
    setShowRuleEditor(true)
  }

  const handleSaveRule = (): void => {
    if (currentRule) {
      if (editingRuleId) {
        setRules(rules.map((rule) => (rule.id === editingRuleId ? currentRule : rule)))
        setEditingRuleId(null)
      } else {
        setRules([...rules, currentRule])
      }
      setShowRuleEditor(false)
      setCurrentRule(null)
    }
  }

  const handleEditRule = (ruleId: string): void => {
    const ruleToEdit = rules.find((rule) => rule.id === ruleId)
    if (ruleToEdit) {
      if (ruleToEdit.type === "custom" && ruleToEdit.condition === "buysProducts") {
         const config = ruleToEdit.config as Record<string, any>

        if (config.inclusionRules && !config.inclusionRule) {
          config.inclusionRule = config.inclusionRules[0] || {
            id: `inclusion-${Date.now()}`,
            type: "individual",
            value: "",
            selector: "",
            additionalConditions: [],
          }
          delete config.inclusionRules
        }

        if (!config.inclusionRule) {
          config.inclusionRule = {
            id: `inclusion-${Date.now()}`,
            type: "individual",
            value: "",
            selector: "",
            additionalConditions: [],
          }
        }

        ruleToEdit.config = config
      }

      setCurrentRule(ruleToEdit)
      setEditingRuleId(ruleId)
      setShowRuleEditor(true)
    }
  }

  const handleDeleteRule = (ruleId: string): void => {
    setRules(rules.filter((rule) => rule.id !== ruleId))
  }

  const handleCopyLastRule = (): void => {
    if (rules.length > 0) {
      const lastRule = rules[rules.length - 1]
      const copiedRule: Rule = {
        ...JSON.parse(JSON.stringify(lastRule)),
        id: `rule-${Date.now()}`,
      }
      setRules([...rules, copiedRule])
      setShowRewardOptions(true)
    }
  }

  const handleSwitchRule = (): void => {
    setShowRuleEditor(false)
    setShowRuleModal(true)
  }

  const handleRuleChange = (updatedRule: Rule): void => {
    console.log("Config Updated rule:", updatedRule)
    setCurrentRule(prevState => ({...prevState, ...updatedRule}))
  }

  return (
    <div className="bg-white rounded-none shadow-sm p-6 overflow-hidden">
      <h3 className="text-xl font-medium mb-2">Rules</h3>
      <p className="text-sm text-gray-700 mb-4 border-b border-gray-300 pb-4">
        What conditions must a customer satisfy to receive the reward you&apos;re offering?
      </p>

      <RuleList rules={rules} onEditRule={handleEditRule} onDeleteRule={handleDeleteRule} />

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setShowRuleModal(true)}
          className="flex items-center cursor-pointer text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add rule
        </button>

        {rules.length > 0 && (
          <button
            type="button"
            onClick={handleCopyLastRule}
            className="flex cursor-pointer items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <svg
              className="cursor-pointer w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
            Copy last rule
          </button>
        )}
      </div>

      {showRewardOptions && (
        <div className="mt-6">
          <p className="font-bold mb-2">How many of the above rewards can customers have?</p>

          <div className="flex items-start gap-2 mb-2">
            <input
              type="radio"
              name="rewardOption"
              id="tiered"
              checked={rewardType === "tiered"}
              onChange={() => setRewardType("tiered")}
              className="mt-1 size-4 cursor-pointer"
            />
            <label htmlFor="tiered">
              <div className="font-medium">Tiered reward</div>
              <div className="text-sm text-gray-600">
                Give the last reward customer qualifies for (&quot;get 10% off&quot; OR &quot;get 15% off&quot;)
              </div>
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="radio"
              name="rewardOption"
              id="stacked"
              checked={rewardType === "stacked"}
              onChange={() => setRewardType("stacked")}
              className="mt-1 size-4 cursor-pointer"
            />
            <label htmlFor="stacked">
              <div className="font-medium">Stacked rewards</div>
              <div className="text-sm text-gray-600">
                Give all rewards customer qualifies for (&quot;get 10% off&quot; AND &quot;free shipping&quot;)
              </div>
            </label>
          </div>
        </div>
      )}

      {showRuleModal && (
        <RuleTypeModal onClose={() => setShowRuleModal(false)} onSelectRuleType={handleRuleTypeSelect} />
      )}

      {showRuleEditor && currentRule && (
        <>
          {console.log("Rendering editor for rule type:", currentRule.type)}
          {getRuleEditor({
            rule: currentRule,
            onRuleChange: handleRuleChange,
            onSave: handleSaveRule,
            onCancel: () => setShowRuleEditor(false),
            onSwitchRule: handleSwitchRule,
          })}
        </>
      )}
    </div>
  )
}
