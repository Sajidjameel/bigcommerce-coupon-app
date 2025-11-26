"use client"; // Required for Next.js client-side code

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter(); // ✅ Next.js router for navigation


    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1>Welcome to Your App Dashboard</h1>
            <p>Your BigCommerce Access Token: {token}</p>

            {/* ✅ Button to navigate to the coupon page */}
            <button
                onClick={() => router.push("/coupons")}
                style={{
                    padding: "10px 15px",
                    fontSize: "16px",
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "20px",
                }}
            >
                Go to Coupons
            </button>
        </div>
    );
}