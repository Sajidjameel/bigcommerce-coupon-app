import { NextResponse } from 'next/server';

export async function GET() {
  console.log("Fetching currencies..."); // Log to confirm that the endpoint is being hit

  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
  const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
    console.error("Missing BigCommerce credentials");
    return NextResponse.json(
      { error: 'Missing BigCommerce credentials in environment variables' },
      { status: 500 }
    );
  }

  try {
    console.log('Making request to BigCommerce API...');
    const res = await fetch(
      `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v2/currencies`,
      {
        method: 'GET',
        headers: {
          'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('BigCommerce API response status:', res.status); // Log the response status from BigCommerce

    if (!res.ok) {
      console.error("BigCommerce API error:", res.statusText);
      return NextResponse.json({ error: "Failed to fetch currencies" }, { status: res.status });
    }

    const data = await res.json();
    console.log('BigCommerce API response data:', data); // Log the data returned from BigCommerce
    return NextResponse.json(data);
  } catch (err) {
    console.error("Internal error:", err); // Log any internal errors
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
