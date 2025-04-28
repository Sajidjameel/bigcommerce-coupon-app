"use client"

import { BrandSelectionModal } from "./brands-selection-modal"
import { CustomFieldSelectorModal } from "./custom-field-selector-modal"

interface SelectorItem {
  id: number
  name: string
  fieldName?: string
  fieldValues?: string[]
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
    case "custom_field":
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
          initialFieldName=""
          initialFieldValues={[""]}
        />
      )
    // You can add more modal types here as needed
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
