import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("bc_token")?.value || process.env.BIGCOMMERCE_API_TOKEN
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH

  if (!token || !storeHash) {
    return NextResponse.json({ error: "Missing API token or store hash" }, { status: 400 })
  }

  const url = `https://api.bigcommerce.com/stores/${storeHash}/v3/channels?limit=250&type:in=storefront`

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": token,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err?.title || "Failed to fetch channels" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Network error or invalid response" }, { status: 500 })
  }
}
