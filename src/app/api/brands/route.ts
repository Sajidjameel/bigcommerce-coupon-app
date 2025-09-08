// src/app/api/brands/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const token = (await cookies()).get("bigcommerce_access_token")

  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH
  const BIGCOMMERCE_ACCESS_TOKEN = token ?.value

 

  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    console.error('MISSING CREDENTIALS ERROR')
    return NextResponse.json(
      { error: "Missing BigCommerce credentials" },
      { status: 500 }
    )
  }

  const url = `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/catalog/brands?sort=name&limit=50`
 // console.log('API URL:', url)

  try {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": BIGCOMMERCE_ACCESS_TOKEN,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })

    console.log('RESPONSE STATUS:', response.status)
   // console.log('RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()))

    const rawResponse = await response.text()
  //  console.log('RAW API RESPONSE:', rawResponse || '(empty response)')
    console.log('RESPONSE OK?:', response.ok)

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
        { data: [], meta: { pagination: {} } }, // Return empty structure matching expected format
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