export type Rule = {
    id: string
    type: string
    condition: string
    reward: string
    config: {
      price?: number
      quantity?: number
      applyTo?: string
      includeOnSale?: boolean
      includeConditionProducts?: boolean
      productType?: string
      selectedProducts?: string[]
      minimumSpend?: number
      giftQuantity?: number
      giftProduct?: string
      shippingZoneType?: "all" | "selected"
      selectedZones?: string[]
      frequency?: string
      // Fields for product conditions
      reachingType?: "quantity" | "total_value"
      reachingQuantity?: number
      reachingValue?: number
      inclusionRule?: InclusionRule
      exclusionRules?: ExclusionRule[]
      // Fields for discount rewards
      discountType?: "percentage" | "amount"
      discountValue?: number
      discountFrom?: "each_product" | "total_price"
      appliedOn?: "all" | "up_to"
      appliedQuantity?: number
      appliedTarget?: "least_expensive" | "most_expensive"
      // Separate inclusion/exclusion rules for the reward
      rewardInclusionRule?: InclusionRule
      rewardExclusionRules?: ExclusionRule[]
    }
  }


  /**
 * Product interface representing a BigCommerce product
 */
export interface Product {
  id: number
  name: string
  sku: string
  price: number
  primary_image: {
    url_standard: string
  } | null
}

/**
 * Pagination interface for API responses
 */
export interface Pagination {
  total_pages: number
  current_page: number
  total: number
  count: number
}

  


  export type InclusionRule = {
    id: string
    type: string // "individual", "all", "category", "brand", "custom_field", "product_option"
    value?: string
    selector?: string
    additionalConditions?: AdditionalCondition[]
  }
  
  export type AdditionalCondition = {
    id: string
    type: string
    value?: string
    selector?: string
  }
  
  export type ExclusionRule = {
    id: string
    type: string // "individual", "category", "brand", "custom_field", "product_option"
    value?: string
    selector?: string
  }
  
  export type RuleType = {
    id: string
    name: string
    description: string
  }
  
  export type ConditionOption = {
    value: string
    label: string
    disabled?: boolean
  }
  
  export type RewardOption = {
    value: string
    label: string
    disabled?: boolean
  }
  
  export const CONDITION_OPTIONS: ConditionOption[] = [ 
    { value: "please_select", label: "Please select a value", disabled: true },
    { value: "buys_products", label: "Buys Products" },
    { value: "reaches_subtotal", label: "Reaches an order sub-total" },
    { value: "no_conditions", label: "No conditions" },
  ]
  
  export const REWARD_OPTIONS: RewardOption[] = [
    { value: "please_select", label: "Please select a value", disabled: true },
    { value: "gift_cart", label: "A gift in their cart" },
    { value: "free_shipping", label: "Free Shipping" },
    { value: "discount_products", label: "Discount on products" },
    { value: "discount_subtotal", label: "Discount on order subtotal" },
    { value: "fixed_price", label: "Fixed price for # of products" },
  ]
  
  export const FREQUENCY_OPTIONS = [
    { value: "once", label: "Once" },
    { value: "unlimited", label: "Unlimited" },
  ]
  
  export const SHIPPING_ZONE_OPTIONS = [
    { value: "all", label: "All zones" },
    { value: "selected", label: "Selected zones" },
  ]
  
  export const REACHING_TYPE_OPTIONS = [
    { value: "quantity", label: "Quantity" },
    { value: "total_value", label: "Total Value" },
  ]
  
  export const PRODUCT_INCLUSION_OPTIONS = [
    { value: "please_select", label: "Please select a value", disabled: true },
    { value: "individual", label: "Individual Products" },
    { value: "all", label: "All products" },
    { value: "category", label: "In category" },
    { value: "brand", label: "In brand" },
    { value: "custom_field", label: "With custom field" },
    { value: "product_option", label: "With product option" },
  ]
  
  export const ADDITIONAL_CONDITION_OPTIONS = [
    { value: "please_select", label: "Please select a value", disabled: true },
    { value: "brand", label: "In brand" },
    { value: "custom_field", label: "With custom field" },
    { value: "product_option", label: "With product option" },
  ]
  
  export const DISCOUNT_TYPE_OPTIONS = [
    { value: "percentage", label: "Percentage" },
    { value: "amount", label: "Amount" },
  ]
  
  export const DISCOUNT_FROM_OPTIONS = [
    { value: "each_product", label: "Each product's price" },
    { value: "total_price", label: "Total price of included products" },
  ]
  
  export const APPLIED_ON_OPTIONS = [
    { value: "all", label: "All" },
    { value: "up_to", label: "Up to" },
  ]
  
  export const APPLIED_TARGET_OPTIONS = [
    { value: "least_expensive", label: "Least expensive" },
    { value: "most_expensive", label: "Most expensive" },
  ]
  


  // types/currency.ts
export interface Currency {
  id: number;
  defaultName: string;
  name: string;
  code: string;
  symbol: string;
  symbolLocation: string;
  decimalSeparator: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  exchangeRate: number;
  isExchangeRateAutoUpdated: boolean;
  isTransactional: boolean;
  isEnabled: boolean;
  isDefault: boolean;
  useDefaultName: boolean;
  countries: any[]; // You can further type this if needed
}

export interface CurrenciesResponse {
  data: Currency[];
  meta: Record<string, unknown>;
}

export type RuleTypeId = "customerGroup" | "customerSegment" | "shippingDestination"

export type TargetingRule = {
  id: string
  type: RuleTypeId | null
  condition: string
  value: string
  selectedItems?: any[]
}

export type AvailableRuleType = {
  id: RuleTypeId
  label: string
}

export type CustomerGroup = {
  id: number
  name: string
}