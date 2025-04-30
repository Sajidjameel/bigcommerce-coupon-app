"use client"
import { type ExclusionRule, PRODUCT_INCLUSION_OPTIONS, type Product } from "@/types/rule-types"
import { Search, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { SelectorModal } from "../UI/select-modal"
import { TagInput } from "../UI/tag-input"
import { ProductSearchModal } from "../UI/Product-search-modal"

// Exclusion options - same as inclusion but without "all" option
const PRODUCT_EXCLUSION_OPTIONS = PRODUCT_INCLUSION_OPTIONS.filter((option) => option.value !== "all")

// Options for additional exclusion rules (no "individual" option)
const ADDITIONAL_EXCLUSION_OPTIONS = PRODUCT_EXCLUSION_OPTIONS.filter((option) => option.value !== "individual")

interface ProductExclusionRuleProps {
  rules: ExclusionRule[]
  onRulesChange: (rules: ExclusionRule[]) => void
}

interface SelectorItem {
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

export function ProductExclusionRule({ rules, onRulesChange }: ProductExclusionRuleProps) {
  const [showSelectorModal, setShowSelectorModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(0)
  const [currentSelectorType, setCurrentSelectorType] = useState<
    "brand" | "category" | "custom_field" | "product_option"
  >("brand")
  const [selectedProducts, setSelectedProducts] = useState<Map<number, Product[]>>(new Map())

  // Store selected items for each rule to preserve values when reopening modals
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectorItem[]>>(new Map())

  // Initialize selectedProducts from rules when component mounts or rules change
  useEffect(() => {
    const newSelectedProducts = new Map<number, Product[]>()

    rules.forEach((rule, index) => {
      if (rule.type === "individual" && rule.value) {
        try {
          // Try to parse product IDs from the rule value
          const productIds = rule.value.split(",").map((id) => Number.parseInt(id.trim(), 10))

          // Create placeholder products with the information we have
          const products = productIds.map((id) => ({
            id,
            name: rule.selector || `Product ${id}`,
            sku: "",
            price: 0,
            primary_image: null,
          }))

          newSelectedProducts.set(index, products)
        } catch (e) {
          // If parsing fails, set empty array
          newSelectedProducts.set(index, [])
        }
      }
    })

    setSelectedProducts(newSelectedProducts)
  }, [rules])

  const handleTypeChange = (index: number, type: string) => {
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

    onRulesChange(updatedRules)
  }

  const handleAddExclusionRule = () => {
    onRulesChange([...rules, { id: `exclusion-${Date.now()}`, type: "please_select", value: "", selector: "" }])
  }

  const handleDeleteExclusionRule = (index: number) => {
    const updatedRules = [...rules]
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

  const handleProductSelect = (index: number, products: Product[] | Product) => {
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

    // Update the rule with the new selector and product IDs
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

  const handleSelectorSelect = (index: number, items: SelectorItem[] | SelectorItem) => {
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
      else if (rules[index].type === "category") {
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

  // Get initial selected items for the current editing rule
  const getInitialSelectedItems = (index: number): SelectorItem[] => {
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
              name: rule.selector ?? " ",
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
              name: rule.selector ?? " ",
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
          // If parsing as array fails, try as single object
          try {
            const parsedValue = JSON.parse(rule.value)
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
          } catch (e) {
            return []
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
  const getSelectedProductsForRule = (index: number): Product[] => {
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
        return []
      }
    }

    return []
  }

  // Get selected items for a rule
  const getSelectedItemsForRule = (index: number): { id: number; name: string }[] => {
    const rule = rules[index]
    if (!rule || !rule.value || !rule.selector) return []

    // For individual products
    if (rule.type === "individual") {
      const products = getSelectedProductsForRule(index)
      return products.map((p) => ({ id: p.id, name: p.name }))
    }

    // Try to get from selectedItems
    if (selectedItems.has(index)) {
      return selectedItems.get(index)?.map((item) => ({ id: item.id, name: item.name })) || []
    }

    // If we have a selector but no parsed items, create a placeholder
    if (rule.selector) {
      return [{ id: Date.now(), name: rule.selector }]
    }

    return []
  }

  // Handle input click to open appropriate modal
  const handleInputClick = (index: number, type: string) => {
    setCurrentEditingIndex(index)

    if (type === "individual") {
      setShowProductModal(true)
    } else if (["brand", "category", "custom_field", "product_option"].includes(type)) {
      setCurrentSelectorType(type as "brand" | "category" | "custom_field" | "product_option")
      setShowSelectorModal(true)
    }
  }

  // Get placeholder text based on rule type
  const getPlaceholderText = (type: string) => {
    switch (type) {
      case "individual":
        return "Click to open product selector"
      case "category":
        return "Click to open category selector"
      case "brand":
        return "Click to open brand selector"
      case "custom_field":
        return "Click to open field selector"
      case "product_option":
        return "Click to open option selector"
      default:
        return "Click to select"
    }
  }

  // Check if a specific type is already selected
  const isTypeSelected = (type: string) => {
    return rules.some((rule) => rule.type === type)
  }

  // Check if the first rule is "individual"
  const isFirstRuleIndividual = rules.length > 0 && rules[0].type === "individual"

  // Get available options for a specific rule
  const getAvailableOptions = (currentIndex: number) => {
    // Get the current rule's type
    const currentType = rules[currentIndex]?.type

    // For the first rule, show all options
    if (currentIndex === 0) {
      return PRODUCT_EXCLUSION_OPTIONS
    }

    // Start with the "please_select" option for additional rules
    const options = currentType === "please_select" ? [{ value: "please_select", label: "Please select a value" }] : []

    // Add the filtered product options
    const filteredOptions = ADDITIONAL_EXCLUSION_OPTIONS.filter((option) => {
      // If this is the current rule with this type, include it
      if (option.value === currentType) return true

      // If the type is "category" or "brand", only include if not already selected
      if ((option.value === "category" || option.value === "brand") && isTypeSelected(option.value)) {
        return false
      }

      // Include all other options
      return true
    })

    return [...options, ...filteredOptions]
  }

  // Determine if we should show the "Add another exclusion rule" button
  // Only show if all rules have valid selections and first rule is not "individual"
  const showAddButton =
    rules.length > 0 &&
    !isFirstRuleIndividual &&
    !rules.some((rule) => rule.type === "please_select") &&
    rules.every((rule) => rule.type !== "")

  return (
    <div className="space-y-4">
      {rules.length === 0 ? (
        <button
          type="button"
          onClick={handleAddExclusionRule}
          className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add exclusion rule
        </button>
      ) : (
        <>
          {rules.map((rule, index) => (
            <div key={rule.id} className={index === 0 ? "flex items-center gap-2" : "flex items-center gap-2 ml-4"}>
              {index === 0 ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="cursor-pointer text-sm">Excluding products</span>
                </>
              ) : (
                <span className="text-sm">And</span>
              )}

              <div className="relative">
                <select
                  className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-48"
                  value={rule.type}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                  disabled={index > 0 && isFirstRuleIndividual}
                >
                  {getAvailableOptions(index).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              {rule.type !== "please_select" && (
                <div className="relative flex-1 max-w-xs">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <TagInput
                    tags={getSelectedItemsForRule(index)}
                    placeholder={getPlaceholderText(rule.type)}
                    onClick={() => {
                      if (!(index > 0 && isFirstRuleIndividual)) {
                        handleInputClick(index, rule.type)
                      }
                    }}
                    disabled={index > 0 && isFirstRuleIndividual}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => handleDeleteExclusionRule(index)}
                className="text-blue-600 hover:text-blue-800"
                disabled={index > 0 && isFirstRuleIndividual}
              >
                <Trash2 className={`w-5 h-5 ${index > 0 && isFirstRuleIndividual ? "opacity-50" : ""}`} />
              </button>
            </div>
          ))}

          {/* Add another exclusion rule button */}
          {showAddButton && (
            <div className="ml-4">
              <button
                type="button"
                onClick={handleAddExclusionRule}
                className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add another exclusion rule
              </button>
            </div>
          )}
        </>
      )}

      {/* Product Search Modal */}
      <ProductSearchModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={(products) => handleProductSelect(currentEditingIndex, products)}
        selectedProduct={selectedProducts.get(currentEditingIndex) || null}
        multiple={true} // Allow multiple product selection for exclusion rules
      />

      {/* Selector Modal for brands, categories, etc. */}
      <SelectorModal
        isOpen={showSelectorModal}
        onClose={() => setShowSelectorModal(false)}
        onSelect={(items) => handleSelectorSelect(currentEditingIndex, items)}
        type={currentSelectorType}
        multiple={true}
        initialSelectedItems={getInitialSelectedItems(currentEditingIndex)}
      />
    </div>
  )
}
