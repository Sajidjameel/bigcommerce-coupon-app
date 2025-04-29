"use client"

import { BrandSelectionModal } from "./brands-selection-modal"
import { CustomFieldSelectorModal } from "./custom-field-selector-modal"
import { ProductOptionSelectorModal } from "./product-option-selector-modal"
import { CategorySelectorModal } from "./category-selector-modal"

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

interface SelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (items: SelectorItem[] | SelectorItem) => void
  type: "brand" | "category" | "custom_field" | "product_option"
  multiple?: boolean
  initialSelectedItems?: SelectorItem[]
}

export function SelectorModal({
  isOpen,
  onClose,
  onSelect,
  type,
  multiple = false,
  initialSelectedItems = [],
}: SelectorModalProps) {
  // Get initial values for product option if available
  const getInitialProductOptionValues = () => {
    if (initialSelectedItems.length > 0 && initialSelectedItems[0].optionName) {
      return {
        optionName: initialSelectedItems[0].optionName || "",
        optionValues: initialSelectedItems[0].optionValues || [""],
      }
    }
    return { optionName: "", optionValues: [""] }
  }

  // Get initial values for custom field if available
  const getInitialCustomFieldValues = () => {
    if (initialSelectedItems.length > 0 && initialSelectedItems[0].fieldName) {
      return {
        fieldName: initialSelectedItems[0].fieldName || "",
        fieldValues: initialSelectedItems[0].fieldValues || [""],
      }
    }
    return { fieldName: "", fieldValues: [""] }
  }

  // Render the appropriate modal based on the type
  if (!isOpen) return null

  switch (type) {
    case "brand":
      return (
        <BrandSelectionModal
          isOpen={isOpen}
          onClose={onClose}
          onSelect={onSelect}
          multiple={multiple}
          initialSelectedBrands={initialSelectedItems}
        />
      )
    case "category":
      return (
        <CategorySelectorModal
          isOpen={isOpen}
          onClose={onClose}
          onApply={(selectedCategories) => {
            // Format the result to match the expected SelectorItem format
            const result = selectedCategories.map((category) => ({
              id: category.id,
              name: category.name,
              channelId: category.channelId,
              channelName: category.channelName,
              path: category.path,
            }))
            onSelect(multiple ? result : result[0])
          }}
          initialSelectedCategories={initialSelectedItems.map((item) => ({
            id: item.id,
            name: item.name,
            channelId: item.channelId || 0,
            channelName: item.channelName || "",
            path: item.path,
          }))}
        />
      )
    case "custom_field":
      const { fieldName, fieldValues } = getInitialCustomFieldValues()
      return (
        <CustomFieldSelectorModal
          isOpen={isOpen}
          onClose={onClose}
          onApply={(fieldName, fieldValues) => {
            // Format the result to match the expected SelectorItem format
            const result = {
              id: Date.now(),
              name: `${fieldName}: ${fieldValues.join(", ")}`,
              fieldName,
              fieldValues,
            }
            onSelect(multiple ? [result] : result)
          }}
          initialFieldName={fieldName}
          initialFieldValues={fieldValues}
        />
      )
    case "product_option":
      const { optionName, optionValues } = getInitialProductOptionValues()
      return (
        <ProductOptionSelectorModal
          isOpen={isOpen}
          onClose={onClose}
          onApply={(optionName, optionValues) => {
            // Format the result to match the expected SelectorItem format
            const result = {
              id: Date.now(),
              name: `${optionName}: ${optionValues.join(", ")}`,
              optionName,
              optionValues,
            }
            onSelect(multiple ? [result] : result)
          }}
          initialOptionName={optionName}
          initialOptionValues={optionValues}
        />
      )
    default:
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Not Implemented</h2>
            <p className="mb-4">The selector for "{type}" is not yet implemented.</p>
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )
  }
}
