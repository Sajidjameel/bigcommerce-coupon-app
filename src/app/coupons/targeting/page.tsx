"use client"
import { useTargeting } from "./useTargeting"
import ShippingDestination from "./shipping-destination"

const Targeting = () => {
  const {
    currency,
    showCurrencyDropdown,
    targetingRules,
    showRuleDropdown,
    activeRuleIndex,
    britishPound,
    showModal,
    customerGroups,
    loadingGroups,
    selectedGroups,
    activeRuleId,
    modalRef,
    currentPage,
    paginationText,
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
  } = useTargeting()

  // Function to render selected countries in the input field
  const renderSelectedCountriesPreview = (rule: any) => {
    if (!rule.selectedItems || rule.selectedItems.length === 0) return null

    const firstCountry = rule.selectedItems[0]
    const remainingCount = rule.selectedItems.length - 1

    return (
      <div className="flex items-center gap-2">
        <div className="bg-gray-200 rounded-md px-2 py-1 text-sm">{firstCountry.name}</div>
        {remainingCount > 0 && <div className="bg-gray-200 rounded-md px-2 py-1 text-sm">{`+ ${remainingCount}`}</div>}
      </div>
    )
  }

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
                <div
                  className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer flex items-center min-h-[38px]"
                  onClick={() => handleInputFocus(rule.id, rule.type)}
                >
                  {rule.selectedItems && rule.selectedItems.length > 0 ? (
                    renderSelectedCountriesPreview(rule)
                  ) : (
                    <span className="text-gray-400">{getPlaceholderForType(rule.type)}</span>
                  )}
                </div>
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

      {/* Shipping Destination Dialog */}
      {showShippingDestinationDialog && (
        <ShippingDestination
          isOpen={showShippingDestinationDialog}
          onClose={() => setShowShippingDestinationDialog(false)}
          onApply={applySelectedCountries}
          initialSelectedCountries={selectedCountries}
        />
      )}

      {showModal && (
        <>
          {/* Customer Groups Modal */}
          {activeRuleId && targetingRules.find((r) => r.id === activeRuleId)?.type === "customerGroup" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Select customer groups</h2>

                  <div className="border-t border-b py-2 mb-4">
                    <p className="text-sm">{loadingGroups ? "" : `${customerGroups.length} Customer groups`}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">{paginationText}</p>
                      <div className="flex">
                        <button
                          className={`p-2 border rounded-l ${currentPage > 0 ? "text-blue-600" : "text-gray-400"} cursor-pointer`}
                          onClick={handlePreviousPage}
                          disabled={currentPage === 0}
                        >
                          &lt;
                        </button>
                        <button className="p-2 text-blue-600 border rounded-r cursor-pointer" onClick={handleNextPage}>
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
                            className="form-checkbox h-4 w-4 cursor-pointer"
                            checked={selectedGroups.some((g) => g.name === "-- No Group --")}
                            onChange={() => toggleGroupSelection({ id: -1, name: "-- No Group --" })}
                          />
                          <span className=" text-black px-2 py-1">-- No Group --</span>
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
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-blue-600 hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applySelectedGroups}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Segments Modal */}
          {activeRuleId && targetingRules.find((r) => r.id === activeRuleId)?.type === "customerSegment" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[500px] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Select customer segments</h2>
                </div>

                {/* Body (Empty Scrollable Section) */}
                <div className="flex-1 overflow-y-auto px-6 py-4"></div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-blue-600 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applySelectedGroups}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Targeting
