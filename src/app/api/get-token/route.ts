import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("bigcommerce_access_token")?.value || null;

  if (!token) {
    return NextResponse.json({ token: null }, { status: 200 });
  }

  return NextResponse.json({ token }, { status: 200 });
}
