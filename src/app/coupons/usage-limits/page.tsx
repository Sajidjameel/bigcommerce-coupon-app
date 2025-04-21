"use client"

import { useState } from "react"

export default function UsageLimits() {
  // State for total usage limit
  const [totalUsageLimit, setTotalUsageLimit] = useState("noLimit")
  const [totalUsageCount, setTotalUsageCount] = useState(0)

  // State for per customer usage limit
  const [customerUsageLimit, setCustomerUsageLimit] = useState("noLimit")
  const [customerUsageCount, setCustomerUsageCount] = useState(0)

  // State for usage with other promotions
  const [usageWithOtherPromotions, setUsageWithOtherPromotions] = useState("can")
  const [automaticPromotionOption, setAutomaticPromotionOption] = useState("under")
  const [showAutomaticPromotionsDropdown, setShowAutomaticPromotionsDropdown] = useState(false)

  // Handlers for count changes
  const handleTotalUsageCountChange = (increment: boolean) => {
    setTotalUsageCount((prev) => (increment ? prev + 1 : Math.max(0, prev - 1)))
  }

  const handleCustomerUsageCountChange = (increment: boolean) => {
    setCustomerUsageCount((prev) => (increment ? prev + 1 : Math.max(0, prev - 1)))
  }

  return (
    <div className="bg-white rounded-none p-6 shadow">
      <h3 className="text-xl font-medium mb-6">Usage limits</h3>

      {/* Total Usage Limit */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">Limit total usage of this promotion</p>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="totalUsageLimit"
              value="noLimit"
              checked={totalUsageLimit === "noLimit"}
              onChange={() => setTotalUsageLimit("noLimit")}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm">No limit for total usage of promotion</span>
          </label>

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="totalUsageLimit"
                value="limit"
                checked={totalUsageLimit === "limit"}
                onChange={() => setTotalUsageLimit("limit")}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm">Limit for total usage of promotion across all channels</span>
            </label>

            {totalUsageLimit === "limit" && (
              <div className="mt-3 ml-6">
                <div className="flex items-center border border-gray-300 rounded w-32">
                  <button
                    type="button"
                    onClick={() => handleTotalUsageCountChange(false)}
                    className="px-2 py-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    className="w-12 text-center border-0 focus:ring-0"
                    value={totalUsageCount}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value)
                      if (!isNaN(val) && val >= 0) {
                        setTotalUsageCount(val)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleTotalUsageCountChange(true)}
                    className="px-2 py-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Per Customer Usage Limit */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">Limit usage of coupon code per customer</p>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="customerUsageLimit"
              value="noLimit"
              checked={customerUsageLimit === "noLimit"}
              onChange={() => setCustomerUsageLimit("noLimit")}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm">No usage limit for individual customers</span>
          </label>

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="customerUsageLimit"
                value="limit"
                checked={customerUsageLimit === "limit"}
                onChange={() => setCustomerUsageLimit("limit")}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm">Limit usage for individual customers</span>
            </label>

            {customerUsageLimit === "limit" && (
              <div className="mt-3 ml-6">
                <div className="flex items-center border border-gray-300 rounded w-32">
                  <button
                    type="button"
                    onClick={() => handleCustomerUsageCountChange(false)}
                    className="px-2 py-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    className="w-12 text-center border-0 focus:ring-0"
                    value={customerUsageCount}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value)
                      if (!isNaN(val) && val >= 0) {
                        setCustomerUsageCount(val)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCustomerUsageCountChange(true)}
                    className="px-2 py-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage With Other Promotions */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">Allow usage with other promotions</p>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">This promotion</span>
            <div className="relative">
              <select
                className="appearance-none border cursor-pointer border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-32"
                value={usageWithOtherPromotions}
                onChange={(e) => setUsageWithOtherPromotions(e.target.value)}
              >
                <option value="can">can</option>
                <option value="cannot">cannot</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <span className="text-sm">be used in conjunction with other promotions</span>
          </div>

          {usageWithOtherPromotions === "cannot" && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">This coupon will not be accepted in the Cart and Checkout</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAutomaticPromotionsDropdown(!showAutomaticPromotionsDropdown)}
                  className="flex items-center justify-between border border-gray-300 rounded px-3 py-2 text-sm bg-white w-48 cursor-pointer"
                >
                  <span>3 automatic promotions</span>
                  <svg className="fill-current h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </button>

                {showAutomaticPromotionsDropdown && (
                  <div className="absolute z-10 mt-1 w-[500px] bg-white border border-gray-300 rounded shadow-lg">
                    <div className="py-1">
                      <button
                        type="button"
                        className={`flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 ${
                          automaticPromotionOption === "under" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setAutomaticPromotionOption("under")
                          setShowAutomaticPromotionsDropdown(false)
                        }}
                      >
                        <span className="flex-grow cursor-pointer">
                          under any circumstances when there are already applied automatic promotions
                        </span>
                        {automaticPromotionOption === "under" && (
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        className={`flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 ${
                          automaticPromotionOption === "unless" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setAutomaticPromotionOption("unless")
                          setShowAutomaticPromotionsDropdown(false)
                        }}
                      >
                        <span className="flex-grow cursor-pointer">
                          unless it gives a bigger discount, when compared to the sum of already applied automatic
                          promotions
                        </span>
                        {automaticPromotionOption === "unless" && (
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-1 text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
