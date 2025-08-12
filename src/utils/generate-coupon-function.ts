import { processCondition } from "@/components/Context/utils/functions"
import { ExtendedRule } from "@/types/couponContext-types"
import { createComplexCondition } from "./inclusion-rule-function"
import { CreateActionOnRule } from "./functions"

export const convertRules = (rules: ExtendedRule[]) => {

        return rules.map((rule) => {
          // Start with a basic rule structure
          const apiRule: any = {
            apply_once: rule.apply_once !== undefined ? rule.apply_once : true,
            stop: rule.stop !== undefined ? rule.stop : false,
            //condition: {},
            action: {}, // Make sure action is an object, not an array
          }

          if (typeof rule.condition === "object") {
            apiRule.condition = rule.condition
          } else {
            // Create a condition based on the rule type
            if (rule.condition === "no_conditions") {
            } else if (rule.condition === "reaches_subtotal") {
              // Reaches an order sub-total conditio
              apiRule.condition = {
                cart: {
                  minimum_spend: String(rule.config?.minimumSpend || "1"),
                },
              }
            } else {
              // Default to complex condition for other cases
              apiRule.condition = createComplexCondition(rule)
            }
            apiRule.condition.cart = apiRule.condition.cart || {}
            apiRule.condition.cart.items = apiRule.condition.cart.items || {}
            if (rule.config?.customFields) {
              apiRule.condition.cart.items.and = apiRule.condition.cart.items.and || []
              rule.config.customFields.forEach((field) => {
                // Extract exactly as shown in console examples
                const customField = {
                  product_custom_field: {
                    name: field.name?.trim() || "",
                    values: Array.isArray(field.values)
                      ? field.values.map((v) => String(v).trim())
                      : [String(field.values).trim()],
                  },
                }
                apiRule.condition.cart.items.and.push(customField)
              })
            }

            // Process product options from config
            if (rule.config?.productOptions) {
              apiRule.condition.cart.items.and = apiRule.condition.cart.items.and || []
              rule.config.productOptions.forEach((option) => {
                // Extract exactly as shown in console examples
                const productOption = {
                  product_option: {
                    type: option.type || "string_match",
                    name: option.name?.trim() || "",
                    values: Array.isArray(option.values)
                      ? option.values.map((v) => String(v).trim())
                      : [String(option.values).trim()],
                  },
                }
                apiRule.condition.cart.items.and.push(productOption)
              })
            }
          }

          if (rule.action) {
            apiRule.action = rule.action
          } else {
            // Create an action based on the rule type
            CreateActionOnRule(rule, apiRule)
          }

          // Process condition.cart.items
          if (apiRule.condition?.cart?.items) {
            apiRule.condition.cart.items = processCondition(apiRule.condition.cart.items)
          }

          // Process action.cart_items.items if it exists
          if (apiRule.action?.cart_items?.items) {
            apiRule.action.cart_items.items = processCondition(apiRule.action.cart_items.items)
          }

          // Process action.fixed_price_set.items if it exists
          if (apiRule.action?.fixed_price_set?.items) {
            apiRule.action.fixed_price_set.items = processCondition(apiRule.action.fixed_price_set.items)
          }

          return apiRule
        })
      }