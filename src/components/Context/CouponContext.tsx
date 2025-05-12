"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Rule, Zone } from "@/types/rule-types"

// Types for shipping destinations
interface Country {
  id: number | string
  name: string
}

// Types for targeting rules
interface TargetingRule {
  id: string
  type: string | null
  condition: string
  value: string
  selectedItems?: any[]
}

// Types for rules
interface GiftItem {
  quantity: number
  product_id: number
  product_name?: string
}

interface Discount {
  percentage_amount?: string
  fixed_amount?: string
}

interface CartItemsAction {
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

interface Action {
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
interface FixedPriceSetAction {
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

// Extend the Rule type to include our custom properties
interface ExtendedRule extends Rule {
  action?: Action
  apply_once?: boolean
  stop?: boolean
  condition: string | ComplexCondition
}

interface Channel {
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
  status: "ENABLED" | "DISABLED"

  // Usage limits
  maxUses: string
  maxUsesPerCustomer: string
  minOrderCount: string

  // Customer targeting
  customerGroupIds: string
  excludedCustomerGroupIds: string

  // Discount configuration
  discountType: "percentage_discount" | "fixed_amount"
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
  rewardType: "tiered" | "stacked" | null

  // Targeting
  targetingRules: TargetingRule[]
  selectedCountries: Country[]

  // Channels
  channels: Channel[]
  selectedChannelIds: string[]
}

interface CouponContextProps {
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

  // Additional methods for targeting
  addTargetingRule: () => void
  removeTargetingRule: (id: string) => void
  updateTargetingRule: (id: string, updates: Partial<TargetingRule>) => void

  // Methods for shipping destinations
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

const CouponContext = createContext<CouponContextProps | undefined>(undefined)

export const CouponProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [couponCodes, setCouponCodes] = useState<string[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(["0"]) // Default to channel 1

  const [formData, setFormData] = useState<CouponFormData>({
    // Basic info
    name: "",
    displayName: "",
    codes: "", // Can be a string or an array of objects
    // Schedule
    startDate: new Date().toISOString(),
    startTime: "5:00 AM",
    endDate: "",
    endTime: "",
    limitAvailability: false,
    weekCount: 1,
    selectedWeekdays: [],
    availabilityStartTime: "12:00 AM",
    availabilityEndTime: "11:59 PM",

    // Status
    status: "ENABLED",

    // Usage limits
    maxUses: "",
    maxUsesPerCustomer: "",
    minOrderCount: "0",

    // Customer targeting
    customerGroupIds: "",
    excludedCustomerGroupIds: "",

    // Discount configuration
    discountType: "percentage_discount",
    discountAmount: "10",
    excludeSaleItems: true,
    strategy: "LEAST_EXPENSIVE",

    // Product targeting
    categories: "",

    // Other settings
    canBeUsedWithOtherPromotions: true,
    overrideAutomatic: false,
    quantity: "1",
    currencyCode: "*",
    appliesTo: "any",

    // Rules
    rules: [],
    rewardType: "stacked", // Default to stacked rewards

    // Targeting
    targetingRules: [],
    selectedCountries: [],

    // Channels
    channels: [],
    selectedChannelIds: ["0"], // Default to channel 1
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const addRule = (rule: Rule) => {
    // Check if rule with same ID already exists to prevent duplicates
    const existingRuleIndex = formData.rules.findIndex((r) => r.id === rule.id)

    if (existingRuleIndex >= 0) {
      // Update existing rule instead of adding a duplicate
      updateRule(existingRuleIndex, rule)
    } else {
      // Add new rule
      setFormData((prev) => ({
        ...prev,
        rules: [...prev.rules, rule as ExtendedRule],
      }))
    }
  }

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))
  }

  const updateRule = (index: number, rule: Rule) => {
    setFormData((prev) => {
      const newRules = [...prev.rules]
      newRules[index] = rule as ExtendedRule
      return { ...prev, rules: newRules }
    })
  }

  // Methods for targeting rules
  const addTargetingRule = () => {
    const newRule: TargetingRule = {
      id: `rule-${Date.now()}`,
      type: null,
      condition: "is",
      value: "",
    }

    setFormData((prev) => ({
      ...prev,
      targetingRules: [...prev.targetingRules, newRule],
    }))
  }

