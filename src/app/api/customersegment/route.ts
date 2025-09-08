// src/app/api/customersegment/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
  const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Missing BigCommerce credentials' }, { status: 500 });
  }

  const url = `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/segments?limit=50&page=1`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
  //console.log('Segments API response:', data); // Log the response for debugging
    if (!res.ok) {
      return NextResponse.json({ error: data.title || 'Failed to fetch segments' }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Segments API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}