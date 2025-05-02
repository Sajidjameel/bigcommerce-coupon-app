"use client"

import type { Rule } from "@/types/rule-types"

interface RuleListProps {
  rules: Rule[]
  onEditRule: (ruleId: string) => void
  onDeleteRule: (ruleId: string) => void
}

export function RuleList({ rules, onEditRule, onDeleteRule }: RuleListProps) {
  if (rules.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">You don&apos;t have any discount rules for this promotion yet.</div>
    )
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-300 font-medium text-sm">
        <div className="col-span-5 font-bold">Condition</div>
        <div className="col-span-5 font-bold ">Reward</div>
        <div className="col-span-2"></div>
      </div>

      {rules.map((rule) => (
        <div key={rule.id} className="grid grid-cols-12 gap-4 py-4 border-b border-gray-300 text-sm">
          <div className="col-span-5">
            {rule.condition
              .toLowerCase()
              .replace(/_/g, ' ')
              .replace(/^\w/, (c) => c.toUpperCase())}
          </div>
          <div className="col-span-5">{rule.reward.toLowerCase().replace(/_/g,' ').replace(/^\w/,(c)=> c.toUpperCase())}</div>
          <div className="col-span-2 flex justify-end space-x-2">
            <button type="button" onClick={() => onEditRule(rule.id)} className="cursor-pointer text-blue-600 hover:text-blue-800">
              Edit
            </button>
            <button type="button" onClick={() => onDeleteRule(rule.id)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
