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
export const parseIds = (value: string): Array<{ id: number; name: string }> => {
  if (!value) return []

  try {
    // Case 1: value is a valid JSON array or object
    if ((value.trim().startsWith("{") && value.trim().endsWith("}")) ||
        (value.trim().startsWith("[") && value.trim().endsWith("]"))) {
      const parsed = JSON.parse(value)

      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          id: Number(item.id),
          name: item.name || `Item ${item.id}`,
        }))
      }

      if (parsed && parsed.id) {
        return [{ id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }]
      }
    }

    // Case 2: comma-separated IDs
    return value
      .split(",")
      .map((item) => {
        const trimmed = item.trim()

        // Only try JSON.parse if it looks like an object/array
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
            (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
          try {
            const parsed = JSON.parse(trimmed)
            if (parsed && parsed.id) {
              return { id: Number(parsed.id), name: parsed.name || `Item ${parsed.id}` }
            }
          } catch {
            // ignore, fallback to numeric parse
          }
        }

        return { id: Number(trimmed), name: `Item ${trimmed}` }
      })
      .filter((item) => !isNaN(item.id) && item.id > 0)
  } catch (e) {
    console.error("parseIds failed for value:", value, e)
    return []
  }
}