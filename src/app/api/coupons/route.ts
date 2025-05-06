import { NextResponse } from "next/server"
import crypto from "crypto"
import { cookies } from "next/headers"

// ENV VARS
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH!
const BASE_URL = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/promotions`

// Helper function to generate a unique code
async function generateUniqueCode(): Promise<string> {
  return crypto.randomBytes(5).toString("hex").toUpperCase()
}

// Helper function to create a coupon code
async function createCouponCode(promotionId: number, code: string, accessToken: string): Promise<any> {
  const couponPayload = {
    code: code,
    max_uses: null,
    max_uses_per_customer: null,
  }

  const couponResponse = await fetch(
    `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/promotions/${promotionId}/codes`,
    {
      method: "POST",
      headers: {
        "X-Auth-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(couponPayload),
    },
  )

  return await couponResponse.json()
}

// Helper function to normalize shipping address
function normalizeShippingAddress(shippingAddress: any): any {
  if (!shippingAddress || !shippingAddress.countries) return null

  return {
    countries: shippingAddress.countries.map((country: any) => ({
      iso2_country_code: typeof country === "object" ? country.iso2_country_code : country,
    })),
  }
}

// Helper function to normalize rule objects for the API
function normalizeRuleObjects(rules: any[]): any[] {
  if (!Array.isArray(rules) || rules.length === 0) {
    return []
  }

  return rules.map((rule) => {
    // Create a deep copy to avoid modifying the original
    const normalizedRule = JSON.parse(JSON.stringify(rule))

    // Ensure rule has valid structure
    if (!normalizedRule.condition || !normalizedRule.action) {
      console.warn("Rule missing condition or action:", rule)
      return rule // Return original if missing critical parts
    }

    // Process condition if it's an object
    if (typeof normalizedRule.condition === "object") {
      // Handle cart conditions
      if (normalizedRule.condition.cart && normalizedRule.condition.cart.items) {
        const cart = normalizedRule.condition.cart

        // Process direct item lists (products, categories, brands)
        for (const itemType of ["products", "categories", "brands"]) {
          if (cart.items[itemType] && Array.isArray(cart.items[itemType])) {
            cart.items[itemType] = cart.items[itemType].map((item: any) =>
              typeof item === "object" && item.id ? item.id : item,
            )
          }
        }

        // Process not conditions
        if (cart.items.not) {
          for (const itemType of ["products", "categories", "brands"]) {
            if (cart.items.not[itemType] && Array.isArray(cart.items.not[itemType])) {
              cart.items.not[itemType] = cart.items.not[itemType].map((item: any) =>
                typeof item === "object" && item.id ? item.id : item,
              )
            }
          }
        }

        // Process and conditions
        if (cart.items.and && Array.isArray(cart.items.and)) {
          cart.items.and = cart.items.and.map((andItem: any) => {
            const normalizedAndItem = { ...andItem }

            // Process direct items in and condition
            for (const itemType of ["products", "categories", "brands"]) {
              if (normalizedAndItem[itemType] && Array.isArray(normalizedAndItem[itemType])) {
                normalizedAndItem[itemType] = normalizedAndItem[itemType].map((item: any) =>
                  typeof item === "object" && item.id ? item.id : item,
                )
              }
            }

            // Process not conditions inside and condition
            if (normalizedAndItem.not) {
              for (const itemType of ["products", "categories", "brands"]) {
                if (normalizedAndItem.not[itemType] && Array.isArray(normalizedAndItem.not[itemType])) {
                  normalizedAndItem.not[itemType] = normalizedAndItem.not[itemType].map((item: any) =>
                    typeof item === "object" && item.id ? item.id : item,
                  )
                }
              }
            }

            return normalizedAndItem
          })
        }
      }
    }

    // Process action
    if (normalizedRule.action) {
      // Ensure action is not an array
      if (Array.isArray(normalizedRule.action)) {
        normalizedRule.action = normalizedRule.action[0] || {}
      }

      // Process cart_items
      if (normalizedRule.action.cart_items && normalizedRule.action.cart_items.items) {
        const items = normalizedRule.action.cart_items.items

        // Process direct item lists
        for (const itemType of ["products", "categories", "brands"]) {
          if (items[itemType] && Array.isArray(items[itemType])) {
            items[itemType] = items[itemType].map((item: any) => (typeof item === "object" && item.id ? item.id : item))
          }
        }

        // Process not conditions
        if (items.not) {
          for (const itemType of ["products", "categories", "brands"]) {
            if (items.not[itemType] && Array.isArray(items.not[itemType])) {
              items.not[itemType] = items.not[itemType].map((item: any) =>
                typeof item === "object" && item.id ? item.id : item,
              )
            }
          }
        }
      }

      // Process gift_item
      if (normalizedRule.action.gift_item) {
        // Ensure product_id is a number
        if (
          normalizedRule.action.gift_item.product_id &&
          typeof normalizedRule.action.gift_item.product_id === "object"
        ) {
          normalizedRule.action.gift_item.product_id = normalizedRule.action.gift_item.product_id.id || 0
        }
      }
    }

    // Ensure rule has required properties
    normalizedRule.apply_once = normalizedRule.apply_once !== undefined ? normalizedRule.apply_once : true
    normalizedRule.stop = normalizedRule.stop !== undefined ? normalizedRule.stop : true

    return normalizedRule
  })
}

// Helper function to validate rule structure
function validateRuleStructure(rule: any): boolean {
  // Check if rule has condition and action
  if (!rule.condition || !rule.action) {
    return false
  }

  // Check if condition has cart with items
  if (typeof rule.condition === "object" && rule.condition.cart) {
    // If cart.items exists, it must have at least one matcher
    if (rule.condition.cart.items && Object.keys(rule.condition.cart.items).length === 0) {
      return false
    }
  }

  // Check if action is valid
  if (typeof rule.action !== "object" || Array.isArray(rule.action) || Object.keys(rule.action).length === 0) {
    return false
  }

  return true
}

// Helper function to ensure rules are valid
function ensureValidRules(rules: any[]): any[] {
  if (!Array.isArray(rules) || rules.length === 0) {
    // Return a default rule if none provided
    return [
      {
        apply_once: true,
        stop: true,
        condition: {
          cart: {
            items: {
              products: [694, 695],
            },
            minimum_quantity: 1,
          },
        },
        action: {
          cart_items: {
            discount: {
              percentage_amount: "10",
            },
            strategy: "LEAST_EXPENSIVE",
            add_free_item: false,
            as_total: false,
            include_items_considered_by_condition: true,
            exclude_items_on_sale: false,
            quantity: 1,
          },
        },
      },
    ]
  }

  // Filter out invalid rules and fix those that can be fixed
  return rules.map((rule) => {
    // Create a deep copy
    const fixedRule = JSON.parse(JSON.stringify(rule))

    // If rule is completely invalid, return a default rule
    if (!validateRuleStructure(fixedRule)) {
      console.warn("Invalid rule structure, using default:", rule)
      return {
        apply_once: true,
        stop: true,
        condition: {
          cart: {
            items: {
              products: [694, 695],
            },
            minimum_quantity: 1,
          },
        },
        action: {
          cart_items: {
            discount: {
              percentage_amount: "10",
            },
            strategy: "LEAST_EXPENSIVE",
            add_free_item: false,
            as_total: false,
            include_items_considered_by_condition: true,
            exclude_items_on_sale: false,
            quantity: 1,
          },
        },
      }
    }

    // Fix condition if needed
    if (typeof fixedRule.condition === "object" && fixedRule.condition.cart) {
      // Ensure cart.items exists and has at least one matcher
      if (!fixedRule.condition.cart.items || Object.keys(fixedRule.condition.cart.items).length === 0) {
        // Try to use products from the rule config if available
        if (fixedRule.config && fixedRule.config.inclusionRule && fixedRule.config.inclusionRule.value) {
          try {
            const productIds = fixedRule.config.inclusionRule.value
              .split(",")
              .map((id: string) => Number.parseInt(id.trim(), 10))
            if (productIds.length > 0 && !isNaN(productIds[0])) {
              fixedRule.condition.cart.items = {
                products: productIds,
              }
            } else {
              fixedRule.condition.cart.items = {
                products: [694, 695], // Default if parsing fails
              }
            }
          } catch (e) {
            fixedRule.condition.cart.items = {
              products: [694, 695], // Default if parsing fails
            }
          }
        } else {
          fixedRule.condition.cart.items = {
            products: [694, 695], // Default if no config
          }
        }
      }

      // Ensure minimum_quantity exists
      if (!fixedRule.condition.cart.minimum_quantity) {
        fixedRule.condition.cart.minimum_quantity = fixedRule.config?.reachingQuantity || 1
      }
    }

    return fixedRule
  })
}

const formatDateForBigCommerce = (dateString: string | null | undefined): string | null => {
  if (!dateString) {
    const now = new Date()
    // Format with timezone offset
    const offset = now.getTimezoneOffset()
    const offsetHours = Math.abs(Math.floor(offset / 60))
      .toString()
      .padStart(2, "0")
    const offsetMinutes = Math.abs(offset % 60)
      .toString()
      .padStart(2, "0")
    const offsetSign = offset <= 0 ? "+" : "-"
    return now.toISOString().replace(/\.\d{3}Z$/, `${offsetSign}${offsetHours}:${offsetMinutes}`)
  }

  try {
    const date = new Date(dateString)
    // Format with timezone offset
    const offset = date.getTimezoneOffset()
    const offsetHours = Math.abs(Math.floor(offset / 60))
      .toString()
      .padStart(2, "0")
    const offsetMinutes = Math.abs(offset % 60)
      .toString()
      .padStart(2, "0")
    const offsetSign = offset <= 0 ? "+" : "-"
    return date.toISOString().replace(/\.\d{3}Z$/, `${offsetSign}${offsetHours}:${offsetMinutes}`)
  } catch (e) {
    console.error("Date parsing error:", e)
    return dateString
  }
}

// Update the POST handler to properly handle the dynamic rules from the UI
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const cookieStore = cookies()
    const accessToken = (await cookieStore).get("bigcommerce_access_token")?.value || process.env.BIGCOMMERCE_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token. Please log in again." }, { status: 401 })
    }

    const body = await req.json()
    console.log("Received request body:", JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Promotion name is required." }, { status: 400 })
    }

    // Validate that at least one rule exists
    if (!body.rules || !Array.isArray(body.rules) || body.rules.length === 1) {
      return NextResponse.json({ error: "At least one rule is required." }, { status: 400 })
    }

    const quantity = Number(body.quantity) > 0 ? Number(body.quantity) : 1
    const codes: string[] = []
    const codeObjects: any[] = []

    // Ensure rules are valid
    const validRules = ensureValidRules(body.rules)

    // Normalize rules to ensure they're in the format expected by the API
    const normalizedRules = normalizeRuleObjects(validRules)

    // Normalize shipping address if present
    const shippingAddress = normalizeShippingAddress(body.shipping_address)

    // Normalize channels
    const channels = Array.isArray(body.channels)
      ? body.channels.map((channel: any) => {
          return typeof channel === "object" ? { id: channel.id } : { id: channel }
        })
      : []

    for (let i = 0; i < quantity; i++) {
      const code = await generateUniqueCode()

      // Format dates for BigCommerce
      const startDate = formatDateForBigCommerce(body.start_date)
      const endDate = body.end_date ? formatDateForBigCommerce(body.end_date) : null

      // Build the complete payload
      const payload = {
        name: body.name,
        channels: channels,
        created_from: "react_ui",
        customer: {
          group_ids: Array.isArray(body.customer?.group_ids) ? body.customer.group_ids : [],
          minimum_order_count: body.customer?.minimum_order_count || 0,
          excluded_group_ids: Array.isArray(body.customer?.excluded_group_ids) ? body.customer.excluded_group_ids : [],
          segments: null,
        },
        rules: normalizedRules,
        currency_code: body.currency_code || "GBP",
        redemption_type: "COUPON",
        shipping_address: shippingAddress,
        current_uses: 0,
        max_uses: body.max_uses || null,
        start_date: startDate,
        end_date: endDate,
        status: body.status || "ENABLED",
        schedule: body.schedule || null,
        can_be_used_with_other_promotions:
          body.can_be_used_with_other_promotions !== undefined ? body.can_be_used_with_other_promotions : true,
        coupon_overrides_automatic_when_offering_higher_discounts:
          body.coupon_overrides_automatic_when_offering_higher_discounts !== undefined
            ? body.coupon_overrides_automatic_when_offering_higher_discounts
            : false,
        display_name: body.display_name || "",
      }

      console.log("Generated Payload:", JSON.stringify(payload, null, 2))

      // Create the promotion
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "X-Auth-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.data?.id) {
        console.error("BigCommerce error:", data)
        return NextResponse.json(
          { error: data.title || "Failed to create promotion." },
          { status: response.status || 500 },
        )
      }

      const promotionId = data.data.id
      const couponResponse = await createCouponCode(promotionId, code, accessToken)

      if (!couponResponse.data?.id) {
        console.error("Failed to create coupon code:", couponResponse)
        return NextResponse.json({ error: "Failed to create coupon code." }, { status: 500 })
      }

      // Format the code object to match the expected structure
      const codeObject = {
        code: code,
        id: couponResponse.data.id,
        max_uses_per_customer: null,
      }

      codes.push(code)
      codeObjects.push(codeObject)
    }

    // Return the response in the exact format requested
    return NextResponse.json({
      message: "Coupon created",
      coupon: codes,
      codes: codeObjects[0] || null,
      can_be_used_with_other_promotions: body.can_be_used_with_other_promotions || true,
      channels: channels,
      coupon_overrides_automatic_when_offering_higher_discounts:
        body.coupon_overrides_automatic_when_offering_higher_discounts || false,
      created_from: "react_ui",
      currency_code: body.currency_code || "GBP",
      current_uses: 0,
      customer: {
        group_ids: body.customer?.group_ids || [],
        minimum_order_count: body.customer?.minimum_order_count || 0,
        segments: null,
        excluded_group_ids: body.customer?.excluded_group_ids || [],
      },
      display_name: body.display_name || "",
      end_date: body.end_date || null,
      id: codeObjects.length > 0 ? codeObjects[0].id : null,
      max_uses: body.max_uses || null,
      name: body.name,
      rules: normalizedRules,
      schedule: body.schedule || null,
      shipping_address: shippingAddress,
      start_date: body.start_date || new Date().toISOString(),
      status: body.status || "ENABLED",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
