"use client"

import { useEffect, useState, useRef } from "react"

type RuleTypeId = "customerGroup" | "customerSegment" | "shippingDestination"

type TargetingRule = {
  id: string
  type: RuleTypeId | null
  condition: string
  value: string
  selectedItems?: any[]
}

type AvailableRuleType = {
  id: RuleTypeId
  label: string
}

type CustomerGroup = {
  id: number
  name: string
}

const Targeting = () => {
  const [currency, setCurrency] = useState("British Pound")
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [targetingRules, setTargetingRules] = useState<TargetingRule[]>([])
  const [showRuleDropdown, setShowRuleDropdown] = useState(false)
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null)

  const [currencies, setCurrencies] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [britishPound, setBritishPound] = useState({ name: "British Pound", currency_code: "GBP" })

  // New states for customer groups modal
  const [showModal, setShowModal] = useState(false)
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<CustomerGroup[]>([])
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const availableRuleTypes: AvailableRuleType[] = [
    { id: "customerGroup", label: "Customer Group" },
    { id: "customerSegment", label: "Customer Segment" },
    { id: "shippingDestination", label: "Shipping Destination" },
  ]

  const getAvailableRuleTypes = (): AvailableRuleType[] => {
    const usedTypes = targetingRules.map((rule) => rule.type)
    return availableRuleTypes.filter((type) => !usedTypes.includes(type.id))
  }
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

  const updateRuleValue = (id: string, value: string) => {
    setTargetingRules(targetingRules.map((rule) => (rule.id === id ? { ...rule, value } : rule)))
  }

  const getRuleTypeLabel = (type: RuleTypeId | null): string => {
    if (!type) return "Please select a rule"
    return availableRuleTypes.find((t) => t.id === type)?.label || "Unknown"
  }

  // Modified to open modal and fetch data
  const handleInputFocus = async (ruleId: string, ruleType: RuleTypeId | null) => {
    if (!ruleType) return

    setActiveRuleId(ruleId)

    // Find the current rule to get its selected items
    const currentRule = targetingRules.find((rule) => rule.id === ruleId)
    if (currentRule?.selectedItems) {
      setSelectedGroups(currentRule.selectedItems)
    } else {
      setSelectedGroups([])
    }

    setShowModal(true)

    if (ruleType === "customerGroup") {
      fetchCustomerGroups()
    } else {
      try {
        let res: Response | undefined
        switch (ruleType) {
          case "customerSegment":
            res = await fetch("/api/customer-segment")
            break
          case "shippingDestination":
            res = await fetch("/api/shipping-destination")
            break
          default:
            return
        }

        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        console.log("Fetched data for", ruleType, data)
      } catch (err) {
        console.error("Error fetching rule data:", err)
      }
    }
  }

  // New function to fetch customer groups
  const fetchCustomerGroups = async () => {
    setLoadingGroups(true)
    try {
      const response = await fetch("/api/customergroups")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCustomerGroups(data.data || [])
    } catch (err) {
      console.error("Error fetching customer groups:", err)
      setError("Failed to fetch customer groups.")
    } finally {
      setLoadingGroups(false)
    }
  }

  // Apply selected groups to the rule
  const applySelectedGroups = () => {
    if (activeRuleId) {
      setTargetingRules(
        targetingRules.map((rule) => {
          if (rule.id === activeRuleId) {
            const groupNames = selectedGroups.map((group) => group.name).join(", ")
            return {
              ...rule,
              value: groupNames,
              selectedItems: selectedGroups,
            }
          }
          return rule
        }),
      )
    }
    setShowModal(false)
  }

  // Toggle selection of a customer group
  const toggleGroupSelection = (group: CustomerGroup) => {
    if (selectedGroups.some((g) => g.id === group.id)) {
      setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
    } else {
      setSelectedGroups([...selectedGroups, group])
    }
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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showModal])

  useEffect(() => {
    const fetchCurrencies = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/currency")

        if (!response.ok) {
          console.error("Failed to fetch currencies. Status:", response.status)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Extract the British Pound name from the array
        const gbp = data.find((currency: any) => currency.currency_code === "GBP")
        if (gbp) {
          setBritishPound(gbp)
          setCurrency(gbp.name) // Set as default selected value
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

  return (
    <div className="bg-white rounded-none shadow p-6">
      <h3 className="text-xl font-medium mb-2">Targeting</h3>
      <p className="text-sm text-gray-700 mb-4 border-b pb-4">
        Determine which customers have access to this promotion.
      </p>

      <div className="space-y-4">
        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-sm inline-block mb-4">Target customers if...</div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">Currency is</span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center justify-between cursor-pointer w-48 border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <span>{currency}</span>
              <svg className="fill-current h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </button>

            {showCurrencyDropdown && (
              <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg">
                <div className="py-1">
                  <button
                    type="button"
                    className="flex items-center w-full cursor-pointer px-4 py-2 text-sm text-left hover:bg-gray-100"
                    onClick={() => handleCurrencyChange("British Pound")}
                  >
                    <span className="flex-grow">{britishPound.name}</span>
                    {currency === "British Pound" && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    className="flex items-center cursor-pointer w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    onClick={() => handleCurrencyChange("Any currency")}
                  >
                    <div>
                      <div>Any currency</div>
                      <div className="text-xs text-gray-500">
                        Does not support amount-based promotions (e.g. €10 or $10)
                      </div>
                    </div>
                    {currency === "Any currency" && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Targeting Rules */}
        {targetingRules.map((rule, index) => (
          <div key={rule.id} className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>

            {/* Rule Type Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveRuleIndex(index)
                  setShowRuleDropdown(!showRuleDropdown && activeRuleIndex === index)
                }}
                className="flex items-center cursor-pointer justify-between w-48 border border-gray-300 rounded px-3 py-2 text-sm bg-white"
              >
                <span className={!rule.type ? "text-gray-400" : ""}>{getRuleTypeLabel(rule.type)}</span>
                <svg className="fill-current h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </button>

              {showRuleDropdown && activeRuleIndex === index && (
                <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg">
                  <div className="py-1">
                    {getAvailableRuleTypes().map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className="w-full px-4 py-2 text-sm cursor-pointer text-left hover:bg-gray-100"
                        onClick={() => updateRuleType(rule.id, type.id as any)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Condition Selector - Only show if rule type is selected */}
            {rule.type && (
              <div className="relative">
                <select
                  className="appearance-none border cursor-pointer border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
                  value={rule.condition}
                  onChange={(e) => updateRuleCondition(rule.id, e.target.value)}
                >
                  <option value="is">Is</option>
                  <option value="isNot">Is not</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Value Input - Only show if rule type is selected */}
            {rule.type && (
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getPlaceholderForType(rule.type)}
                  value={rule.value}
                  readOnly
                  onClick={() => handleInputFocus(rule.id, rule.type)}
                />
              </div>
            )}

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => removeTargetingRule(rule.id)}
              className="text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Targeting Rule Button - Only show if less than 3 rules */}
        {targetingRules.length < 3 && (
          <button
            type="button"
            onClick={addTargetingRule}
            className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
          >
            <span className="text-lg mr-1">+</span>
            Add targeting rule
          </button>
        )}
      </div>

      {/* Customer Groups Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select customer groups</h2>

              <div className="border-t border-b py-2 mb-4">
                <p className="text-sm">
                  {loadingGroups ? "Loading customer groups..." : `${customerGroups.length} Customer groups`}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {customerGroups.length > 0
                      ? `1 - ${customerGroups.length} of ${customerGroups.length}`
                      : "1 - 0 of 0"}
                  </p>
                  <div className="flex">
                    <button className="p-2 text-gray-400 border rounded-l" disabled>
                      &lt;
                    </button>
                    <button className="p-2 text-gray-400 border rounded-r" disabled>
                      &gt;
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {loadingGroups ? (
                  <p className="text-center py-4">Loading...</p>
                ) : customerGroups.length === 0 ? (
                  <div className="py-4 border-b">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        checked={selectedGroups.some((g) => g.name === "-- No Group --")}
                        onChange={() => toggleGroupSelection({ id: -1, name: "-- No Group --" })}
                      />
                      <span>-- No Group --</span>
                    </label>
                  </div>
                ) : (
                  customerGroups.map((group) => (
                    <div key={group.id} className="py-4 border-b">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4"
                          checked={selectedGroups.some((g) => g.id === group.id)}
                          onChange={() => toggleGroupSelection(group)}
                        />
                        <span>{group.name}</span>
                      </label>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-blue-600 hover:underline">
                  Cancel
                </button>
                <button
                  onClick={applySelectedGroups}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-2">Store Currencies</h2>
        {loading && <p>Loading currencies...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {currencies && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-[300px]">
            {JSON.stringify(currencies, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}



export default Targeting
