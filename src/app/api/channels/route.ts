// src/app/api/channels/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      "https://api.bigcommerce.com/stores/khv7zlhogn/v3/channels?page=1&limit=10&available=true",
      {
        method: "GET",
        headers: {
          "X-Auth-Token": "l6723djf2ubh28oa4df6wfcon6duyln",
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
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
