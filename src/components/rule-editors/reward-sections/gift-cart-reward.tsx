"use client"

import { useState, useEffect } from "react"
import type { Rule, Product } from "@/types/rule-types"
import { QuantitySelector } from "@/components/UI/Quantity-selector"
import { Search } from "lucide-react"
import { TagInput } from "@/components/UI/tag-input"
import { ProductSearchModal } from "@/components/UI/Product-search-modal"

interface GiftCartRewardProps {
  rule: Rule
  onConfigChange: (field: string, value: any) => void
}

/**
 * Component for configuring a gift cart reward rule
 * Allows selecting a product and quantity to add to the customer's cart for free
 */
export function GiftCartReward({ rule, onConfigChange }: GiftCartRewardProps) {
  // Extract values from rule config or use defaults
  const giftQuantity = rule?.config?.giftQuantity ?? 1
  const giftProduct = rule?.config?.giftProduct ?? ""

  // Component state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  // Initialize selected product from rule config
  useEffect(() => {
    if (rule?.config?.giftProduct && typeof rule.config.giftProduct === 'object') {
      setSelectedProduct(rule.config.giftProduct)
    }
  }, [rule?.config?.giftProduct])

  /**
   * Handles quantity changes
   */
  const handleGiftQuantityChange = (newQuantity: number) => {
    onConfigChange("giftQuantity", newQuantity)
  }

  /**
   * Handles product selection
   */
  const handleProductSelect = (product: Product | Product[]) => {
    const selected = Array.isArray(product) ? product[0] : product
    setSelectedProduct(selected)
    onConfigChange("giftProduct", selected)
    setShowProductModal(false)
  }

  // Convert selected product to tag format
  const getSelectedItems = () => {
    if (!selectedProduct) return []
    return [{ id: selectedProduct.id, name: selectedProduct.name }]
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      <span className="text-sm">Include</span>

      {/* Quantity Selector Component */}
      <QuantitySelector quantity={giftQuantity} onChange={handleGiftQuantityChange} />

      {/* Product Selector - Replaced with the abstracted version */}
      <div className="relative flex-1 max-w-xs">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <TagInput
          tags={getSelectedItems()}
          placeholder="Click to select a product"
          onClick={() => setShowProductModal(true)}
        />
      </div>

      <span className="text-sm">in the customer&apos;s cart for free.</span>

      {/* Product Search Modal Component */}
      <ProductSearchModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={handleProductSelect}
        selectedProduct={selectedProduct}
        multiple={false} // For gift rule, only one product allowed
      />
    </div>
  )
}