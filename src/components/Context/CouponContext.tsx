"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
}

interface Discount {
  percentage_amount?: string
  fixed_amount?: string
}

interface CartItemsAction {
  discount?: Discount
  strategy: string
  add_free_item: boolean
  as_total: boolean
  include_items_considered_by_condition: boolean
  exclude_items_on_sale: boolean
  quantity: number
  items?: {
    categories?: number[]
    products?: number[]
  }
}

interface Action {
  gift_item?: GiftItem
  cart_items?: CartItemsAction
}

interface Condition {
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

interface Rule {
  action: Action
  apply_once: boolean
  stop: boolean
  condition: Condition
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

  const addRule = (rule: Rule) => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, rule],
    }))
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

  const generateCoupon = async () => {
    setLoading(true)
    setError(null)
    setCouponCodes([])

    try {
      // Format start and end dates with times
      const formatDateTime = (date: string, time: string) => {
        if (!date) return null

        const dateObj = new Date(date)
        const [hours, minutes, period] = time.split(/[: ]/)
        let hour = Number.parseInt(hours)

        if (period === "PM" && hour < 12) {
          hour += 12
        } else if (period === "AM" && hour === 12) {
          hour = 0
        }

        dateObj.setHours(hour, Number.parseInt(minutes) || 0, 0, 0)
        return dateObj.toISOString()
      }

      // Prepare the payload
      const payload = {
        name: formData.name,
        display_name: formData.displayName,
        start_date: formatDateTime(formData.startDate, formData.startTime),
        end_date: formData.endDate ? formatDateTime(formData.endDate, formData.endTime) : null,
        status: formData.status,
        max_uses: formData.maxUses ? Number(formData.maxUses) : null,
        max_uses_per_customer: formData.maxUsesPerCustomer ? Number(formData.maxUsesPerCustomer) : null,
        min_order_count: Number(formData.minOrderCount) || 0,
        customer_group_ids: formData.customerGroupIds
          ? formData.customerGroupIds.split(",").map((id) => Number(id.trim()))
          : [],
        excluded_customer_group_ids: formData.excludedCustomerGroupIds
          ? formData.excludedCustomerGroupIds.split(",").map((id) => Number(id.trim()))
          : [],
        discount_type: formData.discountType,
        discount_amount: Number(formData.discountAmount),
        exclude_sale_items: formData.excludeSaleItems,
        strategy: formData.strategy,
        categories: formData.categories ? formData.categories.split(",").map((id) => Number(id.trim())) : [],
        can_be_used_with_other_promotions: formData.canBeUsedWithOtherPromotions,
        coupon_overrides_automatic_when_offering_higher_discounts: formData.overrideAutomatic,
        quantity: Number(formData.quantity) || 1,
        currency_code: formData.currencyCode,
        channels: selectedChannelIds.map((id) => ({ id: Number(id) })),
        rules: formData.rules.map((rule) => ({
          action: {
            ...(rule.action.gift_item && { gift_item: rule.action.gift_item }),
            ...(rule.action.cart_items && {
              cart_items: {
                discount: rule.action.cart_items.discount,
                strategy: rule.action.cart_items.strategy,
                add_free_item: rule.action.cart_items.add_free_item,
                as_total: rule.action.cart_items.as_total,
                exclude_items_on_sale: rule.action.cart_items.exclude_items_on_sale,
                include_items_considered_by_condition: rule.action.cart_items.include_items_considered_by_condition,
                quantity: rule.action.cart_items.quantity,
                ...(rule.action.cart_items.items && { items: rule.action.cart_items.items }),
              },
            }),
          },
          apply_once: rule.apply_once,
          stop: rule.stop,
          condition: rule.condition,
        })),
        reward_type: formData.rewardType,
        targeting_rules: formData.targetingRules,
        selected_countries: formData.selectedCountries.map((country) => ({
          id: country.id,
          name: country.name,
        })),
        schedule: formData.limitAvailability
          ? {
              week_count: formData.weekCount,
              selected_weekdays: formData.selectedWeekdays,
              availability_start_time: formData.availabilityStartTime,
              availability_end_time: formData.availabilityEndTime,
            }
          : null,
      }

      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
