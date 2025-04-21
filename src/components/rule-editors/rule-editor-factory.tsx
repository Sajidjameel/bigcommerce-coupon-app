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
      return <CustomRuleEditor {...props} />
    case "bogo":
      return <CustomRuleEditor {...props} />
    case "quantity_percent":
      return <CustomRuleEditor {...props} />
    case "order_subtotal":
      return <CustomRuleEditor {...props} />
    case "spend_shipping":
      return <CustomRuleEditor {...props} />
    case "bundle":
      return <CustomRuleEditor {...props} />
    // Add more cases for other rule types
    default:
      return <CustomRuleEditor {...props} />
  }
}
