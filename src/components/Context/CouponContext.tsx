"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Zone } from "@/types/rule-types"

// Types for shipping destinations
interface Country {
  id: number | string
  name: string
}

// Types for targeting rules
interface TargetingRule {
  id: string
  type: string
  condition: string
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

interface Condition {
  cart: {
    items: {
      products?: Array<{ id: number; name: string }> | number[]
      categories?: Array<{ id: number; name: string }> | number[]
      brands?: Array<{ id: number; name: string }> | number[]
      not?: {
        brands?: Array<{ id: number; name: string }> | number[]
        categories?: Array<{ id: number; name: string }> | number[]
        products?: Array<{ id: number; name: string }> | number[]
      }
      and?: Array<{
        products?: Array<{ id: number; name: string }> | number[]
        categories?: Array<{ id: number; name: string }> | number[]
        brands?: Array<{ id: number; name: string }> | number[]
        not?: {
          products?: Array<{ id: number; name: string }> | number[]
          categories?: Array<{ id: number; name: string }> | number[]
          brands?: Array<{ id: number; name: string }> | number[]
        }
      }>
    }
    minimum_quantity: number
    subtotal?: {
      min_amount: number
    }
  }
}

interface Rule {
  action: Action
  apply_once: boolean
  stop: boolean
  condition: Condition | string
  config?: any
  reward?: string
  id?: string
  type?: string
}

interface Channel {
  id: number
  name: string
}

interface CouponFormData {
  // Basic info
  name: string
  displayName: string

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
  rules: Rule[]
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
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([])

  const [formData, setFormData] = useState<CouponFormData>({
    // Basic info
    name: "",
    displayName: "",

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
    rewardType: null,

    // Targeting
    targetingRules: [],
    selectedCountries: [],

    // Channels
    channels: [],
    selectedChannelIds: [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

const addRule = (rule:Rule) => {
  console.log("Adding rule:", rule); // Debug log
  setFormData((prev) => ({
    ...prev,
    rules: [...prev.rules, rule],
  }));
};


  useEffect(()=>{
  console.log("Rules in Form",formData.rules)
  },[formData.rules])

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))
  }

  const updateRule = (index: number, rule: Rule) => {
    setFormData((prev) => {
      const newRules = [...prev.rules]
      newRules[index] = rule
      return { ...prev, rules: newRules }
    })
  }

