// app/api/categories/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
  const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Missing BigCommerce credentials in environment variables' },
      { status: 500 }
    );
  }

  // Get tree_ids from query params or use default "1,2"
  const { searchParams } = new URL(request.url);
  const treeIds = searchParams.get('tree_ids') || '1,2';

  try {
    const res = await fetch(
      `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/catalog/trees/categories?limit=250&page=1&tree_id:in=${treeIds}`,
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
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Categories fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}