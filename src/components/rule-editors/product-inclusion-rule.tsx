"use client"
import { type InclusionRule, PRODUCT_INCLUSION_OPTIONS, type Product } from "@/types/rule-types"
import { Search, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ProductSearchModal } from "../UI/Product-search-modal"
import { SelectorModal } from "../UI/select-modal"
import { TagInput } from "../UI/tag-input"
import { handleAddInclusionRule, handleDeleteInclusionRule, handleProductSelect, handleSelectorSelect } from "./utils/inclusion-rule-funtion"
import { ProductInclusionRuleProps, RuleItem, SelectorItem } from "./types"

export function ProductInclusionRule({ rule, onRuleChange }: ProductInclusionRuleProps) {
  // Convert the inclusion rule structure to an array format for easier handling
  const inclusionRules: InclusionRule[] = [
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

  // Store selected items for each rule to preserve values when reopening modals
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectorItem[]>>(new Map())

  // Initialize selectedProducts from rules when component mounts or rules change
  useEffect(() => {
    const newSelectedProducts = new Map<number, Product[]>()

    inclusionRules.forEach((rule, index) => {
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
          console.error("Error parsing product IDs from rule value:", e)
          // If parsing fails, set empty array
          newSelectedProducts.set(index, [])
        }
      }
    })

    setSelectedProducts(newSelectedProducts)
  }, [rule])

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

  handleSelectorSelect(
    index,
    items,
    selectedItems,
    setSelectedItems,
    setShowSelectorModal,
    inclusionRules,
    updateOriginalStructure
  )

  // Get initial selected items for the current editing rule
  const getInitialSelectedItems = (index: number): SelectorItem[] => {
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
              name: rule.selector,
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
              name: rule.selector,
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
  const getSelectedProductsForRule = (index: number): Product[] => {
    if (selectedProducts.has(index)) {
      return selectedProducts.get(index) || []
    }

    // Try to parse from the rule value if we don't have it in state
    const rule = inclusionRules[index]
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

  // Convert the array structure back to the original inclusion rule structure
  const updateOriginalStructure = (rules: InclusionRule[]) => {
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
    const currentType = inclusionRules[currentIndex]?.type;

    if (currentIndex === 0) {
      return PRODUCT_INCLUSION_OPTIONS;
    }

    const filteredOptions = PRODUCT_INCLUSION_OPTIONS.filter((option) => {
      if (option.value === "please_select") return false; // <-- prevent duplicate
      if (option.value === currentType) return true;
      if (option.value === "individual" || option.value === "all") return false;
      if ((option.value === "category" || option.value === "brand") && isTypeSelected(option.value)) {
        return false;
      }
      return true;
    });

    return [{ value: "please_select", label: "Please select a value", disabled: true }, ...filteredOptions];
  };


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

  // Get selected items for a rule
  const getSelectedItemsForRule = (index: number): { id: number; name: string }[] => {
    const rule = inclusionRules[index]
    if (!rule || !rule.value || !rule.selector) return []

    // For individual products
    if (rule.type === "individual") {
      const products = getSelectedProductsForRule(index)
      return products.map((p) => ({ id: p.id, name: p.name }))
    }

    // For other types, try to get from selectedItems
    if (selectedItems.has(index)) {
      return selectedItems.get(index)?.map((item) => ({ id: item.id, name: item.name })) || []
    }

    // If we have a selector but no parsed items, create a placeholder
    if (rule.selector) {
      return [{ id: Date.now(), name: rule.selector }]
    }

    return []
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
          onClick={()=> handleAddInclusionRule(inclusionRules, updateOriginalStructure)}
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
                  <TagInput
                    tags={getSelectedItemsForRule(index)}
                    placeholder={getPlaceholderText(rule.type)}
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
                  onClick={() => handleDeleteInclusionRule(index,
                    setSelectedItems,
                    selectedItems,
                    selectedProducts,
                    setSelectedProducts,
                    updateOriginalStructure,
                    inclusionRules
                  )}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={index > 0 && isFirstRuleIndividualOrAll}
                >
                  <Trash2 className={`w-5 h-5 cursor-pointer ${index > 0 && isFirstRuleIndividualOrAll ? "opacity-50" : ""}`} />
                </button>
              )}
            </div>
          ))}

          {/* Add another inclusion rule button */}
          {showAddButton && (
            <div className="ml-4">
              <button
                type="button"
                onClick={()=>handleAddInclusionRule(inclusionRules, updateOriginalStructure)}
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
        key={`product-modal-${currentEditingIndex}`}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={(products) => handleProductSelect(index,
          products,
          selectedProducts,
          setSelectedProducts,
          updateOriginalStructure,
          inclusionRules,
          setShowProductModal)}
        selectedProduct={selectedProducts.get(currentEditingIndex) || null}
        multiple={true} // Allow multiple product selection for inclusion rules
      />

      {/* Selector Modal for brands, categories, etc. */}
      <SelectorModal
        key={`selector-modal-${currentEditingIndex}`}
        isOpen={showSelectorModal}
        onClose={() => setShowSelectorModal(false)}
        onSelect={(items) => handleProductSelect(index,
          products,
          selectedProducts,
          setSelectedProducts,
          updateOriginalStructure,
          inclusionRules,
          setShowProductModal)}
        type={currentSelectorType}
        multiple={true}
        initialSelectedItems={getInitialSelectedItems(currentEditingIndex)}
      />
    </div>
  )
}
