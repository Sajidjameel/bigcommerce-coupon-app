"use client"; // Must be client component to use useState/useEffect/local fetch

import React, { useState } from 'react';

// Interface definitions (kept local for this single file)
interface AuthStatus {
  isConnected: boolean;
  error?: string;
  storeHash?: string;
  userEmail?: string;
  tokenWorks?: boolean;
  storeName?: string;
}

const initialAuthStatus: AuthStatus = {
  isConnected: false,
  error: "Loading authentication status...",
  tokenWorks: false,
};


export default function HomePage() {
  const [authData, setAuthData] = useState<AuthStatus>(initialAuthStatus);
  const [loading, setLoading] = useState(true);

  // Determine the base URL dynamically on the client

  const isTokenActive = authData.tokenWorks === true;
  const ctaHref = isTokenActive ? "/coupons" : "/auth";

  // Use the loading state to show a simple loader
  if (loading) {
    return (
        <div className="h-screen bg-gray-900 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }

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
                authData.isConnected ? "bg-green-600" : "bg-red-600"
              }`}
            />
            <span className="text-sm font-bold text-gray-900">
              {authData.isConnected ? `Session Active` : "BigCommerce Not Connected"}
            </span>
          </div>
          
          {/* Access Token Status */}
          {authData.isConnected && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isTokenActive ? "bg-green-600" : "bg-yellow-600"
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {isTokenActive 
                  ? `Access Token Active • ${authData.storeName || 'Store Connected'}`
                  : "Access Token Invalid/Expired"
                }
              </span>
            </div>
          )}
          
          {authData.isConnected && authData.userEmail && (
            <p className="text-sm text-gray-300 mt-2">
              Logged in as: {authData.userEmail}
            </p>
          )}

          {/* Show Errors */}
          {!isTokenActive && authData.error && (
             <div className="text-sm text-red-300 mt-2 p-2 bg-red-900/50 rounded">
                Error: {authData.error}
                <button 
                    className="ml-3 text-xs text-yellow-300 underline hover:text-yellow-400"
                >
                    (Refresh Status)
                </button>
              </div>
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
          {/* Replaced Next.js Link with standard HTML anchor tag */}
          <a href={ctaHref}> 
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors cursor-pointer">
              {isTokenActive ? "Start Creating Coupons" : "Connect BigCommerce Store"}
            </button>
          </a>
          <p className="text-sm text-gray-100 mt-3">
            Trusted by 1,000+ BigCommerce stores worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
