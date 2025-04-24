"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

interface Country {
  id: number | string
  name: string
}

interface ShippingDestinationProps {
  isOpen: boolean
  onClose: () => void
  onApply: (selectedCountries: Country[]) => void
  initialSelectedCountries?: Country[]
}

export default function ShippingDestination({
  isOpen,
  onClose,
  onApply,
  initialSelectedCountries = [],
}: ShippingDestinationProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(initialSelectedCountries)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchCountries()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedCountries(initialSelectedCountries)
  }, [initialSelectedCountries])

  const fetchCountries = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/shippingdestination")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      const formattedCountries = data.map((country: any) => ({
        id: country.id || country.country_id,
        name: country.name || country.country,
      }))
      setCountries(formattedCountries || [])
    } catch (err) {
      console.error("Error fetching countries:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCountrySelection = (country: Country) => {
    setSelectedCountries(
      selectedCountries.some((c) => c.id === country.id)
        ? selectedCountries.filter((c) => c.id !== country.id)
        : [...selectedCountries, country],
    )
  }

  const removeSelectedCountry = (countryId: number | string) => {
    setSelectedCountries(selectedCountries.filter((country) => country.id !== countryId))
  }

  const handleApply = () => {
    onApply(selectedCountries)
    onClose()
  }

  const filteredCountries = countries.filter((country) =>
   country.name.toLowerCase().includes(searchQuery.toLowerCase()),
  
  
  )
   

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-[45%]  max-h-[85vh] flex flex-col overflow-y-auto "
        style={{ border: "1px solid #e2e8f0" }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-medium mb-4">Select countries</h2>

          {/* Selected Countries Pills */}
          {selectedCountries.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCountries.map((country) => (
                <div key={country.id} className="flex items-center bg-gray-200 rounded-md px-3 py-1">
                  <span>{country.name}</span>
                  <button
                    onClick={() => removeSelectedCountry(country.id)}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                  >
                    <X size={16} className="hover:text-gray-900 cursor-pointer" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by country name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-[50vh]">
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : filteredCountries.length === 0 ? (
              <p className="text-center py-4">No countries found</p>
            ) : (
              filteredCountries.map((country) => (
                <div key={country.id} className="py-4 border-b border-gray-300">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox  bg-blend-color-burn cursor-pointer h-5 w-5 rounded text-blue-600"
                      checked={selectedCountries.some((c) => c.id === country.id)}
                      onChange={() => toggleCountrySelection(country)}
                    />
                    <span className="ml-2 font-serif">{country.name}</span>
                  </label>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6 ">
            <button onClick={onClose} className="px-4 py-2 text-blue-600 hover:underline cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
