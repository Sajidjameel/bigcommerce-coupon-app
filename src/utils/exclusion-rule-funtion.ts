"use client"

import { extractIds, parseCategoryJson, parseIds } from "./extract-ids-function"

export const processExclusionRules = (exclusionRules: any[]) => {
    if (!exclusionRules || !Array.isArray(exclusionRules) || exclusionRules.length === 0) {
      return null
    }

    const exclusionConditions: any[] = []

    for (const exclusion of exclusionRules) {
      if (!exclusion) continue

      const condition: any = {}

      if (exclusion.type === "individual" && exclusion.value) {
        const products = parseIds(exclusion.value)
        if (products.length > 0) {
          condition.products = extractIds(products)
        }
      } else if (exclusion.type === "category") {
        try {
          if (exclusion.value && typeof exclusion.value === "string") {
            const categoryIds = parseCategoryJson(exclusion.value)
            if (categoryIds.length > 0) {
              condition.categories = categoryIds
            }
          }

          if (exclusion.selectedItems && Array.isArray(exclusion.selectedItems) && exclusion.selectedItems.length > 0) {
            const selectedIds = exclusion.selectedItems.map((item: any) => Number(item.id))
            if (!condition.categories) {
              condition.categories = selectedIds
            } else {
              condition.categories = [...new Set([...condition.categories, ...selectedIds])]
            }
          }
        } catch (e) {
                    console.error("Failed to parse JSON array:", e)

          // Silent error
        }
      } else if (exclusion.type === "brand" && exclusion.value) {
        const brands = parseIds(exclusion.value)
        if (brands.length > 0) {
          condition.brands = extractIds(brands)
        }
      } else if (exclusion.type === "custom_field") {
        try {
          let name = null
          let values = null

          if (exclusion.value) {
            const parsed = JSON.parse(exclusion.value)
            if (parsed.fieldName && parsed.fieldValues) {
              name = parsed.fieldName.trim()
              values = Array.isArray(parsed.fieldValues)
                ? parsed.fieldValues.map((v: string) => v.trim())
                : [parsed.fieldValues.trim()]
            }
          }

          if (!name && exclusion.name && exclusion.values) {
            name = exclusion.name.trim()
            values = Array.isArray(exclusion.values)
              ? exclusion.values.map((v: string) => v.trim())
              : [exclusion.values.trim()]
          }

          if (name && values) {
            condition.product_custom_field = { name, values }
          }
        } catch (e) {
          console.error("Error processing custom field rule:", e)
        }
      } else if (exclusion.type === "product_option") {
        try {
          let name = null
          let values = null
          const type = exclusion.optionType || "string_match"

          if (exclusion.value) {
            const parsed = JSON.parse(exclusion.value)
            if (parsed.optionName && parsed.optionValues) {
              name = parsed.optionName.trim()
              values = Array.isArray(parsed.optionValues)
                ? parsed.optionValues.map((v: string) => v.trim())
                : [parsed.optionValues.trim()]
            }
          }

          if (!name && exclusion.name && exclusion.values) {
            name = exclusion.name.trim()
            values = Array.isArray(exclusion.values)
              ? exclusion.values.map((v: string) => v.trim())
              : [exclusion.values.trim()]
          }

          if (name && values) {
            condition.product_option = { type, name, values }
          }
        } catch (e) {
          console.error("Error processing product option rule:", e)
        }
      }

      if (Object.keys(condition).length > 0) {
        exclusionConditions.push(condition)
      }
    }

    if (exclusionConditions.length === 0) return null
    if (exclusionConditions.length === 1) return exclusionConditions[0]

    return { and: exclusionConditions }
  }



  