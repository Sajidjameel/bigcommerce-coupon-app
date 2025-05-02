"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

interface ProductOptionValue {
  id: string
  value: string
}

interface ProductOptionSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (optionName: string, optionValues: string[]) => void
  initialOptionName?: string
  initialOptionValues?: string[]
}

export function ProductOptionSelectorModal({
  isOpen,
  onClose,
  onApply,
  initialOptionName = "",
  initialOptionValues = [""],
}: ProductOptionSelectorModalProps) {
  const [optionName, setOptionName] = useState(initialOptionName)
  const [optionValues, setOptionValues] = useState<ProductOptionValue[]>(
    initialOptionValues.map((value, index) => ({ id: `value-${index}`, value })),
  )

  if (!isOpen) return null

  const handleAddValue = () => {
    setOptionValues([...optionValues, { id: `value-${Date.now()}`, value: "" }])
  }

  const handleRemoveValue = (id: string) => {
    setOptionValues(optionValues.filter((item) => item.id !== id))
  }

  const handleValueChange = (id: string, value: string) => {
    setOptionValues(optionValues.map((item) => (item.id === id ? { ...item, value } : item)))
  }

  const handleApply = () => {
    onApply(optionName, optionValues.map((item) => item.value).filter(Boolean))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6  w-[50%] max-h-[100vh] h-[70vh] overflow-y-auto">
        <h2 className="text-xl font-medium mb-4">Select product option values</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter the product option that the product needs to be matched against. Values must match exactly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="product-option-name" className="block text-sm font-medium mb-2">
              Product option name
            </label>
            <input
              id="product-option-name"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Option value</label>
            <div className="space-y-2">
              {optionValues.map((optionValue, index) => (
                <div key={optionValue.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={optionValue.value}
                    onChange={(e) => handleValueChange(optionValue.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(optionValue.id)}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={optionValues.length === 1}
                  >
                    <Trash2 className={`cursor-pointer w-5 h-5 ${optionValues.length === 1 ? "opacity-50" : ""}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddValue}
          className="ml-[22rem] flex items-center justify-center w-full md:w-auto text-blue-600 hover:text-blue-800 text-sm cursor-pointer px-4 py-2 mb-6"
        >
          <span className="mr-1">+</span> Add another value
        </button>

        <div className="flex justify-end gap-2  mt-[12rem]">
          <button type="button" onClick={onClose} className="px-4 py-2 cursor-pointer text-blue-600 hover:text-blue-800 rounded">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
