"use client"
import { AdditionalCondition, PRODUCT_INCLUSION_OPTIONS, RuleModel, type Product } from "@/types/rule-types"
import { Search, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ProductSearchModal } from "../UI/Product-search-modal"
import { SelectorModal } from "../UI/select-modal"
import { TagInput } from "../UI/tag-input"
import { ProductInclusionRuleProps, SelectorItem } from "./types"
import { handleAddRule, handleDeleteRule, handleProductSelect, handleSelectorSelect, handleTypeChange } from "./function"
import { getInitialSelectedItems, getSelectedProductsForRule } from "./utils-functions"

export function ProductInclusionRule({ rule, onRuleChange }: ProductInclusionRuleProps) {
  // Convert the inclusion rule structure to an array format for easier handling
  const inclusionRules: RuleModel[] = [
    { id: rule.id, type: rule.type, value: rule.value || "", selector: rule.selector || "" },
    ...(rule.additionalConditions || []).map((condition: AdditionalCondition) => ({
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

  // Convert the array structure back to the original inclusion rule structure
  const updateOriginalStructure = (rules: RuleModel[]) => {
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
      const products = getSelectedProductsForRule(index, inclusionRules, selectedProducts)
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
          onClick={()=> handleAddRule(inclusionRules, updateOriginalStructure)}
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
                  onChange={(e) => handleTypeChange(index, e.target.value, inclusionRules, updateOriginalStructure)}
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
                  onClick={() => handleDeleteRule(index, inclusionRules, updateOriginalStructure, selectedItems, selectedProducts, setSelectedItems, setSelectedProducts)}
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
                onClick={()=> handleAddRule(inclusionRules, updateOriginalStructure)}
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
        onSelect={(products) => handleProductSelect(currentEditingIndex, products, inclusionRules, updateOriginalStructure, selectedProducts, setSelectedProducts, setShowProductModal)}
        selectedProduct={selectedProducts.get(currentEditingIndex) || null}
        multiple={true} // Allow multiple product selection for inclusion rules
      />

      {/* Selector Modal for brands, categories, etc. */}
      <SelectorModal
       key={`selector-modal-${currentEditingIndex}`}
        isOpen={showSelectorModal}
        onClose={() => setShowSelectorModal(false)}
        onSelect={(items) => handleSelectorSelect(currentEditingIndex, items, inclusionRules, updateOriginalStructure, selectedItems, setSelectedItems, setShowProductModal)}
        type={currentSelectorType}
        multiple={true}
        initialSelectedItems={getInitialSelectedItems(currentEditingIndex, inclusionRules, selectedItems)}
      />
    </div>
  )
}