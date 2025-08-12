import { InclusionRule } from "@/types/rule-types"

// Convert the inclusion rule with additionalConditions to an array of rules
export interface ProductInclusionRuleProps {
  rule: InclusionRule
  onRuleChange: (rule: InclusionRule) => void
}

export interface RuleItem {
  id: string
  type: string
  value: string
  selector: string
}

export interface SelectorItem {
  id: number
  name: string
  fieldName?: string
  fieldValues?: string[]
  optionName?: string
  optionValues?: string[]
  channelId?: number
  channelName?: string
  path?: string
}