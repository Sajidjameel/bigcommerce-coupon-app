import { Product, RuleModel } from "@/types/rule-types"
import { SelectorItem } from "./types"

// Get initial selected items for the current editing rule
export const getInitialSelectedItems = (
    index: number,
    rules: RuleModel[], 
    selectedItems: Map<number, SelectorItem[]>, 
): SelectorItem[] => {
    // If we have stored selected items for this rule, return them
    if (selectedItems.has(index)) {
      return selectedItems.get(index) || []
    }

    // Otherwise, try to parse from the rule value
    const rule = rules[index]
    if (!rule || !rule.value) return []

    try {
      if (rule.type === "custom_field") {
        const parsedValue = JSON.parse(rule.value)
        if (parsedValue.fieldName && parsedValue.fieldValues) {
          return [
            {
              id: Date.now(),
              name: rule.selector || '',
              fieldName: parsedValue.fieldName,
              fieldValues: parsedValue.fieldValues,
            },
          ]
        }
      } else if (rule.type === "product_option") {
        const parsedValue = JSON.parse(rule.value)
        if (parsedValue.optionName && parsedValue.optionValues) {
          return [
            {
              id: Date.now(),
              name: rule.selector || '',
              optionName: parsedValue.optionName,
              optionValues: parsedValue.optionValues,
            },
          ]
        }
      } else if (rule.type === "category") {
        // Try to parse as array of category objects
        try {
          return rule.value
            .split(",")
            .map((val) => {
              let parsedVal
              try {
                parsedVal = JSON.parse(val)
              } catch (e) {
                console.error("Error parsing category value:", e)
                return null // Or handle the error as appropriate
              }
              return {
                id: parsedVal.id,
                name: parsedVal.name,
                channelId: parsedVal.channelId,
                channelName: parsedVal.channelName,
                path: parsedVal.path,
              }
            })
            .filter((item) => item !== null) as SelectorItem[]
        } catch (e) {
          console.error("Error parsing category value as array:", e)
          // If parsing as array fails, try as single object
          let parsedValue
          try {
            parsedValue = JSON.parse(rule.value)
          } catch (e) {
            console.error("Error parsing category value:", e)
            return []
          }
          if (parsedValue.id) {
            return [
              {
                id: parsedValue.id,
                name: parsedValue.name,
                channelId: parsedValue.channelId,
                channelName: parsedValue.channelName,
                path: parsedValue.path,
              },
            ]
          }
        }
      }
    } catch (e) {
      // If parsing fails, return empty array
      return []
    }

    return []
  }

// Get selected products for a rule
export const getSelectedProductsForRule = (
    index: number,
    rules: RuleModel[], 
    selectedProducts: Map<number, Product[]>,
): Product[] => {
    if (selectedProducts.has(index)) {
      return selectedProducts.get(index) || []
    }

    // Try to parse from the rule value if we don't have it in state
    const rule = rules[index]
    if (rule && rule.type === "individual" && rule.value) {
      try {
        // Try to parse product IDs from the rule value
        const productIds = rule.value.split(",").map((id) => Number.parseInt(id.trim(), 10))

        // Create placeholder products with the information we have
        return productIds.map((id) => ({
          id,
          name: rule.selector || `Product ${id}`,
          sku: "",
          price: 0,
          primary_image: null,
        }))
      } catch (e) {
        console.error("Error parsing product IDs from rule value:", e)
        return []
      }
    }

    return []
  }