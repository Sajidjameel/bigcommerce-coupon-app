import { Dispatch, SetStateAction } from "react"
import { Category } from "./models"

  export const fetchCategories = async (
    setLoading: Dispatch<SetStateAction<boolean>>,
    setError: Dispatch<SetStateAction<string | null>>,
    setCategories: Dispatch<SetStateAction<Category[]>>,
    categoriesCache: Category[]
) => {
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