// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const code = searchParams.get("code");
  const context = searchParams.get("context");
  const scope = searchParams.get("scope");

  console.log("🔍 OAuth callback received:", { code, context, scope });

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

    // Extract store hash
    const storeHash = data.context?.replace("stores/", "") || 
                     process.env.BIGCOMMERCE_STORE_HASH;

    if (!storeHash) {
      console.error("❌ No store hash available");
      return NextResponse.json(
        { error: "Store hash not available" },
        { status: 400 }
      );
    }

    // Get cookie store correctly
    const cookieStore = await cookies();
    
    // Set cookies with proper configuration for Vercel
    cookieStore.set("bigcommerce_access_token", data.access_token, {
      httpOnly: true,
      secure: true, // Must be true for Vercel
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      domain: ".vercel.app" // Important for Vercel deployment
    });

    cookieStore.set("bigcommerce_store_hash", storeHash, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      domain: ".vercel.app"
    });

    console.log("✅ Cookies set successfully");

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/", process.env.APP_URL || "https://bigcommerce-coupon-app-2pzc.vercel.app"));

  } catch (error) {
    console.error("❌ OAuth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}