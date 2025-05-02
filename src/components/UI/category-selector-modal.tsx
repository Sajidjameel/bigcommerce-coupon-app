"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight, Store } from "lucide-react"

interface Category {
  category_id: number
  parent_id: number
  tree_id: number
  name: string
  url: {
    path: string
    is_customized: boolean
  }
  is_visible: boolean
  children?: Category[]
  count?: number
}

interface CategorySelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (selectedCategories: SelectedCategory[]) => void
  initialSelectedCategories?: SelectedCategory[]
}

interface SelectedCategory {
  id: number
  name: string
  channelId: number
  channelName: string
  path?: string
}

// Cache for API responses
const channelsCache: any = null
let categoriesCache: any = null

// Global state to remember selections across modal opens
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

    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        // Use cached data if available
        if (categoriesCache) {
          setCategories(categoriesCache)
          setLoading(false)
          return
        }

        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()

        // Process the data to create a hierarchical structure
        const categoryMap = new Map<number, Category>()
        data.data.forEach((category: Category) => {
          categoryMap.set(category.category_id, { ...category, children: [] })
        })

        // Build the tree structure
        const rootCategories: Category[] = []
        data.data.forEach((category: Category) => {
          const processedCategory = categoryMap.get(category.category_id)!

          if (category.parent_id === 0) {
            rootCategories.push(processedCategory)
          } else {
            const parent = categoryMap.get(category.parent_id)
            if (parent) {
              parent.children = parent.children || []
              parent.children.push(processedCategory)
            }
          }
        })

        setCategories(rootCategories)

        // Cache the categories
        categoriesCache = rootCategories
      } catch (err) {
        setError("Failed to load categories. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [isOpen])

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

  // Toggle category expansion
  const toggleCategory = (category: Category, path = "") => {
    const key = `${category.tree_id}-${category.category_id}`
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  // Toggle category selection
  const toggleCategorySelection = (category: Category, path = "") => {
    const key = `${category.tree_id}-${category.category_id}`
    const newPath = path ? `${path}/${category.name}` : `/${category.name}`

    setSelectedCategories((prev) => {
      const newMap = new Map(prev)
      if (newMap.has(key)) {
        newMap.delete(key)
      } else {
        newMap.set(key, {
          id: category.category_id,
          name: category.name,
          channelId: category.tree_id,
          channelName: trees.find((t) => t.id === category.tree_id)?.name || `Tree ${category.tree_id}`,
          path: newPath,
        })
      }
      return newMap
    })
  }

  // Check if a category is selected
  const isCategorySelected = (treeId: number, categoryId: number) => {
    return selectedCategories.has(`${treeId}-${categoryId}`)
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

  // Count selected categories within a parent category
  const getCategorySelectionCount = (category: Category, path = "") => {
    const categoryPath = path ? `${path}/${category.name}` : `/${category.name}`
    let count = 0
    selectedCategories.forEach((selected) => {
      if (selected.channelId === category.tree_id && selected.path && selected.path.startsWith(categoryPath)) {
        count++
      }
    })
    return count > 0 ? count : undefined
  }

  // Render a category and its children recursively
  const renderCategory = (category: Category, path = "", level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const categoryPath = path ? `${path}/${category.name}` : `/${category.name}`
    const isExpanded = expandedCategories.has(`${category.tree_id}-${category.category_id}`)
    const selectionCount = getCategorySelectionCount(category, path)

    return (
      <div key={`${category.tree_id}-${category.category_id}`} className="ml-6">
        <div className="flex items-center py-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleCategory(category, categoryPath)}
              className="mr-1 focus:outline-none"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 cursor-pointer" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 cursor-pointer" />
              )}
            </button>
          ) : (
            <div className="w-4 mr-1"></div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id={`category-${category.tree_id}-${category.category_id}`}
              checked={isCategorySelected(category.tree_id, category.category_id)}
              onChange={() => toggleCategorySelection(category, path)}
              className="mr-2 rounded size-4 opacity-70 border-gray-50 text-blue-600 focus:ring-blue-600 cursor-pointer "
            />
            <label htmlFor={`category-${category.tree_id}-${category.category_id}`} className="flex items-center ">
              <div className="flex items-center">
                <span className="text-blue-500 cursor-pointer">📁</span>
                <span className="ml-1">{category.name}</span>
                {selectionCount && <span className="ml-1 text-gray-500">({selectionCount})</span>}
              </div>
            </label>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children!.map((child) => renderCategory(child, categoryPath, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Render skeleton loading UI for categories
  const renderSkeletonCategories = () => {
    return (
      <div className="animate-pulse">
        {[...Array(2)].map((_, index) => (
          <div
            key={`skeleton-category-${index}`}
            className={`flex items-center px-4 py-3 rounded ${
              index === 1 ? "bg-gray-50" : ""
            }`}
          >
            {/* Chevron icon placeholder */}
            <div className="w-4 h-4 bg-gray-200 rounded-sm mr-3"></div>
  
            {/* Store/category icon */}
            <div className="w-5 h-5 bg-gray-300 rounded mr-3"></div>
  
            {/* Label line */}
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  };
  
  // Handle apply button click
  const handleApply = () => {
    const selectedArray = Array.from(selectedCategories.values())

    // Update global state for future opens
    globalSelectedCategories = new Map(selectedCategories)

    // Pass the current selection state back to the parent component
    onApply(selectedArray)
    onClose()
  }

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

                  {isExpanded && treeCategories.map((category) => renderCategory(category))}
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
