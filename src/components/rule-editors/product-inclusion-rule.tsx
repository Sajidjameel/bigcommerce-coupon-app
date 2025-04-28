"use client"
import { useMemo, useState } from "react"
import { Search, Trash2 } from "lucide-react"
import { ProductSearchModal } from "@/components/UI/Product-search-modal"
import { type InclusionRule, PRODUCT_INCLUSION_OPTIONS, type Product } from "@/types/rule-types"

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

export function ProductInclusionRule({ rule, onRuleChange }: ProductInclusionRuleProps) {
  const [showProductModal, setShowProductModal] = useState(false)
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(0)
  const [selectedProducts, setSelectedProducts] = useState<Map<number, Product[]>>(new Map())

  const inclusionRules: RuleItem[] = useMemo(() => [
    { id: rule.id, type: rule.type, value: rule.value || "", selector: rule.selector || "" },
    ...(rule.additionalConditions || []).map((condition) => ({
      id: condition.id,
      type: condition.type,
      value: condition.value || "",
      selector: condition.selector || "",
    })),
  ], [rule])

  const isFirstRuleIndividualOrAll = inclusionRules[0]?.type === "individual" || inclusionRules[0]?.type === "all"

  const isTypeSelected = (type: string) =>
    inclusionRules.some((rule) => rule.type === type)

  const getAvailableOptions = (index: number) => {
    const currentType = inclusionRules[index]?.type
    if (index === 0) return PRODUCT_INCLUSION_OPTIONS

    const options = currentType === "please_select"
      ? [{ value: "please_select", label: "Please select a value" }]
      : []

    const filtered = PRODUCT_INCLUSION_OPTIONS.filter((option) => {
      if (option.value === currentType) return true
      if (["individual", "all"].includes(option.value)) return false
      if (["category", "brand"].includes(option.value) && isTypeSelected(option.value)) return false
      return true
    })

    return [...options, ...filtered]
  }

  const getPlaceholderText = (type: string) => {
    switch (type) {
      case "individual": return "Click to open product selector"
      case "category": return "Click to open category selector"
      case "brand": return "Click to open brand selector"
      case "custom_field": return "Click to open field selector"
      case "product_option": return "Click to open option selector"
      default: return "Click to select"
    }
  }

  const updateOriginalStructure = (rules: RuleItem[]) => {
    const [main, ...additional] = rules
    onRuleChange({
      ...rule,
      type: main.type,
      value: main.value,
      selector: main.selector,
      additionalConditions: additional.map(({ id, type, value, selector }) => ({ id, type, value, selector })),
    })
  }

  const handleTypeChange = (index: number, type: string) => {
    let updated = [...inclusionRules]
    if (index === 0) {
      updated = [{ ...updated[0], type, value: "", selector: "" }]
    } else {
      updated[index] = { ...updated[index], type, value: "", selector: "" }
    }
    updateOriginalStructure(updated)
  }

  const handleProductSelect = (index: number, products: Product[] | Product) => {
    const productArray = Array.isArray(products) ? products : [products]
    const updated = new Map(selectedProducts)
    updated.set(index, productArray)
    setSelectedProducts(updated)

    const productNames = productArray.map((p) => p.name).join(", ")
    const productIds = productArray.map((p) => p.id).join(",")

    const rules = [...inclusionRules]
    rules[index] = { ...rules[index], selector: productNames, value: productIds }
    updateOriginalStructure(rules)
    setShowProductModal(false)
  }

  const handleSelectorChange = (index: number, selector: string) => {
    const updated = [...inclusionRules]
    updated[index] = { ...updated[index], selector }
    updateOriginalStructure(updated)
  }

  const handleAddInclusionRule = () => {
    const updated = [
      ...inclusionRules,
      { id: `inclusion-${Date.now()}`, type: "please_select", value: "", selector: "" },
    ]
    updateOriginalStructure(updated)
  }

  const handleDeleteInclusionRule = (index: number) => {
    const updated = [...inclusionRules]
    updated.splice(index, 1)
    updateOriginalStructure(updated)
  }

  const showAddButton =
    inclusionRules.length > 0 &&
    !isFirstRuleIndividualOrAll &&
    !inclusionRules.some((r) => r.type === "please_select") &&
    inclusionRules.every((r) => r.type !== "")

  return (
    <div className="space-y-4">
      {inclusionRules.length === 0 ? (
        <button onClick={handleAddInclusionRule} className="text-blue-600 hover:text-blue-800 text-sm">
          + Add inclusion rule
        </button>
      ) : (
        <>
          {inclusionRules.map((ruleItem, i) => (
            <RuleRow
              key={ruleItem.id}
              index={i}
              rule={ruleItem}
              isFirst={i === 0}
              isFirstRuleIndividualOrAll={isFirstRuleIndividualOrAll}
              getAvailableOptions={getAvailableOptions}
              getPlaceholderText={getPlaceholderText}
              onTypeChange={handleTypeChange}
              onSelectorClick={() => {
                if (ruleItem.type === "individual" && !(i > 0 && isFirstRuleIndividualOrAll)) {
                  setCurrentEditingIndex(i)
                  setShowProductModal(true)
                }
              }}
              onDelete={() => handleDeleteInclusionRule(i)}
            />
          ))}

          {showAddButton && (
            <div className="ml-4">
              <button onClick={handleAddInclusionRule} className="text-blue-600 hover:text-blue-800 text-sm">
                + Add another inclusion rule
              </button>
            </div>
          )}
        </>
      )}

      <ProductSearchModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={(products) => handleProductSelect(currentEditingIndex, products)}
        selectedProduct={selectedProducts}
        multiple
      />
    </div>
  )
}

interface RuleRowProps {
  index: number
  rule: RuleItem
  isFirst: boolean
  isFirstRuleIndividualOrAll: boolean
  getAvailableOptions: (i: number) => { value: string; label: string }[]
  getPlaceholderText: (type: string) => string
  onTypeChange: (index: number, type: string) => void
  onSelectorClick: () => void
  onDelete: () => void
}

function RuleRow({
  index,
  rule,
  isFirst,
  isFirstRuleIndividualOrAll,
  getAvailableOptions,
  getPlaceholderText,
  onTypeChange,
  onSelectorClick,
  onDelete,
}: RuleRowProps) {
  return (
    <div className={`flex items-center gap-2 ${isFirst ? "" : "ml-4"}`}>
      {isFirst ? (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span className="text-sm">Including products</span>
        </>
      ) : (
        <span className="text-sm">And</span>
      )}

      <div className="relative">
        <select
          className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-48"
          value={rule.type}
          onChange={(e) => onTypeChange(index, e.target.value)}
          disabled={index > 0 && isFirstRuleIndividualOrAll}
        >
          {getAvailableOptions(index).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
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
            onClick={onSelectorClick}
            disabled={index > 0 && isFirstRuleIndividualOrAll}
          />
        </div>
      )}

      {!isFirst && (
        <button
          type="button"
          onClick={onDelete}
          className="text-blue-600 hover:text-blue-800"
          disabled={index > 0 && isFirstRuleIndividualOrAll}
        >
          <Trash2 className={`w-5 h-5 ${index > 0 && isFirstRuleIndividualOrAll ? "opacity-50" : ""}`} />
        </button>
      )}
    </div>
  )
}
