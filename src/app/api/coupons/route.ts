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
    ? body.rules.map((rule: any, index: number) => ({
        id: rule.id,
        name: rule.name,
        condition : rule.condition,
        type: rule.type || body.ruleType || "custom",
        apply_once: rule.apply_once ?? true,
        stop: rule.stop ?? true,
        conditions: rule.conditions || (rule.condition ? [rule.condition] : []),
        action: rule.action || (rule.action ? [rule.action] : []),
      
        

      }))
    : []
  
        console.log("shipping_address",body.shipping_address)
     //   console.log(" body:", JSON.stringify(body));
    console.log("Formatted rules:", JSON.stringify(formattedRules, null, 2))
    for (let i = 0; i < quantity; i++) {
      const code = await generateUniqueCode()

      // Format dates for BigCommerce
      const now = new Date()
      const offset = now.getTimezoneOffset()
      const offsetHours = Math.abs(Math.floor(offset / 60))
        .toString()
        .padStart(2, "0")
      const offsetMinutes = Math.abs(offset % 60)
        .toString()
        .padStart(2, "0")
      const offsetSign = offset <= 0 ? "+" : "-"
      const startDate = now.toISOString().replace(/\.\d{3}Z$/, `${offsetSign}${offsetHours}:${offsetMinutes}`)

      // Build the clean payload without duplicates
      const payload = {
        name: body.name,
        channels: body.channels, // Default to channel 1
        created_from: "react_ui",
        
        customer: {
          group_ids: body.customer.group_ids || [],
          minimum_order_count: 1,
          excluded_group_ids: body.customer?.excluded_group_ids || [],
          segments: body.customer?.segments || null,
        },
        rules: formattedRules,
        condition:body.rules.condition,
        currency_code: "*",
        redemption_type: "COUPON",
        shipping_address: body.shipping_address ? {
          countries: body.shipping_address.countries.map((c: any) => c.iso2_country_code)
        } : null,
        current_uses: body.current_uses || 0,
        max_uses: body.max_uses,
        start_date: body.start_date || startDate,
        end_date: body.end_date || null,
        status: "ENABLED",
        schedule: body.schedule,
        can_be_used_with_other_promotions: body.can_be_used_with_other_promotions,
        coupon_overrides_automatic_when_offering_higher_discounts: body.coupon_overrides_automatic_when_offering_higher_discounts,
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
      channels: [],
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
      display_name: "",
      end_date: null,
      id: codeObjects.length > 0 ? codeObjects[0].id : null,
      max_uses: null,
      name: body.name,
      rules: formattedRules,
      schedule: null,
      shipping_address:null ,
      start_date: new Date().toISOString(),
      status: "ENABLED",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
