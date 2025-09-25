// src/app/api/channels/route.ts
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

  try {
    const res = await fetch(
      `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/channels?page=1&limit=10&available=true`,
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
      return NextResponse.json({ error: "Failed to fetch channels" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Channel fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}