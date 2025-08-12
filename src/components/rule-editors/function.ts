import { Product, Rule, RuleModel } from "@/types/rule-types"
import { SelectorItem } from "./types"
import { Dispatch, SetStateAction } from "react"

export const handleTypeChange = (index: number, type: string, rules: RuleModel[], callBack: (rules: RuleModel[])=> void) => {
    let updatedRules = [...rules]

    // If changing the first rule, reset all additional rules
    if (index === 0) {
      // Keep only the first rule with the new type
      updatedRules = [
        {
          ...updatedRules[0],
          type,
          value: "",
          selector: "",
        },
      ]
    } else {
      // Just update the specific rule
      updatedRules[index] = {
        ...updatedRules[index],
        type,
        value: "",
        selector: "",
      }
    }

    callBack(updatedRules)
  }

export const handleAddRule = (rules: RuleModel[], onRulesChange: (rules: RuleModel[]) => void) => {
    onRulesChange([...rules, { id: `exclusion-${Date.now()}`, type: "please_select", value: "", selector: "" }])
  }

export const handleDeleteRule = (
    index: number, 
    rules: RuleModel[], 
    onRulesChange: (rules: RuleModel[]) => void, 
    selectedItems: Map<number, SelectorItem[]>, 
    selectedProducts: Map<number, Product[]>,
    setSelectedItems: Dispatch<SetStateAction<Map<number, SelectorItem[]>>>,
    setSelectedProducts: Dispatch<SetStateAction<Map<number, Product[]>>>
) => {
    const updatedRules = [...rules    ]
    updatedRules.splice(index, 1)
    onRulesChange(updatedRules)

    // Also remove the selected items for this rule
    const updatedSelectedItems = new Map(selectedItems)
    updatedSelectedItems.delete(index)
    setSelectedItems(updatedSelectedItems)

    // Remove selected products for this rule
    const updatedSelectedProducts = new Map(selectedProducts)
    updatedSelectedProducts.delete(index)
    setSelectedProducts(updatedSelectedProducts)
  }

export const handleProductSelect = (
    index: number, 
    products: Product[] | Product,
    rules: RuleModel[],
    onRulesChange: (rules: RuleModel[]) => void, 
    selectedProducts: Map<number, Product[]>,
    setSelectedProducts: Dispatch<SetStateAction<Map<number, Product[]>>>,
    setShowProductModal: Dispatch<SetStateAction<boolean>>
) => {
    const selectedProductArray = Array.isArray(products) ? products : [products]

    // Update selected products map
    const updatedSelectedProducts = new Map(selectedProducts)
    updatedSelectedProducts.set(index, selectedProductArray)
    setSelectedProducts(updatedSelectedProducts)

    // Compute selector display text
    let selectorText = ""
    if (selectedProductArray.length > 0) {
      selectorText = selectedProductArray[0].name
    }

    // Build the value (always all IDs)
    const productIds = selectedProductArray.map((p) => p.id.toString().trim()).join(",")

    // Update the inclusion rule with the new selector and product IDs
    const updatedRules = [...rules]
    updatedRules[index] = {
      ...updatedRules[index],
      selector: selectorText,
      value: productIds,
    }

    // Apply the updated rules
   onRulesChange(updatedRules)

    // Close the modal
    setShowProductModal(false)
  }

export const handleSelectorSelect = (
    index: number, 
    items: SelectorItem[] | SelectorItem,
    rules: RuleModel[], 
    onRulesChange: (rules: RuleModel[]) => void, 
    selectedItems: Map<number, SelectorItem[]>, 
    setSelectedItems: Dispatch<SetStateAction<Map<number, SelectorItem[]>>>,
    setShowSelectorModal: Dispatch<SetStateAction<boolean>>
) => {
    const selectedItemsArray = Array.isArray(items) ? items : [items]

    // Update selected items map to preserve values for reopening
    const updatedSelectedItems = new Map(selectedItems)

    // If no items are selected, clear the selection for this rule
    if (selectedItemsArray.length === 0) {
      updatedSelectedItems.delete(index)

      // Update the rule with empty values
      const updatedRules = [...rules]
      updatedRules[index] = {
        ...updatedRules[index],
        selector: "",
        value: "",
      }

      // Apply the updated rules
      onRulesChange(updatedRules)
      setSelectedItems(updatedSelectedItems)
      setShowSelectorModal(false)
      return
    }

    updatedSelectedItems.set(index, selectedItemsArray)
    setSelectedItems(updatedSelectedItems)

    // Compute selector display text
    let selectorText = ""
    if (selectedItemsArray.length > 0) {
      const item = selectedItemsArray[0]

      // Special handling for custom fields
      if (rules[index].type === "custom_field" && "fieldName" in item && "fieldValues" in item) {
        selectorText = `${item.fieldName}: ${(item.fieldValues as string[]).join(", ")}`
      }
      // Special handling for product options
      else if (rules[index].type === "product_option" && "optionName" in item && "optionValues" in item) {
        selectorText = `${item.optionName}: ${(item.optionValues as string[]).join(", ")}`
      }
      // Special handling for categories
      else if (rules[index].type === "category" && "channelId" in item) {
        selectorText = item.name
      } else {
        selectorText = item.name
      }
    }

    // Build the value (always all IDs)
    const itemIds = selectedItemsArray
      .map((item) => {
        // For custom fields, store the field name and values in a special format
        if (rules[index].type === "custom_field" && "fieldName" in item && "fieldValues" in item) {
          
          return JSON.stringify({
            fieldName: item.fieldName,
            fieldValues: item.fieldValues,
          })
        }
        // For product options, store the option name and values in a special format
        else if (rules[index].type === "product_option" && "optionName" in item && "optionValues" in item) {
          return JSON.stringify({
            optionName: item.optionName,
            optionValues: item.optionValues,
          })
        }
        // For categories, store additional metadata
        else if (rules[index].type === "category" && "channelId" in item) {
          return JSON.stringify({
            id: item.id,
            name: item.name,
            channelId: item.channelId,
            channelName: item.channelName,
            path: item.path,
          })
        }
        return item.id.toString().trim()
      })
      .join(",")

    // Update the rule with the new selector and item IDs
    const updatedRules = [...rules]
    updatedRules[index] = {
      ...updatedRules[index],
      selector: selectorText,
      value: itemIds,
    }

    // Apply the updated rules
    onRulesChange(updatedRules)

    // Close the modal
    setShowSelectorModal(false)
  }

