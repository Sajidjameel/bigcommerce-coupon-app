  "use client"

import { processExclusionRules } from "./exclusion-rule-funtion"
import { extractIds, parseCategoryJson, parseIds } from "./extract-ids-function"

  
  
  export const processInclusionRule = (inclusionRule: any) => {
    if (!inclusionRule) return { products: [1] } // Default to a valid product to avoid empty items error

    const result: any = {}

    // Process main inclusion rule
    if (inclusionRule.type === "individual" && inclusionRule.value) {
      const products = parseIds(inclusionRule.value)
      if (products.length > 0) {
        result.products = extractIds(products)

      }
    } else if (inclusionRule.type === "category") {
      if (inclusionRule.selectedItems?.length) {
        result.categories = inclusionRule.selectedItems.map((item: any) => Number(item.id))
      } else if (inclusionRule.value) {
        const categoryIds = parseCategoryJson(inclusionRule.value)
        if (categoryIds.length > 0) {
          result.categories = categoryIds
        }
      }
      // Also check value field as fallback
      else if (inclusionRule.value) {
        const categoryIds = parseCategoryJson(inclusionRule.value)
        if (categoryIds.length > 0) {
          result.categories = categoryIds
        }
      }
    } else if (inclusionRule.type === "brand" && inclusionRule.value) {
      const brands = parseIds(inclusionRule.value)
      if (brands.length > 0) {
        result.brands = extractIds(brands)
      }
    } else if (inclusionRule.type === "custom_field") {
      try {
        let name = null
        let values = null

        if (inclusionRule.value) {
          const parsed = JSON.parse(inclusionRule.value)
          if (parsed.fieldName && parsed.fieldValues) {
            name = parsed.fieldName.trim()
            values = Array.isArray(parsed.fieldValues)
              ? parsed.fieldValues.map((v: string) => v.trim())
              : [parsed.fieldValues.trim()]
          }
        }

        if (!name && inclusionRule.name && inclusionRule.values) {
          name = inclusionRule.name.trim()
          values = Array.isArray(inclusionRule.values)
            ? inclusionRule.values.map((v: string) => v.trim())
            : [inclusionRule.values.trim()]
        }

        if (name && values) {
          result.product_custom_field = { name, values }
        }
      } catch (e) {
        console.error("Error processing custom field rule:", e)
      }
    } else if (inclusionRule.type === "product_option") {
      try {
        let name = null
        let values = null
        const type = inclusionRule.optionType || "string_match"

        if (inclusionRule.value) {
          const parsed = JSON.parse(inclusionRule.value)
          if (parsed.optionName && parsed.optionValues) {
            name = parsed.optionName.trim()
            values = Array.isArray(parsed.optionValues)
              ? parsed.optionValues.map((v: string) => v.trim())
              : [parsed.optionValues.trim()]
          }
        }

        if (!name && inclusionRule.name && inclusionRule.values) {
          name = inclusionRule.name.trim()
          values = Array.isArray(inclusionRule.values)
            ? inclusionRule.values.map((v: string) => v.trim())
            : [inclusionRule.values.trim()]
        }

        if (name && values) {
          result.product_option = { type, name, values }
        }
      } catch (e) {
        console.error("Error processing product option rule:", e)
      }
    } else if (inclusionRule.type === "all") {
      return null
    }

    // Process additionalConditions if they exist
    if (
      inclusionRule.additionalConditions &&
      Array.isArray(inclusionRule.additionalConditions) &&
      inclusionRule.additionalConditions.length > 0
    ) {
      // Create an AND condition if we have both main condition and additional conditions
      if (Object.keys(result).length > 0) {
        const andConditions = [{ ...result }]

        // Process each additional condition
        for (const condition of inclusionRule.additionalConditions) {
          const additionalResult: any = {}

          if (condition.type === "individual" && condition.value) {
            const products = parseIds(condition.value)
            if (products.length > 0) {
              additionalResult.products = extractIds(products)
            }
          } else if (condition.type === "category") {
            // Try to parse category value
            if (condition.value) {
              const categoryIds = parseCategoryJson(condition.value)
              if (categoryIds.length > 0) {
                additionalResult.categories = categoryIds
              }
            }
          } else if (condition.type === "brand" && condition.value) {
            const brands = parseIds(condition.value)
            if (brands.length > 0) {
              additionalResult.brands = extractIds(brands)
            }
          } else if (condition.type === "custom_field" && condition.name && condition.values) {
            additionalResult.product_custom_field = {
              name: condition.name.trim(),
              values: Array.isArray(condition.values) ? condition.values : [condition.values],
            }
          } else if (condition.type === "product_option" && condition.name && condition.values) {
            additionalResult.product_option = {
              type: condition.optionType || "string_match",
              name: condition.name.trim(),
              values: Array.isArray(condition.values) ? condition.values : [condition.values],
            }
          }
          if (Object.keys(additionalResult).length > 0) {
            andConditions.push(additionalResult)
          }
        }

        // If we have multiple conditions, return them as an AND
        if (andConditions.length > 1) {
          return { and: andConditions }
        } else if (andConditions.length === 1) {
          return andConditions[0]
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null
  }

// Create complex Condition funtion 

export  const createComplexCondition = (rule: any) => {
    const condition: any = {
      cart: {
        minimum_quantity: 1,
        items: {},
      },
    }

    const inclusionItems = rule.config?.inclusionRule
      ? processInclusionRule(rule.config.inclusionRule)
      : { products: [1] }
    const exclusionItems = rule.config?.exclusionRules ? processExclusionRules(rule.config.exclusionRules) : null

    if (inclusionItems && exclusionItems) {
      condition.cart.items.and = []

      // Add inclusion items first
      if (inclusionItems.all) {
        // For "all products", we need at least one product to satisfy the API
        condition.cart.items.products = [1]
      } else if (inclusionItems.and) {
        // If inclusion items already has an AND condition, add each item separately
        condition.cart.items.and.push(...inclusionItems.and)
      } else {
        condition.cart.items.and.push(inclusionItems)
      }

      // Add exclusion as NOT condition with AND inside
      if (exclusionItems) {
        condition.cart.items.and.push({
          not: exclusionItems,
        })
      }
    } else if (inclusionItems) {
      // Only inclusion rules
      if (inclusionItems.all) {
        // For "all products", we need at least one product to satisfy the API
        condition.cart.items.products = [1]
      } else if (inclusionItems.and) {
        // If inclusion items has an AND condition, use it directly
        condition.cart.items.and = inclusionItems.and
      } else {
        Object.assign(condition.cart.items, inclusionItems)
      }
    } else if (exclusionItems) {
      // Only exclusion rules - wrap in NOT
      condition.cart.items.not = exclusionItems
      // Also add a default product to satisfy the API requirement
      condition.cart.items.products = [1]
    } else {
      // No rules at all, add a default product
      condition.cart.items.products = [1]
    }

    return condition
  }