"use client"

export const extractIds = (items: Array<{ id: number; name: string }>): number[] => {
    return items.map((item) => item.id)
  }

  // Helper function to parse JSON string containing category objects
 export const parseCategoryJson = (jsonString: string): number[] => {
    try {
      // Try to parse as a JSON array first
      if (jsonString.trim().startsWith("[") && jsonString.trim().endsWith("]")) {
        const parsed = JSON.parse(jsonString)
        return parsed.map((item: any) => Number(item.id))
      }

      // Try to parse as multiple JSON objects
      if (jsonString.includes('"id"')) {
        // It might be multiple JSON objects concatenated without being in an array
        const fixedValue = `[${jsonString}]`
        try {
          const parsed = JSON.parse(fixedValue)
          return parsed.map((item: any) => Number(item.id))
        } catch (e) {
          console.error("Failed to parse JSON array:", e)
          // If that fails, try to split by },{
          const categoryIds: number[] = []
          const jsonObjects = jsonString.split("},{")

          for (let i = 0; i < jsonObjects.length; i++) {
            let jsonStr = jsonObjects[i]
            if (i > 0) jsonStr = "{" + jsonStr
            if (i < jsonObjects.length - 1) jsonStr = jsonStr + "}"

            try {
              const obj = JSON.parse(jsonStr)
              if (obj && obj.id) {
                categoryIds.push(Number(obj.id))
              }
            } catch (e) {
               console.error("Failed to parse JSON array:", e)

            }
          }

          return categoryIds
        }
      }

      // If all else fails, try comma-separated list
      return jsonString
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id) && id > 0)
    } catch (e) {
      console.error("Failed to parse JSON array:", e)

      return []
    }
  }

  // Parse IDs from various formats
export  const parseIds = (value: string): Array<{ id: number; name: string }> => {
    if (!value) return []

    try {
      // Try to parse as JSON first (for objects with id property)
      try {
        const parsed = JSON.parse(value)
        if (parsed && parsed.id) {
          return [{ id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }]
        }
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({
            id: Number(item.id),
            name: item.name || `Item ${item.id}`,
          }))
        }
      } catch (e) {
                  console.error("Failed to parse JSON array:", e)
      }

      // Parse comma-separated list
      return value
        .split(",")
        .map((item) => {
          // Try to extract id from JSON string if possible
          try {
            const parsed = JSON.parse(item.trim())
            return parsed && parsed.id
              ? { id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }
              : { id: Number(item.trim()), name: `Item ${item.trim()}` }
          } catch (e) {
               console.error("Failed to parse JSON array:", e)

            // Not JSON, just convert to number
            return { id: Number(item.trim()), name: `Item ${item.trim()}` }
          }
        })
        .filter((item) => !isNaN(item.id) && item.id > 0)
    } catch (e) {
      return []
    }
  }