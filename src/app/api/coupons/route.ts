import { NextResponse } from "next/server"
import crypto from "crypto"
import { cookies } from "next/headers"

// Helper function to generate a unique code
async function generateUniqueCode(): Promise<string> {
  return crypto.randomBytes(5).toString("hex").toUpperCase()
}

// Helper function to create a coupon code
async function createCouponCode(promotionId: number, code: string, accessToken: string, storeHash: string): Promise<any> {
  const couponPayload = {
    code: code,
    max_uses: null,
    max_uses_per_customer: null,
  }
  console.log("Creating coupon code with payload:", JSON.stringify(couponPayload, null, 2))
  const couponResponse = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/promotions/${promotionId}/codes`,
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
    const storeHash = (await cookieStore).get("bigcommerce_store_hash")?.value
    const accessToken =
      (await cookieStore).get("bigcommerce_access_token")?.value || process.env.BIGCOMMERCE_ACCESS_TOKEN

    if (!storeHash || !accessToken) {
      return NextResponse.json({ error: "Missing BigCommerce credentials. Please log in again." }, { status: 401 })
    }

    const BASE_URL = `https://api.bigcommerce.com/stores/${storeHash}/v3/promotions`

    const body = await req.json()
    console.log("Received request body:", JSON.stringify(body, null, 2))

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Promotion name is required." }, { status: 400 })
    }

    const quantity = Number(body.quantity) > 0 ? Number(body.quantity) : 1
    const codes: string[] = []
    const codeObjects: any[] = []

    // ... 🔹 keep your whole existing rule formatting logic here unchanged ...

    for (let i = 0; i < quantity; i++) {
      const code = await generateUniqueCode()

      const startDate = body.start_date || null
      const endDate = body.end_date || null

      const payload = {
        // ... 🔹 your existing payload ...
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
      const couponResponse = await createCouponCode(promotionId, code, accessToken, storeHash)

      if (!couponResponse.data?.id) {
        console.error("Failed to create coupon code:", couponResponse)
        return NextResponse.json({ error: "Failed to create coupon code." }, { status: 500 })
      }

      const codeObject = {
        code: code,
        id: couponResponse.data.id,
        max_uses_per_customer: null,
      }

      codes.push(code)
      codeObjects.push(codeObject)
    }

    // ✅ return your final response unchanged
    return NextResponse.json({
      message: "Coupon created",
      coupon: codes,
      codes: codeObjects[0] || null,
      // ... rest of your response ...
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