  const removeTargetingRule = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      targetingRules: prev.targetingRules.filter((rule) => rule.id !== id),
    }))
  }

  const updateTargetingRule = (id: string, updates: Partial<TargetingRule>) => {
    setFormData((prev) => ({
      ...prev,
      targetingRules: prev.targetingRules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)),
    }))
  }

  // Methods for shipping destinations
  const setSelectedCountries = (countries: Country[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedCountries: countries,
    }))
  }

  // Methods for schedule
  const updateSchedule = (
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
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  // Helper function to extract IDs from objects
  const extractIds = (items: Array<{ id: number; name: string }>): number[] => {
    return items.map((item) => item.id)
  }

  // Helper function to parse JSON string containing category objects
  const parseCategoryJson = (jsonString: string): number[] => {
    try {
      // Try to parse as a JSON array first
      if (jsonString.trim().startsWith("[") && jsonString.trim().endsWith("]")) {
        const parsed = JSON.parse(jsonString)
        return parsed.map((item: any) => Number(item.id))
      }

      // Try to parse as multiple JSON objects
      if (jsonString.includes('"id"')) {
        // It might be multiple JSON objects concatenated without being in an array
        const fixedValue = `[${jsonString}]`
        try {
          const parsed = JSON.parse(fixedValue)
          return parsed.map((item: any) => Number(item.id))
        } catch (e) {
          // If that fails, try to split by },{
          const categoryIds: number[] = []
          const jsonObjects = jsonString.split("},{")

          for (let i = 0; i < jsonObjects.length; i++) {
            let jsonStr = jsonObjects[i]
            if (i > 0) jsonStr = "{" + jsonStr
            if (i < jsonObjects.length - 1) jsonStr = jsonStr + "}"

            try {
              const obj = JSON.parse(jsonStr)
              if (obj && obj.id) {
                categoryIds.push(Number(obj.id))
              }
            } catch (e) {
              // Silent error - continue processing
            }
          }

          return categoryIds
        }
      }

      // If all else fails, try comma-separated list
      return jsonString
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id) && id > 0)
    } catch (e) {
      return []
    }
  }

  // Parse IDs from various formats
  const parseIds = (value: string): Array<{ id: number; name: string }> => {
    if (!value) return []

    try {
      // Try to parse as JSON first (for objects with id property)
      try {
        const parsed = JSON.parse(value)
        if (parsed && parsed.id) {
          return [{ id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }]
        }
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({
            id: Number(item.id),
            name: item.name || `Item ${item.id}`,
          }))
        }
      } catch (e) {
        // Not JSON, continue with comma parsing
      }

      // Parse comma-separated list
      return value
        .split(",")
        .map((item) => {
          // Try to extract id from JSON string if possible
          try {
            const parsed = JSON.parse(item.trim())
            return parsed && parsed.id
              ? { id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }
              : { id: Number(item.trim()), name: `Item ${item.trim()}` }
          } catch (e) {
            // Not JSON, just convert to number
            return { id: Number(item.trim()), name: `Item ${item.trim()}` }
          }
        })
        .filter((item) => !isNaN(item.id) && item.id > 0)
    } catch (e) {
      return []
    }
  }

  // Process inclusion rules
  const processInclusionRule = (inclusionRule: any) => {
    if (!inclusionRule) return { products: [1] } // Default to a valid product to avoid empty items error

    const result: any = {}

    // Process main inclusion rule
    if (inclusionRule.type === "individual" && inclusionRule.value) {
      const products = parseIds(inclusionRule.value)
      if (products.length > 0) {
        result.products = extractIds(products)
      } else {
        result.products = [1] // Default to a valid product if empty
      }
    } else if (inclusionRule.type === "category") {
      // Handle categories from selectedItems first (from the category selector)
      if (
        inclusionRule.selectedItems &&
        Array.isArray(inclusionRule.selectedItems) &&
        inclusionRule.selectedItems.length > 0
      ) {
        result.categories = inclusionRule.selectedItems.map((item: any) => Number(item.id))
      }
      // Also check value field as fallback
      else if (inclusionRule.value) {
        const categoryIds = parseCategoryJson(inclusionRule.value)
        if (categoryIds.length > 0) {
          result.categories = categoryIds
        } else {
          result.categories = [1] // Default to a valid category if empty
        }
      } else {
        result.categories = [1] // Default to a valid category if empty
      }
    } else if (inclusionRule.type === "brand" && inclusionRule.value) {
      const brands = parseIds(inclusionRule.value)
      if (brands.length > 0) {
        result.brands = extractIds(brands)
      } else {
        result.brands = [1] // Default to a valid brand if empty
      }

     


    } else if (inclusionRule.type === "all") {
      // For "all products", we need at least one product to satisfy the API
      result.products = [1]
    } else {
      // Default case to avoid empty items
      result.products = [1]
    }

    // Process additionalConditions if they exist
    if (
      inclusionRule.additionalConditions &&
      Array.isArray(inclusionRule.additionalConditions) &&
      inclusionRule.additionalConditions.length > 0
    ) {
      // Create an AND condition if we have both main condition and additional conditions
      if (Object.keys(result).length > 0) {
        const andConditions = [{ ...result }]

        // Process each additional condition
        for (const condition of inclusionRule.additionalConditions) {
          const additionalResult: any = {}

          if (condition.type === "individual" && condition.value) {
            const products = parseIds(condition.value)
            if (products.length > 0) {
              additionalResult.products = extractIds(products)
            } else {
              additionalResult.products = [1] // Default to a valid product if empty
            }
          } else if (condition.type === "category") {
            // Try to parse category value
            if (condition.value) {
              const categoryIds = parseCategoryJson(condition.value)
              if (categoryIds.length > 0) {
                additionalResult.categories = categoryIds
              } else {
                additionalResult.categories = [1] // Default to a valid category if empty
              }
            } else {
              additionalResult.categories = [1] // Default to a valid category if empty
            }
          } else if (condition.type === "brand" && condition.value) {
            const brands = parseIds(condition.value)
            if (brands.length > 0) {
              additionalResult.brands = extractIds(brands)
            } else {
              additionalResult.brands = [1] // Default to a valid brand if empty
            }
          } else {
            // Default case to avoid empty items
            additionalResult.products = [1]
          }

          if (Object.keys(additionalResult).length > 0) {
            andConditions.push(additionalResult)
          }
        }

        // If we have multiple conditions, return them as an AND
        if (andConditions.length > 1) {
          return { and: andConditions }
        }
      } else {
        // If we don't have a main condition, just process the first additional condition
        const condition = inclusionRule.additionalConditions[0]
        if (condition.type === "individual" && condition.value) {
          const products = parseIds(condition.value)
          if (products.length > 0) {
            result.products = extractIds(products)
          } else {
            result.products = [1] // Default to a valid product if empty
          }
        } else if (condition.type === "category") {
          // Try to parse category value
          if (condition.value) {
            const categoryIds = parseCategoryJson(condition.value)
            if (categoryIds.length > 0) {
              result.categories = categoryIds
            } else {
              result.categories = [1] // Default to a valid category if empty
            }
          } else {
            result.categories = [1] // Default to a valid category if empty
          }
        } else if (condition.type === "brand" && condition.value) {
          const brands = parseIds(condition.value)
          if (brands.length > 0) {
            result.brands = extractIds(brands)
          } else {
            result.brands = [1] // Default to a valid brand if empty
          }
        } else {
          // Default case to avoid empty items
          result.products = [1]
        }
      }
    }

    return Object.keys(result).length > 0 ? result : { products: [1] } // Ensure we always return a valid structure
  }

  // Process exclusion rules
  const processExclusionRules = (exclusionRules: any[]) => {
    if (!exclusionRules || !Array.isArray(exclusionRules) || exclusionRules.length === 0) {
      return null
    }

    const exclusionConditions: any[] = []

    for (const exclusion of exclusionRules) {
      if (!exclusion) continue

      const condition: any = {}

      if (exclusion.type === "individual" && exclusion.value) {
        const products = parseIds(exclusion.value)
        if (products.length > 0) {
          condition.products = extractIds(products)
        }
      } else if (exclusion.type === "category") {
        try {
          // Try to parse the value as JSON string containing multiple category objects
          if (exclusion.value && typeof exclusion.value === "string") {
            const categoryIds = parseCategoryJson(exclusion.value)
            if (categoryIds.length > 0) {
              condition.categories = categoryIds
            }
          }

          // If we have selectedItems, use those
          if (exclusion.selectedItems && Array.isArray(exclusion.selectedItems) && exclusion.selectedItems.length > 0) {
            const selectedIds = exclusion.selectedItems.map((item: any) => Number(item.id))
            if (!condition.categories) {
              condition.categories = selectedIds
            } else {
              // Merge with existing categories and remove duplicates
              condition.categories = [...new Set([...condition.categories, ...selectedIds])]
            }
          }
        } catch (e) {
          // Silent error - continue processing
        }
      } else if (exclusion.type === "brand" && exclusion.value) {
        const brands = parseIds(exclusion.value)
        if (brands.length > 0) {
          condition.brands = extractIds(brands)
        }
      }

      if (Object.keys(condition).length > 0) {
        exclusionConditions.push(condition)
      }
    }

    if (exclusionConditions.length === 0) {
      return null
    }

    // For multiple exclusion conditions, combine with AND
    if (exclusionConditions.length > 1) {
      return { and: exclusionConditions }
    }

    // For single exclusion condition, return it directly
    return exclusionConditions[0]
  }

  // Create complex condition for rule
  const createComplexCondition = (rule: any) => {
    const condition: any = {
      cart: {
        minimum_quantity: rule.config?.reachingQuantity || 1,
        items: {},
      },
    }

    const inclusionItems = rule.config?.inclusionRule
      ? processInclusionRule(rule.config.inclusionRule)
      : { products: [1] }
    const exclusionItems = rule.config?.exclusionRules ? processExclusionRules(rule.config.exclusionRules) : null

    if (inclusionItems && exclusionItems) {
      condition.cart.items.and = []

      // Add inclusion items first
      if (inclusionItems.all) {
        // For "all products", we need at least one product to satisfy the API
        condition.cart.items.products = [1]
      } else if (inclusionItems.and) {
        // If inclusion items already has an AND condition, add each item separately
        condition.cart.items.and.push(...inclusionItems.and)
      } else {
        condition.cart.items.and.push(inclusionItems)
      }

      // Add exclusion as NOT condition with AND inside
      if (exclusionItems) {
        condition.cart.items.and.push({
          not: exclusionItems,
        })
      }
    } else if (inclusionItems) {
      // Only inclusion rules
      if (inclusionItems.all) {
        // For "all products", we need at least one product to satisfy the API
        condition.cart.items.products = [1]
      } else if (inclusionItems.and) {
        // If inclusion items has an AND condition, use it directly
        condition.cart.items.and = inclusionItems.and
      } else {
        Object.assign(condition.cart.items, inclusionItems)
      }
    } else if (exclusionItems) {
      // Only exclusion rules - wrap in NOT
      condition.cart.items.not = exclusionItems
      // Also add a default product to satisfy the API requirement
      condition.cart.items.products = [1]
    } else {
      // No rules at all, add a default product
      condition.cart.items.products = [1]
    }

    return condition
  }

  // Update the generateCoupon function to properly convert UI selections to the BigCommerce API format
  const generateCoupon = async () => {
    setLoading(true)
    setError(null)
    setCouponCodes([])

    try {
      // Format date with timezone for BigCommerce
      const formatDateWithTimezone = (dateString: string, timeString: string) => {
        if (!dateString) return null

        // Create date object from the ISO string
        const dateObj = new Date(dateString)

        // Extract date components (local time)
        const year = dateObj.getFullYear()
        const month = dateObj.getMonth()
        const day = dateObj.getDate()

        // Default to midnight if no time provided
        let hours = 0
        let minutes = 0

        if (timeString) {
          // Parse time string (format: "h:mm AM/PM")
          const [timePart, period] = timeString.split(" ")
          const [hoursStr, minutesStr] = timePart.split(":")

          hours = Number.parseInt(hoursStr, 10)
          minutes = Number.parseInt(minutesStr || "0", 10)

          // Convert 12-hour format to 24-hour
          if (period === "PM" && hours < 12) {
            hours += 12
          } else if (period === "AM" && hours === 12) {
            hours = 0
          }
        }

        // Create new date in local timezone
        const localDate = new Date(year, month, day, hours, minutes, 0)

        // Format the date components
        const pad = (num: number) => num.toString().padStart(2, "0")

        const formattedDate = [localDate.getFullYear(), pad(localDate.getMonth() + 1), pad(localDate.getDate())].join(
          "-",
        )

        const formattedTime = [
          pad(localDate.getHours()),
          pad(localDate.getMinutes()),
          pad(localDate.getSeconds()),
        ].join(":")

        // Get timezone offset in minutes and convert to ±HH:MM
        const offset = localDate.getTimezoneOffset()
        const offsetHours = Math.floor(Math.abs(offset) / 60)
        const offsetMinutes = Math.abs(offset) % 60
        const offsetSign = offset > 0 ? "-" : "+" // Note the sign inversion

        return `${formattedDate}T${formattedTime}${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`
      }

      const formatTimeForSchedule = (timeString: string) => {
        if (!timeString) return "00:00:00"

        const [timePart, period] = timeString.split(" ")
        const [hoursStr, minutesStr] = timePart.split(":")

        let hours = Number.parseInt(hoursStr, 10)
        const minutes = Number.parseInt(minutesStr || "0", 10)

        // Convert 12-hour format to 24-hour
        if (period === "PM" && hours < 12) hours += 12
        if (period === "AM" && hours === 12) hours = 0

        return [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), "00"].join(":")
      }

      const convertRulesToApiFormat = (rules: ExtendedRule[]) => {
  return rules.map((rule) => {
    // Start with a basic rule structure
    const apiRule: any = {
      apply_once: rule.apply_once !== undefined ? rule.apply_once : true,
      stop: rule.stop !== undefined ? rule.stop : false,
      condition: {},
      action: {}, // Make sure action is an object, not an array
    }

    // Use the condition directly if it's already in the correct format
    if (typeof rule.condition === 'object') {
      apiRule.condition = rule.condition
    } else {
      // Create a condition based on the rule type
      apiRule.condition = createComplexCondition(rule)
    }

    // Use the action directly if it's already in the correct format
    if (rule.action) {
      apiRule.action = rule.action
    } else {
      // Create an action based on the rule type
      if (rule.reward === 'gift_cart' && rule.config?.giftProduct) {
        // Gift item reward
        let productId: number
        let productName = ''

        if (typeof rule.config.giftProduct === 'object' && rule.config.giftProduct.id) {
          productId = rule.config.giftProduct.id
          productName = rule.config.giftProduct.name || `Product ${productId}`
        } else if (typeof rule.config.giftProduct === 'string') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(rule.config.giftProduct)
            productId = parsed.id || Number(rule.config.giftProduct)
            productName = parsed.name || `Product ${productId}`
          } catch (e) {
            // Not JSON, just convert to number
            productId = Number(rule.config.giftProduct)
            productName = `Product ${productId}`
          }
        } else {
          productId = 0 // Default fallback
        }

        if (productId > 0) {
          apiRule.action.gift_item = {
            quantity: rule.config.giftQuantity || 1,
            product_id: productId,
            product_name: productName,
          }
        }
      } else if (rule.reward === 'discount_products') {
        // Product discount reward
        apiRule.action.cart_items = {
          discount: {},
          strategy: rule.config?.appliedTarget?.toUpperCase() || 'LEAST_EXPENSIVE',
          add_free_item: false,
          as_total: rule.config?.discountFrom === 'total_price' || false,
          include_items_considered_by_condition: rule.config?.includeConditionProducts || false,
          exclude_items_on_sale: !(rule.config?.includeOnSale || false),
          quantity: rule.config?.appliedQuantity || 1,
          items: {}, // Initialize items object
        }

        // Set discount type and amount
        if (rule.config?.discountType === 'percentage') {
          apiRule.action.cart_items.discount.percentage_amount = String(rule.config.discountValue || 10)
        } else {
          apiRule.action.cart_items.discount.fixed_amount = String(rule.config.discountValue || 10)
        }

        // Process reward inclusion and exclusion rules for cart_items
        if (rule.config?.rewardInclusionRule || rule.config?.rewardExclusionRules) {
          // Process reward inclusion rule
          if (rule.config.rewardInclusionRule) {
            const inclusionItems = processInclusionRule(rule.config.rewardInclusionRule)

            if (inclusionItems) {
              if (inclusionItems.all) {
                // For "all products", we need at least one product to satisfy the API
                apiRule.action.cart_items.items.products = [1]
              } else if (inclusionItems.and) {
                // If inclusion items has an AND condition, use it directly
                apiRule.action.cart_items.items.and = inclusionItems.and
              } else {
                // Add inclusion items directly
                Object.assign(apiRule.action.cart_items.items, inclusionItems)
              }
            } else {
              // Default to a valid product if no inclusion items
              apiRule.action.cart_items.items.products = [1]
            }
          } else {
            // Default to a valid product if no inclusion rule
            apiRule.action.cart_items.items.products = [1]
          }

          // Process reward exclusion rules
          if (rule.config.rewardExclusionRules && rule.config.rewardExclusionRules.length > 0) {
            const exclusionItems = processExclusionRules(rule.config.rewardExclusionRules)

            if (exclusionItems) {
              if (Object.keys(apiRule.action.cart_items.items).length > 0) {
                // If we already have inclusion items, add exclusion as NOT
                if (!apiRule.action.cart_items.items.and) {
                  // Convert to AND structure if not already
                  const currentItems = { ...apiRule.action.cart_items.items }
                  apiRule.action.cart_items.items = {
                    and: [currentItems],
                  }
                }

                // Add exclusion as NOT condition
                apiRule.action.cart_items.items.and.push({
                  not: exclusionItems,
                })
              } else {
                // Only exclusion rules - wrap in NOT and add a default product
                apiRule.action.cart_items.items = {
                  not: exclusionItems,
                  products: [1], // Default product to satisfy API
                }
              }
            }
          }
        } else {
          // No inclusion or exclusion rules, add a default product
          apiRule.action.cart_items.items.products = [1]
        }
      } else if (rule.reward === 'free_shipping') {
        // Free shipping reward
        apiRule.action.shipping = {
          free_shipping: true,
          zone_ids: '*',
        }

        if (
          rule.config?.shippingZoneType === 'selected' &&
          rule.config.selectedZones &&
          rule.config.selectedZones.length > 0
        ) {
          apiRule.action.shipping.zone_ids = rule.config.selectedZones.map((zone: Zone) => zone.zoneid)
          apiRule.action.shipping.zone_names = rule.config.selectedZones.map((zone: Zone) => zone.name)
        }
      } else if (rule.reward === 'discount_subtotal') {
        // Cart subtotal discount reward
        apiRule.action.cart = {
          discount: {},
        }

        // Set discount type and amount
        if (rule.config?.discountType === 'percentage') {
          apiRule.action.cart.discount.percentage_amount = String(rule.config.discountValue || 10)
        } else {
          apiRule.action.cart.discount.fixed_amount = String(rule.config.discountValue || 10)
        }
      } else if (rule.reward === "fixed_price") {
              // Fixed price reward
              apiRule.action.fixed_price_set = {
                fixed_price: String(rule.config?.price || 0),
                quantity: rule.config?.quantity || 1,
                strategy: (rule.config?.applyTo || "Least expensive").toUpperCase().replace(" ", "_"),
                exclude_items_on_sale: !(rule.config?.includeOnSale || false),
                include_items_considered_by_condition: rule.config?.includeConditionProducts || false,
                items: {}, // Initialize items object
              }
            // Set per cart application
              if (rule.config?.perCart === "unlimited") {
                apiRule.apply_once = false
              } else {
                apiRule.apply_once = true
              }
        // Process reward inclusion and exclusion rules for fixed_price_set
        if (rule.config?.rewardInclusionRule || rule.config?.rewardExclusionRules) {
          // Process reward inclusion rule
          if (rule.config.rewardInclusionRule) {
            const inclusionItems = processInclusionRule(rule.config.rewardInclusionRule)

            if (inclusionItems) {
              if (inclusionItems.all) {
                // For "all products", we need at least one product to satisfy the API
                apiRule.action.fixed_price_set.items.products = [1]
              } else if (inclusionItems.and) {
                // If inclusion items has an AND condition, use it directly
                apiRule.action.fixed_price_set.items.and = inclusionItems.and
              } else {
                // Add inclusion items directly
                Object.assign(apiRule.action.fixed_price_set.items, inclusionItems)
              }
            } else {
              // Default to a valid product if no inclusion items
              apiRule.action.fixed_price_set.items.products = [1]
            }
          } else {
            // Default to a valid product if no inclusion rule
            apiRule.action.fixed_price_set.items.products = [1]
          }

          // Process reward exclusion rules
          if (rule.config.rewardExclusionRules && rule.config.rewardExclusionRules.length > 0) {
            const exclusionItems = processExclusionRules(rule.config.rewardExclusionRules)

            if (exclusionItems) {
              if (Object.keys(apiRule.action.fixed_price_set.items).length > 0) {
                // If we already have inclusion items, add exclusion as NOT
                if (!apiRule.action.fixed_price_set.items.and) {
                  // Convert to AND structure if not already
                  const currentItems = { ...apiRule.action.fixed_price_set.items }
                  apiRule.action.fixed_price_set.items = {
                    and: [currentItems],
                  }
                }

                // Add exclusion as NOT condition
                apiRule.action.fixed_price_set.items.and.push({
                  not: exclusionItems,
                })
              } else {
                // Only exclusion rules - wrap in NOT and add a default product
                apiRule.action.fixed_price_set.items = {
                  not: exclusionItems,
                  products: [1], // Default product to satisfy API
                }
              }
            }
          }
        } else {
          // No inclusion or exclusion rules, add a default product
          apiRule.action.fixed_price_set.items.products = [1]
        }

        // Handle custom fields if they exist
        if (rule.config?.customFields) {
          if (!apiRule.action.fixed_price_set.items.and) {
            apiRule.action.fixed_price_set.items.and = []
          }

          rule.config.customFields.forEach((field: any) => {
            apiRule.action.fixed_price_set.items.and.push({
              product_custom_field: {
                name: field.name,
                values: field.values,
              },
            })
          })
        }

        // Handle product options if they exist
        if (rule.config?.productOptions) {
          if (!apiRule.action.fixed_price_set.items.and) {
            apiRule.action.fixed_price_set.items.and = []
          }

          rule.config.productOptions.forEach((option: any) => {
            apiRule.action.fixed_price_set.items.and.push({
              product_option: {
                name: option.name,
                values: option.values,
                type: option.type || 'string_match',
              },
            })
          })
        }
      }
    }

    // Convert complex objects to simple IDs for API compatibility
    const processCategories = (obj: any) => {
      if (obj.categories && Array.isArray(obj.categories)) {
        obj.categories = obj.categories.map((c: any) => (typeof c === 'object' ? c.id : c))
      }
      return obj
    }

          // Process categories in main items
          if (apiRule.condition?.cart?.items) {
            apiRule.condition.cart.items = processCategories(apiRule.condition.cart.items)
          }

          // Process categories in products
          if (apiRule.condition?.cart?.items?.products && Array.isArray(apiRule.condition.cart.items.products)) {
            if (typeof apiRule.condition.cart.items.products[0] === "object") {
              apiRule.condition.cart.items.products = apiRule.condition.cart.items.products.map((p: any) => p.id)
            }
          }

          // Process categories in brands
          if (apiRule.condition?.cart?.items?.brands && Array.isArray(apiRule.condition.cart.items.brands)) {
            if (typeof apiRule.condition.cart.items.brands[0] === "object") {
              apiRule.condition.cart.items.brands = apiRule.condition.cart.items.brands.map((b: any) => b.id)
            }
          }

          // Handle not conditions
          if (apiRule.condition?.cart?.items?.not) {
            apiRule.condition.cart.items.not = processCategories(apiRule.condition.cart.items.not)

            if (apiRule.condition.cart.items.not.products && Array.isArray(apiRule.condition.cart.items.not.products)) {
              if (typeof apiRule.condition.cart.items.not.products[0] === "object") {
                apiRule.condition.cart.items.not.products = apiRule.condition.cart.items.not.products.map(
                  (p: any) => p.id,
                )
              }
            }

            if (apiRule.condition.cart.items.not.brands && Array.isArray(apiRule.condition.cart.items.not.brands)) {
              if (typeof apiRule.condition.cart.items.not.brands[0] === "object") {
                apiRule.condition.cart.items.not.brands = apiRule.condition.cart.items.not.brands.map((b: any) => b.id)
              }
            }

            // Handle nested and inside not
            if (apiRule.condition.cart.items.not.and && Array.isArray(apiRule.condition.cart.items.not.and)) {
              apiRule.condition.cart.items.not.and = apiRule.condition.cart.items.not.and.map((nestedAndItem: any) => {
                const newNestedAndItem = processCategories({ ...nestedAndItem })

                // Process brands in nested and condition
                if (newNestedAndItem.brands && Array.isArray(newNestedAndItem.brands)) {
                  if (typeof newNestedAndItem.brands[0] === "object") {
                    newNestedAndItem.brands = newNestedAndItem.brands.map((b: any) => b.id)
                  }
                }

                return newNestedAndItem
              })
            }
          }

          // Handle and conditions
          if (apiRule.condition?.cart?.items?.and && Array.isArray(apiRule.condition.cart.items.and)) {
            apiRule.condition.cart.items.and = apiRule.condition.cart.items.and.map((andItem: any) => {
              const newAndItem = processCategories({ ...andItem })

              // Process products in and condition
              if (newAndItem.products && Array.isArray(newAndItem.products)) {
                if (typeof newAndItem.products[0] === "object") {
                  newAndItem.products = newAndItem.products.map((p: any) => p.id)
                }
              }

              // Process brands in and condition
              if (newAndItem.brands && Array.isArray(newAndItem.brands)) {
                if (typeof newAndItem.brands[0] === "object") {
                  newAndItem.brands = newAndItem.brands.map((b: any) => b.id)
                }
              }

              // Process not conditions inside and condition
              if (newAndItem.not) {
                newAndItem.not = processCategories(newAndItem.not)

                if (newAndItem.not.products && Array.isArray(newAndItem.not.products)) {
                  if (typeof newAndItem.not.products[0] === "object") {
                    newAndItem.not.products = newAndItem.not.products.map((p: any) => p.id)
                  }
                }

                if (newAndItem.not.brands && Array.isArray(newAndItem.not.brands)) {
                  if (typeof newAndItem.not.brands[0] === "object") {
                    newAndItem.not.brands = newAndItem.not.brands.map((b: any) => b.id)
                  }
                }

                // Handle nested and inside not
                if (newAndItem.not.and && Array.isArray(newAndItem.not.and)) {
                  newAndItem.not.and = newAndItem.not.and.map((nestedAndItem: any) => {
                    const newNestedAndItem = processCategories({ ...nestedAndItem })

                    // Process brands in nested and condition
                    if (newNestedAndItem.brands && Array.isArray(newNestedAndItem.brands)) {
                      if (typeof newNestedAndItem.brands[0] === "object") {
                        newNestedAndItem.brands = newNestedAndItem.brands.map((b: any) => b.id)
                      }
                    }

                    return newNestedAndItem
                  })
                }
              }

              return newAndItem
            })
          }

          return apiRule
        })
      }

      // Prepare the payload
      const payload = {
        name: formData.name || "New Coupon",
        channels: selectedChannelIds[0] === "0" ? [] : selectedChannelIds.map((id) => ({ id: Number(id) })),

        codes: {
          code: formData.codes || "",
          max_uses_per_customer: formData.maxUsesPerCustomer || null,
        },
        created_from: "react_ui",
        customer: {
          group_ids: formData.customerGroupIds
            ? formData.customerGroupIds.split(",").map((id) => Number(id.trim()))
            : [],
          minimum_order_count: Number(formData.minOrderCount) || 0,
          excluded_group_ids: formData.excludedCustomerGroupIds
            ? formData.excludedCustomerGroupIds.split(",").map((id) => Number(id.trim()))
            : [],
          segments: null,
        },
        rules: convertRulesToApiFormat(formData.rules),
        currency_code: formData.currencyCode || "GBP",
        redemption_type: "COUPON",
        shipping_address:
          formData.selectedCountries?.length > 0
            ? {
                countries: formData.selectedCountries.map((country) => ({
                  iso2_country_code: country.id || country.name?.toUpperCase(),
                })),
              }
            : null,
        current_uses: 0,
        max_uses: formData.maxUses ? Number(formData.maxUses) : null,
        start_date: formatDateWithTimezone(formData.startDate, formData.startTime),
        end_date: formData.endDate ? formatDateWithTimezone(formData.endDate, formData.endTime) : null,
        schedule: formData.limitAvailability
          ? {
              week_count: formData.weekCount,
              selected_weekdays: formData.selectedWeekdays,
              availability_start_time: formatTimeForSchedule(formData.availabilityStartTime),
              availability_end_time: formatTimeForSchedule(formData.availabilityEndTime),
            }
          : null,
        status: formData.status,
        can_be_used_with_other_promotions: formData.canBeUsedWithOtherPromotions,
        coupon_overrides_automatic_when_offering_higher_discounts: formData.overrideAutomatic,
        display_name: formData.displayName,
      }

      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          quantity: Number(formData.quantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create coupon")
      }

      setCouponCodes(data.coupon || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Coupon generation error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch channels when needed
    const fetchChannels = async () => {
      try {
        const response = await fetch("/api/channels")
        const data = await response.json()
        setChannels(data?.data || [])
      } catch (error) {
        console.error("Failed to fetch channels:", error)
      }
    }

    fetchChannels()
  }, [])

  return (
    <CouponContext.Provider
      value={{
        formData,
        handleChange,
        handleCheckboxChange,
        generateCoupon,
        loading,
        error,
        couponCodes,
        channels,
        selectedChannelIds,
        setSelectedChannelIds,
        showChannelModal,
        setShowChannelModal,
        addRule,
        removeRule,
        updateRule,
        setFormData,
        addTargetingRule,
        removeTargetingRule,
        updateTargetingRule,
        setSelectedCountries,
        updateSchedule,
      }}
    >
      {children}
    </CouponContext.Provider>
  )
}

export const useCouponContext = () => {
  const context = useContext(CouponContext)
  if (!context) {
    throw new Error("useCouponContext must be used within a CouponProvider")
  }
  return context
}
