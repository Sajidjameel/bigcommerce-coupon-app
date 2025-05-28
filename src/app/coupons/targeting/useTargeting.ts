"use client"

import { useState, useEffect, useRef } from "react"
import type { RuleTypeId, TargetingRule, AvailableRuleType, CustomerGroup } from "@/types/rule-types"

export const useTargeting = () => {
  const [currency, setCurrency] = useState("British Pound")
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [targetingRules, setTargetingRules] = useState<TargetingRule[]>([])
  const [showRuleDropdown, setShowRuleDropdown] = useState(false)
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null)
  const [currencies, setCurrencies] = useState<Record<string, unknown> | null>(null) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [britishPound, setBritishPound] = useState({ name: "British Pound", currency_code: "GBP" })
  const [showModal, setShowModal] = useState(false)
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<CustomerGroup[]>([])
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 250
  const [segments, setSegments] = useState<unknown[]>([])
  const [loadingSegments, setLoadingSegments] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState<any[]>([])
  const [showShippingDestinationDialog, setShowShippingDestinationDialog] = useState(false)

  
  const availableRuleTypes: AvailableRuleType[] = [
    { id: "customerGroup", label: "Customer Group" },
    { id: "customerSegment", label: "Customer Segment" },
    { id: "shippingDestination", label: "Shipping Destination" },
  ]

  // Calculate pagination display
  const startIndex = currentPage === 0 ? 1 : currentPage * pageSize + 1
  const endIndex = currentPage * pageSize
  const totalItems = 0
  let paginationText = `${startIndex} - ${endIndex} of ${totalItems}`
  if (currentPage === 0) paginationText = `1 - 0 of 0`

  // Helper functions
  const getAvailableRuleTypes = (): AvailableRuleType[] => {
    const usedTypes = targetingRules.map((rule) => rule.type)
    return availableRuleTypes.filter((type) => !usedTypes.includes(type.id))
  }

  const getRuleTypeLabel = (type: RuleTypeId | null): string => {
    if (!type) return "Please select a rule"
    return availableRuleTypes.find((t) => t.id === type)?.label || "Unknown"
  }

  const getPlaceholderForType = (type: RuleTypeId | null): string => {
    switch (type) {
      case "customerGroup":
        return "Click to add customer group"
      case "customerSegment":
        return "Click to add customer segments"
      case "shippingDestination":
        return "Click to add countries"
      default:
        return "Select a value"
    }
  }

  // Rule management functions
  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    setShowCurrencyDropdown(false)
  }

  const addTargetingRule = () => {
    if (targetingRules.length < 3) {
      setTargetingRules([
        ...targetingRules,
        { id: `rule-${Date.now()}`, type: null, condition: "is", value: "", selectedItems: [] },
      ])
    }
  }

  const removeTargetingRule = (id: string) => {
    setTargetingRules(targetingRules.filter((rule) => rule.id !== id))
  }

  const updateRuleType = (id: string, type: RuleTypeId) => {
    setTargetingRules(
      targetingRules.map((rule) => (rule.id === id ? { ...rule, type, value: "", selectedItems: [] } : rule)),
    )
    setShowRuleDropdown(false)
  }

  const updateRuleCondition = (id: string, condition: string) => {
    setTargetingRules(targetingRules.map((rule) => (rule.id === id ? { ...rule, condition } : rule)))
  }

  // Modal and data fetching functions
  const handleInputFocus = async (ruleId: string, ruleType: RuleTypeId | null) => {
    if (!ruleType) return
    setActiveRuleId(ruleId)
    const currentRule = targetingRules.find((rule) => rule.id === ruleId)

    if (ruleType === "customerGroup") {
      setSelectedGroups(currentRule?.selectedItems || [])
      setShowModal(true)
      fetchCustomerGroups()
    } else if (ruleType === "customerSegment") {
      setSelectedGroups(currentRule?.selectedItems || [])
      setShowModal(true)
      fetchSegments()
    } else if (ruleType === "shippingDestination") {
      setSelectedCountries(currentRule?.selectedItems || [])
      setShowShippingDestinationDialog(true)
    }
  }

  const fetchCustomerGroups = async () => {
    setLoadingGroups(true)
    try {
      const response = await fetch("/api/customergroups")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setCustomerGroups(data.data || [])
    } catch (err) {
      console.error("Error fetching customer groups:", err)
      setError("Failed to fetch customer groups.")
    } finally {
      setLoadingGroups(false)
    }
  }

  const fetchSegments = async () => {
    setLoadingSegments(true)
    try {
      const response = await fetch("/api/customersegment")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setSegments(data.data || [])
    } catch (err) {
      console.error("Error fetching customer segments:", err)
      setError("Failed to fetch customer segments.")
    } finally {
      setLoadingSegments(false)
    }
  }

  const applySelectedGroups = () => {
    if (activeRuleId) {
      setTargetingRules(
        targetingRules.map((rule) => {
          if (rule.id === activeRuleId) {
            const groupNames = selectedGroups.map((group) => group.name).join(", ")
            return { ...rule, value: groupNames, selectedItems: selectedGroups }
          }
          return rule
        }),
      )
    }
    setShowModal(false)
  }

  const applySelectedCountries = (countries: any[]) => {
     //console.log("🚀 applySelectedCountries called with:");
  //console.log("Selected countries array:", countries);
  if (activeRuleId) {
  //console.log("First country object sample:", countries[0]);

    setTargetingRules(
      targetingRules.map((rule) => {
        if (rule.id === activeRuleId) {
          const countryNames = countries.map((country) => country.name).join(", ");
          return { ...rule, value: countryNames, selectedItems: countries };
        }
        return rule;
      }),
    );
  }
  setSelectedCountries(countries);
  setShowShippingDestinationDialog(false);
};

  const toggleGroupSelection = (group: CustomerGroup) => {
    setSelectedGroups(
      selectedGroups.some((g) => g.id === group.id)
        ? selectedGroups.filter((g) => g.id !== group.id)
        : [...selectedGroups, group],
    )
  }

  const handlePreviousPage = () => currentPage > 0 && setCurrentPage(currentPage - 1)
  const handleNextPage = () => setCurrentPage(currentPage + 1)

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false)
      }
    }
    if (showModal) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showModal])

  useEffect(() => {
    const fetchCurrencies = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/currency")
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        const gbp = data.find((currency: any) => currency.currency_code === "GBP")
        if (gbp) {
          setBritishPound(gbp)
          setCurrency(gbp.name)
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setError("Failed to fetch currencies.")
      } finally {
        setLoading(false)
      }
    }
    fetchCurrencies()
  }, [])

  return {
    currency,
    showCurrencyDropdown,
    targetingRules,
    showRuleDropdown,
    activeRuleIndex,
    currencies,
    loading,
    error,
    britishPound,
    showModal,
    customerGroups,
    loadingGroups,
    selectedGroups,
    activeRuleId,
    modalRef,
    currentPage,
    pageSize,
    paginationText,
    availableRuleTypes,
    segments,
    loadingSegments,
    showShippingDestinationDialog,
    selectedCountries,
    getAvailableRuleTypes,
    getRuleTypeLabel,
    getPlaceholderForType,
    handleCurrencyChange,
    addTargetingRule,
    removeTargetingRule,
    updateRuleType,
    updateRuleCondition,
    handleInputFocus,
    applySelectedGroups,
    applySelectedCountries,
    toggleGroupSelection,
    handlePreviousPage,
    handleNextPage,
    setShowCurrencyDropdown,
    setShowRuleDropdown,
    setActiveRuleIndex,
    setShowModal,
    setShowShippingDestinationDialog,
  }
}
