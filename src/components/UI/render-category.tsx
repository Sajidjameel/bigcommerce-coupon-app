import { ChevronDown, ChevronRight } from "lucide-react"
import { Category, SelectedCategory } from "./models"
import { Dispatch, SetStateAction } from "react"


// Count selected categories within a parent category
const getCategorySelectionCount = (category: Category, path = "", selectedCategories: Map<string, SelectedCategory>) => {
    const categoryPath = path ? `${path}/${category.name}` : `/${category.name}`
    let count = 0
    selectedCategories.forEach((selected) => {
        if (selected.channelId === category.tree_id && selected.path && selected.path.startsWith(categoryPath)) {
            count++
        }
    })
    return count > 0 ? count : undefined
}

// Toggle category selection
const toggleCategorySelection = (category: Category, setSelectedCategories: Dispatch<SetStateAction<Map<string, SelectedCategory>>>, trees: {id: number, name: string}[], path = "") => {
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
const isCategorySelected = (treeId: number, categoryId: number, selectedCategories: Map<string, SelectedCategory>) => {
    return selectedCategories.has(`${treeId}-${categoryId}`)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toggleCategory = (category: Category, setExpandedCategories: Dispatch<SetStateAction<Set<string>>>) => {
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

// Render a category and its children recursively
export const renderCategory = (
    category: Category, 
    expandedCategories: Set<string>, 
    setExpandedCategories: Dispatch<SetStateAction<Set<string>>>, 
    trees: {id: number, name: string}[],  
    selectedCategories: Map<string, SelectedCategory>, 
    setSelectedCategories: Dispatch<SetStateAction<Map<string, SelectedCategory>>>, 
    path = "", level = 0
) => {
    const hasChildren = category.children && category.children.length > 0
    const categoryPath = path ? `${path}/${category.name}` : `/${category.name}`
    const isExpanded = expandedCategories.has(`${category.tree_id}-${category.category_id}`)
    const selectionCount = getCategorySelectionCount(category, path, selectedCategories)

    return (
        <div key={`${category.tree_id}-${category.category_id}`} className="ml-6">
            <div className="flex items-center py-2">
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={() => toggleCategory(category, setExpandedCategories)}
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
                        checked={isCategorySelected(category.tree_id, category.category_id, selectedCategories)}
                        onChange={() => toggleCategorySelection(category, setSelectedCategories, trees, path)}
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
                    {category.children!.map((child) => renderCategory(child, expandedCategories, setExpandedCategories, trees, selectedCategories, setSelectedCategories, categoryPath, level + 1))}
                </div>
            )}
        </div>
    )
}
