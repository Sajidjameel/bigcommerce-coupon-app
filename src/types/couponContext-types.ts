import { Dispatch, SetStateAction } from "react"
import { Rule, RuleType, RuleTypeId, TargetingRule } from "./rule-types"
import { DiscountType, RewardType, Status } from "./enum"

export interface Country {
  id: string | number
  name: string
  iso2_country_code: string
}

// Types for rules
export interface GiftItem {
  quantity: number
  product_id: number
  product_name?: string
}

export interface Discount {
  percentage_amount?: string
  fixed_amount?: string
}

export interface CartItemsAction {
  discount: Discount
  strategy: string
  add_free_item: boolean
  as_total: boolean
  include_items_considered_by_condition: boolean
  exclude_items_on_sale: boolean
  quantity: number
  items?: {
    categories?: Array<{ id: number; name: string }> | number[]
    products?: Array<{ id: number; name: string }> | number[]
    brands?: Array<{ id: number; name: string }> | number[]
  }
}

export interface Action {
  gift_item?: GiftItem
  cart_items?: CartItemsAction
  fixed_price_set?: FixedPriceSetAction
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
// Add this new interface for fixed price set
export interface FixedPriceSetAction {
  fixed_price: string
  quantity: number
  strategy: string
  exclude_items_on_sale: boolean
  include_items_considered_by_condition: boolean
  items?: {
    categories?: Array<{ id: number; name: string }> | number[]
    products?: Array<{ id: number; name: string }> | number[]
    brands?: Array<{ id: number; name: string }> | number[]
    product_custom_field?: {
      name: string
      values: string[]
    }
    product_option?: {
      name: string
      values: string[]
      type: string
    }
    and?: Array<{
      not?: {
        and?: Array<{
          categories?: number[]
          brands?: number[]
          product_custom_field?: {
            name: string
            values: string[]
          }
          product_option?: {
            name: string
            values: string[]
            type: string
          }
        }>
      }
      categories?: number[]
      brands?: number[]
      product_custom_field?: {
        name: string
        values: string[]
      }
      product_option?: {
        name: string
        values: string[]
        type: string
      }
    }>
  }
}

export interface ComplexCondition {
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

// Extend the Rule type to include our custom properties
export interface ExtendedRule extends Rule {
  action?: Action
  apply_once?: boolean
  stop?: boolean
  condition: string | ComplexCondition
}

export interface Channel {
  id: number
  name: string
}



export interface CouponFormData {
  // Basic info
  name: string
  displayName: string
  codes?: string | { id?: string | number; code: string } | Array<string | { id?: string | number; code: string }>

  // Schedule
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  limitAvailability: boolean
  weekCount: number
  selectedWeekdays: string[]
  availabilityStartTime: string
  availabilityEndTime: string

  // Status
  status: Status 

  // Usage limits
  maxUses: string
  maxUsesPerCustomer: string
  minOrderCount: string

  // Customer targeting
  customerGroupIds: string
  excludedCustomerGroupIds: string

  // Discount configuration
  discountType: DiscountType,
  discountAmount: string
  excludeSaleItems: boolean
  strategy: string

  // Product targeting
  categories: string
  productId?: number
  brandId?: number

  // Other settings
  canBeUsedWithOtherPromotions: boolean
  overrideAutomatic: boolean
  quantity: string
  currencyCode: string
  appliesTo: string

  // Rules
  rules: ExtendedRule[]
  rewardType: RewardType | null
  shipping_address: {
    countries: {
      iso2_country_code: string
    }[]
  } | null

  // Targeting
  targetingRules: TargetingRule[]
  selectedCountries: Country[]

  // Channels
  channels: Channel[]
  selectedChannelIds: string[]
}

export interface CouponContextProps {
  formData: CouponFormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  generateCoupon: () => Promise<void>
  loading: boolean
  error: string | null
  couponCodes: string[]
  channels: Channel[]
  selectedChannelIds: string[]
  showChannelModal: boolean
  setShowChannelModal: (show: boolean) => void
  setSelectedChannelIds: React.Dispatch<React.SetStateAction<string[]>>
  addRule: (rule: Rule) => void
  removeRule: (index: number) => void
  updateRule: (index: number, rule: Rule) => void
  setFormData: React.Dispatch<React.SetStateAction<CouponFormData>>
  selectedZoneIds: Set<number>, setSelectedZoneIds: Dispatch<SetStateAction<Set<number>>>,

  // Additional methods for targeting
  addTargetingRule: () => void
  removeTargetingRule: (id: string) => void
  updateTargetingRule: (id: RuleTypeId, updates: Partial<TargetingRule>) => void

  // Methods for shipping destinations
  selectedCountries: Country[]
  setSelectedCountries: (countries: Country[]) => void

  // Methods for schedule
  updateSchedule: (
    updates: Partial<
      Pick<
        CouponFormData,
        | "startDate"
        | "startTime"
        | "endDate"
        | "endTime"
        | "limitAvailability"
        | "weekCount"
        | "selectedWeekdays"
        | "availabilityStartTime"
        | "availabilityEndTime"
      >
    >,
  ) => void
}