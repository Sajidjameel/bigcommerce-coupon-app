"use client"

import React, { createContext, useContext, useState } from "react"
import type { Product } from "@/types/rule-types"

interface ProductSearchContextType {
  productsByPage: Map<number, Product[]>
  currentSearchTerm: string
  currentPage: number
  totalPages: number
  loading: boolean
  error: string | null
  fetchProducts: (page?: number, search?: string) => Promise<void>
  setSearchTerm: (term: string) => void
}

const ProductSearchContext = createContext<ProductSearchContextType | undefined>(undefined)

export const useProductSearch = () => {
  const context = useContext(ProductSearchContext)
  if (!context) throw new Error("useProductSearch must be used within ProductSearchProvider")
  return context
}

export const ProductSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [productsByPage, setProductsByPage] = useState<Map<number, Product[]>>(new Map())
  const [currentSearchTerm, setCurrentSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async (page = 1, search = currentSearchTerm) => {
    setError(null)

    if (productsByPage.has(page) && search === currentSearchTerm) {
      setCurrentPage(page)
      return // Skip fetch if already cached
    }

    setLoading(true)
    try {
      const url = `/api/products?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      const res = await fetch(url)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to fetch")
      }

      const data = await res.json()
      setProductsByPage((prev) => new Map(prev).set(page, data.products))
      setTotalPages(data.pagination.total_pages)
      setCurrentPage(data.pagination.current_page)
      setCurrentSearchTerm(search)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const setSearchTerm = (term: string) => {
    setCurrentSearchTerm(term)
    setProductsByPage(new Map()) // Clear old cache if search changes
  }

  return (
    <ProductSearchContext.Provider
      value={{
        productsByPage,
        currentSearchTerm,
        currentPage,
        totalPages,
        loading,
        error,
        fetchProducts,
        setSearchTerm,
      }}
    >
      {children}
    </ProductSearchContext.Provider>
  )
}
