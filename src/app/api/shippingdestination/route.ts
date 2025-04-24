// src/app/api/shippingdestination/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
  const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

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