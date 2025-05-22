"use client"

import type React from "react"
import { useCouponContext } from "../Context/CouponContext"
import { PlusCircle, Trash2 } from "lucide-react"
import { useState } from "react"
import { CustomRuleEditor } from "./custom-rule-editor"
import type { Rule } from "@/types/rule-types"

// Define a type for the complex condition structure
interface ComplexCondition {
  cart: {
    items: {
      products?: Array<{ id: number; name: string }> | number[]
      categories?: Array<{ id: number; name: string }> | number[]
      brands?: Array<{ id: number; name: string }> | number[]
      not?: {
        brands?: Array<{ id: number; name: string }> | number[]
        categories?: Array<{ id: number; name: string }> | number[]
        products?: Array<{ id: number; name: string }> | number[]
        and?: Array<{
          brands?: Array<{ id: number; name: string }> | number[]
          categories?: Array<{ id: number; name: string }> | number[]
          products?: Array<{ id: number; name: string }> | number[]
        }>
      }
      and?: Array<{
        products?: Array<{ id: number; name: string }> | number[]
        categories?: Array<{ id: number; name: string }> | number[]
        brands?: Array<{ id: number; name: string }> | number[]
        not?: {
          products?: Array<{ id: number; name: string }> | number[]
          categories?: Array<{ id: number; name: string }> | number[]
          brands?: Array<{ id: number; name: string }> | number[]
          and?: Array<{
            brands?: Array<{ id: number; name: string }> | number[]
            categories?: Array<{ id: number; name: string }> | number[]
            products?: Array<{ id: number; name: string }> | number[]
          }>
        }
      }>
    }
    minimum_quantity: number
    subtotal?: {
      min_amount: number
    }
  }
}

// Define a type for the action structure
interface RuleAction {
  gift_item?: {
    quantity: number
    product_id: number
    product_name?: string
  }
  cart_items?: {
    discount: {
      percentage_amount?: string
      fixed_amount?: string
    }
    strategy: string
    add_free_item: boolean
    as_total: boolean
    include_items_considered_by_condition: boolean
    exclude_items_on_sale: boolean
    quantity: number
    items?: {
      products?: Array<{ id: number; name: string }> | number[]
      categories?: Array<{ id: number; name: string }> | number[]
      brands?: Array<{ id: number; name: string }> | number[]
      not?: {
        products?: Array<{ id: number; name: string }> | number[]
        categories?: Array<{ id: number; name: string }> | number[]
        brands?: Array<{ id: number; name: string }> | number[]
      }
    }
  }
  shipping?: {
    free_shipping: boolean
    zone_ids?: number[]
    zone_names?: string[]
  }
  cart?: {
    discount: {
      percentage_amount?: string
      fixed_amount?: string
    }
  }
}

// Extend the Rule type to include our custom properties
interface ExtendedRule extends Rule {
  action?: RuleAction
  apply_once?: boolean
  stop?: boolean
  condition: string | ComplexCondition
}

interface RuleProps {
  rule: ExtendedRule
  index: number
  onRemove: () => void
  onEdit: () => void
}

