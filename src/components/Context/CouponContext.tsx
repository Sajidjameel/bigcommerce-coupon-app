

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, SetStateAction, Dispatch } from "react"
import type { Rule, TargetingRule,  } from "@/types/rule-types"
import { Channel, Country, CouponContextProps, CouponFormData, ExtendedRule } from "@/types/couponContext-types"
import { formInitialValue } from "./__data"
import { processCondition } from "./utils/functions"

const CouponContext = createContext<CouponContextProps | undefined>(undefined)

export const CouponProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [couponCodes, setCouponCodes] = useState<string[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(["0"]) // Default to channel 1
  const [selectedZoneIds, setSelectedZoneIds] = useState<Set<number>>(new Set())


  const [formData, setFormData] = useState<CouponFormData>(formInitialValue)

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
      targetingRules: [...prev.targetingRules, newRule,],
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
    console.log("📦 Received countries from modal:", countries);

    setFormData(prev => {
      const shippingAddress = countries.length > 0
        ? {
          countries: countries.map(country => ({
            iso2_country_code: country.name.substring(0, 2).toUpperCase()
          }))
        }
        : null;

      return {
        ...prev,
        shipping_address: shippingAddress,
        selectedCountries: countries
      };
    });
  };

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
          console.error("Failed to parse JSON array:", e)
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
               console.error("Failed to parse JSON array:", e)

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
      console.error("Failed to parse JSON array:", e)

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
                  console.error("Failed to parse JSON array:", e)
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
               console.error("Failed to parse JSON array:", e)

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
      }
    } else if (inclusionRule.type === "category") {
      if (inclusionRule.selectedItems?.length) {
        result.categories = inclusionRule.selectedItems.map((item: any) => Number(item.id))
      } else if (inclusionRule.value) {
        const categoryIds = parseCategoryJson(inclusionRule.value)
        if (categoryIds.length > 0) {
          result.categories = categoryIds
        }
      }
      // Also check value field as fallback
      else if (inclusionRule.value) {
        const categoryIds = parseCategoryJson(inclusionRule.value)
        if (categoryIds.length > 0) {
          result.categories = categoryIds
        }
      }
    } else if (inclusionRule.type === "brand" && inclusionRule.value) {
      const brands = parseIds(inclusionRule.value)
      if (brands.length > 0) {
        result.brands = extractIds(brands)
      }
    } else if (inclusionRule.type === "custom_field") {
      try {
        let name = null
        let values = null

        if (inclusionRule.value) {
          const parsed = JSON.parse(inclusionRule.value)
          if (parsed.fieldName && parsed.fieldValues) {
            name = parsed.fieldName.trim()
            values = Array.isArray(parsed.fieldValues)
              ? parsed.fieldValues.map((v: string) => v.trim())
              : [parsed.fieldValues.trim()]
          }
        }

        if (!name && inclusionRule.name && inclusionRule.values) {
          name = inclusionRule.name.trim()
          values = Array.isArray(inclusionRule.values)
            ? inclusionRule.values.map((v: string) => v.trim())
            : [inclusionRule.values.trim()]
        }

        if (name && values) {
          result.product_custom_field = { name, values }
        }
      } catch (e) {
        console.error("Error processing custom field rule:", e)
      }
    } else if (inclusionRule.type === "product_option") {
      try {
        let name = null
        let values = null
        const type = inclusionRule.optionType || "string_match"

        if (inclusionRule.value) {
          const parsed = JSON.parse(inclusionRule.value)
          if (parsed.optionName && parsed.optionValues) {
            name = parsed.optionName.trim()
            values = Array.isArray(parsed.optionValues)
              ? parsed.optionValues.map((v: string) => v.trim())
              : [parsed.optionValues.trim()]
          }
        }

        if (!name && inclusionRule.name && inclusionRule.values) {
          name = inclusionRule.name.trim()
          values = Array.isArray(inclusionRule.values)
            ? inclusionRule.values.map((v: string) => v.trim())
            : [inclusionRule.values.trim()]
        }

        if (name && values) {
          result.product_option = { type, name, values }
        }
      } catch (e) {
        console.error("Error processing product option rule:", e)
      }
    } else if (inclusionRule.type === "all") {
      return null
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
            }
          } else if (condition.type === "category") {
            // Try to parse category value
            if (condition.value) {
              const categoryIds = parseCategoryJson(condition.value)
              if (categoryIds.length > 0) {
                additionalResult.categories = categoryIds
              }
            }
          } else if (condition.type === "brand" && condition.value) {
            const brands = parseIds(condition.value)
            if (brands.length > 0) {
              additionalResult.brands = extractIds(brands)
            }
          } else if (condition.type === "custom_field" && condition.name && condition.values) {
            additionalResult.product_custom_field = {
              name: condition.name.trim(),
              values: Array.isArray(condition.values) ? condition.values : [condition.values],
            }
          } else if (condition.type === "product_option" && condition.name && condition.values) {
            additionalResult.product_option = {
              type: condition.optionType || "string_match",
              name: condition.name.trim(),
              values: Array.isArray(condition.values) ? condition.values : [condition.values],
            }
          }
          if (Object.keys(additionalResult).length > 0) {
            andConditions.push(additionalResult)
          }
        }

        // If we have multiple conditions, return them as an AND
        if (andConditions.length > 1) {
          return { and: andConditions }
        } else if (andConditions.length === 1) {
          return andConditions[0]
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null
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
          if (exclusion.value && typeof exclusion.value === "string") {
            const categoryIds = parseCategoryJson(exclusion.value)
            if (categoryIds.length > 0) {
              condition.categories = categoryIds
            }
          }

          if (exclusion.selectedItems && Array.isArray(exclusion.selectedItems) && exclusion.selectedItems.length > 0) {
            const selectedIds = exclusion.selectedItems.map((item: any) => Number(item.id))
            if (!condition.categories) {
              condition.categories = selectedIds
            } else {
              condition.categories = [...new Set([...condition.categories, ...selectedIds])]
            }
          }
        } catch (e) {
                    console.error("Failed to parse JSON array:", e)

          // Silent error
        }
      } else if (exclusion.type === "brand" && exclusion.value) {
        const brands = parseIds(exclusion.value)
        if (brands.length > 0) {
          condition.brands = extractIds(brands)
        }
      } else if (exclusion.type === "custom_field") {
        try {
          let name = null
          let values = null

          if (exclusion.value) {
            const parsed = JSON.parse(exclusion.value)
            if (parsed.fieldName && parsed.fieldValues) {
              name = parsed.fieldName.trim()
              values = Array.isArray(parsed.fieldValues)
                ? parsed.fieldValues.map((v: string) => v.trim())
                : [parsed.fieldValues.trim()]
            }
          }

          if (!name && exclusion.name && exclusion.values) {
            name = exclusion.name.trim()
            values = Array.isArray(exclusion.values)
              ? exclusion.values.map((v: string) => v.trim())
              : [exclusion.values.trim()]
          }

          if (name && values) {
            condition.product_custom_field = { name, values }
          }
        } catch (e) {
          console.error("Error processing custom field rule:", e)
        }
      } else if (exclusion.type === "product_option") {
        try {
          let name = null
          let values = null
          const type = exclusion.optionType || "string_match"

          if (exclusion.value) {
            const parsed = JSON.parse(exclusion.value)
            if (parsed.optionName && parsed.optionValues) {
              name = parsed.optionName.trim()
              values = Array.isArray(parsed.optionValues)
                ? parsed.optionValues.map((v: string) => v.trim())
                : [parsed.optionValues.trim()]
            }
          }

          if (!name && exclusion.name && exclusion.values) {
            name = exclusion.name.trim()
            values = Array.isArray(exclusion.values)
              ? exclusion.values.map((v: string) => v.trim())
              : [exclusion.values.trim()]
          }

          if (name && values) {
            condition.product_option = { type, name, values }
          }
        } catch (e) {
          console.error("Error processing product option rule:", e)
        }
      }

      if (Object.keys(condition).length > 0) {
        exclusionConditions.push(condition)
      }
    }

    if (exclusionConditions.length === 0) return null
    if (exclusionConditions.length === 1) return exclusionConditions[0]

    return { and: exclusionConditions }
  }

  // Create complex condition for rule
  // Create complex condition for rule
  const createComplexCondition = (rule: any) => {
    const condition: any = {
      cart: {
        minimum_quantity: 1,
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

 

      // Prepare the payload
      const payload = 

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
      
      // Log successful coupon generation with details
      console.log("✅ Coupon generated successfully:", {
        coupon: data.coupon,
        payload: payload,
        rules: payload.rules,
        shippingZones: payload.rules.filter(rule => rule.action?.shipping?.zone_ids).map(rule => ({
          zoneIds: rule.action.shipping.zone_ids,
          zoneNames: rule.action.shipping.zone_names
        }))
      })

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
        selectedCountries: formData.selectedCountries,
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
        selectedZoneIds, 
        setSelectedZoneIds
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
