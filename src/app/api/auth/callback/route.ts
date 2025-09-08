// // app/api/auth/callback/route.ts
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function GET(request: Request) {
//   console.log("🎯 CALLBACK ROUTE EXECUTING NOW!");


//   const url = new URL(request.url);

//   // Log ALL parameters for debugging
//   const allParams: Record<string, string> = {};
//   url.searchParams.forEach((value, key) => {
//     allParams[key] = value;
//   });


//   // BigCommerce sends 'code' and 'account_uuid' (not 'context')
//   const code = url.searchParams.get("code");
//   const account_uuid = url.searchParams.get("account_uuid"); // This is what BigCommerce sends
//   const scope = url.searchParams.get("scope");
//   const error = url.searchParams.get("error");

//   console.log("🔍 Extracted Parameters:", {
//     code: code ? "✅ Present" : "❌ Missing",
//     account_uuid: account_uuid ? account_uuid : "❌ Missing",
//     scope: scope || "No scope",
//     error: error || "No error"
//   });

//   const dashboard_url = process.env.APP_URL!;

//   // 🔹 Check existing token
//   const cookieStore = await cookies();
//   const existingToken = cookieStore.get("bigcommerce_access_token")?.value;

//   // ✅ If no code but token exists, redirect to dashboard
//   if (!code || !account_uuid) {
//     if (existingToken) {
//       return NextResponse.redirect(dashboard_url);
//     }

//     return NextResponse.json(
//       {
//         error: "Missing auth code or account_uuid",
//         receivedParams: allParams,
//         expected: ["code", "account_uuid"]
//       },
//       { status: 400 }
//     );
//   }

//   // 🔹 If there's an error from BigCommerce
//   if (error) {
//     console.log("❌ BigCommerce error:", error);
//     return NextResponse.json(
//       { error: "BigCommerce authorization failed", details: error },
//       { status: 400 }
//     );
//   }

//   const client_id = process.env.BIGCOMMERCE_CLIENT_ID;
//   const client_secret = process.env.BIGCOMMERCE_CLIENT_SECRET;
//   const redirect_uri = process.env.BIGCOMMERCE_REDIRECT_URI;

//   // ✅ Use account_uuid instead of context
//   // For BigCommerce API, we need to convert account_uuid to store hash context
//   // Format: stores/{store_hash}
//   const store_hash = account_uuid; // Or extract from account_uuid if needed
//   const context = `stores/${store_hash}`; // BigCommerce expects context in this format

//   const payload = {
//     client_id,
//     client_secret,
//     code,
//     context, // Use the formatted context
//     grant_type: "authorization_code",
//     redirect_uri,
//   };

//   console.log("📦 Token exchange payload:", {
//     ...payload,
//     client_secret: client_secret ? "✅ Present" : "❌ Missing" // Don't log actual secret
//   });

//   try {

//     const response = await fetch("https://login.bigcommerce.com/oauth2/token", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "User-Agent": "BigCommerce OAuth Client"
//       },
//       body: JSON.stringify(payload),
//     });

//     const responseText = await response.text();
//     let data;
//     try {
//       data = JSON.parse(responseText);
//     } catch (e) {
//       return NextResponse.json(
//         { error: "Invalid JSON response from BigCommerce", response: responseText },
//         { status: 500 }
//       );
//     }


//     if (response.ok && data.access_token) {

//       // ✅ Store the token in cookies
//       (await cookies()).set("bigcommerce_access_token", data.access_token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         path: "/",
//         maxAge: 60 * 60 * 24 * 30, // 30 days
//       });
//       (await cookies()).set("bigcommerce_store_hash", store_hash, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         path: "/",
//         maxAge: 60 * 60 * 24 * 30, // 30 days
//       });
//       console.log("🍪 Store hash saved in cookie:", store_hash);



//       // ✅ Redirect to dashboard on success
//       return NextResponse.redirect(dashboard_url);

//     } else {
//       console.log("❌ Token exchange failed:", data);

//       // ✅ If OAuth fails but token exists, redirect to dashboard
//       if (existingToken) {
//         console.log("🔁 Redirecting to dashboard (existing token despite failure)");
//         return NextResponse.redirect(dashboard_url);
//       }

//       return NextResponse.json(
//         {
//           error: "Token exchange failed",
//           details: data,
//           status: response.status
//         },
//         { status: 400 }
//       );
//     }

//   } catch (error) {
//     console.log("❌ Step 3 Failed: OAuth request failed");
//     console.error("Error details:", error);

//     return NextResponse.json(
//       {
//         error: "OAuth request failed",
//         details: (error as Error).message
//       },
//       { status: 500 }
//     );
//   }
// }