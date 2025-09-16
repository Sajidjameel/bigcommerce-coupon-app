// app/auth/page.tsx
"use client";

import Image from "next/image";
import React from "react";

export default function AuthPage() {

   const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/start");
      console.log(res, 'response');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const { url } = await res.json();
      console.log(url, 'url');
      
      window.open(url, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again or contact support.');
    }
  };


  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <Image
          src="https://cdn11.bigcommerce.com/s-123456/images/stencil/original/logo.svg"
          alt="BigCommerce App"
          width={4}
          height={4}
          className="mx-auto h-12 mb-6"
        />

        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Sign in with BigCommerce
        </h1>
        <p className="text-gray-500 mb-6">
          Connect your BigCommerce store to continue.
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-[#203239] hover:bg-[#1a262c] text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
        >
          Login with BigCommerce
        </button>

        <p className="text-xs text-gray-400 mt-6">
          By logging in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-gray-500">
            Terms of Service
          </a>
          .
        </p>
      </div>
    </main>
  );
}
