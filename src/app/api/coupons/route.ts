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
async function createCouponCode(
  promotionId: number,
  code: string,
  accessToken: string,
  maxUsesPerCustomer: number | null = null,
): Promise<any> {
  const couponPayload = {
    code: code,
    max_uses: null,
    max_uses_per_customer: maxUsesPerCustomer,
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

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Fix: Await the cookies() function before using it
    const cookieStore = await cookies()
    // Use environment variable as fallback
    const accessToken = cookieStore.get("bigcommerce_access_token")?.value || process.env.BIGCOMMERCE_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token. Please log in again." }, { status: 401 })
    }

    const body = await req.json()

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Promotion name is required." }, { status: 400 })
    }

    const quantity = Number(body.quantity) > 0 ? Number(body.quantity) : 1
    const codes: string[] = []
    const codeObjects: any[] = []

    for (let i = 0; i < quantity; i++) {
      const code = await generateUniqueCode()

      // Format dates
      const startDate = body.start_date || new Date().toISOString()
      const endDate = body.end_date || null

      // Process customer groups
      const customerGroupIds = Array.isArray(body.customer_group_ids) ? body.customer_group_ids : []

      const excludedCustomerGroupIds = Array.isArray(body.excluded_customer_group_ids)
        ? body.excluded_customer_group_ids
        : []

      // Build the complete payload
      const payload = {
        name: body.name,
        channels: body.channels || [],
        created_from: "react_ui",
        customer: {
          group_ids: customerGroupIds,
          minimum_order_count: body.min_order_count || 0,
          excluded_group_ids: excludedCustomerGroupIds,
          segments: null,
        },
        rules: body.rules || [],
        currency_code: body.currency_code || "*",
        redemption_type: "COUPON",
        shipping_address: null,
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
        return NextResponse.json({ error: "Failed to create promotion." }, { status: 500 })
      }

      const promotionId = data.data.id
      const couponResponse = await createCouponCode(promotionId, code, accessToken, body.max_uses_per_customer || null)

      if (!couponResponse.data?.id) {
        console.error("Failed to create coupon code:", couponResponse)
        return NextResponse.json({ error: "Failed to create coupon code." }, { status: 500 })
      }

      // Format the code object to match the expected structure
      const codeObject = {
        code: code,
        id: couponResponse.data.id,
        max_uses_per_customer: body.max_uses_per_customer || null,
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
      channels: body.channels || [],
      coupon_overrides_automatic_when_offering_higher_discounts:
        body.coupon_overrides_automatic_when_offering_higher_discounts || false,
      created_from: "react_ui",
      currency_code: body.currency_code || "*",
      current_uses: 0,
      customer: {
        group_ids: body.customer_group_ids || [],
        minimum_order_count: body.min_order_count || 0,
        segments: null,
        excluded_group_ids: body.excluded_customer_group_ids || [],
      },
      display_name: body.display_name || "",
      end_date: body.end_date || null,
      id: codeObjects.length > 0 ? codeObjects[0].id : null,
      max_uses: body.max_uses || null,
      name: body.name,
      rules: body.rules || [],
      schedule: body.schedule || null,
      shipping_address: null,
      start_date: body.start_date || new Date().toISOString(),
      status: body.status || "ENABLED",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
