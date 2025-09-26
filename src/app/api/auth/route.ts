// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const context = searchParams.get("context"); // This should come from BigCommerce OAuth
  const scope = searchParams.get("scope");
  const accountUuid = searchParams.get("account_uuid");

  console.log("🔍 OAuth callback received:", { code, context, scope, accountUuid });

  if (!code) {
    console.error("❌ Missing authorization code.");
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  // 🚨 CRITICAL: Check if context is missing
  if (!context) {
    console.error("❌ BigCommerce did not send context parameter");
    console.log("📥 All received parameters:", Object.fromEntries(searchParams.entries()));
    
    // This means BigCommerce isn't properly redirecting to your callback
    return NextResponse.json(
      { error: "Missing context parameter from BigCommerce" },
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
        context, // This should contain "stores/{hash}"
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
    console.log("✅ OAuth token response:", {
      access_token: data.access_token ? "✅ Present" : "❌ Missing",
      context: data.context,
      scope: data.scope
    });

    // 🎯 EXTRACT STORE HASH FROM CONTEXT
    let storeHash = null;
    
    // Method 1: From context parameter (preferred)
    if (context && context.startsWith('stores/')) {
      storeHash = context.replace('stores/', '');
      console.log("✅ Store hash from context parameter:", storeHash);
    }
    // Method 2: From token response context (fallback)
    else if (data.context && data.context.startsWith('stores/')) {
      storeHash = data.context.replace('stores/', '');
      console.log("✅ Store hash from token response:", storeHash);
    }
    // Method 3: Manual extraction from your store URL (LAST RESORT)
    else {
      // 🚨 ONLY use this for testing if above methods fail
      const storeUrl = "store-noyunnhark.mybigcommerce.com";
      storeHash = storeUrl.split('.')[0].replace('store-', '');
      console.log("⚠️  Store hash extracted from URL (fallback):", storeHash);
    }

    if (!storeHash) {
      console.error("❌ Could not determine store hash");
      return NextResponse.json(
        { error: "Store hash not available" },
        { status: 400 }
      );
    }

    // Get cookie store
    const cookieStore = await cookies();

    // Set cookies
    cookieStore.set("bigcommerce_access_token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set("bigcommerce_store_hash", storeHash, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("✅ Authentication successful! Store hash:", storeHash);

    // Redirect to homepage
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