"use client"

import { Category, CategorySelectorModalProps, SelectedCategory } from "./models"
import { ChevronRight, Store } from "lucide-react"
import { renderSkeletonCategories } from "./utils"
import { renderCategory } from "./render-category"
import { fetchCategories } from "./__request"
import { useEffect, useState } from "react"

let categoriesCache: any = null
let globalSelectedCategories = new Map<string, SelectedCategory>()

export function CategorySelectorModal({
  isOpen,
  onClose,
  onApply,
  initialSelectedCategories = [],
}: CategorySelectorModalProps) {

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Map<string, SelectedCategory>>(new Map())
  const [expandedTrees, setExpandedTrees] = useState<Set<number>>(new Set())

  // Initialize with default tree data
  const defaultTrees = [
    { id: 1, name: "Hasham store" },
    { id: 2, name: "next" },
  ]
  const [trees, setTrees] = useState(defaultTrees)

  // Group categories by tree_id
  const categoriesByTree = categories.reduce(
    (acc, category) => {
      const treeId = category.tree_id
      if (!acc[treeId]) {
        acc[treeId] = []
      }
      acc[treeId].push(category)
      return acc
    },
    {} as Record<number, Category[]>,
  )

  // Toggle tree expansion
  const toggleTree = (treeId: number) => {
    setExpandedTrees((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(treeId)) {
        newSet.delete(treeId)
      } else {
        newSet.add(treeId)
      }
      return newSet
    })
  }

  // Count selected categories within a tree
  const getTreeSelectionCount = (treeId: number) => {
    let count = 0
    selectedCategories.forEach((category) => {
      if (category.channelId === treeId) {
        count++
      }
    })
    return count > 0 ? count : undefined
  }

  // Handle apply button click
  const handleApply = () => {
    const selectedArray = Array.from(selectedCategories.values())
    // Update global state for future opens
    globalSelectedCategories = new Map(selectedCategories)

    // Pass the current selection state back to the parent component
    onApply(selectedArray)
    onClose()
  }

  // Initialize selected categories from props on first render and when initialSelectedCategories changes
  useEffect(() => {
    if (isOpen) {
      // Start with a fresh selection state based on initialSelectedCategories
      const selectedMap = new Map<string, SelectedCategory>()

      // If we have initialSelectedCategories, use those
      if (initialSelectedCategories && initialSelectedCategories.length > 0) {
        initialSelectedCategories.forEach((category) => {
          const key = `${category.channelId}-${category.id}`
          selectedMap.set(key, category)
        })
      }

      setSelectedCategories(selectedMap)
      // Update global state for future opens
      globalSelectedCategories = new Map(selectedMap)
    }
  }, [initialSelectedCategories, isOpen])

  // Fetch categories from API
  useEffect(() => {
    if (!isOpen) return
    fetchCategories(setLoading, setError, setCategories, categoriesCache)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-medium mb-4">Select Categories</h2>

        {loading ? (
          // Skeleton loading UI
          <div className="mb-6 max-h-[60vh] overflow-y-auto">{renderSkeletonCategories()}</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="mb-6 max-h-[60vh] overflow-y-auto">
            {trees.map((tree, index) => {
              const isExpanded = expandedTrees.has(tree.id)
              const selectionCount = getTreeSelectionCount(tree.id)
              const treeCategories = categoriesByTree[tree.id] || []

              return (
                <div key={tree.id} className={`mb-2 ${index === 1 ? "bg-gray-50" : ""} rounded`}>
                  <div className="flex items-center py-2 px-2 cursor-pointer" onClick={() => toggleTree(tree.id)}>
                    <ChevronRight className="w-4 h-4 text-gray-500 mr-1 cursor-pointer" />
                    <Store className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">
                      {tree.name} {selectionCount && `(${selectionCount})`}
                    </span>
                  </div>

                  {isExpanded && treeCategories.map((category) => renderCategory(category, expandedCategories, setExpandedCategories, trees, selectedCategories, setSelectedCategories))}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
