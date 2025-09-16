import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cookieStore = cookies();

  const code = searchParams.get("code");
  const context = searchParams.get("context");
  const scope = searchParams.get("scope");
  const accountUuid = searchParams.get("account_uuid");

  console.log("🔍 OAuth callback received with params:", {
    code: code ? "PRESENT" : "MISSING",
    context,
    scope,
    accountUuid
  });

  // Debug: Log all query parameters
  console.log("📋 All query parameters:", Object.fromEntries(searchParams));

  if (!code) {
    console.error("❌ Missing authorization code. Full query:", Object.fromEntries(searchParams));
    return NextResponse.json(
      { 
        error: "Missing authorization code",
        receivedParams: Object.fromEntries(searchParams)
      }, 
      { status: 400 }
    );
  }

  try {
    // ✅ Exchange code for access token
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
        ...(context ? { context } : {}),
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("❌ Token exchange failed:", errorData);
      return NextResponse.json(
        { error: "Token exchange failed", details: errorData },
        { status: 400 }
      );
    }

    const data = await tokenResponse.json();
    console.log("✅ OAuth token response received");

    let storeHash: string | undefined;
    if (data?.context) {
      storeHash = data.context.replace("stores/", "");
    } else if (context) {
      storeHash = context.replace("stores/", "");
    } else if (accountUuid) {
      storeHash = accountUuid;
    }

    // Set cookies
    if (data.access_token) {
      (await cookieStore).set("bigcommerce_access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    if (storeHash) {
      (await cookieStore).set("bigcommerce_store_hash", storeHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    console.log("💾 Authentication successful. Redirecting to dashboard...");

    // Redirect to dashboard
    return NextResponse.redirect(
      new URL(`/dashboard?store=${storeHash}`, process.env.APP_URL)
    );

  } catch (error) {
    console.error("❌ Unexpected error during OAuth flow:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}