"use client"

import { useEffect, useState } from "react"

type RuleTypeId = "customerGroup" | "customerSegment" | "shippingDestination";

type TargetingRule = {
  id: string
  type: RuleTypeId | null
  condition: string
  value: string
}

type AvailableRuleType = {
  id: RuleTypeId
  label: string
}

const Targeting = () => {
  const [currency, setCurrency] = useState("British Pound")
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [targetingRules, setTargetingRules] = useState<TargetingRule[]>([])
  const [showRuleDropdown, setShowRuleDropdown] = useState(false)
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null)

  const [currencies, setCurrencies] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const availableRuleTypes: AvailableRuleType[] = [
    { id: "customerGroup", label: "Customer Group" },
    { id: "customerSegment", label: "Customer Segment" },
    { id: "shippingDestination", label: "Shipping Destination" },
  ]

  const getAvailableRuleTypes = (): AvailableRuleType[] => {
    const usedTypes = targetingRules.map((rule) => rule.type)
    return availableRuleTypes.filter((type) => !usedTypes.includes(type.id))
  }

  const handleCurrencyChange = (value: string) => {
    setCurrency(value)
    setShowCurrencyDropdown(false)
  }

  const addTargetingRule = () => {
    if (targetingRules.length < 3) {
      setTargetingRules([...targetingRules, { id: `rule-${Date.now()}`, type: null, condition: "is", value: "" }])
    }
  }

  const removeTargetingRule = (id: string) => {
    setTargetingRules(targetingRules.filter((rule) => rule.id !== id))
  }

  const updateRuleType = (id: string, type: RuleTypeId) => {
    setTargetingRules(targetingRules.map((rule) => (rule.id === id ? { ...rule, type } : rule)))
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

  const handleInputFocus = async (ruleType: RuleTypeId | null) => {
    try {
      let res: Response | undefined;
      switch (ruleType) {
        case "customerGroup":
          res = await fetch("/api/customergroups");
          break;
        case "customerSegment":
          res = await fetch("/api/customer-segment");
          break;
        case "shippingDestination":
          res = await fetch("/api/shipping-destination");
          break;
        default:
          return;
      }

      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      console.log("Fetched data for", ruleType, data);
    } catch (err) {
      console.error("Error fetching rule data:", err);
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

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Currency data:', data);
        setCurrencies(data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch currencies.');
        setLoading(false);
      }
    };

    fetchCurrencies();
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
                    <span className="flex-grow">British Pound</span>
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
                  onFocus={() => handleInputFocus(rule.type)}
                  onChange={(e) => updateRuleValue(rule.id, e.target.value)}
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

export default Targeting;