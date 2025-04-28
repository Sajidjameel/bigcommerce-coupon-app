"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"

interface Brand {
  id: number
  name: string
}

interface BrandSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (brands: Brand[] | Brand) => void
  multiple?: boolean
  initialSelectedBrands?: Brand[]
}

export function BrandSelectionModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  initialSelectedBrands = [],
}: BrandSelectionModalProps) {
  // State for brands and UI
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  // State for selected brands
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>(initialSelectedBrands || [])

  // Fetch brands from API
  const fetchBrands = async (page = 1, search = "") => {
    setLoading(true)
    setError(null)

    try {
      // Build query string
      const queryParams = new URLSearchParams()
      if (search) {
        queryParams.append("search", search)
      }
      queryParams.append("page", page.toString())

      // Make API request
      const response = await fetch(`/api/brands?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch brands (${response.status})`)
      }

      const data = await response.json()

      // Check if the response has the expected structure
      if (!data.data) {
        throw new Error("Invalid API response structure")
      }

      setBrands(data.data)

      // Set pagination data if available
      if (data.meta && data.meta.pagination) {
        setTotalPages(data.meta.pagination.total_pages || 1)
        setCurrentPage(data.meta.pagination.current_page || 1)
        setTotalItems(data.meta.pagination.total || data.data.length)
      } else {
        setTotalPages(1)
        setCurrentPage(1)
        setTotalItems(data.data.length)
      }
    } catch (err) {
      console.error("Error fetching brands:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")

      // Fallback to mock data for demonstration
      const mockBrands = [
        { id: 1, name: "Chairs" },
        { id: 2, name: "Front Row Furniture" },
        { id: 3, name: "OFS" },
        { id: 4, name: "Sagaform" },
        { id: 5, name: "Tables" },
      ]

      setBrands(mockBrands)
      setTotalPages(1)
      setCurrentPage(1)
      setTotalItems(mockBrands.length)
    } finally {
      setLoading(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBrands(1, searchTerm)
  }

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      fetchBrands(currentPage - 1, searchTerm)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
      fetchBrands(currentPage + 1, searchTerm)
    }
  }

  // Toggle brand selection
  const toggleBrandSelection = (brand: Brand) => {
    if (multiple) {
      setSelectedBrands((prev) => {
        const isSelected = prev.some((b) => b.id === brand.id)
        if (isSelected) {
          return prev.filter((b) => b.id !== brand.id)
        } else {
          return [...prev, brand]
        }
      })
    } else {
      setSelectedBrands([brand])
    }
  }

  // Handle apply button click
  const handleApply = () => {
    if (multiple) {
      onSelect(selectedBrands)
    } else if (selectedBrands.length > 0) {
      onSelect(selectedBrands[0])
    }
    onClose()
  }

  // Reset search and fetch brands when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("")
      fetchBrands(1)

      // Initialize selected brands if provided
      if (initialSelectedBrands && initialSelectedBrands.length > 0) {
        setSelectedBrands(initialSelectedBrands)
      }
    }
  }, [isOpen, initialSelectedBrands])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-b-md shadow-lg w-[50%] max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-medium mb-6">Select Brands</h2>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <input
                type="text"
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please search using whole brand name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700">
              Search
            </button>
          </form>

          {/* Brands List */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">{totalItems} Brands</div>
              <div className="text-sm text-gray-500">
                {currentPage} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-250px)]">
              {loading ? (
                <div className="py-4 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2">Loading brands...</p>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-500">{error}</div>
              ) : brands.length === 0 ? (
                <div className="py-4 text-center">No brands found</div>
              ) : (
                <div className="divide-y divide-gray-300">
                  {brands.map((brand) => (
                    <div key={brand.id} className="py-3">
                      <label className="flex items-center space-x-12 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox  bg-blend-color  h-4 w-4 text-blue-600 cursor-pointer border-gray-100  focus:ring-blue-500"
                          checked={selectedBrands.some((b) => b.id === brand.id)}
                          onChange={() => toggleBrandSelection(brand)}
                        />
                        <span className="text-gray-700 font-thin">{brand.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mb-6">
            {/* <div className="text-sm text-gray-500">
              {currentPage} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
            </div> */}
            {/* <div className="flex gap-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || loading}
                className={`p-1 border rounded ${
                  currentPage <= 1 || loading ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50 cursor-pointer"
                }`}
              >
                &lt;
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || loading}
                className={`p-1 border rounded ${
                  currentPage >= totalPages || loading
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50 cursor-pointer"
                }`}
              >
                &gt;
              </button>
            </div> */}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-blue-600 hover:underline cursor-pointer">
              Cancel
            </button>
            <button onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
