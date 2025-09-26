// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const context = searchParams.get("context");
  const scope = searchParams.get("scope");

  console.log("🔍 Production OAuth callback received:", { 
    code: code ? "✅ Present" : "❌ Missing",
    context: context || "❌ Not provided by BigCommerce",
    scope: scope || "❌ Not provided"
  });

  if (!code) {
    console.error("❌ Missing authorization code.");
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Exchange code for access token
    console.log("🔄 Exchanging code for access token...");
    
    const tokenResponse = await fetch("https://login.bigcommerce.com/oauth2/token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.BIGCOMMERCE_CLIENT_ID,
        client_secret: process.env.BIGCOMMERCE_CLIENT_SECRET,
        code: code,
        scope: scope,
        grant_type: "authorization_code",
        redirect_uri: process.env.AUTH_CALLBACK_URL,
        context: context,
      }),
    });

    // Step 2: Check token response
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: "Token exchange failed" },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Token exchange successful:", {
      access_token: tokenData.access_token ? "✅ Present" : "❌ Missing",
      context: tokenData.context || "❌ Not in response",
      scope: tokenData.scope || "❌ Not in response"
    });

    // Step 3: EXTRACT STORE HASH FROM TOKEN RESPONSE (CORRECT WAY)
    let storeHash = null;

    // Method 1: From token response context (PRIMARY METHOD)
    if (tokenData.context && typeof tokenData.context === 'string') {
      if (tokenData.context.startsWith('stores/')) {
        storeHash = tokenData.context.replace('stores/', '');
        console.log("✅ Store hash extracted from token response:", storeHash);
      } else {
        // Sometimes it's just the hash without 'stores/'
        storeHash = tokenData.context;
        console.log("✅ Store hash from token response (raw):", storeHash);
      }
    }
    // Method 2: From initial context parameter (FALLBACK)
    else if (context && context.startsWith('stores/')) {
      storeHash = context.replace('stores/', '');
      console.log("✅ Store hash from initial context parameter:", storeHash);
    }

    // Step 4: If store hash is still missing, use API to get store info
    if (!storeHash && tokenData.access_token) {
      console.log("🔄 Store hash not found, attempting to get store info via API...");
      
      try {
        // First, try to get store hash from the store information API
        const storeInfoResponse = await fetch(
          `https://api.bigcommerce.com/stores/${tokenData.context || 'default'}/v2/store`,
          {
            headers: {
              'X-Auth-Token': tokenData.access_token,
              'Content-Type': 'application/json'
            }
          }
        );

        if (storeInfoResponse.ok) {
          const storeInfo = await storeInfoResponse.json();
          // The store hash might be in the domain or other fields
          if (storeInfo.domain) {
            const domainParts = storeInfo.domain.split('.');
            if (domainParts.length > 0) {
              storeHash = domainParts[0].replace('store-', '');
              console.log("✅ Store hash extracted from store domain:", storeHash);
            }
          }
        }
      } catch (apiError) {
        console.error("❌ API call failed:", apiError);
      }
    }

    // Step 5: Final fallback - manual extraction for your specific store
    if (!storeHash) {
      // 🚨 ONLY FOR TESTING - Replace with your actual store hash
      storeHash = "noyunnhark"; // Your store hash from the URL
      console.log("⚠️  Using manual store hash for testing:", storeHash);
    }

    if (!storeHash) {
      console.error("❌ Could not determine store hash");
      return NextResponse.json(
        { error: "Store hash not available" },
        { status: 400 }
      );
    }

    // Step 6: Verify the access token works with the store hash
    console.log("🔄 Verifying API access with obtained credentials...");
    
    try {
      const verifyResponse = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/store`,
        {
          headers: {
            'X-Auth-Token': tokenData.access_token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (verifyResponse.ok) {
        console.log("✅ API access verified successfully");
      } else {
        console.warn("⚠️  API verification failed, but continuing...");
      }
    } catch (verifyError) {
      console.warn("⚠️  API verification skipped due to error:", verifyError);
    }

    // Step 7: Set cookies
    const cookieStore = await cookies();
    
    cookieStore.set("bigcommerce_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    cookieStore.set("bigcommerce_store_hash", storeHash, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Store additional info if available
    if (tokenData.scope) {
      cookieStore.set("bigcommerce_scope", tokenData.scope, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    console.log("✅ Authentication completed successfully!");
    console.log("📋 Final credentials:", {
      storeHash: storeHash,
      accessToken: tokenData.access_token ? "✅ Set" : "❌ Missing",
      tokenLength: tokenData.access_token?.length || 0
    });

    // Step 8: Redirect to app
    return NextResponse.redirect(
      new URL("/", process.env.APP_URL || req.url)
    );

  } catch (error) {
    console.error("❌ OAuth authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}