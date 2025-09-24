// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const context = searchParams.get("context"); // e.g. stores/abcd123
  const storeHash = context?.split("/")[1];
  const scope = searchParams.get("scope");

  if (!code || !storeHash) {
    return NextResponse.json({ error: "Missing OAuth params" }, { status: 400 });
  }

  // Exchange code for token
  const tokenRes = await fetch("https://login.bigcommerce.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.BC_CLIENT_ID,
      client_secret: process.env.BC_CLIENT_SECRET,
      redirect_uri: process.env.BC_REDIRECT_URI,
      grant_type: "authorization_code",
      code,
      scope,
      context,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("OAuth exchange failed:", err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }

  const data = await tokenRes.json();
  const accessToken = data.access_token;

  // 🟢 Set secure cookies (iframe-compatible)
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("bigcommerce_access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // required inside iframe
    path: "/",
  });
  res.cookies.set("bigcommerce_store_hash", storeHash, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res;
}
