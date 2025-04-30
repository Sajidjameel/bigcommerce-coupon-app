"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Product } from "@/types/rule-types"

interface Pagination {
  total_pages: number
  current_page: number
  total: number
  count: number
}

interface ProductSearchContextType {
  productsByPage: Map<number, Product[]>
  currentPage: number
  totalPages: number
  loading: boolean
  error: string | null
  fetchProducts: (page: number, search: string) => Promise<void>
}

const ProductSearchContext = createContext<ProductSearchContextType | undefined>(undefined)

export function ProductSearchProvider({ children }: { children: ReactNode }) {
  const [productsByPage, setProductsByPage] = useState<Map<number, Product[]>>(new Map())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSearchTerm, setLastSearchTerm] = useState("")
  const [lastRequestTime, setLastRequestTime] = useState(0)

  const fetchProducts = useCallback(
    async (page: number, search: string) => {
      // Set current page immediately to avoid UI jumps
      setCurrentPage(page)

      // Check if we already have the products for this page and search term
      // Only fetch if we don't have the data or if the search term has changed
      if (productsByPage.has(page) && search === lastSearchTerm) {
        console.log(`Using cached products for page ${page} with search "${search}"`)
        return
      }

      // Prevent duplicate requests within a short time period
      const now = Date.now()
      if (now - lastRequestTime < 300 && search === lastSearchTerm) {
        return
      }

      setLastRequestTime(now)
      setLastSearchTerm(search)

      // Don't set loading state for very quick searches to prevent UI flicker
      const loadingTimeout = setTimeout(() => {
        setLoading(true)
      }, 200)

      try {
        // Build the query URL
        const queryParams = new URLSearchParams()
        queryParams.append("page", page.toString())
        if (search) {
          queryParams.append("search", search)
        }

        console.log(`Fetching products for page ${page} with search "${search}"`)

        // Fetch products from the API
        const response = await fetch(`/api/products?${queryParams.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to fetch products (${response.status})`)
        }

        const data = await response.json()

        // Clear the loading timeout
        clearTimeout(loadingTimeout)

        // Update state with the fetched products
        setProductsByPage((prev) => {
          const newMap = new Map(prev)
          newMap.set(page, data.products)
          return newMap
        })
        setTotalPages(data.pagination.total_pages)
        setLoading(false)
      } catch (err) {
        clearTimeout(loadingTimeout)
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch products")
        setLoading(false)
      }
    },
    [productsByPage, lastSearchTerm, lastRequestTime],
  )

  const value = {
    productsByPage,
    currentPage,
    totalPages,
    loading,
    error,
    fetchProducts,
  }

  return <ProductSearchContext.Provider value={value}>{children}</ProductSearchContext.Provider>
}

export function useProductSearch() {
  const context = useContext(ProductSearchContext)
  if (context === undefined) {
    throw new Error("useProductSearch must be used within a ProductSearchProvider")
  }
  return context
}