  // Methods for targeting rules
  const addTargetingRule = () => {
    const newRule: TargetingRule = {
      id: `rule-${Date.now()}`,
      type: "",
      condition: "is",
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

  // Initialize with default rules if none exist
  // useEffect(() => {
  //   if (formData.rules.length === 0) {
  //     // Add default rules
  //     const defaultRules: Rule[] = [
  //       {
  //         action: {
  //           cart_items: {
  //             discount: {
  //               percentage_amount: "10",
  //             },
  //             strategy: "LEAST_EXPENSIVE",
  //             add_free_item: false,
  //             as_total: false,
  //             include_items_considered_by_condition: true,
  //             exclude_items_on_sale: false,
  //             quantity: 1,
  //           },
  //         },
  //         apply_once: true,
  //         stop: true,
  //         condition: {
  //           cart: {
  //             items: {
  //               products: [
  //                 { id: 695, name: "Sample Product 1" },
  //                 { id: 694, name: "Sample Product 2" },
  //               ],
  //             },
  //             minimum_quantity: 1,
  //           },
  //         },
  //       },
  //       {
  //         action: {
  //           gift_item: {
  //             quantity: 1,
  //             product_id: 697,
  //             product_name: "Gift Product",
  //           },
  //         },
  //         apply_once: true,
  //         stop: true,
  //         condition: {
  //           cart: {
  //             items: {
  //               products: [{ id: 695, name: "Sample Product 1" }],
  //             },
  //             minimum_quantity: 1,
  //           },
  //         },
  //       },
  //       {
  //         action: {
  //           gift_item: {
  //             quantity: 1,
  //             product_id: 697,
  //             product_name: "Gift Product",
  //           },
  //         },
  //         apply_once: true,
  //         stop: true,
  //         condition: {
  //           cart: {
  //             items: {
  //               not: {
  //                 brands: [{ id: 38, name: "Sample Brand" }],
  //               },
  //             },
  //             minimum_quantity: 6,
  //           },
  //         },
  //       },
  //       {
  //         action: {
  //           gift_item: {
  //             quantity: 1,
  //             product_id: 697,
  //             product_name: "Gift Product",
  //           },
  //         },
  //         apply_once: true,
  //         stop: true,
  //         condition: {
  //           cart: {
  //             items: {
  //               products: [{ id: 697, name: "Gift Product" }],
  //             },
  //             minimum_quantity: 1,
  //           },
  //         },
  //       },
  //     ]

  //     setFormData((prev) => ({
  //       ...prev,
  //       rules: defaultRules,
  //     }))
  //   }
  // }, [])

  // Helper function to parse product, category, or brand IDs from a string
  const parseIds = (value: string): Array<{ id: number; name: string }> => {
    if (!value) return []

    try {
      // Try to parse as JSON first (for objects with id property)
      try {
        const parsed = JSON.parse(value)
        if (parsed.id) {
          return [{ id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }]
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
            return parsed.id
              ? { id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }
              : { id: Number(item.trim()), name: `Item ${item.trim()}` }
          } catch (e) {
            // Not JSON, just convert to number
            return { id: Number(item.trim()), name: `Item ${item.trim()}` }
          }
        })
        .filter((item) => !isNaN(item.id) && item.id > 0)
    } catch (e) {
      console.error("Error parsing IDs:", e)
      return []
    }
  }

  // Helper function to process inclusion rules
  const processInclusionRule = (inclusionRule: any) => {
    if (!inclusionRule) return null

    const result: any = {}

    if (inclusionRule.type === "individual" && inclusionRule.value) {
      const products = parseIds(inclusionRule.value)
      if (products.length > 0) {
        result.products = products
      }
    } else if (inclusionRule.type === "category" && inclusionRule.value) {
      const categories = parseIds(inclusionRule.value)
      if (categories.length > 0) {
        result.categories = categories
      }
    } else if (inclusionRule.type === "brand" && inclusionRule.value) {
      const brands = parseIds(inclusionRule.value)
      if (brands.length > 0) {
        result.brands = brands
      }
    } else if (inclusionRule.type === "all") {
      // No specific items for "all" type
      return { all: true }
    }

    return Object.keys(result).length > 0 ? result : null
  }

  // Helper function to process exclusion rules
  const processExclusionRules = (exclusionRules: any[]) => {
    if (!exclusionRules || !Array.isArray(exclusionRules) || exclusionRules.length === 0) {
      return null
    }

    const notConditions: any = {}

    for (const exclusion of exclusionRules) {
      if (!exclusion) continue

      if (exclusion.type === "individual" && exclusion.value) {
        const products = parseIds(exclusion.value)
        if (products.length > 0) {
          if (!notConditions.products) {
            notConditions.products = []
          }
          notConditions.products.push(...products)
        }
      } else if (exclusion.type === "category" && exclusion.value) {
        const categories = parseIds(exclusion.value)
        if (categories.length > 0) {
          if (!notConditions.categories) {
            notConditions.categories = []
          }
          notConditions.categories.push(...categories)
        }
      } else if (exclusion.type === "brand" && exclusion.value) {
        const brands = parseIds(exclusion.value)
        if (brands.length > 0) {
          if (!notConditions.brands) {
            notConditions.brands = []
          }
          notConditions.brands.push(...brands)
        }
      }
    }

    return Object.keys(notConditions).length > 0 ? notConditions : null
  }

  // Update the generateCoupon function to properly convert UI selections to the BigCommerce API format
  const generateCoupon = async () => {
    setLoading(true)
    setError(null)
    setCouponCodes([])

    try {
      // Format date with timezone for BigCommerce
      const formatDateWithTimezone = (date: string) => {
        if (!date) return new Date().toISOString()

        const dateObj = new Date(date)
        // Format with timezone offset
        const offset = dateObj.getTimezoneOffset()
        const offsetHours = Math.abs(Math.floor(offset / 60))
          .toString()
          .padStart(2, "0")
        const offsetMinutes = Math.abs(offset % 60)
          .toString()
          .padStart(2, "0")
        const offsetSign = offset <= 0 ? "+" : "-"
        return dateObj.toISOString().replace(/\.\d{3}Z$/, `${offsetSign}${offsetHours}:${offsetMinutes}`)
      }

      // Convert UI rules to BigCommerce API format
      const convertRulesToApiFormat = (rules: Rule[]) => {
        return rules.map((rule) => {
          // Start with a basic rule structure
          const apiRule: any = {
            apply_once: rule.config?.frequency === "once" || true,
            stop: rule.config?.stop || true,
            condition: {
              cart: {
                minimum_quantity: 1,
                items: {},
              },
            },
            action: {}, // Make sure action is an object, not an array
          }

          // Process condition based on rule type
          if (typeof rule.condition === "string") {
            if (rule.condition === "buys_products") {
              // Set minimum quantity from config if available
              apiRule.condition.cart.minimum_quantity = rule.config?.reachingQuantity || 1

              // Process inclusion rules
              const inclusionItems = rule.config?.inclusionRule ? processInclusionRule(rule.config.inclusionRule) : null
              const exclusionItems = rule.config?.exclusionRules
                ? processExclusionRules(rule.config.exclusionRules)
                : null

              // If we have both inclusion and exclusion rules, use an "and" condition
              if (inclusionItems && exclusionItems) {
                apiRule.condition.cart.items.and = []

                // Add inclusion items
                if (inclusionItems.all) {
                  // For "all products", we don't need to specify any items
                } else {
                  apiRule.condition.cart.items.and.push(inclusionItems)
                }

                // Add exclusion items as a "not" condition
                apiRule.condition.cart.items.and.push({ not: exclusionItems })
              } else if (inclusionItems) {
                // Only inclusion rules
                if (inclusionItems.all) {
                  // For "all products", we don't need to specify any items
                } else {
                  Object.assign(apiRule.condition.cart.items, inclusionItems)
                }
              } else if (exclusionItems) {
                // Only exclusion rules
                apiRule.condition.cart.items.not = exclusionItems
              }

              // Handle additional conditions if they exist
              if (
                rule.config?.inclusionRule?.additionalConditions &&
                Array.isArray(rule.config.inclusionRule.additionalConditions) &&
                rule.config.inclusionRule.additionalConditions.length > 0
              ) {
                // If we already have an "and" condition, add to it
                if (!apiRule.condition.cart.items.and) {
                  apiRule.condition.cart.items.and = []

                  // If we have existing items, add them to the "and" array first
                  if (Object.keys(apiRule.condition.cart.items).length > 0 && !apiRule.condition.cart.items.not) {
                    const existingItems = { ...apiRule.condition.cart.items }
                    delete existingItems.and
                    if (Object.keys(existingItems).length > 0) {
                      apiRule.condition.cart.items.and.push(existingItems)
                    }

                    // Clear the original items object
                    Object.keys(apiRule.condition.cart.items).forEach((key) => {
                      if (key !== "and") {
                        delete apiRule.condition.cart.items[key]
                      }
                    })
                  }
                }

                // Process each additional condition
                for (const condition of rule.config.inclusionRule.additionalConditions) {
                  const additionalItems = processInclusionRule(condition)
                  if (additionalItems && !additionalItems.all) {
                    apiRule.condition.cart.items.and.push(additionalItems)
                  }
                }
              }
            } else if (rule.condition === "reaches_subtotal") {
              // Set minimum subtotal
              apiRule.condition.cart.subtotal = {
                min_amount: rule.config?.minimumSpend || 0,
              }
              delete apiRule.condition.cart.items
            } else if (rule.condition === "no_conditions") {
              // No specific conditions needed
              delete apiRule.condition.cart.items
            }
          } else if (typeof rule.condition === "object") {
            // If condition is already in the correct format, use it directly
            apiRule.condition = rule.condition
          }

          // Process reward based on rule type
          if (rule.reward === "gift_cart" && rule.config?.giftProduct) {
            // Gift item reward
            let productId: number
            let productName = ""

            if (typeof rule.config.giftProduct === "object" && rule.config.giftProduct.id) {
              productId = rule.config.giftProduct.id
              productName = rule.config.giftProduct.name || `Product ${productId}`
            } else if (typeof rule.config.giftProduct === "string") {
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
          } else if (rule.reward === "free_shipping") {
            // Free shipping reward
            apiRule.action.shipping = {
              free_shipping: true,
            }

            // Add shipping zones if specified
            if (
              rule.config?.shippingZoneType === "selected" &&
              rule.config.selectedZones &&
              Array.isArray(rule.config.selectedZones) &&
              rule.config.selectedZones.length > 0
            ) {
              apiRule.action.shipping.zone_ids = rule.config.selectedZones
                .filter((zone: Zone) => zone && zone.zoneid)
                .map((zone: Zone) => zone.zoneid)

              // Also store zone names for display purposes
              apiRule.action.shipping.zone_names = rule.config.selectedZones
                .filter((zone: Zone) => zone && zone.name)
                .map((zone: Zone) => zone.name)
            }
          } else if (rule.reward === "discount_products") {
            // Product discount reward
            apiRule.action.cart_items = {
              discount: {},
              strategy: rule.config?.appliedTarget?.toUpperCase() || "LEAST_EXPENSIVE",
              add_free_item: false,
              as_total: rule.config?.discountFrom === "cart_total" || false,
              include_items_considered_by_condition: rule.config?.includeConditionProducts || false,
              exclude_items_on_sale: !(rule.config?.includeOnSale || false),
              quantity: rule.config?.appliedQuantity || 1,
            }

            // Set discount type and amount
            if (rule.config?.discountType === "percentage") {
              apiRule.action.cart_items.discount.percentage_amount = String(rule.config.discountValue || 10)
            } else {
              apiRule.action.cart_items.discount.fixed_amount = String(rule.config.discountValue || 10)
            }

            // Process reward inclusion rules
            if (rule.config?.rewardInclusionRule) {
              const inclusionItems = processInclusionRule(rule.config.rewardInclusionRule)

              if (inclusionItems && !inclusionItems.all) {
                apiRule.action.cart_items.items = inclusionItems
              }
            }

            // Process reward exclusion rules
            if (rule.config?.rewardExclusionRules) {
              const exclusionItems = processExclusionRules(rule.config.rewardExclusionRules)

              if (exclusionItems) {
                if (!apiRule.action.cart_items.items) {
                  apiRule.action.cart_items.items = {}
                }

                apiRule.action.cart_items.items.not = exclusionItems
              }
            }
          } else if (rule.reward === "discount_subtotal") {
            // Subtotal discount reward
            apiRule.action.cart = {
              discount: {},
            }

            // Set discount type and amount
            if (rule.config?.discountType === "percentage") {
              apiRule.action.cart.discount.percentage_amount = String(rule.config.discountValue || 10)
            } else {
              apiRule.action.cart.discount.fixed_amount = String(rule.config.discountValue || 10)
            }
          } else if (rule.reward === "fixed_price" && rule.config?.price) {
            // Fixed price reward
            apiRule.action.cart_items = {
              fixed_price: {
                amount: String(rule.config.price),
              },
              quantity: rule.config?.quantity || 1,
            }

            // Process reward inclusion rules for fixed price
            if (rule.config?.rewardInclusionRule) {
              const inclusionItems = processInclusionRule(rule.config.rewardInclusionRule)

              if (inclusionItems && !inclusionItems.all) {
                apiRule.action.cart_items.items = inclusionItems
              }
            }
          }

          // If no specific action was set, provide a default one to avoid API errors
          if (Object.keys(apiRule.action).length === 0) {
            if (rule.action && Object.keys(rule.action).length > 0) {
              // Use the existing action if available
              apiRule.action = rule.action
            } else {
              // Default to a discount action
              apiRule.action = {
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
              }
            }
          }

          // Convert complex objects to simple IDs for API compatibility
          if (apiRule.condition?.cart?.items?.products && Array.isArray(apiRule.condition.cart.items.products)) {
            if (typeof apiRule.condition.cart.items.products[0] === "object") {
              apiRule.condition.cart.items.products = apiRule.condition.cart.items.products.map((p: any) => p.id)
            }
          }

          if (apiRule.condition?.cart?.items?.categories && Array.isArray(apiRule.condition.cart.items.categories)) {
            if (typeof apiRule.condition.cart.items.categories[0] === "object") {
              apiRule.condition.cart.items.categories = apiRule.condition.cart.items.categories.map((c: any) => c.id)
            }
          }

          if (apiRule.condition?.cart?.items?.brands && Array.isArray(apiRule.condition.cart.items.brands)) {
            if (typeof apiRule.condition.cart.items.brands[0] === "object") {
              apiRule.condition.cart.items.brands = apiRule.condition.cart.items.brands.map((b: any) => b.id)
            }
          }

          // Handle not conditions
          if (apiRule.condition?.cart?.items?.not) {
            if (apiRule.condition.cart.items.not.products && Array.isArray(apiRule.condition.cart.items.not.products)) {
              if (typeof apiRule.condition.cart.items.not.products[0] === "object") {
                apiRule.condition.cart.items.not.products = apiRule.condition.cart.items.not.products.map(
                  (p: any) => p.id,
                )
              }
            }

            if (
              apiRule.condition.cart.items.not.categories &&
              Array.isArray(apiRule.condition.cart.items.not.categories)
            ) {
              if (typeof apiRule.condition.cart.items.not.categories[0] === "object") {
                apiRule.condition.cart.items.not.categories = apiRule.condition.cart.items.not.categories.map(
                  (c: any) => c.id,
                )
              }
            }

            if (apiRule.condition.cart.items.not.brands && Array.isArray(apiRule.condition.cart.items.not.brands)) {
              if (typeof apiRule.condition.cart.items.not.brands[0] === "object") {
                apiRule.condition.cart.items.not.brands = apiRule.condition.cart.items.not.brands.map((b: any) => b.id)
              }
            }
          }

          // Handle and conditions
          if (apiRule.condition?.cart?.items?.and && Array.isArray(apiRule.condition.cart.items.and)) {
            apiRule.condition.cart.items.and = apiRule.condition.cart.items.and.map((andItem: any) => {
              const newAndItem = { ...andItem }

              // Process products in and condition
              if (newAndItem.products && Array.isArray(newAndItem.products)) {
                if (typeof newAndItem.products[0] === "object") {
                  newAndItem.products = newAndItem.products.map((p: any) => p.id)
                }
              }

              // Process categories in and condition
              if (newAndItem.categories && Array.isArray(newAndItem.categories)) {
                if (typeof newAndItem.categories[0] === "object") {
                  newAndItem.categories = newAndItem.categories.map((c: any) => c.id)
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
                if (newAndItem.not.products && Array.isArray(newAndItem.not.products)) {
                  if (typeof newAndItem.not.products[0] === "object") {
                    newAndItem.not.products = newAndItem.not.products.map((p: any) => p.id)
                  }
                }

                if (newAndItem.not.categories && Array.isArray(newAndItem.not.categories)) {
                  if (typeof newAndItem.not.categories[0] === "object") {
                    newAndItem.not.categories = newAndItem.not.categories.map((c: any) => c.id)
                  }
                }

                if (newAndItem.not.brands && Array.isArray(newAndItem.not.brands)) {
                  if (typeof newAndItem.not.brands[0] === "object") {
                    newAndItem.not.brands = newAndItem.not.brands.map((b: any) => b.id)
                  }
                }
              }

              return newAndItem
            })
          }

          // Process action items similarly
          if (apiRule.action?.cart_items?.items) {
            if (apiRule.action.cart_items.items.products && Array.isArray(apiRule.action.cart_items.items.products)) {
              if (typeof apiRule.action.cart_items.items.products[0] === "object") {
                apiRule.action.cart_items.items.products = apiRule.action.cart_items.items.products.map(
                  (p: any) => p.id,
                )
              }
            }

            if (
              apiRule.action.cart_items.items.categories &&
              Array.isArray(apiRule.action.cart_items.items.categories)
            ) {
              if (typeof apiRule.action.cart_items.items.categories[0] === "object") {
                apiRule.action.cart_items.items.categories = apiRule.action.cart_items.items.categories.map(
                  (c: any) => c.id,
                )
              }
            }

            if (apiRule.action.cart_items.items.brands && Array.isArray(apiRule.action.cart_items.items.brands)) {
              if (typeof apiRule.action.cart_items.items.brands[0] === "object") {
                apiRule.action.cart_items.items.brands = apiRule.action.cart_items.items.brands.map((b: any) => b.id)
              }
            }

            // Process not conditions in action items
            if (apiRule.action.cart_items.items.not) {
              if (
                apiRule.action.cart_items.items.not.products &&
                Array.isArray(apiRule.action.cart_items.items.not.products)
              ) {
                if (typeof apiRule.action.cart_items.items.not.products[0] === "object") {
                  apiRule.action.cart_items.items.not.products = apiRule.action.cart_items.items.not.products.map(
                    (p: any) => p.id,
                  )
                }
              }

              if (
                apiRule.action.cart_items.items.not.categories &&
                Array.isArray(apiRule.action.cart_items.items.not.categories)
              ) {
                if (typeof apiRule.action.cart_items.items.not.categories[0] === "object") {
                  apiRule.action.cart_items.items.not.categories = apiRule.action.cart_items.items.not.categories.map(
                    (c: any) => c.id,
                  )
                }
              }

              if (
                apiRule.action.cart_items.items.not.brands &&
                Array.isArray(apiRule.action.cart_items.items.not.brands)
              ) {
                if (typeof apiRule.action.cart_items.items.not.brands[0] === "object") {
                  apiRule.action.cart_items.items.not.brands = apiRule.action.cart_items.items.not.brands.map(
                    (b: any) => b.id,
                  )
                }
              }
            }
          }

          return apiRule
        })
      }

      // Prepare the payload
      const payload = {
        name: formData.name,
        channels: selectedChannelIds.map((id) => ({ id: Number(id) })),
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
        rules: formData.rules.length > 0 ? convertRulesToApiFormat(formData.rules) : [],
        currency_code: formData.currencyCode || "*",
        redemption_type: "COUPON",
        shipping_address: null,
        current_uses: 0,
        max_uses: formData.maxUses ? Number(formData.maxUses) : null,
        start_date: formatDateWithTimezone(formData.startDate),
        end_date: formData.endDate ? formatDateWithTimezone(formData.endDate) : null,
        status: formData.status,
        schedule: formData.limitAvailability
          ? {
              week_count: formData.weekCount,
              selected_weekdays: formData.selectedWeekdays,
              availability_start_time: formData.availabilityStartTime,
              availability_end_time: formData.availabilityEndTime,
            }
          : null,
        can_be_used_with_other_promotions: formData.canBeUsedWithOtherPromotions,
        coupon_overrides_automatic_when_offering_higher_discounts: formData.overrideAutomatic,
        display_name: formData.displayName || "",
      }

      console.log("Sending payload:", JSON.stringify(payload, null, 2))

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

interface ExclusionRule {
  type: string
  value: string
}
