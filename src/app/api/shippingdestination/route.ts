// src/app/api/shippingdestination/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookiesStore = await cookies(); 
    const BIGCOMMERCE_STORE_HASH = cookiesStore.get('bigcommerce_store_hash')?.value;
    const BIGCOMMERCE_ACCESS_TOKEN = cookiesStore.get('bigcommerce_access_token')?.value;

  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Missing BigCommerce credentials in environment variables' },
      { status: 500 }
    );
  }

  const url = `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v2/countries?limit=250`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

   // console.log("Countries API response:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.title || 'Failed to fetch countries' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Countries API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}