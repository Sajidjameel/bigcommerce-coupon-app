import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const context = searchParams.get("context");
  const scope = searchParams.get("scope");
  const accountUuid = searchParams.get("account_uuid");
  const error = searchParams.get("error");

  console.log("OAuth callback params:", Object.fromEntries(searchParams));

  if (error) {
    console.error("❌ OAuth error received:", error, searchParams.get("error_description"));
    return NextResponse.redirect(
      `${process.env.APP_URL}/auth-error?error=${error}&description=${encodeURIComponent(searchParams.get('error_description') || 'Unknown error')}`
    );
  }

  if (!code) {
    console.error("❌ Missing authorization code. Query params:", Object.fromEntries(searchParams));
    return NextResponse.redirect(
      `${process.env.APP_URL}/auth-error?error=no_code&description=${encodeURIComponent('No authorization code received from BigCommerce')}`
    );
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
      const errorText = await res.text();
      console.error("❌ Token exchange failed. Status:", res.status, "Response:", errorText);
      return NextResponse.redirect(
        `${process.env.APP_URL}/auth-error?error=token_exchange_failed&status=${res.status}`
      );
    }

  const data = await res.json();
  console.log("✅ OAuth token response:", data);

  // ✅ Derive store hash
  let storeHash: string | undefined;
  if (data?.context) {
    storeHash = data.context.replace("stores/", "");
  } else if (context) {
    storeHash = context.replace("stores/", "");
  }

  // TODO: Save access_token, store_hash, and refresh_token securely
  console.log("💾 Should save:", {
    accessToken: data.access_token,
    storeHash: storeHash,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  });

  return NextResponse.redirect(`${process.env.APP_URL}/?store=${storeHash || accountUuid}`);
}