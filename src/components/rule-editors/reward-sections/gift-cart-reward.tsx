"use client"

import { useState } from "react"
import type { Rule, Product } from "@/types/rule-types"
import { QuantitySelector } from "@/components/UI/Quantity-selector"
import { ProductSelector } from "@/components/UI/Product-selector"
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
    console.log("Selected product:", selected)
    setSelectedProduct(selected)
    onConfigChange("giftProduct", selected.sku)
    setShowProductModal(false)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      <span className="text-sm">Include</span>

      {/* Quantity Selector Component */}
      <QuantitySelector quantity={giftQuantity} onChange={handleGiftQuantityChange} />

      {/* Product Selector Component */}
      <ProductSelector selectedProduct={selectedProduct} onOpenModal={() => setShowProductModal(true)} />

      {/* Product Search Modal Component */}
      <ProductSearchModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={handleProductSelect}
        selectedProduct={selectedProduct}
        multiple={false} // For gift rule, only one product allowed
      />

      <span className="text-sm">in the customer&apos;s cart for free.</span>
    </div>
  )
}
