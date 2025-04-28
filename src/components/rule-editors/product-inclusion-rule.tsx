"use client"
import { type InclusionRule, PRODUCT_INCLUSION_OPTIONS, type Product } from "@/types/rule-types"
import { Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { ProductSearchModal } from "@/components/UI/Product-search-modal"
import { SelectorModal } from "../UI/select-modal"

// Convert the inclusion rule with additionalConditions to an array of rules
interface ProductInclusionRuleProps {
  rule: InclusionRule
  onRuleChange: (rule: InclusionRule) => void
}

interface RuleItem {
  id: string
  type: string
  value: string
  selector: string
}

interface SelectorItem {
  id: number
  name: string
  fieldName?: string
  fieldValues?: string[]
}

export function ProductInclusionRule({ rule, onRuleChange }: ProductInclusionRuleProps) {
  // Convert the inclusion rule structure to an array format for easier handling
  const inclusionRules = [
    { id: rule.id, type: rule.type, value: rule.value || "", selector: rule.selector || "" },
    ...(rule.additionalConditions || []).map((condition) => ({
      id: condition.id,
      type: condition.type,
      value: condition.value || "",
      selector: condition.selector || "",
    })),
  ]

  const [showProductModal, setShowProductModal] = useState(false)
  const [showSelectorModal, setShowSelectorModal] = useState(false)
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(0)
  const [currentSelectorType, setCurrentSelectorType] = useState<
    "brand" | "category" | "custom_field" | "product_option"
  >("brand")
  const [selectedProducts, setSelectedProducts] = useState<Map<number, Product[]>>(new Map())

  const handleTypeChange = (index: number, type: string) => {
    let updatedRules = [...inclusionRules]

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

    // Convert back to the original structure
    updateOriginalStructure(updatedRules)
  }

  const handleSelectorChange = (index: number, selector: string) => {
    const updatedRules = [...inclusionRules]
    updatedRules[index] = {
      ...updatedRules[index],
      selector,
    }
    updateOriginalStructure(updatedRules)
  }

  const handleAddInclusionRule = () => {
    const updatedRules = [
      ...inclusionRules,
      { id: `inclusion-${Date.now()}`, type: "please_select", value: "", selector: "" },
    ]
    updateOriginalStructure(updatedRules)
  }

  const handleDeleteInclusionRule = (index: number) => {
    const updatedRules = [...inclusionRules]
    updatedRules.splice(index, 1)
    updateOriginalStructure(updatedRules)
  }

  const handleProductSelect = (index: number, products: Product[] | Product) => {
    const selectedProductArray = Array.isArray(products) ? products : [products]

    // Update selected products map
    const updatedSelectedProducts = new Map(selectedProducts)
    updatedSelectedProducts.set(index, selectedProductArray)
    setSelectedProducts(updatedSelectedProducts)

    // Compute selector display text
    let selectorText = ""
    if (selectedProductArray.length === 1) {
      selectorText = selectedProductArray[0].name
    } else {
      // For multiple products, show the first product's name and the count of other selected products
      selectorText = `${selectedProductArray[0].name} +${selectedProductArray.length - 1}`
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

  const handleSelectorSelect = (index: number, items: SelectorItem[] | SelectorItem) => {
    const selectedItems = Array.isArray(items) ? items : [items]

    // Compute selector display text
    let selectorText = ""
    if (selectedItems.length === 1) {
      const item = selectedItems[0]

      // Special handling for custom fields
      if (inclusionRules[index].type === "custom_field" && "fieldName" in item && "fieldValues" in item) {
        selectorText = `${item.fieldName}: ${(item.fieldValues as string[]).join(", ")}`
      } else {
        selectorText = item.name
      }
    } else {
      // For multiple items, show the first item's name and the count of other selected items
      selectorText = `${selectedItems[0].name} +${selectedItems.length - 1}`
    }

    // Build the value (always all IDs)
    const itemIds = selectedItems
      .map((item) => {
        // For custom fields, store the field name and values in a special format
        if (inclusionRules[index].type === "custom_field" && "fieldName" in item && "fieldValues" in item) {
          return JSON.stringify({
            fieldName: item.fieldName,
            fieldValues: item.fieldValues,
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

  // Convert the array structure back to the original inclusion rule structure
  const updateOriginalStructure = (rules: RuleItem[]) => {
    if (rules.length === 0) {
      onRuleChange({
        ...rule,
        type: "individual", // Default type
        value: "",
        selector: "",
        additionalConditions: [],
      })
      return
    }

    const [mainRule, ...additionalRules] = rules
    onRuleChange({
      ...rule,
      type: mainRule.type,
      value: mainRule.value,
      selector: mainRule.selector,
      additionalConditions: additionalRules.map((r) => ({
        id: r.id,
        type: r.type,
        value: r.value,
        selector: r.selector,
      })),
    })
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
    return inclusionRules.some((rule) => rule.type === type)
  }

  // Check if the first rule is "individual" or "all"
  const isFirstRuleIndividualOrAll =
    inclusionRules.length > 0 && (inclusionRules[0].type === "individual" || inclusionRules[0].type === "all")

  // Get available options for a specific rule
  const getAvailableOptions = (currentIndex: number) => {
    // Get the current rule's type
    const currentType = inclusionRules[currentIndex]?.type

    // For the first rule, show all options
    if (currentIndex === 0) {
      return PRODUCT_INCLUSION_OPTIONS
    }

    // Start with the "please_select" option for additional rules
    const options = currentType === "please_select" ? [{ value: "please_select", label: "Please select a value" }] : []

    // Add the filtered product options
    const filteredOptions = PRODUCT_INCLUSION_OPTIONS.filter((option) => {
      // If this is the current rule with this type, include it
      if (option.value === currentType) return true

      // Don't show "individual" or "all" for additional rules
      if (option.value === "individual" || option.value === "all") return false

      // If the type is "category" or "brand", only include if not already selected
      if ((option.value === "category" || option.value === "brand") && isTypeSelected(option.value)) {
        return false
      }

      // Include all other options
      return true
    })

    return [...options, ...filteredOptions]
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

  // Determine if we should show the "Add another inclusion rule" button
  // Only show if all rules have valid selections and first rule is not "individual" or "all"
  const showAddButton =
    inclusionRules.length > 0 &&
    !isFirstRuleIndividualOrAll &&
    !inclusionRules.some((rule) => rule.type === "please_select") &&
    inclusionRules.every((rule) => rule.type !== "")

  return (
    <div className="space-y-4">
      {inclusionRules.length === 0 ? (
        <button
          type="button"
          onClick={handleAddInclusionRule}
          className="hover:cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add inclusion rule
        </button>
      ) : (
        <>
          {inclusionRules.map((rule, index) => (
            <div key={rule.id} className={index === 0 ? "flex items-center gap-2" : "flex items-center gap-2 ml-4"}>
              {index === 0 ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Including products</span>
                </>
              ) : (
                <span className="text-sm">And</span>
              )}

              <div className="relative">
                <select
                  className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-48"
                  value={rule.type}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                  disabled={index > 0 && isFirstRuleIndividualOrAll}
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

              {rule.type !== "please_select" && rule.type !== "all" && (
                <div className="relative flex-1 max-w-xs">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    placeholder={getPlaceholderText(rule.type)}
                    value={rule.selector || ""}
                    readOnly
                    onClick={() => {
                      if (!(index > 0 && isFirstRuleIndividualOrAll)) {
                        handleInputClick(index, rule.type)
                      }
                    }}
                    disabled={index > 0 && isFirstRuleIndividualOrAll}
                  />
                </div>
              )}

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleDeleteInclusionRule(index)}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={index > 0 && isFirstRuleIndividualOrAll}
                >
                  <Trash2 className={`w-5 h-5 ${index > 0 && isFirstRuleIndividualOrAll ? "opacity-50" : ""}`} />
                </button>
              )}
            </div>
          ))}

          {/* Add another inclusion rule button */}
          {showAddButton && (
            <div className="ml-4">
              <button
                type="button"
                onClick={handleAddInclusionRule}
                className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add another inclusion rule
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
        multiple={true} // Allow multiple product selection for inclusion rules
      />

      {/* Selector Modal for brands, categories, etc. */}
      <SelectorModal
        isOpen={showSelectorModal}
        onClose={() => setShowSelectorModal(false)}
        onSelect={(items) => handleSelectorSelect(currentEditingIndex, items)}
        type={currentSelectorType}
        multiple={true}
      />
    </div>
  )
}
