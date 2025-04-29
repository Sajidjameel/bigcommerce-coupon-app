"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

interface CustomFieldValue {
  id: string
  value: string
}

interface CustomFieldSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (fieldName: string, fieldValues: string[]) => void
  initialFieldName?: string
  initialFieldValues?: string[]
}

export function CustomFieldSelectorModal({
  isOpen,
  onClose,
  onApply,
  initialFieldName = "",
  initialFieldValues = [""],
}: CustomFieldSelectorModalProps) {
  const [fieldName, setFieldName] = useState(initialFieldName)
  const [fieldValues, setFieldValues] = useState<CustomFieldValue[]>(
    initialFieldValues.map((value, index) => ({ id: `value-${index}`, value })),
  )

  if (!isOpen) return null

  const handleAddValue = () => {
    setFieldValues([...fieldValues, { id: `value-${Date.now()}`, value: "" }])
  }

  const handleRemoveValue = (id: string) => {
    setFieldValues(fieldValues.filter((item) => item.id !== id))
  }

  const handleValueChange = (id: string, value: string) => {
    setFieldValues(fieldValues.map((item) => (item.id === id ? { ...item, value } : item)))
  }

  const handleApply = () => {
    onApply(fieldName, fieldValues.map((item) => item.value).filter(Boolean))
  }

  return (
    <div className="fixed inset-0 bg-black  bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[50%] max-h-[100vh] h-[70vh] overflow-y-auto">
        <h2 className="text-2xl font-medium  mb-6">Select custom field values</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter the custom field that the product needs to be matched against. Values must match exactly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="custom-field-name" className="block text-sm font-bold mb-2">
              Custom field name
            </label>
            <input
              id="custom-field-name"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Field value</label>
            <div className="space-y-2">
              {fieldValues.map((fieldValue, index) => (
                <div key={fieldValue.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={fieldValue.value}
                    onChange={(e) => handleValueChange(fieldValue.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(fieldValue.id)}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={fieldValues.length === 1}
                  >
                    <Trash2 className={`w-5 h-5 cursor-pointer ${fieldValues.length === 1 ? "opacity-50" : ""}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddValue}
          className="ml-[22rem] flex items-center justify-end cursor-pointer  w-full md:w-auto text-blue-600 hover:text-blue-800 text-sm  rounded-md px-4 py-2 mb-6"
        >
          <span className="mr-1 text-2xl cursor-pointer">+</span> Add another value
        </button>

        <div className="flex justify-end items-end gap-2 mt-[12rem]">
          <button type="button" onClick={onClose} className="px-4 py-2 cursor-pointer text-blue-600 hover:text-blue-800 rounded">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
