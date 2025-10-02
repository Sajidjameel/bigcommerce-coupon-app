"use client";

import React, { useState } from "react";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The BigCommerce App Store install redirects DIRECTLY to /api/auth/callback.
  // This page is for users who come from a manual external link and need to start the OAuth flow.
  
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the server route to generate the full BigCommerce OAuth URL
      const res = await fetch('/api/auth/install'); 
      
      if (!res.ok) {
        // Attempt to parse JSON error message from the server
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to start installation on server.');
      }
      
      const data = await res.json();
      
      if (data.url) {
        // Redirect the user to the BigCommerce authorization page
        window.location.href = data.url;
      } else {
        throw new Error('Server did not return a valid redirect URL.');
      }
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Check server logs.';
      console.error('❌ Manual Authentication error:', e);
      setError(errorMessage);
    } finally {
      // Note: In case of successful redirect, this 'finally' block is often skipped, 
      // but it handles cases where the fetch fails immediately.
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center border border-gray-200">
        {/* Replaced Next.js Image component with standard HTML img tag */}
        <img
          src="https://placehold.co/200x50/1a262c/ffffff?text=BC+App+Logo"
          alt="BigCommerce App"
          width={200}
          height={50}
          className="mx-auto h-12 w-auto mb-6 rounded-lg"
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Install BigCommerce App
        </h1>
        
        <p className="text-gray-500 mb-6">
          Ready to supercharge your store? Click below to install and authorize this application.
        </p>
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <p className="font-bold">Installation Error</p>
                <p className="text-sm">{error}</p>
            </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#203239] hover:bg-[#1a262c] active:scale-[.99] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg"
        >
          {loading ? "Redirecting to BigCommerce..." : "Install App"}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          By installing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-gray-600 font-medium">
            Terms of Service
          </a>
          .
        </p>
      </div>
    </main>
  );
}
