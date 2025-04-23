import { NextResponse } from 'next/server'

export async function GET() {
  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH
  const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN

  // Validate environment variables
  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Missing BigCommerce credentials" },
      { status: 500 }
    )
  }

  const url = `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v2/customer_groups`

  try {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": BIGCOMMERCE_ACCESS_TOKEN,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })

    const rawResponse = await response.text()
    console.log('RAW API RESPONSE:', rawResponse || '(empty response)')

    if (!response.ok) {
      console.error('API ERROR STATUS:', response.status)
      return NextResponse.json(
        { error: rawResponse || `API Error ${response.status}` },
        { status: response.status }
      )
    }

    // Handle empty response
    if (!rawResponse) {
      console.warn('Received empty response from API')
      return NextResponse.json(
        { data: [] }, // Return empty array as default
        { status: 200 }
      )
    }

    // Try to parse JSON only if response exists
    try {
      const jsonData = JSON.parse(rawResponse)
      return NextResponse.json(jsonData, { status: 200 })
    } catch (parseError) {
      console.error('JSON PARSE ERROR:', parseError)
      return NextResponse.json(
        { error: "Invalid API response format", rawResponse },
        { status: 500 }
      )
    }
    
  } catch (err) {
    console.error('NETWORK ERROR:', err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}