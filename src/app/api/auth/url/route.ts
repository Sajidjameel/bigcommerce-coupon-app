// import { NextResponse } from "next/server";

// export async function GET() {
//   console.log("🔹 Generating BigCommerce auth URL");
  
//   // Get environment variables
//   const CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID;
//   const REDIRECT_URI = process.env.BIGCOMMERCE_REDIRECT_URI;

//   console.log("🔐 Environment variables check:", {
//     CLIENT_ID: CLIENT_ID || " MISSING",
//     REDIRECT_URI: REDIRECT_URI || "❌ MISSING"
//   });

//   // Validate environment variables
//   if (!CLIENT_ID || !REDIRECT_URI) {
//     console.error("❌ Missing required environment variables");
//     return NextResponse.json(
//       { 
//         error: "Server configuration error",
//         missing: {
//           clientId: !CLIENT_ID,
//           redirectUri: !REDIRECT_URI
//         },
//         availableEnvVars: Object.keys(process.env).filter(key => key.includes('BIGCOMMERCE'))
//       },
//       { status: 500 }
//     );
//   }

//   const SCOPES = [
//     "store_v2_information_read_only",
//     "store_v2_orders"
//   ].join(" ");

//   // Encode parameters
//   const encodedRedirectUri = encodeURIComponent(REDIRECT_URI);
//   const encodedScopes = encodeURIComponent(SCOPES);

//   const authUrl = `https://login.bigcommerce.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodedRedirectUri}&scope=${encodedScopes}&response_type=code`;

//   console.log("🌐 Generated Auth URL:", authUrl);
//   console.log("✅ Auth URL ready");

//   return NextResponse.json({ url: authUrl });
// }