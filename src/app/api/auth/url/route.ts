// app/api/auth/url/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID!;
  const REDIRECT_URI = process.env.BIGCOMMERCE_REDIRECT_URI!;
  const SCOPES = [
    "store_v2_information",
    "store_checkout"
  ].join(" ");

  const authUrl = `https://login.bigcommerce.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}&response_type=code`;

  return NextResponse.json({ url: authUrl });
}
