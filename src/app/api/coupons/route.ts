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

// Update the POST handler to properly handle the dynamic rules from the UI
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const cookieStore = cookies()
    const accessToken =
      (await cookieStore).get("bigcommerce_access_token")?.value || process.env.BIGCOMMERCE_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token. Please log in again." }, { status: 401 })
    }

    const body = await req.json()
    console.log("Received request body:", JSON.stringify(body, null, 2))

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Promotion name is required." }, { status: 400 })
    }

    const quantity = Number(body.quantity) > 0 ? Number(body.quantity) : 1
    const codes: string[] = []
    const codeObjects: any[] = []

    // Create properly formatted rules with both condition and action
    const formattedRules = Array.isArray(body.rules)
      ? body.rules.map((rule: any, index: number) => {
          // Process the rule to ensure no default product IDs are used
          if (rule.condition?.cart?.items?.products) {
            // Remove default product ID 1 if it exists
            rule.condition.cart.items.products = rule.condition.cart.items.products.filter((id: number) => id !== 1)

            // If no products are left, use a different approach
            if (rule.condition.cart.items.products.length === 0) {
              // Use a minimum subtotal condition instead
              rule.condition.cart.subtotal = { min_amount: 0 }
              delete rule.condition.cart.items.products
            }
          }

          // Process fixed_price_set action to ensure no default product IDs
          if (rule.action?.fixed_price_set?.items?.products) {
            rule.action.fixed_price_set.items.products = rule.action.fixed_price_set.items.products.filter(
              (id: number) => id !== 1,
            )

            // If no products are left and there's no other condition, use a different approach
            if (rule.action.fixed_price_set.items.products.length === 0 && !rule.action.fixed_price_set.items.and) {
              // If we have inclusion rules in the UI, make sure they're properly formatted
              if (rule.config?.rewardInclusionRule?.type === "all") {
                // For "all products", don't specify products
                delete rule.action.fixed_price_set.items.products
              }
            }
          }

          // Process cart_items action to ensure no default product IDs
          if (rule.action?.cart_items?.items?.products) {
            rule.action.cart_items.items.products = rule.action.cart_items.items.products.filter(
              (id: number) => id !== 1,
            )

            // If no products are left and there's no other condition, use a different approach
            if (rule.action.cart_items.items.products.length === 0 && !rule.action.cart_items.items.and) {
              // If we have inclusion rules in the UI, make sure they're properly formatted
              if (rule.config?.rewardInclusionRule?.type === "all") {
                // For "all products", don't specify products
                delete rule.action.cart_items.items.products
              }
            }
          }

          // For fixed price rewards, ensure we're using the right format
          if (rule.reward === "fixed_price" && rule.config) {
            // Make sure we have the fixed_price_set action
            if (!rule.action.fixed_price_set) {
              rule.action.fixed_price_set = {
                fixed_price: String(rule.config.price || 0),
                quantity: rule.config.quantity || 1,
                strategy: (rule.config.applyTo || "Least expensive").toUpperCase().replace(" ", "_"),
                exclude_items_on_sale: !(rule.config.includeOnSale || false),
                include_items_considered_by_condition: rule.config.includeConditionProducts || false,
                items: rule.action.fixed_price_set?.items || {},
              }
            }
          }

          return {
            id: rule.id,
            name: rule.name,
            condition: rule.condition,
            type: rule.type || body.ruleType || "custom",
            apply_once: rule.apply_once ?? true,
            stop: rule.stop ?? true,
            conditions: rule.conditions || (rule.condition ? [rule.condition] : []),
            action: rule.action || (rule.action ? [rule.action] : []),
          }
        })
      : []

    console.log("shipping_address", body.shipping_address)
    console.log("Formatted rules:", JSON.stringify(formattedRules, null, 2))

    for (let i = 0; i < quantity; i++) {
      const code = await generateUniqueCode()

      const startDate = body.start_date || null
      const endDate = body.end_date || null

      // Build the clean payload without duplicates
      const payload = {
        name: body.name,
        channels: body.channels && body.channels.length > 0 ? body.channels : [], // Default to channel 1
        created_from: "react_ui",

        customer: {
          group_ids: body.customer.group_ids || [],
          minimum_order_count: 1,
          excluded_group_ids: body.customer?.excluded_group_ids || [],
          segments: body.customer?.segments || null,
        },
        rules: formattedRules,
        condition: body.rules.condition,
        currency_code: "*",
        redemption_type: "COUPON",
        shipping_address: body.shipping_address
          ? {
              countries: body.shipping_address.countries.map((c: any) => c.iso2_country_code),
            }
          : null,
        current_uses: body.current_uses || 0,
        max_uses: body.max_uses,
        start_date: startDate || startDate,
        end_date: endDate || null,
        status: "ENABLED",
        schedule: body.schedule,
        can_be_used_with_other_promotions: body.can_be_used_with_other_promotions,
        coupon_overrides_automatic_when_offering_higher_discounts:
          body.coupon_overrides_automatic_when_offering_higher_discounts,
        display_name: body.display_name,
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
      can_be_used_with_other_promotions: true,
      channels: body.channels && body.channels.length > 0 ? body.channels : [],
      coupon_overrides_automatic_when_offering_higher_discounts: false,
      created_from: "react_ui",
      currency_code: "*",
      current_uses: 0,
      customer: {
        group_ids: [],
        minimum_order_count: 0,
        segments: null,
        excluded_group_ids: [],
      },
      display_name: body.display_name || null,
      end_date: body.end_date || null,
      id: codeObjects.length > 0 ? codeObjects[0].id : null,
      max_uses: body.max_uses_per_customer || null,
      name: body.name,
      rules: formattedRules,
      schedule: body.schedule || null,
      shipping_address: body.shipping_address,
      start_date: body.start_date || null,
      status: "ENABLED",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
