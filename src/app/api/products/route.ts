import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Define types for API response data
interface Product {
  id: number
  name: string
  sku: string
  price: number
  primary_image: {
    url_standard: string
  } | null
}

interface Pagination {
  total_pages: number
  current_page: number
  total: number
  count: number
}

interface ApiResponse {
  data: Product[]
  meta: {
    pagination: Pagination
  }
}

/**
 * API route handler for fetching products from BigCommerce
 * This server-side function avoids CORS issues that occur with direct client-side API calls
 */
export async function GET(request: Request) {
  console.log("Server: Fetching products...")
  const token = (await cookies()).get("bigcommerce_access_token")
  

  // Extract query parameters
  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const search = searchParams.get("search") || ""

  // Get BigCommerce credentials from environment variables
  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH
  const BIGCOMMERCE_ACCESS_TOKEN = token?.value

  // Validate credentials
  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    console.error("Server: Missing BigCommerce credentials")
    return NextResponse.json({ error: "Missing BigCommerce credentials in environment variables" }, { status: 500 })
  }

  try {
    console.log("Server: Making request to BigCommerce API...")

    // Construct URL for BigCommerce API
    const url = new URL(`https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/catalog/products`)

    // Add query parameters
    url.searchParams.append("include", "primary_image,variants")
    url.searchParams.append("limit", "50")
    url.searchParams.append("page", page)

    if (search) {
      url.searchParams.append("keyword", search)
    }

    // Make the API request with proper authentication headers
    const res = await fetch(url.toString(), {
      headers: {
        "X-Auth-Token": BIGCOMMERCE_ACCESS_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    // Handle API errors
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error("Server: BigCommerce API error:", res.statusText, errorData)
      return NextResponse.json(
        { error: errorData.message || `Failed to fetch products (${res.status})` },
        { status: res.status },
      )
    }

    // Parse the response
    const data: ApiResponse = await res.json()

    // Validate response structure
    if (!data.data || !data.meta || !data.meta.pagination) {
      console.error("Server: Invalid API response structure:", data)
      return NextResponse.json({ error: "Invalid API response structure" }, { status: 500 })
    }

    console.log(`Server: Successfully fetched ${data.data.length} products`)

    // Return the products and pagination data
    return NextResponse.json({
      products: data.data,
      pagination: data.meta.pagination,
    })
  } catch (err) {
    console.error("Server: Internal error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 })
  }
}
