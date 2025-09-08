// src/app/api/shipping-zones/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const token = (await cookies()).get("bigcommerce_access_token")
  
  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
  const BIGCOMMERCE_ACCESS_TOKEN = token?.value;

  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Missing BigCommerce credentials in environment variables' },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v2/shipping/zones`,
      {
        method: 'GET',
        headers: {
          'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch shipping zones - Status: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Shipping zones fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error while fetching shipping zones" },
      { status: 500 }
    );
  }
}