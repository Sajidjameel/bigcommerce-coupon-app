"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/types/rule-types"

interface ProductSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
  selectedProduct: Product | null
}

export function ProductSearchModal({ isOpen, onClose, onSelect, selectedProduct }: ProductSearchModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [localSelectedProduct, setLocalSelectedProduct] = useState<Product | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedProduct(null)
      setSelectionError(null)
    }
  }, [isOpen])

  const fetchProducts = async (page = 1, search = "") => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/products?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setProducts(data.products)
      setTotalPages(data.pagination.total_pages)
      setCurrentPage(data.pagination.current_page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProduct = (product: Product) => {
    // If clicking the same product, deselect it
    if (localSelectedProduct?.id === product.id) {
      setLocalSelectedProduct(null)
      setSelectionError(null)
      return
    }

    // If trying to select a different product while one is already selected
    if (localSelectedProduct && localSelectedProduct.id !== product.id) {
      setSelectionError("You can only select one product to be automatically added to the cart.")
      return
    }

    // Select new product
    setLocalSelectedProduct(product)
    setSelectionError(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts(1, searchTerm)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts(page, searchTerm)
  }

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

  useEffect(() => {
    if (isOpen) {
      fetchProducts(1, searchTerm)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Select Products</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="text"
                className=" w-full border border-gray-300 rounded-lg pl-10 pr-20 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by product name or SKU"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded "
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Product List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2">Loading products...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center">No products found</div>
          ) : (
            <div className="p-4">
              {selectionError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                  {selectionError}
                </div>
              )}
              <div className="text-sm text-gray-500 mb-2">{products.length} Products</div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
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
                          checked={localSelectedProduct?.id === product.id}
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
                            Image coming soon 
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

        {/* Modal Footer with Pagination */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className={`px-3 py-1 border rounded ${
                currentPage <= 1 || loading ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50 cursor-pointer"
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
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => {
                if (localSelectedProduct) {
                  onSelect(localSelectedProduct)
                }
                onClose()
              }}
              disabled={!localSelectedProduct}
              className={`px-4 py-2 rounded-lg ${
                localSelectedProduct
                  ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
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