"use client"

import { MinusCircle, PlusCircle } from "lucide-react"

interface QuantitySelectorProps {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
}

/**
 * Component for selecting a quantity with increment/decrement buttons
 */
export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = Number.POSITIVE_INFINITY,
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > min) {
      onChange(quantity - 1)
    }
  }

  return (
    <div className="flex items-center border border-gray-300 rounded">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className={`px-2 py-1 ${
          quantity <= min ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
        }`}
        aria-label="Decrease quantity"
      >
        <MinusCircle className={`cursor-pointer w-4 h-4 ${quantity <= min ? "text-gray-300" : "text-blue-600"}`} />
      </button>
      <input
        type="text"
        className="w-8 text-center border-0 focus:ring-0"
        value={quantity}
        readOnly
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className={`px-2 py-1 ${
          quantity >= max ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
        }`}
        aria-label="Increase quantity"
      >
        <PlusCircle className="cursor-pointer w-4 h-4 text-blue-600" />
      </button>
    </div>
  )
}
