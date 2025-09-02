

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Rule, RuleTypeId, TargetingRule,  } from "@/types/rule-types"
import { Channel, Country, CouponContextProps, CouponFormData, ExtendedRule } from "@/types/couponContext-types"
import { formInitialValue } from "./__data"
import { preparePayload } from "./utils/functions"

const CouponContext = createContext<CouponContextProps | undefined>(undefined)

export const CouponProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [couponCodes, setCouponCodes] = useState<string[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(["0"]) // Default to channel 1
  const [selectedZoneIds, setSelectedZoneIds] = useState<Set<number>>(new Set())
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)



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

  function updateTargetingRule(id: RuleTypeId, updates: Partial<TargetingRule>){
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
 

  // Update the generateCoupon function to properly convert UI selections to the BigCommerce API format
const generateCoupon = async () => {
  setLoading(true)
  setError(null)
  setCouponCodes([])
  setProgress(0)

  const quantity = Math.max(1, Number(formData.quantity) || 1)

  // ⏱ estimated time in seconds (1 coupon ≈ 1s)
  const estimatedSeconds = quantity * 1
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60)

  // store for UI
  setEstimatedTime(estimatedMinutes)

  const DEFAULT_PER_COUPON_MS = 9000 
  let historicAvgMs = DEFAULT_PER_COUPON_MS
  try {
    const stored = localStorage.getItem("avgCouponMs")
    if (stored) historicAvgMs = Math.max(200, Number(stored))
  } catch {}

  const expectedTotalMs = historicAvgMs * quantity
  const start = performance.now()
  const TICK_MS = 150
  const interval = setInterval(() => {
    const elapsed = performance.now() - start
    const rawPercent = Math.min(98, Math.round((elapsed / expectedTotalMs) * 100))
    setProgress((prev) => {
      const next = Math.max(prev + 1, rawPercent)
      return Math.min(98, next)
    })
  }, TICK_MS)

  try {
    const payload = preparePayload(formData, selectedChannelIds)
    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        quantity,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Failed to create coupon")

    setCouponCodes(data.coupon || [])

    const totalElapsed = performance.now() - start
    const perCouponMs = totalElapsed / quantity
    const newAvg = historicAvgMs * 0.8 + perCouponMs * 0.2
    try {
      localStorage.setItem("avgCouponMs", String(newAvg))
    } catch {}

    clearInterval(interval)
    setProgress(100)
    await new Promise((r) => setTimeout(r, 500)) 
  } catch (err) {
    setError(err instanceof Error ? err.message : "An unknown error occurred")
    clearInterval(interval)
    setProgress(100)
    await new Promise((r) => setTimeout(r, 500))
  } finally {
    clearInterval(interval)
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
        setSelectedZoneIds,
        progress, 
        estimatedTime,
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
