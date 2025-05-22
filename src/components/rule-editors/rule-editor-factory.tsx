import type { Rule } from "@/types/rule-types"
// import { BaseRuleEditor } from "./base-rule-editor"
// import { BundleRuleEditor } from "./bundle-rule-editor"
import { CustomRuleEditor } from "./custom-rule-editor"

interface RuleEditorProps {
  rule: Rule
  onRuleChange: (rule: Rule) => void
  onSave: () => void
  onCancel: () => void
  onSwitchRule: () => void
}


export function getRuleEditor(props: RuleEditorProps) {
  console.log("Rule type:", props.rule.type) // Add this for debugging
  
  switch (props.rule.type) {
    case "custom":
    case "bogo":
    case "quantity_percent":
    case "order_subtotal":
    case "spend_shipping":
    case "bundle":
      return <CustomRuleEditor {...props} />
    default:
      return <CustomRuleEditor {...props} />
  }
}
