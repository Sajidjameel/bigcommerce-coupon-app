"use client"

import type React from "react"
import { useCouponContext } from "../Context/CouponContext"
import { PlusCircle, Trash2 } from "lucide-react"

interface RuleProps {
  rule: {
    action: {
      gift_item?: {
        quantity: number
        product_id: number
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
      }
    }
    apply_once: boolean
    stop: boolean
    condition: {
      cart: {
        items: {
          products?: number[]
          not?: {
            brands?: number[]
          }
        }
        minimum_quantity: number
      }
    }
  }
  index: number
  onRemove: () => void
}

const Rule: React.FC<RuleProps> = ({ rule, index, onRemove }) => {
  // Helper function to display rule details in a readable format
  const getRuleDescription = () => {
    const { condition, action } = rule

    let conditionText = ""
    if (condition.cart.items.products) {
      conditionText = `When cart has ${condition.cart.minimum_quantity} of products [${condition.cart.items.products.join(", ")}]`
    } else if (condition.cart.items.not?.brands) {
      conditionText = `When cart has ${condition.cart.minimum_quantity} items not from brands [${condition.cart.items.not.brands.join(", ")}]`
    }

    let actionText = ""
    if (action.gift_item) {
      actionText = `Add ${action.gift_item.quantity} of product #${action.gift_item.product_id} as gift`
    } else if (action.cart_items?.discount) {
      const discountType = action.cart_items.discount.percentage_amount
        ? `${action.cart_items.discount.percentage_amount}%`
        : `$${action.cart_items.discount.fixed_amount}`
      actionText = `Apply ${discountType} discount using ${action.cart_items.strategy} strategy`
    }

    return `${conditionText} → ${actionText}`
  }

  return (
    <div className="border rounded-md p-4 mb-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Rule {index + 1}</h4>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700" aria-label="Remove rule">
          <Trash2 size={18} />
        </button>
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
  const { formData, removeRule, addRule } = useCouponContext()

  const handleAddRule = () => {
    // Add a default rule template
    addRule({
      action: {
        gift_item: {
          quantity: 1,
          product_id: 0,
        },
      },
      apply_once: true,
      stop: false,
      condition: {
        cart: {
          items: {
            products: [0],
          },
          minimum_quantity: 1,
        },
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-base">Rules</h3>
        <button onClick={handleAddRule} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
          <PlusCircle size={16} />
          <span>Add rule</span>
        </button>
      </div>

      {formData.rules.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md bg-gray-50">
          <p className="text-gray-500">No rules added yet. Click "Add rule" to create your first rule.</p>
        </div>
      ) : (
        <div>
          {formData.rules.map((rule, index) => (
            <Rule key={index} rule={rule} index={index} onRemove={() => removeRule(index)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default RuleList
