"use client"

import { RULE_TYPES } from "@/constants/rule-type"

interface RuleTypeModalProps {
  onClose: () => void
  onSelectRuleType: (ruleType: string) => void
}

export function RuleTypeModal({ onClose, onSelectRuleType }: RuleTypeModalProps) {
  const handleSelectRuleType = (ruleType: string) => {
    console.log("Selected rule type:", ruleType) // Add this for debugging
    onSelectRuleType(ruleType)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h3 className="text-xl font-medium mb-4">Choose a rule for your promotion</h3>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {RULE_TYPES.map((ruleType) => (
              <div key={ruleType.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <input
                  type="radio"
                  id={`rule-type-${ruleType.id}`}
                  name="ruleType"
                  className="mt-1"
                  onChange={() => handleSelectRuleType(ruleType.id)}
                  checked={ruleType.id === "custom"}
                />
                <div>
                  <label htmlFor={`rule-type-${ruleType.id}`} className="font-medium cursor-pointer">
                    {ruleType.name}
                  </label>
                  {ruleType.description && <p className="text-sm text-gray-600">{ruleType.description}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSelectRuleType("custom")}
              className="px-4 py-2 text-sm text-white bg-blue-600 cursor-pointer hover:bg-blue-700 rounded"
            >
              Apply template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
