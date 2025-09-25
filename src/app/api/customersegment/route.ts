// src/app/api/customersegment/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server'

export async function GET() {
 const cookiesStore = await cookies(); 
    const BIGCOMMERCE_STORE_HASH = cookiesStore.get('bigcommerce_store_hash')?.value;
    const BIGCOMMERCE_ACCESS_TOKEN = cookiesStore.get('bigcommerce_access_token')?.value;

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