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
        error: "No store connection found" 
      };
    }

    // Verify the store data exists and get access token info
    const baseUrl = process.env.APP_URL || 'https://bigcommerce-coupon-app-2pzc.vercel.app';
    const verifyResponse = await fetch(`${baseUrl}/api/auth/verify`, {
      cache: 'no-store'
    });

    if (verifyResponse.ok) {
      const storeData = await verifyResponse.json();
      console.log("✅ Store data verified:", storeData.storeHash);
      
      // Test if access token works with BigCommerce API
      const tokenTestResponse = await fetch(`${baseUrl}/api/test-token`, {
        cache: 'no-store'
      });
      
      let tokenWorks = false;
      let storeName = '';
      
      if (tokenTestResponse.ok) {
        const testData = await tokenTestResponse.json();
        tokenWorks = testData.tokenWorks;
        storeName = testData.storeInfo?.name;
      }
      
      return { 
        isConnected: true,
        storeHash: storeData.storeHash,
        userEmail: storeData.user?.email,
        hasAccessToken: storeData.hasAccessToken,
        tokenWorks: tokenWorks,
        storeName: storeName
      };
    } else {
      console.log("❌ Store verification failed");
      return { 
        isConnected: false,
        error: "Store verification failed" 
      };
    }

  } catch (error) {
    console.error("Auth check error:", error);
    return { 
      isConnected: false,
      error: "Authentication check failed" 
    };
  }
}

export default async function HomePage() {
  const authData = await checkAuthentication();
  const isConnected = authData.isConnected;

  console.log("🏠 Home Page Status:", authData);

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
          <div className="space-y-2 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-600" : "bg-red-600"
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {isConnected ? `Connected to ${authData.storeHash}` : "BigCommerce not connected"}
              </span>
            </div>
            
            {isConnected && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100">
                <div
                  className={`w-3 h-3 rounded-full ${
                    authData.tokenWorks ? "bg-green-600" : "bg-yellow-600"
                  }`}
                />
                <span className="text-sm font-bold text-gray-900">
                  {authData.tokenWorks 
                    ? `Access Token Active • ${authData.storeName || 'Store Connected'}`
                    : "Access Token Status: Checking..."
                  }
                </span>
              </div>
            )}
          </div>
          
          {isConnected && authData.userEmail && (
            <p className="text-sm text-gray-300">
              Logged in as: {authData.userEmail}
            </p>
          )}

          {isConnected && (
            <div className="mt-4 p-3 bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-100">
                <strong>Access Token Status:</strong> {authData.hasAccessToken ? '✅ Stored in Upstash' : '❌ Not found'}
                {authData.tokenWorks && ' • ✅ Working with BigCommerce API'}
              </p>
            </div>
          )}

          {!isConnected && authData.error && (
            <p className="text-sm text-red-300">
              Error: {authData.error}
            </p>
          )}
        </div>

        {/* Your existing benefits grid and CTA button */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* ... your existing benefits grid ... */}
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