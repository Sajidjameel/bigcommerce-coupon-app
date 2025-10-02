// app/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";

async function checkAuthentication() {
  try {
    const cookieStore = await cookies();
    const storeHash = cookieStore.get("store_hash")?.value;
    
    console.log("🔍 Home Page - Store hash from cookies:", storeHash);

    if (!storeHash) {
      return { 
        isConnected: false,
        error: "No store hash found" 
      };
    }

    // Verify the access token is valid by making an API call
    const verifyResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/auth/verify`, {
      cache: 'no-store',
      headers: {
        'Cookie': `store_hash=${storeHash}`
      }
    });

    if (verifyResponse.ok) {
      const storeData = await verifyResponse.json();
      console.log("✅ Access token is valid:", { 
        storeHash: storeData.storeHash,
        userEmail: storeData.user?.email 
      });
      
      return { 
        isConnected: true,
        storeHash: storeData.storeHash,
        userEmail: storeData.user?.email,
        accessTokenValid: true
      };
    } else {
      const errorData = await verifyResponse.json();
      console.log("❌ Access token invalid:", errorData);
      return { 
        isConnected: false,
        error: errorData.error || "Token verification failed" 
      };
    }

  } catch (error) {
    console.error("Auth check error:", error);
    return { 
      isConnected: false,
      error: "Authentication service unavailable" 
    };
  }
}

// Function to test the access token with BigCommerce API
async function testAccessToken(storeHash: string) {
  try {
    const testResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/test-token`, {
      cache: 'no-store',
      headers: {
        'Cookie': `store_hash=${storeHash}`
      }
    });

    if (testResponse.ok) {
      const testData = await testResponse.json();
      return {
        tokenWorks: true,
        storeName: testData.storeInfo?.name,
        apiTest: true
      };
    } else {
      return {
        tokenWorks: false,
        apiTest: false
      };
    }
  } catch (error) {
    console.error("Token test error:", error);
    return {
      tokenWorks: false,
      apiTest: false,
      error: "API test failed"
    };
  }
}

export default async function HomePage() {
  const authData = await checkAuthentication();
  const isConnected = authData.isConnected;
  
  let tokenTestResult = null;
  if (isConnected && authData.storeHash) {
    tokenTestResult = await testAccessToken(authData.storeHash);
  }

  console.log("🏠 Home Page Status:", { 
    isConnected, 
    storeHash: authData.storeHash,
    userEmail: authData.userEmail,
    accessTokenValid: authData.accessTokenValid,
    tokenWorks: tokenTestResult?.tokenWorks,
    storeName: tokenTestResult?.storeName
  });

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">BigCommerce Coupon Generator</h1>
          <p className="text-xl text-gray-100 mb-6">
            Create powerful discount campaigns that drive sales and boost customer loyalty
          </p>

          {/* Connection Status */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-600" : "bg-red-600"
              }`}
            />
            <span className="text-sm font-bold text-gray-900">
              {isConnected ? `Connected to ${authData.storeHash}` : "BigCommerce not connected"}
            </span>
          </div>
          
          {/* Access Token Status */}
          {isConnected && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  tokenTestResult?.tokenWorks ? "bg-green-600" : "bg-yellow-600"
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {tokenTestResult?.tokenWorks 
                  ? `Access Token Active • ${tokenTestResult.storeName || 'Store Connected'}`
                  : "Access Token Needs Refresh"
                }
              </span>
            </div>
          )}
          
          {isConnected && authData.userEmail && (
            <p className="text-sm text-gray-300 mt-2">
              Logged in as: {authData.userEmail}
            </p>
          )}

          {!isConnected && authData.error && (
            <p className="text-sm text-red-300 mt-2">
              Error: {authData.error}
            </p>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Instant Coupons</h3>
            <p className="text-gray-100 text-sm">
              Generate discount codes in seconds with customizable rules and expiration dates
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Sales Analytics</h3>
            <p className="text-gray-100 text-sm">
              Track coupon performance and measure ROI with detailed usage statistics
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Bulk Generation</h3>
            <p className="text-gray-100 text-sm">
              Create hundreds of unique coupon codes for large campaigns and promotions
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <Link href={isConnected ? "/coupons" : "/auth"}>
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors cursor-pointer">
              {isConnected ? "Start Creating Coupons" : "Connect BigCommerce Store"}
            </button>
          </Link>
          <p className="text-sm text-gray-100 mt-3">
            Trusted by 1,000+ BigCommerce stores worldwide
          </p>
        </div>
      </div>
    </div>
  );
}