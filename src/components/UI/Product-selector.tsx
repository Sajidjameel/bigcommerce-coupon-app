"use client"
import { Search } from "lucide-react"
import type { Product } from "@/types/rule-types"

interface ProductSelectorProps {
  selectedProduct: Product | null
  onOpenModal: () => void
}

/**
 * Component for displaying the selected product and opening the search modal
 */
export function ProductSelector({ selectedProduct, onOpenModal }: ProductSelectorProps) {
  return (
    <div className="relative flex-1 max-w-xs">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-gray-500" />
      </div>
      <input
        type="text"
        className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Click to add a single product"
        value={selectedProduct ? selectedProduct.name : ""}
        onClick={onOpenModal}
        readOnly
        aria-label="Select product"
      />
    </div>
  )
}
