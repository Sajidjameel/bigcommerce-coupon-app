"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [storeHash, setStoreHash] = useState<string | null>(null);

  // Auto-detect store hash from BigCommerce installation context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeHashFromUrl = urlParams.get('store_hash');
    const contextFromUrl = urlParams.get('context');
    
    console.log('🔍 Auto-detecting store hash from URL parameters:');
    console.log('   - store_hash:', storeHashFromUrl);
    console.log('   - context:', contextFromUrl);

    // Extract store hash from context (format: stores/{store_hash})
    let extractedStoreHash = storeHashFromUrl;
    if (contextFromUrl && contextFromUrl.startsWith('stores/')) {
      extractedStoreHash = contextFromUrl.replace('stores/', '');
      console.log('   - Extracted from context:', extractedStoreHash);
    }

    if (extractedStoreHash) {
      console.log('✅ Store hash detected:', extractedStoreHash);
      setStoreHash(extractedStoreHash);
      // Auto-start OAuth if store hash is provided by BigCommerce
      handleLogin(extractedStoreHash);
    } else {
      console.log('❌ No store hash detected in URL parameters');
    }
  }, []);

  const handleLogin = async (detectedStoreHash?: string) => {
    setLoading(true);
    
    try {
      let apiUrl = '/api/auth/install';
      
      if (detectedStoreHash) {
        apiUrl += `?store_hash=${encodeURIComponent(detectedStoreHash)}`;
        console.log('🚀 Starting OAuth with store hash:', detectedStoreHash);
      } else {
        console.log('🚀 Starting OAuth without store hash');
      }
      
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to start installation');
      }
      
      const data = await res.json();
      console.log('✅ Redirect URL received:', data.url);
      
      if (data.url) {
        // Redirect to BigCommerce OAuth
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received from server');
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      alert(error instanceof Error ? error.message : 'Authentication failed. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInstall = () => {
    console.log('👤 User manually clicked Install button');
    handleLogin(); // Call without store hash
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <Image
          src="https://cdn11.bigcommerce.com/s-123456/images/stencil/original/logo.svg"
          alt="BigCommerce App"
          width={200}
          height={50}
          className="mx-auto h-12 w-auto mb-6"
        />

        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          {storeHash ? 'Installing App...' : 'Install BigCommerce App'}
        </h1>
        
        <p className="text-gray-500 mb-6">
          {storeHash 
            ? `Installing on store: ${storeHash}`
            : 'Click below to install this app on your BigCommerce store.'
          }
        </p>

        {!storeHash && (
          <button
            onClick={handleManualInstall}
            disabled={loading}
            className="w-full bg-[#203239] hover:bg-[#1a262c] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
          >
            {loading ? "Installing..." : "Install App"}
          </button>
        )}

        {storeHash && loading && (
          <div className="w-full bg-[#203239] text-white py-3 px-6 rounded-lg font-medium">
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Auto-installing...
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">
          By installing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-gray-500">
            Terms of Service
          </a>
          .
        </p>
      </div>
    </main>
  );
}