const RuleItem: React.FC<RuleProps> = ({ rule, index, onRemove, onEdit }) => {
  // Helper function to display rule details in a readable format
  const getRuleDescription = () => {
    // Handle the case where rule might not have condition or action properties
    if (!rule.condition) {
      return "Rule configuration incomplete"
    }

    let conditionText = ""
    if (typeof rule.condition === "object" && rule.condition.cart) {
      if (rule.condition.cart.items?.products) {
        const products = Array.isArray(rule.condition.cart.items.products) ? rule.condition.cart.items.products : []

        const productNames = products.map((p: any) => (typeof p === "object" ? p.name : `Product ${p}`)).join(", ")
        conditionText = `When cart has ${rule.condition.cart.minimum_quantity} of products [${productNames}]`
      } else if (rule.condition.cart.items?.not?.brands) {
        const brands = Array.isArray(rule.condition.cart.items.not.brands) ? rule.condition.cart.items.not.brands : []

        const brandNames = brands.map((b: any) => (typeof b === "object" ? b.name : `Brand ${b}`)).join(", ")
        conditionText = `When cart has ${rule.condition.cart.minimum_quantity} items not from brands [${brandNames}]`
      } else if (rule.condition.cart.items?.not?.categories) {
        const categories = Array.isArray(rule.condition.cart.items.not.categories)
          ? rule.condition.cart.items.not.categories
          : []

        const categoryNames = categories.map((c: any) => (typeof c === "object" ? c.name : `Category ${c}`)).join(", ")
        conditionText = `When cart has ${rule.condition.cart.minimum_quantity} items not from categories [${categoryNames}]`
      } else if (rule.condition.cart.items?.and) {
        conditionText = `When cart has ${rule.condition.cart.minimum_quantity} items with complex conditions`
      } else if (rule.condition.cart.subtotal) {
        conditionText = `When cart subtotal reaches ${rule.condition.cart.subtotal.min_amount}`
      } else if (rule.condition.cart) {
        conditionText = `When cart has ${rule.condition.cart.minimum_quantity} items`
      }
    } else if (typeof rule.condition === "string") {
      // Handle string conditions
      if (rule.condition === "buys_products") {
        conditionText = "When customer buys products"
      } else if (rule.condition === "reaches_subtotal") {
        conditionText = "When customer reaches subtotal"
      } else if (rule.condition === "no_conditions") {
        conditionText = "No conditions"
      } else {
        conditionText = rule.condition
      }
    } else {
      conditionText = "When condition is met"
    }

    let actionText = ""
    if (rule.action?.gift_item) {
      const productName = rule.action.gift_item.product_name || `Product #${rule.action.gift_item.product_id}`
      actionText = `Add ${rule.action.gift_item.quantity} of ${productName} as gift`
    } else if (rule.action?.shipping?.free_shipping) {
      actionText = "Free shipping"
      if (rule.action.shipping.zone_ids && rule.action.shipping.zone_ids.length > 0) {
        const zoneText =
          rule.action.shipping.zone_names && rule.action.shipping.zone_names.length > 0
            ? rule.action.shipping.zone_names.join(", ")
            : rule.action.shipping.zone_ids.join(", ")
        actionText += ` for zones [${zoneText}]`
      } else {
        actionText += " for all zones"
      }
    } else if (rule.action?.cart_items?.discount) {
      const discountType = rule.action.cart_items.discount.percentage_amount
        ? `${rule.action.cart_items.discount.percentage_amount}%`
        : `$${rule.action.cart_items.discount.fixed_amount}`
      actionText = `Apply ${discountType} discount using ${rule.action.cart_items.strategy} strategy`

      if (rule.action.cart_items.add_free_item) {
        actionText += " with free item"
      }

      if (rule.action.cart_items.as_total) {
        actionText += " as total"
      }

      if (rule.action.cart_items.include_items_considered_by_condition) {
        actionText += " (including condition items)"
      }

      if (rule.action.cart_items.exclude_items_on_sale) {
        actionText += " (excluding sale items)"
      }
    } else if (rule.action?.cart?.discount) {
      const discountType = rule.action.cart.discount.percentage_amount
        ? `${rule.action.cart.discount.percentage_amount}%`
        : `$${rule.action.cart.discount.fixed_amount}`
      actionText = `Apply ${discountType} discount to cart total`
    } else {
      actionText = "Apply reward"
    }

    return `${conditionText} → ${actionText}`
  }

  return (
    <div className="border rounded-md p-4 mb-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Rule {index + 1}</h4>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-blue-500 hover:text-blue-700" aria-label="Edit rule">
            Edit
          </button>
          <button onClick={onRemove} className="text-red-500 hover:text-red-700" aria-label="Remove rule">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600">{getRuleDescription()}</p>
      <div className="mt-2 text-xs text-gray-500">
        {rule.apply_once && <span className="mr-2">Apply once</span>}
        {rule.stop && <span>Stop processing rules after this one</span>}
      </div>
    </div>
  )
}

