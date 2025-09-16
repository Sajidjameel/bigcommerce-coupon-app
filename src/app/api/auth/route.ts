import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cookieStore = cookies();

  const code = searchParams.get("code");
  const context = searchParams.get("context");
  const scope = searchParams.get("scope");
  const accountUuid = searchParams.get("account_uuid");

  console.log("OAuth callback params:", Object.fromEntries(searchParams));

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  // ✅ Exchange code for access token
  const res = await fetch("https://login.bigcommerce.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.BIGCOMMERCE_CLIENT_ID,
      client_secret: process.env.BIGCOMMERCE_CLIENT_SECRET,
      code,
      scope,
      grant_type: "authorization_code",
      redirect_uri: process.env.AUTH_CALLBACK_URL,
      ...(context ? { context } : {}),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("❌ Token exchange failed:", errorData);
    return NextResponse.json({ error: "Token exchange failed", details: errorData }, { status: 400 });
  }

  const data = await res.json();
  console.log("✅ OAuth token response:", data);

  let storeHash: string | undefined;
  if (data?.context) {
    storeHash = data.context.replace("stores/", "");
  } else if (context) {
    storeHash = context.replace("stores/", "");
  }

  if (data.access_token) {
    (await cookieStore).set("bigcommerce_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  const storeIdentifier = storeHash || accountUuid;
  if (storeIdentifier) {
    (await cookieStore).set("bigcommerce_store_hash", storeIdentifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  console.log("💾 Saved to cookies:", {
    accessToken: !!data.access_token,
    storeHash: storeIdentifier
  });

  return NextResponse.redirect(`${process.env.APP_URL}/dashboard?store=${storeIdentifier}`);
}