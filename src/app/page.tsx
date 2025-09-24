import Link from "next/link";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("bigcommerce_access_token");
  const storeHash = cookieStore.get("bigcommerce_store_hash");

  const isConnected = !!token?.value;

  console.log("🔑 Access Token:", token?.value);
  console.log("🏬 Store Hash:", storeHash?.value);
   


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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-blue-600" : "bg-green-600"
              }`}
            />
            <span className="text-sm font-bold text-gray-900">
              {isConnected ? "BigCommerce Connected" : "BigCommerce not connected"}
            </span>
          </div>
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
              {isConnected ? "Start Creating Coupons" : "Login"}
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