const RuleList: React.FC = () => {
  const { formData, removeRule, addRule, updateRule } = useCouponContext()
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null)
  const [currentRule, setCurrentRule] = useState<ExtendedRule | null>(null)

  const handleAddRule = () => {
    // Create a rule with complex nested conditions as shown in the screenshots
    const newRule: ExtendedRule = {
      id: `rule-${Date.now()}`,
      type: "custom",
      condition: {
        cart: {
          items: {
            and: [
              {
                not: {
                  and: [
                    { brands: [{ id: 38, name: "Front Row Furniture" }] },
                    {
                      categories: [
                        { id: 110, name: "Chairs by Industry" },
                        { id: 192, name: "Category 192" },
                      ],
                    },
                  ],
                },
              },
              {
                products: [
                  { id: 694, name: "Stacking Gilt Wooden Banqueting Chairs. Gold" },
                  { id: 695, name: "Product 695" },
                ],
              },
            ],
          },
          minimum_quantity: 1,
        },
      },
      reward: "gift_cart",
      config: {
        giftQuantity: 2,
        giftProduct: { id: 697, name: "6ft Wooden Trestle Table" },
        frequency: "once",
        reachingQuantity: 1,
        inclusionRule: {
          id: `inclusion-${Date.now()}`,
          type: "individual",
          value: "694,695",
          selector: "Stacking Gilt Wooden Banqueting Chairs. Gold",
        },
        exclusionRules: [
          {
            id: `exclusion-${Date.now()}`,
            type: "brand",
            value: "38",
            selector: "Front Row Furniture",
          },
          {
            id: `exclusion-${Date.now()}`,
            type: "category",
            value: "110,192",
            selector: "Chairs by Industry",
          },
        ],
      },
      action: {
        gift_item: {
          quantity: 2,
          product_id: 697,
          product_name: "6ft Wooden Trestle Table",
        },
      },
      apply_once: true,
      stop: false,
    }

    setCurrentRule(newRule)
    setShowRuleEditor(true)
  }

  const handleAddDiscountRule = () => {
    // Create a discount rule with complex nested conditions
    const discountRule: ExtendedRule = {
      id: `rule-${Date.now()}`,
      type: "custom",
      condition: {
        cart: {
          items: {
            and: [
              {
                not: {
                  brands: [{ id: 38, name: "Front Row Furniture" }],
                },
              },
              {
                products: [
                  { id: 694, name: "Stacking Gilt Wooden Banqueting Chairs. Gold" },
                  { id: 695, name: "Product 695" },
                ],
              },
            ],
          },
          minimum_quantity: 1,
        },
      },
      reward: "discount_products",
      config: {
        discountType: "percentage",
        discountValue: 10,
        appliedTarget: "least_expensive",
        appliedQuantity: 1,
        includeOnSale: false,
        includeConditionProducts: true,
        frequency: "once",
        reachingQuantity: 1,
        inclusionRule: {
          id: `inclusion-${Date.now()}`,
          type: "individual",
          value: "694,695",
          selector: "Stacking Gilt Wooden Banqueting Chairs. Gold",
        },
        exclusionRules: [
          {
            id: `exclusion-${Date.now()}`,
            type: "brand",
            value: "38",
            selector: "Front Row Furniture",
          },
        ],
      },
      action: {
        cart_items: {
          discount: {
            percentage_amount: "10",
          },
          strategy: "LEAST_EXPENSIVE",
          add_free_item: false,
          as_total: false,
          include_items_considered_by_condition: true,
          exclude_items_on_sale: false,
          quantity: 1,
        },
      },
      apply_once: true,
      stop: false,
    }

    setCurrentRule(discountRule)
    setShowRuleEditor(true)
  }

  const handleEditRule = (index: number) => {
    setEditingRuleIndex(index)
    setCurrentRule(formData.rules[index] as ExtendedRule)
    setShowRuleEditor(true)
  }

  const handleSaveRule = () => {
    if (currentRule) {
      if (editingRuleIndex !== null) {
        updateRule(editingRuleIndex, currentRule as Rule)
      } else {
        addRule(currentRule as Rule)
      }
      setShowRuleEditor(false)
      setEditingRuleIndex(null)
      setCurrentRule(null)
    }
  }

  const handleCancelEdit = () => {
    setShowRuleEditor(false)
    setEditingRuleIndex(null)
    setCurrentRule(null)
  }

  const handleRuleChange = (rule: Rule) => {
    setCurrentRule(rule as ExtendedRule)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-base">Rules</h3>
        <div className="flex gap-2">
          <button onClick={handleAddRule} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
            <PlusCircle size={16} />
            <span>Add gift rule</span>
          </button>
          <button onClick={handleAddDiscountRule} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
            <PlusCircle size={16} />
            <span>Add discount rule</span>
          </button>
        </div>
      </div>

      {formData.rules.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md bg-gray-50">
          <p className="text-gray-500">No rules added yet. Click "Add rule" to create your first rule.</p>
        </div>
      ) : (
        <div>
          {formData.rules.map((rule, index) => (
            <RuleItem
              key={index}
              rule={rule as ExtendedRule}
              index={index}
              onRemove={() => removeRule(index)}
              onEdit={() => handleEditRule(index)}
            />
          ))}
        </div>
      )}

      {showRuleEditor && currentRule && (
        <CustomRuleEditor
          rule={currentRule as Rule}
          onRuleChange={handleRuleChange}
          onSave={handleSaveRule}
          onCancel={handleCancelEdit}
          onSwitchRule={() => {}}
        />
      )}
    </div>
  )
}

export default RuleList
