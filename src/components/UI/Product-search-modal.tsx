"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/types/rule-types"
import { useProductSearch } from "../Context/ProductsContext"

interface ProductSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (products: Product[] | Product) => void
  selectedProduct?: Product | Product[] | null
  multiple?: boolean
}

export function ProductSearchModal({
  isOpen,
  onClose,
  onSelect,
  selectedProduct,
  multiple = false,
}: ProductSearchModalProps) {
  const { productsByPage, currentPage, totalPages, loading, error, fetchProducts } = useProductSearch()

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [lastSearchTerm, setLastSearchTerm] = useState("") // Added state to track last search term
  const modalRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [currentPageState, setCurrentPageState] = useState(1)

  // Initialize selected products when modal opens or selectedProduct changes
  useEffect(() => {
    if (isOpen) {
      if (selectedProduct) {
        const products = Array.isArray(selectedProduct) ? selectedProduct : [selectedProduct]
        setSelectedProducts(products)
      } else {
        setSelectedProducts([])
      }

      // Reset search term when opening modal
      setSearchTerm("")

      // Only fetch products on initial open if we haven't already
      if (isInitialMount.current) {
        fetchProducts(1, "")
        isInitialMount.current = false
      }

      // Focus the search input when modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }
  }, [isOpen, selectedProduct, fetchProducts])

  const handleSelectProduct = (product: Product) => {
    if (multiple) {
      // If multiple products are allowed, toggle the selection
      const alreadySelected = selectedProducts.find((p) => p.id === product.id)
      if (alreadySelected) {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))
      } else {
        setSelectedProducts((prev) => [...prev, product])
      }
    } else {
      // If only one product can be selected, set it as the only selected product
      setSelectedProducts([product])
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Just update the search term, don't filter yet
    setSearchTerm(e.target.value)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Only perform search when form is submitted (Enter key or Search button)
    setLastSearchTerm(searchTerm) // Update last search term
    fetchProducts(1, searchTerm)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      // Always fetch the new page data to ensure we have the latest
      fetchProducts(page, searchTerm)
    }
  }

  const handleApply = () => {
    if (selectedProducts.length > 0) {
      onSelect(multiple ? selectedProducts : selectedProducts[0])
    }
    onClose()
  }

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

  const products = productsByPage.get(currentPage) || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Select Products</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5 cursor-pointer" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-20 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by product name or SKU"
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={loading}
              />
              <button
                type="submit"
                className={`cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 ${
                  loading ? "bg-gray-400" : "bg-blue-600"
                } text-white rounded`}
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-4 min-h-[500px]">
            {loading ? (
              /* Skeleton loading UI */
              <div>
                <div className="text-sm text-gray-500 mb-2">Loading products...</div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="w-10 p-2"></th>
                      <th className="w-20 p-2"></th>
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">SKU</th>
                      <th className="text-right p-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, i) => (
                      <tr key={i} className="border-b animate-pulse">
                        <td className="p-2 text-center">
                          <div className="w-4 h-4 bg-gray-200 rounded mx-auto"></div>
                        </td>
                        <td className="p-2">
                          <div className="w-[50px] h-[50px] bg-gray-200 rounded"></div>
                        </td>
                        <td className="p-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </td>
                        <td className="p-2">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </td>
                        <td className="p-2 text-right">
                          <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? "No products found matching your search." : "No products available."}
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-500 mb-2">{products.length} Products</div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="w-10 p-2"></th>
                      <th className="w-20 p-2"></th>
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">SKU</th>
                      <th className="text-right p-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.some((p) => p.id === product.id)}
                            onChange={() => handleSelectProduct(product)}
                            className="w-4 h-4 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-2">
                          {product.primary_image ? (
                            <Image
                              src={product.primary_image.url_standard || "/placeholder.svg?height=50&width=50"}
                              alt={product.name}
                              width={50}
                              height={50}
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-[50px] h-[50px] bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              No image
                            </div>
                          )}
                        </td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.sku}</td>
                        <td className="p-2 text-right">${product.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className={`px-3 py-1 border rounded ${
                currentPage <= 1 || loading
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              &lt;
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className={`px-3 py-1 border rounded ${
                currentPage >= totalPages || loading
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              &gt;
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedProducts.length === 0}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                selectedProducts.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500"
              }`}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
