import { InclusionRule, Product } from "@/types/rule-types"
import { RuleItem, SelectorItem } from "../types"
import { Dispatch, SetStateAction } from "react"

export const handleAddInclusionRule = (inclusionRules:InclusionRule[],
    updateOriginalStructure: (rules: InclusionRule[]) => void
 ) => {
    const updatedRules = [
      ...inclusionRules,
      { id: `inclusion-${Date.now()}`, type: "please_select", value: "", selector: "" },
    ]
    updateOriginalStructure(updatedRules)
  }

export const handleDeleteInclusionRule = (
    index: number,
    setSelectedItems: Dispatch<SetStateAction<Map<number, SelectorItem[]>>>,
    selectedItems:Map<number,SelectorItem[]>,
    selectedProducts:Map<number,Product[]>,
    setSelectedProducts:Dispatch<SetStateAction<Map<number, Product[]>>>,
    updateOriginalStructure:(rules:InclusionRule[])=>void,
    inclusionRules:InclusionRule[]
) => {
    const updatedRules = [...inclusionRules]
    updatedRules.splice(index, 1)
    updateOriginalStructure(updatedRules)

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
     products: Product[] | Product ,
     selectedProducts:Map<number,Product[]>,
     setSelectedProducts:Dispatch<SetStateAction<Map<number,Product[]>>>,
     updateOriginalStructure:(rules: InclusionRule[])=>void,
     inclusionRules:InclusionRule[],
     setShowProductModal:Dispatch<SetStateAction<boolean>>
    
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
    const updatedRules = [...inclusionRules]
    updatedRules[index] = {
      ...updatedRules[index],
      selector: selectorText,
      value: productIds,
    }

    // Apply the updated rules
    updateOriginalStructure(updatedRules)

    // Close the modal
    setShowProductModal(false)
  }

  export const handleSelectorSelect = (index: number, 
    items: SelectorItem[] | SelectorItem,
    selectedItems :Map<number,SelectorItem[]>,
    setSelectedItems:Dispatch<SetStateAction<Map<number,SelectorItem[]>>>,
    setShowSelectorModal:Dispatch<SetStateAction<boolean>>,
    inclusionRules:InclusionRule[],
    updateOriginalStructure:(rules:InclusionRule[])=>void,
) => {
    const selectedItemsArray = Array.isArray(items) ? items : [items]

    // Update selected items map to preserve values for reopening
    const updatedSelectedItems = new Map(selectedItems)

    // If no items are selected, clear the selection for this rule
    if (selectedItemsArray.length === 0) {
      updatedSelectedItems.delete(index)

      // Update the rule with empty values
      const updatedRules = [...inclusionRules]
      updatedRules[index] = {
        ...updatedRules[index],
        selector: "",
        value: "",
      }

      // Apply the updated rules
      updateOriginalStructure(updatedRules)
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
      if (inclusionRules[index].type === "custom_field" && "fieldName" in item && "fieldValues" in item) {
        selectorText = `${item.fieldName}: ${(item.fieldValues as string[]).join(", ")}`
      }
      // Special handling for product options
      else if (inclusionRules[index].type === "product_option" && "optionName" in item && "optionValues" in item) {
        selectorText = `${item.optionName}: ${(item.optionValues as string[]).join(", ")}`
      }
      // Special handling for categories
      else if (inclusionRules[index].type === "category" && "channelId" in item) {
        selectorText = item.name
      } else {
        selectorText = item.name
      }
    }

    // Build the value (always all IDs)
     const itemIds = selectedItemsArray
      .map((item) => {
        // For custom fields, store the field name and values in a special format
        if (inclusionRules[index].type === "custom_field" && "fieldName" in item && "fieldValues" in item) {
          
          return JSON.stringify({
            fieldName: item.fieldName,
            fieldValues: item.fieldValues,
          })
        }
        // For product options, store the option name and values in a special format
        else if (inclusionRules[index].type === "product_option" && "optionName" in item && "optionValues" in item) {
          return JSON.stringify({
            optionName: item.optionName,
            optionValues: item.optionValues,
          })
        }
        // For categories, store additional metadata
        else if (inclusionRules[index].type === "category" && "channelId" in item) {
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
    const updatedRules = [...inclusionRules]
    updatedRules[index] = {
      ...updatedRules[index],
      selector: selectorText,
      value: itemIds,
    }

    // Apply the updated rules
    updateOriginalStructure(updatedRules)

    // Close the modal
    setShowSelectorModal(false)
  }

export const getInitialSelectedItems = (index: number,
     selectedItems:Map<number,SelectorItem[]>,
     inclusionRules: InclusionRule[]
    ): SelectorItem[] => {
    // If we have stored selected items for this rule, return them
    if (selectedItems.has(index)) {
      return selectedItems.get(index) || []
    }

    // Otherwise, try to parse from the rule value
    const rule = inclusionRules[index]
    if (!rule || !rule.value) return []

    try {
      if (rule.type === "custom_field") {
        const parsedValue = JSON.parse(rule.value)
        if (parsedValue.fieldName && parsedValue.fieldValues) {
          return [
            {
              id: Date.now(),
              name: rule.selector!,
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
              name: rule.selector!,
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


  