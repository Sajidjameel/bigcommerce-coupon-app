// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const context = searchParams.get("context"); // usually stores/{hash}
  const scope = searchParams.get("scope");
  const accountUuid = searchParams.get("account_uuid"); // fallback case

  console.log("🔍 OAuth callback received:", { code, context, scope, accountUuid });

  if (!code) {
    console.error("❌ Missing authorization code.");
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://login.bigcommerce.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.BIGCOMMERCE_CLIENT_ID,
        client_secret: process.env.BIGCOMMERCE_CLIENT_SECRET,
        code,
        scope,
        grant_type: "authorization_code",
        redirect_uri: process.env.AUTH_CALLBACK_URL,
        context,
        account_uuid: accountUuid, // ✅ add this so it works when context is missing
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("❌ Token exchange failed:", errorData);
      return NextResponse.json(
        { error: "Token exchange failed" },
        { status: 400 }
      );
    }

    const data = await tokenResponse.json();
    console.log("✅ OAuth token response received");

    // Extract store hash or fallback
    const storeHash = data.context?.replace("stores/", "") || process.env.BIGCOMMERCE_STORE_HASH;

    if (!storeHash && !accountUuid) {
      console.error("❌ No store hash or account UUID available");
      return NextResponse.json(
        { error: "Store hash not available" },
        { status: 400 }
      );
    }

    // Get cookie store
    const cookieStore = await cookies();

    // Set cookies (secure + iframe compatible)
    cookieStore.set("bigcommerce_access_token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    if (storeHash) {
      cookieStore.set("bigcommerce_store_hash", storeHash, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    if (accountUuid) {
      cookieStore.set("bigcommerce_account_uuid", accountUuid, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    console.log("✅ Cookies set successfully");

    // Redirect to homepage/dashboard
    return NextResponse.redirect(
      new URL("/", process.env.APP_URL || "https://bigcommerce-coupon-app-2pzc.vercel.app")
    );
  } catch (error) {
    console.error("❌ OAuth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}